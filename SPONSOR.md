# Riaya v9 — Sponsor Technology Notes

Scope of this document: what the v9 sponsor layer implements, what is
**proven** (and by which test), and what is **not yet proven**. Claims here
are deliberately narrow; anything not listed as proven has not been
demonstrated. The deterministic medical core (screening engine, evidence
comparator, symptom guides, labs, FAQ, red flags, explain agent) is
byte-identical to the v8 build and is not sponsor technology.

## Meterless Engine — H-MEM (Build layer)

Implemented in the previous v9 step: the official Meterless H-MEM
reference implementation is vendored unmodified at `engines/hmem/`
(Apache-2.0, github.com/meterless/meterless) and wired around the chat
path by `src/server/hmemChatMemory.ts` (retrieve → mine → reinject).
Proof: the engine's own test suite (10/10) and official conformance suite
(13/13), plus Riaya's proof test `tests/hmem-memory.test.ts` (15/15):
a fact stated in one session is retrieved after a full server restart
and injected into the model request, with chatId isolation and the
engine's trust ledger recording reads and writes. Known limitations are
documented in the adapter header (notably: the engine's model-free
mining is English-oriented, so Arabic turns mine no candidates).

## Meterless Nightshift — AI provider (Power layer)

### What is implemented

`src/server/meterlessProvider.ts` implements the Runtime contract from
the official "Start Here" lesson (Lesson 1, Power layer; the POWER
prompt "Add Meterless as a provider"):

- **Selection.** `LLM_PROVIDER=gemini` (default) keeps the existing
  Gemini behaviour unchanged. `LLM_PROVIDER=meterless` makes Meterless
  Runtime the chat path's provider — the primary provider when selected;
  Gemini is never silently substituted for a failed Meterless call.
- **Configuration (environment only).** `METERLESS_BASE_URL`,
  `METERLESS_RUNTIME_TOKEN`, `METERLESS_MODEL` (default
  `meterless/auto`, a routing mode — Nightshift chooses the lane/model).
  If Meterless is selected but the base URL or token is missing, the
  chat model service reports unavailable; it does not fall back.
- **URL join.** The base URL is the complete OpenAI-style API root and
  already includes the version segment (lesson example:
  `http://127.0.0.1:8088/v1`). Endpoints are appended directly —
  `POST {base}/chat/completions`, `GET {base}/models` — with no extra
  `/v1` added. Trailing slashes in the env value are stripped.
- **Requests.** OpenAI-compatible chat completions with headers
  `Authorization: Bearer <Runtime token>`, `meterless-app: riaya`,
  and `meterless-scope: user` (chat calls; discovery sends the first
  two). The NVIDIA key never appears in this application — it is
  configured inside Nightshift's Providers tab by the operator, and
  this codebase contains no NVIDIA handling.
- **Message mapping.** The exact contents the Gemini path builds —
  system instruction, conversation history capped at the most recent
  12 turns, stage context, and any H-MEM reinjection block — are mapped
  1:1 to OpenAI messages (system instruction first; `model` turns
  become `assistant`; turn text preserved byte-for-byte). Temperature
  0.2 and the 900-token output cap map to `temperature` / `max_tokens`.
  Gemini's `thinkingLevel` has no OpenAI-compatible analogue and is
  not sent.
- **Endpoints.** Both `/api/chat` (non-streaming completion) and
  `/api/chat/stream` (SSE deltas relayed in the endpoint's own event
  format) route through the selected provider. On the streaming
  endpoint, model discovery (`GET {base}/models`) runs as a pre-flight
  before any SSE byte is written.
- **Error honesty.** Any Meterless failure — unreachable, non-2xx, or
  malformed — produces the app's standard failure, never a fabricated
  answer: on `/api/chat`, HTTP 503 `AI_SERVICE_UNAVAILABLE` (the same
  body the app already returns when no model is available); on
  `/api/chat/stream`, the same 503 as plain JSON when the pre-flight
  fails, or the endpoint's existing in-band `{error: true}` event when
  the stream itself breaks after SSE has begun.
- **H-MEM interplay.** Memory retrieval and reinjection happen before
  the provider call and are provider-agnostic; they work identically
  with Meterless selected (proven in the suite below).

### What is proven

By `tests/meterless-provider.test.ts` — **40/40 checks** — which boots
the real server with `LLM_PROVIDER=meterless` and **no Gemini key**,
pointed at a local mock Runtime implementing the documented contract:

- request path, `Authorization: Bearer`, `meterless-app`,
  `meterless-scope` headers; `model`, `stream`, `temperature`,
  `max_tokens` fields from configuration;
- message mapping exactly as described above, including byte-for-byte
  history turns and the final user turn (stage context + question);
- streamed OpenAI SSE deltas assembled and relayed correctly, with
  the done event carrying urgency and memory metadata;
- model discovery used (pre-flight before the streamed call);
- H-MEM retrieval + reinjection into the Meterless request, with
  `memory.injected=true` reported;
- deterministic routes (symptom guides) answer with zero Runtime
  calls;
- failure honesty: a Runtime returning HTTP 500 and a fully
  unreachable Runtime both yield `AI_SERVICE_UNAVAILABLE` (503 on
  `/api/chat` and on the stream pre-flight; in-band error event for a
  mid-stream failure) with no fabricated reply text anywhere.

Regression after this change (all unchanged from the pre-change v9
baseline): base unit suites 374/374, conformance 54/54, evidence
comparator 21/21, red-flag battery 17/17, server urgency/no-model
16/16, H-MEM proof 15/15; `tsc --noEmit` clean; production build OK.
With `LLM_PROVIDER` unset (Gemini default), behaviour is the pre-v9
behaviour — the Gemini code paths were not rewritten, only branched
around.

### What is NOT proven — read before claiming a live integration

- **No live Meterless Nightshift has ever been connected to this
  code.** Nightshift is a Windows/Mac/DGX desktop application; this
  build environment is Linux and no Windows/Mac machine was available.
  Everything above is proven against a **mock** that implements the
  documented contract. A real Runtime may differ in details the mock
  cannot reveal (model-catalog contents, lane routing behaviour,
  tolerance for the `meterless/auto` routing mode, header handling).
  Connecting a real Nightshift, confirming discovery against it, and
  running one real request through it remain outstanding steps that
  require a Windows/Mac machine to host Nightshift.
- **No NVIDIA Nemotron model has answered through this integration.**
  That requires an operator to install Nightshift, connect NVIDIA in
  its Providers tab with their own NVIDIA key, and assign a Nemotron
  lane — none of which has happened yet. This build is therefore not
  (yet) a demonstrated entry for the NVIDIA Nemotron award.
- **Scope limit:** `/api/followup-questions` (the structured
  follow-up-question generator) remains Gemini-backed in this build;
  the Meterless routing covers the chat path (`/api/chat`,
  `/api/chat/stream`) only. With `LLM_PROVIDER=meterless` and no
  Gemini key, that auxiliary endpoint returns its own 503 rather than
  fabricating questions.
- **Zetaris (Data layer) is not integrated in this build.** Only the
  Build (H-MEM) and Power (Nightshift provider) layers above are
  implemented; nothing in this document should be read as a Zetaris
  claim.

### Operator checklist for the first live Nightshift run

1. On a Windows/Mac machine: install Nightshift, complete its
   first-run setup, add NVIDIA in Setup → Providers (operator's own
   key), assign a Nemotron lane, and open Console to read the Runtime
   base URL and Runtime token.
2. Run this app on the same machine (or one that can reach the
   Runtime URL) with:
   `LLM_PROVIDER=meterless`, `METERLESS_BASE_URL=<Console URL>`
   (include the `/v1` segment exactly as Console shows it),
   `METERLESS_RUNTIME_TOKEN=<Console token>`,
   `METERLESS_MODEL=meterless/auto`. Keep the token in `.env` only —
   `.env` is gitignored in this repo.
3. `GET /api/health` should report `llmProvider: "meterless"` and
   `meterlessConfigured: true`. Ask the chat a question that reaches
   the model and confirm in Nightshift's run details which model/lane
   handled it; hide all keys/tokens in any recording.
