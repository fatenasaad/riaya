/**
 * Server urgency separation + no-model resilience — v8 fix release.
 * Run: npx tsx tests/server-urgency.test.ts
 *
 * Integration suite: boots the REAL server with NO Gemini key configured
 * (GEMINI_API_KEY='') and asserts over HTTP:
 *
 * Fix 1 — urgency separation. A matched symptom guide is not urgent by
 * itself: toothache and fatigue guide replies must carry isUrgent=false.
 * A message the red-flag check fires on keeps isUrgent=true with the
 * red-flag reason (never the old blanket 'symptom-guide' claim).
 *
 * Fix 5 — deterministic routes before the model check. With no AI service,
 * guide/lab questions must still be answered on BOTH /api/chat and
 * /api/chat/stream, while a question that genuinely needs the model gets
 * the clear 503 AI_SERVICE_UNAVAILABLE on both.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'http://127.0.0.1:3000';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`PASS  ${name}`); }
  else { failed++; console.log(`FAIL  ${name}${detail ? ' — ' + detail : ''}`); }
}

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

async function postChat(message: string) {
  const r = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: [], language: 'ar' }),
    signal: AbortSignal.timeout(30000),
  });
  const body = await r.json().catch(() => ({}));
  return { status: r.status, body };
}

async function postStream(message: string) {
  const r = await fetch(`${BASE}/api/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history: [], language: 'ar' }),
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
  return { status: r.status, events, jsonBody, raw };
}

let server: ChildProcess | undefined;
try {
  server = spawn('npx', ['tsx', 'server.ts'], {
    cwd: root,
    env: { ...process.env, GEMINI_API_KEY: '' },
    stdio: 'ignore',
    detached: true, // own process group, so the finally-block kills the whole tree
  });

  const up = await waitForHealth(90000);
  check('server boots with no Gemini key', up);
  if (!up) throw new Error('server did not come up');

  const health = await (await fetch(`${BASE}/api/health`)).json();
  check('health reports hasApiKey=false', health.hasApiKey === false);

  // ------------------------------------------------------------ Fix 1
  const tooth = await postChat('عندي ألم في الأسنان');
  check('/api/chat toothache guide answers (200)', tooth.status === 200, `status=${tooth.status}`);
  check('/api/chat toothache guide isUrgent=false', tooth.body.isUrgent === false, `isUrgent=${tooth.body.isUrgent}`);
  check('/api/chat toothache urgentReason empty', !tooth.body.urgentReason, `urgentReason=${tooth.body.urgentReason}`);

  const fatigue = await postChat('أشعر بتعب دائم');
  check('/api/chat fatigue guide answers (200)', fatigue.status === 200, `status=${fatigue.status}`);
  check('/api/chat fatigue guide isUrgent=false', fatigue.body.isUrgent === false, `isUrgent=${fatigue.body.isUrgent}`);

  const chest = await postChat('عندي ألم في الصدر');
  check('/api/chat chest-pain guide answers (200)', chest.status === 200, `status=${chest.status}`);
  check('/api/chat chest pain (guide + red flag) isUrgent=true', chest.body.isUrgent === true, `isUrgent=${chest.body.isUrgent}`);
  check('/api/chat chest pain urgentReason is the red-flag reason',
    chest.body.urgentReason === 'ألم في الصدر', `urgentReason=${chest.body.urgentReason}`);

  const toothS = await postStream('عندي ألم في الأسنان');
  const toothDone = toothS.events.find((e) => e.done);
  check('/api/chat/stream toothache guide streams (200)', toothS.status === 200 && !!toothDone, `status=${toothS.status}`);
  check('/api/chat/stream toothache isUrgent=false', toothDone?.isUrgent === false, `isUrgent=${toothDone?.isUrgent}`);

  const chestS = await postStream('عندي ألم في الصدر');
  const chestDone = chestS.events.find((e) => e.done);
  check('/api/chat/stream chest pain isUrgent=true with red-flag reason',
    chestDone?.isUrgent === true && chestDone?.urgentReason === 'ألم في الصدر',
    `done=${JSON.stringify(chestDone)}`);

  // ------------------------------------------------------------ Fix 5
  const labS = await postStream('نتيجة سكر صائم عندي 126');
  const labText = labS.events.map((e) => e.text || '').join('');
  check('/api/chat/stream lab question answered without model (200)',
    labS.status === 200 && labText.length > 0, `status=${labS.status}`);

  const modelQ = 'ما هي عاصمة فرنسا؟';
  const mc = await postChat(modelQ);
  check('/api/chat model-needed question → 503 AI_SERVICE_UNAVAILABLE',
    mc.status === 503 && mc.body.error === 'AI_SERVICE_UNAVAILABLE',
    `status=${mc.status} body=${JSON.stringify(mc.body).slice(0, 120)}`);
  const ms = await postStream(modelQ);
  check('/api/chat/stream model-needed question → 503 AI_SERVICE_UNAVAILABLE (plain JSON, not SSE)',
    ms.status === 503 && ms.jsonBody?.error === 'AI_SERVICE_UNAVAILABLE',
    `status=${ms.status} raw=${ms.raw.slice(0, 120)}`);
} finally {
  if (server?.pid) {
    try { process.kill(-server.pid, 'SIGKILL'); } catch { server.kill('SIGKILL'); }
  }
}

console.log(`\nTOTAL: ${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
