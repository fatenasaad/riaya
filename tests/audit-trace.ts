import { explainScreening } from '../src/utils/explainAgent';
import { evaluateScreeningRules } from '../src/utils/screeningEngine';
import { detectRedFlags } from '../src/utils/redFlags';

function show(title: string, inputs: any) {
  console.log(`\n===== ${title} =====`);
  console.log('INPUTS:', JSON.stringify(inputs));
  const engineOut = evaluateScreeningRules(inputs);
  console.log('ENGINE RESULT COUNT:', engineOut.length, '| ruleIds:', engineOut.map((r) => r.ruleId).join(','));
  const records = explainScreening(inputs);
  for (const r of records) {
    console.log(`-- ${r.ruleId}: decision=${r.decision} status=${r.verificationStatus} noRec=${r.noRecommendationIssued}`);
    console.log(`   facts: ${r.factsUsed.map((f) => `${f.labelEn}=${f.valueEn}`).join(' | ')}`);
    console.log(`   source: ${r.sourceTitle} (${r.sourceYear}) ${r.sourceUrl}`);
    if (r.missingInputs.length) console.log(`   missing: ${r.missingInputs.join(',')}`);
  }
}

// Case A: matched rule (real trace, end to end)
show('A) MATCHED RULE', {
  age: 50, sexAssigned: 'female', isPregnant: 'no', hasOverweightObesity: 'no',
  hasKnownHypertension: 'no', smokingStatus: 'never', hasColorectalSymptomsOrHighRisk: 'no',
  colorectalTestType: 'none', mammogramDate: 'never', hasBreastHighRisk: 'no',
});

// Case B: no applicable rule / empty inputs
show('B) NO-RULE / EMPTY INPUTS', {});

// Case C: missing essential info (age present, weight missing for diabetes)
show('C) MISSING ESSENTIAL INFO', { age: 40, sexAssigned: 'female' });

// Case D: conflicting inputs (pregnancy vs diabetes eligibility)
show('D) CONFLICTING INPUTS', { age: 40, isPregnant: 'yes', hasOverweightObesity: 'yes' });

// Red-flag mixed message: negated symptom + real symptom must STILL escalate
console.log('\n===== RED-FLAG MIXED MESSAGE =====');
const mixed = 'أنا لا أعاني من ألم في الصدر لكن عندي ضيق تنفس شديد';
console.log(`"${mixed}" ->`, JSON.stringify(detectRedFlags(mixed)));
const negOnly = 'أنا لا أعاني من ألم في الصدر';
console.log(`"${negOnly}" ->`, JSON.stringify(detectRedFlags(negOnly)));
