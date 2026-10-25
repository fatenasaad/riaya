// Riaya — conformance evaluation suite (24 Oct 2026).
//
// PURPOSE: measure how the system's DETERMINISTIC components behave against
// their published reference rules and safety design, across six axes:
//   A. Decision conformance  — screening decisions vs the USPSTF rules the
//      engine encodes (boundary ages/bands included). This measures RULE
//      CONFORMANCE within this test set — it is NOT clinical accuracy and
//      says nothing about outcomes on real patients.
//   B. Explanation completeness — every decision carries bilingual reasoning,
//      limits, facts, and its source.
//   C. Red-flag handling — urgent phrases escalate; negated ones do not.
//   D. Source integrity — each rule cites its own authority (title/year/URL),
//      copied from the engine, never invented.
//   E. Uncertainty behaviour — missing inputs produce cannot_determine with
//      the missing fields NAMED; the system never guesses.
//   F. Input safety — negation guards, Arabic-Indic digits, unit heuristics,
//      and the generated-question content screen.
//
// DISCLOSURE: the cases are hand-written to test hand-written rules. They
// prove behaviour within the cases specified here — nothing more.
import { explainScreening } from '../src/utils/explainAgent.ts';
import { detectRedFlags } from '../src/utils/redFlags.ts';
import { findSymptomGuide } from '../src/utils/symptomGuides.ts';
import { parseGeneratedQuestions } from '../src/utils/generatedQuestions.ts';
import { LAB_ENTRIES, extractValue, toCanonical } from '../src/utils/labReference.ts';

const axes: Record<string, { pass: number; fail: number }> = {};
let cur = '';
function axis(name: string) { cur = name; axes[name] = axes[name] || { pass: 0, fail: 0 }; }
function check(name: string, cond: boolean) {
  if (cond) { axes[cur].pass++; console.log(`PASS  [${cur}] ${name}`); }
  else { axes[cur].fail++; console.log(`FAIL  [${cur}] ${name}`); }
}
const rec = (inputs: any, rule: string) => explainScreening(inputs).find((r) => r.ruleId === rule)!;

// ---------------- Axis A: decision conformance (USPSTF boundaries) --------
axis('A-decisions');
const coloBase: any = { sexAssigned: 'female', isPregnant: 'no', hasOverweightObesity: 'no', hasKnownHypertension: 'no', smokingStatus: 'never', hasColorectalSymptomsOrHighRisk: 'no', colorectalTestType: 'none', mammogramDate: 'never', hasBreastHighRisk: 'no' };
check('colorectal 44 → not eligible (band starts 45)', rec({ ...coloBase, age: 44 }, 'colorectal').decision === 'not_eligible');
check('colorectal 45 → eligible (lower boundary)', rec({ ...coloBase, age: 45 }, 'colorectal').decision === 'eligible');
check('colorectal 75 → eligible (upper boundary)', rec({ ...coloBase, age: 75 }, 'colorectal').decision === 'eligible');
check('colorectal 80 → individualized (76–85 selective)', rec({ ...coloBase, age: 80 }, 'colorectal').decision === 'individualized');
check('colorectal symptoms → NOT average-risk eligible; clinician review', (() => { const r = rec({ ...coloBase, age: 50, hasColorectalSymptomsOrHighRisk: 'yes' }, 'colorectal'); return r.decision !== 'eligible' && r.verificationStatus === 'clinician_review_required'; })());
check('breast female 39 → not eligible (band starts 40)', rec({ ...coloBase, age: 39 }, 'breast').decision === 'not_eligible');
check('breast female 40 → eligible (lower boundary)', rec({ ...coloBase, age: 40 }, 'breast').decision === 'eligible');
check('breast female 74 → eligible (upper boundary)', rec({ ...coloBase, age: 74 }, 'breast').decision === 'eligible');
check('breast female 76 → individualized (insufficient evidence 75+)', rec({ ...coloBase, age: 76 }, 'breast').decision === 'individualized');
check('breast high-risk → individualized', rec({ ...coloBase, age: 50, hasBreastHighRisk: 'yes' }, 'breast').decision === 'individualized');
check('breast male → never eligible (sex-gated rule)', rec({ ...coloBase, age: 50, sexAssigned: 'male' }, 'breast').decision !== 'eligible');
const diabBase: any = { hasOverweightObesity: 'yes', isPregnant: 'no' };
check('diabetes 34 + overweight → not eligible (band starts 35)', rec({ ...diabBase, age: 34 }, 'diabetes').decision === 'not_eligible');
check('diabetes 35 + overweight → eligible (lower boundary)', rec({ ...diabBase, age: 35 }, 'diabetes').decision === 'eligible');
check('diabetes 50 without overweight → not eligible (both criteria required)', rec({ age: 50, hasOverweightObesity: 'no', isPregnant: 'no' }, 'diabetes').decision === 'not_eligible');
check('diabetes 71 + overweight → not eligible (band ends 70)', rec({ ...diabBase, age: 71 }, 'diabetes').decision === 'not_eligible');
check('hypertension 17 → not eligible (adults 18+)', rec({ age: 17, hasKnownHypertension: 'no' }, 'hypertension').decision === 'not_eligible');
check('hypertension 18 → eligible (lower boundary)', rec({ age: 18, hasKnownHypertension: 'no' }, 'hypertension').decision === 'eligible');
check('hypertension known → NOT screening-eligible (management path)', rec({ age: 40, hasKnownHypertension: 'yes' }, 'hypertension').decision !== 'eligible');
check('lung 50y, current, 20 pack-years → eligible (all boundaries met)', rec({ age: 50, smokingStatus: 'current', packYears: 20 }, 'lung').decision === 'eligible');
check('lung 19 pack-years → not eligible (≥20 required)', rec({ age: 55, smokingStatus: 'current', packYears: 19 }, 'lung').decision === 'not_eligible');
check('lung never-smoker → not eligible', rec({ age: 60, smokingStatus: 'never', packYears: 0 }, 'lung').decision === 'not_eligible');
check('lung former, quit 15y, 25py → eligible (quit boundary)', rec({ age: 60, smokingStatus: 'former', packYears: 25, yearsSinceQuitting: 15 }, 'lung').decision === 'eligible');
check('lung former, quit 16y, 25py → not eligible (quit window passed)', rec({ age: 60, smokingStatus: 'former', packYears: 25, yearsSinceQuitting: 16 }, 'lung').decision === 'not_eligible');
check('lung 81y → not eligible (band ends 80)', rec({ age: 81, smokingStatus: 'current', packYears: 30 }, 'lung').decision === 'not_eligible');

// ---------------- Axis B: explanation completeness -----------------------
axis('B-explanation');
const full = explainScreening({ ...coloBase, age: 50 });
check('every record carries bilingual reasoning', full.every((r) => r.reasoningAr.length > 10 && r.reasoningEn.length > 10));
check('every record carries bilingual limits', full.every((r) => r.limitsAr.length > 5 && r.limitsEn.length > 5));
check('every record cites a source (title + year + URL)', full.every((r) => r.sourceTitle.length > 3 && ['2021', '2024'].includes(r.sourceYear) && r.sourceUrl.startsWith('https://www.uspreventiveservicestaskforce.org/')));
check('eligible records state a recommendation WAS issued', full.filter((r) => r.decision === 'eligible').every((r) => r.noRecommendationIssued === false));
check('lung record breaks down per-criterion facts (≥3 facts)', rec({ age: 60, smokingStatus: 'current', packYears: 25 }, 'lung').factsUsed.length >= 3);

// ---------------- Axis C: red-flag handling ------------------------------
axis('C-redflags');
check('AR continuous bleeding urgent', detectRedFlags('نزيف مستمر من الجرح').isUrgent === true);
check('AR vomiting blood urgent', detectRedFlags('عندي تقيؤ دم من الصبح').isUrgent === true);
check('AR fainting urgent', detectRedFlags('أغمي علي بالحمام').isUrgent === true);
check('AR severe palpitations urgent', detectRedFlags('خفقان شديد مع دوخة').isUrgent === true);
check('EN uncontrolled bleeding urgent', detectRedFlags('I have uncontrolled bleeding').isUrgent === true);
check('EN passed out urgent', detectRedFlags('he passed out at home').isUrgent === true);
check('AR plain "no bleeding" NOT urgent (no flag phrase)', detectRedFlags('ما في نزيف أبداً').isUrgent === false);
check('AR negated chest pain + plain ضيق NOT urgent', detectRedFlags('لا يوجد ألم في الصدر ولا ضيق').isUrgent === false);

// ---------------- Axis D: source integrity (per-rule authority) ----------
axis('D-sources');
const expectUrl: Record<string, string> = {
  colorectal: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening',
  breast: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening',
  diabetes: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes',
  hypertension: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening',
  lung: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening',
};
const expectYear: Record<string, string> = { colorectal: '2021', breast: '2024', diabetes: '2021', hypertension: '2021', lung: '2021' };
for (const rule of Object.keys(expectUrl)) {
  const r = full.find((x) => x.ruleId === rule) || rec({ age: 60, smokingStatus: 'current', packYears: 25 }, rule);
  check(`${rule} cites its own USPSTF page + year`, r.sourceUrl === expectUrl[rule] && r.sourceYear === expectYear[rule]);
}

// ---------------- Axis E: uncertainty behaviour --------------------------
axis('E-uncertainty');
check('empty inputs → all 5 cannot_determine, no recommendation', (() => { const e = explainScreening({}); return e.length === 5 && e.every((r) => r.verificationStatus === 'cannot_determine' && r.noRecommendationIssued === true); })());
check('diabetes without weight status → cannot_determine naming the missing field', (() => { const r = rec({ age: 40, isPregnant: 'no' }, 'diabetes'); return r.verificationStatus === 'cannot_determine' && (r.missingInputs || []).includes('overweightObesityStatus'); })());
check('lung without pack-years → cannot_determine naming packYears', (() => { const r = rec({ age: 60, smokingStatus: 'current' }, 'lung'); return r.verificationStatus === 'cannot_determine' && (r.missingInputs || []).includes('packYears'); })());
check('breast without sex → cannot_determine naming sexAssigned', (() => { const r = rec({ age: 50 }, 'breast'); return r.verificationStatus === 'cannot_determine' && (r.missingInputs || []).includes('sexAssigned'); })());
check('hypertension without age → cannot_determine naming age', (() => { const r = rec({ hasKnownHypertension: 'no' }, 'hypertension'); return r.verificationStatus === 'cannot_determine' && (r.missingInputs || []).includes('age'); })());
check('pregnancy routes diabetes to individualized, never plain eligible', (() => { const r = rec({ age: 40, isPregnant: 'yes', hasOverweightObesity: 'yes' }, 'diabetes'); return r.decision === 'individualized' && r.verificationStatus === 'clinician_review_required'; })());

// ---------------- Axis F: input safety -----------------------------------
axis('F-input-safety');
check('symptom guide: negated chest pain not hijacked', findSymptomGuide('ما عندي ألم في الصدر') === null);
check('symptom guide: negated breathlessness not hijacked', findSymptomGuide('لا أعاني من ضيق تنفس') === null);
check('lab: Arabic-Indic digits parsed (٥.٦ → 5.6)', extractValue('السكر ٥.٦') === 5.6);
check('lab: glucose 5.6 without unit → treated as mmol/L → 100.8 mg/dL', (() => { const g = LAB_ENTRIES.find((e) => e.id === 'glucose')!; const c = toCanonical(g, 5.6, 'السكر ٥.٦'); return Math.abs(c.value - 100.8) < 0.2; })());
check('generated questions: digit-bearing question screened out, clean set survives', (() => {
  const raw = JSON.stringify({ questions: [
    { ar: 'هل حرارتك أعلى من ٣٨ درجة؟', en: 'Is your temperature above 38?' },
    { ar: 'هل يوجد نزيف من الجرح؟', en: 'Is there bleeding from the wound?' },
    { ar: 'هل تشعر بقشعريرة؟', en: 'Do you have chills?' },
    { ar: 'هل تستطيع المشي قليلاً؟', en: 'Can you walk a little?' },
  ] });
  const p = parseGeneratedQuestions(raw);
  return !!p && p.length === 3 && !p.some((q) => /[0-9٠-٩]/.test(q.ar + q.en));
})());
check('generated questions: treatment instruction sinks the set → null', parseGeneratedQuestions(JSON.stringify({ questions: [
  { ar: 'هل يجب أن تتناول الدواء الآن؟', en: 'Should you take the medicine now?' },
  { ar: 'هل زدت الجرعة اليوم؟', en: 'Did you increase the dose today?' },
  { ar: 'هل توقفت عن تناول الدواء؟', en: 'Did you stop taking the medicine?' },
] })) === null);

// ---------------- Summary -------------------------------------------------
let tp = 0, tf = 0;
console.log('\n--- AXIS SUMMARY ---');
for (const [name, a] of Object.entries(axes)) {
  console.log(`${name}: ${a.pass} passed, ${a.fail} failed`);
  tp += a.pass; tf += a.fail;
}
console.log(`TOTAL: ${tp} passed, ${tf} failed`);
process.exit(tf === 0 ? 0 : 1);
