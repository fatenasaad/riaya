import type { ScreeningInputs } from '../types';

// ---------------------------------------------------------------------------
// Riaya Evidence Comparator — multi-source evidence comparison over a
// CURATED, pre-loaded evidence pack. This is investigation and comparison
// over evidence prepared in advance and loaded into the app — it is NOT a
// live web search: the deployed app has no internet access, and no claim in
// this module was retrieved at runtime. Every claim below is a structured
// summary, in our own wording, of the single source page named in it — each
// page was fetched and read at build time (24 Oct 2026):
//   - USPSTF recommendations (the same sources the screening engine binds).
//   - ADA Standards of Care in Diabetes—2026, Section 2, Table 2.5
//     (diabetesjournals.org, published 8 Dec 2025).
//   - American Cancer Society colorectal screening guideline page
//     (cancer.org; the page carries no publication year — access date is
//     recorded in the claim's limits instead of inventing one).
//
// The relation between two claims is COMPUTED from their scope tags (age
// band, weight condition, aspect, direction) by classifyClaims() — never
// hand-labelled. If a topic has fewer than two loaded claims, the
// comparison honestly reports insufficient evidence instead of comparing.
// ---------------------------------------------------------------------------

export type ClaimAspect = 'who' | 'how';
export type ClaimDirection = 'recommends' | 'not_recommends';

export interface EvidenceClaim {
  id: string;
  topic: string; // screening ruleId this claim belongs to
  org: string;
  sourceTitle: string;
  sourceYear: string;
  sourceUrl: string;
  aspect: ClaimAspect;
  direction: ClaimDirection;
  /** Inclusive routine-screening age band; null ageMax = no upper limit stated. */
  ageMin: number | null;
  ageMax: number | null;
  /** Inclusive band where the source makes the decision individualized. */
  individualizedMin: number | null;
  individualizedMax: number | null;
  weightRequired: boolean;
  /** True when the source also offers a risk-factor-based path at any age
   *  (its full evaluation needs factors this app does not collect). */
  hasRiskBasedArm: boolean;
  claimAr: string;
  claimEn: string;
  supportsAr: string;
  supportsEn: string;
  limitsAr: string;
  limitsEn: string;
}

export type EvidenceRelation =
  | 'compatible'
  | 'complementary'
  | 'scope_difference'
  | 'potential_conflict'
  | 'insufficient_evidence';

export interface ComparisonResult {
  topic: string;
  relation: EvidenceRelation;
  claims: EvidenceClaim[];
  /** Computed age overlap of the two primary 'who' claims, when comparable. */
  overlap: { min: number; max: number | null } | null;
  /** Scope dimensions on which the two primary claims differ (computed). */
  differences: Array<'age_min' | 'age_max' | 'weight_condition' | 'individualized_band'>;
}

export const EVIDENCE_CLAIMS: EvidenceClaim[] = [
  // ------------------------------------------------------------- diabetes
  {
    id: 'diabetes-uspstf',
    topic: 'diabetes',
    org: 'USPSTF',
    sourceTitle: 'USPSTF: Prediabetes and Type 2 Diabetes: Screening (2021)',
    sourceYear: '2021',
    sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes',
    aspect: 'who',
    direction: 'recommends',
    ageMin: 35,
    ageMax: 70,
    individualizedMin: null,
    individualizedMax: null,
    weightRequired: true,
    hasRiskBasedArm: false,
    claimAr: 'يوصي بفحص مقدمات السكري والسكري من النوع الثاني لدى البالغين من عمر 35 إلى 70 سنة ممن لديهم زيادة وزن أو سمنة.',
    claimEn: 'Recommends screening for prediabetes and type 2 diabetes in adults aged 35 to 70 years who have overweight or obesity.',
    supportsAr: 'بدء الفحص من عمر 35 ضمن هذه الفئة، وربط الأهلية بشرط الوزن صراحة.',
    supportsEn: 'starting screening at age 35 within this group, with eligibility explicitly conditioned on overweight or obesity.',
    limitsAr: 'لا يغطي الحوامل (مسار سكري الحمل منفصل)، ولا يوصي روتينياً بعد عمر 70.',
    limitsEn: 'Does not cover pregnant people (a separate gestational pathway applies) and does not routinely recommend screening beyond age 70.',
  },
  {
    id: 'diabetes-ada',
    topic: 'diabetes',
    org: 'ADA',
    sourceTitle: 'ADA: Standards of Care in Diabetes—2026, Section 2, Table 2.5',
    sourceYear: '2026',
    sourceUrl: 'https://diabetesjournals.org/care/article-split/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes',
    aspect: 'who',
    direction: 'recommends',
    ageMin: 35,
    ageMax: null,
    individualizedMin: null,
    individualizedMax: null,
    weightRequired: false,
    hasRiskBasedArm: true,
    claimAr: 'يبدأ الفحص من عمر 35 سنة لجميع البالغين الآخرين دون شرط وزن؛ ويُنصح بالفحص في أي عمر للبالغين ذوي الوزن الزائد أو السمنة مع عامل خطر إضافي واحد على الأقل؛ وإذا كانت النتيجة طبيعية يُعاد الفحص كل 3 سنوات على الأقل.',
    claimEn: 'Testing should begin at age 35 years for all other adults, with no weight condition; testing should also be considered at any age in adults with overweight or obesity who have one or more additional risk factors; if results are normal, repeat at a minimum of 3-year intervals.',
    supportsAr: 'بدء الفحص من عمر 35 للجميع، ومساراً قائماً على عوامل الخطر في أي عمر، وفاصل إعادة لا يقل عن 3 سنوات.',
    supportsEn: 'starting testing at age 35 for everyone, a risk-factor-based path at any age, and a repeat interval of at least every 3 years.',
    limitsAr: 'مسار عوامل الخطر يتطلب معرفة عوامل لا يجمعها هذا النموذج كلها (كالتاريخ العائلي والعرق عالي الخطورة وتاريخ أمراض القلب)؛ والجدول مخصص للبالغين غير الحوامل وبلا أعراض.',
    limitsEn: 'The risk-factor path needs factors this form does not fully collect (family history, high-risk ancestry, cardiovascular history); the table addresses asymptomatic, nonpregnant adults.',
  },
  // ----------------------------------------------------------- colorectal
  {
    id: 'colorectal-uspstf',
    topic: 'colorectal',
    org: 'USPSTF',
    sourceTitle: 'USPSTF: Colorectal Cancer: Screening (2021)',
    sourceYear: '2021',
    sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening',
    aspect: 'who',
    direction: 'recommends',
    ageMin: 45,
    ageMax: 75,
    individualizedMin: 76,
    individualizedMax: 85,
    weightRequired: false,
    hasRiskBasedArm: false,
    claimAr: 'يوصي بالفحص الروتيني لسرطان القولون والمستقيم للبالغين ذوي الخطورة المتوسطة من عمر 45 إلى 75 سنة؛ ومن 76 إلى 85 القرار فردي؛ وبعد 85 لا توصية روتينية.',
    claimEn: 'Recommends routine colorectal cancer screening for average-risk adults aged 45 to 75; from 76 to 85 the decision is individualized; beyond 85 there is no routine recommendation.',
    supportsAr: 'بدء الفحص الروتيني عند 45 للخطورة المتوسطة، وفواصل حسب نوع الفحص (تنظير كل 10 سنوات، FIT سنوياً).',
    supportsEn: 'starting routine screening at 45 for average risk, with test-specific intervals (colonoscopy every 10 years, FIT annually).',
    limitsAr: 'لا ينطبق على ذوي الأعراض أو الخطورة العالية — هؤلاء يحتاجون تقييماً سريرياً مباشراً.',
    limitsEn: 'Does not apply to people with symptoms or high risk — they need direct clinical assessment.',
  },
  {
    id: 'colorectal-acs',
    topic: 'colorectal',
    org: 'ACS',
    sourceTitle: 'American Cancer Society: Colorectal Cancer Screening Guideline',
    sourceYear: '',
    sourceUrl: 'https://www.cancer.org/cancer/types/colon-rectal-cancer/detection-diagnosis-staging/acs-recommendations.html',
    aspect: 'who',
    direction: 'recommends',
    ageMin: 45,
    ageMax: 75,
    individualizedMin: 76,
    individualizedMax: 85,
    weightRequired: false,
    hasRiskBasedArm: false,
    claimAr: 'يوصي ببدء الفحص المنتظم من عمر 45 للأشخاص ذوي الخطورة المتوسطة والاستمرار حتى 75؛ ومن 76 إلى 85 يعتمد القرار على التفضيلات ومتوسط العمر المتوقع والصحة العامة وسجل الفحوصات؛ وبعد 85 لا ينبغي الاستمرار بالفحص.',
    claimEn: 'Recommends starting regular screening at age 45 for average-risk people and continuing through age 75; from 76 to 85 the decision depends on preferences, life expectancy, overall health and prior screening history; over 85, screening should no longer be done.',
    supportsAr: 'نفس عمر البدء ونفس نطاق الفحص الروتيني، ومعايير صريحة لقرار الفئة 76–85.',
    supportsEn: 'the same starting age and routine band, with explicit criteria for the 76–85 decision.',
    limitsAr: 'صفحة الويب لا تحمل سنة نشر ظاهرة؛ سُجل تاريخ الوصول إليها (24 أكتوبر 2026) بدل اختراع سنة. والجمعية لا تصدر إرشاداً خاصاً بها لذوي الخطورة العالية.',
    limitsEn: 'The web page shows no publication year; the access date (24 Oct 2026) is recorded instead of inventing one. ACS issues no high-risk guideline of its own.',
  },
  {
    id: 'colorectal-acs-tests',
    topic: 'colorectal',
    org: 'ACS',
    sourceTitle: 'American Cancer Society: Colorectal Cancer Screening Guideline — test options',
    sourceYear: '',
    sourceUrl: 'https://www.cancer.org/cancer/types/colon-rectal-cancer/detection-diagnosis-staging/acs-recommendations.html',
    aspect: 'how',
    direction: 'recommends',
    ageMin: null,
    ageMax: null,
    individualizedMin: null,
    individualizedMax: null,
    weightRequired: false,
    hasRiskBasedArm: false,
    claimAr: 'خيارات الفحص المفضلة: فحص براز FIT سنوياً، أو تنظير قولون كل 10 سنوات، أو فحص الحمض النووي بالبراز كل 3 سنوات، أو تصوير قولون مقطعي كل 5 سنوات؛ وأي نتيجة غير طبيعية بغير التنظير يجب أن يتبعها تنظير.',
    claimEn: 'Preferred test options: FIT every year, colonoscopy every 10 years, stool DNA testing every 3 years, or CT colonography every 5 years; any abnormal non-colonoscopy result should be followed by a timely colonoscopy.',
    supportsAr: 'فواصل زمنية محددة لكل نوع فحص، تتقاطع مع فواصل USPSTF للتنظير (10 سنوات) وFIT (سنوياً).',
    supportsEn: 'specific intervals per test type, intersecting with the USPSTF intervals for colonoscopy (10 years) and FIT (annual).',
    limitsAr: 'يتحدث عن أنواع الفحوص وفواصلها، لا عن من يجب أن يبدأ الفحص — لذلك يكمل ادعاءات «من يفحص» ولا يقارن بها مباشرة.',
    limitsEn: 'Addresses test types and intervals, not who should start screening — so it complements the "who" claims rather than being directly comparable to them.',
  },
];

const INF = 999;

function bandOverlap(a: EvidenceClaim, b: EvidenceClaim): { min: number; max: number | null } | null {
  if (a.ageMin === null || b.ageMin === null) return null;
  const min = Math.max(a.ageMin, b.ageMin);
  const aMax = a.ageMax === null ? INF : a.ageMax;
  const bMax = b.ageMax === null ? INF : b.ageMax;
  const max = Math.min(aMax, bMax);
  if (min > max) return null;
  return { min, max: max === INF ? null : max };
}

/**
 * Compute the relation between two claims from their scope tags.
 * - different aspects (who vs how)                  -> complementary
 * - opposite directions on an overlapping scope      -> potential_conflict
 * - opposite directions on disjoint scopes           -> scope_difference
 * - same direction, identical scope tags             -> compatible
 * - same direction, differing scope tags             -> scope_difference
 */
export function classifyClaims(a: EvidenceClaim, b: EvidenceClaim): ComparisonResult {
  const base: ComparisonResult = { topic: a.topic, relation: 'insufficient_evidence', claims: [a, b], overlap: null, differences: [] };
  if (a.aspect !== b.aspect) return { ...base, relation: 'complementary' };

  const overlap = bandOverlap(a, b);
  if (a.direction !== b.direction) {
    return { ...base, relation: overlap ? 'potential_conflict' : 'scope_difference', overlap };
  }

  const differences: ComparisonResult['differences'] = [];
  if (a.ageMin !== b.ageMin) differences.push('age_min');
  if (a.ageMax !== b.ageMax) differences.push('age_max');
  if (a.weightRequired !== b.weightRequired) differences.push('weight_condition');
  if (a.individualizedMin !== b.individualizedMin || a.individualizedMax !== b.individualizedMax) differences.push('individualized_band');

  return {
    ...base,
    relation: differences.length === 0 ? 'compatible' : 'scope_difference',
    overlap,
    differences,
  };
}

/** Full comparison for one screening topic over the loaded pack. */
export function compareTopic(topic: string): ComparisonResult {
  const claims = EVIDENCE_CLAIMS.filter((c) => c.topic === topic);
  const who = claims.filter((c) => c.aspect === 'who');
  if (who.length < 2) {
    return { topic, relation: 'insufficient_evidence', claims, overlap: null, differences: [] };
  }
  return classifyClaims(who[0], who[1]);
}

export type UserPosition = 'inside_scope' | 'outside_scope' | 'individualized_zone' | 'unknown';

/**
 * Where the user's own inputs fall relative to one claim's scope.
 * Uses only the inputs this app actually collects (age, overweight status,
 * colorectal symptoms/high-risk). Returns 'unknown' when a needed input is
 * missing — never guesses.
 */
export function userPosition(claim: EvidenceClaim, inputs: ScreeningInputs): UserPosition {
  if (claim.aspect !== 'who') return 'unknown';
  if (inputs.age === undefined || isNaN(inputs.age)) return 'unknown';
  const age = inputs.age;

  if (claim.topic === 'colorectal' && inputs.hasColorectalSymptomsOrHighRisk === 'yes') {
    return 'outside_scope'; // these claims cover average-risk screening only
  }
  if (
    claim.individualizedMin !== null &&
    claim.individualizedMax !== null &&
    age >= claim.individualizedMin &&
    age <= claim.individualizedMax
  ) {
    return 'individualized_zone';
  }
  const aboveMin = claim.ageMin === null || age >= claim.ageMin;
  const belowMax = claim.ageMax === null || age <= claim.ageMax;
  if (!aboveMin) {
    // Below the age arm: a risk-based arm may still apply, but it needs
    // factors this app does not fully collect — say so instead of guessing.
    if (claim.hasRiskBasedArm) {
      // 'yes' -> the arm may apply but its factors are not fully collected;
      // 'unknown'/missing -> indeterminate; only an explicit 'no' (normal
      // weight, per the wizard's own label) closes the risk arm.
      return inputs.hasOverweightObesity === 'no' ? 'outside_scope' : 'unknown';
    }
    return 'outside_scope';
  }
  if (!belowMax) return 'outside_scope';
  if (claim.weightRequired) {
    // Only an explicit 'yes'/'no' is determinate. 'unknown' (or an unanswered
    // question) must stay 'unknown' — absence of overweight is NOT the same
    // as absence of information about weight.
    if (inputs.hasOverweightObesity === 'yes') return 'inside_scope';
    if (inputs.hasOverweightObesity === 'no') return 'outside_scope';
    return 'unknown';
  }
  return 'inside_scope';
}
