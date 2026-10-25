import { explainScreening } from '../src/utils/explainAgent';
import { detectRedFlags } from '../src/utils/redFlags';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, extra = '') {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${extra}`); }
}

// 1) Rule match — colorectal + breast eligible for a 50-year-old average-risk woman
const match = explainScreening({
  age: 50, sexAssigned: 'female', isPregnant: 'no', hasOverweightObesity: 'no',
  hasKnownHypertension: 'no', smokingStatus: 'never', hasColorectalSymptomsOrHighRisk: 'no',
  colorectalTestType: 'none', mammogramDate: 'never', hasBreastHighRisk: 'no',
});
const colo = match.find((r) => r.ruleId === 'colorectal')!;
const breast = match.find((r) => r.ruleId === 'breast')!;
check('rule-match colorectal eligible', colo.decision === 'eligible' && colo.verificationStatus === 'determined_by_rule');
check('rule-match colorectal source URL is the USPSTF page', colo.sourceUrl === 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening');
check('rule-match colorectal fact age=50 present', colo.factsUsed.some((f) => f.labelEn === 'Age' && f.valueEn === '50'));
check('rule-match breast eligible', breast.decision === 'eligible');
check('rule-match no recommendation issued is false', colo.noRecommendationIssued === false);

// 2) Missing info — empty inputs: no recommendation anywhere
const empty = explainScreening({});
check('missing-info all five cannot_determine', empty.length === 5 && empty.every((r) => r.verificationStatus === 'cannot_determine' && r.noRecommendationIssued === true));
check('missing-info colorectal names missing age', (empty.find((r) => r.ruleId === 'colorectal')!.missingInputs || []).includes('age'));

// 3) Conflicting inputs — pregnant + age/weight-eligible for diabetes: pregnancy exclusion wins
const conflict = explainScreening({ age: 40, isPregnant: 'yes', hasOverweightObesity: 'yes' });
const diab = conflict.find((r) => r.ruleId === 'diabetes')!;
check('conflicting-inputs diabetes individualized (pregnancy exclusion precedence)', diab.decision === 'individualized' && diab.verificationStatus === 'clinician_review_required');

// 4) Lung criteria — all met vs timing failed
const lungMet = explainScreening({ age: 60, smokingStatus: 'current', packYears: 25 });
check('lung all-criteria-met eligible', lungMet.find((r) => r.ruleId === 'lung')!.decision === 'eligible');
const lungTimedOut = explainScreening({ age: 60, smokingStatus: 'former', packYears: 25, yearsSinceQuitting: 20 });
check('lung quit-20y-ago not eligible', lungTimedOut.find((r) => r.ruleId === 'lung')!.decision === 'not_eligible');

// 5) AR/EN records — every fact carries both languages
const bilingual = match.every((r) => r.factsUsed.every((f) => f.labelAr && f.labelEn && f.valueAr && f.valueEn));
check('AR/EN every fact bilingual', bilingual);
check('AR/EN record titles bilingual', match.every((r) => r.ruleTitleAr && r.ruleTitleEn && r.reasoningAr && r.reasoningEn));

// 6) Red flags — positive, negation, dialect
check('redflag EN positive', detectRedFlags('I have severe chest pain').isUrgent === true);
check('redflag EN negation NOT urgent', detectRedFlags("I don't have severe chest pain").isUrgent === false);
check('redflag AR negation NOT urgent', detectRedFlags('أنا لا أعاني من ألم في الصدر').isUrgent === false);
check('redflag AR negation-inside-phrase still urgent', detectRedFlags('لا أستطيع التنفس').isUrgent === true);
check('redflag dialect urgent', detectRedFlags('نفسي مو عم يكفيني').isUrgent === true);
check('redflag wound+fever urgent', detectRedFlags('جرح العملية مع حرارة').isUrgent === true);
check('redflag wound negated NOT urgent', detectRedFlags('لا يوجد جرح ولا حرارة').isUrgent === false);
check('redflag mixed negated+real STILL urgent', detectRedFlags('أنا لا أعاني من ألم في الصدر لكن عندي ضيق تنفس شديد').isUrgent === true);
check('redflag benign NOT urgent', detectRedFlags('أشعر بتحسن اليوم').isUrgent === false);
check('redflag AR hamza-less severe chest pain urgent', detectRedFlags('عندي الم شديد في الصدر').isUrgent === true);
check('redflag AR hamza-less negation NOT urgent', detectRedFlags('لا اعاني من الم في الصدر').isUrgent === false);

console.log(`\nTOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
