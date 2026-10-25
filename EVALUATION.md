# Riaya — Conformance Evaluation Report

**Build evaluated:** Riaya v9.4 — the v9.3 build plus one UI placement fix (25 Oct 2026): the caesarean-specific instructions (NICE NG192) moved out of the general instructions view; they render only when the caesarean follow-up is selected. All suites below were re-run on v9.4 with identical results. The v9.3 record follows. — Riaya v9.3 — the v9.2 build plus three bounded improvements: (1) a wizard question on additional diabetes risk factors feeding the Evidence Comparator's ADA-arm per-user position; (2) an English-interface polish sweep (defect fixes only); (3) a second verified source (ACS) for breast screening in the Evidence Comparator — 25 October 2026. The v8 record below stands as written; §2.3 carries the v9.3 comparator delta.
**Prior candidate (the fallback):** Riaya v7 — base suites **428 / 428** (374 unit + 54 conformance) and Evidence Comparator suite **19 / 19**, all passing 24 Oct 2026; passed the developer's guided live pass in Google AI Studio on 24 Oct 2026 and was published live at https://riaya-companion.ai.studio/ on 25 Oct 2026. V7 remains the candidate and the fallback until v8 passes the same live pass and the developer approves the switch.
**Evaluator:** the development team's automated suites (no external patients, no real data)
**Companion documents:** `README.md` (architecture and limits), `tests/` (all suites, runnable)

---

## 1. What this report measures — and what it does not

This report measures the **conformance of Riaya's deterministic components to the reference rules and safety design they encode**, within a defined set of test cases. The headline metric is:

> **Decision-conformance rate** = the share of evaluation cases in which the system's decision, explanation, source, and uncertainty behaviour match the reference rule and the safety design.

This is **not** "medical accuracy". It does not measure diagnostic performance, and it establishes nothing about outcomes on real patients. The cases are **hand-written to test hand-written rules**; they prove behaviour within the cases specified — nothing more. That disclosure is deliberate: a conformance suite that hides its own construction would be exactly the kind of overclaim this project refuses to make.

The language-model surface (free chat answers, generated follow-up questions) is **not** scored for correctness here, because a generated answer cannot be conformance-tested the same way. Instead, it is constrained by construction — a verified-source gate, a questions-only generator with a content screen, and deterministic fallbacks — and those constraints are what Axis F tests.

## 2. Results — run of 25 October 2026 (v9.3; base suites as run for v8)

All suites below were executed against this build on 25 Oct 2026 (TypeScript strict check clean; production build succeeds). Suite counts are reported **per suite and never merged into one headline number**: the base figure (428) and the comparator figure (32) and the two v8 suites (17 and 16) measure different things.

### 2.1 Unit suites — 374 / 374 passing (unchanged from v7)

| Suite | Checks | Covers |
|---|---|---|
| explain-agent | 23 | Screening explanations, red-flag phrases, negation, dialect |
| v4-features | 26 | Intake routing, curated procedure sets, labs card flow |
| generated-questions | 21 | Generator output parser + content screen |
| lab-reference | 49 | Lab ranges, Arabic-Indic digits, unit conversion heuristics |
| question-why | 13 | Why/action family bank, red-flag families |
| symptom-guides | 208 | Symptom-guide matching across 21 guides (Arabic + English), negation guard, guide completeness |
| general-faq | 20 | Verified FAQ bank matching, question-shape guard, personal-statement exclusion |
| counterfactual | 14 | "What would change this result?" probe: known flips found (age 35→45, supplying a missing input), and a property check that every reported change actually flips the engine decision when re-applied |

### 2.2 Conformance evaluation — 54 / 54 passing, by axis (unchanged from v7)

| Axis | Cases | Result | What it tests |
|---|---|---|---|
| A. Decision conformance | 24 | 24/24 | Screening decisions vs the encoded USPSTF rules, including boundary ages/bands (44/45, 75/76–85, 39/40, 70/71, 17/18, 19/20 pack-years, quit 15/16 years), sex gating, pregnancy routing, known-hypertension routing |
| B. Explanation completeness | 5 | 5/5 | Every record carries bilingual reasoning, bilingual limits, consumed facts, and a cited source |
| C. Red-flag handling | 8 | 8/8 | Urgent phrases (Arabic, English, dialect) escalate; negated/absent phrases do not |
| D. Source integrity | 5 | 5/5 | Each of the 5 rules cites its own USPSTF page (exact URL) and year — copied from the engine, never generated |
| E. Uncertainty behaviour | 6 | 6/6 | Missing inputs → `cannot_determine`, no recommendation issued, and the missing fields are named (e.g. `packYears`, `sexAssigned`, `overweightObesityStatus`) |
| F. Input safety | 6 | 6/6 | Symptom negation guard, Arabic-Indic digit parsing, mmol/L→mg/dL conversion (5.6 → 100.8), generated-question screen (digits and treatment phrasing rejected) |

**Base automated checks on this build: 428 / 428 passing** (374 unit + 54 conformance) — identical totals to v7; the v8 fixes caused no regression in any base suite.

One case failed during the v6-era evaluation's first run (Axis E): the engine named a missing field `overweightObesityStatus` where the test expected the input's property name. The engine's behaviour was correct (no decision, field named); the test's expectation was corrected. This is recorded here because an evaluation that only ever reports green is not an evaluation.

### 2.3 Evidence Comparator — 32 / 32 passing (v8: 21 / 21; v7: 19 / 19)

The comparator (`tests/evidence-comparator.test.ts`) is reported separately, as in v7. V8 changes exactly one behaviour: `classifyClaims()` now also computes a **risk_arm** difference when the two primary claims differ on the risk-factor-based testing path (`hasRiskBasedArm`). Consequences, all test-asserted:

- Diabetes (USPSTF vs ADA) now reports **exactly three computed differences: `age_max`, `weight_condition`, `risk_arm`** — the ADA risk-factor arm is shown as its own scope difference ("risk-factor-based testing path" / «مسار فحص قائم على عوامل الخطر») instead of being visible only inside the claim text.
- Colorectal still computes to **compatible** with zero differences; no `risk_arm` is invented where both sources lack one.
- Relations are still computed, never hand-labelled, and a scope difference is still never presented as a conflict: `potential_conflict` remains exercised **only** by the clearly labelled SYNTHETIC test fixture.

**V9.3 additions (11 new tests, all passing):**

- **Breast pair (8 tests).** A second verified source for breast screening was read from the ACS's official guideline page (American Cancer Society Recommendations for the Early Detection of Breast Cancer; page last revised 23 Jul 2026; the underlying ACS guideline update was published in 2015) on 25 Oct 2026 and added to the pack in the same data shape: ACS average-risk scope — option to start annual screening at 40–44, annual at 45–54, every two years or annual from 55 while in good health; high-risk readers (MRI + mammogram yearly, typically from 30) are outside the claim's average-risk scope. The pair (USPSTF 2024 vs ACS) computes to **scope_difference** with differences exactly `age_min` and `age_max` and overlap 45–74 — computed by `classifyClaims()`, not hand-labelled. Per-user positions are computed from real inputs: age 50 → inside both scopes; 42 → inside USPSTF, outside ACS's routine arm; 78 → individualized zone (USPSTF), outside (ACS); unknown sex or a high-risk history → outside scope / cannot be determined, never guessed.
- **ADA risk-arm positions (3 tests).** The gateway wizard now asks one additional question — additional diabetes risk factors, limited to the factors the evidence pack itself documents (first-degree relative with diabetes, high-risk ancestry, history of cardiovascular disease) — with the app's standard why-we-ask / what-to-do explanations. The USPSTF engine outcome is unchanged; the answer feeds only the comparator's ADA-arm position: overweight + a factor → inside the ADA scope; overweight + no factor → outside it; "not sure" or unanswered → cannot be determined. The answer is also cited in the diabetes evidence trace's facts.
- Hypertension and lung still have one loaded source each, and the comparator still says so (`insufficient_evidence`).

### 2.4 New v8 suites

**Red-flag battery — 17 / 17 passing** (`tests/red-flags.test.ts`). Written *before* the fix, against the unmodified v7 detector: **15 passed, 2 failed**. The two failures were phrase-coverage gaps, not negation-logic failures:
- «ما عندي ألم بالصدر، لكن عندي ضيق نفس شديد» was not urgent: the negated chest pain was handled correctly, but the breathlessness phrasing «ضيق نفس شديد» (without «تنفس») was not in the phrase list.
- «كان عندي ألم بالصدر، لكنه اختفى» was not urgent: the «ألم بالصدر» spelling (ب attached) did not match the listed «ألم في الصدر» — so the by-design conservative escalation for past/resolved mentions was never reached for that spelling.

The fix was three minimal phrase-list additions («ضيق نفس شديد», «ألم بالصدر», «ألم شديد بالصدر») — no logic change. The battery also pins: negation inside a phrase («لا أستطيع التنفس») still escalates; a plainly negated single symptom does not; the past/resolved case escalates **by design** (conservative, documented in the module header); Levantine variants; and the wound+fever combination in both languages.

**Server urgency + no-model resilience — 16 / 16 passing** (`tests/server-urgency.test.ts`). An integration suite that boots the real server with **no Gemini key configured** and asserts over HTTP, on both `/api/chat` and `/api/chat/stream`:
- Toothache and fatigue guide replies carry `isUrgent=false` and an empty `urgentReason` (v7 flagged every guide reply urgent).
- A chest-pain message (guide + true red flag) keeps `isUrgent=true` with the red-flag reason («ألم في الصدر»).
- A lab question is answered deterministically on both endpoints with no model available.
- A question that needs the model returns the clear `503 AI_SERVICE_UNAVAILABLE` JSON on both endpoints (on the stream endpoint it is plain JSON, sent before any SSE headers — v7 returned the 503 *before* the deterministic routes, so a model outage also took the guides down on that endpoint).

## 3. Three layers — implemented / tested / limited

### 3.1 What is implemented (in this build)

Everything in v7, plus the Evidence Comparator as a first-class layer, plus the five v8 fixes:

- Bilingual (Arabic/English) companion across the whole hospital journey: intake chat, journey follow-up, screening gateway, future-vision design board.
- A deterministic screening engine: 5 USPSTF rules, each bound to its own source (title, year, URL); every decision ships an evidence trace (facts used, rule, reasoning, limits, missing inputs), presented under a "Show me the evidence" («ورّيني الدليل») toggle.
- An **Evidence Comparator** over a curated, pre-loaded evidence pack (investigation and comparison over evidence prepared in advance — **not** a live web search; the deployed app has no internet access and nothing is retrieved at runtime). Diabetes loads USPSTF 2021 vs ADA *Standards of Care in Diabetes—2026*, §2 Table 2.5; colorectal loads USPSTF 2021 vs the ACS guideline page plus its test-intervals claim as complementary evidence; breast loads USPSTF 2024 vs the ACS breast-screening guideline page (added in v9.3); hypertension and lung have one loaded source each and the comparator says so (`insufficient_evidence`). Relations are **computed** from scope tags by `classifyClaims()` — diabetes: **scope_difference** (overlap 35–70), colorectal: **compatible** (overlap 45–75), breast: **scope_difference** (overlap 45–74), who-vs-how: **complementary** — and the UI shows the user's own computed position against each source (inside / outside / individualized zone / cannot be determined, never guessed).
- A counterfactual probe inside every evidence trace: "What could change this result?" Each listed change was **verified by re-running the engine on a copy of the inputs with that single input changed** — a change is shown only if the re-run actually flips the decision; when no single change flips it, the trace says so. No threshold text is hand-written for this feature.
- The welcome states the deal in one line: Riaya explains what it knows, where the information came from, and what it cannot confirm.
- An explanation layer on **every** follow-up question: why it is asked (the clinical reason) and what to do if it applies — hand-written for curated sets (22 procedure questions + 11 core check-in questions), and from a fixed, deterministic family bank for generated questions. The model never explains risk.
- Instant in-form alerts when a patient answers "yes" to a red-flag-family question.
- Twenty-one symptom guides (chest pain, breathlessness, abdominal pain, flank pain, toothache, hand and wrist pain, headache, back pain, sore throat, cough, dizziness, diarrhoea and vomiting, constipation, urinary tract infection, heartburn and acid reflux, swollen ankles/feet/legs, earache, heart palpitations, pins and needles, itchy skin, tiredness and fatigue) — each one structured from the single NHS page named inside the guide, fetched and read at build time — that explain how a hospital team works through a presentation: cause categories most-dangerous-first, which tests are ordered and why, which procedures may follow and what the team gains from each. Never a personal differential.
- A deterministic lab-result explainer: asks which test, parses Arabic-Indic digits and units, compares the value with published general ranges (MedlinePlus / Cleveland Clinic), explains generally, and closes with "not a diagnosis — ask your doctor".
- Follow-up questions for operations without a curated set, generated by the model under a questions-only contract and a strict validator (no digits, no thresholds, no treatment phrasing), labelled as general and non-protocol; on any validation failure the app falls back to sourced prose guidance.
- A verified-source gate in chat: medical questions outside the verified set receive a refusal that explains why and points to the verified guides — not an improvised answer.
- Red-flag detection (Arabic + Levantine dialect + English, with a negation guard) that leads with emergency action.
- A future-vision board: the screening-to-care pathway as a design simulation on synthetic cases (named owner, SLA timers, escalation, documented closure), explicitly labelled as a design — not an operating system.

**The five v8 fixes (25 Oct 2026, no new features):**
1. **Urgency separation** (`server.ts` + client contract): a matched symptom guide no longer returns `urgent: true` by itself. The guide text is unchanged (it still leads with its own emergency line); the urgent flag — and the client's rose "Alert" treatment — now follows the red-flag safety check only, with the truthful red-flag reason. The client additionally runs its own instant red-flag check, so real red flags keep their urgent treatment on both layers.
2. **Red-flag coverage** (`src/utils/redFlags.ts`): three phrase additions justified by a test battery written before the fix (see §2.4) — the «ضيق نفس شديد» phrasing and the «ألم بالصدر» spelling family. No logic change.
3. **Comparator risk-arm difference** (`src/utils/evidenceComparator.ts` + UI labels): `risk_arm` is now a computed scope difference, labelled in both languages where differences are rendered.
4. **This report** unified to the true build line (v6-era staleness removed; v7's record stated accurately; comparator count corrected to 19 for v7).
5. **Stream-endpoint ordering** (`server.ts`): `/api/chat/stream` now serves the deterministic routes (symptom guides, labs, FAQ) *before* the model-availability check, mirroring `/api/chat` — a Gemini outage no longer takes the verified deterministic core down with it, and the 503 for model-dependent questions is unchanged in shape and clarity.

### 3.2 What is tested (and how)

- **Unit tests (374)** per module, listed in §2.1.
- **Conformance evaluation (54)** across the six axes in §2.2, including boundary values on both sides of every rule band.
- **Evidence Comparator suite (32)**, §2.3 — reported separately from the base figure.
- **Red-flag battery (17)**, §2.4 — written test-first against the pre-fix detector; its two initial failures and their minimal fixes are recorded there.
- **Server integration suite (16)**, §2.4 — the real server booted with no Gemini key; urgency semantics and deterministic availability asserted over HTTP on both chat endpoints, including raw `curl` verification of the same behaviour.
- **Endpoint checks** (local server): symptom-guide replies lead with the emergency line; the lab flow completes the developer's own reported scenario (fasting glucose 5.6 → prediabetes-band explanation); negated symptom mentions are not hijacked.
- **Browser checks** (headless Chromium against the built app): intake routing, curated and generated question flows, why/action rendering, instant alerts, the home button, the guides toggle, future-vision mocks and this verification section — zero page errors.
- **Live verification by the developer** in the deployment environment (Google AI Studio): for **v7**, the full import compiled, its checks passed there, and the guided live pass succeeded (24 Oct 2026); v7 is the build currently published live. **V8's live pass has not happened yet** — see §3.3.

### 3.3 What remains limited or unverified — stated plainly

- **No real users.** All data is synthetic and labelled as such. Nothing here is evidence of clinical benefit.
- **V8's live pass is still pending.** V8 becomes the candidate only after the developer's guided live spot pass in Google AI Studio; until then **v7 — live-passed and published at https://riaya-companion.ai.studio/ — remains the candidate and the fallback**, and the frozen v3 build remains the last-resort fallback. Nothing in this report claims v8 has been deployed.
- **Symptom coverage is a verified library, not a claim of completeness.** The chat answers symptom questions only from the 21 guides above (plus 10 verified FAQ entries, the lab explainer, and the screening gateway). Anything outside the loaded library receives the explicit no-source reply; the chooser lists exactly which symptoms are covered. Coverage grows only by fetching and structuring a named source at build time — the library-expansion roadmap (full body-system taxonomy) is the documented next step, targeted at the Abu Dhabi DoH edition (submission 20 Nov 2026).
- **Generated questions vary.** Live model output occasionally fails validation and the app falls back to prose (by design). The parser was hardened on 24 Oct (bare arrays, Arabic-only items, prose-wrapped JSON, one automatic retry), which raised the button rate in testing, but a text fallback remains possible and is presented honestly when it happens.
- **Cross-source comparison is scoped, not a contradiction detector.** The comparator computes how two loaded sources' scopes relate (bands, weight condition, individualized band, risk-factor arm, direction) and reports agreement, complementarity, or scope difference. It does not prove that guideline conflicts exist or detect them in general: no real loaded pair conflicts, and the `potential_conflict` branch is exercised only by a clearly labelled synthetic test fixture.
- **Chat latency** depends on the hosted model; the developer chose answer quality over the faster model tier.
- **Sponsor technologies were not integrated.** For Track 02 they are a scoring bonus, not an eligibility requirement (verified on the official event page, 23 Oct 2026). One sponsor's signup is not reachable from the developer's country without misrepresenting location, which was declined.
- **Red-flag detection is phrase matching**, with a deliberately narrow negation/dialect scope (documented in `src/utils/redFlags.ts`). The v8 battery extended coverage for the phrasings it proved missing; other unlisted phrasings can still be missed. Ambiguous phrasing flows to the model with an urgent instruction; it is never silently dismissed.
- **Prize payout to the developer's country is unconfirmed** with the organisers. This does not affect judging; it is recorded here because this report separates what is known from what is not.

## 4. How to reproduce

```bash
npm install --legacy-peer-deps
npm run lint        # tsc --noEmit (strict)
npm run build       # production build
# test suites (each prints its own total; run via tsx — the suites import
# extensionless paths that plain node cannot resolve):
for t in explain-agent v4-features generated-questions lab-reference question-why symptom-guides general-faq counterfactual evaluation-suite evidence-comparator red-flags; do
  npx tsx tests/$t.test.ts
done
npx tsx tests/server-urgency.test.ts   # integration: boots the server on port 3000 with no Gemini key; port must be free
```

*Report originally prepared 24 October 2026; unified and re-run for the v8 fix release, 25 October 2026 — for the GenAI Works Open Agent Hackathon, Track 02 — "The Agent That Can Explain Why". Developed by Faten Asaad.*
