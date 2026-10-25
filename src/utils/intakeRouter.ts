import type { JourneyStage, SurgeryType } from '../types';
import { normalizeArabic } from './arabicText.ts';

export interface IntakeRoute {
  phase: JourneyStage;
  afterView?: 'general' | 'personal' | 'meds';
  surgeryType?: SurgeryType;
}

// Deterministic, conservative intake routing for the welcome page.
// It routes ONLY clear first-person statements about the user's OWN procedure
// ("I had a catheterization", "عملت قثطرة"). Definition / explanation
// questions ("what is a catheterization?", "شو هي القثطرة؟") never route —
// the user is asking for information, not reporting their own case.
// When in doubt, it returns null and the conversation simply stays in chat.
export function detectIntakeRoute(text: string): IntakeRoute | null {
  const t = (text || '').trim();
  if (!t) return null;
  const lower = t.toLowerCase();
  const nt = normalizeArabic(t);
  const incAr = (haystack: string, needle: string) => haystack.includes(normalizeArabic(needle));

  // 1) Question forms ask for information — they route only if the same
  //    message ALSO clearly reports the user's own procedure.
  const questionForms = [
    'شو هي', 'شو هو', 'شو يعني', 'ما هي', 'ما هو', 'شو أسباب', 'شو اسباب',
    'ليش', 'كيف تتم', 'كيف تصير', 'شو الفرق',
    'what is', 'what does', 'why is', 'how is', 'what are the causes',
  ];
  const isQuestionForm = questionForms.some((p) => incAr(nt, p) || lower.includes(p));

  // 2) First-person markers: the user reporting their own procedure.
  const ownPastAr = ['عملت', 'أجريت', 'اجريت', 'خضعت', 'سويت', 'عملولي', 'أجريت لي', 'اجريت لي', 'عملتلي'];
  const ownPlannedAr = ['عندي عملية', 'عندي قثطرة', 'عندي قسطره', 'رح أعمل', 'رح اعمل', 'بدي أعمل', 'بدي اعمل', 'مقرر لي', 'مقررة لي'];
  const ownPastEn = ['i had', 'i underwent', 'i just had'];
  const ownPlannedEn = ['my surgery', 'my operation', "i'm having", 'i am having', 'i have surgery', 'scheduled for surgery', 'scheduled for a'];
  const hasOwnPast = ownPastAr.some((p) => incAr(nt, p)) || ownPastEn.some((p) => lower.includes(p));
  const hasOwnPlanned = ownPlannedAr.some((p) => incAr(nt, p)) || ownPlannedEn.some((p) => lower.includes(p));

  if (!hasOwnPast && !hasOwnPlanned) return null;
  if (isQuestionForm && !hasOwnPast && !hasOwnPlanned) return null;

  // 3) Which procedure does the message name?
  let surgeryType: SurgeryType | undefined;
  if (incAr(nt, 'قثطرة') || incAr(nt, 'قسطرة') || lower.includes('catheter') || lower.includes('angiogram') || lower.includes('angioplasty')) {
    surgeryType = 'catheter';
  } else if (incAr(nt, 'غدة') || lower.includes('thyroid')) {
    surgeryType = 'thyroid';
  } else if (incAr(nt, 'قيصرية') || incAr(nt, 'قيصري') || lower.includes('cesarean') || lower.includes('c-section')) {
    surgeryType = 'cesarean';
  } else if (incAr(nt, 'مرارة') || lower.includes('gallbladder') || lower.includes('cholecystectomy')) {
    surgeryType = 'gallbladder';
  }

  const mentionsProcedure =
    surgeryType !== undefined ||
    incAr(nt, 'عملية') || incAr(nt, 'عمليتي') || incAr(nt, 'عملتي') ||
    lower.includes('surgery') || lower.includes('operation') || lower.includes('procedure');
  if (!mentionsProcedure) return null;

  // 4) A procedure already done → recovery follow-up; one coming up → preparation.
  if (hasOwnPast) {
    return { phase: 'after', afterView: 'personal', surgeryType };
  }
  return { phase: 'before', surgeryType };
}
