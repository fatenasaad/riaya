import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
// Red-flag detection: pure, tested module (no LLM in this path).
import { detectRedFlags } from './src/utils/redFlags.ts';
import { buildFollowupQuestionsPrompt, parseGeneratedQuestions, type GeneratedQuestion } from './src/utils/generatedQuestions.ts';
import { LAB_ENTRIES, findLabInText, findUncoveredLab, hasLabIntent, isDefinitionQuestion, extractValue, toCanonical, compareBand, detectVariantOrSex, type LabHit } from './src/utils/labReference.ts';
import { findSymptomGuide, hasSymptomIntent, composeSymptomGuide, composeSymptomChooser } from './src/utils/symptomGuides.ts';
import { findGeneralFaq, composeFaqReply } from './src/utils/generalFaq.ts';
import { normalizeArabic } from './src/utils/arabicText.ts';
// H-MEM long-term memory (v9 sponsor layer; wraps the model chat path only).
import { retrieveChatMemory, recordUserMessage, recordModelResponse } from './src/server/hmemChatMemory.ts';
// Meterless Nightshift provider (v9 sponsor layer, Power): selectable via
// LLM_PROVIDER=meterless; Gemini stays the default. See meterlessProvider.ts
// for the contract, the URL-join decision and the error-honesty rule.
import {
  getLlmProvider,
  getMeterlessConfig,
  meterlessChatComplete,
  meterlessChatStream,
  meterlessDiscoverModels,
  type MeterlessConfig,
} from './src/server/meterlessProvider.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client securely on server
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Chat-path LLM provider selection (v9 sponsor layer). Gemini is the
// default and its code paths below are unchanged. When Meterless is
// selected it becomes the chat path's provider: model availability is then
// judged by the Meterless configuration alone, and a Meterless failure is
// reported as AI_SERVICE_UNAVAILABLE — Gemini is never silently substituted.
const llmProvider = getLlmProvider();
const meterlessConfig: MeterlessConfig | null = llmProvider === 'meterless' ? getMeterlessConfig() : null;
if (llmProvider === 'meterless') {
  console.log(
    meterlessConfig
      ? `[meterless] chat provider: Meterless Runtime at ${meterlessConfig.baseUrl} (model/routing: ${meterlessConfig.model})`
      : '[meterless] LLM_PROVIDER=meterless but METERLESS_BASE_URL / METERLESS_RUNTIME_TOKEN are not both set — chat model service unavailable',
  );
}

/** Is the SELECTED chat provider usable? (Gemini: key present. Meterless: configured.) */
function modelServiceAvailable(): boolean {
  return llmProvider === 'meterless' ? !!meterlessConfig : !!ai;
}

// Safe in-memory response cache for repeat identical questions
const responseCache = new Map<string, { reply: string; isUrgent: boolean; urgentReason: string; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

const SYSTEM_INSTRUCTION = `You are Riaya (رعاية in Arabic, Riaya in English), a compassionate, highly professional patient-education companion. You are not a doctor and cannot replace a qualified healthcare professional.
Branding:
- In Arabic: your name is strictly "رعاية".
- In English: your name is strictly "Riaya".
- Never combine them as "Riaya — رعاية".

Core Rules:
1. Reply directly and clearly in the language of the patient's message (Arabic if Arabic, English if English).
2. Answer the patient's actual question first in simple, supportive, plain language. Explain any necessary medical terms.
3. Provide helpful general health education instead of generic refusal when it is safe to answer.
4. Do NOT make a definitive diagnosis, prescribe personal treatments, calculate personal doses, or create personalized clinical plans.
5. When asked about medications:
   - Explain common over-the-counter or standard options and their general clinical safety profiles when supported by authoritative sources (e.g., Paracetamol and Ibuprofen for post-cesarean pain during breastfeeding).
   - Clarify safety in specific contexts (such as breastfeeding or pregnancy) and mention key contraindications (such as stomach ulcers or kidney issues for NSAIDs).
   - Clearly state when the patient must consult their physician, midwife, or pharmacist before taking or combining medicines.
   - Do not substitute generic disclaimers for the actual educational explanation.
6. Post-Operative & Procedure Recovery (such as Caesarean Section):
   - Explain general recovery expectations (e.g., mobility timeline, pain reduction over weeks, lochia/bleeding duration, wound healing).
   - Offer safe, practical recovery guidance (e.g., hydration, gentle ambulation, resting, wound hygiene).
   - Clearly detail danger signs requiring urgent medical assessment (e.g., fever, worsening wound pain, wound discharge/pus, spreading redness, heavy bleeding with large clots, severe headache/vision changes, unilateral calf swelling/pain, sudden breathlessness).
   - Distinguish between symptoms needing routine clinical review vs. urgent/emergency assessment.
7. CRITICAL SAFETY RULE FOR URGENT / DANGER SYMPTOMS:
   - If the patient mentions danger signs (e.g., surgical wound pain increasing accompanied by fever, severe breathlessness, crushing chest pain, heavy bleeding, sudden weakness):
     YOU MUST START YOUR RESPONSE DIRECTLY WITH CLEAR, URGENT MEDICAL GUIDANCE (e.g. advising immediate clinical assessment by their surgical/maternity team or emergency department) BEFORE ANY GENERAL ADVICE, HOME TIPS, OR RECOVERY EXPLANATIONS.
   - Do NOT delay urgent guidance with clarifying questions or generic education.
9. Sources & Citations:
   - Use ONLY the following pre-defined verified official sources when directly relevant:
     * NICE Official Guideline on Caesarean birth (National Institute for Health and Care Excellence):
       https://www.nice.org.uk/guidance/NG192/chapter/recommendations
     * NHS Official Guidance on medicines and breastfeeding (National Health Service):
       https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-and-lifestyle/medicines/
     * NHS Official Guidance on recovery after surgery — "Having an operation (surgery): Getting back to normal" (wound care, washing, blood-clot warning signs, activity):
       https://www.nhs.uk/tests-and-treatments/having-surgery/recovery/
     * USPSTF recommendations for preventive screening (Colorectal 2021, Breast 2024, Diabetes 2021, Hypertension 2021, Lung 2021).
   - Never generate or invent new URLs from memory.
   - Show direct links ONLY when available and specifically relevant to the question.
   - When no suitable verified source from this pre-defined list applies, your ENTIRE reply must be ONLY the following sentence (plus, in the same language, one short line pointing to the Verified Guides section in the Screening Gateway) — never combine it with a substantive medical answer, medication instructions, or recovery guidance. Exception: "I had an operation" follow-up requests are governed by Rule 10, not by this fallback:
     Arabic: "لم يتم العثور على مصدر طبي موثوق ومباشر لهذا السؤال."
     English: "A suitable, direct verified medical source was not found for this question."
   - Do not display unrelated links.
10. Other operations follow-up bridge (THIS RULE OVERRIDES Rule 9 for these requests):
   When the user says they had an operation (any operation) and asks for its follow-up questions, you MUST answer — never reply with the no-source sentence to a bridge request. Build the monitoring questions ONLY from the general post-operative principles in the verified NHS recovery-after-surgery guidance (wound/access-site care and infection signs, bleeding, fever, pain trend, blood-clot warning signs in the leg, breathing, gradual activity, washing) — plus NICE NG192 when the operation is a caesarean. Apply those general principles to the named procedure's plain context (for example, a catheter procedure has an access site at the wrist or groin to watch for bleeding or swelling) without inventing operation-specific clinical facts, thresholds, or timelines for an operation you have no verified source for. Always close by telling the user these are general guidelines that do not replace their surgical team's instructions, and include the NHS recovery link.
11. Synthetic discharge context:
   A fictional demonstration patient, Mahmoud (68yo, 9-day stay, chest infection, Amoxicillin, Paracetamol, Omeprazole, Salbutamol), exists ONLY as a labelled example inside the Journey tab. NEVER assume the person writing to you is Mahmoud, never address them by his name, and never present his medications, history, or condition as theirs. Discuss him only when the user explicitly asks about the demonstration/example patient, and always frame him as a synthetic example.`;

// Safety keyword checker for clinical red-flags
// --- Verified-source coverage gate -------------------------------------
// Locked rule (Faten): a medical question with no matching verified source
// receives ONLY the no-source reply — never a free-form detailed answer.
const VERIFIED_TOPICS: RegExp[] = [
  /قيصرية|caesarean|cesarean|c-?section/i,
  /رضاعة|breast ?feed|lactation/i,
  /فحص|مسح وقائي|screening|colon|colorectal|قولون|mammogram|سرطان الثدي|breast cancer|سكري|diabetes|hba1c|ضغط الدم|hypertension|blood pressure|سرطان الرئة|lung cancer/i,
];
const MEDICAL_HINTS = /ألم|وجع|تورم|انتفاخ|حرارة|حمى|دواء|أدوية|علاج|عملية|جرح|نزيف|قلب|صدر|تنفس|التهاب|عدوى|حمل|ولادة|رضيع|بخاخ|جرعة|مضاعفات|أعراض|تشخيص|تحليل|أشعة|قثطرة|منظار|تعافي|دكتور|طبيب|مستشفى|pain|fever|medication|medicine|drug|dose|surgery|operation|wound|bleed|chest|breath|infection|pregnan|birth|baby|inhaler|complication|symptom|diagnos|catheter|procedure|hospital|doctor|recovery/i;

// Gate matching runs on normalized text (hamza-less spellings like «الم»
// must be caught exactly like «ألم»); the patterns are normalized once here
// so both sides share one spelling. Latin text is unaffected.
const VERIFIED_TOPICS_NORM = VERIFIED_TOPICS.map((re) => new RegExp(normalizeArabic(re.source), 'i'));
const MEDICAL_HINTS_NORM = new RegExp(normalizeArabic(MEDICAL_HINTS.source), 'i');

function isBridgePrompt(text: string): boolean {
  const t = text.trim();
  return t.startsWith('أجريت عملية') || normalizeArabic(t).startsWith('اجريت عمليه') || /^I had an operation/i.test(t);
}
function hasVerifiedCoverage(text: string): boolean {
  const norm = normalizeArabic(text);
  return VERIFIED_TOPICS_NORM.some((re) => re.test(norm));
}
function shouldGateToNoSource(message: string, isUrgent: boolean): boolean {
  if (isUrgent) return false; // urgent guidance always flows
  if (isBridgePrompt(message)) return false; // labelled AI bridge flow
  if (hasVerifiedCoverage(message)) return false;
  return MEDICAL_HINTS_NORM.test(normalizeArabic(message));
}
function noSourceReply(language: string): string {
  return language === 'ar'
    ? 'لم يتم العثور على مصدر طبي موثوق ومباشر لهذا السؤال.\n\nيمكنك تصفّح قسم «الأدلة الموثّقة» في بوابة الفحوص، ولأي أمر شخصي يتعلّق بحالتك أو أدويتك تواصل مع فريقك الطبي.'
    : 'A suitable, direct verified medical source was not found for this question.\n\nYou can browse the Verified Guides section in the Screening Gateway, and for anything personal about your condition or medications, please contact your medical team.';
}
function bridgeLabel(language: string): string {
  return language === 'ar'
    ? 'هذه إرشادات متابعة عامة مبنية على مصادر طبية موثّقة للتعافي بعد العمليات — وهي لا تغني عن سؤال فريقك الطبي، فاسأله دائماً عن كل ما يخصّ عمليتك تحديداً.\n\n'
    : 'These general follow-up guidelines are based on verified medical sources on recovery after surgery — they do not replace asking your medical team, so always ask them about anything specific to your operation.\n\n';
}

// --- Lab result explanation (deterministic, verified reference module) ----
// The app asks what it needs instead of refusing, places a reported value
// inside the published GENERAL band for that test, explains the test and
// general reasons for high/low values, and always defers diagnosis to the
// treating doctor. No model call is involved.
function labCoveredList(language: string): string {
  return LAB_ENTRIES.map((e) => (language === 'ar' ? e.nameAr : e.nameEn)).join('، ');
}

function composeLabExplanation(hit: LabHit, rawValue: number, language: string, sourceText: string): string {
  const ar = language === 'ar';
  const entry = hit.entry;
  const conv = toCanonical(entry, rawValue, sourceText);
  const canonical = conv.value;
  const shownRaw = rawValue;
  const sets = hit.sexAmbiguous
    ? entry.bandSets
    : entry.bandSets.filter((s) => s.key === hit.bandSetKey);
  const lines: string[] = [];
  lines.push(ar ? `تحليل ${entry.nameAr}` : `${entry.nameEn}`);
  lines.push(ar ? entry.measuresAr : entry.measuresEn);
  lines.push('');
  for (const set of sets) {
    const band = compareBand(set, canonical);
    const bandLabel = ar ? band.labelAr : band.labelEn;
    const convNote = conv.assumedUnit && conv.assumedUnit !== entry.canonicalUnit
      ? (ar ? ` (حوّلتها من ${conv.assumedUnit}: تساوي ${Math.round(canonical * 10) / 10} ${entry.canonicalUnit})` : ` (converted from ${conv.assumedUnit}: equals ${Math.round(canonical * 10) / 10} ${entry.canonicalUnit})`)
      : '';
    lines.push(ar
      ? `قيمتك ${shownRaw} ${conv.assumedUnit || entry.canonicalUnit}${convNote} — ${set.labelAr}: ${bandLabel}. ${set.rangeTextAr}.`
      : `Your value ${shownRaw} ${conv.assumedUnit || entry.canonicalUnit}${convNote} — ${set.labelEn}: ${bandLabel}. ${set.rangeTextEn}.`);
    if (band.kind === 'high' || band.kind === 'borderline') lines.push(ar ? entry.highAr : entry.highEn);
    else if (band.kind === 'low') lines.push(ar ? entry.lowAr : entry.lowEn);
    else lines.push(ar
      ? 'كون القيمة ضمن المجال العام مطمئن كمعلومة عامة، لكنه بحد ذاته لا يثبت ولا ينفي أي حالة — تفسيرها الكامل يكون مع أعراضك وباقي نتائجك عند طبيبك.'
      : 'A value inside the general range is reassuring as general information, but by itself it neither proves nor rules out any condition — its full meaning comes with your symptoms and other results, with your doctor.');
  }
  lines.push('');
  lines.push(ar
    ? `ملاحظة مهمة: هذا شرح تثقيفي عام وليس تشخيصاً. المجالات المرجعية تختلف بين المختبرات، والمرجع الأول لنتيجتك هو المجال المطبوع على تقريرك. قيمة واحدة لا تكفي للحكم — خصوصاً مع السكر، فالتشخيص يُبنى عادة على إعادة القياس. إذا كانت عندك أعراض تقلقك أو كانت القيمة بعيدة كثيراً عن المجال، تواصل مع فريقك الطبي دون تأخير. (المصدر: ${entry.sourceName}${entry.sourceUrl ? ' — ' + entry.sourceUrl : ''})`
    : `Important note: this is general education, not a diagnosis. Reference ranges differ between laboratories, and the first reference for your result is the range printed on your own report. One value is not enough to judge — especially for blood sugar, where diagnosis is normally built on repeat testing. If you have worrying symptoms or the value is far outside the range, contact your medical team without delay. (Source: ${entry.sourceName}${entry.sourceUrl ? ' — ' + entry.sourceUrl : ''})`);
  return lines.join('\n');
}

function labReplyIfApplicable(message: string, history: any[], language: string): string | null {
  const ar = language === 'ar';
  // Definition questions without a value stay with the normal flow.
  const currentHit = findLabInText(message);
  if (isDefinitionQuestion(message) && (!currentHit || currentHit.value == null)) return null;

  let hit = currentHit;
  let valueText = message;
  // Cross-message completion: the value (or the test) may be in an earlier
  // user message of this conversation.
  if (!hit || hit.value == null || (hit.entry.id === 'glucose' && !hit.bandSetKey)) {
    const userTexts = (Array.isArray(history) ? history : [])
      .filter((h: any) => h && h.role === 'user' && typeof h.text === 'string')
      .map((h: any) => h.text as string)
      .slice(-6);
    for (let i = userTexts.length - 1; i >= 0; i--) {
      const pastHit = findLabInText(userTexts[i]);
      if (!pastHit) continue;
      if (!hit) { hit = pastHit; valueText = userTexts[i]; break; }
      if (hit.value == null && pastHit.entry.id === hit.entry.id && pastHit.value != null) {
        hit = { ...hit, value: pastHit.value };
        valueText = userTexts[i];
      }
      if (hit.entry.id === 'glucose' && !hit.bandSetKey && pastHit.entry.id === 'glucose' && pastHit.bandSetKey) {
        hit = { ...hit, bandSetKey: pastHit.bandSetKey };
      }
      if (hit.value != null && (hit.entry.id !== 'glucose' || hit.bandSetKey)) break;
    }
    // The current message itself may carry only the value for a test named earlier.
    if (!hit) {
      const v = extractValue(message);
      if (v != null) {
        for (let i = userTexts.length - 1; i >= 0; i--) {
          const pastHit = findLabInText(userTexts[i]);
          if (pastHit) { hit = { ...pastHit, value: v }; valueText = message; break; }
        }
      }
    }
  }

  // A variant/sex answer may arrive as its own short message ("صائم").
  if (hit && hit.entry.id === 'glucose' && !hit.bandSetKey) {
    const k = detectVariantOrSex(hit.entry, message);
    if (k) hit = { ...hit, bandSetKey: k };
  }
  if (hit && hit.sexAmbiguous) {
    const k = detectVariantOrSex(hit.entry, message);
    if (k) hit = { ...hit, bandSetKey: k, sexAmbiguous: false };
  }

  if (hit) {
    if (hit.value == null) {
      // Ask for the missing pieces instead of refusing.
      if (hit.entry.id === 'glucose') {
        return ar
          ? 'تمام — أخبرني بقيمة السكر وبنوع القياس: هل هو سكر صائم (بعد صيام 8 ساعات على الأقل)، أم عشوائي/بعد الأكل، أم تقصد السكر التراكمي (HbA1c)؟ واذكر الوحدة إذا كانت على تقريرك (mg/dL أو mmol/L). بعدها أشرح لك أين تقع القيمة مقارنة بالمجالات العامة المنشورة، مع تنبيه أن التفسير النهائي عند طبيبك.'
          : 'Sure — tell me the blood sugar value and the type of measurement: fasting (after at least 8 hours without food), random/after eating, or do you mean HbA1c? Include the unit from your report if shown (mg/dL or mmol/L). I will then explain where the value sits compared with the published general ranges, noting that final interpretation is with your doctor.';
      }
      const sexNote = hit.sexAmbiguous ? (ar ? ' واذكر إن كانت النتيجة لرجل أم لامرأة لأن المجال العام يختلف بينهما.' : ' And mention whether the result is for a man or a woman, because the general range differs.') : '';
      return ar
        ? `تمام — ما قيمة ${hit.entry.nameAr} على تقريرك؟ اذكر القيمة والوحدة كما هي مكتوبة.${sexNote} بعدها أشرح لك أين تقع مقارنة بالمجال العام المنشور، وماذا يعني هذا التحليل بشكل عام.`
        : `Sure — what is the ${hit.entry.nameEn} value on your report? Give the value and unit exactly as written.${sexNote} I will then explain where it sits compared with the published general range and what this test means in general.`;
    }
    if (hit.entry.id === 'glucose' && !hit.bandSetKey) {
      return ar
        ? `قيمة السكر ${hit.value} — قبل أن أقارنها بالمجالات العامة، أحتاج نوع القياس لأن المجال يختلف: هل هو سكر صائم (بعد صيام 8 ساعات على الأقل) أم عشوائي/بعد الأكل؟ (وإذا كنت تقصد السكر التراكمي HbA1c فأخبرني، فمجاله مختلف تماماً.)`
        : `Blood sugar value ${hit.value} — before comparing it with the general ranges, I need the type of measurement because the ranges differ: was it fasting (after at least 8 hours without food) or random/after eating? (If you meant HbA1c, tell me — its range is completely different.)`;
    }
    return composeLabExplanation(hit, hit.value, language, valueText);
  }

  const uncovered = findUncoveredLab(message);
  if (uncovered && (hasLabIntent(message) || extractValue(message) != null)) {
    return ar
      ? `تحليل ${uncovered.nameAr} ليس بعد ضمن المجموعة المرجعية الموثّقة عندي، فلن أقارن قيمته بمجال من ذاكرتي — المجالات التي أشرحها حالياً هي: ${labCoveredList(language)}. لتفسير نتيجتك، المرجع هو المجال المطبوع على تقريرك وطبيبك المعالج.`
      : `The ${uncovered.nameEn} test is not yet in my verified reference set, so I will not compare its value to a range from memory — the tests I currently explain are: ${labCoveredList(language)}. For your result, the reference is the range printed on your report and your treating doctor.`;
  }

  if (hasLabIntent(message)) {
    return ar
      ? `بكل سرور — عن أي تحليل تريد أن تسأل؟ التحاليل التي أستطيع شرحها ومقارنة قيمها بالمجالات العامة المنشورة هي: ${labCoveredList(language)}. اكتب اسم التحليل وقيمته والوحدة كما هي على تقريرك (وبالنسبة للسكر: هل هو صائم أم عشوائي أم تراكمي)، وسأشرح لك ماذا يقيس التحليل وأين تقع قيمتك مقارنة بالمجال العام، وماذا قد تعني القيم المرتفعة أو المنخفضة بشكل عام — مع بقاء التفسير النهائي والتشخيص عند طبيبك.`
      : `Of course — which test would you like to ask about? The tests I can explain and compare against published general ranges are: ${labCoveredList(language)}. Write the test name, its value, and the unit exactly as on your report (for blood sugar: fasting, random, or HbA1c), and I will explain what the test measures, where your value sits compared with the general range, and what high or low values may mean in general — with final interpretation and diagnosis always with your doctor.`;
  }

  return null;
}


// --- Symptom guides: "what happens at the hospital?" (deterministic) ------
// Leads with the emergency action for the presentation, then explains how
// hospital teams work through cause categories (dangerous first), which
// tests they order and why, and what each procedure gives the team. Never a
// personal differential or diagnosis.
// Urgency semantics (v8): a matched symptom guide is NOT urgent by itself.
// The guide text still leads with its own emergency line, but the urgent
// flag — and the client's urgent treatment — is reserved for messages the
// red-flag safety check actually fires on. The endpoints pass their already
// computed safetyCheck in, so both layers always agree.
function symptomReplyIfApplicable(message: string, language: string, safety: { isUrgent: boolean; reason: string }): { text: string; urgent: boolean; reason: string } | null {
  const guide = findSymptomGuide(message);
  if (guide) return { text: composeSymptomGuide(guide, language), urgent: safety.isUrgent, reason: safety.isUrgent ? safety.reason : '' };
  if (isDefinitionQuestion(message)) return null;
  if (hasSymptomIntent(message)) return { text: composeSymptomChooser(language), urgent: false, reason: '' };
  return null;
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], stage = 'before', language = 'ar' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const safetyCheck = detectRedFlags(message);

    // Symptom guide flow (deterministic; the guide itself leads with the
    // emergency action for the presentation).
    const symptomReply = symptomReplyIfApplicable(message, language, safetyCheck);
    if (symptomReply) {
      return res.json({ reply: symptomReply.text, isUrgent: symptomReply.urgent, urgentReason: symptomReply.reason });
    }

    // Lab result explanation: deterministic verified-reference flow. It asks
    // for missing pieces instead of refusing, and works without the model.
    if (!safetyCheck.isUrgent) {
      const labReply = labReplyIfApplicable(message, history, language);
      if (labReply) {
        return res.json({ reply: labReply, isUrgent: false, urgentReason: '' });
      }
    }

    // Verified general FAQ bank: question-shaped general questions answered
    // deterministically from named sources; personal statements never match.
    if (!safetyCheck.isUrgent) {
      const faqEntry = findGeneralFaq(message);
      if (faqEntry) {
        return res.json({ reply: composeFaqReply(faqEntry, language), isUrgent: false, urgentReason: '' });
      }
    }

    // H-MEM (v9): retrieve this conversation's long-term memory and mine the
    // user's turn BEFORE the model-availability check, so memory is recorded
    // and reported even when the model is down. The deterministic routes
    // above never reach this code; memory wraps the model path only.
    const chatId = typeof (req.body as any)?.chatId === 'string' && req.body.chatId.trim()
      ? req.body.chatId.trim().slice(0, 80)
      : 'riaya-web';
    const chatMemory = await retrieveChatMemory(chatId, message);
    await recordUserMessage(chatId, message);
    const memoryMeta = {
      retrieved: chatMemory?.memories.length ?? 0,
      injected: false,
      memories: chatMemory?.memories ?? [],
      strategy: chatMemory?.strategy ?? null,
    };

    if (!modelServiceAvailable()) {
      // Model service unavailable / selected provider not configured
      return res.status(503).json({
        error: 'AI_SERVICE_UNAVAILABLE',
        memory: memoryMeta,
        isUrgent: safetyCheck.isUrgent,
        reason: safetyCheck.reason,
        message: language === 'ar'
          ? 'خدمة الذكاء الاصطناعي غير متوفرة حالياً. يمكنك تصفح قسم الأدلة الموثّقة في بوابة الفحوص.'
          : 'The AI service is currently unavailable. Please refer to the Verified Guides section in the Screening Gateway.'
      });
    }

    // Verified-source gate: medical question with no matching verified
    // source gets ONLY the no-source reply (locked rule).
    if (shouldGateToNoSource(message, safetyCheck.isUrgent)) {
      return res.json({
        reply: noSourceReply(language),
        isUrgent: false,
        urgentReason: '',
      });
    }

    // Prepare contents array for Gemini
    // We provide conversation history as alternating user / model parts
    const contents: any[] = [];

    // Add stage context to the prompt if relevant
    // Check cache for identical message, stage and language
    // Cache key MUST include the conversation history actually sent to the
    // model: the same question after new context is a different question.
    const historyKey = JSON.stringify(history.slice(-12));
    let historyHash = 0;
    for (let i = 0; i < historyKey.length; i++) {
      historyHash = (historyHash * 31 + historyKey.charCodeAt(i)) | 0;
    }
    const cacheKey = `${language}:${stage}:${historyHash}:${message.trim().toLowerCase()}`;
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return res.json({
        reply: cached.reply,
        isUrgent: cached.isUrgent,
        urgentReason: cached.urgentReason,
        cached: true,
        memory: memoryMeta,
      });
    }

    let stageContext = '';
    if (stage === 'before') {
      stageContext = '[Current patient journey stage: Before hospital admission or planned procedure / قبل دخول المستشفى]';
    } else if (stage === 'during') {
      stageContext = '[Current patient journey stage: During hospital stay / أثناء الإقامة في المستشفى]';
    } else if (stage === 'after') {
      stageContext = '[Current patient journey stage: After discharge and recovering at home / بعد الخروج والتعافي في المنزل]';
    }

    // Convert client history — capped to the most recent turns so long
    // conversations do not slow every new answer down.
    for (const h of history.slice(-12)) {
      if (h.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: h.text }] });
      } else if (h.role === 'model' || h.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: h.text }] });
      }
    }

    // Add current user message with stage annotation. When H-MEM retrieved
    // grounded memories, the engine's own reinjection block goes between the
    // stage context and the user's message.
    const memoryBlock = chatMemory && chatMemory.memories.length ? `${chatMemory.context}\n` : '';
    const fullUserPrompt = `${stageContext}\n${memoryBlock}${message}`;
    contents.push({ role: 'user', parts: [{ text: fullUserPrompt }] });

    let modelText: string;
    if (meterlessConfig) {
      // Meterless Nightshift is the selected provider: the same contents
      // (system instruction, history, stage context, H-MEM reinjection)
      // go to the Runtime. ANY failure is reported as the app's standard
      // AI_SERVICE_UNAVAILABLE — never a fabricated answer, never a
      // silent substitution of Gemini while Meterless is claimed.
      try {
        modelText = await meterlessChatComplete(meterlessConfig, SYSTEM_INSTRUCTION, contents);
      } catch (meterlessErr: any) {
        console.error('Meterless chat error:', meterlessErr?.message);
        return res.status(503).json({
          error: 'AI_SERVICE_UNAVAILABLE',
          memory: memoryMeta,
          isUrgent: safetyCheck.isUrgent,
          reason: safetyCheck.reason,
          message: language === 'ar'
            ? 'خدمة الذكاء الاصطناعي غير متوفرة حالياً. يمكنك تصفح قسم الأدلة الموثّقة في بوابة الفحوص.'
            : 'The AI service is currently unavailable. Please refer to the Verified Guides section in the Screening Gateway.'
        });
      }
    } else {
      // Gemini path (default): modelServiceAvailable() above guarantees
      // the client exists here; the guard only satisfies the type checker.
      if (!ai) throw new Error('Gemini client unavailable on the Gemini provider path');
      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
            maxOutputTokens: 900, // low temperature for clinical safety & factual grounding
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });
      } catch (primaryErr: any) {
        console.warn('Primary model error, attempting fallback to gemini-3.1-flash-lite:', primaryErr?.message);
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
            maxOutputTokens: 900,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });
      }
      modelText = response.text || '';
    }

    const rawReply = modelText || (language === 'ar' ? 'عذراً، لم أتمكن من معالجة الرد.' : 'Sorry, could not generate a response.');
    const replyText = isBridgePrompt(message) ? bridgeLabel(language) + rawReply : rawReply;

    // H-MEM episodic write: mine the model's response as an interaction
    // event in the same conversation scope.
    await recordModelResponse(chatId, replyText);

    // Save to cache
    responseCache.set(cacheKey, {
      reply: replyText,
      isUrgent: safetyCheck.isUrgent,
      urgentReason: safetyCheck.reason,
      timestamp: Date.now(),
    });

    return res.json({
      reply: replyText,
      text: replyText,
      isUrgent: safetyCheck.isUrgent,
      urgentReason: safetyCheck.reason,
      memory: { ...memoryMeta, injected: !!memoryBlock },
    });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    return res.status(500).json({
      error: 'GEMINI_ERROR',
      details: 'Server error',
      isUrgent: false
    });
  }
});

// Streaming endpoint for progressive real-time response rendering
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, history = [], stage = 'before', language = 'ar' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const safetyCheck = detectRedFlags(message);

    // Deterministic replies run BEFORE the model-availability check —
    // mirroring /api/chat (v8 fix). These flows never call the model, so a
    // Gemini outage must not take the verified guides, lab explanations or
    // FAQ bank down with it. SSE headers are set only once a reply is
    // actually streamed, so the 503 below still goes out as plain JSON.
    const beginSse = () => {
      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
    };

    // Symptom guide flow (deterministic; leads with the emergency action).
    const symptomReply = symptomReplyIfApplicable(message, language, safetyCheck);
    if (symptomReply) {
      beginSse();
      res.write(`data: ${JSON.stringify({ text: symptomReply.text })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, isUrgent: symptomReply.urgent, urgentReason: symptomReply.reason })}\n\n`);
      return res.end();
    }

    // Lab result explanation: deterministic verified-reference flow.
    if (!safetyCheck.isUrgent) {
      const labReply = labReplyIfApplicable(message, history, language);
      if (labReply) {
        beginSse();
        res.write(`data: ${JSON.stringify({ text: labReply })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true, isUrgent: false, urgentReason: '' })}\n\n`);
        return res.end();
      }
    }

    // Verified general FAQ bank (deterministic, from named sources).
    if (!safetyCheck.isUrgent) {
      const faqEntry = findGeneralFaq(message);
      if (faqEntry) {
        beginSse();
        res.write(`data: ${JSON.stringify({ text: composeFaqReply(faqEntry, language) })}\n\n`);
        res.write(`data: ${JSON.stringify({ done: true, isUrgent: false, urgentReason: '' })}\n\n`);
        return res.end();
      }
    }

    // H-MEM (v9): same memory wrap as /api/chat — retrieve + mine the user's
    // turn before the model-availability check; deterministic routes above
    // never reach this code.
    const chatId = typeof (req.body as any)?.chatId === 'string' && req.body.chatId.trim()
      ? req.body.chatId.trim().slice(0, 80)
      : 'riaya-web';
    const chatMemory = await retrieveChatMemory(chatId, message);
    await recordUserMessage(chatId, message);
    const memoryMeta = {
      retrieved: chatMemory?.memories.length ?? 0,
      injected: false,
      memories: chatMemory?.memories ?? [],
      strategy: chatMemory?.strategy ?? null,
    };

    if (!modelServiceAvailable()) {
      return res.status(503).json({
        error: 'AI_SERVICE_UNAVAILABLE',
        memory: memoryMeta,
        isUrgent: safetyCheck.isUrgent,
        reason: safetyCheck.reason,
        message: language === 'ar'
          ? 'خدمة الذكاء الاصطناعي غير متوفرة حالياً. يمكنك تصفح قسم الأدلة الموثّقة في بوابة الفحوص.'
          : 'The AI service is currently unavailable. Please refer to the Verified Guides section in the Screening Gateway.'
      });
    }

    if (meterlessConfig) {
      // Meterless pre-flight: model discovery (GET {base}/models) BEFORE
      // any SSE byte is written, so an unreachable or unauthorised Runtime
      // still earns the plain-JSON 503 above — the same honest failure the
      // client already renders for a missing model service.
      try {
        await meterlessDiscoverModels(meterlessConfig);
      } catch (preflightErr: any) {
        console.error('Meterless preflight failed:', preflightErr?.message);
        return res.status(503).json({
          error: 'AI_SERVICE_UNAVAILABLE',
          memory: memoryMeta,
          isUrgent: safetyCheck.isUrgent,
          reason: safetyCheck.reason,
          message: language === 'ar'
            ? 'خدمة الذكاء الاصطناعي غير متوفرة حالياً. يمكنك تصفح قسم الأدلة الموثّقة في بوابة الفحوص.'
            : 'The AI service is currently unavailable. Please refer to the Verified Guides section in the Screening Gateway.'
        });
      }
    }

    beginSse();

    // Verified-source gate: medical question with no matching verified
    // source gets ONLY the no-source reply (locked rule).
    if (shouldGateToNoSource(message, safetyCheck.isUrgent)) {
      const reply = noSourceReply(language);
      res.write(`data: ${JSON.stringify({ text: reply })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, isUrgent: false, urgentReason: '', memory: memoryMeta })}\n\n`);
      return res.end();
    }

    // Check cache
    // Cache key MUST include the conversation history actually sent to the
    // model: the same question after new context is a different question.
    const historyKey = JSON.stringify(history.slice(-12));
    let historyHash = 0;
    for (let i = 0; i < historyKey.length; i++) {
      historyHash = (historyHash * 31 + historyKey.charCodeAt(i)) | 0;
    }
    const cacheKey = `${language}:${stage}:${historyHash}:${message.trim().toLowerCase()}`;
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      res.write(`data: ${JSON.stringify({ text: cached.reply })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true, isUrgent: cached.isUrgent, urgentReason: cached.urgentReason, memory: memoryMeta })}\n\n`);
      return res.end();
    }

    const contents: any[] = [];
    let stageContext = '';
    if (stage === 'before') {
      stageContext = '[Current patient journey stage: Before hospital admission or planned procedure / قبل دخول المستشفى]';
    } else if (stage === 'during') {
      stageContext = '[Current patient journey stage: During hospital stay / أثناء الإقامة في المستشفى]';
    } else if (stage === 'after') {
      stageContext = '[Current patient journey stage: After discharge and recovering at home / بعد الخروج والتعافي في المنزل]';
    }

    // History capped to the most recent turns — keeps streaming answers fast
    // even in long conversations.
    for (const h of history.slice(-12)) {
      if (h.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: h.text }] });
      } else if (h.role === 'model' || h.role === 'assistant') {
        contents.push({ role: 'model', parts: [{ text: h.text }] });
      }
    }
    // H-MEM reinjection block (engine-formatted) rides inside the final user
    // turn, between the stage context and the user's message.
    const memoryBlock = chatMemory && chatMemory.memories.length ? `${chatMemory.context}\n` : '';
    contents.push({ role: 'user', parts: [{ text: `${stageContext}\n${memoryBlock}${message}` }] });

    let fullAccumulated = '';
    if (isBridgePrompt(message)) {
      const label = bridgeLabel(language);
      fullAccumulated += label;
      res.write(`data: ${JSON.stringify({ text: label })}\n\n`);
    }
    if (meterlessConfig) {
      // Meterless Nightshift streaming: deltas from the Runtime's
      // OpenAI-compatible SSE stream are relayed in this endpoint's own
      // event format. On failure there is NO fallback provider to
      // substitute (error honesty): the stream closes with the same
      // in-band error event this endpoint already uses for late failures.
      try {
        for await (const text of meterlessChatStream(meterlessConfig, SYSTEM_INSTRUCTION, contents)) {
          fullAccumulated += text;
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      } catch (meterlessErr: any) {
        console.error('Meterless stream error:', meterlessErr?.message);
        res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
        return res.end();
      }
    } else {
      // Gemini path (default): modelServiceAvailable() above guarantees
      // the client exists here; the guard only satisfies the type checker.
      if (!ai) throw new Error('Gemini client unavailable on the Gemini provider path');
      try {
        const responseStream = await ai.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
            maxOutputTokens: 900,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });

        for await (const chunk of responseStream) {
          const text = chunk.text;
          if (text) {
            fullAccumulated += text;
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }
      } catch (streamErr: any) {
        console.warn('Streaming error, falling back to non-stream lite:', streamErr?.message);
        const fallbackRes = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.2,
            maxOutputTokens: 900,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });
        const txt = fallbackRes.text || '';
        fullAccumulated = txt;
        res.write(`data: ${JSON.stringify({ text: txt })}\n\n`);
      }
    }

    // H-MEM episodic write: mine the completed model response.
    await recordModelResponse(chatId, fullAccumulated);

    // Save to cache
    responseCache.set(cacheKey, {
      reply: fullAccumulated,
      isUrgent: safetyCheck.isUrgent,
      urgentReason: safetyCheck.reason,
      timestamp: Date.now(),
    });

    res.write(`data: ${JSON.stringify({ done: true, isUrgent: safetyCheck.isUrgent, urgentReason: safetyCheck.reason, memory: { ...memoryMeta, injected: !!memoryBlock } })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Stream error:', error);
    if (!res.headersSent) {
      console.error('Stream error:', error?.message);
      res.status(500).json({ error: 'STREAM_ERROR', details: 'Server error' });
    } else {
      res.write(`data: ${JSON.stringify({ error: true })}\n\n`);
      res.end();
    }
  }
});

// Structured follow-up questions for operations without a curated question
// set. The model returns QUESTIONS ONLY (validated by parseGeneratedQuestions);
// it never assigns severity and the client never uses answers as triage.
const followupCache = new Map<string, { questions: GeneratedQuestion[]; timestamp: number }>();

app.post('/api/followup-questions', async (req, res) => {
  try {
    const { name } = req.body || {};
    const opName = typeof name === 'string' ? name.trim().slice(0, 80) : '';
    if (!opName) {
      return res.status(400).json({ error: 'Operation name is required' });
    }
    if (!ai) {
      return res.status(503).json({ error: 'AI unavailable' });
    }
    const cacheKey = `fq:${opName.toLowerCase()}`;
    const cached = followupCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return res.json({ questions: cached.questions });
    }
    const prompt = buildFollowupQuestionsPrompt(opName);
    const generateOnce = async (promptText: string, model: string) => ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: promptText }] }],
      config: {
        temperature: 0.2,
        maxOutputTokens: 1500,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });
    let response;
    try {
      response = await generateOnce(prompt, 'gemini-3.8-flash');
    } catch (primaryErr: any) {
      console.warn('Follow-up questions primary model error, attempting fallback:', primaryErr?.message);
      response = await generateOnce(prompt, 'gemini-3.1-flash-lite');
    }
    let questions = parseGeneratedQuestions(response.text || '');
    if (!questions) {
      // Model output varies in shape between runs (bare arrays, Arabic-only
      // items, prose around the JSON). The parser now accepts those; if it
      // still rejects, retry ONCE with an explicit format reminder before
      // the client falls back to prose.
      console.warn('[followup-questions] first output rejected; sample:', (response.text || '').slice(0, 200));
      try {
        const retry = await generateOnce(
          prompt + '\n\nIMPORTANT REMINDER: Reply with ONLY the JSON object in exactly the shape above — {"questions":[{"ar":"...","en":"..."}]} — no markdown, no explanation, no extra text.',
          'gemini-3.1-flash-lite',
        );
        questions = parseGeneratedQuestions(retry.text || '');
        if (!questions) console.warn('[followup-questions] retry output also rejected; sample:', (retry.text || '').slice(0, 200));
      } catch (retryErr: any) {
        console.warn('[followup-questions] retry failed:', retryErr?.message);
      }
    }
    if (!questions) {
      return res.status(502).json({ error: 'Could not generate structured questions' });
    }
    followupCache.set(cacheKey, { questions, timestamp: Date.now() });
    return res.json({ questions });
  } catch (err: any) {
    console.error('Follow-up questions error:', err?.message || err);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    llmProvider,
    meterlessConfigured: !!meterlessConfig,
    timestamp: new Date().toISOString()
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Riaya server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
