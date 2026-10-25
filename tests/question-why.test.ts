// Unit checks for the "why do we ask" family bank.
import { explainQuestion, familyWhy } from '../src/utils/questionWhy.ts';

let passed = 0, failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log('PASS ', name); }
  else { failed++; console.log('FAIL ', name); }
}

// Her live appendectomy set (8 generated questions) — each must map to the
// right family, with red-flag status as designed.
check('Q1 breathing/chest → redFlag', (() => { const w = explainQuestion('هل تعاني من صعوبة في التنفس أو ألم في الصدر؟'); return w?.family === 'breathing-chest' && w.redFlag === true; })());
check('Q2 bleeding → redFlag', (() => { const w = explainQuestion('هل يوجد نزيف مستمر أو متزايد من الجرح؟'); return w?.family === 'bleeding' && w.redFlag === true; })());
check('Q3 plain fever → why, not redFlag', (() => { const w = explainQuestion('هل تشعر بحرارة أو قشعريرة؟'); return w?.family === 'fever' && w.redFlag === false; })());
check('Q3b high fever → redFlag', (() => { const w = explainQuestion('هل حرارتك مرتفعة جداً؟'); return w?.family === 'fever' && w.redFlag === true; })());
check('Q4 leg symptoms → leg family (not pain)', (() => { const w = explainQuestion('هل لاحظت وجود ألم، أو احمرار، أو تورم في إحدى ساقيك؟'); return w?.family === 'leg-clot'; })());
check('Q5 wound → wound family', (() => { const w = explainQuestion('هل تلاحظ زيادة في الاحمرار، أو التورم، أو خروج إفرازات من الجرح؟'); return w?.family === 'wound'; })());
check('Q6 worsening pain → pain family', (() => { const w = explainQuestion('هل يزداد الألم لديك سوءاً؟'); return w?.family === 'pain' && w.redFlag === false; })());
check('Q7 urinary/bowel → family', (() => { const w = explainQuestion('هل أنت غير قادر على التبول، أو إخراج الغازات، أو التبرز؟'); return w?.family === 'urinary-bowel'; })());
check('Q8 intake → family', (() => { const w = explainQuestion('هل تجد صعوبة في شرب السوائل أو الاحتفاظ بالطعام؟'); return w?.family === 'intake-vomiting'; })());
check('mobility question → mobility family', (() => { const w = explainQuestion('هل تمشي خطوات خفيفة في المنزل؟'); return w?.family === 'mobility'; })());
check('unmatched question → null', explainQuestion('هل لون الغرفة مريح لك؟') === null);
check('every family carries an action', ['breathing-chest', 'bleeding', 'fever', 'wound', 'leg-clot', 'urinary-bowel', 'intake-vomiting', 'mobility', 'pain'].every((f) => { const w = familyWhy(f); return !!w && w.actionAr.length > 10 && w.actionEn.length > 10; }));
check('english chest question → redFlag', (() => { const w = explainQuestion('', 'Do you have chest pain or difficulty breathing?'); return w?.family === 'breathing-chest' && w.redFlag === true; })());

console.log(`\nTOTAL: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
