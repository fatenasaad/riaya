// Verified general FAQ: question-shaped general questions answered from named
// sources; personal statements never match.
import { GENERAL_FAQ, findGeneralFaq, composeFaqReply } from '../src/utils/generalFaq.ts';

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); }
}

check('diabetes question AR', findGeneralFaq('شو هو مرض السكري؟')?.id === 'diabetes');
check('hypertension question AR hamza-less', findGeneralFaq('شو هو ارتفاع ضغط الدم')?.id === 'hypertension');
check('fever question AR', findGeneralFaq('ليش بتصير الحمى عند الكبار؟')?.id === 'fever');
check('antibiotics question AR', findGeneralFaq('شو بتعمل المضادات الحيوية؟')?.id === 'antibiotics');
check('fasting question AR', findGeneralFaq('ليش الصيام قبل التخدير؟')?.id === 'anaesthesia-fasting');
check('cholesterol question AR', findGeneralFaq('ما هو الكولسترول المرتفع؟')?.id === 'cholesterol');
check('dehydration question AR', findGeneralFaq('شو هي علامات الجفاف؟')?.id === 'dehydration');
check('vaccines question AR', findGeneralFaq('كيف بتشتغل اللقاحات؟')?.id === 'vaccines');
check('paracetamol question AR', findGeneralFaq('شو هو الباراسيتامول ولشو بيستخدم؟')?.id === 'paracetamol');
check('wound care question AR (marker required)', findGeneralFaq('كيف اعتني بجرح صغير بالبيت؟')?.id === 'wound-care');
check('bare topic lookup AR', findGeneralFaq('السكري')?.id === 'diabetes');
check('question EN diabetes', findGeneralFaq('What is diabetes?')?.id === 'diabetes');
check('question EN antibiotics virus point', (composeFaqReply(GENERAL_FAQ.find(e => e.id === 'antibiotics')!, 'en')).includes('do not work for viral'));
check('personal statement NOT matched', findGeneralFaq('أنا مريض سكري وبدي نصيحة عن جرعة دواي') === null);
check('personal fever statement NOT matched', findGeneralFaq('عندي حرارة من الصبح') === null);
check('personal wound statement NOT matched', findGeneralFaq('جرحي عم يوجعني كتير') === null);
check('HbA1c excluded from diabetes FAQ', findGeneralFaq('شو هو السكر التراكمي؟') === null);
check('every entry has url + both answers', GENERAL_FAQ.every(e => e.sourceUrl.startsWith('https://www.nhs.uk') && e.answerAr.length > 100 && e.answerEn.length > 100));
check('reply carries source line AR', composeFaqReply(GENERAL_FAQ[0], 'ar').includes('(المصدر: NHS'));
check('bank has 10 entries', GENERAL_FAQ.length === 10);

console.log(`\nTOTAL: ${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
