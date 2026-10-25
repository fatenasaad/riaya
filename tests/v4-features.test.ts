// v4 feature tests: intake router + catheterization follow-up set.
// Run: esbuild bundle (node platform) then node.
import { detectIntakeRoute } from '../src/utils/intakeRouter.ts';
import { PROCEDURE_QUESTIONS } from '../src/components/JourneyTab.tsx';

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log('PASS ', name); }
  else { fail++; console.log('FAIL ', name); }
}

// --- Intake router: first-person own-procedure statements route ---
const r1 = detectIntakeRoute('عملت قثطرة قلبية من يومين');
check('router AR past catheter → after/personal/catheter', !!r1 && r1.phase === 'after' && r1.afterView === 'personal' && r1.surgeryType === 'catheter');

const r2 = detectIntakeRoute('عندي عملية غدة درقية الأسبوع الجاي');
check('router AR planned thyroid → before/thyroid', !!r2 && r2.phase === 'before' && r2.surgeryType === 'thyroid');

const r3 = detectIntakeRoute('أجريت عملية قيصرية');
check('router AR past cesarean → after/cesarean', !!r3 && r3.phase === 'after' && r3.surgeryType === 'cesarean');

const r4 = detectIntakeRoute('I had a catheterization two days ago');
check('router EN past catheter → after/catheter', !!r4 && r4.phase === 'after' && r4.surgeryType === 'catheter');

const r5 = detectIntakeRoute('عندي عملية الأسبوع القادم');
check('router AR planned generic → before', !!r5 && r5.phase === 'before');

const r6 = detectIntakeRoute('بدي أعمل قثطرة');
check('router AR planned catheter → before/catheter', !!r6 && r6.phase === 'before' && r6.surgeryType === 'catheter');

const r7 = detectIntakeRoute('عملت استئصال المرارة من أسبوع');
check('router AR past gallbladder → after/gallbladder', !!r7 && r7.phase === 'after' && r7.surgeryType === 'gallbladder');

// --- Intake router: questions and general chat never route ---
check('router definition question stays', detectIntakeRoute('شو هي القثطرة القلبية؟') === null);
check('router EN definition stays', detectIntakeRoute('What is a catheterization?') === null);
check('router general symptom question stays', detectIntakeRoute('شو أسباب الصداع؟') === null);
check('router medication question stays', detectIntakeRoute('كيف أتناول دوائي الموصوف؟') === null);
check('router empty stays', detectIntakeRoute('') === null);
check('router unrelated own statement stays', detectIntakeRoute('عملت قهوة الصبح') === null);

// --- Catheterization follow-up set integrity ---
const cath = PROCEDURE_QUESTIONS.catheter;
check('cath set has 6 questions', cath.length === 6);
check('cath every question bilingual with issue text', cath.every((q) => q.textAr && q.textEn && q.issueAr && q.issueEn));
const chest = cath.find((q) => q.id === 'cath-chest-pain');
check('cath chest pain is emergency on yes', !!chest && chest.severity === 'emergency' && chest.alertWhen === 'yes');
const bleeding = cath.find((q) => q.id === 'cath-bleeding');
check('cath bleeding is emergency on yes', !!bleeding && bleeding.severity === 'emergency' && bleeding.alertWhen === 'yes');
check('cath emergencies are asked first (first 4 all emergency)', cath.slice(0, 4).every((q) => q.severity === 'emergency'));

// --- Gallbladder follow-up set integrity (NHS-grounded) ---
const gall = PROCEDURE_QUESTIONS.gallbladder;
check('gall set has 8 questions', gall.length === 8);
check('gall every question bilingual with issue text', gall.every((q) => q.textAr && q.textEn && q.issueAr && q.issueEn));
check('gall emergencies first (first 2 emergency)', gall.slice(0, 2).every((q) => q.severity === 'emergency'));
const gallChest = gall.find((q) => q.id === 'gall-chest');
check('gall chest/breath is emergency on yes', !!gallChest && gallChest.severity === 'emergency' && gallChest.alertWhen === 'yes');
const gallJaundice = gall.find((q) => q.id === 'gall-jaundice');
check('gall jaundice is urgent on yes', !!gallJaundice && gallJaundice.severity === 'urgent' && gallJaundice.alertWhen === 'yes');

// --- No regression on existing sets ---
check('thyroid set still 4', PROCEDURE_QUESTIONS.thyroid.length === 4);
check('cesarean set still 4', PROCEDURE_QUESTIONS.cesarean.length === 4);
check('general/other sets still empty', PROCEDURE_QUESTIONS.general.length === 0 && PROCEDURE_QUESTIONS.other.length === 0);

console.log(`\nTOTAL: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
