import { ScreeningInputs } from '../types';
import { evaluateScreeningRules } from './screeningEngine';

// ---------------------------------------------------------------------------
// "What would change this result?" — verified by execution, never asserted.
//
// For one rule, this probe takes the user's ACTUAL inputs and tries a fixed
// set of single-field changes. Every candidate change is applied to a CLONE
// of the inputs and the real screening engine is re-run on the clone. A
// change is reported ONLY if the re-run actually flips that rule's decision
// category. Nothing here is written from rule thresholds by hand, and no
// language model is involved: if a change is listed, the engine itself
// demonstrated it. If no single change flips the result, the list is empty
// and the UI says so honestly.
// ---------------------------------------------------------------------------

export type DecisionCategory =
  | 'eligible'
  | 'not_eligible'
  | 'individualized'
  | 'insufficient_info';

export interface OutcomeChange {
  field: string;
  fieldLabelAr: string;
  fieldLabelEn: string;
  fromAr: string;
  fromEn: string;
  toAr: string;
  toEn: string;
  /** Raw candidate value that produced the flip (not rendered; lets tests
   *  re-apply the change and re-verify the flip independently). */
  toRaw: string | number;
  newDecision: DecisionCategory;
}

type FieldValue = string | number | undefined;

interface FieldMeta {
  field: keyof ScreeningInputs;
  labelAr: string;
  labelEn: string;
  candidates: FieldValue[];
  format: (v: FieldValue) => { ar: string; en: string };
}

const NOT_PROVIDED = { ar: 'غير مقدّم', en: 'Not provided' };

function ynFormat(map: Record<string, { ar: string; en: string }>) {
  return (v: FieldValue) => {
    if (v === undefined) return NOT_PROVIDED;
    return map[String(v)] || { ar: String(v), en: String(v) };
  };
}

const YES_NO_MAP: Record<string, { ar: string; en: string }> = {
  yes: { ar: 'نعم', en: 'Yes' },
  no: { ar: 'لا', en: 'No' },
  unknown: { ar: 'غير محدد', en: 'Not specified' },
};

const numFormat = (v: FieldValue) =>
  v === undefined ? NOT_PROVIDED : { ar: `${v}`, en: `${v}` };

// Candidate values are the wizard's own option values plus the threshold
// boundary ages the five USPSTF rules actually use. They are only ever
// CANDIDATES: a candidate is reported solely when re-running the engine on
// the mutated inputs flips the decision.
const AGE_CANDIDATES = [17, 18, 34, 35, 39, 40, 44, 45, 49, 50, 70, 71, 74, 75, 76, 80, 81, 85, 86];

const FIELDS: FieldMeta[] = [
  { field: 'age', labelAr: 'العمر', labelEn: 'Age', candidates: AGE_CANDIDATES, format: numFormat },
  {
    field: 'sexAssigned', labelAr: 'الجنس المحدد عند الولادة', labelEn: 'Sex assigned at birth',
    candidates: ['female', 'male'],
    format: ynFormat({ female: { ar: 'أنثى', en: 'Female' }, male: { ar: 'ذكر', en: 'Male' }, other: { ar: 'آخر', en: 'Other' } }),
  },
  { field: 'hasColorectalSymptomsOrHighRisk', labelAr: 'أعراض أو خطورة عالية (قولون)', labelEn: 'Colorectal symptoms or high risk', candidates: ['yes', 'no'], format: ynFormat(YES_NO_MAP) },
  {
    field: 'colorectalTestType', labelAr: 'نوع فحص القولون السابق', labelEn: 'Prior colorectal test type',
    candidates: ['none', 'colonoscopy', 'fit'],
    format: ynFormat({ none: { ar: 'لا فحص سابق', en: 'No prior test' }, colonoscopy: { ar: 'تنظير قولون', en: 'Colonoscopy' }, fit: { ar: 'فحص براز FIT', en: 'FIT stool test' }, other: { ar: 'فحص آخر', en: 'Other test' }, unknown: { ar: 'غير محدد', en: 'Not specified' } }),
  },
  {
    field: 'colorectalTestDate', labelAr: 'تاريخ فحص القولون السابق', labelEn: 'Prior colorectal test timing',
    candidates: ['within_10_years', 'more_than_10_years', 'within_1_year', 'more_than_1_year'],
    format: ynFormat({ within_10_years: { ar: 'خلال آخر 10 سنوات', en: 'Within past 10 years' }, more_than_10_years: { ar: 'قبل أكثر من 10 سنوات', en: 'More than 10 years ago' }, within_1_year: { ar: 'خلال آخر 12 شهراً', en: 'Within past 12 months' }, more_than_1_year: { ar: 'قبل أكثر من 12 شهراً', en: 'More than 12 months ago' } }),
  },
  { field: 'hasBreastHighRisk', labelAr: 'خطورة عالية (ثدي)', labelEn: 'High risk (breast)', candidates: ['yes', 'no'], format: ynFormat(YES_NO_MAP) },
  {
    field: 'mammogramDate', labelAr: 'آخر ماموجرام', labelEn: 'Last mammogram',
    candidates: ['within_2_years', 'more_than_2_years', 'never'],
    format: ynFormat({ within_2_years: { ar: 'خلال آخر عامين', en: 'Within past 2 years' }, more_than_2_years: { ar: 'قبل أكثر من عامين', en: 'More than 2 years ago' }, never: { ar: 'أبداً', en: 'Never' }, unknown: { ar: 'غير محدد', en: 'Not specified' } }),
  },
  { field: 'hasOverweightObesity', labelAr: 'زيادة وزن أو سمنة', labelEn: 'Overweight or obesity', candidates: ['yes', 'no'], format: ynFormat(YES_NO_MAP) },
  { field: 'isPregnant', labelAr: 'حمل', labelEn: 'Pregnancy', candidates: ['yes', 'no'], format: ynFormat(YES_NO_MAP) },
  { field: 'hasKnownHypertension', labelAr: 'ضغط دم مشخص مسبقاً', labelEn: 'Known hypertension', candidates: ['yes', 'no'], format: ynFormat(YES_NO_MAP) },
  {
    field: 'smokingStatus', labelAr: 'حالة التدخين', labelEn: 'Smoking status',
    candidates: ['never', 'former', 'current'],
    format: ynFormat({ never: { ar: 'لم يدخن أبداً', en: 'Never smoked' }, former: { ar: 'مدخن سابق', en: 'Former smoker' }, current: { ar: 'يدخن حالياً', en: 'Current smoker' }, unknown: { ar: 'غير محدد', en: 'Not specified' } }),
  },
  { field: 'packYears', labelAr: 'سنوات/علب التدخين', labelEn: 'Pack-years', candidates: [0, 10, 19, 20, 30], format: numFormat },
  { field: 'yearsSinceQuitting', labelAr: 'سنوات منذ الإقلاع', labelEn: 'Years since quitting', candidates: [0, 5, 15, 16, 25], format: numFormat },
];

function decisionOf(inputs: ScreeningInputs, ruleId: string): DecisionCategory | null {
  const res = evaluateScreeningRules(inputs).find((r) => r.ruleId === ruleId);
  if (!res) return null;
  if (res.isEligible === true) return 'eligible';
  if (res.isEligible === false) return 'not_eligible';
  return res.isEligible;
}

/**
 * Verified single-input changes that flip one rule's decision category.
 * Grouped by (field, newDecision), keeping the candidate closest to the
 * current value for numeric fields. Capped at 4 per rule.
 */
export function findOutcomeChanges(inputs: ScreeningInputs, ruleId: string): OutcomeChange[] {
  const baseline = decisionOf(inputs, ruleId);
  if (baseline === null) return [];

  const best = new Map<string, { change: OutcomeChange; distance: number }>();

  for (const meta of FIELDS) {
    const current = inputs[meta.field] as FieldValue;
    for (const cand of meta.candidates) {
      if (cand === current) continue;
      const mutated: ScreeningInputs = { ...inputs, [meta.field]: cand };
      const next = decisionOf(mutated, ruleId);
      if (next === null || next === baseline) continue;
      const key = `${meta.field}→${next}`;
      const distance =
        typeof cand === 'number' && typeof current === 'number'
          ? Math.abs(cand - current)
          : typeof cand === 'number'
            ? cand
            : 0;
      const existing = best.get(key);
      if (!existing || distance < existing.distance) {
        best.set(key, {
          distance,
          change: {
            field: meta.field,
            fieldLabelAr: meta.labelAr,
            fieldLabelEn: meta.labelEn,
            ...(() => {
              const f = meta.format(current);
              return { fromAr: f.ar, fromEn: f.en };
            })(),
            ...(() => {
              const t = meta.format(cand);
              return { toAr: t.ar, toEn: t.en };
            })(),
            toRaw: cand as string | number,
            newDecision: next,
          },
        });
      }
    }
  }

  return Array.from(best.values())
    .map((v) => v.change)
    .slice(0, 4);
}
