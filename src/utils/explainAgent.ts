import { ScreeningInputs, ScreeningResultExplanation } from '../types';
import { evaluateScreeningRules } from './screeningEngine';
import { findOutcomeChanges, OutcomeChange } from './counterfactual';

// ---------------------------------------------------------------------------
// Riaya Explain Agent — deterministic, NO language model in this path.
// Execution path (every step is a real function call, nothing generated):
//   user inputs -> evaluateScreeningRules() -> buildExplainRecords() -> panel
// The record is built ONLY from (a) the inputs the user actually entered and
// (b) the engine result for that rule (ruleId, source title/year/URL, why,
// limits, missing inputs). No rule, URL, identifier or excerpt is ever
// invented here. When the engine issues no recommendation (insufficient
// information), the record says so explicitly and no recommendation is shown.
// ---------------------------------------------------------------------------

export type ExplainDecision =
  | 'eligible'
  | 'not_eligible'
  | 'individualized'
  | 'insufficient_info';

export type VerificationStatus =
  | 'determined_by_rule' // engine matched a rule and issued a decision
  | 'clinician_review_required' // engine explicitly defers to individualized review
  | 'cannot_determine'; // engine issued NO recommendation: inputs missing

export interface ExplainFact {
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
}

export interface ExplainRecord {
  ruleId: string;
  ruleTitleAr: string;
  ruleTitleEn: string;
  decision: ExplainDecision;
  /** Facts the engine actually consumed for this rule, in the user's own values. */
  factsUsed: ExplainFact[];
  /** The verified source the engine cites for this rule — copied, never invented. */
  sourceTitle: string;
  sourceYear: string;
  sourceUrl: string;
  reasoningAr: string;
  reasoningEn: string;
  limitsAr: string;
  limitsEn: string;
  missingInputs: string[];
  verificationStatus: VerificationStatus;
  /** True when the engine issued no recommendation at all for this rule. */
  noRecommendationIssued: boolean;
  /**
   * Single-input changes that would flip this result — each one VERIFIED by
   * re-running the engine on the mutated inputs (see counterfactual.ts).
   * Never hand-written from thresholds; empty when no single change flips it.
   */
  outcomeChanges: OutcomeChange[];
}

const YES_NO: Record<string, { ar: string; en: string }> = {
  yes: { ar: 'نعم', en: 'Yes' },
  no: { ar: 'لا', en: 'No' },
  unknown: { ar: 'غير محدد', en: 'Not specified' },
};

function yn(v: string | undefined): { valueAr: string; valueEn: string } {
  if (!v) return { valueAr: 'غير مقدّم', valueEn: 'Not provided' };
  const hit = YES_NO[v];
  return hit ? { valueAr: hit.ar, valueEn: hit.en } : { valueAr: v, valueEn: v };
}

function num(v: number | undefined): { valueAr: string; valueEn: string } {
  if (v === undefined || isNaN(v)) return { valueAr: 'غير مقدّم', valueEn: 'Not provided' };
  return { valueAr: `${v}`, valueEn: `${v}` };
}

function text(v: string | undefined): { valueAr: string; valueEn: string } {
  if (!v) return { valueAr: 'غير مقدّم', valueEn: 'Not provided' };
  return { valueAr: v, valueEn: v };
}

// Which input fields each rule actually consumes (mirrors screeningEngine.ts).
const RULE_FACTS: Record<string, Array<(inputs: ScreeningInputs) => ExplainFact>> = {
  colorectal: [
    (i) => ({ labelAr: 'العمر', labelEn: 'Age', ...num(i.age) }),
    (i) => ({ labelAr: 'أعراض أو خطورة عالية', labelEn: 'Symptoms or high risk', ...yn(i.hasColorectalSymptomsOrHighRisk) }),
    (i) => ({ labelAr: 'نوع الفحص السابق', labelEn: 'Prior test type', ...text(i.colorectalTestType) }),
    (i) => ({ labelAr: 'تاريخ الفحص السابق', labelEn: 'Prior test timing', ...text(i.colorectalTestDate) }),
  ],
  breast: [
    (i) => ({ labelAr: 'العمر', labelEn: 'Age', ...num(i.age) }),
    (i) => ({ labelAr: 'الجنس المحدد عند الولادة', labelEn: 'Sex assigned at birth', ...text(i.sexAssigned) }),
    (i) => ({ labelAr: 'خطورة عالية', labelEn: 'High risk', ...yn(i.hasBreastHighRisk) }),
    (i) => ({ labelAr: 'آخر ماموجرام', labelEn: 'Last mammogram', ...text(i.mammogramDate) }),
  ],
  diabetes: [
    (i) => ({ labelAr: 'العمر', labelEn: 'Age', ...num(i.age) }),
    (i) => ({ labelAr: 'زيادة وزن أو سمنة', labelEn: 'Overweight or obesity', ...yn(i.hasOverweightObesity) }),
    (i) => ({ labelAr: 'حمل', labelEn: 'Pregnancy', ...yn(i.isPregnant) }),
  ],
  hypertension: [
    (i) => ({ labelAr: 'العمر', labelEn: 'Age', ...num(i.age) }),
    (i) => ({ labelAr: 'ضغط دم مشخص مسبقاً', labelEn: 'Known hypertension', ...yn(i.hasKnownHypertension) }),
  ],
  lung: [
    (i) => ({ labelAr: 'العمر', labelEn: 'Age', ...num(i.age) }),
    (i) => ({ labelAr: 'حالة التدخين', labelEn: 'Smoking status', ...text(i.smokingStatus) }),
    (i) => ({ labelAr: 'سنوات/علب التدخين', labelEn: 'Pack-years', ...num(i.packYears) }),
    (i) => ({ labelAr: 'سنوات منذ الإقلاع', labelEn: 'Years since quitting', ...num(i.yearsSinceQuitting) }),
  ],
};

export function buildExplainRecords(
  inputs: ScreeningInputs,
  results: ScreeningResultExplanation[],
): ExplainRecord[] {
  return results.map((res) => {
    const factBuilders = RULE_FACTS[res.ruleId] || [];
    const factsUsed = factBuilders.map((build) => build(inputs));
    const decision: ExplainDecision =
      res.isEligible === true
        ? 'eligible'
        : res.isEligible === false
          ? 'not_eligible'
          : res.isEligible;
    const noRecommendationIssued = res.isEligible === 'insufficient_info';
    const verificationStatus: VerificationStatus = noRecommendationIssued
      ? 'cannot_determine'
      : res.isEligible === 'individualized'
        ? 'clinician_review_required'
        : 'determined_by_rule';
    return {
      ruleId: res.ruleId,
      ruleTitleAr: res.ruleTitleAr,
      ruleTitleEn: res.ruleTitleEn,
      decision,
      factsUsed,
      sourceTitle: res.sourceTitle,
      sourceYear: res.sourceYear,
      sourceUrl: res.sourceUrl,
      reasoningAr: res.whyThisResultAr,
      reasoningEn: res.whyThisResultEn,
      limitsAr: res.whatThisDoesNotEstablishAr,
      limitsEn: res.whatThisDoesNotEstablishEn,
      missingInputs: res.missingInputs || [],
      verificationStatus,
      noRecommendationIssued,
      outcomeChanges: findOutcomeChanges(inputs, res.ruleId),
    };
  });
}

/** Full agent run: engine evaluation + evidence records, in one call. */
export function explainScreening(inputs: ScreeningInputs): ExplainRecord[] {
  const results = evaluateScreeningRules(inputs);
  return buildExplainRecords(inputs, results);
}
