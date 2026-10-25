// Unit tests for the generated-questions parser/validator.
import { parseGeneratedQuestions, buildFollowupQuestionsPrompt } from '../src/utils/generatedQuestions.ts';

let pass = 0, fail = 0;
function check(name: string, cond: boolean) {
  if (cond) { pass++; console.log('PASS ', name); }
  else { fail++; console.log('FAIL ', name); }
}

const WORDS_AR = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر', 'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر'];
const WORDS_EN = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen'];
const q = (n: number) => ({ ar: `هل تشعر بالعرض ${WORDS_AR[n - 1]} اليوم؟`, en: `Do you feel symptom ${WORDS_EN[n - 1]} today?` });

const valid = JSON.stringify({ questions: [q(1), q(2), q(3), q(4), q(5)] });
const parsed = parseGeneratedQuestions(valid);
check('valid JSON parses 5 questions', !!parsed && parsed.length === 5);
check('parsed items keep ar/en', !!parsed && parsed[0].ar.includes('؟') && parsed[0].en.includes('?'));

const fenced = '```json\n' + valid + '\n```';
check('fenced JSON parses', !!parseGeneratedQuestions(fenced));

const prose = 'Here are your questions: ' + valid + ' hope this helps';
check('JSON embedded in prose parses', !!parseGeneratedQuestions(prose));

check('garbage rejected', parseGeneratedQuestions('no json at all') === null);
check('empty rejected', parseGeneratedQuestions('') === null);
check('too few (2) rejected', parseGeneratedQuestions(JSON.stringify({ questions: [q(1), q(2)] })) === null);
check('missing en accepted (ar-only set)', (() => { const p = parseGeneratedQuestions(JSON.stringify({ questions: [q(1), q(2), { ar: 'هل يوجد سؤال ثالث هنا؟' }] })); return !!p && p.length === 3 && p[2].en === ''; })());
check('bare array parses', !!parseGeneratedQuestions(JSON.stringify([q(1), q(2), q(3)])));
check('string items parse', !!parseGeneratedQuestions(JSON.stringify({ questions: ['هل يوجد نزيف من الجرح؟', 'هل لديك حرارة أو قشعريرة؟', 'هل تستطيع المشي قليلاً؟'] })));
check('bare array inside prose parses', !!parseGeneratedQuestions('Here are the questions: ' + JSON.stringify([q(1), q(2), q(3)]) + ' — done'));
check('question-key objects parse', !!parseGeneratedQuestions(JSON.stringify({ questions: [{ question: 'هل يوجد نزيف من الجرح؟' }, { question: 'هل لديك حرارة؟' }, { question: 'هل تشرب سوائل كافية؟' }] })));
check('non-question text filtered', parseGeneratedQuestions(JSON.stringify({ questions: [q(1), q(2), q(3), { ar: 'هذا تصريح وليس سؤال أبداً', en: 'This is a statement not a question' }] }))?.length === 3);
const dup = parseGeneratedQuestions(JSON.stringify({ questions: [q(1), q(1), q(2), q(3)] }));
check('duplicates deduped', !!dup && dup.length === 3);
const many = parseGeneratedQuestions(JSON.stringify({ questions: Array.from({ length: 14 }, (_, i) => q(i + 1)) }));
check('caps at 10 questions', !!many && many.length === 10);

const prompt = buildFollowupQuestionsPrompt('استئصال الزائدة');
check('prompt names the operation', prompt.includes('استئصال الزائدة'));
check('prompt forbids severity/advice', prompt.includes('Do NOT give advice') && prompt.includes('severity'));
check('prompt demands JSON only', prompt.includes('"questions"'));

// --- Content screen: numbers/thresholds and treatment phrasing rejected ---
const withDigit = JSON.stringify({ questions: [q(1), q(2), q(3), { ar: 'هل حرارتك أعلى من ٣٨ درجة؟', en: 'Is your temperature above 38 degrees?' }] });
check('question with digits/threshold filtered out', parseGeneratedQuestions(withDigit)?.length === 3);
const withDose = JSON.stringify({ questions: [q(1), q(2), q(3), { ar: 'هل يجب أن تتناول الدواء الآن؟', en: 'Should you take the medicine now?' }] });
check('question with treatment instruction filtered out', parseGeneratedQuestions(withDose)?.length === 3);
const allBad = JSON.stringify({ questions: [
  { ar: 'هل حرارتك أعلى من ٣٨ درجة؟', en: 'Is your temperature above 38?' },
  { ar: 'هل يجب عليك تناول جرعة إضافية؟', en: 'Should you take an extra dose?' },
  { ar: 'هل توقفت عن تناول الدواء؟', en: 'Did you stop taking the medicine?' },
] });
check('all screened out → null (prose fallback)', parseGeneratedQuestions(allBad) === null);

console.log(`\nTOTAL: ${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
