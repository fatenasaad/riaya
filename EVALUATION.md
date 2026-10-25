# Riaya — Conformance Evaluation Report

**Build evaluated:** Riaya v6 — the v5 verified-library build plus three explain-why improvements (evidence-trace naming, an honesty line in the welcome, and a counterfactual "what would change this result?" probe verified by re-execution) — 24 October 2026
**Evaluator:** the development team's automated suites (no external patients, no real data)
**Companion documents:** `README.md` (architecture and limits), `tests/` (all suites, runnable)

---

## 1. What this report measures — and what it does not

This report measures the **conformance of Riaya's deterministic components to the reference rules and safety design they encode**, within a defined set of test cases. The headline metric is:

> **Decision-conformance rate** = the share of evaluation cases in which the system's decision, explanation, source, and uncertainty behaviour match the reference rule and the safety design.

This is **not** "medical accuracy". It does not measure diagnostic performance, and it establishes nothing about outcomes on real patients. The cases are **hand-written to test hand-written rules**; they prove behaviour within the cases specified — nothing more. That disclosure is deliberate: a conformance suite that hides its own construction would be exactly the kind of overclaim this project refuses to make.

The language-model surface (free chat answers, generated follow-up questions) is **not** scored for correctness here, because a generated answer cannot be conformance-tested the same way. Instead, it is constrained by construction — a verified-source gate, a questions-only generator with a content screen, and deterministic fallbacks — and those constraints are what Axis F tests.

## 2. Results — run of 24 October 2026

All suites were executed against this build (the v6 explain-why build, made 24 Oct 2026 on a separate copy of the v5 verified-library build; v5 passed the developer's guided live spot tests in AI Studio on 24 Oct and remains the fallback candidate until v6 passes the same live pass and the developer approves the switch) on 24 Oct 2026 (TypeScript strict check clean; production build succeeds).

### 2.1 Unit suites — 374 / 374 passing

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

### 2.2 Conformance evaluation — 54 / 54 passing, by axis

| Axis | Cases | Result | What it tests |
|---|---|---|---|
| A. Decision conformance | 24 | 24/24 | Screening decisions vs the encoded USPSTF rules, including boundary ages/bands (44/45, 75/76–85, 39/40, 70/71, 17/18, 19/20 pack-years, quit 15/16 years), sex gating, pregnancy routing, known-hypertension routing |
| B. Explanation completeness | 5 | 5/5 | Every record carries bilingual reasoning, bilingual limits, consumed facts, and a cited source |
| C. Red-flag handling | 8 | 8/8 | Urgent phrases (Arabic, English, dialect) escalate; negated/absent phrases do not |
| D. Source integrity | 5 | 5/5 | Each of the 5 rules cites its own USPSTF page (exact URL) and year — copied from the engine, never generated |
| E. Uncertainty behaviour | 6 | 6/6 | Missing inputs → `cannot_determine`, no recommendation issued, and the missing fields are named (e.g. `packYears`, `sexAssigned`, `overweightObesityStatus`) |
| F. Input safety | 6 | 6/6 | Symptom negation guard, Arabic-Indic digit parsing, mmol/L→mg/dL conversion (5.6 → 100.8), generated-question screen (digits and treatment phrasing rejected) |

**Total automated checks on this build: 428 / 428 passing.**

One case failed during the evaluation's first run (Axis E): the engine named a missing field `overweightObesityStatus` where the test expected the input's property name. The engine's behaviour was correct (no decision, field named); the test's expectation was corrected. This is recorded here because an evaluation that only ever reports green is not an evaluation.

## 3. Three layers — implemented / tested / limited

### 3.1 What is implemented (in this build)

- Bilingual (Arabic/English) companion across the whole hospital journey: intake chat, journey follow-up, screening gateway, future-vision design board.
- A deterministic screening engine: 5 USPSTF rules, each bound to its own source (title, year, URL); every decision ships an evidence trace (facts used, rule, reasoning, limits, missing inputs), presented under a "Show me the evidence" («ورّيني الدليل») toggle.
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

### 3.2 What is tested (and how)

- **Unit tests (374)** per module, listed in §2.1.
- **Conformance evaluation (54)** across the six axes in §2.2, including boundary values on both sides of every rule band.
- **Endpoint checks** (local server): symptom-guide replies lead with the emergency line; the lab flow completes the developer's own reported scenario (fasting glucose 5.6 → prediabetes-band explanation); negated symptom mentions are not hijacked.
- **Browser checks** (headless Chromium against the built app): intake routing, curated and generated question flows, why/action rendering, instant alerts, the home button, the guides toggle, future-vision mocks and this verification section — zero page errors.
- **Live verification by the developer** in the deployment environment (Google AI Studio): the full import of this build compiled and its checks passed there; the generated-questions flow, the why/action layer, and the symptom chooser were exercised live with real model output.

### 3.3 What remains limited or unverified — stated plainly

- **No real users.** All data is synthetic and labelled as such. Nothing here is evidence of clinical benefit.
- **Symptom coverage is a verified library, not a claim of completeness.** The chat answers symptom questions only from the 21 guides above (plus 10 verified FAQ entries, the lab explainer, and the screening gateway). Anything outside the loaded library receives the explicit no-source reply; the chooser lists exactly which symptoms are covered. Coverage grows only by fetching and structuring a named source at build time — the library-expansion roadmap (full body-system taxonomy) is the documented next step, targeted at the Abu Dhabi DoH edition (submission 20 Nov 2026).
- **Generated questions vary.** Live model output occasionally fails validation and the app falls back to prose (by design). The parser was hardened on 24 Oct (bare arrays, Arabic-only items, prose-wrapped JSON, one automatic retry), which raised the button rate in testing, but a text fallback remains possible and is presented honestly when it happens.
- **Conflicting-evidence handling is not implemented as a mechanism.** Each clinical domain has exactly one designated source (one NHS page per symptom guide, one USPSTF recommendation per screening rule), so sources cannot contradict each other inside the library — but the system does not detect contradictions, and no claim of conflict detection is made anywhere in the product or this report.
- **This v6 build's live pass is still pending.** The v5 library build passed the developer's guided live spot tests in Google AI Studio on 24 Oct 2026 (6/6: retrieval routing incl. the urinary/heartburn disambiguation, negation handling, emergency-first rendering, the 21-guide chooser, the lab flow, the evidence trace). V6 changes three explain-why surfaces on a separate copy and becomes the candidate only after the same live spot pass; until then v5 is the candidate and the frozen v3 build remains the last-resort fallback.
- **Chat latency** depends on the hosted model; the developer chose answer quality over the faster model tier.
- **Sponsor technologies were not integrated.** For Track 02 they are a scoring bonus, not an eligibility requirement (verified on the official event page, 23 Oct 2026). One sponsor's signup is not reachable from the developer's country without misrepresenting location, which was declined.
- **Red-flag detection is phrase matching**, with a deliberately narrow negation/dialect scope (documented in `src/utils/redFlags.ts`). Ambiguous phrasing flows to the model with an urgent instruction; it is never silently dismissed.
- **Prize payout to the developer's country is unconfirmed** with the organisers. This does not affect judging; it is recorded here because this report separates what is known from what is not.

## 4. How to reproduce

```bash
npm install --legacy-peer-deps
npm run lint        # tsc --noEmit (strict)
npm run build       # production build
# test suites (each prints its own total):
for t in explain-agent v4-features generated-questions lab-reference question-why symptom-guides general-faq counterfactual evaluation-suite; do
  npx esbuild tests/$t.test.ts --bundle --platform=node --format=cjs --outfile=/tmp/$t.cjs --log-level=error && node /tmp/$t.cjs
done
```

## v7 addendum — Evidence Comparator (24 Oct 2026, separate development copy)

A multi-source comparison layer was added beside the screening engine (the engine itself is unchanged). It works over a **curated, pre-loaded evidence pack — investigation and comparison over evidence prepared in advance, not a live web search** (the deployed app has no internet access, and nothing is retrieved at runtime).

- **Loaded pairs.** Diabetes screening: USPSTF 2021 vs ADA *Standards of Care in Diabetes—2026*, Section 2, Table 2.5 (read at build time from diabetesjournals.org). Colorectal screening: USPSTF 2021 vs the American Cancer Society guideline page (cancer.org, read at build time; the page shows no publication year, so the access date is recorded instead of a year). Colorectal also loads the ACS test-options claim (intervals) as complementary evidence. The other three rules (breast, hypertension, lung) have one loaded source each, and the comparator says so.
- **Computed relations, never hand-labelled.** Each claim carries scope tags (age band, individualized band, weight condition, aspect, direction); `classifyClaims()` derives the relation: diabetes computes to **scope_difference** (overlap 35–70; differs on the upper age cap and the weight condition — inside the overlap the two sources agree, and the UI states that a coverage difference is not an error); colorectal computes to **compatible** (identical bands, overlap 45–75); a who-claim vs a how-claim computes to **complementary**; single-source topics compute to **insufficient_evidence**, displayed honestly in the UI.
- **Per-user position.** For each source, the UI shows where the user's own collected inputs fall (inside scope / outside scope / individualized zone / cannot be determined). The ADA risk-factor arm is deliberately reported as *cannot be determined* for under-35 users with overweight, because its full evaluation needs factors the form does not collect.
- **Potential conflict — synthetic fixture only.** No real loaded pair conflicts. The `potential_conflict` branch is exercised only by a clearly labelled **SYNTHETIC test fixture** (fabricated claims, `example.invalid` URL) proving the classifier fires as designed on that constructed case; it proves nothing about detecting real-world guideline conflicts, and no synthetic data appears in the product UI.
- **Separate test count.** The comparator has its own suite (`tests/evidence-comparator.test.ts`): **18 / 18 passing**, reported separately and never merged into the base figure. The base suites were re-run unchanged on this copy: **428 / 428** (374 unit + 54 conformance).

*Report prepared 24 October 2026 for the GenAI Works Open Agent Hackathon, Track 02 — "The Agent That Can Explain Why". Developed by Faten Asaad.*
