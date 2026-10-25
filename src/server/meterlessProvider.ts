// ---------------------------------------------------------------------------
// Meterless Nightshift provider — Riaya v9 sponsor layer (Power layer).
//
// Contract source: the hackathon's official "Start Here" lesson (Lesson 1,
// Power layer) and its POWER prompt "Add Meterless as a provider". Meterless
// Runtime is a first-class, selectable AI provider for the chat path and the
// primary provider for the demo when selected; the existing Gemini provider
// is kept and remains the default.
//
// Selection (environment):
//   LLM_PROVIDER=gemini     (default — current behaviour, unchanged)
//   LLM_PROVIDER=meterless  (chat path routes to Meterless Runtime)
//   METERLESS_BASE_URL      e.g. http://127.0.0.1:8088/v1
//   METERLESS_RUNTIME_TOKEN the Nightshift Console Runtime token
//   METERLESS_MODEL         e.g. meterless/auto (a ROUTING MODE, not a
//                           concrete model id; Nightshift picks the lane)
//
// URL-JOIN DECISION: METERLESS_BASE_URL is treated as the complete
// OpenAI-style API root, exactly like the OpenAI client's baseURL: the
// lesson's example value already ends in the version segment
// (http://127.0.0.1:8088/v1). Endpoints are appended directly —
// POST {base}/chat/completions and GET {base}/models — and NO extra "/v1"
// is ever added by this code. Trailing slashes on the env value are
// stripped once at load.
//
// Request contract (per the lesson's Runtime contract):
//   POST {base}/chat/completions, OpenAI-compatible body
//     { model, messages, temperature, max_tokens, stream }
//   Headers: Authorization: Bearer <Runtime token>,
//            meterless-app: <app name> ("riaya"),
//            meterless-scope: user   (chat calls only — the lesson scopes
//            this header to chat; model discovery sends Authorization +
//            meterless-app only).
//   GET {base}/models for discovery.
//
// Message mapping: the Gemini path's `contents` array is converted 1:1 —
// the system instruction becomes the leading {role:"system"} message, each
// history turn keeps its text byte-for-byte (role 'model' -> 'assistant'),
// including the final user turn with its stage context and any H-MEM
// reinjection block already prepended by the caller. The 12-turn history
// cap and the 900-token output cap are applied by the caller / mapped to
// max_tokens, identical to the Gemini path; temperature 0.2 likewise.
// Gemini's thinkingLevel has no OpenAI-compatible analogue and is simply
// not sent (the API does not offer it).
//
// The NVIDIA key NEVER appears in this app: it is configured inside
// Nightshift's Providers tab by the operator. This module holds only the
// Nightshift Runtime token.
//
// Error honesty: every failure of this provider (unreachable, non-2xx,
// malformed body) raises MeterlessError; the caller answers with the same
// AI_SERVICE_UNAVAILABLE failure the app already uses when no model is
// available. There is NO fallback to Gemini from a Meterless call — a
// selected provider that fails must fail openly, never be silently
// substituted while the UI/README claims Meterless.
// ---------------------------------------------------------------------------

export class MeterlessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MeterlessError';
  }
}

export interface MeterlessConfig {
  /** API root, no trailing slash, includes the version segment (…/v1). */
  baseUrl: string;
  token: string;
  /** Routing mode/model sent as the OpenAI `model` field. */
  model: string;
  appName: string;
}

export type LlmProviderName = 'gemini' | 'meterless';

const APP_NAME = 'riaya';
const DEFAULT_MODEL = 'meterless/auto';
const REQUEST_TIMEOUT_MS = 60_000;
const STREAM_TIMEOUT_MS = 120_000;

/** Which provider the chat path uses. Unknown values fall back to gemini. */
export function getLlmProvider(): LlmProviderName {
  return (process.env.LLM_PROVIDER || 'gemini').trim().toLowerCase() === 'meterless'
    ? 'meterless'
    : 'gemini';
}

/**
 * Meterless configuration from the environment, or null when the provider
 * is selected but not fully configured (missing base URL or token) — the
 * caller treats null as "model service unavailable", never as a reason to
 * substitute another provider.
 */
export function getMeterlessConfig(): MeterlessConfig | null {
  const baseUrl = (process.env.METERLESS_BASE_URL || '').trim().replace(/\/+$/, '');
  const token = (process.env.METERLESS_RUNTIME_TOKEN || '').trim();
  if (!baseUrl || !token) return null;
  const model = (process.env.METERLESS_MODEL || '').trim() || DEFAULT_MODEL;
  return { baseUrl, token, model, appName: APP_NAME };
}

function chatHeaders(config: MeterlessConfig): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.token}`,
    'meterless-app': config.appName,
    'meterless-scope': 'user',
  };
}

function discoveryHeaders(config: MeterlessConfig): Record<string, string> {
  return {
    Authorization: `Bearer ${config.token}`,
    'meterless-app': config.appName,
  };
}

interface GeminiContent {
  role?: string;
  parts?: Array<{ text?: string }>;
}

export interface OpenAiMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Convert the Gemini-path contents array into OpenAI-compatible messages.
 * The system instruction leads; every turn's text is preserved exactly
 * (parts joined with no separator, as Gemini reads them sequentially).
 */
export function buildMeterlessMessages(systemInstruction: string, contents: GeminiContent[]): OpenAiMessage[] {
  const messages: OpenAiMessage[] = [{ role: 'system', content: systemInstruction }];
  for (const c of contents) {
    const text = (c.parts || []).map((p) => p.text || '').join('');
    messages.push({ role: c.role === 'model' ? 'assistant' : 'user', content: text });
  }
  return messages;
}

async function readErrorBody(res: Response): Promise<string> {
  try {
    const t = await res.text();
    return t ? `: ${t.slice(0, 200)}` : '';
  } catch {
    return '';
  }
}

/**
 * Model discovery — GET {base}/models. Used by the streaming endpoint as a
 * pre-flight reachability/authorisation check BEFORE any SSE bytes are
 * written (so an unreachable Runtime still earns the plain-JSON 503 the
 * app already uses), and logged once per process. Throws MeterlessError
 * on network failure or a non-2xx status.
 */
let discoveryLogged = false;
export async function meterlessDiscoverModels(config: MeterlessConfig): Promise<string[]> {
  let res: Response;
  try {
    res = await fetch(`${config.baseUrl}/models`, {
      method: 'GET',
      headers: discoveryHeaders(config),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err: any) {
    throw new MeterlessError(`Meterless model discovery unreachable: ${err?.message || err}`);
  }
  if (!res.ok) {
    throw new MeterlessError(`Meterless model discovery failed (HTTP ${res.status})${await readErrorBody(res)}`);
  }
  const body: any = await res.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.data)
    ? body.data.map((m: any) => m?.id).filter((id: any) => typeof id === 'string')
    : [];
  if (!discoveryLogged) {
    discoveryLogged = true;
    console.log(`[meterless] runtime discovery ok at ${config.baseUrl}: ${ids.length} model(s) advertised${ids.length ? ` (${ids.slice(0, 5).join(', ')}${ids.length > 5 ? ', …' : ''})` : ''}`);
  }
  return ids;
}

/** Non-streaming chat completion. Returns the assistant text ('' if empty). */
export async function meterlessChatComplete(
  config: MeterlessConfig,
  systemInstruction: string,
  contents: GeminiContent[],
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: chatHeaders(config),
      body: JSON.stringify({
        model: config.model,
        messages: buildMeterlessMessages(systemInstruction, contents),
        temperature: 0.2,
        max_tokens: 900,
        stream: false,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err: any) {
    throw new MeterlessError(`Meterless chat request unreachable: ${err?.message || err}`);
  }
  if (!res.ok) {
    throw new MeterlessError(`Meterless chat request failed (HTTP ${res.status})${await readErrorBody(res)}`);
  }
  const body: any = await res.json().catch(() => null);
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    // Some OpenAI-compatible servers return content as typed parts.
    return content.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).join('');
  }
  throw new MeterlessError('Meterless chat response malformed: no choices[0].message.content');
}

/**
 * Streaming chat completion: yields assistant text deltas from the
 * OpenAI-compatible SSE stream (data: lines, terminated by [DONE]).
 * Throws MeterlessError before the first yield when the Runtime is
 * unreachable or answers non-2xx, and mid-stream on a broken connection.
 */
export async function* meterlessChatStream(
  config: MeterlessConfig,
  systemInstruction: string,
  contents: GeminiContent[],
): AsyncGenerator<string> {
  let res: Response;
  try {
    res = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: chatHeaders(config),
      body: JSON.stringify({
        model: config.model,
        messages: buildMeterlessMessages(systemInstruction, contents),
        temperature: 0.2,
        max_tokens: 900,
        stream: true,
      }),
      signal: AbortSignal.timeout(STREAM_TIMEOUT_MS),
    });
  } catch (err: any) {
    throw new MeterlessError(`Meterless stream request unreachable: ${err?.message || err}`);
  }
  if (!res.ok) {
    throw new MeterlessError(`Meterless stream request failed (HTTP ${res.status})${await readErrorBody(res)}`);
  }
  if (!res.body) {
    throw new MeterlessError('Meterless stream response had no body');
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (!payload) continue;
        if (payload === '[DONE]') return;
        let json: any;
        try {
          json = JSON.parse(payload);
        } catch {
          continue; // keepalive / non-JSON line — not content
        }
        const delta = json?.choices?.[0]?.delta?.content ?? json?.choices?.[0]?.text ?? '';
        if (typeof delta === 'string' && delta) yield delta;
      }
    }
  } catch (err: any) {
    if (err instanceof MeterlessError) throw err;
    throw new MeterlessError(`Meterless stream broke mid-response: ${err?.message || err}`);
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* already released */
    }
  }
}
