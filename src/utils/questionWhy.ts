// "Why do we ask?" explanations for follow-up questions.
//
// Two uses:
// 1. Generated questions (any operation): the model writes QUESTIONS ONLY —
//    it never explains risk. The app matches a generated question's text
//    against this fixed family bank and attaches OUR verified plain-language
//    explanation of why the question matters. Families flagged redFlag are
//    the app's standing red-flag list; a "yes" answer there raises the
//    immediate urgent alert in the UI, without waiting for any summary.
// 2. Tests pin the matching so explanations cannot drift onto wrong questions.
//
// The explanation texts are general patient education (aligned with NHS
// recovery-after-surgery guidance and the app's standing red-flag list):
// they say what a symptom CAN indicate in general, never what it means for
// this specific patient.

export interface QuestionWhy {
  family: string;
  whyAr: string;
  whyEn: string;
  actionAr: string;
  actionEn: string;
  redFlag: boolean;
}

interface WhyFamily extends QuestionWhy {
  patterns: string[];
  redFlagWhen?: string[]; // if present, redFlag only when one of these also matches
}

const FAMILIES: WhyFamily[] = [
  {
    family: 'breathing-chest',
    patterns: ['تنفس', 'التنفس', 'صدر', 'الصدر', 'breath', 'chest', 'ضيق نفس'],
    whyAr: 'ضيق التنفس أو ألم/ضغط الصدر بعد عملية قد يدل على مشكلة في الرئة أو القلب أو على جلطة انتقلت إلى الرئة — لذلك هما أول ما نسأل عنه، ووجودهما الآن يعني طلب مساعدة فورية وعدم انتظار.',
    whyEn: 'Breathlessness or chest pain/pressure after an operation can indicate a lung or heart problem, or a clot that travelled to the lung — that is why they are asked first, and having them now means seeking help immediately, not waiting.',
    actionAr: 'اطلب المساعدة الطبية فوراً الآن (إسعاف أو أقرب طوارئ) — لا تنتظر ولا تُكمل الأسئلة، واجلس وارفَع رأسك قليلاً ريثما تصل المساعدة.',
    actionEn: 'Seek emergency medical help right now (ambulance or nearest emergency department) — do not wait or finish the questions, and sit with your head slightly raised while help comes.',
    redFlag: true,
  },
  {
    family: 'bleeding',
    patterns: ['نزيف', 'ينزف', 'دم من الجرح', 'bleed', 'bleeding', 'blood from'],
    whyAr: 'نسأل عن النزيف لأنه إذا كان مستمراً فقد يكون هناك وعاء دموي مفتوح — استمرار فقدان الدم يخفّض ضغط الدم وقد يحتاج إلى تعويض دم أو تدخل سريع. كلما اكتُشف أبكر كان أأمن.',
    whyEn: 'We ask about bleeding because ongoing bleeding may mean an open blood vessel — continued blood loss lowers blood pressure and may require transfusion or rapid intervention. The earlier it is caught, the safer.',
    actionAr: 'اضغط على مكان النزيف بقطعة قماش نظيفة بثبات، واستلقِ، واطلب المساعدة الطبية فوراً — لا تزل الضغط للنظر كل قليل.',
    actionEn: 'Press firmly on the bleeding spot with a clean cloth, lie down, and seek medical help immediately — do not keep lifting the pressure to check.',
    redFlag: true,
  },
  {
    family: 'fever',
    patterns: ['حرارت', 'حرارة', 'حمى', 'قشعريرة', 'fever', 'chills', 'shiver', 'temperature'],
    whyAr: 'الحرارة بعد العملية قد تكون أول علامة على إنتان (التهاب جرثومي) — الإنتان يُعالج بالمضادات الحيوية، وإذا تُرك دون علاج قد ينتشر في الجسم كله. لذلك نسأل عنها كل يوم، والحرارة العالية تُبلَّغ فوراً.',
    whyEn: 'Fever after an operation can be the first sign of infection — infection is treated with antibiotics, and if left untreated it can spread through the whole body. That is why it is asked daily, and a high fever is reported immediately.',
    actionAr: 'اشرب سوائل ما لم تكن ممنوعة عنك، ولا تأخذ أي دواء جديد إلا الموصوف لك، وأخبر فريقك الطبي اليوم — وإذا كانت الحرارة عالية أو ترافقت مع قشعريرة شديدة أو تشوّش، اطلب المساعدة فوراً.',
    actionEn: 'Drink fluids unless they are restricted for you, take no new medicine except what was prescribed for you, and tell your medical team today — if the fever is high or comes with severe shivering or confusion, seek help immediately.',
    redFlag: false,
    redFlagWhen: ['عالية', 'مرتفعة', 'شديدة', 'high'],
  },
  {
    family: 'leg-clot',
    patterns: ['ساق', 'ربلة', 'leg', 'calf'],
    whyAr: 'ألم أو تورّم في ساق واحدة بعد عملية قد يدل على جلطة في وريد الساق — الجلطة قد تنتقل إلى الرئة إذا لم تُعالج، لذلك أي تورّم جديد في ساق واحدة يستحق إخبار الفريق في اليوم نفسه.',
    whyEn: 'Pain or swelling in one leg after an operation can indicate a vein clot — a clot can travel to the lung if untreated, so any new one-leg swelling deserves telling the team the same day.',
    actionAr: 'لا تدلّك الساق ولا تضغط عليها، أبقها مرفوعة وقلّل المشي عليها، وأخبر فريقك الطبي في اليوم نفسه — وإذا ظهر ألم في الصدر أو ضيق تنفس، اطلب المساعدة فوراً.',
    actionEn: 'Do not massage or press the leg; keep it raised, walk on it less, and tell your medical team the same day — if chest pain or breathlessness appears, seek help immediately.',
    redFlag: false,
  },
  {
    family: 'wound',
    patterns: ['جرح', 'احمرار', 'إفراز', 'صديد', 'تورّم حول', 'تورم حول', 'wound', 'redness', 'discharge', 'pus', 'incision'],
    whyAr: 'علامات الجرح (احمرار متزايد، تورّم، إفرازات أو صديد، أو بدء فتح الجرح) قد تدل على إنتان في الجرح — اكتشافه مبكراً يجعل علاجه أبسط قبل أن يمتد إلى الأنسجة العميقة.',
    whyEn: 'Wound signs (increasing redness, swelling, discharge or pus, or the wound starting to open) can indicate a wound infection — catching it early makes treatment simpler before it spreads to deeper tissues.',
    actionAr: 'لا تلمس الجرح بيدين غير مغسولتين ولا تضع عليه أي مادة لم يصفها فريقك، غطِّه بضماد نظيف إن توفر، وأخبر فريقك الطبي اليوم.',
    actionEn: 'Do not touch the wound with unwashed hands and put nothing on it that your team did not prescribe; cover it with a clean dressing if available, and tell your medical team today.',
    redFlag: false,
  },
  {
    family: 'urinary-bowel',
    patterns: ['تبول', 'البول', 'إخراج', 'غازات', 'تبرز', 'إمساك', 'urin', 'bowel', 'gas', 'stool', 'constipat', 'pass water'],
    whyAr: 'عودة التبول والإخراج بشكل طبيعي علامة أن الجسم — والأمعاء بعد عمليات البطن — عاد يعمل. احتباس البول أو توقف الإخراج مع انتفاخ أو استفراغ قد يدل على انسداد يحتاج تقييماً في اليوم نفسه.',
    whyEn: 'Normal urination and bowel movements returning is a sign the body — and the bowel after abdominal operations — is working again. Urine retention, or no bowel output with bloating or vomiting, can indicate a blockage needing same-day assessment.',
    actionAr: 'اشرب سوائل ما لم تكن ممنوعة عنك وامشِ خطوات قصيرة إن استطعت — وإذا استمر الاحتباس أو ترافق مع انتفاخ أو استفراغ أو ألم متزايد، أخبر فريقك الطبي في اليوم نفسه.',
    actionEn: 'Drink fluids unless restricted for you and take short walks if you can — if the retention continues or comes with bloating, vomiting, or worsening pain, tell your medical team the same day.',
    redFlag: false,
  },
  {
    family: 'intake-vomiting',
    patterns: ['أكل', 'الشرب', 'شرب', 'طعام', 'سوائل', 'استفراغ', 'قيء', 'غثيان', 'eat', 'drink', 'food', 'fluids', 'vomit', 'nausea'],
    whyAr: 'القدرة على الشرب والأكل دون استفراغ متكرر علامة تعافٍ أساسية — الاستفراغ المستمر يسبب جفافاً ويمنع أخذ الأدوية، وقد يدل بعد العمليات البطنية على مشكلة في الأمعاء.',
    whyEn: 'Being able to drink and eat without repeated vomiting is a basic recovery sign — persistent vomiting causes dehydration and prevents taking medicines, and after abdominal operations it can indicate a bowel problem.',
    actionAr: 'خذ رشفات صغيرة ومتكررة من الماء وتوقّف مؤقتاً عن الأكل الثقيل — وإذا لم تستطع الاحتفاظ بأي سوائل أو شعرت بدوار، أخبر فريقك الطبي اليوم.',
    actionEn: 'Take small frequent sips of water and pause heavy food for now — if you cannot keep any fluids down or feel dizzy, tell your medical team today.',
    redFlag: false,
  },
  {
    family: 'mobility',
    patterns: ['مشي', 'المشي', 'حركة', 'خطوات', 'تتحرك', 'walk', 'move', 'steps', 'mobil'],
    whyAr: 'المشي الخفيف المبكر يحمي من الجلطات ومشاكل الرئة ويسرّع عودة الأمعاء للعمل — لذلك نسأل عنه كل يوم، وتراجعه المفاجئ مع أعراض أخرى له معنى عند الفريق.',
    whyEn: 'Early gentle walking protects against clots and lung problems and speeds the bowel\'s return to work — that is why it is asked daily, and a sudden decline alongside other symptoms matters to the team.',
    actionAr: 'حاول المشي خطوات قصيرة ومتكررة داخل البيت، بمساعدة شخص إن أمكن، ولا تُجبر نفسك إذا شعرت بدوار أو ألم شديد — وأخبر فريقك إذا تراجعت حركتك فجأة.',
    actionEn: 'Try short frequent walks inside the house, with someone helping if possible, and do not force yourself if you feel dizzy or severe pain — tell your team if your mobility suddenly drops.',
    redFlag: false,
  },
  {
    family: 'pain',
    patterns: ['ألم', 'وجع', 'pain', 'ache', 'hurts'],
    whyAr: 'الألم بعد العملية متوقع، لكن اتجاهه هو المهم: ألم يزداد بدل أن يتحسن قد يكون علامة مبكرة على مشكلة (نزيف داخلي، إنتان، تجمّع سوائل) — لذلك نتابع اتجاهه لا رقمه في يوم واحد فقط.',
    whyEn: 'Pain after an operation is expected, but its direction matters: pain that worsens instead of improving can be an early sign of a problem (internal bleeding, infection, fluid collection) — so we track its direction, not just one day\'s number.',
    actionAr: 'خذ المسكّن الموصوف لك حسب تعليمات فريقك ولاحظ اتجاه الألم — إذا ازداد بشدة أو ترافق مع حرارة أو انتفاخ أو نزيف، أخبر فريقك الطبي فوراً.',
    actionEn: 'Take the painkiller prescribed for you as your team instructed and watch the pain\'s direction — if it sharply worsens or comes with fever, swelling, or bleeding, tell your medical team immediately.',
    redFlag: false,
  },
];

export function explainQuestion(textAr: string, textEn: string = ''): QuestionWhy | null {
  const hay = `${textAr || ''} ${textEn || ''}`.toLowerCase();
  for (const fam of FAMILIES) {
    if (!fam.patterns.some((p) => hay.includes(p.toLowerCase()))) continue;
    let redFlag = fam.redFlag;
    if (fam.redFlagWhen) {
      redFlag = fam.redFlagWhen.some((p) => hay.includes(p.toLowerCase()));
    }
    return { family: fam.family, whyAr: fam.whyAr, whyEn: fam.whyEn, actionAr: fam.actionAr, actionEn: fam.actionEn, redFlag };
  }
  return null;
}

export function familyWhy(family: string): QuestionWhy | null {
  const fam = FAMILIES.find((f) => f.family === family);
  if (!fam) return null;
  return { family: fam.family, whyAr: fam.whyAr, whyEn: fam.whyEn, actionAr: fam.actionAr, actionEn: fam.actionEn, redFlag: fam.redFlag };
}
