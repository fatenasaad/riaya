/**
 * H-MEM proof test — v9 sponsor layer (Meterless H-MEM engine).
 * Run: npx tsx tests/hmem-memory.test.ts
 *
 * The named proof: a fact stated in session 1 must be retrieved and used
 * after a full server restart, with NO client history supplied — the memory
 * can only have come from the H-MEM store on disk.
 *
 * Method: boots the REAL server twice against one temporary H-MEM persist
 * directory, with NO Gemini key (the sandbox has no live model). With no
 * model, /api/chat answers 503 — but the v9 memory wrap runs BEFORE the
 * model-availability check, so the 503 body carries the exact memory payload
 * the server retrieved for injection into the model prompt on that request.
 * A module-level pass through the very adapter the server imports then shows
 * the assembled reinjection block itself. Live-model injection rides this
 * same code path when a key is configured (server.ts prepends the block to
 * the final user turn and reports memory.injected=true).
 *
 * Also asserted: chatId isolation (another conversation cannot retrieve the
 * fact), the grounding gate (an unrelated wound question does not surface
 * the fact), deterministic routes untouched (symptom guide carries no
 * memory field and answers without the model), and the engine's trust
 * ledger on disk recording both the create and the read.
 */
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'http://127.0.0.1:3000';
const CHAT = 'proof-conversation';
const FACT = 'Please remember that my physiotherapist is called Sara Nasser and I must take my evening walk after dinner.';
const FOLLOWUP = 'What is the name of my physiotherapist?';
const WOUND = 'How often should I change my wound dressing?';

const memDir = fs.mkdtempSync(path.join(os.tmpdir(), 'riaya-hmem-proof-'));
process.env.RIAYA_HMEM_DIR = memDir; // for the module-level adapter pass below

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

function bootServer(): ChildProcess {
  return spawn('npx', ['tsx', 'server.ts'], {
    cwd: root,
    env: { ...process.env, GEMINI_API_KEY: '', RIAYA_HMEM_DIR: memDir },
    stdio: 'ignore',
    detached: true,
  });
}

function killServer(s: ChildProcess | undefined) {
  if (!s?.pid) return;
  try { process.kill(-s.pid, 'SIGKILL'); } catch { /* already gone */ }
}

async function postChat(body: Record<string, unknown>, stream = false) {
  const r = await fetch(`${BASE}/api/chat${stream ? '/stream' : ''}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history: [], language: 'en', ...body }),
    signal: AbortSignal.timeout(30000),
  });
  const raw = await r.text();
  let json: any = null;
  try { json = JSON.parse(raw); } catch { /* SSE or plain text */ }
  return { status: r.status, json, raw };
}

let serverA: ChildProcess | undefined;
let serverB: ChildProcess | undefined;
try {
  // ---------------- Session 1: state the fact ----------------
  serverA = bootServer();
  check('session 1: server boots', await waitForHealth(90000));

  const s1 = await postChat({ message: FACT, chatId: CHAT });
  check('session 1: fact turn reaches the model path (503, no key in sandbox)',
    s1.status === 503 && s1.json?.error === 'AI_SERVICE_UNAVAILABLE', `status=${s1.status}`);
  check('session 1: 503 body carries the memory payload',
    !!s1.json?.memory && Array.isArray(s1.json.memory.memories));

  const stateFile = path.join(memDir, 'state.json');
  const stateText = fs.existsSync(stateFile) ? fs.readFileSync(stateFile, 'utf-8') : '';
  check('session 1: fact persisted in the H-MEM store on disk', stateText.includes('Sara Nasser'));
  const ledger1 = fs.existsSync(path.join(memDir, 'ledger.jsonl'))
    ? fs.readFileSync(path.join(memDir, 'ledger.jsonl'), 'utf-8') : '';
  check('session 1: trust ledger recorded the create', ledger1.includes('"create"'));

  const guide = await postChat({ message: 'عندي ألم في الأسنان', chatId: CHAT, language: 'ar' });
  check('deterministic route untouched: toothache guide answers 200 with no memory field',
    guide.status === 200 && typeof guide.json?.reply === 'string'
      && guide.json.reply.length > 0 && guide.json?.memory === undefined,
    `status=${guide.status}`);

  killServer(serverA);
  serverA = undefined;
  await new Promise((r) => setTimeout(r, 1500));

  // ---------------- Session 2: after a full restart ----------------
  serverB = bootServer();
  check('session 2: server restarts over the same memory dir', await waitForHealth(90000));

  const s2 = await postChat({ message: FOLLOWUP, chatId: CHAT });
  const hit = (s2.json?.memory?.memories ?? [])
    .some((m: any) => typeof m?.content === 'string' && m.content.includes('Sara Nasser'));
  check('session 2: follow-up (no client history) retrieved the session-1 fact after restart',
    s2.status === 503 && (s2.json?.memory?.retrieved ?? 0) >= 1 && hit,
    `status=${s2.status} retrieved=${s2.json?.memory?.retrieved}`);
  check('session 2: memory NOT marked injected (no model call happened)',
    s2.json?.memory?.injected === false);

  const s2stream = await postChat({ message: FOLLOWUP, chatId: CHAT }, true);
  const streamHit = (s2stream.json?.memory?.memories ?? [])
    .some((m: any) => typeof m?.content === 'string' && m.content.includes('Sara Nasser'));
  check('session 2: /api/chat/stream parity — same retrieval on the 503 JSON',
    s2stream.status === 503 && streamHit, `status=${s2stream.status}`);

  const iso = await postChat({ message: FOLLOWUP, chatId: 'someone-else' });
  check('isolation: a different chatId cannot retrieve the fact',
    (iso.json?.memory?.retrieved ?? -1) === 0, `retrieved=${iso.json?.memory?.retrieved}`);

  const wound = await postChat({ message: WOUND, chatId: CHAT });
  const woundLeaks = (wound.json?.memory?.memories ?? [])
    .some((m: any) => typeof m?.content === 'string' && m.content.includes('Sara Nasser'));
  check('grounding gate: unrelated wound question never surfaces the fact', !woundLeaks);

  const ledger2 = fs.readFileSync(path.join(memDir, 'ledger.jsonl'), 'utf-8');
  check('trust ledger recorded the retrieval reads', ledger2.includes('"read"'));

  // ---------------- Module level: the injection block itself ----------------
  const adapter = await import('../src/server/hmemChatMemory.ts');
  const mem = await adapter.retrieveChatMemory(CHAT, FOLLOWUP);
  check('injection block: adapter assembles the engine reinjection block with the fact',
    !!mem && mem.context.includes('[MEMORY CONTEXT]') && mem.context.includes('Sara Nasser'));
  const memWound = await adapter.retrieveChatMemory(CHAT, WOUND);
  // Note: by this point server B has already mined the wound turn itself
  // (it contains the signal word "should"), so the wound query may retrieve
  // its OWN record — legitimate. The safety property is narrower: the
  // unrelated turn must never pull the physiotherapist fact into a prompt.
  check('injection block: wound question never pulls the physiotherapist fact',
    !!memWound && !memWound.context.includes('Sara Nasser')
      && memWound.memories.every((m) => !m.content.includes('Sara Nasser')));
} finally {
  killServer(serverA);
  killServer(serverB);
  console.log(`\nH-MEM proof: ${passed} passed, ${failed} failed (memory dir: ${memDir})`);
  process.exit(failed ? 1 : 0);
}
