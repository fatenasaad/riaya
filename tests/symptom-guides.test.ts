// Unit checks for the symptom guides.
import { SYMPTOM_GUIDES, findSymptomGuide, hasSymptomIntent, composeSymptomGuide, composeSymptomChooser } from '../src/utils/symptomGuides.ts';

let passed = 0, failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log('PASS ', name); }
  else { failed++; console.log('FAIL ', name); }
}

check('chest pain detected (ar)', findSymptomGuide('عندي ألم في الصدر من ساعة')?.id === 'chest-pain');
check('chest pressure detected (en)', findSymptomGuide('I have chest pressure since morning')?.id === 'chest-pain');
check('breathlessness detected', findSymptomGuide('عندي ضيق تنفس شديد')?.id === 'breathlessness');
check('abdominal pain detected', findSymptomGuide('في ألم بطن قوي عندي')?.id === 'abdominal-pain');
check('flank pain detected (her wording)', findSymptomGuide('لدي الم في الخاصرة')?.id === 'flank-pain');
check('negated chest pain skipped', findSymptomGuide('ما عندي ألم في الصدر') === null);
check('negated breathlessness skipped', findSymptomGuide('لا أعاني من ضيق تنفس') === null);
check('unrelated text → null', findSymptomGuide('كيف أرتب موعد المراجعة؟') === null);
check('symptom intent (starter)', hasSymptomIntent('عندي أعراض وأريد أن أفهم ماذا قد يحدث في المشفى'));
check('no intent in plain question', !hasSymptomIntent('شو هي القثطرة القلبية؟'));

for (const g of SYMPTOM_GUIDES) {
  check(`${g.id}: >=4 thinking categories`, g.thinkingAr.length >= 4 && g.thinkingEn.length >= 4);
  check(`${g.id}: >=4 tests each with why`, g.tests.length >= 4 && g.tests.every((t) => t.whyAr.length > 15 && t.whyEn.length > 15));
  check(`${g.id}: >=3 procedures each with why`, g.procedures.length >= 3 && g.procedures.every((t) => t.whyAr.length > 15));
  check(`${g.id}: nhs source`, g.sourceUrl.startsWith('https://www.nhs.uk/'));
  const composed = composeSymptomGuide(g, 'ar');
  check(`${g.id}: composed leads with emergency`, composed.startsWith('🚨'));
  check(`${g.id}: composed says not a diagnosis`, composed.includes('ليست تشخيصاً') || composed.includes('لا يشخّص') || composed.includes('ليس تشخيصاً'));
  check(`${g.id}: composed includes source url`, composed.includes(g.sourceUrl));
}
check('chooser lists all three', (() => { const c = composeSymptomChooser('ar'); return c.includes('ألم الصدر') && c.includes('ضيق التنفس') && c.includes('ألم البطن'); })());
check('hamza-less chest pain detected (الم)', findSymptomGuide('عندي الم في الصدر')?.id === 'chest-pain');
check('bare hamza-less chest pain detected', findSymptomGuide('شو عن الم الصدر؟')?.id === 'chest-pain');
check('hamza-less negated chest pain still skipped', findSymptomGuide('ما عندي الم في الصدر') === null);

check('toothache detected (ar)', findSymptomGuide('عندي ألم في الأسنان من مبارح')?.id === 'toothache');
check('tooth pain detected (en)', findSymptomGuide('I have tooth pain since yesterday')?.id === 'toothache');
check('hand pain detected (user case)', findSymptomGuide('عندي ألم في اليد اليسرى وتورم')?.id === 'hand-pain');
check('wrist pain detected (en)', findSymptomGuide('my wrist pain is getting worse')?.id === 'hand-pain');
check('headache detected (ar)', findSymptomGuide('عندي صداع قوي من الصبح')?.id === 'headache');
check('headache detected (en)', findSymptomGuide('I have a headache all day')?.id === 'headache');
check('back pain detected (ar)', findSymptomGuide('في وجع ظهر ما عم يروح')?.id === 'back-pain');
check('back pain detected (en)', findSymptomGuide('lower back pain for a week')?.id === 'back-pain');
check('sore throat detected (ar)', findSymptomGuide('عندي التهاب الحلق وألم عند البلع')?.id === 'sore-throat');
check('sore throat detected (en)', findSymptomGuide('I have a sore throat')?.id === 'sore-throat');
check('cough detected (ar)', findSymptomGuide('عندي سعال من أسبوع')?.id === 'cough');
check('cough detected (en)', findSymptomGuide('I keep coughing at night')?.id === 'cough');
check('negated toothache skipped', findSymptomGuide('ما عندي ألم في الأسنان') === null);
check('negated headache skipped', findSymptomGuide('ما عندي صداع') === null);
check('chooser lists all ten', (() => { const c = composeSymptomChooser('ar'); return ['ألم الأسنان', 'ألم اليد والمعصم', 'الصداع', 'ألم الظهر', 'ألم الحلق', 'السعال'].every((n) => c.includes(n)); })());

check('dizziness detected (ar)', findSymptomGuide('عندي دوخة من الصبح')?.id === 'dizziness');
check('dizzy detected (en)', findSymptomGuide('I feel dizzy when I stand up')?.id === 'dizziness');
check('diarrhoea detected (ar)', findSymptomGuide('عندي إسهال من يومين')?.id === 'diarrhoea-vomiting');
check('vomiting detected (en)', findSymptomGuide('I keep vomiting since yesterday')?.id === 'diarrhoea-vomiting');
check('constipation detected (ar)', findSymptomGuide('عندي إمساك شديد من أسبوع')?.id === 'constipation');
check('constipated detected (en)', findSymptomGuide('I am constipated for days')?.id === 'constipation');
check('heartburn detected (ar)', findSymptomGuide('عندي حرقة بعد الأكل دايماً')?.id === 'heartburn');
check('heartburn detected (en)', findSymptomGuide('I have heartburn every night')?.id === 'heartburn');
check('negated diarrhoea skipped', findSymptomGuide('ما عندي إسهال') === null);
check('negated heartburn skipped', findSymptomGuide('ما عندي حرقة') === null);
check('chooser lists wave-2 guides', (() => { const c = composeSymptomChooser('ar'); return ['الدوخة والدوار', 'الإسهال والقيء', 'الإمساك', 'الحرقة وارتجاع الحمض'].every((n) => c.includes(n)); })());

check('leg swelling detected (ar)', findSymptomGuide('عندي تورم في الساق اليسرى')?.id === 'leg-swelling');
check('swollen ankles detected (en)', findSymptomGuide('my swollen ankles are getting worse')?.id === 'leg-swelling');
check('chooser lists leg swelling', composeSymptomChooser('ar').includes('تورّم الساقين والقدمين'));

check('earache detected (ar)', findSymptomGuide('ابني عنده ألم في الأذن وحرارة')?.id === 'earache');
check('ear pain detected (en)', findSymptomGuide('I have ear pain since yesterday')?.id === 'earache');
check('chooser lists earache', composeSymptomChooser('ar').includes('ألم الأذن'));

check('palpitations detected (ar)', findSymptomGuide('عندي خفقان من الصبح')?.id === 'palpitations');
check('palpitations detected (en)', findSymptomGuide('I keep having palpitations at night')?.id === 'palpitations');
check('chooser lists palpitations', composeSymptomChooser('ar').includes('خفقان القلب'));

check('urinary detected (ar)', findSymptomGuide('عندي حرقة بالبول من يومين')?.id === 'urinary');
check('uti detected (en)', findSymptomGuide('I think I have a uti, burning when peeing')?.id === 'urinary');
check('chooser lists urinary', composeSymptomChooser('ar').includes('حرقة البول والتهاب المسالك البولية'));

check('pins and needles detected (ar)', findSymptomGuide('عندي تنميل باليد اليسرى')?.id === 'pins-and-needles');
check('tingling detected (en)', findSymptomGuide('I have tingling in my fingers')?.id === 'pins-and-needles');
check('chooser lists pins and needles', composeSymptomChooser('ar').includes('التنميل والوخز'));

check('itchy skin detected (ar)', findSymptomGuide('عندي حكة بالجلد من أيام')?.id === 'itchy-skin');
check('rash detected (en)', findSymptomGuide('I have a rash and itching all over')?.id === 'itchy-skin');
check('chooser lists itchy skin', composeSymptomChooser('ar').includes('حكة الجلد والطفح'));

check('tiredness detected (ar)', findSymptomGuide('عندي تعب دائم من أسابيع')?.id === 'tiredness');
check('fatigue detected (en)', findSymptomGuide('I have fatigue all the time')?.id === 'tiredness');
check('chooser lists tiredness', composeSymptomChooser('ar').includes('التعب والإرهاق'));

console.log(`\nTOTAL: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
