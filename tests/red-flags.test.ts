/**
 * Red-flag detection battery — v8 fix release, suite 2.
 * Run: npx tsx tests/red-flags.test.ts
 *
 * Written BEFORE the v8 phrase-list fix, against the unmodified detector,
 * to record which cases failed; the minimal list additions that followed
 * were justified only by those failures. This file is now the permanent
 * regression battery for detectRedFlags().
 *
 * Design intent (documented in src/utils/redFlags.ts and pinned here):
 * phrase matching, not clinical reasoning; it errs toward escalation when
 * a symptom phrase is present and NOT negated. A past/resolved mention
 * therefore still escalates — that is deliberate conservative design, not
 * a bug, and case 4 pins it.
 */
import { detectRedFlags } from '../src/utils/redFlags.ts';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, text: string, expectedUrgent: boolean) {
  const r = detectRedFlags(text);
  if (r.isUrgent === expectedUrgent) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    failures.push(`${name}: expected urgent=${expectedUrgent}, got ${r.isUrgent} (reason: "${r.reason}") for «${text}»`);
    console.log(`FAIL  ${name}: expected urgent=${expectedUrgent}, got ${r.isUrgent} for «${text}»`);
  }
}

// --- Compound phrases & negation scope -----------------------------------
// The negated chest pain must NOT cancel the (separately stated) severe
// breathlessness in the same sentence.
check('compound: negated chest pain + severe breathlessness → urgent',
  'ما عندي ألم بالصدر، لكن عندي ضيق نفس شديد', true);

// A negation INSIDE the flag phrase itself does not cancel the match.
check('negation inside phrase: «لا أستطيع التنفس» → urgent',
  'لا أستطيع التنفس', true);

// A plainly negated single symptom is not urgent.
check('plain negation: «ما عندي ألم بالصدر» → not urgent',
  'ما عندي ألم بالصدر', false);

// Past/resolved mention still escalates — BY DESIGN (conservative
// escalation, documented in the module header). Pinned, not a defect.
check('past/resolved chest pain → urgent (pinned by design)',
  'كان عندي ألم بالصدر، لكنه اختفى', true);

// --- Direct flags ---------------------------------------------------------
check('plain chest pain (في الصدر) → urgent', 'عندي ألم في الصدر', true);
check('hamza-less spelling (الم) → urgent', 'عندي الم في الصدر', true);
check('english: "I can\'t breathe" → urgent', "I can't breathe", true);
check('english negated: "I don\'t have severe chest pain" → not urgent',
  "I don't have severe chest pain", false);

// --- Levantine dialect variants (already listed) --------------------------
check('levantine: «نفسي مو عم يكفيني» → urgent', 'نفسي مو عم يكفيني', true);
check('levantine: «صدري مضغوط» → urgent', 'صدري مضغوط', true);
check('levantine: «رح يغمى علي» → urgent', 'حاسس إني رح يغمى علي', true);
check('levantine: «نفس ضيق» → urgent', 'حاسس بنفس ضيق من الصبح', true);
check('levantine: «خفقان شديد» → urgent', 'عندي خفقان شديد', true);

// --- Wound + fever combination ---------------------------------------------
check('wound+fever AR → urgent', 'عندي حرارة وصديد بيطلع من الجرح', true);
check('wound+fever EN → urgent',
  'I have a fever and there is pus coming from my wound', true);
check('wound alone, no infection signs → not urgent',
  'الجرح عم يوجعني شوي', false);
check('fever alone, no wound → not urgent', 'عندي حرارة', false);

console.log(`\nTOTAL: ${passed} passed, ${failed} failed`);
if (failures.length) {
  console.log('FAILURES:');
  for (const f of failures) console.log('  - ' + f);
  process.exit(1);
}
