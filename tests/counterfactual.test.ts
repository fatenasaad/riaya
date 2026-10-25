import { findOutcomeChanges, DecisionCategory } from '../src/utils/counterfactual';
import { evaluateScreeningRules } from '../src/utils/screeningEngine';
import { explainScreening } from '../src/utils/explainAgent';
import { ScreeningInputs } from '../src/types';

let pass = 0;
let fail = 0;
function check(name: string, cond: boolean, extra = '') {
  if (cond) { pass++; console.log(`PASS  ${name}`); }
  else { fail++; console.log(`FAIL  ${name} ${extra}`); }
}

function decisionOf(inputs: ScreeningInputs, ruleId: string): DecisionCategory | null {
  const res = evaluateScreeningRules(inputs).find((r) => r.ruleId === ruleId);
  if (!res) return null;
  if (res.isEligible === true) return 'eligible';
  if (res.isEligible === false) return 'not_eligible';
  return res.isEligible;
}

// 1) Colorectal at 35, average risk, no prior test: not eligible.
//    The probe must find age -> 45 (the nearest flipping age) as verified.
{
  const inputs: ScreeningInputs = { age: 35, hasColorectalSymptomsOrHighRisk: 'no', colorectalTestType: 'none' };
  check('cf colorectal baseline not_eligible', decisionOf(inputs, 'colorectal') === 'not_eligible');
  const changes = findOutcomeChanges(inputs, 'colorectal');
  const ageFlip = changes.find((c) => c.field === 'age' && c.newDecision === 'eligible');
  check('cf colorectal age flip to eligible found', !!ageFlip);
  check('cf colorectal nearest flipping age is 45', ageFlip?.toRaw === 45, `got ${ageFlip?.toRaw}`);
  const symFlip = changes.find((c) => c.field === 'hasColorectalSymptomsOrHighRisk' && c.newDecision === 'individualized');
  check('cf colorectal symptoms flip to individualized found', !!symFlip);
}

// 2) Diabetes with the weight input missing: insufficient_info.
//    Supplying the missing input must appear as a verified change.
{
  const inputs: ScreeningInputs = { age: 50 };
  check('cf diabetes baseline insufficient_info', decisionOf(inputs, 'diabetes') === 'insufficient_info');
  const changes = findOutcomeChanges(inputs, 'diabetes');
  const supply = changes.find((c) => c.field === 'hasOverweightObesity' && c.toRaw === 'yes' && c.newDecision === 'eligible');
  check('cf diabetes supplying weight=yes flips to eligible', !!supply);
}

// 3) Hypertension at 30 without known hypertension: eligible.
//    Both flipping the known-hypertension flag and dropping under 18 flip it.
{
  const inputs: ScreeningInputs = { age: 30, hasKnownHypertension: 'no' };
  check('cf hypertension baseline eligible', decisionOf(inputs, 'hypertension') === 'eligible');
  const changes = findOutcomeChanges(inputs, 'hypertension');
  check('cf hypertension known=yes flips to not_eligible',
    changes.some((c) => c.field === 'hasKnownHypertension' && c.toRaw === 'yes' && c.newDecision === 'not_eligible'));
  check('cf hypertension age drop flips to not_eligible',
    changes.some((c) => c.field === 'age' && c.newDecision === 'not_eligible'));
}

// 4) PROPERTY: every change the probe reports, for any rule and scenario,
//    actually flips the engine decision when re-applied independently here.
{
  const scenarios: ScreeningInputs[] = [
    { age: 35, hasColorectalSymptomsOrHighRisk: 'no', colorectalTestType: 'none' },
    { age: 50 },
    { age: 30, hasKnownHypertension: 'no' },
    { age: 60, smokingStatus: 'former', packYears: 25, yearsSinceQuitting: 20 },
    { age: 50, sexAssigned: 'female', hasBreastHighRisk: 'no', mammogramDate: 'within_2_years' },
    { age: 55, sexAssigned: 'female', isPregnant: 'no', hasOverweightObesity: 'yes', hasKnownHypertension: 'yes', smokingStatus: 'current', packYears: 30, hasColorectalSymptomsOrHighRisk: 'no', colorectalTestType: 'colonoscopy', colorectalTestDate: 'within_10_years', mammogramDate: 'never', hasBreastHighRisk: 'no' },
    {},
  ];
  let verified = 0;
  let violations = 0;
  for (const inputs of scenarios) {
    for (const ruleId of ['colorectal', 'breast', 'diabetes', 'hypertension', 'lung']) {
      const baseline = decisionOf(inputs, ruleId);
      for (const c of findOutcomeChanges(inputs, ruleId)) {
        const mutated: ScreeningInputs = { ...inputs, [c.field]: c.toRaw };
        const after = decisionOf(mutated, ruleId);
        if (after === c.newDecision && after !== baseline) verified++;
        else violations++;
      }
    }
  }
  check('cf property: every reported change re-verifies against the engine', violations === 0, `${violations} violations`);
  check('cf property: probe actually exercised (verified flips > 10)', verified > 10, `verified=${verified}`);
}

// 5) Integration: explain records carry outcomeChanges, capped at 4 per rule.
{
  const records = explainScreening({
    age: 50, sexAssigned: 'female', isPregnant: 'no', hasOverweightObesity: 'no',
    hasKnownHypertension: 'no', smokingStatus: 'never', hasColorectalSymptomsOrHighRisk: 'no',
    colorectalTestType: 'none', mammogramDate: 'never', hasBreastHighRisk: 'no',
  });
  check('cf integration: all 5 records carry an outcomeChanges array',
    records.length === 5 && records.every((r) => Array.isArray(r.outcomeChanges)));
  check('cf integration: cap of 4 changes per rule respected',
    records.every((r) => r.outcomeChanges.length <= 4));
  const colo = records.find((r) => r.ruleId === 'colorectal')!;
  check('cf integration: eligible colorectal still shows verified exits (e.g. symptoms -> individualized)',
    colo.outcomeChanges.some((c) => c.newDecision === 'individualized'));
}

console.log(`\n counterfactual: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
