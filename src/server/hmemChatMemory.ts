// ---------------------------------------------------------------------------
// H-MEM chat memory — Riaya v9 sponsor layer (Meterless H-MEM engine).
//
// Engine: the official Meterless H-MEM reference implementation, vendored
// UNMODIFIED at engines/hmem/ (Apache-2.0, github.com/meterless/meterless,
// engines/hmem — spec in engines/hmem/AGENTS.md, runnable reference in
// engines/hmem/reference/). This module is only an adapter: it calls the
// engine's own facade (HMEM#query / HMEM#mine) and its own reinjection
// formatter. No engine file is changed and no ranking logic is re-implemented
// here.
//
// Design mapping (engine terms -> Riaya chat path):
// - Tiers: the engine's canonical layers are short_term / working / long_term.
//   Conversational turns mined from chat enter as short_term records via the
//   engine's mining pipeline (its model-free default path); the engine's
//   sleep cycle (a separate engine service, not wired here) is what promotes
//   them over time.
// - "Episodic" writes: every user turn on the model path is mined as a
//   `chat_message` interaction event and every model reply as a
//   `model_response` event — the engine's two chat interaction event types.
//   Each record is stored with mandatory source + provenance and logged in
//   the engine's append-only trust ledger (ledger.jsonl next to state.json).
// - Retrieval: before the model call, the engine's hybrid ranker (8 signals,
//   AGENTS.md section 6) scores the store for this chatId; the top results
//   are formatted by the engine's own domain-grouped reinjection formatter
//   and prepended to the model prompt. Records carrying a different chatId
//   are out of scope for the engine's query; unscoped records are global.
//
// Scope guards (Riaya safety posture, unchanged from v8):
// - This layer wraps ONLY the LLM chat path of /api/chat and /api/chat/stream.
//   The deterministic modules (red flags, symptom guides, labs, FAQ,
//   screening, comparator, explain agent) run BEFORE it and never see it.
// - Fail-open: any engine error is logged and the chat continues without
//   memory. Memory can never break or block a reply.
// - Synthetic/demo data only. Nothing here is a medical record.
//
// Measured tuning (why the threshold differs from the engine default):
// The engine's recommended starting threshold is 0.35 on its hybrid score,
// with the spec's own note to tune per domain. The reference embedder is a
// deterministic token-hash embedder, which compresses scores for short
// conversational queries. Measured in this adapter (reference embedder, confidence 0.7): a true recall
// follow-up scores 0.102-0.247, while unrelated questions score 0.072-0.138 —
// the bands overlap, so a threshold alone cannot separate them. This adapter
// therefore queries with threshold 0.10 AND applies Riaya's own injection
// policy on top of the engine's ranking: a retrieved memory is injected into
// a medical prompt only when it shares at least one content token (per the
// engine's own tokenizer) or a named entity with the user's message. The
// engine retrieves and ranks; Riaya decides what may enter a clinical
// prompt. With that gate, all three measured true follow-ups inject and both
// measured unrelated questions inject nothing (see tests/hmem-memory.test.ts).
//
// Known limitations (honest, measured — not hidden):
// - The engine's model-free mining is English-oriented: its signal-word list
//   and tokenizer do not capture Arabic turns (measured: an Arabic
//   "remember..." message yields 0 mined candidates). Arabic chat therefore
//   gets no long-term memory on this path. The engine's documented upgrade
//   path is its minerFn model hook, deliberately NOT wired in this build.
// - Repeated identical turns can mine duplicate records; the engine's sleep
//   cycle (synthesis) is the designed remedy and is not wired here.
// - When the client sends no chatId, all web chat shares one demo scope
//   ('riaya-web'). Memory content is synthetic demo data only.
// ---------------------------------------------------------------------------

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HMEM, tokenize } from '../../engines/hmem/reference/src/index.ts';
import type { RetrievedMemory } from '../../engines/hmem/reference/src/index.ts';

export interface ChatMemoryHit {
  id: string;
  content: string;
  relevance: number;
  layer: string;
  domain: string;
  type: string;
}

export interface ChatMemoryResult {
  /** Engine-formatted reinjection block for the kept memories ('' if none). */
  context: string;
  memories: ChatMemoryHit[];
  strategy: string | null;
}

const ENABLED = process.env.RIAYA_HMEM !== 'off';
const CHAT_QUERY_THRESHOLD = 0.1; // tuned per domain; see header measurements
const CHAT_TOP_N = 5; // the engine's recommended default

let engine: HMEM | null = null;
let engineBroken = false;

function getEngine(): HMEM | null {
  if (!ENABLED || engineBroken) return null;
  if (engine) return engine;
  try {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const persistDir = process.env.RIAYA_HMEM_DIR
      ? path.resolve(process.env.RIAYA_HMEM_DIR)
      : path.resolve(here, '..', '..', 'data', 'hmem');
    engine = new HMEM({ persistDir, actor: 'riaya-server' });
    return engine;
  } catch (err) {
    engineBroken = true;
    console.warn('[hmem] engine init failed; chat continues without memory:', (err as Error)?.message);
    return null;
  }
}

// --- Riaya's injection gate (adapter policy, NOT engine ranking) -----------
// A retrieved memory may enter the model prompt only if it is lexically
// grounded in the user's current message: a shared content token (engine
// tokenizer, stopwords removed) or a shared named entity.
const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with',
  'is', 'are', 'was', 'were', 'be', 'been', 'am', 'i', 'you', 'he', 'she',
  'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'me', 'him', 'them', 'what', 'who', 'whom', 'when', 'where', 'why', 'how',
  'do', 'does', 'did', 'can', 'could', 'should', 'would', 'will', 'shall',
  'this', 'that', 'these', 'those', 'there', 'here', 'about', 'at', 'by',
  'from', 'as', 'if', 'then', 'than', 'so', 'no', 'not', 'yes',
]);

function contentTokens(text: string): Set<string> {
  return new Set(tokenize(text).filter((t) => t.length >= 3 && !STOPWORDS.has(t)));
}

function isGrounded(hit: RetrievedMemory, messageTokens: Set<string>): boolean {
  const m = hit.memory;
  for (const e of m.entities) if (messageTokens.has(e.toLowerCase())) return true;
  for (const t of contentTokens(m.content)) if (messageTokens.has(t)) return true;
  return false;
}

/**
 * Retrieve this conversation's grounded long-term memories for the current
 * message. Returns null when memory is disabled/unavailable or on any error
 * (fail-open). The returned context is the engine's own reinjection format,
 * restricted to the memories that pass Riaya's grounding gate.
 */
export async function retrieveChatMemory(chatId: string, message: string): Promise<ChatMemoryResult | null> {
  const h = getEngine();
  if (!h) return null;
  try {
    const result = h.query(message, { chatId, topN: CHAT_TOP_N, threshold: CHAT_QUERY_THRESHOLD });
    if (!result.memories.length) return { context: '', memories: [], strategy: result.trace.strategy };
    const messageTokens = contentTokens(message);
    // The raw query text itself is also matched: entity tokens such as a
    // person's name appear capitalized in the message but lowercased in the
    // store, and contentTokens() already lowercases via the engine tokenizer.
    for (const t of tokenize(message)) messageTokens.add(t);
    const kept = result.memories.filter((hit) => isGrounded(hit, messageTokens));
    if (!kept.length) return { context: '', memories: [], strategy: result.trace.strategy };
    return {
      context: h.retrieval.formatReinjection(kept),
      memories: kept.map((hit) => ({
        id: hit.memory.id,
        content: hit.memory.content,
        relevance: Number(hit.relevance.toFixed(4)),
        layer: hit.memory.layer,
        domain: hit.memory.domain,
        type: hit.memory.type,
      })),
      strategy: result.trace.strategy,
    };
  } catch (err) {
    console.warn('[hmem] retrieval failed; continuing without memory:', (err as Error)?.message);
    return null;
  }
}

/** Episodic write: mine the user's turn as a `chat_message` event. */
export async function recordUserMessage(chatId: string, message: string): Promise<void> {
  const h = getEngine();
  if (!h) return;
  try {
    await h.mine('chat_message', message, { chatId });
  } catch (err) {
    console.warn('[hmem] user-turn mining failed:', (err as Error)?.message);
  }
}

/** Episodic write: mine the model's reply as a `model_response` event. */
export async function recordModelResponse(chatId: string, reply: string): Promise<void> {
  const h = getEngine();
  if (!h || !reply) return;
  try {
    await h.mine('model_response', reply.slice(0, 4000), { chatId });
  } catch (err) {
    console.warn('[hmem] model-response mining failed:', (err as Error)?.message);
  }
}
