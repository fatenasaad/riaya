// Red-flag detection for urgent symptoms — pure function, no dependencies.
import { normalizeArabic } from './arabicText.ts';
// LIMITS (stated honestly, not hidden): this is phrase matching, not clinical
// reasoning. It errs toward escalation when a symptom phrase is present and
// NOT negated. Negation and dialect handling below are deliberately narrow:
// only the patterns listed here are handled; anything ambiguous still flows
// to the model with the urgent instruction, it is never silently dismissed.

const NEGATION_MARKERS_AR = ['لا ', 'ليس ', 'مو ', 'ما ', 'مافي ', 'بدون ', 'من غير '];
const NEGATION_MARKERS_EN = ['not ', "n't ", 'no ', 'never ', 'without ', 'denies ', 'denying '];

// Returns the index of an UNNEGATED occurrence of `phrase`, or -1.
// A match is treated as negated when a negation marker ends within the 14
// characters immediately before it (e.g. "لا أعاني من ألم في الصدر",
// "I don't have severe chest pain"). A negation INSIDE the phrase itself
// (e.g. "لا أستطيع التنفس") does not cancel the match.
function findUnnegated(text: string, phrase: string, markers: string[]): number {
  const lower = text.toLowerCase();
  const needle = phrase.toLowerCase();
  let from = 0;
  while (true) {
    const idx = lower.indexOf(needle, from);
    if (idx === -1) return -1;
    const before = lower.slice(Math.max(0, idx - 14), idx);
    const negated = markers.some((m) => before.includes(m));
    if (!negated) return idx;
    from = idx + needle.length;
  }
}

const EN_FLAGS = [
  'cannot breathe', "can't breathe", 'difficulty breathing', 'shortness of breath',
  'severe chest pain', 'crushing chest pain', 'chest pressure', 'heart attack',
  'neck swelling', 'throat closing', 'swollen neck',
  'severe bleeding', 'uncontrolled bleeding', 'coughing blood',
  'sudden weakness', 'facial droop', 'face drooping', 'arm weakness', 'stroke',
  'passed out', 'unconscious', 'fainted', 'loss of consciousness', 'confused suddenly',
];

const AR_FLAGS = [
  'صعوبة في التنفس', 'ضيق تنفس شديد', 'ضيق نفس شديد', 'لا أستطيع التنفس', 'اختناق',
  'ألم شديد في الصدر', 'ألم في الصدر', 'ألم شديد بالصدر', 'ألم بالصدر', 'ضغط على الصدر', 'ذبحة',
  'تورم سريع في الرقبة', 'انتفاخ الرقبة', 'انسداد الحلق',
  'نزيف حاد', 'نزيف مستمر', 'سعال دم', 'تقيؤ دم',
  'ضعف مفاجئ', 'شلل في الوجه', 'ثقل في اللسان', 'جلطة',
  'فقدان الوعي', 'أغمي علي', 'إغماء', 'تشوش ذهني مفاجئ',
  // Levantine dialect variants (same urgency, local wording)
  'نفسي مو عم يكفيني', 'نفس ضيق', 'صدري مضغوط', 'رح يغمى علي',
  'دوخة شديدة', 'خفقان شديد',
];

const WOUND_TERMS_AR = ['جرح', 'العملية', 'القيصرية'];
const FEVER_TERMS_AR = ['حرارة', 'سخونة', 'حمى', 'صديد', 'قيح', 'يوجعني أكتر', 'يزداد ألم', 'التهاب الجرح'];
const WOUND_TERMS_EN = ['wound', 'incision', 'c-section', 'cesarean'];
const FEVER_TERMS_EN = ['fever', 'worsening pain', 'pus', 'discharge', 'redness spreading'];

// Arabic matching runs on normalized text (hamza-less spellings like
// «الم» for «ألم» must match): phrases and markers are normalized once here,
// and the original phrase is kept for the user-facing reason string.
const AR_FLAGS_NORM: Array<{ orig: string; norm: string }> = AR_FLAGS.map((f) => ({ orig: f, norm: normalizeArabic(f) }));
const NEGATION_MARKERS_AR_NORM = NEGATION_MARKERS_AR.map((m) => normalizeArabic(m));
const WOUND_TERMS_AR_NORM = WOUND_TERMS_AR.map((w) => normalizeArabic(w));
const FEVER_TERMS_AR_NORM = FEVER_TERMS_AR.map((w) => normalizeArabic(w));

export function detectRedFlags(text: string): { isUrgent: boolean; reason: string } {
  const normText = normalizeArabic(text);
  const hasUnnegatedAr = (normPhrase: string) => findUnnegated(normText, normPhrase, NEGATION_MARKERS_AR_NORM) !== -1;
  const hasUnnegatedEn = (phrase: string) => findUnnegated(text, phrase, NEGATION_MARKERS_EN) !== -1;

  const woundAr = WOUND_TERMS_AR_NORM.some(hasUnnegatedAr);
  const feverAr = FEVER_TERMS_AR_NORM.some(hasUnnegatedAr);
  if (woundAr && feverAr) {
    return { isUrgent: true, reason: 'ازدياد ألم الجرح الجراحي مع وجود حمى (اشتباه التهاب جرح جراحي)' };
  }

  const woundEn = WOUND_TERMS_EN.some(hasUnnegatedEn);
  const feverEn = FEVER_TERMS_EN.some(hasUnnegatedEn);
  if (woundEn && feverEn) {
    return { isUrgent: true, reason: 'Worsening surgical wound pain accompanied by fever' };
  }

  for (const flag of EN_FLAGS) {
    if (findUnnegated(text, flag, NEGATION_MARKERS_EN) !== -1) {
      return { isUrgent: true, reason: flag };
    }
  }

  for (const { orig, norm } of AR_FLAGS_NORM) {
    if (findUnnegated(normText, norm, NEGATION_MARKERS_AR_NORM) !== -1) {
      return { isUrgent: true, reason: orig };
    }
  }

  return { isUrgent: false, reason: '' };
}
