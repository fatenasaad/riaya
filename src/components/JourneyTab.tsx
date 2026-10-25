import React, { useState, useEffect } from 'react';
import {
  JourneyStage,
  Language,
  ChecklistItem,
  RecoveryCheckIn,
  SurgeryType,
  ClinicianCase,
  PersonalMedication,
  PRNUsageEntry
} from '../types';
import { getStoredSurgeryType, setStoredSurgeryType } from '../utils/storage';
import {
  INITIAL_BEFORE_CHECKLIST,
  DURING_HOSPITAL_POINTS
} from '../data/journeyData';
import {
  CheckSquare,
  Square,
  FileText,
  Calendar,
  AlertCircle,
  Pill,
  HeartPulse,
  RotateCcw,
  Activity,
  User,
  Clock,
  Info,
  Plus,
  Trash2,
  AlertTriangle,
  X,
  Check,
  PhoneCall,
  ShieldAlert,
  BellRing,
  BookOpen,
  ClipboardCheck
} from 'lucide-react';
import { medHasCompleteTimes, downloadICSForMedication, buildGoogleCalendarUrls } from '../utils/calendarReminders';
import { explainQuestion } from '../utils/questionWhy';

// Procedure-specific follow-up questions: post-operative monitoring depends on
// the type of surgery, not only on generic recovery questions. Each question
// declares which answer raises an alert and at what severity, and its answers
// feed the same emergency / urgent guidance logic as the core check-in.
export interface ProcedureQuestion {
  id: string;
  textAr: string;
  textEn: string;
  alertWhen: 'yes' | 'no';
  severity: 'emergency' | 'urgent';
  issueAr: string;
  issueEn: string;
  // Plain-language "why do we ask this?" — written for this question from
  // verified sources; shown under the question before answering.
  whyAr: string;
  whyEn: string;
  // Optional hand-written "what to do if this applies to you" — when absent,
  // the action comes from the fixed family bank (questionWhy.ts).
  actionAr?: string;
  actionEn?: string;
}

export const THYROID_QUESTIONS: ProcedureQuestion[] = [
  {
    id: 'thyroid-bleeding',
    textAr: 'هل يوجد نزيف في مكان العملية؟',
    textEn: 'Is there bleeding at the operation site?',
    alertWhen: 'yes',
    severity: 'emergency',
    issueAr: 'نزيف في مكان عملية الغدة الدرقية',
    issueEn: 'bleeding at the thyroid operation site',
    whyAr: 'نزيف الرقبة بعد عملية الدرقية خطير بشكل خاص: تجمّع الدم في الرقبة قد يضغط على مجرى الهواء ويعيق التنفس — لذلك أي نزيف هنا يُعامل كحالة فورية.',
    whyEn: 'Neck bleeding after thyroid surgery is especially dangerous: collected blood in the neck can press on the airway and obstruct breathing — so any bleeding here is treated as immediate.',
    actionAr: 'اجلس منتصباً، لا تضغط بقوة على الرقبة، واطلب المساعدة الطبية فوراً.',
    actionEn: 'Sit upright, do not press hard on the neck, and seek medical help immediately.',
  },
  {
    id: 'thyroid-dressing',
    textAr: 'هل تم تبديل الضماد بعد العملية حسب تعليمات فريقك الطبي؟',
    textEn: 'Was the dressing changed after the operation as instructed by your medical team?',
    alertWhen: 'no',
    severity: 'urgent',
    issueAr: 'لم يتم تبديل الضماد بعد العملية',
    issueEn: 'dressing not changed after the operation',
    whyAr: 'الضماد يحمي الجرح من التلوث، وتبديله حسب التعليمات يمنع الإنتان ويتيح كشف أي نزيف أو تورّم في الرقبة باكراً.',
    whyEn: 'The dressing protects the wound from contamination; changing it as instructed prevents infection and allows early detection of bleeding or neck swelling.',
    actionAr: 'راجع تعليمات فريقك عن موعد التبديل وطريقته، واسألهم اليوم إذا فاتك الموعد — ولا تبدّله بطريقة مختلفة عن تعليماتهم.',
    actionEn: 'Check your team\'s instructions on when and how to change it, and ask them today if you missed it — do not change it differently from their instructions.',
  },
  {
    id: 'thyroid-hoarseness',
    textAr: 'هل توجد بحة قوية أو تغيّر واضح في الصوت؟',
    textEn: 'Is there strong hoarseness or a clear change in your voice?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'بحة قوية في الصوت بعد عملية الغدة الدرقية',
    issueEn: 'strong hoarseness after thyroid surgery',
    whyAr: 'أعصاب الحبال الصوتية تمر بمحاذاة الغدة الدرقية وقد تتأثر مؤقتاً بالعملية — البحة الخفيفة شائعة وتتحسن، أما القوية أو المستمرة فمتابعتها تساعد الفريق على قرار التقييم.',
    whyEn: 'The vocal-cord nerves run right beside the thyroid gland and may be temporarily affected by the operation — mild hoarseness is common and improves, while strong or persistent hoarseness helps the team decide on assessment.',
    actionAr: 'أخبر فريقك عند المراجعة، أو اليوم إذا ترافقت البحة مع صعوبة في التنفس أو البلع — صعوبة التنفس تعني مساعدة فورية.',
    actionEn: 'Tell your team at follow-up, or today if the hoarseness comes with difficulty breathing or swallowing — breathing difficulty means immediate help.',
  },
  {
    id: 'thyroid-tingling',
    textAr: 'هل تشعر بوخز أو خدر حول الفم أو في الأصابع؟',
    textEn: 'Do you feel tingling or numbness around the mouth or in the fingers?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'وخز حول الفم أو الأصابع بعد عملية الغدة الدرقية (قد يشير لانخفاض الكالسيوم)',
    issueEn: 'tingling around the mouth or fingers after thyroid surgery (may indicate low calcium)',
    whyAr: 'الغدد جارات الدرقية التي تنظّم الكالسيوم ملاصقة للغدة الدرقية وقد تتعطل مؤقتاً بعد العملية — انخفاض الكالسيوم يسبب وخزاً حول الفم وفي الأصابع، وهو قابل للعلاج بسهولة إذا اكتُشف.',
    whyEn: 'The parathyroid glands that regulate calcium sit against the thyroid and may be temporarily disturbed by the operation — low calcium causes tingling around the mouth and in the fingers, and is easily treated when caught.',
    actionAr: 'أخبر فريقك اليوم — انخفاض الكالسيوم يُثبَّت بتحليل ويُعالج بمكملات يصفها الطبيب؛ لا تأخذ مكملات من عندك.',
    actionEn: 'Tell your team today — low calcium is confirmed by a blood test and treated with supplements the doctor prescribes; do not take supplements on your own.',
  },
];

export const CESAREAN_QUESTIONS: ProcedureQuestion[] = [
  {
    id: 'cesarean-bleeding',
    textAr: 'هل النزيف المهبلي غزير (نقع فوطة خلال ساعة) أو توجد جلطات دموية كبيرة؟',
    textEn: 'Is vaginal bleeding heavy (soaking a pad within an hour) or are there large blood clots?',
    alertWhen: 'yes',
    severity: 'emergency',
    issueAr: 'نزيف غزير بعد العملية القيصرية',
    issueEn: 'heavy bleeding after cesarean section',
    whyAr: 'نزيف ما بعد الولادة الغزير قد يعني أن الرحم لا ينقبض كما يجب أو أن هناك بقايا مشيمة — فقدان الدم السريع يخفّض الضغط وقد يحتاج إلى تعويض دم وتدخل فوري.',
    whyEn: 'Heavy post-delivery bleeding can mean the womb is not contracting as it should or that placental tissue remains — rapid blood loss lowers blood pressure and may require transfusion and immediate intervention.',
    actionAr: 'استلقي، ضعي فوطة نظيفة، واطلبي المساعدة الطبية فوراً — نزيف ما بعد الولادة الغزير حالة إسعافية لا تنتظر.',
    actionEn: 'Lie down, use a clean pad, and seek medical help immediately — heavy post-delivery bleeding is an emergency that cannot wait.',
  },
  {
    id: 'cesarean-headache',
    textAr: 'هل يوجد صداع شديد لا يتحسن، أو تشوّش في الرؤية؟',
    textEn: 'Is there a severe headache that does not improve, or blurred vision?',
    alertWhen: 'yes',
    severity: 'emergency',
    issueAr: 'صداع شديد أو تشوّش رؤية بعد الولادة (قد يشير لارتفاع ضغط خطير)',
    issueEn: 'severe headache or blurred vision after delivery (may indicate dangerous high blood pressure)',
    whyAr: 'صداع شديد مع تشوّش رؤية بعد الولادة قد يكون علامة تسمّم حمل أو ارتفاع ضغط خطير — وقد يحدث حتى بعد الولادة بأيام، ويحتاج إلى قياس ضغط وتقييم فوري.',
    whyEn: 'A severe headache with blurred vision after delivery can be a sign of pre-eclampsia or dangerous high blood pressure — it can occur even days after delivery and needs an immediate blood-pressure check and assessment.',
    actionAr: 'اطلبي المساعدة الطبية فوراً لقياس الضغط والتقييم — لا تنتظري موعد المراجعة.',
    actionEn: 'Seek medical help immediately for a blood-pressure check and assessment — do not wait for the follow-up appointment.',
  },
  {
    id: 'cesarean-wound',
    textAr: 'هل يوجد احمرار أو تورّم أو فتح في جرح العملية، أو إفرازات منه؟',
    textEn: 'Is there redness, swelling, opening of the operation wound, or discharge from it?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'علامات التهاب أو فتح في جرح القيصرية',
    issueEn: 'signs of infection or opening in the cesarean wound',
    whyAr: 'احمرار متزايد أو تورّم أو إفرازات أو بدء فتح الجرح قد يدل على إنتان في الجرح — اكتشافه مبكراً يجعل علاجه أبسط (مضادات ومراجعة) قبل أن يمتد.',
    whyEn: 'Increasing redness, swelling, discharge, or the wound starting to open can indicate a wound infection — catching it early makes treatment simpler (antibiotics and review) before it spreads.',
  },
  {
    id: 'cesarean-leg',
    textAr: 'هل يوجد ألم أو تورّم في ساق واحدة؟',
    textEn: 'Is there pain or swelling in one leg?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'ألم أو تورّم في ساق واحدة بعد القيصرية (قد يشير لجلطة)',
    issueEn: 'pain or swelling in one leg after cesarean (may indicate a blood clot)',
    whyAr: 'الحمل والولادة والعملية ترفع مجتمعة احتمال جلطة وريد الساق — والجلطة قد تنتقل إلى الرئة إذا لم تُعالج، لذلك أي تورّم جديد في ساق واحدة يستحق الإخبار في اليوم نفسه.',
    whyEn: 'Pregnancy, delivery, and surgery together raise the chance of a leg-vein clot — a clot can travel to the lung if untreated, so any new one-leg swelling deserves same-day reporting.',
  },
];

export const CATHETER_QUESTIONS: ProcedureQuestion[] = [
  {
    id: 'cath-bleeding',
    textAr: 'هل يوجد نزيف مستمر أو تورّم/كتلة تكبر بسرعة في موضع دخول القثطرة (المعصم أو الفخذ)؟',
    textEn: 'Is there ongoing bleeding, or a swelling/lump rapidly growing at the catheter entry site (wrist or groin)?',
    alertWhen: 'yes',
    severity: 'emergency',
    issueAr: 'نزيف أو تورّم متزايد في موضع القثطرة',
    issueEn: 'bleeding or growing swelling at the catheterization site',
    whyAr: 'موضع الدخول هو شريان — نزيف مستمر أو كتلة تكبر بسرعة تعني أن الشريان لم يُغلق جيداً أو أن دماً يتجمع تحت الجلد، واستمراره يخفّض الضغط ويحتاج تدخلاً سريعاً.',
    whyEn: 'The entry site is an artery — ongoing bleeding or a rapidly growing lump means the artery has not sealed well or blood is collecting under the skin; continuing loss lowers blood pressure and needs rapid intervention.',
  },
  {
    id: 'cath-chest-pain',
    textAr: 'هل تعاني من ألم أو ضغط في الصدر؟',
    textEn: 'Do you have chest pain or pressure?',
    alertWhen: 'yes',
    severity: 'emergency',
    issueAr: 'ألم صدري بعد القثطرة القلبية',
    issueEn: 'chest pain after cardiac catheterization',
    whyAr: 'ألم الصدر بعد قثطرة قلبية قد يدل على أن شرياناً قلبياً يضيق من جديد أو أن عضلة القلب لا يصلها دم كافٍ — وهو العرض الأهم الذي لا يُنتظر معه أبداً.',
    whyEn: 'Chest pain after cardiac catheterization can indicate a heart artery narrowing again or the heart muscle not receiving enough blood — it is the most important symptom never to wait with.',
  },
  {
    id: 'cath-limb',
    textAr: 'هل تبدو يدك أو قدمك في جهة القثطرة باردة أو شاحبة أو مخدّرة؟',
    textEn: 'Does your hand or foot on the catheter side feel cold, pale, or numb?',
    alertWhen: 'yes',
    severity: 'emergency',
    issueAr: 'برودة أو شحوب أو خدر في الطرف بجهة القثطرة (قد يشير لمشكلة في التروية)',
    issueEn: 'cold, pale, or numb limb on the catheter side (may indicate a circulation problem)',
    whyAr: 'برودة أو شحوب أو خدر الطرف في جهة القثطرة قد يدل على أن تروية الدم للطرف متعثرة (جلطة أو تضيّق عند موضع الدخول) — اكتشافها باكراً يحمي الطرف.',
    whyEn: 'A cold, pale, or numb limb on the catheter side can indicate impaired blood flow to the limb (a clot or narrowing at the entry site) — catching it early protects the limb.',
    actionAr: 'أبقِ الطرف مكشوفاً ودافئاً دون تدليكه أو الضغط عليه، واطلب المساعدة الطبية فوراً.',
    actionEn: 'Keep the limb uncovered and warm without massaging or pressing it, and seek medical help immediately.',
  },
  {
    id: 'cath-breath',
    textAr: 'هل تعاني من ضيق شديد أو مفاجئ في التنفس؟',
    textEn: 'Do you have severe or sudden shortness of breath?',
    alertWhen: 'yes',
    severity: 'emergency',
    issueAr: 'ضيق تنفس شديد أو مفاجئ بعد القثطرة',
    issueEn: 'severe or sudden breathlessness after catheterization',
    whyAr: 'ضيق التنفس الشديد أو المفاجئ قد يدل على تجمّع سوائل في الرئة أو جلطة رئوية أو مشكلة قلبية — وهو عرض إسعافي دائماً.',
    whyEn: 'Severe or sudden breathlessness can indicate fluid on the lungs, a lung clot, or a heart problem — it is always an emergency symptom.',
  },
  {
    id: 'cath-site-pain',
    textAr: 'هل تعاني من ألم في موضع دخول القثطرة يزداد بدل أن يتحسن؟',
    textEn: 'Do you have pain at the catheter entry site that is getting worse instead of better?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'ألم متزايد في موضع القثطرة',
    issueEn: 'worsening pain at the catheterization site',
    whyAr: 'ألم موضع الدخول الطبيعي يخف يوماً بعد يوم — ألم يزداد قد يدل على تجمّع دم تحت الجلد أو بداية إنتان في الموضع، واتجاهه أهم من شدته في يوم واحد.',
    whyEn: 'Normal entry-site pain eases day by day — worsening pain can indicate blood collecting under the skin or an early site infection, and its direction matters more than one day\'s intensity.',
  },
  {
    id: 'cath-fever',
    textAr: 'هل لديك حرارة أو قشعريرة؟',
    textEn: 'Do you have fever or chills?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'حرارة أو قشعريرة بعد القثطرة (قد تشير لالتهاب)',
    issueEn: 'fever or chills after catheterization (may indicate infection)',
    whyAr: 'الحرارة بعد القثطرة قد تكون أول علامة على إنتان عند موضع الدخول أو في مجرى الدم — والإنتان يُعالج بالمضادات ويُكشف باكراً بالتحاليل.',
    whyEn: 'Fever after catheterization can be the first sign of infection at the entry site or in the bloodstream — infection is treated with antibiotics and detected early by tests.',
  },
];

export const GALLBLADDER_QUESTIONS: ProcedureQuestion[] = [
  {
    id: 'gall-chest',
    textAr: 'هل لديك ألم في الصدر أو صعوبة في التنفس (خاصة مع ألم أو تورّم في الساق)؟',
    textEn: 'Do you have chest pain or difficulty breathing (especially with leg pain or swelling)?',
    alertWhen: 'yes',
    severity: 'emergency',
    issueAr: 'ألم صدري أو صعوبة تنفس بعد استئصال المرارة (قد يشير لجلطة في الرئة)',
    issueEn: 'chest pain or breathing difficulty after gallbladder removal (may indicate a lung blood clot)',
    whyAr: 'ألم الصدر أو صعوبة التنفس بعد أي عملية — خاصة مع ألم أو تورّم بالساق — قد يدل على جلطة انتقلت إلى الرئة، وهي حالة إسعافية دائماً.',
    whyEn: 'Chest pain or breathing difficulty after any operation — especially with leg pain or swelling — can indicate a clot that travelled to the lung, which is always an emergency.',
  },
  {
    id: 'gall-bleeding',
    textAr: 'هل يوجد نزيف مستمر من جروح العملية لا يتوقف بالضغط الخفيف؟',
    textEn: 'Is there ongoing bleeding from the operation wounds that does not stop with light pressure?',
    alertWhen: 'yes',
    severity: 'emergency',
    issueAr: 'نزيف مستمر من جروح استئصال المرارة',
    issueEn: 'ongoing bleeding from gallbladder operation wounds',
    whyAr: 'نزيف لا يتوقف قد يعني وعاءً دموياً مفتوحاً — استمرار فقدان الدم يخفّض ضغط الدم وقد يحتاج إلى تعويض دم أو تدخل سريع.',
    whyEn: 'Bleeding that does not stop may mean an open blood vessel — continued blood loss lowers blood pressure and may require transfusion or rapid intervention.',
  },
  {
    id: 'gall-pain',
    textAr: 'هل ألم البطن شديد أو يزداد ولا يخفّ بالمسكنات الموصوفة؟',
    textEn: 'Is the abdominal pain severe or worsening, and not relieved by the prescribed painkillers?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'ألم بطن شديد أو متزايد بعد استئصال المرارة',
    issueEn: 'severe or worsening abdominal pain after gallbladder removal',
    whyAr: 'ألم البطن الطبيعي بعد العملية يتحسن تدريجياً — ألم شديد أو متزايد لا يخف بالمسكنات قد يدل على تسرب صفراوي أو تجمّع سوائل أو مشكلة داخلية تحتاج تقييماً.',
    whyEn: 'Normal post-operation abdominal pain improves gradually — severe or worsening pain unrelieved by painkillers can indicate a bile leak, fluid collection, or an internal problem needing assessment.',
  },
  {
    id: 'gall-fever',
    textAr: 'هل حرارتك مرتفعة جداً، أو تشعر بحرارة وبرودة وقشعريرة؟',
    textEn: 'Is your temperature very high, or do you feel hot, cold, and shivery?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'حرارة مرتفعة أو قشعريرة بعد استئصال المرارة (قد تشير لالتهاب)',
    issueEn: 'high temperature or shivering after gallbladder removal (may indicate infection)',
    whyAr: 'الحرارة المرتفعة أو القشعريرة بعد العملية قد تكون أول علامة على إنتان (في الجروح أو البطن أو الصدر) — الإنتان يُعالج بالمضادات، وإهماله قد يعمّمه في الجسم.',
    whyEn: 'A very high temperature or shivering after the operation can be the first sign of infection (in the wounds, abdomen, or chest) — infection is treated with antibiotics, and neglecting it can spread it through the body.',
  },
  {
    id: 'gall-wound',
    textAr: 'هل يخرج صديد أو إفرازات من جروح العملية، أو يوجد ألم وتورّم واحمرار متزايد حولها؟',
    textEn: 'Is pus or discharge coming from the wounds, or is there increasing pain, swelling, or redness around them?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'علامات التهاب في جروح استئصال المرارة',
    issueEn: 'signs of wound infection after gallbladder removal',
    whyAr: 'صديد أو إفرازات أو احمرار وتورّم متزايد حول الجروح قد يدل على إنتان في الجرح — اكتشافه مبكراً يجعل علاجه أبسط قبل أن يمتد.',
    whyEn: 'Pus, discharge, or increasing redness and swelling around the wounds can indicate a wound infection — catching it early makes treatment simpler before it spreads.',
  },
  {
    id: 'gall-jaundice',
    textAr: 'هل لاحظت اصفراراً في جلدك أو بياض عينيك، أو بولاً داكناً جداً؟',
    textEn: 'Have you noticed yellowing of your skin or the whites of your eyes, or very dark urine?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'اصفرار الجلد أو العينين بعد استئصال المرارة (قد يشير لمشكلة في القنوات الصفراوية)',
    issueEn: 'yellowing of skin or eyes after gallbladder removal (may indicate a bile-duct problem)',
    whyAr: 'اصفرار الجلد أو العينين أو بول داكن بعد إزالة المرارة قد يدل على مشكلة في القنوات الصفراوية (حصاة متبقية أو تسرّب صفراوي) — يحتاج تحاليل دم وتقييماً من الفريق.',
    whyEn: 'Yellowing of the skin or eyes or very dark urine after gallbladder removal can indicate a bile-duct problem (a remaining stone or a bile leak) — it needs blood tests and team assessment.',
    actionAr: 'أخبر فريقك في اليوم نفسه — وإذا ترافق الاصفرار مع ألم شديد أو حرارة، اطلب المساعدة فوراً.',
    actionEn: 'Tell your team the same day — if the yellowing comes with severe pain or fever, seek help immediately.',
  },
  {
    id: 'gall-leg',
    textAr: 'هل يوجد تورّم أو ألم أو شدّ في إحدى الساقين (خاصة الربلة)؟',
    textEn: 'Is there swelling, pain, or cramping in one leg (especially the calf)?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'ألم أو تورّم في ساق واحدة بعد العملية (قد يشير لجلطة)',
    issueEn: 'pain or swelling in one leg after the operation (may indicate a blood clot)',
    whyAr: 'تورّم أو ألم في ساق واحدة بعد عملية قد يدل على جلطة في وريد الساق — والجلطة قد تنتقل إلى الرئة إذا لم تُعالج.',
    whyEn: 'Swelling or pain in one leg after an operation can indicate a leg-vein clot — a clot can travel to the lung if untreated.',
  },
  {
    id: 'gall-vomit',
    textAr: 'هل القيء مستمر ويمنعك من الاحتفاظ بالسوائل؟',
    textEn: 'Is vomiting persistent and preventing you from keeping fluids down?',
    alertWhen: 'yes',
    severity: 'urgent',
    issueAr: 'قيء مستمر بعد استئصال المرارة',
    issueEn: 'persistent vomiting after gallbladder removal',
    whyAr: 'القيء المستمر يسبب جفافاً ويمنع أخذ الأدوية، وبعد عملية بطنية قد يدل على أن الأمعاء لم تعد للعمل بعد أو على مشكلة تحتاج تقييماً.',
    whyEn: 'Persistent vomiting causes dehydration and prevents taking medicines, and after an abdominal operation it can indicate the bowel has not resumed working or a problem needing assessment.',
  },
];

export const PROCEDURE_QUESTIONS: Record<SurgeryType, ProcedureQuestion[]> = {
  general: [],
  thyroid: THYROID_QUESTIONS,
  cesarean: CESAREAN_QUESTIONS,
  catheter: CATHETER_QUESTIONS,
  gallbladder: GALLBLADDER_QUESTIONS,
  other: [],
};

export const PROCEDURE_INFO: Partial<Record<SurgeryType, { titleAr: string; titleEn: string; bodyAr: string; bodyEn: string }>> = {
  thyroid: {
    titleAr: 'عن عمليتك — استئصال الغدة الدرقية',
    titleEn: 'About your operation — thyroid removal',
    bodyAr: 'عملية يُزال فيها كل الغدة الدرقية أو جزء منها من مقدمة الرقبة، وتُجرى غالباً بسبب تضخّم أو عُقد أو فرط نشاط أو ورم. الغدة تنظّم طاقة الجسم بهرموناتها، فبعد الإزالة الكاملة يحتاج معظم المرضى هرموناً بديلاً يومياً يحدّد الطبيب جرعته.',
    bodyEn: 'An operation removing all or part of the thyroid gland from the front of the neck, most often for enlargement, nodules, overactivity, or a tumour. The gland regulates the body\'s energy through its hormones, so after complete removal most patients need a daily replacement hormone whose dose the doctor sets.',
  },
  cesarean: {
    titleAr: 'عن عمليتك — العملية القيصرية',
    titleEn: 'About your operation — cesarean section',
    bodyAr: 'ولادة الطفل عبر شقّ في البطن والرحم بدل الولادة الطبيعية. التعافي الكامل يأخذ عادة عدة أسابيع، والمتابعة تركّز على الجرح والنزيف والحركة المبكرة التدريجية.',
    bodyEn: 'Delivery of the baby through an incision in the abdomen and womb instead of a vaginal birth. Full recovery usually takes several weeks, and follow-up focuses on the wound, bleeding, and gradual early movement.',
  },
  catheter: {
    titleAr: 'عن إجرائك — القثطرة القلبية',
    titleEn: 'About your procedure — cardiac catheterization',
    bodyAr: 'إجراء يُدخَل فيه أنبوب رفيع (قثطرة) عبر شريان في المعصم أو الفخذ ليصل إلى شرايين القلب — للتشخيص بتصوير الشرايين، أو للعلاج بفتح شريان ضيّق أو وضع دعامة. ليست عملية قلب مفتوح، وموضع الدخول هو محور المتابعة في الأيام الأولى.',
    bodyEn: 'A procedure in which a thin tube (catheter) is passed through an artery in the wrist or groin to the heart\'s arteries — to diagnose by imaging the arteries, or to treat by opening a narrowed artery or placing a stent. It is not open-heart surgery, and the entry site is the focus of follow-up in the first days.',
  },
  gallbladder: {
    titleAr: 'عن عمليتك — استئصال المرارة',
    titleEn: 'About your operation — gallbladder removal',
    bodyAr: 'إزالة كيس المرارة، غالباً بالمنظار عبر شقوق صغيرة، وتُجرى عادة بسبب حصيّات مؤلمة أو التهاب متكرر. الجسم يهضم الطعام بدون المرارة، ومعظم الناس يعودون لأنشطتهم المعتادة خلال أسبوع إلى أسبوعين.',
    bodyEn: 'Removal of the gallbladder, usually by keyhole surgery through small incisions, most often for painful gallstones or repeated inflammation. The body digests food without the gallbladder, and most people return to their usual activities within one to two weeks.',
  },
};

export const PROCEDURE_SECTION_LABELS: Partial<Record<SurgeryType, { ar: string; en: string }>> = {
  thyroid: { ar: 'أسئلة خاصة بعملية الغدة الدرقية:', en: 'Thyroid-surgery specific questions:' },
  cesarean: { ar: 'أسئلة خاصة بالعملية القيصرية:', en: 'Cesarean-section specific questions:' },
  catheter: { ar: 'أسئلة خاصة بمتابعة القثطرة القلبية:', en: 'Cardiac-catheterization specific questions:' },
  gallbladder: { ar: 'أسئلة خاصة بمتابعة استئصال المرارة:', en: 'Gallbladder-removal specific questions:' },
};

interface JourneyTabProps {
  language: Language;
  currentPhase: JourneyStage;
  onChangePhase: (phase: JourneyStage) => void;
  checklist: ChecklistItem[];
  onToggleChecklist: (id: string) => void;
  doctorNotes: string;
  onUpdateDoctorNotes: (text: string) => void;
  medsTaken: Record<string, Record<string, boolean>>;
  onToggleMedTaken: (date: string, medId: string) => void;
  personalMeds?: PersonalMedication[];
  onAddPersonalMed?: (med: Omit<PersonalMedication, 'id' | 'createdAt'>) => void;
  onDeletePersonalMed?: (id: string) => void;
  onUpdatePersonalMed?: (id: string, patch: Partial<PersonalMedication>) => void;
  prnLogs?: PRNUsageEntry[];
  onAddPRNLog?: (entry: Omit<PRNUsageEntry, 'id' | 'timestamp'>) => void;
  onDeletePRNLog?: (id: string) => void;
  checkins: RecoveryCheckIn[];
  onAddCheckin: (checkin: Omit<RecoveryCheckIn, 'id' | 'timestamp'>) => void;
  onResetAllDemoData: () => void;
  onSimulateCoordinatorAlert: (alertCase: Partial<ClinicianCase>) => void;
  journeyJump?: { n: number; phase: JourneyStage; afterView?: 'general' | 'personal' | 'meds'; surgeryType?: SurgeryType; fromChat?: boolean } | null;
  onAskAboutLabs?: () => void;
}

const CORE_WHY: Record<string, { whyAr: string; whyEn: string; actionAr: string; actionEn: string }> = {
  breathing: {
    whyAr: 'التنفس بعد عملية يتأثر بالتخدير والألم وقلة الحركة — تراجعه مقارنة بالأمس قد يكون أول علامة على مشكلة في الرئة أو تجمّع سوائل، لذلك نقارنه يوماً بيوم.',
    whyEn: 'Breathing after an operation is affected by anesthesia, pain, and immobility — worsening compared to yesterday can be the first sign of a lung problem or fluid collection, so we compare it day by day.',
    actionAr: 'إذا تنفّسك أسوأ الآن أو معه ألم في الصدر، اطلب المساعدة الطبية فوراً — لا تنتظر الغد.',
    actionEn: 'If your breathing is worse now or comes with chest pain, seek medical help immediately — do not wait until tomorrow.',
  },
  fever: {
    whyAr: 'الحرارة قد تكون أول علامة على إنتان (التهاب جرثومي) — والإنتان يُعالج بالمضادات الحيوية ويُكتشف باكراً بالمتابعة اليومية.',
    whyEn: 'Fever can be the first sign of infection — infection is treated with antibiotics and is caught early by daily monitoring.',
    actionAr: 'اشرب سوائل ما لم تكن ممنوعة عنك وأخبر فريقك اليوم — حرارة عالية أو قشعريرة شديدة تعني مساعدة فورية.',
    actionEn: 'Drink fluids unless restricted for you and tell your team today — a high fever or severe shivering means immediate help.',
  },
  pain: {
    whyAr: 'اتجاه الألم أهم من رقمه في يوم واحد: ألم يتحسن تدريجياً طبيعي، وألم يزداد قد يكون علامة مبكرة على مشكلة (نزيف داخلي، إنتان، تجمّع سوائل).',
    whyEn: 'The pain\'s direction matters more than one day\'s number: gradually improving pain is normal, while worsening pain can be an early sign of a problem (internal bleeding, infection, fluid collection).',
    actionAr: 'خذ المسكّن الموصوف لك حسب تعليمات فريقك — ألم يزداد بشدة أو مع حرارة أو انتفاخ أو نزيف يعني إخبار الفريق فوراً.',
    actionEn: 'Take the painkiller prescribed for you as instructed — sharply worsening pain, or pain with fever, swelling, or bleeding, means telling the team immediately.',
  },
  walked: {
    whyAr: 'المشي الخفيف المبكر يحمي من الجلطات ومشاكل الرئة ويسرّع عودة الأمعاء للعمل — لذلك نسأل عنه كل يوم.',
    whyEn: 'Early gentle walking protects against clots and lung problems and speeds the bowel\'s return to work — that is why we ask daily.',
    actionAr: 'حاول خطوات قصيرة ومتكررة داخل البيت، بمساعدة شخص إن أمكن، ولا تُجبر نفسك إذا شعرت بدوار أو ألم شديد.',
    actionEn: 'Try short frequent walks inside the house, with help if possible, and do not force yourself if dizzy or in severe pain.',
  },
  mood: {
    whyAr: 'الحالة النفسية جزء من التعافي: القلق أو الإرهاق المستمر يؤثر على النوم والشهية والالتزام بالأدوية — ومعرفته تتيح للفريق دعمك بشكل صحيح.',
    whyEn: 'Mood is part of recovery: persistent anxiety or exhaustion affects sleep, appetite, and medication adherence — knowing about it lets the team support you properly.',
    actionAr: 'إذا استمر الشعور بالإرهاق أو القلق أياماً، تحدّث مع عائلتك وفريقك — طلب الدعم جزء من العلاج وليس ضعفاً.',
    actionEn: 'If exhaustion or anxiety persists for days, talk to your family and team — asking for support is part of treatment, not weakness.',
  },
  wound: {
    whyAr: 'علامات الجرح هي نافذتنا اليومية على الإنتان: احمرار أو تورّم أو إفراز متزايد يُكتشف باكراً بالمراقبة اليومية قبل أن يمتد.',
    whyEn: 'Wound signs are our daily window on infection: increasing redness, swelling, or discharge is caught early by daily checks before it spreads.',
    actionAr: 'لا تضع شيئاً على الجرح غير ما وصفه فريقك، وأخبرهم اليوم بأي علامة جديدة.',
    actionEn: 'Put nothing on the wound except what your team prescribed, and tell them today about any new sign.',
  },
  appetite: {
    whyAr: 'الأكل والشرب الكافي شرط للشفاء ولأخذ الأدوية — الغثيان أو الاستفراغ المتكرر يسبب جفافاً ويؤخّر التعافي.',
    whyEn: 'Adequate eating and drinking is required for healing and for taking medicines — repeated nausea or vomiting causes dehydration and delays recovery.',
    actionAr: 'خذ رشفات صغيرة ومتكررة عند الغثيان — استفراغ متكرر أو عجز عن الشرب يعني إخبار الفريق اليوم.',
    actionEn: 'Take small frequent sips when nauseated — repeated vomiting or inability to drink means telling the team today.',
  },
  bowel: {
    whyAr: 'عودة التبول والإخراج علامة أن الجسم — والأمعاء بعد عمليات البطن — عاد يعمل. الاحتباس أو التوقف مع انتفاخ قد يدل على مشكلة تحتاج تقييماً.',
    whyEn: 'Urination and bowel function returning is a sign the body — and the bowel after abdominal operations — is working again. Retention or stoppage with bloating can indicate a problem needing assessment.',
    actionAr: 'اشرب سوائل وامشِ خطوات قصيرة — احتباس بول أو توقّف إخراج مع انتفاخ أو استفراغ يعني تقييماً في اليوم نفسه.',
    actionEn: 'Drink fluids and take short walks — urine retention or no bowel output with bloating or vomiting means same-day assessment.',
  },
  sleep: {
    whyAr: 'النوم الجيد يسرّع الشفاء ويخفّف الإحساس بالألم — وقلة النوم المستمرة قد تدل على ألم غير مضبوط أو قلق يحتاج معالجة.',
    whyEn: 'Good sleep speeds healing and reduces pain perception — persistent poor sleep can indicate uncontrolled pain or anxiety needing treatment.',
    actionAr: 'إذا كان الألم أو القلق يمنعك من النوم، أخبر فريقك — ضبطهما يحسّن نومك وتعافيك.',
    actionEn: 'If pain or anxiety keeps you from sleeping, tell your team — controlling them improves your sleep and recovery.',
  },
  support: {
    whyAr: 'وجود مساعدة في البيت يفرق في الأمان: رفع الأشياء، الأدوية، المواعيد — معرفة أنك وحدك تتيح للفريق ترتيب دعم إضافي.',
    whyEn: 'Help at home makes a difference to safety: lifting, medicines, appointments — knowing you are alone lets the team arrange extra support.',
    actionAr: 'إذا كنت وحدك، رتّب مع قريب أو جار أن يمرّ يومياً، وأخبر فريقك ليقترح خدمات دعم إن وُجدت.',
    actionEn: 'If you are alone, arrange for a relative or neighbour to check in daily, and tell your team so they can suggest support services if available.',
  },
  followup: {
    whyAr: 'موعد المراجعة هو شبكة الأمان: فيه يُفحص الجرح والتحاليل وتُعدَّل الأدوية — تفويته يؤخّر كشف المشاكل وهي صغيرة.',
    whyEn: 'The follow-up appointment is the safety net: the wound and tests are checked and medicines adjusted — missing it delays catching problems while they are small.',
    actionAr: 'إذا لم يكن عندك موعد مؤكّد، اتصل بعيادة فريقك اليوم لتحديده — لا تنتظر ظهور مشكلة.',
    actionEn: 'If you have no confirmed appointment, call your team\'s clinic today to book it — do not wait for a problem to appear.',
  },
};

function CoreWhy({ k, isAr }: { k: string; isAr: boolean }) {
  const e = CORE_WHY[k];
  if (!e) return null;
  return (
    <>
      <p className="text-[11px] leading-relaxed text-sky-800 mb-1.5">
        <span className="font-bold">{isAr ? 'لماذا نسألك؟ ' : 'Why do we ask? '}</span>
        {isAr ? e.whyAr : e.whyEn}
      </p>
      <p className="text-[11px] leading-relaxed text-emerald-900 bg-emerald-50 border border-emerald-100 rounded-lg p-2 mb-2">
        <span className="font-bold">{isAr ? 'شو تعمل؟ ' : 'What to do? '}</span>
        {isAr ? e.actionAr : e.actionEn}
      </p>
    </>
  );
}

export const JourneyTab: React.FC<JourneyTabProps> = ({
  language,
  currentPhase,
  onChangePhase,
  checklist,
  onToggleChecklist,
  doctorNotes,
  onUpdateDoctorNotes,
  medsTaken,
  onToggleMedTaken,
  personalMeds = [],
  onAddPersonalMed,
  onDeletePersonalMed,
  onUpdatePersonalMed,
  prnLogs = [],
  onAddPRNLog,
  onDeletePRNLog,
  checkins,
  onAddCheckin,
  onResetAllDemoData,
  onSimulateCoordinatorAlert,
  journeyJump,
  onAskAboutLabs,
}) => {
  const isAr = language === 'ar';
  const todayStr = new Date().toISOString().split('T')[0];

  // Surgery type drives the procedure-specific follow-up questions
  const [surgeryType, setSurgeryType] = useState<SurgeryType>(getStoredSurgeryType);
  const [otherSurgeryName, setOtherSurgeryName] = useState('');
  // Inline bridge answer — the follow-up answer appears HERE, on this page.
  // The user is never navigated away to the Chat tab for this flow.
  const [bridgeAnswer, setBridgeAnswer] = useState('');
  const [bridgeAsking, setBridgeAsking] = useState(false);
  const [bridgeError, setBridgeError] = useState(false);
  const [bridgeForName, setBridgeForName] = useState('');

  // Generated button questions for operations without a curated set.
  // The model supplies questions only; answers are collected here and shown
  // back as a summary — never as a triage verdict.
  const [genQuestions, setGenQuestions] = useState<{ name: string; items: { ar: string; en: string }[] } | null>(null);
  const [genAnswers, setGenAnswers] = useState<Record<number, 'yes' | 'no'>>({});
  const [genLoading, setGenLoading] = useState(false);
  const [genSummary, setGenSummary] = useState(false);
  const [bridgeFallback, setBridgeFallback] = useState(false);

  const handleAskSurgeryInline = async (name: string) => {
    const prompt = isAr
      ? `أجريت عملية (${name}). من فضلك اذكر لي أسئلة المتابعة الخاصة بهذه العملية تحديداً التي يجب أن أراقبها في المنزل بعد الخروج، مرتّبة من الأهم، والعلامات التي تستدعي التواصل الفوري مع فريقي الطبي أو طلب الإسعاف.`
      : `I had an operation (${name}). Please list the follow-up questions specific to this operation that I should monitor at home after discharge, ordered by importance, and the signs that require immediate contact with my medical team or emergency services.`;
    setBridgeForName(name);
    setBridgeAnswer('');
    setBridgeError(false);
    setBridgeAsking(true);
    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, history: [], stage: currentPhase, language }),
      });
      if (!res.ok || !res.body) throw new Error('stream failed');
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let acc = '';
      let doneFlag = false;
      while (!doneFlag) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                acc += data.text;
                setBridgeAnswer(acc);
              }
              if (data.done) doneFlag = true;
            } catch (e) {}
          }
        }
      }
      if (!acc.trim()) throw new Error('empty reply');
    } catch (err) {
      try {
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt, history: [], stage: currentPhase, language }),
        });
        if (!fallbackRes.ok) throw new Error('fallback failed');
        const data = await fallbackRes.json();
        if (!data.reply) throw new Error('empty reply');
        setBridgeAnswer(data.reply);
      } catch (e2) {
        setBridgeError(true);
      }
    } finally {
      setBridgeAsking(false);
    }
  };

  // Ask for follow-up questions for an unlisted operation: structured
  // button questions first; the prose bridge answer remains the fallback.
  const handleAskSurgery = async (name: string) => {
    setGenLoading(true);
    setGenQuestions(null);
    setGenAnswers({});
    setGenSummary(false);
    setBridgeFallback(false);
    setBridgeAnswer('');
    setBridgeError(false);
    setBridgeForName(name);
    try {
      const res = await fetch('/api/followup-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, language }),
      });
      if (!res.ok) throw new Error('structured questions failed');
      const data = await res.json();
      if (!Array.isArray(data?.questions) || data.questions.length === 0) throw new Error('empty questions');
      setGenQuestions({ name, items: data.questions });
    } catch (err) {
      setBridgeFallback(true);
      await handleAskSurgeryInline(name);
    } finally {
      setGenLoading(false);
    }
  };
  const [procedureAnswers, setProcedureAnswers] = useState<Record<string, 'yes' | 'no'>>({});
  const activeProcedureQuestions = PROCEDURE_QUESTIONS[surgeryType];
  const handleSurgeryTypeChange = (type: SurgeryType) => {
    setSurgeryType(type);
    setStoredSurgeryType(type);
    setProcedureAnswers({});
  };

  // Welcome-page routing / chips land here: apply the requested phase,
  // sub-view and procedure type, and explain the move when it came from chat.
  const [routedNote, setRoutedNote] = useState(false);
  useEffect(() => {
    if (!journeyJump || !journeyJump.n) return;
    if (journeyJump.surgeryType) handleSurgeryTypeChange(journeyJump.surgeryType);
    if (journeyJump.afterView) setAfterView(journeyJump.afterView);
    if (journeyJump.fromChat) setRoutedNote(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyJump]);

  // Check-in form state
  const [breathing, setBreathing] = useState<'better' | 'same' | 'worse'>('same');
  const [fever, setFever] = useState<'yes' | 'no'>('no');
  const [pain, setPain] = useState<number>(2);
  const [walked, setWalked] = useState<'yes' | 'no'>('yes');
  const [mood, setMood] = useState<'good' | 'fair' | 'struggling'>('good');
  const [woundIssue, setWoundIssue] = useState<'none' | 'signs'>('none');
  const [appetite, setAppetite] = useState<'good' | 'low' | 'nausea' | 'vomiting'>('good');
  const [bowelBladder, setBowelBladder] = useState<'normal' | 'difficulty'>('normal');
  const [sleepQuality, setSleepQuality] = useState<'good' | 'broken' | 'none'>('good');
  const [homeSupport, setHomeSupport] = useState<'yes' | 'sometimes' | 'alone'>('yes');
  const [followUpAppt, setFollowUpAppt] = useState<'confirmed' | 'notyet' | 'none'>('confirmed');
  const [mainConcern, setMainConcern] = useState('');
  const [afterView, setAfterView] = useState<'general' | 'personal' | 'meds'>('general');

  // Emergency Red-Flag Symptoms
  const [severeSob, setSevereSob] = useState(false);
  const [severeChestPain, setSevereChestPain] = useState(false);
  const [cyanosis, setCyanosis] = useState(false);

  const [lastCheckinGuidance, setLastCheckinGuidance] = useState<{
    type: 'emergency' | 'urgent' | 'stable';
    text: string;
  } | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Add Personal Medication Modal State
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedFreqType, setNewMedFreqType] = useState<'scheduled' | 'prn'>('scheduled');
  const [newMedTimesPerDay, setNewMedTimesPerDay] = useState(1);
  const [newMedDuration, setNewMedDuration] = useState('');
  const [newMedDoseTimes, setNewMedDoseTimes] = useState<string[]>([]);
  // Per-card dose-time editing (medId -> array of "HH:mm" strings)
  const [doseTimeEdits, setDoseTimeEdits] = useState<Record<string, string[]>>({});
  const [icsDownloadedFor, setIcsDownloadedFor] = useState<string | null>(null);

  // PRN Usage Logger Modal State
  const [prnModalMed, setPrnModalMed] = useState<{ id: string; name: string; defaultDose: string } | null>(null);
  const [prnTime, setPrnTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [prnAmount, setPrnAmount] = useState('');

  // Helper for today's logs of a specific medication
  const getTodayLogsForMed = (medId: string) => {
    return prnLogs.filter((log) => log.medId === medId && log.date === todayStr);
  };

  const handleOpenPRNModal = (medId: string, name: string, defaultDose: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setPrnModalMed({ id: medId, name, defaultDose });
    setPrnTime(timeStr);
    // default suggestion based on drug
    if (name.toLowerCase().includes('inhaler') || name.includes('بخاخ')) {
      setPrnAmount(isAr ? 'بختان (2 puffs)' : '2 puffs');
    } else if (name.toLowerCase().includes('paracetamol') || name.includes('باراسيتامول')) {
      setPrnAmount(isAr ? 'قرص واحد (500 ملغ)' : '1 tablet (500mg)');
    } else {
      setPrnAmount(defaultDose);
    }
  };

  const handleSavePRNUsage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prnModalMed || !onAddPRNLog) return;

    onAddPRNLog({
      medId: prnModalMed.id,
      date: todayStr,
      time: prnTime || '12:00',
      amount: prnAmount.trim() || prnModalMed.defaultDose,
    });

    setPrnModalMed(null);
  };

  const handleSavePersonalMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDose.trim() || !onAddPersonalMed) return;

    onAddPersonalMed({
      name: newMedName.trim(),
      dose: newMedDose.trim(),
      frequencyType: newMedFreqType,
      timesPerDay: newMedFreqType === 'scheduled' ? newMedTimesPerDay : undefined,
      doseTimes:
        newMedFreqType === 'scheduled'
          ? Array.from({ length: newMedTimesPerDay }, (_, i) => newMedDoseTimes[i] || '')
          : undefined,
      duration: newMedDuration.trim() || (isAr ? 'حسب الوصفة' : 'As prescribed'),
    });

    // Reset and close
    setNewMedName('');
    setNewMedDose('');
    setNewMedFreqType('scheduled');
    setNewMedTimesPerDay(1);
    setNewMedDuration('');
    setNewMedDoseTimes([]);
    setShowAddMedModal(false);
  };

  // Procedure-specific alerts feed the same risk categories as the core check-in
  const procedureEmergencyQuestions = activeProcedureQuestions.filter(
    (q) => q.severity === 'emergency' && procedureAnswers[q.id] === q.alertWhen
  );
  const procedureUrgentQuestions = activeProcedureQuestions.filter(
    (q) => q.severity === 'urgent' && procedureAnswers[q.id] === q.alertWhen
  );

  // Determine current live clinical risk category
  const hasEmergencyFlags = severeSob || severeChestPain || cyanosis || procedureEmergencyQuestions.length > 0;
  const isWorseBreathing = breathing === 'worse';
  const hasFever = fever === 'yes';
  const isHighPain = pain >= 7;
  const needsUrgentClinical = isWorseBreathing || hasFever || isHighPain || procedureUrgentQuestions.length > 0 || woundIssue === 'signs' || appetite === 'vomiting';

  const handleCheckinSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emergencyFlagsList: string[] = [];
    if (severeSob) emergencyFlagsList.push(isAr ? 'ضيق نفس شديد أو مفاجئ' : 'severe/sudden shortness of breath');
    if (severeChestPain) emergencyFlagsList.push(isAr ? 'ألم صدري شديد أو ضاغط' : 'severe crushing chest pain');
    if (cyanosis) emergencyFlagsList.push(isAr ? 'ازرقاق في الشفاه أو الوجه' : 'cyanosis / blueness');
    for (const q of procedureEmergencyQuestions) {
      emergencyFlagsList.push(isAr ? q.issueAr : q.issueEn);
    }

    const issues: string[] = [];
    if (isWorseBreathing) issues.push(isAr ? 'تدهور التنفس مقارنة بالأمس' : 'worsening breathing');
    if (hasFever) issues.push(isAr ? 'ارتفاع درجة الحرارة / حمى' : 'reported fever');
    if (isHighPain) issues.push(isAr ? `ألم شديد بمستوى (${pain}/10)` : `severe pain (${pain}/10)`);
    if (woundIssue === 'signs') issues.push(isAr ? 'علامات محتملة لالتهاب الجرح (احمرار/تورم/إفراز)' : 'possible wound infection signs (redness/swelling/discharge)');
    if (appetite === 'vomiting') issues.push(isAr ? 'استفراغ متكرر' : 'repeated vomiting');
    for (const q of procedureUrgentQuestions) {
      issues.push(isAr ? q.issueAr : q.issueEn);
    }

    // Arabic variants for the clinician-board alert cases, regardless of the
    // UI language in use when the alert was generated.
    const arEmergencyFlags: string[] = [];
    if (severeSob) arEmergencyFlags.push('ضيق نفس شديد أو مفاجئ');
    if (severeChestPain) arEmergencyFlags.push('ألم صدري شديد أو ضاغط');
    if (cyanosis) arEmergencyFlags.push('ازرقاق في الشفاه أو الوجه');
    for (const q of procedureEmergencyQuestions) arEmergencyFlags.push(q.issueAr);
    const arIssues: string[] = [];
    if (isWorseBreathing) arIssues.push('تدهور التنفس مقارنة بالأمس');
    if (hasFever) arIssues.push('ارتفاع درجة الحرارة / حمى');
    if (isHighPain) arIssues.push(`ألم شديد بمستوى (${pain}/10)`);
    if (woundIssue === 'signs') arIssues.push('علامات محتملة لالتهاب الجرح (احمرار/تورم/إفراز)');
    if (appetite === 'vomiting') arIssues.push('استفراغ متكرر');
    for (const q of procedureUrgentQuestions) arIssues.push(q.issueAr);

    let guidanceType: 'emergency' | 'urgent' | 'stable' = 'stable';
    let guidanceText = '';

    if (hasEmergencyFlags) {
      guidanceType = 'emergency';
      guidanceText = isAr
        ? `حالة طارئة تستدعي طلب الإسعاف فوراً: اتصل بالإسعاف (997 أو رقم الطوارئ المحلي) أو توجه فوراً لأقرب قسم طوارئ. الأعراض المرصودة (${emergencyFlagsList.join('، ')}) تمثل علامات خطر محتملة تستوجب تدخلاً طبياً عاجلاً بدون تأخير — لا يُكتفى بالمتابعة المنزلية أو انتظار موعد عادي.`
        : `Emergency situation requiring immediate ambulance dispatch: Call emergency services (997 or local emergency number) or proceed to the nearest emergency department immediately. The reported symptoms (${emergencyFlagsList.join(', ')}) indicate potential danger requiring immediate clinical intervention — do not rely on home monitoring or wait for scheduled visits.`;

      // Add simulated emergency triage case to Clinician Board
      const alertId = `ALERT-EMERG-${Date.now().toString().slice(-4)}`;
      onSimulateCoordinatorAlert({
        id: alertId,
        nameAr: 'مريض تجريبي (تنبيه طوارئ فوري)',
        nameEn: 'Demo Patient (Emergency Red-Flag)',
        age: 50,
        type: 'Emergency Red-Flag Triggered',
        resultSummary: `EMERGENCY: ${emergencyFlagsList.join(', ')}`,
        plainLanguageExplanation: `Synthetic post-discharge daily check-in triggered immediate emergency criteria: ${emergencyFlagsList.join(', ')}.`,
        whatItDoesNotEstablish: 'Flagged for urgent simulation; directs immediate ambulance request.',
        sourceNote: 'Post-Discharge Daily Check-in (Emergency Red-Flag)',
        resultDate: todayStr,
        owner: 'Emergency Triage Lead (Simulated)',
        notificationSla: 'Immediate (0 minutes)',
        referralTarget: 'Emergency Department Review',
        referralStatus: 'pending',
        appointmentInfo: 'Immediate Emergency Care Directed (Simulated)',
        status: 'overdue',
        scenarioDescription: 'Phase-3 recovery check-in flagged severe red-flag requiring immediate emergency services.',
        typeAr: 'تنبيه علامة حمراء طارئة',
        resultSummaryAr: `طارئ: ${arEmergencyFlags.join('، ')}`,
        plainLanguageExplanationAr: `أطلق تقييم التعافي اليومي الاصطناعي بعد الخروج معايير طارئة فورية: ${arEmergencyFlags.join('، ')}.`,
        whatItDoesNotEstablishAr: 'عُلم لمحاكاة عاجلة؛ يوجه لطلب إسعاف فوري.',
        scenarioDescriptionAr: 'رصد تقييم تعافي المرحلة الثالثة علامة حمراء شديدة تتطلب خدمات طوارئ فورية.',
        referralTargetAr: 'مراجعة قسم الطوارئ',
        appointmentInfoAr: 'وُجهت رعاية طارئة فورية (محاكاة)',
        notificationSlaAr: 'فوري (0 دقيقة)',
        isSimulatedAlert: true,
        alertSource: 'Post-discharge Recovery Check-in (Emergency)'
      });
    } else if (needsUrgentClinical) {
      guidanceType = 'urgent';
      guidanceText = isAr
        ? `يوصى بإجراء تقييم طبي عاجل والتواصل المباشر مع فريقك الطبي اليوم لمراجعة: ${issues.join('، ')}. لا يُنصح بالاكتفاء بالمتابعة المنزلية في ظل وجود هذه الأعراض.`
        : `Urgent clinical assessment recommended: contact your clinical care team today to review: ${issues.join(', ')}. Home monitoring alone is not advised given these active symptoms.`;

      // Add simulated coordinator alert to Clinician Board
      const alertId = `ALERT-POSTOP-${Date.now().toString().slice(-4)}`;
      onSimulateCoordinatorAlert({
        id: alertId,
        nameAr: 'مريض تجريبي (محاكاة متابعة عاجلة)',
        nameEn: 'Demo Patient (Urgent Post-op Alert)',
        age: 50,
        type: 'Post-discharge follow-up',
        resultSummary: `Urgent check-in parameters: ${issues.join(', ')}`,
        plainLanguageExplanation: `Synthetic post-discharge daily recovery check-in flagged clinical parameters: ${issues.join(', ')}.`,
        whatItDoesNotEstablish: 'Does not establish diagnosis; triggers coordinator triage review.',
        sourceNote: 'Synthetic Post-Discharge Daily Check-in',
        resultDate: todayStr,
        owner: 'Nurse Sarah (Simulated)',
        notificationSla: 'Within 4 hours',
        referralTarget: 'Outpatient Respiratory Care Coordinator',
        referralStatus: 'pending',
        appointmentInfo: 'Follow-up triage review triggered (Simulated)',
        status: 'on_track',
        scenarioDescription: 'Phase-3 recovery check-in alert triggered for clinical coordinator assessment.',
        typeAr: 'متابعة ما بعد الخروج',
        resultSummaryAr: `معايير تقييم عاجلة: ${arIssues.join('، ')}`,
        plainLanguageExplanationAr: `رصد تقييم التعافي اليومي الاصطناعي بعد الخروج معايير سريرية: ${arIssues.join('، ')}.`,
        whatItDoesNotEstablishAr: 'لا يثبت تشخيصاً؛ يطلق مراجعة فرز من المنسق.',
        scenarioDescriptionAr: 'أطلق تنبيه تقييم تعافي المرحلة الثالثة لتقييم منسق سريري.',
        referralTargetAr: 'منسق رعاية الجهاز التنفسي الخارجي',
        appointmentInfoAr: 'أُطلقت مراجعة فرز للمتابعة (محاكاة)',
        notificationSlaAr: 'خلال 4 ساعات',
        isSimulatedAlert: true,
        alertSource: 'Post-discharge Recovery Check-in (Simulated)'
      });
    } else {
      guidanceType = 'stable';
      guidanceText = isAr
        ? 'متابعة منزلية مناسبة: حالتك مستقرة حالياً وفق استجاباتك اليوم. استمر في الراحة، وشرب السوائل الكافية، والالتزام بجدول أدويتك، وملاحظة أي أعراض جديدة.'
        : 'Home monitoring is appropriate: your recovery parameters are stable based on today’s responses. Continue resting, hydrating, following your medication schedule, and watching for new changes.';
    }

    // Soft follow-up notes (never escalate; guidance and self-care only)
    const softNotes: string[] = [];
    if (walked === 'no') softNotes.push(isAr ? 'حاول أن تتحرك وتمشي قليلاً داخل المنزل اليوم إن استطعت — الحركة الخفيفة تدعم التعافي والدورة الدموية.' : 'Try to move and walk a little at home today if you can — gentle movement supports recovery and circulation.');
    if (bowelBladder === 'difficulty') softNotes.push(isAr ? 'للإمساك أو صعوبة التبول: اشرب سوائل كافية وتحرّك، وأخبر فريقك الطبي إذا استمر الأمر.' : 'For constipation or difficulty urinating: drink enough fluids and keep moving, and tell your medical team if it continues.');
    if (sleepQuality === 'broken' || sleepQuality === 'none') softNotes.push(isAr ? 'نومك مهم للتعافي: حاول قيلولة قصيرة نهاراً وروتيناً هادئاً قبل النوم.' : 'Sleep matters for recovery: try a short daytime nap and a calm pre-sleep routine.');
    if (mood === 'struggling') softNotes.push(isAr ? 'الشعور بالإرهاق بعد العملية شائع؛ إذا استمر، أخبر فريقك الطبي في المراجعة.' : 'Feeling drained after surgery is common; if it persists, tell your medical team at your review.');
    if (appetite === 'low' || appetite === 'nausea') softNotes.push(isAr ? 'للشهية القليلة أو الغثيان: وجبات صغيرة متكررة وسوائل، وأخبر فريقك إذا لم تتحسن.' : 'For low appetite or nausea: small frequent meals and fluids, and tell your team if it does not improve.');
    if (homeSupport === 'alone') softNotes.push(isAr ? 'أنت وحدك في المنزل: أبقِ هاتفك قريباً وأرقام الطوارئ في متناولك، واطلب مساعدة قريب أو جار عند الحاجة.' : 'You are home alone: keep your phone close and emergency numbers at hand, and ask a relative or neighbour for help when needed.');
    if (followUpAppt === 'notyet') softNotes.push(isAr ? 'تذكير: أكّد موعد مراجعتك مع فريقك الطبي.' : 'Reminder: confirm your follow-up appointment with your medical team.');
    if (followUpAppt === 'none') softNotes.push(isAr ? 'ليس لديك موعد مراجعة بعد: تواصل مع عيادتك لحجز موعد متابعة — المتابعة جزء من إغلاق خطة رعايتك.' : 'You have no follow-up appointment yet: contact your clinic to book one — follow-up is part of closing your care plan.');
    if (guidanceType !== 'emergency' && softNotes.length > 0) {
      guidanceText += (isAr ? ' ملاحظات لمتابعتك: ' : ' Notes for your follow-up: ') + softNotes.join(' ');
    }

    setLastCheckinGuidance({ type: guidanceType, text: guidanceText });

    onAddCheckin({
      date: todayStr,
      breathing,
      fever,
      pain,
      walked,
      mood,
      severeRedFlags: emergencyFlagsList.length > 0 ? emergencyFlagsList : undefined,
      isWarning: needsUrgentClinical || hasEmergencyFlags,
      isEmergency: hasEmergencyFlags,
      warningSummary: guidanceText,
      surgeryType,
      woundIssue,
      appetite,
      bowelBladder,
      sleepQuality,
      homeSupport,
      followUpAppt,
      mainConcern: mainConcern.trim() ? mainConcern.trim() : undefined,
      procedureAnswers:
        activeProcedureQuestions.length > 0
          ? activeProcedureQuestions
              .filter((q) => procedureAnswers[q.id])
              .map((q) => ({ questionId: q.id, answer: procedureAnswers[q.id] }))
          : undefined
    });
  };

  const todayMeds = medsTaken[todayStr] || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Page Title — what this page is, before anything else */}
      <div className="text-center sm:text-start space-y-1 pt-1">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-sky-950">
          {isAr ? 'رفيق رحلتك من الدخول للمشفى إلى التعافي في المنزل' : 'Your Journey Companion — from Hospital Admission to Recovery at Home'}
        </h1>
      </div>

      {/* Routed here from the welcome chat — say why, and where the answer lives */}
      {routedNote && (
        <div className="bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <p className="flex-1 text-xs sm:text-sm text-sky-950 leading-relaxed">
            {isAr
              ? 'نقلناك إلى «رحلتي» لأن سؤالك يتعلق بعمليتك ومتابعتها. إجابة رعاية عن سؤالك محفوظة في تبويب المحادثة، ويمكنك الرجوع إليها في أي وقت.'
              : 'We brought you to My Journey because your question is about your own operation and its follow-up. Riaya\'s answer to your question is saved in the Chat tab, and you can return to it any time.'}
          </p>
          <button type="button" onClick={() => setRoutedNote(false)} className="text-sky-400 hover:text-sky-700 cursor-pointer shrink-0" aria-label={isAr ? 'إغلاق' : 'Close'}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Journey Phase Tabs */}
      <div className="bg-white border border-sky-100 rounded-2xl p-2 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          <button
            onClick={() => onChangePhase('before')}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
              currentPhase === 'before'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-sky-800 hover:bg-slate-50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{isAr ? '1. قبل دخول المستشفى' : '1. Before Hospital'}</span>
          </button>
          <button
            onClick={() => onChangePhase('during')}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
              currentPhase === 'during'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-sky-800 hover:bg-slate-50'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{isAr ? '2. أثناء الإقامة في المستشفى' : '2. During Hospital Stay'}</span>
          </button>
          <button
            onClick={() => onChangePhase('after')}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
              currentPhase === 'after'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-sky-800 hover:bg-slate-50'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>{isAr ? '3. بعد الخروج والتعافي' : '3. After Discharge at Home'}</span>
          </button>
        </div>
      </div>

      {/* PHASE 1: BEFORE HOSPITAL */}
      {currentPhase === 'before' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {isAr ? 'قائمة الاستعداد قبل دخول المستشفى' : 'Pre-Admission Preparation Checklist'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? 'خطوات عملية محددة لمساعدتك على تنظيم معلوماتك وأدويتك قبل موعد الدخول المخطط له.'
                  : 'Actionable steps to organize your health records and medications prior to scheduled admission.'}
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {isAr
                  ? 'تنبيه أمان سريري: لا توقف أي دواء موصوف أو تبدأ في الصيام دون اتباع التعليمات الصريحة والفردية الصادرة من فريقك الطبي المعالج.'
                  : 'Clinical Safety Notice: Never stop a prescribed medication or initiate fasting without following the explicit, individualized instructions of your clinical care team.'}
              </span>
            </div>

            <div className="space-y-2.5">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onToggleChecklist(item.id)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer min-h-[48px] ${
                    item.completed
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                      : 'bg-white border-slate-200 hover:bg-slate-50/80 text-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    className="shrink-0 cursor-pointer"
                    aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-700" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      item.completed ? 'line-through text-slate-500' : 'text-slate-900'
                    }`}
                  >
                    {isAr ? item.textAr : item.textEn}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: DURING HOSPITAL STAY */}
      {currentPhase === 'during' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {isAr ? 'إرشادات التواصل أثناء الإقامة في المستشفى' : 'Communication & Partnership on the Ward'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? 'أربع ركائز أساسية لضمان سلامتك وفهم خطتك العلاجية يوماً بيوم.'
                  : 'Four foundational guidelines to ensure personal safety and active partnership during ward stay.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {DURING_HOSPITAL_POINTS.map((pt, idx) => (
                <div
                  key={pt.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm">
                      {isAr ? pt.titleAr : pt.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isAr ? pt.descAr : pt.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-sky-600" />
                <h3 className="text-base font-bold text-slate-900">
                  {isAr ? 'أسئلتي للطبيب' : 'My Questions for the Doctor'}
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {isAr ? 'محفوظ محلياً تلقائياً' : 'Auto-saved locally'}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              {isAr
                ? 'اكتب هنا أي استفسار يطرأ ببالك لتبقى جاهزاً حينما يمر الطبيب في الجولة الصباحية.'
                : 'Write questions here as they come to mind so you are ready when your physician visits during rounds.'}
            </p>

            <textarea
              value={doctorNotes}
              onChange={(e) => onUpdateDoctorNotes(e.target.value)}
              placeholder={
                isAr
                  ? 'اكتب أسئلتك هنا... مثال: متى أتوقع نتائج فحص الدم؟ ما هي خطة غد؟'
                  : 'Type your questions here... e.g. What do my blood results mean? What is the expected discharge timeline?'
              }
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-700 transition-all font-sans"
            />
          </div>
        </div>
      )}

      {/* PHASE 3: AFTER DISCHARGE & RECOVERY AT HOME */}
      {currentPhase === 'after' && (
        <div className="space-y-6">
          {/* Labs & reports understanding — tied to this patient's own journey */}
          {onAskAboutLabs && (
            <div className="bg-gradient-to-l from-sky-50 to-white border border-sky-200 rounded-2xl p-4 shadow-2xs">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-sky-700 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <h3 className="text-sm sm:text-base font-bold text-sky-950">
                    {isAr ? 'هل لديك سؤال عن تحاليلك أو تقاريرك الطبية؟' : 'Do you have a question about your lab results or medical reports?'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isAr
                      ? 'رعاية بتساعدك تفهم نتيجة تحليل أو تقرير مرتبط بحالتك ورحلتك: شو بتعني النتيجة، وشو يلي ما فينا نستنتجو من نتيجة لحالها، وأيمتى لازم تراجع طبيبك. الشرح تثقيفي وما بيغني عن تفسير طبيبك المعالج.'
                      : 'Riaya can help you understand a lab result or report in the context of your own case and journey: what the result means, what cannot be concluded from a single result alone, and when you should check with your doctor. The explanation is educational and does not replace your treating doctor\'s interpretation.'}
                  </p>
                  <button
                    type="button"
                    onClick={onAskAboutLabs}
                    className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-sky-600 hover:bg-sky-800 text-white transition-colors cursor-pointer min-h-[40px]"
                  >
                    {isAr ? 'اسأل رعاية عن تحاليلي وتقاريري' : 'Ask Riaya about my results and reports'}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* After-discharge sub-views: General Instructions | My Personal Follow-up | My Medications */}
          <div className="bg-white border border-sky-100 rounded-2xl p-2 shadow-2xs">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setAfterView('general')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                  afterView === 'general'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-sky-800 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{isAr ? 'تعليمات عامة' : 'General Instructions'}</span>
              </button>
              <button
                type="button"
                onClick={() => setAfterView('personal')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                  afterView === 'personal'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-sky-800 hover:bg-slate-50'
                }`}
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>{isAr ? 'متابعتي الخاصة' : 'My Personal Follow-up'}</span>
              </button>
              <button
                type="button"
                onClick={() => setAfterView('meds')}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[44px] ${
                  afterView === 'meds'
                    ? 'bg-sky-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-sky-800 hover:bg-slate-50'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>{isAr ? 'أدويتي' : 'My Medications'}</span>
              </button>
            </div>
          </div>

          {afterView === 'general' && (
            <div className="space-y-6">
              {/* Before leaving the hospital — documents & essentials */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <h3 className="font-bold text-slate-900 text-base">
                  {isAr ? 'قبل مغادرة المستشفى — تأكّد أن معك:' : 'Before leaving the hospital — make sure you have:'}
                </h3>
                <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
                  {[
                    isAr ? 'أدوية الخروج وطريقة استخدامها ومواعيدها' : 'Your discharge medications, how and when to take them',
                    isAr ? 'تعليمات الطبيب المكتوبة للعناية في المنزل' : "Your doctor's written home-care instructions",
                    isAr ? 'تقرير الخروج الطبي (ملخص إقامتك وعمليتك ونتائجك)' : 'Your medical discharge report (summary of your stay, operation, and results)',
                    isAr ? 'موعد المراجعة القادم، أو طريقة حجزه، ورقم للتواصل عند الحاجة' : 'Your next follow-up appointment — or how to book it — and a contact number',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* General home-recovery guidance (NHS-based) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                <h3 className="font-bold text-slate-900 text-base">
                  {isAr ? 'إرشادات عامة للتعافي في المنزل:' : 'General guidance for recovering at home:'}
                </h3>
                <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
                  {[
                    isAr ? 'اعتنِ بجرحك: أبقِه نظيفاً وجافاً واتبع تعليمات فريقك عن الضماد؛ راقب الاحمرار أو التورم أو الإفراز.' : 'Care for your wound: keep it clean and dry and follow your team’s dressing instructions; watch for redness, swelling, or discharge.',
                    isAr ? 'تحرّك وامشِ تدريجياً كل يوم قدر استطاعتك — الحركة تدعم الشفاء والدورة الدموية.' : 'Move and walk a little more each day as you are able — movement supports healing and circulation.',
                    isAr ? 'الاستحمام: عادة يمكنك الاستحمام بعد 48 ساعة إذا سمح طبيبك، ولا تنقع الجرح في الماء (حمام أو سباحة) حتى يلتئم تماماً أو يقول طبيبك إنه آمن.' : 'Washing: you can usually shower 48 hours after surgery unless advised otherwise, and do not soak the wound in water (bath or swimming) until it has completely healed or your doctor says it is safe.',
                    isAr ? 'علامات جلطة محتملة في الساق: ألم أو تورم في الساق، سخونة أو تغيّر لون الجلد، أو عروق بارزة — اطلب مساعدة طبية فوراً.' : 'Possible blood-clot signs in the leg: pain or swelling, hot or discoloured skin, or enlarged surface veins — seek medical help immediately.',
                    isAr ? 'خذ أدويتك تماماً كما وُصفت لك، ولا توقف أي دواء دون سؤال فريقك الطبي.' : 'Take your medications exactly as prescribed, and do not stop any medication without asking your medical team.',
                    isAr ? 'عند أي علامة مقلقة — حرارة، نزيف، ألم يتزايد، إفراز من الجرح — تواصل مع فريقك الطبي فوراً ولا تنتظر موعد المراجعة.' : 'With any worrying sign — fever, bleeding, increasing pain, wound discharge — contact your medical team immediately; do not wait for the review appointment.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2">
                  {isAr
                    ? 'المصدر: NHS — «إجراء عملية جراحية: العودة إلى الحياة الطبيعية» (إرشادات التعافي بعد العمليات): https://www.nhs.uk/tests-and-treatments/having-surgery/recovery/ — إرشادات عامة لا تغني عن تعليمات فريقك الطبي.'
                    : 'Source: NHS — "Having an operation (surgery): Getting back to normal" (recovery guidance): https://www.nhs.uk/tests-and-treatments/having-surgery/recovery/ — general guidance; it does not replace your medical team’s instructions.'}
                </p>
              </div>

            </div>
          )}

          {afterView === 'personal' && (
          <>
          {/* SECTION 3: DAILY RECOVERY CHECK-IN (التقييم اليومي للتعافي) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {isAr ? 'التقييم اليومي للتعافي' : 'Daily Recovery Check-In'}
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {isAr ? 'المتابعة المنزلية' : 'Home Monitoring'}
              </span>
            </div>

            {/* Display submitted guidance notice */}
            {lastCheckinGuidance && (
              <div
                className={`p-4 rounded-xl border-2 flex items-start gap-3 shadow-xs ${
                  lastCheckinGuidance.type === 'emergency'
                    ? 'bg-rose-50 border-rose-500 text-rose-950'
                    : lastCheckinGuidance.type === 'urgent'
                    ? 'bg-amber-50 border-amber-500 text-amber-950'
                    : 'bg-emerald-50 border-emerald-500 text-emerald-950'
                }`}
              >
                {lastCheckinGuidance.type === 'emergency' ? (
                  <PhoneCall className="w-5 h-5 text-rose-600 shrink-0 mt-0.5 animate-pulse" />
                ) : lastCheckinGuidance.type === 'urgent' ? (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <HeartPulse className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs leading-relaxed space-y-1">
                  <div className="font-bold text-sm">
                    {lastCheckinGuidance.type === 'emergency'
                      ? (isAr ? '🚨 حالة طارئة — اطلب الإسعاف فوراً' : '🚨 Emergency — Call Ambulance Immediately')
                      : lastCheckinGuidance.type === 'urgent'
                      ? (isAr ? '⚠️ تقييم طبي عاجل مطلوب اليوم' : '⚠️ Urgent Clinical Assessment Required')
                      : (isAr ? '✓ إرشاد التعافي: متابعة منزلية مناسبة' : '✓ Recovery Guidance: Home Monitoring Appropriate')}
                  </div>
                  <p className="font-medium">{lastCheckinGuidance.text}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCheckinSubmit} className="space-y-4">
              {/* Surgery type: follow-up questions adapt to the operation */}
              <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3 space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  {isAr
                    ? 'نوع العملية / المتابعة — أسئلة المتابعة الخاصة تتغير حسب نوع العملية:'
                    : 'Surgery / follow-up type — the specific follow-up questions change with the operation:'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'general' as SurgeryType, ar: 'متابعة عامة', en: 'General follow-up' },
                    { val: 'thyroid' as SurgeryType, ar: 'عملية الغدة الدرقية', en: 'Thyroid surgery' },
                    { val: 'cesarean' as SurgeryType, ar: 'عملية قيصرية', en: 'Cesarean section' },
                    { val: 'catheter' as SurgeryType, ar: 'قثطرة قلبية', en: 'Cardiac catheterization' },
                    { val: 'gallbladder' as SurgeryType, ar: 'استئصال المرارة', en: 'Gallbladder removal' },
                    { val: 'other' as SurgeryType, ar: 'عملية أخرى', en: 'Another operation' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => handleSurgeryTypeChange(opt.val)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        surgeryType === opt.val
                          ? 'bg-sky-600 text-white border-sky-600 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
                {surgeryType === 'thyroid' && (
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    {isAr
                      ? 'ستظهر أسئلة خاصة بمتابعة عملية الغدة الدرقية بعد الأسئلة العامة (نزيف مكان العملية، الضماد، البحة، الوخز).'
                      : 'Thyroid-specific follow-up questions will appear after the general questions (operation-site bleeding, dressing, hoarseness, tingling).'}
                  </p>
                )}
                {surgeryType === 'cesarean' && (
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    {isAr
                      ? 'ستظهر أسئلة خاصة بمتابعة العملية القيصرية بعد الأسئلة العامة (النزيف، الصداع الشديد، الجرح، ألم الساق).'
                      : 'Cesarean-specific follow-up questions will appear after the general questions (bleeding, severe headache, wound, leg pain).'}
                  </p>
                )}
                {/* Caesarean-specific follow-up instructions (NICE NG192-grounded) — shown only with the caesarean follow-up */}
                {surgeryType === 'cesarean' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
                  <h3 className="font-bold text-slate-900 text-base">
                    {isAr ? 'تعليمات خاصة — المتابعة بعد العملية القيصرية' : 'Specific instructions — follow-up after a caesarean birth'}
                  </h3>
                  <ul className="space-y-2 text-sm text-slate-700 leading-relaxed">
                    {[
                      isAr ? 'الجرح: حافظي عليه نظيفاً وجافاً، والبسي ملابس واسعة ومريحة. راقبي علامات الالتهاب: ألم متزايد، احمرار، إفراز أو رائحة من الجرح، أو حرارة.' : 'Your wound: keep it clean and dry, and wear loose, comfortable clothing. Watch for signs of infection: increasing pain, redness, discharge or smell from the wound, or fever.',
                      isAr ? 'الألم: خذي المسكّنات بانتظام كما وُصفت لك. الألم الطبيعي يخفّ تدريجياً يوماً بعد يوم — إذا ازداد بدل أن يخفّ، تواصلي مع فريقك.' : 'Pain: take your pain relief regularly as prescribed. Normal pain eases gradually day by day — if it gets worse instead of better, contact your team.',
                      isAr ? 'الحركة: امشي مبكراً وبشكل تدريجي كل يوم — الحركة تحميك من جلطات الساق. في الأسابيع الأولى تجنّبي رفع أي شيء أثقل من طفلك.' : 'Movement: walk early and gradually every day — moving protects you from leg blood clots. In the first weeks, avoid lifting anything heavier than your baby.',
                      isAr ? 'النزيف المهبلي (الهلابة): طبيعي بعد الولادة ويخفّ مع الوقت. نزيف غزير، كتل كبيرة، أو رائحة كريهة — تواصلي مع فريقك فوراً.' : 'Vaginal bleeding (lochia): normal after birth and it lessens over time. Heavy bleeding, large clots, or a bad smell — contact your team immediately.',
                      isAr ? 'علامات خطر في أي وقت: حرارة، ألم أو تورّم في الساق، ضيق نفس أو ألم في الصدر — اطلبي مساعدة طبية فورية.' : 'Warning signs at any time: fever, leg pain or swelling, breathlessness or chest pain — seek urgent medical help.',
                      isAr ? 'القيادة والرياضة: ارجعي لأنشطتك تدريجياً عندما تستطيعين التحرك براحة، واسألي فريقك الطبي (وشركة التأمين) تحديداً عن توقيت القيادة.' : 'Driving and exercise: return to your activities gradually once you can move comfortably, and ask your medical team (and insurer) specifically about when to drive.',
                    ].map((line, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-sky-700 font-bold">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-2.5">
                    {isAr
                      ? 'المصدر: NICE — دليل الولادة القيصرية NG192: https://www.nice.org.uk/guidance/NG192/chapter/recommendations — إرشادات عامة لا تغني عن تعليمات فريقك الطبي.'
                      : 'Source: NICE — Caesarean birth guideline NG192: https://www.nice.org.uk/guidance/NG192/chapter/recommendations — general guidance; it does not replace your medical team’s instructions.'}
                  </p>
                </div>
                )}
                {surgeryType === 'catheter' && (
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    {isAr
                      ? 'ستظهر أسئلة خاصة بمتابعة القثطرة القلبية بعد الأسئلة العامة (نزيف أو تورّم موضع القثطرة، ألم الصدر، تروية الطرف، التنفس، الحرارة).'
                      : 'Cardiac-catheterization follow-up questions will appear after the general questions (site bleeding or swelling, chest pain, limb circulation, breathing, fever).'}
                  </p>
                )}
                {surgeryType === 'gallbladder' && (
                  <p className="text-[11px] text-sky-800 leading-relaxed">
                    {isAr
                      ? 'ستظهر أسئلة خاصة بمتابعة استئصال المرارة بعد الأسئلة العامة (ألم البطن المتزايد، الحرارة، الجرح، الاصفرار، الساق، القيء).'
                      : 'Gallbladder-removal follow-up questions will appear after the general questions (worsening abdominal pain, fever, wound, jaundice, leg, vomiting).'}
                  </p>
                )}
                {surgeryType === 'other' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-sky-800 leading-relaxed">
                      {isAr
                        ? 'لكل عملية أسئلة متابعة خاصة بها. اكتب اسم عمليتك واسأل رعاية — ستعطيك أسئلة متابعة مبنية على إرشادات طبية موثّقة عامة للتعافي بعد العمليات، والعلامات التي تستدعي التواصل الفوري مع فريقك الطبي. هذه الإرشادات لا تغني عن سؤال فريقك الطبي عن كل ما يخصّ عمليتك تحديداً.'
                        : 'Every operation has its own follow-up questions. Type your operation name and ask Riaya — it will give you follow-up questions based on verified general medical guidance for recovery after surgery, and the signs that need immediate contact with your medical team. These guidelines do not replace asking your medical team about anything specific to your operation.'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={otherSurgeryName}
                        onChange={(e) => setOtherSurgeryName(e.target.value)}
                        placeholder={isAr ? 'اسم العملية (مثال: استئصال المرارة)' : 'Operation name (e.g. gallbladder removal)'}
                        className="flex-1 bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[40px]"
                      />
                      <button
                        type="button"
                        disabled={!otherSurgeryName.trim() || bridgeAsking || genLoading}
                        onClick={() => handleAskSurgery(otherSurgeryName.trim())}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg min-h-[40px] transition-colors ${
                          !otherSurgeryName.trim() || bridgeAsking || genLoading
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-sky-600 hover:bg-sky-800 text-white cursor-pointer'
                        }`}
                      >
                        {bridgeAsking || genLoading
                          ? isAr
                            ? 'رعاية عم تجاوب…'
                            : 'Riaya is answering…'
                          : isAr
                            ? 'اسأل رعاية عن متابعة عمليتي'
                            : 'Ask Riaya about my follow-up'}
                      </button>
                    </div>

                    {/* Inline answer — stays on this page, no navigation */}
                    {(bridgeAsking || bridgeAnswer || bridgeError) && (
                      <div className="bg-white border border-sky-200 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-sky-900">
                            {isAr ? `متابعة عملية: ${bridgeForName}` : `Follow-up for: ${bridgeForName}`}
                          </span>
                          {!bridgeAsking && (
                            <button
                              type="button"
                              onClick={() => {
                                setBridgeAnswer('');
                                setBridgeError(false);
                              }}
                              className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {isAr ? 'مسح' : 'Clear'}
                            </button>
                          )}
                        </div>
                        {bridgeFallback && !bridgeAsking && (
                          <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-lg p-2 leading-relaxed">
                            {isAr
                              ? 'ملاحظة: تعذّر توليد أسئلة المتابعة كأزرار لهذه العملية، فعرضنا الإرشادات العامة نصياً بدلاً منها — وهي إرشادات عامة، ليست متابعة مخصصة لعمليتك.'
                              : 'Note: button questions could not be generated for this operation, so the general guidance is shown as text instead — it is general guidance, not follow-up tailored to your operation.'}
                          </p>
                        )}
                        {bridgeError ? (
                          <p className="text-xs text-rose-600 leading-relaxed">
                            {isAr
                              ? 'تعذّر جلب الإجابة الآن. تحقّق من اتصالك وحاول مجدداً — أو اسأل رعاية من تبويب المحادثة.'
                              : 'The answer could not be loaded right now. Check your connection and try again — or ask Riaya from the Chat tab.'}
                          </p>
                        ) : bridgeAnswer ? (
                          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                            {bridgeAnswer}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 animate-pulse">
                            {isAr ? 'رعاية عم تحضّر أسئلة المتابعة…' : 'Riaya is preparing the follow-up questions…'}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Generated button questions — for operations without a curated set.
                        Questions only: no severity, no verdicts. The summary repeats the
                        user's own answers back; triage stays with the core questions below. */}
                    {(genLoading || genQuestions) && (
                      <div className="bg-white border border-sky-200 rounded-xl p-3.5 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-sky-900">
                            {isAr ? `متابعة عملية: ${genQuestions?.name || bridgeForName}` : `Follow-up for: ${genQuestions?.name || bridgeForName}`}
                          </span>
                          {!genLoading && (
                            <button
                              type="button"
                              onClick={() => {
                                setGenQuestions(null);
                                setGenAnswers({});
                                setGenSummary(false);
                              }}
                              className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {isAr ? 'مسح' : 'Clear'}
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-sky-900 bg-sky-50 border border-sky-100 rounded-lg p-2 leading-relaxed">
                          {isAr
                            ? 'أسئلة متابعة عامة مولّدة بالذكاء الاصطناعي بناءً على مبادئ التعافي العامة بعد العمليات (NHS) — ليست بروتوكولاً موثّقاً خاصاً بعمليتك، وقد لا تشمل كل ما يخصّها، وأجوبتك هنا لا تُستخدم لتشخيص حالتك أو فرزها. الفرز والتنبيهات في هذا النموذج تأتي من الأسئلة الأساسية وقائمة علامات الخطر أدناه.'
                            : 'General follow-up questions generated by AI from general post-surgery recovery principles (NHS) — not a verified protocol for your specific operation, and they may not cover everything relevant to it. Your answers here are not used to diagnose or triage you. Triage and alerts in this form come from the core questions and the red-flag list below.'}
                        </p>
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                          <p className="text-xs font-semibold text-rose-900 leading-relaxed">
                            {isAr
                              ? 'قبل أن تبدأ: علامات الخطر لا تنتظر الأسئلة — نزيف لا يتوقف، ألم أو ضغط في الصدر، ضيق شديد أو مفاجئ في التنفس، حرارة عالية، إغماء أو تشوّش. إذا ظهر أي منها الآن، اطلب المساعدة الطبية فوراً ولا تكمل الأسئلة.'
                              : 'Before you start: red flags do not wait for questions — unstoppable bleeding, chest pain or pressure, severe or sudden breathlessness, high fever, fainting or confusion. If any is present now, seek medical help immediately and do not continue the questions.'}
                          </p>
                        </div>
                        {genLoading && !genQuestions ? (
                          <p className="text-xs text-slate-500 animate-pulse">
                            {isAr ? 'رعاية عم تحضّر أسئلة المتابعة…' : 'Riaya is preparing the follow-up questions…'}
                          </p>
                        ) : genQuestions ? (
                          <>
                            <div className="space-y-3">
                              {genQuestions.items.map((q, qi) => (
                                <div key={qi}>
                                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    {`${qi + 1}. ${isAr ? q.ar : (q.en || q.ar)}`}
                                  </label>
                                  {(() => {
                                    const why = explainQuestion(q.ar, q.en);
                                    if (!why) return null;
                                    return (
                                      <p className="text-[11px] leading-relaxed text-sky-800 mb-1.5">
                                        <span className="font-bold">{isAr ? 'لماذا نسألك؟ ' : 'Why do we ask? '}</span>
                                        {isAr ? why.whyAr : why.whyEn}
                                      </p>
                                    );
                                  })()}
                                  <div className="grid grid-cols-2 gap-2">
                                    {[
                                      { val: 'no' as const, ar: 'لا', en: 'No' },
                                      { val: 'yes' as const, ar: 'نعم', en: 'Yes' },
                                    ].map((opt) => (
                                      <button
                                        type="button"
                                        key={opt.val}
                                        onClick={() => setGenAnswers((prev) => ({ ...prev, [qi]: opt.val }))}
                                        className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                                          genAnswers[qi] === opt.val
                                            ? 'bg-sky-600 text-white border-sky-600 font-bold'
                                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                        }`}
                                      >
                                        {isAr ? opt.ar : opt.en}
                                      </button>
                                    ))}
                                  </div>
                                  {(() => {
                                    const why = explainQuestion(q.ar, q.en);
                                    if (!why) return null;
                                    const yes = genAnswers[qi] === 'yes';
                                    return (
                                      <>
                                        <p className="text-[11px] leading-relaxed text-emerald-900 bg-emerald-50 border border-emerald-100 rounded-lg p-2 mt-2">
                                          <span className="font-bold">{isAr ? 'شو تعمل؟ ' : 'What to do? '}</span>
                                          {isAr ? why.actionAr : why.actionEn}
                                        </p>
                                        {yes && why.redFlag && (
                                          <div className="bg-rose-600 text-white rounded-lg p-2.5 mt-2">
                                            <p className="text-xs font-bold leading-relaxed">
                                              {isAr
                                                ? 'تنبيه فوري: أجبت «نعم» على سؤال يتعلق بعلامة خطر — لا تنتظر الملخص ولا تُكمل الأسئلة؛ اطلب المساعدة الطبية فوراً الآن.'
                                                : 'Immediate alert: you answered "Yes" to a question about a red-flag sign — do not wait for the summary or finish the questions; seek emergency medical help right now.'}
                                            </p>
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              ))}
                            </div>
                            <button
                              type="button"
                              disabled={Object.keys(genAnswers).length === 0}
                              onClick={() => setGenSummary(true)}
                              className={`w-full py-2.5 px-3 text-xs font-semibold rounded-lg min-h-[44px] transition-colors ${
                                Object.keys(genAnswers).length === 0
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-sky-600 hover:bg-sky-800 text-white cursor-pointer'
                              }`}
                            >
                              {isAr ? 'عرض ملخص المتابعة' : 'Show follow-up summary'}
                            </button>
                            {genSummary && (
                              <div className="space-y-2.5 border-t border-slate-100 pt-2.5">
                                <p className="text-xs font-bold text-slate-800">
                                  {isAr ? 'ملخص أجوبتك — هذا ملخص لما أبلغت عنه أنت، وليس تقييماً طبياً لحالتك:' : 'Your answers summary — this is a summary of what you reported, not a medical assessment of your condition:'}
                                </p>
                                {genQuestions.items.filter((_, qi) => genAnswers[qi] === 'yes').length > 0 ? (
                                  <div>
                                    <p className="text-xs font-semibold text-slate-700 mb-1">
                                      {isAr ? 'أجبت بـ«نعم» — نقاط ذكّر فريقك الطبي فيها عند التواصل معه:' : 'You answered "Yes" — points to mention to your medical team:'}
                                    </p>
                                    <ul className="list-disc list-inside text-xs text-slate-600 space-y-1 leading-relaxed">
                                      {genQuestions.items
                                        .filter((_, qi) => genAnswers[qi] === 'yes')
                                        .map((q, i) => (
                                          <li key={i}>{isAr ? q.ar : q.en}</li>
                                        ))}
                                    </ul>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-600">
                                    {isAr ? 'لم تُجب بـ«نعم» على أي سؤال.' : 'You did not answer "Yes" to any question.'}
                                  </p>
                                )}
                                <p className="text-xs text-slate-600">
                                  {isAr
                                    ? `أجبت على ${Object.keys(genAnswers).length} من ${genQuestions.items.length} أسئلة.`
                                    : `You answered ${Object.keys(genAnswers).length} of ${genQuestions.items.length} questions.`}
                                </p>
                                <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                                  <p className="text-xs font-semibold text-rose-900 leading-relaxed">
                                    {isAr
                                      ? 'علامات الخطر لا تنتظر الملخص: نزيف لا يتوقف، ألم أو ضغط في الصدر، ضيق شديد أو مفاجئ في التنفس، حرارة عالية، إغماء أو تشوّش — إذا ظهر أي منها، اطلب المساعدة الطبية فوراً.'
                                      : 'Red flags do not wait for a summary: unstoppable bleeding, chest pain or pressure, severe or sudden breathlessness, high fever, fainting or confusion — if any appears, seek medical help immediately.'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Question 1: Breathing */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '1. حالة التنفس مقارنة بالأمس:' : '1. Breathing compared to yesterday:'}
                </label>
                <CoreWhy k="breathing" isAr={isAr} />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'better', ar: 'أفضل', en: 'Better' },
                    { val: 'same', ar: 'مماثل', en: 'Same' },
                    { val: 'worse', ar: 'أسوأ (تنبيه)', en: 'Worse (Alert)' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setBreathing(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        breathing === opt.val
                          ? opt.val === 'worse'
                            ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
                            : 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 2: Fever */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '2. هل قست أو شعرت بحرارة / حمى اليوم؟' : '2. Have you measured or felt fever today?'}
                </label>
                <CoreWhy k="fever" isAr={isAr} />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'no', ar: 'لا', en: 'No' },
                    { val: 'yes', ar: 'نعم (تنبيه)', en: 'Yes (Alert)' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setFever(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        fever === opt.val
                          ? opt.val === 'yes'
                            ? 'bg-rose-100 border-rose-400 text-rose-900 font-bold'
                            : 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 3: Pain 0-10 */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    {isAr ? '3. مستوى الألم (من 0 إلى 10):' : '3. Pain level (0 to 10):'}
                  </label>
                  <CoreWhy k="pain" isAr={isAr} />
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    pain >= 7 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {pain} / 10 {pain >= 7 ? (isAr ? '(ألم شديد)' : '(Severe)') : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={pain}
                  onChange={(e) => setPain(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>0 ({isAr ? 'لا يوجد ألم' : 'No pain'})</span>
                  <span>5 ({isAr ? 'متوسط' : 'Moderate'})</span>
                  <span className="text-rose-600 font-semibold">10 ({isAr ? 'ألم أقصى' : 'Worst pain'})</span>
                </div>
              </div>

              {/* Question 4: Walked today */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '4. هل تمكنت من المشي أو التحرك الخفيف اليوم؟' : '4. Have you walked or moved around today?'}
                </label>
                <CoreWhy k="walked" isAr={isAr} />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'yes', ar: 'نعم', en: 'Yes' },
                    { val: 'no', ar: 'لا', en: 'No' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setWalked(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        walked === opt.val
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 5: Mood */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '5. الحالة المزاجية العامة:' : '5. Overall mood today:'}
                </label>
                <CoreWhy k="mood" isAr={isAr} />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'good', ar: 'جيد ومطمئن', en: 'Good' },
                    { val: 'fair', ar: 'مقبول', en: 'Fair' },
                    { val: 'struggling', ar: 'أعاني / مرهق', en: 'Struggling' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setMood(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        mood === opt.val
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 6: General wound check (all operations) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '6. حالة الجرح اليوم (احمرار، تورم، إفراز)؟' : '6. Wound today (redness, swelling, discharge)?'}
                </label>
                <CoreWhy k="wound" isAr={isAr} />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'none', ar: 'لا شيء ملحوظ', en: 'Nothing noticed' },
                    { val: 'signs', ar: 'في علامات (تنبيه)', en: 'There are signs (Alert)' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setWoundIssue(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        woundIssue === opt.val
                          ? opt.val === 'signs'
                            ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                            : 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 7: Appetite / nausea */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '7. الأكل والشرب اليوم؟' : '7. Eating and drinking today?'}
                </label>
                <CoreWhy k="appetite" isAr={isAr} />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'good', ar: 'منيح', en: 'Good' },
                    { val: 'low', ar: 'قليل', en: 'Low' },
                    { val: 'nausea', ar: 'في غثيان', en: 'Nausea' },
                    { val: 'vomiting', ar: 'استفراغ متكرر (تنبيه)', en: 'Repeated vomiting (Alert)' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setAppetite(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        appetite === opt.val
                          ? opt.val === 'vomiting'
                            ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                            : 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 8: Bowel / bladder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '8. التبول والإخراج؟' : '8. Urination and bowel movement?'}
                </label>
                <CoreWhy k="bowel" isAr={isAr} />
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'normal', ar: 'طبيعي', en: 'Normal' },
                    { val: 'difficulty', ar: 'صعوبة أو إمساك', en: 'Difficulty or constipation' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setBowelBladder(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        bowelBladder === opt.val
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 9: Sleep */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '9. نومك الليلة الماضية؟' : '9. Your sleep last night?'}
                </label>
                <CoreWhy k="sleep" isAr={isAr} />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'good', ar: 'منيح', en: 'Good' },
                    { val: 'broken', ar: 'متقطع', en: 'Broken' },
                    { val: 'none', ar: 'ما نمت منيح', en: 'Poor' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setSleepQuality(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        sleepQuality === opt.val
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 10: Home support */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '10. في حدا عم يساعدك بالبيت؟' : '10. Is someone helping you at home?'}
                </label>
                <CoreWhy k="support" isAr={isAr} />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'yes', ar: 'نعم', en: 'Yes' },
                    { val: 'sometimes', ar: 'أحياناً', en: 'Sometimes' },
                    { val: 'alone', ar: 'أنا لحالي', en: 'I am alone' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setHomeSupport(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        homeSupport === opt.val
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 11: Follow-up appointment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '11. موعد مراجعتك مع الطبيب؟' : '11. Your follow-up appointment?'}
                </label>
                <CoreWhy k="followup" isAr={isAr} />
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'confirmed', ar: 'أكّدتو', en: 'Confirmed' },
                    { val: 'notyet', ar: 'لسا ما أكدت', en: 'Not yet' },
                    { val: 'none', ar: 'ما عندي موعد', en: 'I have none' },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.val}
                      onClick={() => setFollowUpAppt(opt.val as any)}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                        followUpAppt === opt.val
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {isAr ? opt.ar : opt.en}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question 12: Open concern (optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {isAr ? '12. شو أكتر شي مضايقك اليوم؟ (اختياري)' : '12. What is bothering you most today? (optional)'}
                </label>
                <textarea
                  value={mainConcern}
                  onChange={(e) => setMainConcern(e.target.value)}
                  rows={2}
                  placeholder={isAr ? 'اكتب باختصار…' : 'Write briefly…'}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-400"
                />
              </div>

              {/* Procedure-specific questions (shown when a surgery type is selected) */}
              {activeProcedureQuestions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-4">
                  {PROCEDURE_INFO[surgeryType] && (
                    <div className="bg-sky-50 border border-sky-200 rounded-xl p-3">
                      <p className="text-xs font-bold text-sky-900 mb-1">
                        {isAr ? PROCEDURE_INFO[surgeryType]!.titleAr : PROCEDURE_INFO[surgeryType]!.titleEn}
                      </p>
                      <p className="text-[11px] leading-relaxed text-sky-900">
                        {isAr ? PROCEDURE_INFO[surgeryType]!.bodyAr : PROCEDURE_INFO[surgeryType]!.bodyEn}
                      </p>
                    </div>
                  )}
                  <p className="text-xs font-bold text-sky-800">
                    {PROCEDURE_SECTION_LABELS[surgeryType]
                      ? isAr
                        ? PROCEDURE_SECTION_LABELS[surgeryType]!.ar
                        : PROCEDURE_SECTION_LABELS[surgeryType]!.en
                      : isAr
                      ? 'أسئلة خاصة بالعملية:'
                      : 'Operation-specific questions:'}
                  </p>
                  {activeProcedureQuestions.map((q, qi) => (
                    <div key={q.id}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        {`${13 + qi}. ${isAr ? q.textAr : q.textEn}`}
                      </label>
                      <p className="text-[11px] leading-relaxed text-sky-800 mb-1.5">
                        <span className="font-bold">{isAr ? 'لماذا نسألك؟ ' : 'Why do we ask? '}</span>
                        {isAr ? q.whyAr : q.whyEn}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { val: 'no' as const, ar: 'لا', en: 'No' },
                          { val: 'yes' as const, ar: 'نعم', en: 'Yes' },
                        ].map((opt) => {
                          const isAlertChoice = opt.val === q.alertWhen;
                          const isSelected = procedureAnswers[q.id] === opt.val;
                          return (
                            <button
                              type="button"
                              key={opt.val}
                              onClick={() =>
                                setProcedureAnswers((prev) => ({ ...prev, [q.id]: opt.val }))
                              }
                              className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors min-h-[44px] cursor-pointer ${
                                isSelected
                                  ? isAlertChoice
                                    ? q.severity === 'emergency'
                                      ? 'bg-rose-600 border-rose-600 text-white font-bold'
                                      : 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                                    : 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {isAr ? opt.ar : opt.en}
                              {isAlertChoice ? (isAr ? ' (تنبيه)' : ' (Alert)') : ''}
                            </button>
                          );
                        })}
                      </div>
                      {(() => {
                        const bank = explainQuestion(q.textAr, q.textEn);
                        const action = (isAr ? q.actionAr : q.actionEn) ?? (bank ? (isAr ? bank.actionAr : bank.actionEn) : null);
                        const alerting = procedureAnswers[q.id] === q.alertWhen;
                        return (
                          <>
                            {action && (
                              <p className="text-[11px] leading-relaxed text-emerald-900 bg-emerald-50 border border-emerald-100 rounded-lg p-2 mt-2">
                                <span className="font-bold">{isAr ? 'شو تعمل؟ ' : 'What to do? '}</span>
                                {action}
                              </p>
                            )}
                            {alerting && q.severity === 'emergency' && (
                              <div className="bg-rose-600 text-white rounded-lg p-2.5 mt-2">
                                <p className="text-xs font-bold leading-relaxed">
                                  {isAr
                                    ? `تنبيه فوري: ${q.issueAr} — اطلب المساعدة الطبية فوراً الآن، ولا تنتظر إكمال هذا النموذج.`
                                    : `Immediate alert: ${q.issueEn} — seek emergency medical help right now; do not wait to finish this form.`}
                                </p>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              )}

              {/* Emergency Red Flags Assessment */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-rose-900 mb-1.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>
                    {isAr
                      ? `${13 + activeProcedureQuestions.length}. علامات الخطر الطارئة (هل تعاني من أي منها حالياً؟):`
                      : `${13 + activeProcedureQuestions.length}. Emergency Red-Flag Symptoms (Experiencing any now?):`}
                  </span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-rose-50/50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={severeSob}
                      onChange={(e) => setSevereSob(e.target.checked)}
                      className="w-4 h-4 accent-rose-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">
                      {isAr ? 'ضيق نفس شديد أو مفاجئ' : 'Severe or sudden shortness of breath'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-rose-50/50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={severeChestPain}
                      onChange={(e) => setSevereChestPain(e.target.checked)}
                      className="w-4 h-4 accent-rose-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">
                      {isAr ? 'ألم صدري شديد أو ضاغط' : 'Severe or crushing chest pain'}
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-rose-50/50 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={cyanosis}
                      onChange={(e) => setCyanosis(e.target.checked)}
                      className="w-4 h-4 accent-rose-600 rounded"
                    />
                    <span className="font-semibold text-slate-800">
                      {isAr ? 'ازرقاق في الشفاه أو الوجه' : 'Cyanosis / blueness in lips or face'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Dynamic Live Guidance Preview */}
              {hasEmergencyFlags ? (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-500 rounded-xl text-rose-950 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-900 text-sm">
                    <PhoneCall className="w-4 h-4 text-rose-600" />
                    <span>{isAr ? '🚨 توجيه طارئ فوري: اطلب الإسعاف فوراً' : '🚨 Immediate Emergency: Call Ambulance'}</span>
                  </div>
                  <p className="font-medium leading-relaxed">
                    {isAr
                      ? 'تم تحديد علامات خطر طارئة تستدعي الاتصال الفوري بالإسعاف (997) أو التوجه لأقرب طوارئ بدون تأخير. لا تنتظر موعداً أو تكتفِ بالمتابعة المنزلية.'
                      : 'Emergency red flags detected requiring immediate 997 / ambulance dispatch. Do not wait for appointments or rely on home monitoring.'}
                  </p>
                </div>
              ) : needsUrgentClinical ? (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>{isAr ? '⚠️ تقييم سريري عاجل مطلوب' : '⚠️ Urgent Clinical Assessment Required'}</span>
                  </div>
                  <p className="leading-relaxed">
                    {isAr
                      ? 'وجود تدهور في التنفس أو حمى أو ألم شديد يتطلب مراجعة فريقك الطبي اليوم. لا يُنصح بالاكتفاء بالمتابعة المنزلية فقط.'
                      : 'Worsening breathing, fever, or severe pain requires contacting your clinical team today. Home monitoring alone is not advised.'}
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isAr
                      ? 'مؤشراتك مستقرة حالياً، والمتابعة المنزلية مناسبة لحالتك.'
                      : 'Parameters currently stable; home monitoring is appropriate.'}
                  </span>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-colors shadow-2xs min-h-[48px] cursor-pointer ${
                  hasEmergencyFlags
                    ? 'bg-rose-700 hover:bg-rose-800 text-white'
                    : 'bg-sky-600 hover:bg-sky-800 text-white'
                }`}
              >
                {isAr ? 'تسجيل وحفظ تقييم اليوم' : 'Submit & Save Today\'s Assessment'}
              </button>
            </form>

            {/* Check-in History */}
            {checkins.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h4 className="text-xs font-bold text-slate-700">
                  {isAr ? 'سجل التقييمات:' : 'Check-In History:'}
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {checkins.map((item, idx) => {
                    const isTodayItem = item.date === todayStr || idx === 0;

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border text-xs flex flex-wrap items-center justify-between gap-2 ${
                          item.isEmergency
                            ? 'bg-rose-50 border-rose-300 text-rose-950 font-medium'
                            : item.isWarning
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          {isTodayItem && (
                            <span className="text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 rounded-full">
                              {isAr ? 'تقييم اليوم' : 'Today\'s Assessment'}
                            </span>
                          )}
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{item.date}</span>
                          <span>·</span>
                          <span>
                            {isAr ? 'التنفس: ' : 'Breathing: '}
                            {item.breathing === 'better' ? (isAr ? 'أفضل' : 'Better') : item.breathing === 'worse' ? (isAr ? 'أسوأ' : 'Worse') : (isAr ? 'مماثل' : 'Same')}
                          </span>
                          <span>·</span>
                          <span>
                            {isAr ? 'حرارة: ' : 'Fever: '}
                            {item.fever === 'yes' ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')}
                          </span>
                          <span>·</span>
                          <span>{isAr ? 'الألم: ' : 'Pain: '}{item.pain}/10</span>
                          {item.surgeryType === 'thyroid' && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-sky-800">
                                {isAr ? 'متابعة غدة درقية' : 'Thyroid follow-up'}
                              </span>
                            </>
                          )}
                          {item.surgeryType === 'cesarean' && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-sky-800">
                                {isAr ? 'متابعة قيصرية' : 'Cesarean follow-up'}
                              </span>
                            </>
                          )}
                          {item.surgeryType === 'catheter' && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-sky-800">
                                {isAr ? 'متابعة قثطرة قلبية' : 'Catheterization follow-up'}
                              </span>
                            </>
                          )}
                          {item.surgeryType === 'gallbladder' && (
                            <>
                              <span>·</span>
                              <span className="font-semibold text-sky-800">
                                {isAr ? 'متابعة استئصال مرارة' : 'Gallbladder follow-up'}
                              </span>
                            </>
                          )}
                        </div>
                        {item.isEmergency ? (
                          <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                            {isAr ? 'طلب إسعاف فوري' : 'Emergency Dispatch'}
                          </span>
                        ) : item.isWarning ? (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            {isAr ? 'تنبيه سريري' : 'Clinical Alert'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {isAr ? 'مستقر' : 'Stable'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          </>)}
          {afterView === 'meds' && (
          <>
          {/* SECTION 2: NEW SECTION «أدويتي» (MY MEDICATIONS - Completely Separate) */}
          <div className="bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-indigo-700" />
                <h3 className="font-bold text-slate-900 text-base">
                  {isAr ? 'أدويتي' : 'My Medications'}
                </h3>
              </div>
              {personalMeds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer min-h-[40px] shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'أضف دواءً آخر' : 'Add another medication'}</span>
                </button>
              )}
            </div>

            {/* Static Notice for Personal Medications */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-950 flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <p className="font-semibold leading-relaxed">
                {isAr
                  ? '«بيانات تدخلها بنفسك ولم يتحقق التطبيق من صحتها — راجع وصفتك الفعلية»'
                  : 'Data entered by yourself and has not been verified by the app — refer to your actual prescription.'}
              </p>
            </div>

            {/* How phone-calendar reminders work (honest explainer) */}
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-[11px] text-indigo-950 leading-relaxed">
              <p>
                {isAr
                  ? 'التذكير عبر تقويم الهاتف: لأدويتك المجدولة، حدّد وقت كل جرعة ثم اختر الطريقة الأسهل لك: «أضف إلى تقويم Google» يفتح التقويم جاهزاً وتضغط «حفظ»، أو «ذكّرني عبر تقويم الهاتف» يُنشئ ملف تقويم (.ics) تضيفه بنفسك إلى تقويم هاتفك. بكلتا الطريقتين تصلك التنبيهات من تطبيق التقويم حتى عندما يكون رعاية مغلقاً. يعتمد وصول التنبيه على تطبيق التقويم وإعدادات جهازك. إذا غيّرت جدول دواء أو أوقفته، حدّث أحداث التقويم القديمة أو احذفها وأعد إنشاءها. الأدوية عند اللزوم لا تذكيرات ثابتة لها.'
                  : 'Phone-calendar reminders: for your scheduled medications, set each dose time, then choose whichever is easier: "Add to Google Calendar" opens the calendar pre-filled and you tap Save, or "Remind me via phone calendar" creates a calendar file (.ics) that you add to your phone calendar yourself. Either way, alerts come from the calendar app even when Riaya is closed. Delivery depends on your calendar app and device settings. If you change or stop a medication schedule, update or delete the old calendar events and recreate them. As-needed medications have no fixed reminders.'}
              </p>
            </div>

            {/* Empty State vs Added Medications */}
            {personalMeds.length === 0 ? (
              <div className="py-8 px-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center mx-auto">
                  <Pill className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-800">
                    {isAr ? 'لم تُضَف أدويتك بعد' : 'Your medications have not been added yet'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {isAr
                      ? 'يمكنك إضافة أدويتك الموصوفة لك شخصياً لمتابعة تناولها وتوثيق الجرعات أو الاستخدام عند اللزوم يومياً.'
                      : 'You can add your own prescribed medications to track daily scheduled doses or log as-needed usage.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(true)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer min-h-[44px] shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'أضف أدوية لمتابعتها يومياً' : 'Add medications to track daily'}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {personalMeds.map((med) => {
                  const isPRN = med.frequencyType === 'prn';
                  const todayPersonalLogs = getTodayLogsForMed(med.id);
                  const scheduledTimes = med.timesPerDay || 1;

                  return (
                    <div
                      key={med.id}
                      className="p-4 rounded-xl border border-indigo-100 bg-white text-slate-900 flex flex-col justify-between space-y-3 shadow-2xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-slate-900">{med.name}</h4>
                              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 rounded">
                                {isPRN ? (isAr ? 'عند اللزوم' : 'As Needed') : (isAr ? `${scheduledTimes} مرات يومياً` : `${scheduledTimes}x daily`)}
                              </span>
                            </div>
                            <span className="text-xs text-indigo-900 font-semibold">{med.dose}</span>
                          </div>
                          {onDeletePersonalMed && (
                            <button
                              type="button"
                              onClick={() => onDeletePersonalMed(med.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                              title={isAr ? 'حذف هذا الدواء' : 'Delete medication'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 mb-1">
                          <span className="font-medium text-slate-700">
                            {isAr ? 'المدة المقررة: ' : 'Duration: '}
                          </span>
                          {med.duration}
                        </div>

                        <div className="text-[11px] text-slate-500 mb-2">
                          {isAr ? 'إبلاغ ذاتي من المريض — ليس إثباتاً لتناول الدواء' : 'Patient self-reporting — not proof of medication ingestion'}
                        </div>
                      </div>

                      {/* Tracking Section for Personal Med */}
                      <div className="pt-2.5 border-t border-slate-100 space-y-2">
                        {isPRN ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-slate-700">
                                {isAr ? 'تسجيل الاستخدام الفعلي:' : 'Actual Usage Logging:'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenPRNModal(med.id, med.name, med.dose)}
                                className="px-2.5 py-1 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer min-h-[36px]"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>{isAr ? 'سجّل استخداماً' : 'Log usage'}</span>
                              </button>
                            </div>

                            {todayPersonalLogs.length === 0 ? (
                              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 text-xs italic text-center">
                                {isAr
                                  ? '«لم يُستخدم اليوم — لم يكن مطلوباً»'
                                  : 'Not used today — was not needed'}
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {todayPersonalLogs.map((log) => (
                                  <div
                                    key={log.id}
                                    className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                                      <span className="font-mono font-semibold">{log.time}</span>
                                      <span>•</span>
                                      <span>{log.amount}</span>
                                    </div>
                                    {onDeletePRNLog && (
                                      <button
                                        type="button"
                                        onClick={() => onDeletePRNLog(log.id)}
                                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                              <span>{isAr ? 'الجرعات المجدولة:' : 'Scheduled Doses:'}</span>
                              <span className="text-[11px] font-medium text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                {Array.from({ length: scheduledTimes }).filter((_, i) => !!todayMeds[`${med.id}_dose_${i + 1}`]).length} من {scheduledTimes} سُجِّلت
                              </span>
                            </div>

                            {Array.from({ length: scheduledTimes }).map((_, i) => {
                              const doseId = String(i + 1);
                              const slotKey = `${med.id}_dose_${doseId}`;
                              const isTaken = !!todayMeds[slotKey];
                              const label = isAr ? `الجرعة ${doseId}` : `Dose ${doseId}`;

                              return (
                                <button
                                  type="button"
                                  key={doseId}
                                  onClick={() => onToggleMedTaken(todayStr, slotKey)}
                                  className={`w-full flex items-center justify-between p-2 rounded-xl border text-xs transition-all cursor-pointer min-h-[44px] text-start ${
                                    isTaken
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                                      : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isTaken ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                    )}
                                    <span className={`font-semibold ${isTaken ? 'text-emerald-900' : 'text-slate-800'}`}>
                                      {label}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0 ${
                                      isTaken
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-white border border-slate-200 text-slate-600'
                                    }`}
                                  >
                                    {isTaken ? (isAr ? '✓ سُجِّلت ذاتياً' : '✓ Logged') : (isAr ? 'تسجيل الجرعة' : 'Log dose')}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Calendar reminder (.ics) — scheduled personal medications only */}
                        {!isPRN && (
                          <div className="pt-2.5 border-t border-dashed border-slate-200 space-y-2">
                            {medHasCompleteTimes(med) ? (
                              <div className="space-y-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (downloadICSForMedication(med, isAr)) setIcsDownloadedFor(med.id);
                                  }}
                                  className="w-full px-3 py-2 text-xs font-semibold text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
                                >
                                  <BellRing className="w-4 h-4" />
                                  <span>{isAr ? 'ذكّرني عبر تقويم الهاتف' : 'Remind me via phone calendar'}</span>
                                </button>
                                {icsDownloadedFor === med.id && (
                                  <p className="text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg p-2 leading-relaxed">
                                    {isAr
                                      ? 'تم إنشاء ملف التقويم وتنزيله — افتحه وأضفه إلى تقويم هاتفك حتى تصلك التنبيهات حتى لو كان التطبيق مغلقاً.'
                                      : 'Calendar file downloaded — open it and add it to your phone calendar so alerts arrive even when the app is closed.'}
                                  </p>
                                )}
                                {/* Google Calendar — simplest path: opens pre-filled, user taps Save */}
                                <div className="space-y-1 pt-0.5">
                                  {buildGoogleCalendarUrls(med, isAr).map((url, gi) => (
                                    <a
                                      key={gi}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="w-full px-3 py-2 text-xs font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl flex items-center justify-center gap-1.5 transition-colors min-h-[40px]"
                                    >
                                      <Calendar className="w-4 h-4" />
                                      <span>
                                        {isAr
                                          ? `أضف إلى تقويم Google${(med.doseTimes?.length ?? 0) > 1 ? ` — الجرعة ${gi + 1} (${med.doseTimes?.[gi]})` : ''}`
                                          : `Add to Google Calendar${(med.doseTimes?.length ?? 0) > 1 ? ` — dose ${gi + 1} (${med.doseTimes?.[gi]})` : ''}`}
                                      </span>
                                    </a>
                                  ))}
                                  <p className="text-[11px] text-slate-500 leading-relaxed">
                                    {isAr
                                      ? 'الأسهل: يفتح تقويم Google جاهزاً بتذكير يومي — اضغط «حفظ» فقط، وسيصلك التنبيه من التقويم.'
                                      : 'Easiest: opens Google Calendar pre-filled with a daily reminder — just tap Save, and the calendar will alert you.'}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-[11px] font-semibold text-slate-700">
                                  {isAr ? 'للتذكير عبر التقويم، حدّد وقت كل جرعة (من وصفتك):' : 'For calendar reminders, set each dose time (from your prescription):'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {Array.from({ length: scheduledTimes }).map((_, i) => {
                                    const editVal = (doseTimeEdits[med.id] ?? med.doseTimes ?? [])[i] || '';
                                    return (
                                      <label key={i} className="flex flex-col gap-1 text-[10px] font-medium text-slate-500">
                                        {isAr ? `الجرعة ${i + 1}` : `Dose ${i + 1}`}
                                        <input
                                          type="time"
                                          value={editVal}
                                          onChange={(e) => {
                                            const base = Array.from({ length: scheduledTimes }, (_, j) => (doseTimeEdits[med.id] ?? med.doseTimes ?? [])[j] || '');
                                            base[i] = e.target.value;
                                            setDoseTimeEdits((prev) => ({ ...prev, [med.id]: base }));
                                          }}
                                          className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 bg-white min-h-[36px]"
                                        />
                                      </label>
                                    );
                                  })}
                                </div>
                                {onUpdatePersonalMed && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const times = Array.from({ length: scheduledTimes }, (_, j) => (doseTimeEdits[med.id] ?? med.doseTimes ?? [])[j] || '');
                                      if (times.every((t) => /^([01]\d|2[0-3]):[0-5]\d$/.test(t))) {
                                        onUpdatePersonalMed(med.id, { doseTimes: times });
                                      }
                                    }}
                                    className="px-3 py-1.5 text-[11px] font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer min-h-[36px]"
                                  >
                                    {isAr ? 'حفظ أوقات الجرعات' : 'Save dose times'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          </>)}
        </div>
      )}

      {/* Persistent Reset Demo Data Section */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          <span>{isAr ? 'تنبيه التخزين المحلي: هذا العرض يستخدم متصفحك فقط، ولا ينبغي تخزين أي بيانات حقيقية.' : 'Demo storage note: This demo uses localStorage only. Never enter real patient-identifiable data.'}</span>
        </div>
        <button
          onClick={() => setShowResetConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer min-h-[44px] shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isAr ? 'إعادة ضبط البيانات التجريبية' : 'Reset Demo Data'}</span>
        </button>
      </div>

      {/* MODAL 1: ADD PERSONAL MEDICATION */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">
                {isAr ? 'إضافة دواء جديد لمتابعته' : 'Add New Medication to Track'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMedModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePersonalMed} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isAr ? 'اسم الدواء:' : 'Medication Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  placeholder={isAr ? 'مثال: أتورفاستاتين، أملوديبين' : 'e.g. Atorvastatin, Amlodipine'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isAr ? 'الجرعة كما وردت في وصفتك:' : 'Dose as Stated in Your Prescription:'}
                </label>
                <input
                  type="text"
                  required
                  value={newMedDose}
                  onChange={(e) => setNewMedDose(e.target.value)}
                  placeholder={isAr ? 'مثال: 20 ملغ، قرص واحد، بختان' : 'e.g. 20 mg, 1 tablet, 2 puffs'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isAr ? 'نوع التكرار:' : 'Frequency Type:'}
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setNewMedFreqType('scheduled')}
                    className={`py-2 px-3 rounded-xl border font-semibold min-h-[40px] cursor-pointer transition-colors ${
                      newMedFreqType === 'scheduled'
                        ? 'bg-indigo-700 text-white border-indigo-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isAr ? 'مجدول يومياً' : 'Scheduled Daily'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMedFreqType('prn')}
                    className={`py-2 px-3 rounded-xl border font-semibold min-h-[40px] cursor-pointer transition-colors ${
                      newMedFreqType === 'prn'
                        ? 'bg-indigo-700 text-white border-indigo-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {isAr ? 'عند اللزوم (PRN)' : 'As Needed (PRN)'}
                  </button>
                </div>

                {newMedFreqType === 'scheduled' && (
                  <div>
                    <label className="block text-slate-600 mb-1">
                      {isAr ? 'عدد المرات في اليوم:' : 'Times per day:'}
                    </label>
                    <select
                      value={newMedTimesPerDay}
                      onChange={(e) => setNewMedTimesPerDay(Number(e.target.value))}
                      className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                    >
                      <option value={1}>{isAr ? 'مرة واحدة يومياً (جرعة واحدة)' : 'Once daily (1 dose)'}</option>
                      <option value={2}>{isAr ? 'مرتان يومياً (جرعتان)' : 'Twice daily (2 doses)'}</option>
                      <option value={3}>{isAr ? '3 مرات يومياً (ثلاث جرعات)' : 'Three times daily (3 doses)'}</option>
                      <option value={4}>{isAr ? '4 مرات يومياً (أربع جرعات)' : 'Four times daily (4 doses)'}</option>
                    </select>
                    <div className="mt-2.5">
                      <label className="block text-slate-600 mb-1">
                        {isAr ? 'وقت كل جرعة (اختياري الآن — يلزم لتذكير التقويم):' : 'Time of each dose (optional now — required for calendar reminders):'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: newMedTimesPerDay }).map((_, i) => (
                          <label key={i} className="flex flex-col gap-1 text-[10px] font-medium text-slate-500">
                            {isAr ? `الجرعة ${i + 1}` : `Dose ${i + 1}`}
                            <input
                              type="time"
                              value={newMedDoseTimes[i] || ''}
                              onChange={(e) => {
                                const next = Array.from({ length: newMedTimesPerDay }, (_, j) => newMedDoseTimes[j] || '');
                                next[i] = e.target.value;
                                setNewMedDoseTimes(next);
                              }}
                              className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 bg-white min-h-[36px]"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isAr ? 'مدة الاستخدام الموصوفة:' : 'Prescribed Duration:'}
                </label>
                <input
                  type="text"
                  required
                  value={newMedDuration}
                  onChange={(e) => setNewMedDuration(e.target.value)}
                  placeholder={isAr ? 'مثال: 7 أيام، أسبوعين، مستمر دائماً' : 'e.g. 7 days, 2 weeks, ongoing'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                {isAr
                  ? 'بيانات تدخلها بنفسك ولم يتحقق التطبيق من صحتها — راجع وصفتك الفعلية دائماً.'
                  : 'Data entered by yourself and has not been verified by the app — always refer to your actual prescription.'}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 min-h-[44px] cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white font-semibold min-h-[44px] cursor-pointer shadow-2xs"
                >
                  {isAr ? 'حفظ الدواء' : 'Save Medication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: LOG PRN AS-NEEDED USAGE */}
      {prnModalMed && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">
                {isAr ? `تسجيل استخدام: ${prnModalMed.name}` : `Log Usage: ${prnModalMed.name}`}
              </h3>
              <button
                type="button"
                onClick={() => setPrnModalMed(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePRNUsage} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isAr ? 'وقت الاستخدام الفعلي:' : 'Usage Time:'}
                </label>
                <input
                  type="time"
                  required
                  value={prnTime}
                  onChange={(e) => setPrnTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isAr ? 'الكمية الفعلية التي تناولتها / استخدمتها:' : 'Actual Amount Used:'}
                </label>
                <input
                  type="text"
                  required
                  value={prnAmount}
                  onChange={(e) => setPrnAmount(e.target.value)}
                  placeholder={isAr ? 'مثال: قرص واحد، بختان' : 'e.g. 1 tablet, 2 puffs'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-900"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    isAr ? 'قرص واحد (500 ملغ)' : '1 tablet (500mg)',
                    isAr ? 'قرصان (1 غرام)' : '2 tablets (1g)',
                    isAr ? 'بخة واحدة' : '1 puff',
                    isAr ? 'بختان (2 puffs)' : '2 puffs',
                  ].map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => setPrnAmount(sug)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 italic">
                {isAr ? 'إبلاغ ذاتي من المريض — ليس إثباتاً لتناول الدواء' : 'Patient self-reporting — not proof of medication ingestion'}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPrnModalMed(null)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 min-h-[44px] cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-800 text-white font-semibold min-h-[44px] cursor-pointer shadow-2xs"
                >
                  {isAr ? 'تأكيد التسجيل' : 'Confirm Logging'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Resetting Demo Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {isAr ? 'تأكيد إعادة ضبط البيانات التجريبية' : 'Reset All Demo Data?'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {isAr
                ? 'سيتم إعادة تعيين قائمة المراجعة، وملاحظات الطبيب، وتاريخ الأدوية، والأدوية الشخصية، وتقييمات التعافي، ولوحة الطبيب إلى حالتها الافتراضية الأولية. هل أنت متأكد؟'
                : 'This will reset the checklist, doctor notes, medication history, personal meds, recovery check-ins, and clinician board to their initial default states. Are you sure?'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg min-h-[44px] cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onResetAllDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-3.5 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg min-h-[44px] cursor-pointer shadow-2xs"
              >
                {isAr ? 'تأكيد إعادة الضبط' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
