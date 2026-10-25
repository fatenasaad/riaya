/**
 * Meterless Nightshift provider — v9 sponsor layer (Power).
 * Run: npx tsx tests/meterless-provider.test.ts
 *
 * Integration suite: boots the REAL server with LLM_PROVIDER=meterless and
 * NO Gemini key, pointed at a local MOCK Meterless Runtime (an in-process
 * HTTP server implementing the official contract: GET /v1/models,
 * POST /v1/chat/completions, OpenAI-compatible SSE streaming). Proves:
 *  - request contract: path, Authorization: Bearer, meterless-app,
 *    meterless-scope headers; model/temperature/max_tokens from env/config;
 *  - message mapping: system instruction leads, history turns map
 *    user/model -> user/assistant byte-for-byte, 12-turn-capped final user
 *    turn carries stage context exactly as the Gemini path builds it;
 *  - a streamed response is assembled from OpenAI SSE deltas and relayed in
 *    this endpoint's own event format, with model discovery (GET /models)
 *    used as the pre-flight before the streamed request;
 *  - H-MEM works identically on the Meterless provider: a fact mined on one
 *    turn is retrieved and reinjected into the Meterless request on the
 *    next, and the response reports memory.injected=true;
 *  - deterministic routes never touch the provider (guide answers with
 *    zero Runtime calls);
 *  - error honesty: a failing or unreachable Runtime yields the app's
 *    standard AI_SERVICE_UNAVAILABLE failure — never a fabricated answer
 *    and never a silent Gemini substitution (there is no Gemini key here;
 *    every successful reply below is byte-identical to the mock's).
 */
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'http://127.0.0.1:3000';
const TOKEN = 'test-runtime-token';
const MOCK_REPLY = 'MOCK-METERLESS-REPLY: rest, fluids and gentle walks.';
const STREAM_TEXT = 'Recovery takes time.';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`PASS  ${name}`); }
  else { failed++; console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}

// ---------------------------------------------------------------- mock ----
interface RecordedRequest {
  method: string;
  url: string;
  headers: http.IncomingHttpHeaders;
  body: any;
}
const recorded: RecordedRequest[] = [];
let mockMode: 'ok' | 'fail-chat' = 'ok';

const mock = http.createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    let body: any = null;
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || 'null'); } catch { /* no body */ }
    recorded.push({ method: req.method || '', url: req.url || '', headers: req.headers, body });

    if (req.method === 'GET' && req.url === '/v1/models') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        object: 'list',
        data: [{ id: 'meterless/auto' }, { id: 'nvidia/nemotron-3-super' }],
      }));
      return;
    }
    if (req.method === 'POST' && req.url === '/v1/chat/completions') {
      if (mockMode === 'fail-chat') {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: 'mock runtime exploded' } }));
        return;
      }
      if (body?.stream) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        const chunk = (content: string) => `data: ${JSON.stringify({
          id: 'chatcmpl-mock', object: 'chat.completion.chunk',
          choices: [{ index: 0, delta: { content }, finish_reason: null }],
        })}\n\n`;
        res.write(chunk('Recovery '));
        setTimeout(() => {
          res.write(chunk('takes '));
          res.write(chunk('time.'));
          res.write('data: [DONE]\n\n');
          res.end();
        }, 10);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        id: 'chatcmpl-mock',
        choices: [{ index: 0, message: { role: 'assistant', content: MOCK_REPLY }, finish_reason: 'stop' }],
      }));
      return;
    }
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'not found' }));
  });
});

// ------------------------------------------------------------- helpers ----
async function waitForHealth(timeoutMs: number): Promise<boolean> {
  const t0 = Date.now();
  while (Date.now() - t0 < timeoutMs) {
    try {
      const r = await fetch(`${BASE}/api/health`);
      if (r.ok) return true;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function postChat(body: Record<string, unknown>) {
  const r = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const json = await r.json().catch(() => ({}));
  return { status: r.status, body: json as any };
}

async function postStream(body: Record<string, unknown>) {
  const r = await fetch(`${BASE}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  });
  const raw = await r.text();
  const events: any[] = [];
  for (const line of raw.split('\n')) {
    if (line.startsWith('data: ')) {
      try { events.push(JSON.parse(line.slice(6))); } catch { /* keep raw */ }
    }
  }
  let jsonBody: any = null;
  if (!events.length) { try { jsonBody = JSON.parse(raw); } catch { /* not json */ } }
  return { status: r.status, contentType: r.headers.get('content-type') || '', events, jsonBody, raw };
}

const chatCalls = () => recorded.filter((r) => r.method === 'POST' && r.url === '/v1/chat/completions');
const modelCalls = () => recorded.filter((r) => r.method === 'GET' && r.url === '/v1/models');
const lastChatCall = () => chatCalls()[chatCalls().length - 1];

// ---------------------------------------------------------------- run -----
const memDir = fs.mkdtempSync(path.join(os.tmpdir(), 'riaya-meterless-hmem-'));
let server: ChildProcess | undefined;
try {
  await new Promise<void>((resolve) => mock.listen(0, '127.0.0.1', resolve));
  const mockPort = (mock.address() as any).port as number;

  server = spawn('npx', ['tsx', 'server.ts'], {
    cwd: root,
    env: {
      ...process.env,
      GEMINI_API_KEY: '',
      LLM_PROVIDER: 'meterless',
      METERLESS_BASE_URL: `http://127.0.0.1:${mockPort}/v1`,
      METERLESS_RUNTIME_TOKEN: TOKEN,
      METERLESS_MODEL: 'meterless/auto',
      RIAYA_HMEM_DIR: memDir,
    },
    stdio: 'ignore',
    detached: true,
  });

  const up = await waitForHealth(90000);
  check('server boots with LLM_PROVIDER=meterless and no Gemini key', up);
  if (!up) throw new Error('server did not come up');

  const health = await (await fetch(`${BASE}/api/health`)).json();
  check('health reports llmProvider=meterless', health.llmProvider === 'meterless', `llmProvider=${health.llmProvider}`);
  check('health reports meterlessConfigured=true', health.meterlessConfigured === true);

  // ------------------------------------------- S1: non-stream contract
  const s1 = await postChat({
    message: 'What is recovery like after a caesarean section?',
    history: [], language: 'en', chatId: 'ml-s1',
  });
  check('S1 /api/chat answers 200 via Meterless', s1.status === 200, `status=${s1.status} body=${JSON.stringify(s1.body).slice(0, 160)}`);
  check('S1 reply is byte-identical to the mock Runtime reply', s1.body.reply === MOCK_REPLY, `reply=${String(s1.body.reply).slice(0, 80)}`);
  check('S1 response carries the H-MEM memory field', !!s1.body.memory && typeof s1.body.memory.retrieved === 'number');
  check('S1 exactly one Runtime chat call so far', chatCalls().length === 1, `calls=${chatCalls().length}`);
  const c1 = lastChatCall();
  check('S1 request path is {base}/chat/completions', !!c1 && c1.url === '/v1/chat/completions', `url=${c1?.url}`);
  check('S1 Authorization: Bearer <Runtime token>', c1?.headers.authorization === `Bearer ${TOKEN}`, `auth=${c1?.headers.authorization}`);
  check('S1 meterless-app header identifies the app', c1?.headers['meterless-app'] === 'riaya', `app=${c1?.headers['meterless-app']}`);
  check('S1 meterless-scope: user header present', c1?.headers['meterless-scope'] === 'user', `scope=${c1?.headers['meterless-scope']}`);
  check('S1 model field is the configured routing mode', c1?.body?.model === 'meterless/auto', `model=${c1?.body?.model}`);
  check('S1 stream=false, temperature 0.2, max_tokens 900 (Gemini-path discipline)',
    c1?.body?.stream === false && c1?.body?.temperature === 0.2 && c1?.body?.max_tokens === 900,
    `body=${JSON.stringify({ s: c1?.body?.stream, t: c1?.body?.temperature, m: c1?.body?.max_tokens })}`);
  const m1 = c1?.body?.messages || [];
  check('S1 messages = [system, user]', m1.length === 2 && m1[0].role === 'system' && m1[1].role === 'user',
    `roles=${JSON.stringify(m1.map((m: any) => m.role))}`);
  check('S1 system message is the app system instruction', typeof m1[0]?.content === 'string' && m1[0].content.startsWith('You are Riaya'),
    `system=${String(m1[0]?.content).slice(0, 40)}`);
  check('S1 final user turn carries stage context + the question',
    typeof m1[1]?.content === 'string' && m1[1].content.includes('[Current patient journey stage:') && m1[1].content.includes('What is recovery like after a caesarean section?'),
    `user=${String(m1[1]?.content).slice(0, 80)}`);

  // ------------------------------------------- S2: history mapping
  const s2 = await postChat({
    message: 'And when can I shower after the caesarean?',
    history: [
      { role: 'user', text: 'I had a caesarean section last week.' },
      { role: 'model', text: 'Congratulations! Rest is important in the first days.' },
    ],
    language: 'en', chatId: 'ml-s2',
  });
  check('S2 /api/chat answers 200 via Meterless', s2.status === 200, `status=${s2.status}`);
  const m2 = lastChatCall()?.body?.messages || [];
  check('S2 messages = [system, user, assistant, user]',
    m2.length === 4 && m2.map((m: any) => m.role).join(',') === 'system,user,assistant,user',
    `roles=${JSON.stringify(m2.map((m: any) => m.role))}`);
  check('S2 history user turn preserved byte-for-byte', m2[1]?.content === 'I had a caesarean section last week.',
    `content=${String(m2[1]?.content).slice(0, 60)}`);
  check('S2 history model turn maps to assistant byte-for-byte',
    m2[2]?.role === 'assistant' && m2[2]?.content === 'Congratulations! Rest is important in the first days.',
    `content=${String(m2[2]?.content).slice(0, 60)}`);
  check('S2 final user turn = stage context + message exactly',
    m2[3]?.content === '[Current patient journey stage: Before hospital admission or planned procedure / قبل دخول المستشفى]\nAnd when can I shower after the caesarean?',
    `content=${String(m2[3]?.content).slice(0, 100)}`);

  // ------------------------------------------- S3: H-MEM on Meterless
  const FACT = 'Please remember that my physiotherapist is called Sara Nasser and I must take my evening walk after dinner.';
  const s3a = await postChat({ message: FACT, history: [], language: 'en', chatId: 'ml-memory' });
  check('S3 fact turn answers 200 via Meterless', s3a.status === 200, `status=${s3a.status}`);
  const s3b = await postChat({
    message: 'What is the name of my physiotherapist?',
    history: [], language: 'en', chatId: 'ml-memory',
  });
  check('S3 follow-up answers 200 via Meterless', s3b.status === 200, `status=${s3b.status}`);
  check('S3 H-MEM retrieved + injected on the Meterless path',
    s3b.body.memory?.injected === true && (s3b.body.memory?.retrieved ?? 0) >= 1,
    `memory=${JSON.stringify(s3b.body.memory).slice(0, 160)}`);
  const m3 = lastChatCall()?.body?.messages || [];
  const finalTurn3 = m3[m3.length - 1]?.content || '';
  check('S3 reinjected memory (Sara Nasser) is inside the Meterless request',
    finalTurn3.includes('Sara Nasser') && finalTurn3.includes('What is the name of my physiotherapist?'),
    `final=${finalTurn3.slice(0, 120)}`);

  // ------------------------------------------- S4: deterministic route
  const callsBefore = recorded.length;
  const s4 = await postChat({ message: 'عندي ألم في الأسنان', history: [], language: 'ar', chatId: 'ml-det' });
  check('S4 toothache guide answers 200 without the model', s4.status === 200 && s4.body.isUrgent === false,
    `status=${s4.status} isUrgent=${s4.body.isUrgent}`);
  check('S4 deterministic route made ZERO Runtime calls', recorded.length === callsBefore,
    `before=${callsBefore} after=${recorded.length}`);
  check('S4 no /v1/models discovery happened before the streaming scenario', modelCalls().length === 0,
    `models=${modelCalls().length}`);

  // ------------------------------------------- S5: streaming + discovery
  const s5 = await postStream({
    message: 'How does recovery after a caesarean usually progress?',
    history: [], language: 'en', chatId: 'ml-stream',
  });
  const s5Text = s5.events.map((e) => e.text || '').join('');
  const s5Done = s5.events.find((e) => e.done);
  check('S5 stream answers 200 as SSE', s5.status === 200 && s5.contentType.includes('text/event-stream'),
    `status=${s5.status} ct=${s5.contentType}`);
  check('S5 streamed deltas assemble into the mock stream text', s5Text === STREAM_TEXT, `text=${s5Text}`);
  check('S5 done event carries urgency + memory metadata', !!s5Done && s5Done.isUrgent === false && !!s5Done.memory,
    `done=${JSON.stringify(s5Done).slice(0, 120)}`);
  check('S5 discovery (GET /v1/models) was used', modelCalls().length >= 1, `models=${modelCalls().length}`);
  const firstModelsIdx = recorded.findIndex((r) => r.method === 'GET' && r.url === '/v1/models');
  const streamCallIdx = recorded.length - 1;
  check('S5 discovery ran before the streamed chat call',
    firstModelsIdx >= 0 && firstModelsIdx < streamCallIdx && recorded[streamCallIdx].url === '/v1/chat/completions',
    `modelsIdx=${firstModelsIdx} lastIdx=${streamCallIdx}`);
  check('S5 streamed request body has stream=true', lastChatCall()?.body?.stream === true,
    `stream=${lastChatCall()?.body?.stream}`);

  // ------------------------------------------- S6: failing Runtime
  mockMode = 'fail-chat';
  const s6 = await postChat({
    message: 'How long does recovery take after a caesarean birth?',
    history: [], language: 'en', chatId: 'ml-fail',
  });
  check('S6 failing Runtime: /api/chat → 503 AI_SERVICE_UNAVAILABLE',
    s6.status === 503 && s6.body.error === 'AI_SERVICE_UNAVAILABLE',
    `status=${s6.status} body=${JSON.stringify(s6.body).slice(0, 160)}`);
  check('S6 failing Runtime: no fabricated reply in the 503 body',
    s6.body.reply === undefined && typeof s6.body.message === 'string' && s6.body.message.length > 0,
    `body=${JSON.stringify(s6.body).slice(0, 160)}`);
  const s6s = await postStream({
    message: 'When can I drive again after a caesarean?',
    history: [], language: 'en', chatId: 'ml-fail-stream',
  });
  const s6Text = s6s.events.map((e) => e.text || '').join('');
  check('S6 failing Runtime: stream closes with an in-band error event, no done event',
    s6s.events.some((e) => e.error === true) && !s6s.events.some((e) => e.done),
    `events=${JSON.stringify(s6s.events).slice(0, 160)}`);
  check('S6 failing Runtime: stream carried no fabricated text', s6Text === '', `text=${s6Text.slice(0, 60)}`);

  // ------------------------------------------- S7: unreachable Runtime
  mock.close();
  (mock as any).closeAllConnections?.();
  const s7 = await postChat({
    message: 'What follow-up care is typical after a caesarean?',
    history: [], language: 'en', chatId: 'ml-down',
  });
  check('S7 unreachable Runtime: /api/chat → 503 AI_SERVICE_UNAVAILABLE',
    s7.status === 503 && s7.body.error === 'AI_SERVICE_UNAVAILABLE',
    `status=${s7.status} body=${JSON.stringify(s7.body).slice(0, 160)}`);
  const s7s = await postStream({
    message: 'What exercises are safe after a caesarean?',
    history: [], language: 'en', chatId: 'ml-down-stream',
  });
  check('S7 unreachable Runtime: /api/chat/stream → 503 plain-JSON AI_SERVICE_UNAVAILABLE (preflight)',
    s7s.status === 503 && s7s.jsonBody?.error === 'AI_SERVICE_UNAVAILABLE' && s7s.events.length === 0,
    `status=${s7s.status} raw=${s7s.raw.slice(0, 120)}`);
} finally {
  if (server?.pid) {
    try { process.kill(-server.pid, 'SIGKILL'); } catch { server.kill('SIGKILL'); }
  }
  try { mock.close(); } catch { /* already closed */ }
  fs.rmSync(memDir, { recursive: true, force: true });
}

console.log(`\nTOTAL: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
