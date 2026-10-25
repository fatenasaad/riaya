// Symptom guides — "what happens at the hospital?" education for three major
// presentations. Deterministic content grounded in NHS pages (verified
// 24 Oct 2026):
// - Chest pain: https://www.nhs.uk/symptoms/chest-pain/ (999 criteria; common
//   causes table: heartburn/indigestion, sprain/strain, anxiety/panic, chest
//   infection/pneumonia/pleurisy, shingles; "most chest pain is not a heart
//   problem, but get medical advice just in case")
// - Shortness of breath: https://www.nhs.uk/symptoms/shortness-of-breath/
//   (common: asthma, chest infection, overweight, smoking, panic attack;
//   serious: COPD, pulmonary fibrosis, heart failure, lung cancer)
// - Appendicitis/abdominal pain workup: https://www.nhs.uk/conditions/appendicitis/
//   (examination; blood tests; urine sample; ultrasound or CT; pregnancy test;
//   other causes: UTI, kidney stones, gallstones, bowel problems, womb/ovary
//   conditions, ectopic pregnancy)
// The app NEVER gives the patient a personal differential ("your diagnosis
// #1/#2/#3"). It explains how hospital teams work through the categories of
// causes — most dangerous first — which tests they commonly order and why,
// and what each procedure tells or does for the treating team.

import { normalizeArabic } from './arabicText.ts';

export interface GuideItem {
  nameAr: string;
  nameEn: string;
  whyAr: string;
  whyEn: string;
}

export interface SymptomGuide {
  id: string;
  nameAr: string;
  nameEn: string;
  patterns: string[];
  emergencyAr: string;
  emergencyEn: string;
  introAr: string;
  introEn: string;
  thinkingAr: string[];
  thinkingEn: string[];
  tests: GuideItem[];
  procedures: GuideItem[];
  sourceName: string;
  sourceUrl: string;
}

export const SYMPTOM_GUIDES: SymptomGuide[] = [
  {
    id: 'chest-pain',
    nameAr: 'ألم الصدر',
    nameEn: 'Chest pain',
    patterns: ['ألم في الصدر', 'ألم صدري', 'ألم بالصدر', 'وجع بالصدر', 'وجع صدري', 'ضغط في الصدر', 'ثقل في الصدر', 'انقباض في الصدر', 'chest pain', 'chest pressure', 'chest tightness', 'ألم الصدر'],
    emergencyAr: 'إذا ألم الصدر حاصل الآن: لا تنتظر ولا تقُد بنفسك — اتصل بالإسعاف فوراً، خاصة إذا كان الألم ضاغطاً أو منتشراً إلى الذراع أو الفك أو الظهر، أو معه تعرّق أو غثيان أو ضيق تنفس. قد يكون أزمة قلبية، وكل دقيقة تفرق.',
    emergencyEn: 'If the chest pain is happening now: do not wait and do not drive yourself — call an ambulance immediately, especially if the pain is pressing or spreads to the arm, jaw, or back, or comes with sweating, nausea, or breathlessness. It could be a heart attack, and every minute matters.',
    introAr: 'معظم آلام الصدر ليست من القلب، لكن لا يمكن معرفة ذلك في البيت — لذلك يتعامل الفريق مع كل ألم صدر جديد بجدية حتى يستبعد الأسباب الخطيرة أولاً.',
    introEn: 'Most chest pain is not from the heart, but that cannot be known at home — so the team treats every new chest pain seriously until the dangerous causes are ruled out first.',
    thinkingAr: [
      'القلب أولاً: أزمة قلبية (انسداد شريان قلبي) أو ذبحة — تُستبعد أولاً لأن علاجها مرتبط بالوقت.',
      'الرئة: جلطة رئوية، التهاب رئوي، أو هواء حول الرئة (استرواح صدر).',
      'أوعية كبيرة (نادراً): تمزّق في الشريان الأورطي — نادر لكنه خطير جداً، ويُشتبه به مع ألم شديد مفاجئ ينتشر إلى الظهر.',
      'جدار الصدر والمعدة: شدّ عضلي أو إصابة، حرقة وارتجاع معدة، أو قلق ونوبة هلع — وهي شائعة، لكنها تُشخَّص فقط بعد استبعاد ما فوقها.',
    ],
    thinkingEn: [
      'The heart first: a heart attack (blocked heart artery) or angina — ruled out first because its treatment is time-critical.',
      'The lungs: a lung clot, pneumonia, or air around the lung (collapsed lung).',
      'Large vessels (rarely): a tear in the aorta — rare but very dangerous, suspected with sudden severe pain spreading to the back.',
      'Chest wall and stomach: muscle strain or injury, heartburn and reflux, or anxiety and panic attacks — common, but only diagnosed after the causes above are excluded.',
    ],
    tests: [
      { nameAr: 'تخطيط القلب (ECG)', nameEn: 'ECG (heart tracing)', whyAr: 'يرسم النشاط الكهربائي للقلب خلال دقائق — يبيّن إذا كانت عضلة القلب تعاني من نقص دم أو أزمة جارية، وهو أول فحص يُعمل.', whyEn: 'Traces the heart\'s electrical activity within minutes — shows whether the heart muscle is starved of blood or a heart attack is in progress; it is the first test done.' },
      { nameAr: 'تحليل التروبونين بالدم', nameEn: 'Troponin blood test', whyAr: 'بروتين يخرج من عضلة القلب عندما تتأذى — ارتفاعه يؤكد أذية قلبية، وقد يُعاد بعد ساعات لأن مستواه يرتفع تدريجياً؛ هكذا يفرّق الطبيب بين أزمة قلبية وألم غير قلبي.', whyEn: 'A protein released from heart muscle when it is injured — a rise confirms heart injury, and it may be repeated after some hours because its level climbs gradually; this is how the doctor distinguishes a heart attack from non-heart pain.' },
      { nameAr: 'صورة أشعة للصدر', nameEn: 'Chest X-ray', whyAr: 'تُظهر الرئتين وحجم القلب — تكشف التهاباً رئوياً أو سوائل أو هواء حول الرئة.', whyEn: 'Shows the lungs and heart size — reveals pneumonia, fluid, or air around the lung.' },
      { nameAr: 'فحص الجلطة (D-dimer أو تصوير مقطعي للشرايين الرئوية)', nameEn: 'Clot testing (D-dimer or CT pulmonary angiogram)', whyAr: 'إذا اشتبه الفريق بجلطة رئوية: تحليل D-dimer قد يستبعدها إن كان سلبياً، والتصوير المقطعي بالصبغة يؤكدها أو ينفيها ويبيّن مكانها — وبه يقرر الطبيب بدء مميعات الدم.', whyEn: 'If the team suspects a lung clot: a D-dimer blood test can rule it out when negative, and a CT scan with dye confirms or excludes it and shows its location — letting the doctor decide on blood thinners.' },
      { nameAr: 'تحاليل دم عامة وقياس الأكسجين والضغط والنبض', nameEn: 'General blood tests, oxygen, blood pressure and pulse', whyAr: 'تعطي صورة عن الالتهاب وفقر الدم ووظائف الكلى (مهمة قبل الصبغة)، والعلامات الحيوية ترشد لخطورة الحالة وسرعة التدخل.', whyEn: 'Give a picture of infection, anemia, and kidney function (important before dye), while vital signs guide how dangerous the situation is and how fast to act.' },
    ],
    procedures: [
      { nameAr: 'خط وريدي ومراقبة قلب مستمرة', nameEn: 'IV line and continuous heart monitoring', whyAr: 'الخط الوريدي يتيح إعطاء الأدوية والسوائل فوراً عند الحاجة، والمراقبة تنبّه الفريق لأي اضطراب بنظم القلب لحظة حدوثه.', whyEn: 'The IV line allows medicines and fluids to be given immediately when needed, and monitoring alerts the team to any heart-rhythm disturbance the moment it happens.' },
      { nameAr: 'أدوية يعطيها الفريق (مثل الأسبرين أو النترات عند الاشتباه القلبي)', nameEn: 'Medicines given by the team (such as aspirin or nitrates when a heart cause is suspected)', whyAr: 'تُعطى بقرار الفريق داخل المشفى وحسب التخطيط والتحاليل — الأسبرين يخفف تجلّط الدم فوق الشريان الضيّق، والنترات توسّع الشرايين؛ لا تأخذها من عندك بدل الذهاب للمشفى.', whyEn: 'Given by the team\'s decision inside hospital based on the ECG and bloods — aspirin reduces clotting over the narrowed artery and nitrates widen arteries; do not take them on your own instead of going to hospital.' },
      { nameAr: 'قثطرة قلبية علاجية عند تأكد الأزمة', nameEn: 'Treatment catheterization when a heart attack is confirmed', whyAr: 'إذا أكدت الفحوص أزمة قلبية، قد تُفتح الشريان المسدود بقثطرة ودعامة — الفائدة للطبيب والمريض معاً: استعادة دم عضلة القلب بسرعة تنقذ جزءاً أكبر منها.', whyEn: 'If tests confirm a heart attack, the blocked artery may be opened with a catheter and stent — the benefit, for doctor and patient alike: restoring the heart muscle\'s blood quickly saves more of it.' },
      { nameAr: 'قبول ومراقبة لعدة ساعات مع إعادة التروبونين', nameEn: 'Admission and observation with repeat troponin', whyAr: 'بعض الآلام لا تُحسم بفحص واحد — المراقبة وفحص متكرر يمنعان خروج مريض بأزمة لم تظهر بعد، ويطمئنّان الفريق قبل صرفك.', whyEn: 'Some pain cannot be settled by one test — observation and a repeat test prevent discharging someone whose heart attack has not yet declared itself, and reassure the team before you leave.' },
    ],
    sourceName: 'NHS — Chest pain',
    sourceUrl: 'https://www.nhs.uk/symptoms/chest-pain/',
  },
  {
    id: 'breathlessness',
    nameAr: 'ضيق التنفس',
    nameEn: 'Shortness of breath',
    patterns: ['ضيق تنفس', 'ضيق في التنفس', 'صعوبة في التنفس', 'صعوبة بالتنفس', 'ضيق نفس', 'ما عم بقدر اتنفس', 'ما بقدر اتنفس', 'shortness of breath', 'breathless', 'difficulty breathing'],
    emergencyAr: 'إذا ضيق التنفس شديد أو مفاجئ الآن — لا تستطيع إكمال جملة، أو شفاهك تميل للزرقة، أو معه ألم صدر — اطلب الإسعاف فوراً واجلس منتصباً ولا تستلقِ.',
    emergencyEn: 'If the breathlessness is severe or sudden now — you cannot finish a sentence, your lips look blue, or it comes with chest pain — call an ambulance immediately, sit upright, and do not lie flat.',
    introAr: 'ضيق التنفس له أسباب كثيرة: شائعة كالربو والتهاب الصدر والوزن الزائد والتدخين ونوبات الهلع، وأحياناً خطيرة كقصور القلب أو جلطة الرئة. الفريق يبدأ دائماً باستبعاد الخطير.',
    introEn: 'Breathlessness has many causes: common ones like asthma, chest infection, excess weight, smoking, and panic attacks, and sometimes serious ones like heart failure or a lung clot. The team always starts by excluding the dangerous ones.',
    thinkingAr: [
      'مجرى الهواء والرئة أولاً: نوبة ربو أو انسداد رئوي مزمن، التهاب رئوي، سوائل في الرئة أو حولها، هواء حول الرئة، أو جلطة رئوية.',
      'القلب: قصور قلب يجعل السوائل تتجمع في الرئة، أو أزمة قلبية تأتي على شكل ضيق تنفس (خاصة عند كبار السن ومرضى السكري).',
      'الدم: فقر دم شديد يجعل الدم يحمل أكسجين أقل فيشعر المريض باللهاث مع أي جهد.',
      'أسباب أخرى: قلق ونوبة هلع (تُشخَّص بعد استبعاد الجسدي)، أو إنتان عام في الجسم.',
    ],
    thinkingEn: [
      'Airway and lungs first: an asthma or COPD flare, pneumonia, fluid in or around the lung, air around the lung, or a lung clot.',
      'The heart: heart failure letting fluid collect in the lungs, or a heart attack presenting as breathlessness (especially in older people and people with diabetes).',
      'The blood: severe anemia means the blood carries less oxygen, so the patient feels breathless with any effort.',
      'Other causes: anxiety or a panic attack (diagnosed after physical causes are excluded), or a body-wide infection.',
    ],
    tests: [
      { nameAr: 'قياس أكسجين الدم (بإصبعك) والعلامات الحيوية', nameEn: 'Blood oxygen (finger probe) and vital signs', whyAr: 'أسرع مؤشر على خطورة الوضع: انخفاض الأكسجين أو تسارع التنفس والنبض يرفع أولوية التدخل فوراً.', whyEn: 'The fastest indicator of how dangerous the situation is: low oxygen or fast breathing and pulse raise the priority of intervention immediately.' },
      { nameAr: 'تخطيط القلب (ECG)', nameEn: 'ECG', whyAr: 'لأن القلب سبب محتمل دائماً لضيق التنفس — يكشف أزمة قلبية أو اضطراب نظم أو علامات إجهاد قلبي.', whyEn: 'Because the heart is always a possible cause of breathlessness — it reveals a heart attack, a rhythm disturbance, or signs of heart strain.' },
      { nameAr: 'صورة أشعة للصدر', nameEn: 'Chest X-ray', whyAr: 'تبيّن التهاب الرئة والسوائل وهواء حول الرئة وحجم القلب — توجّه العلاج من أول ساعة.', whyEn: 'Shows pneumonia, fluid, air around the lung, and heart size — it directs treatment from the first hour.' },
      { nameAr: 'تحاليل دم (تعداد دم، BNP، تروبونين، وغازات الدم أحياناً)', nameEn: 'Blood tests (blood count, BNP, troponin, sometimes blood gases)', whyAr: 'تعداد الدم يكشف الالتهاب وفقر الدم؛ BNP يرتفع عندما يتمدد القلب بالسوائل فيدعم تشخيص قصور القلب؛ التروبونين يكشف أذية القلب؛ وغازات الدم تقيس الأكسجين وثاني أكسيد الكربون بدقة عندما يكون الوضع جدياً.', whyEn: 'The blood count reveals infection and anemia; BNP rises when the heart is stretched by fluid, supporting heart failure; troponin reveals heart injury; blood gases measure oxygen and carbon dioxide precisely when the situation is serious.' },
      { nameAr: 'فحص الجلطة الرئوية (D-dimer أو تصوير مقطعي)', nameEn: 'Lung-clot testing (D-dimer or CT scan)', whyAr: 'عندما يشتبه الفريق بجلطة (ضيق مفاجئ، ألم صدر مع التنفس، تورّم ساق) — نتيجته تقرر بدء مميعات الدم والتصوير.', whyEn: 'When the team suspects a clot (sudden breathlessness, chest pain on breathing, a swollen leg) — its result decides starting blood thinners and imaging.' },
    ],
    procedures: [
      { nameAr: 'أكسجين عند الحاجة', nameEn: 'Oxygen when needed', whyAr: 'يرفع أكسجين الدم ريثما يُعالج السبب — يُعطى ويُضبط حسب قياس الأكسجين لا بشكل عشوائي.', whyEn: 'Raises blood oxygen while the cause is treated — given and adjusted by the oxygen measurement, not at random.' },
      { nameAr: 'بخاخات أو أدوية وريدية حسب السبب', nameEn: 'Nebulizers or IV medicines according to the cause', whyAr: 'بخاخات موسّعة عند تضيّق المجرى، مضادات عند الالتهاب، مدرّات عند سوائل القلب — اختيار الدواء يتبع نتيجة الفحوص، ولهذا تُعمل الفحوص أولاً.', whyEn: 'Widening nebulizers for narrowed airways, antibiotics for infection, water tablets for heart fluid — the medicine choice follows the test results, which is why tests come first.' },
      { nameAr: 'مميعات دم عند اشتباه أو تأكد جلطة', nameEn: 'Blood thinners when a clot is suspected or confirmed', whyAr: 'تمنع الجلطة من الكبر وتنقلها — قرارها يعتمد على فحص الجلطة والتصوير ونزيف المريض.', whyEn: 'They stop the clot from growing — the decision depends on the clot testing, imaging, and the patient\'s bleeding risk.' },
      { nameAr: 'إفراغ هواء أو سوائل حول الرئة (نادراً، بأنبوب صدري)', nameEn: 'Draining air or fluid around the lung (rarely, with a chest drain)', whyAr: 'إذا كان الهواء أو السائل يضغط الرئة، إفراغه يعيد تمددها فوراً — يُقرر بعد الأشعة وعند فشل العلاجات الأبسط.', whyEn: 'If air or fluid is compressing the lung, draining it re-expands the lung immediately — decided after imaging and when simpler treatments are not enough.' },
    ],
    sourceName: 'NHS — Shortness of breath',
    sourceUrl: 'https://www.nhs.uk/symptoms/shortness-of-breath/',
  },
  {
    id: 'abdominal-pain',
    nameAr: 'ألم البطن',
    nameEn: 'Abdominal pain',
    patterns: ['ألم في البطن', 'ألم بطن', 'ألم بالبطن', 'وجع بطن', 'ألم في بطني', 'مغص', 'abdominal pain', 'stomach ache', 'tummy pain', 'ألم بالمعدة', 'وجع بالمعدة'],
    emergencyAr: 'إذا ألم البطن شديد جداً الآن، أو البطن قاسٍ كالخشب، أو معه استفراغ متكرر أو حرارة عالية أو دوخة/إغماء — اطلب المساعدة الطبية فوراً، ولا تأكل أو تشرب (قد تحتاج عملية).',
    emergencyEn: 'If the abdominal pain is very severe now, the abdomen feels board-hard, or it comes with repeated vomiting, high fever, or dizziness/fainting — seek medical help immediately and eat or drink nothing (surgery may be needed).',
    introAr: 'ألم البطن من أكثر الأعراض تنوعاً بأسبابه — من غازات وإمساك عابرة إلى التهاب زائدة أو انسداد أمعاء. مكان الألم وتطوّره عبر الساعات هو ما يوجّه الفريق، لذلك يفحص البطن بيده قبل أي تصوير.',
    introEn: 'Abdominal pain is one of the most varied symptoms — from passing gas and constipation to appendicitis or a bowel blockage. The pain\'s location and how it evolves over hours guide the team, which is why they examine the abdomen by hand before any scan.',
    thinkingAr: [
      'أسباب جراحية تُستبعد أولاً: التهاب الزائدة، انسداد الأمعاء، ثقب في المعدة أو الأمعاء، التهاب المرارة أو حصيّاتها.',
      'المسالك البولية والكلى: التهاب بول، حصاة كلية (ألم ينتشر إلى الظهر والخاصرة).',
      'عند النساء: أسباب نسائية كحمل خارج الرحم أو كيس مبيض منفجر — لذلك اختبار الحمل جزء من التقييم.',
      'أسباب طبية أخرى: التهاب معدة وأمعاء (إسهال واستفراغ)، إمساك، قرحة، التهاب بنكرياس — تُقرأ مع التحاليل والتصوير.',
    ],
    thinkingEn: [
      'Surgical causes are excluded first: appendicitis, bowel obstruction, a perforated stomach or bowel, gallbladder inflammation or stones.',
      'Urinary tract and kidneys: urine infection, a kidney stone (pain spreading to the back and flank).',
      'In women: gynaecological causes such as an ectopic pregnancy or a ruptured ovarian cyst — which is why a pregnancy test is part of the assessment.',
      'Other medical causes: gastroenteritis (diarrhea and vomiting), constipation, an ulcer, pancreatitis — read together with bloods and imaging.',
    ],
    tests: [
      { nameAr: 'فحص البطن باليد والاستماع للأمعاء', nameEn: 'Hands-on abdominal examination and listening to the bowel', whyAr: 'أول وأهم خطوة: مكان الألم وقساوة البطن وردّة الفعل عند الضغط توجّه كل ما بعدها، وبدون أجهزة.', whyEn: 'The first and most important step: the pain\'s location, the abdomen\'s rigidity, and the reaction to pressure direct everything after it, with no machines needed.' },
      { nameAr: 'تحاليل دم (تعداد دم، CRP، وظائف كلى وكبد، وأميليز/ليباز أحياناً)', nameEn: 'Blood tests (blood count, CRP, kidney and liver function, sometimes amylase/lipase)', whyAr: 'تعداد الدم وCRP يبيّنان الالتهاب وشدته؛ وظائف الكبد تشير للمرارة والقنوات؛ الكلى تهم قبل الصبغة والعملية؛ والأميليز/ليباز يكشفان التهاب البنكرياس — كل نتيجة تستبعد سبباً أو تقرّب آخر.', whyEn: 'The blood count and CRP show infection and its severity; liver function points to the gallbladder and ducts; kidneys matter before dye and surgery; amylase/lipase reveal pancreatitis — each result excludes one cause or brings another closer.' },
      { nameAr: 'تحليل بول واختبار حمل عند النساء', nameEn: 'Urine test and a pregnancy test for women', whyAr: 'البول يكشف التهاب المسالك أو دم الحصاة، واختبار الحمل يستبعد الحمل خارج الرحم — سبب خطير لا يظهر إلا بهذا الاختبار البسيط.', whyEn: 'Urine reveals a urinary infection or stone blood, and the pregnancy test excludes an ectopic pregnancy — a dangerous cause that only this simple test reveals.' },
      { nameAr: 'تصوير بالموجات فوق الصوتية (ألتراساوند)', nameEn: 'Ultrasound scan', whyAr: 'سريع وبدون إشعاع: يبيّن المرارة وحصيّاتها والكلى والحوض والسوائل الحرة، وغالباً أول تصوير خاصة عند النساء والشباب.', whyEn: 'Fast and radiation-free: shows the gallbladder and its stones, the kidneys, pelvis, and free fluid — usually the first scan, especially in women and younger patients.' },
      { nameAr: 'تصوير مقطعي للبطن (CT) عند الحاجة', nameEn: 'CT scan of the abdomen when needed', whyAr: 'أدق صورة شاملة للأسباب الجراحية (زائدة، انسداد، ثقب، تجمّعات) — يُطلب عندما لا تحسم الفحوص الأولى الصورة، ونتيجته تقرر العملية غالباً.', whyEn: 'The most complete picture of surgical causes (appendix, obstruction, perforation, collections) — requested when the first tests do not settle the picture, and its result usually decides surgery.' },
    ],
    procedures: [
      { nameAr: 'صيام (لا أكل ولا شرب) وسوائل وريدية', nameEn: 'Fasting (nothing to eat or drink) and IV fluids', whyAr: 'الصيام يُبقي المعدة فارغة تحضيراً لعملية محتملة ويمنع تفاقم الانسداد، والسوائل الوريدية تعوّض الجفاف من الاستفراغ وقلة الشرب — لهذا يُمنع الأكل قبل التقييم.', whyEn: 'Fasting keeps the stomach empty in preparation for possible surgery and prevents worsening a blockage, while IV fluids replace losses from vomiting and poor intake — which is why eating is stopped before assessment.' },
      { nameAr: 'مسكنات ومضادات غثيان بقرار الفريق', nameEn: 'Pain relief and anti-nausea medicines by the team\'s decision', whyAr: 'تُعطى بعد فحص البطن حتى لا تُخفي تطوّر الألم الذي يتابعه الفريق كمؤشر — جرعتها وتوقيتها بيد الفريق لا المريض.', whyEn: 'Given after the abdominal examination so they do not mask the pain\'s evolution, which the team follows as a sign — their dose and timing are the team\'s, not the patient\'s.' },
      { nameAr: 'مضادات حيوية عند اشتباه إنتان', nameEn: 'Antibiotics when infection is suspected', whyAr: 'عندما تشير الحرارة والتحاليل لإنتان (زائدة، مرارة، مسالك) — تبدأ غالباً قبل تأكد التصوير لأن تأخيرها يفاقم الإنتان.', whyEn: 'When fever and bloods point to infection (appendix, gallbladder, urinary) — they are usually started before imaging confirms it, because delaying them worsens infection.' },
      { nameAr: 'استشارة جراحة وعملية عند الحاجة (زائدة، مرارة، انسداد)', nameEn: 'Surgical consultation and an operation when needed (appendix, gallbladder, obstruction)', whyAr: 'بعض الأسباب لا تُعالج إلا بالعملية — قرارها يُبنى على الفحص والتحاليل والتصوير معاً، ولهذا قد ينتظر الفريق نتائجها قبل الحسم، أو يقرر فوراً إذا كانت الصورة واضحة وخطيرة.', whyEn: 'Some causes can only be treated by surgery — the decision is built on examination, bloods, and imaging together, which is why the team may wait for their results before deciding, or decide immediately if the picture is clear and dangerous.' },
      { nameAr: 'مراقبة وفحص متكرر لعدة ساعات أحياناً', nameEn: 'Observation and repeat examination over several hours, sometimes', whyAr: 'بعض الحالات — كالزائدة المبكرة — لا تُحسم من أول فحص؛ تطوّر الألم عبر ساعات تحت المراقبة معلومة تشخيصية بحد ذاته يحمي المريض من عملية غير لازمة أو تأخير خطير.', whyEn: 'Some cases — like early appendicitis — cannot be settled by the first examination; how the pain evolves over hours under observation is itself diagnostic information that protects the patient from an unnecessary operation or a dangerous delay.' },
    ],
    sourceName: 'NHS — Appendicitis & abdominal pain assessment',
    sourceUrl: 'https://www.nhs.uk/conditions/appendicitis/',
  },
  {
    id: 'flank-pain',
    nameAr: 'ألم الخاصرة',
    nameEn: 'Flank pain',
    patterns: ['الخاصرة', 'خاصرتي', 'ألم في جنبي', 'ألم بالجنب', 'وجع بالجنب', 'ألم في جانبي', 'flank pain', 'loin pain', 'ألم في الجنب'],
    emergencyAr: 'ألم الخاصرة مع حرارة أو قشعريرة، أو استفراغ متكرر، أو عدم القدرة على التبوّل، أو ألم شديد لا يهدأ — اطلب المساعدة الطبية العاجلة الآن: قد تكون كلية مسدودة ومصابة بإنتان، وهذه حالة طارئة لأن الإنتان فوق انسداد قد ينتشر إلى الدم.',
    emergencyEn: 'Flank pain with fever or shivering, repeated vomiting, inability to pass urine, or severe pain that will not settle — seek urgent medical help now: it may be a blocked, infected kidney, an emergency because infection above a blockage can spread to the bloodstream.',
    introAr: 'ألم الخاصرة (جانب الظهر تحت الأضلاع) أشهر أسبابه حصاة الكلى والتهابات المسالك والكلى وشدّ العضلات. ألم الحصاة الكلاسيكي يبدأ في الخاصرة وقد ينتشر إلى أعلى الفخذ من الداخل، ويأتي على موجات شديدة ثم يخف.',
    introEn: 'Flank pain (the side of the back below the ribs) is most often caused by a kidney stone, urinary or kidney infection, or muscle strain. Classic stone pain starts in the flank, may spread to the inner upper thigh, and comes in severe waves that then ease.',
    thinkingAr: [
      'التهاب الكلى (إنتان صاعد) أولاً عند وجود حرارة: ألم خاصرة + حرارة + أعراض بولية — خطورته انتشار الإنتان، خاصة إذا كان فوق انسداد.',
      'حصاة كلية أو حالبية: تسدّ مجرى البول جزئياً أو كلياً فتتوسع الكلية — التصوير يبيّن حجمها ومكانها، وبه يُقرر إن كانت ستخرج وحدها أم تحتاج إجراء.',
      'التهاب مسالك بولية سفلي: حرقة وتكرار تبوّل، وقد يصعد للكلى إن تُرك.',
      'شدّ عضلي أو مشكلة ظهر: يزداد مع الحركة ووضعيات معينة وبلا أعراض بولية ولا حرارة — يُشخَّص بعد استبعاد ما قبله.',
    ],
    thinkingEn: [
      'Kidney infection (ascending infection) first when fever is present: flank pain + fever + urinary symptoms — its danger is the infection spreading, especially above a blockage.',
      'A kidney or ureteric stone: it partially or fully blocks the urine flow so the kidney swells — imaging shows its size and place, deciding whether it will pass alone or needs a procedure.',
      'A lower urinary tract infection: burning and frequent urination, which can climb to the kidney if left.',
      'Muscle strain or a back problem: worse with movement and certain positions, with no urinary symptoms and no fever — diagnosed after the above are excluded.',
    ],
    tests: [
      { nameAr: 'فحص بول (شريط وزراعة)', nameEn: 'Urine test (dipstick and culture)', whyAr: 'يكشف الدم (شائع مع الحصاة حتى لو لم ترَه) وعلامات الالتهاب، والزراعة تحدد الجرثوم والمضاد المناسب — يوجه العلاج من البداية.', whyEn: 'Reveals blood (common with a stone even when invisible) and signs of infection, while the culture identifies the germ and the right antibiotic — directing treatment from the start.' },
      { nameAr: 'تحاليل دم (وظائف كلى وعلامات التهاب)', nameEn: 'Blood tests (kidney function and infection markers)', whyAr: 'وظائف الكلى تبيّن إن كان الانسداد يؤثر عليها، وعلامات الالتهاب تقدّر شدة الإنتان — والنتيجتان معاً تقرران القبول في المشفى من عدمه.', whyEn: 'Kidney function shows whether the blockage is affecting the kidney, and infection markers gauge how severe the infection is — together they decide admission or not.' },
      { nameAr: 'تصوير مقطعي بدون صبغة (CT KUB) للبالغين', nameEn: 'Non-contrast CT scan (CT KUB) for adults', whyAr: 'أدق فحص للحصاة: يبيّن وجودها وحجمها ومكانها بدقة — وحجم الحصاة هو ما يقرر إن كانت ستخرج بالبول وحدها أم تحتاج تفتيتاً أو منظاراً.', whyEn: 'The most accurate stone test: it shows the stone\'s presence, size, and exact location — and the stone\'s size decides whether it will pass in urine alone or needs breaking up or a scope.' },
      { nameAr: 'ألتراساوند (خاصة للحامل والأطفال)', nameEn: 'Ultrasound (especially in pregnancy and children)', whyAr: 'بدون إشعاع: يبيّن توسّع الكلية (تجمع البول فوق انسداد) وبعض الحصيّات — كافٍ غالباً عندما يجب تجنّب الأشعة المقطعية.', whyEn: 'Radiation-free: shows kidney swelling (urine collecting above a blockage) and some stones — often enough when CT must be avoided.' },
      { nameAr: 'اختبار حمل عند النساء', nameEn: 'Pregnancy test for women', whyAr: 'يغيّر خطة التصوير والعلاج، ويستبعد أسباباً نسائية لألم الجانب والحوض.', whyEn: 'It changes the imaging and treatment plan and excludes gynaecological causes of side and pelvic pain.' },
    ],
    procedures: [
      { nameAr: 'سوائل وريدية ومسكنات قوية ومضاد غثيان بقرار الفريق', nameEn: 'IV fluids, strong pain relief, and anti-sickness medicine by the team\'s decision', whyAr: 'مغص الحصاة من أشد الآلام — السيطرة عليه أولوية بحد ذاتها، والسوائل تعوّض الاستفراغ وتدعم الكلية ريثما تظهر النتائج.', whyEn: 'Stone colic is among the most severe pains — controlling it is a priority in itself, and fluids replace vomiting losses and support the kidney while results come back.' },
      { nameAr: 'مضادات حيوية عند وجود إنتان', nameEn: 'Antibiotics when infection is present', whyAr: 'التهاب الكلى لا ينتظر: يبدأ العلاج عند الاشتباه القوي، والزراعة لاحقاً تؤكد المضاد الصحيح أو تبدّله.', whyEn: 'A kidney infection does not wait: treatment starts on strong suspicion, and the culture later confirms the right antibiotic or changes it.' },
      { nameAr: 'تصريف عاجل للكلية المسدودة المصابة (دعامة حالبية أو أنبوب عبر الظهر)', nameEn: 'Urgent drainage of a blocked infected kidney (ureteric stent or a back tube — nephrostomy)', whyAr: 'إذا كانت الكلية مسدودة وفوقها إنتان، تصريف البول العاجل ينقذ الكلية ويمنع انتشار الإنتان — ويُعمل قبل أي علاج نهائي للحصاة؛ هذه من الحالات التي لا تنتظر للصباح.', whyEn: 'If the kidney is blocked with infection above it, draining the urine urgently saves the kidney and stops the infection spreading — it is done before any definitive stone treatment; this is one of the situations that cannot wait until morning.' },
      { nameAr: 'تفتيت الحصاة بالموجات أو إخراجها بالمنظار (للحصيّات الأكبر)', nameEn: 'Breaking the stone with shock waves or removing it with a scope (for larger stones)', whyAr: 'الحصيّات الصغيرة تخرج غالباً وحدها مع السوائل والمسكنات ودواء يساعد خروجها بقرار الفريق؛ الأكبر تحتاج تفتيتاً أو منظاراً — قرارها مبني على حجم الحصاة من التصوير.', whyEn: 'Small stones usually pass alone with fluids, pain relief, and a stone-passage medicine by the team\'s decision; larger ones need shock-wave breaking or a scope — decided by the stone\'s size on imaging.' },
      { nameAr: 'جمع الحصاة عند خروجها لتحليلها', nameEn: 'Collecting the stone when it passes, for analysis', whyAr: 'قد يُطلب منك تصفية البول وجمع الحصاة — تحليلها يخبر الطبيب بنوعها وسبب تشكّلها، فتُبنى خطة وقاية تمنع تكرارها.', whyEn: 'You may be asked to strain your urine and collect the stone — analyzing it tells the doctor its type and why it formed, so a prevention plan can stop it recurring.' },
    ],
    sourceName: 'NHS — Kidney stones',
    sourceUrl: 'https://www.nhs.uk/conditions/kidney-stones/',
  },
  {
    id: 'toothache',
    nameAr: 'ألم الأسنان',
    nameEn: 'Toothache',
    patterns: ['ألم في الأسنان', 'ألم الأسنان', 'وجع الأسنان', 'ألم سن', 'وجع سن', 'ألم في السن', 'toothache', 'tooth pain'],
    emergencyAr: 'طوارئ فوراً إذا: تورّم حول العين أو في الرقبة، أو تورّم في الفم أو الرقبة يجعل التنفس أو البلع أو الكلام صعباً — التهاب الأسنان المنتشر قد يقفل مجرى الهواء.',
    emergencyEn: 'Emergency now if: swelling around your eye or in your neck, or swelling in your mouth or neck that makes breathing, swallowing, or speaking difficult — a spreading dental infection can close the airway.',
    introAr: 'ألم الأسنان يُعالج عند طبيب الأسنان — الطبيب العام لا يقدم علاج أسنان. راجع طبيب أسنان إذا استمر الألم أكثر من يومين، أو لم يزُل بالمسكنات، أو معه حرارة أو ألم عند العضّ أو لثة حمراء أو طعم سيئ في الفم، أو تورّم في الخد أو الفك.',
    introEn: 'Toothache is treated by a dentist — a GP cannot give dental treatment. See a dentist if it lasts more than 2 days, does not go away with painkillers, comes with a high temperature, pain when you bite, red gums, or a bad taste in your mouth, or your cheek or jaw is swollen.',
    thinkingAr: [
      'خراج أو التهاب سنّي أولاً: تجمّع قيح حول السن — خطورته انتشاره إلى الفك والرقبة، ويُشتبه به مع تورّم وحرارة وطعم سيئ في الفم.',
      'تسوّس الأسنان: تجويف يصل تدريجياً إلى عصب السن فيسبب ألماً مع الحلو والبارد والساخن ثم ألماً مستمراً.',
      'سنّ متشقق أو متضرر، أو حشوة رخوة أو مكسورة: ألم عند العضّ والمضغ.',
      'ضرس عقل يخترق اللثة ولا يجد مكاناً كافياً للخروج: التهاب حوله شائع في آخر الفك.',
      'أسباب أخرى: مرض لثة، صرير الأسنان (طحنها)، أو حساسية أسنان.',
    ],
    thinkingEn: [
      'A dental abscess or infection first: a collection of pus around the tooth — its danger is spreading to the jaw and neck; suspected with swelling, temperature, and a bad taste in the mouth.',
      'Tooth decay: a cavity gradually reaching the tooth nerve, causing pain with sweet, cold, or hot food, then constant pain.',
      'A cracked or damaged tooth, or a loose or broken filling: pain on biting and chewing.',
      'A wisdom tooth breaking through the gum without enough room to come through fully: infection around it is common at the back of the jaw.',
      'Other causes: gum disease, teeth grinding, or sensitive teeth.',
    ],
    tests: [
      { nameAr: 'فحص الأسنان السريري عند طبيب الأسنان', nameEn: 'Clinical dental examination', whyAr: 'الطبيب يفحص السن واللثة بحثاً عن تسوس أو تشقق أو حشوة تالفة أو علامات خراج — وهو ما يحدد العلاج؛ ولهذا لا يفيد طبيب عام هنا.', whyEn: 'The dentist examines the tooth and gums for decay, cracks, a damaged filling, or signs of an abscess — this decides the treatment; this is why a GP cannot help here.' },
      { nameAr: 'اختبار العضّ وحساسية الحرارة', nameEn: 'Bite and temperature-sensitivity testing', whyAr: 'الألم عند العضّ يوجّه نحو تشقق أو خراج حول الجذر، واستجابة السن للبارد والساخن تساعد على معرفة حال العصب — اختبارات بسيطة بموعد الأسنان تُبنى عليها خطة العلاج.', whyEn: 'Pain when you bite points towards a crack or an abscess around the root, and how the tooth responds to cold and heat helps judge the nerve\'s state — simple chair-side tests the treatment plan is built on.' },
      { nameAr: 'مراجعة علامات الانتشار (تورّم، طعم سيئ، لثة حمراء)', nameEn: 'Reviewing spreading-infection signs (swelling, bad taste, red gums)', whyAr: 'وجودها ينقل الحالة من موعد عادي إلى موعد مستعجل، وتورّم الرقبة أو صعوبة التنفس والبلع تجعلها طارئة — الفريق يبني سرعة التدخل عليها.', whyEn: 'Their presence moves the case from a routine appointment to an urgent one, and neck swelling or difficulty breathing and swallowing makes it an emergency — the team builds the speed of intervention on them.' },
      { nameAr: 'قياس الحرارة ومراجعة مدة الألم واستجابته للمسكنات', nameEn: 'Temperature check, pain duration, and painkiller response review', whyAr: 'حرارة مرتفعة مع ألم أسنان تعني التهاباً يحتاج موعداً؛ وألم يتجاوز يومين أو لا يستجيب للمسكنات هو بحد ذاته معيار «راجع طبيب أسنان» الرسمي — به تُضبط أولوية موعدك.', whyEn: 'A high temperature with toothache means an infection needing an appointment; pain lasting more than 2 days or not going away with painkillers is itself the official "see a dentist" criterion — it sets your appointment\'s priority.' },
    ],
    procedures: [
      { nameAr: 'علاج السبب عند طبيب الأسنان', nameEn: 'Treating the cause at the dentist', whyAr: 'المسكنات وحدها لا تحل السبب — علاج التسوس أو الخراج أو الحشوة عند طبيب الأسنان هو ما ينهي الألم ويمنع الانتشار.', whyEn: 'Painkillers alone do not fix the cause — treating the decay, abscess, or filling at the dentist is what ends the pain and prevents spread.' },
      { nameAr: 'مسكنات بانتظار الموعد (إيبوبروفين أو باراسيتامول — الصيدلي ينصحك)', nameEn: 'Painkillers while waiting (ibuprofen or paracetamol — a pharmacist can advise)', whyAr: 'تخفف الألم حتى موعدك؛ والأطفال دون 16 لا يأخذون أسبرين. وجلّ مسكّن للفم من الصيدلية قد يساعد أيضاً.', whyEn: 'They ease the pain until your appointment; children under 16 should not take aspirin. A pain-relieving mouth gel from a pharmacy may also help.' },
      { nameAr: 'مضمضة ماء دافئ مالح + أطعمة لينة وفرشاة ناعمة', nameEn: 'Warm salt-water rinses, soft foods, and a soft toothbrush', whyAr: 'المضمضة (نصف ملعقة صغيرة ملح بكأس ماء دافئ، وتُبصق ولا تُبلع) تنظّف حول السن وتخفف الالتهاب؛ والأطعمة اللينة كاللبن والبيض المخفوق وتجنّب المضغ بالسن المؤلم والحلو والساخن/البارد جداً والتدخين يقلل التهيّج — والأطفال لا يجرّبون المضمضة.', whyEn: 'Rinsing (half a teaspoon of salt in a glass of warm water, spat out, not swallowed) cleans around the tooth and eases inflammation; soft foods like yoghurt or scrambled eggs, avoiding chewing with the sore tooth, and avoiding sweet, very hot or cold food and smoking reduce irritation — children should not try the rinse.' },
    ],
    sourceName: 'NHS — Toothache',
    sourceUrl: 'https://www.nhs.uk/conditions/toothache/',
  },
  {
    id: 'hand-pain',
    nameAr: 'ألم اليد والمعصم',
    nameEn: 'Hand and wrist pain',
    patterns: ['ألم في اليد', 'ألم اليد', 'وجع اليد', 'ألم في المعصم', 'ألم المعصم', 'وجع في يدي', 'تورم في اليد', 'hand pain', 'wrist pain', 'ألم في يدي'],
    emergencyAr: 'اطلب مساعدة عاجلة الآن إذا: ألم شديد، أو سمعت صوت كسر/فرقعة لحظة الإصابة، أو لا تستطيع تحريك معصمك أو حمل الأشياء، أو تغيّر شكل معصمك أو لونه، أو كتلة مؤلمة جداً وحارة وحمراء، أو فقدت الإحساس بيدك — قد يكون كسراً أو التهاباً.',
    emergencyEn: 'Get urgent help now if: severe pain, you heard a snap or popping sound at the time of injury, you cannot move your wrist or hold things, your wrist has changed shape or colour, a lump is very painful, hot or red, or you have lost feeling in your hand — these might be signs of a broken wrist or an infection.',
    introAr: 'ألم اليد والمعصم غالباً من إصابة أو رضّة، لكن له أسباباً كثيرة — وNHS ينبّه: لا تحاول تشخيص السبب بنفسك. العلامات أعلاه هي ما يفرّق الحالة العاجلة من التي تُدار في البيت.',
    introEn: 'Hand and wrist pain is often from an injury or bruising, but there are lots of possible causes — and the NHS warns: do not try to diagnose the cause yourself. The signs above are what separate an urgent case from one managed at home.',
    thinkingAr: [
      'كسر في المعصم أولاً بعد إصابة: ألم حاد مفاجئ وتورّم وصوت فرقعة أو طقطقة لحظة الإصابة.',
      'التواء المعصم: ألم وتورّم وكدمات وصعوبة تحريك المعصم أو الإمساك بالأشياء.',
      'التهاب أوتار (دي كيرفان) أو التهاب مفاصل: ألم وتورّم وتيبّس عند قاعدة الإبهام يستمر طويلاً، وقد يصعب تحريك الأصابع والإبهام، وقد توجد كتلة.',
      'متلازمة النفق الرسغي: ألم موجع يسوء ليلاً مع تنميل ووخز في الأصابع واليد والذراع وضعف في الإبهام أو صعوبة إمساك.',
      'كيس عقدي (غانغليون): كتلة ناعمة على ظهر المعصم، قد تكون مؤلمة.',
    ],
    thinkingEn: [
      'A broken wrist first after an injury: sudden sharp pain, swelling, and a popping or snapping sound during the injury.',
      'A sprained wrist: pain, swelling and bruising, and difficulty moving the wrist or gripping anything.',
      'Tendonitis (de Quervain\'s) or arthritis: pain, swelling and stiffness at the base of the thumb lasting a long time; it may be hard to move the fingers and thumb, and there may be a lump.',
      'Carpal tunnel syndrome: aching pain worse at night, with tingling, numbness or pins and needles in the fingers, hand or arm, a weak thumb or difficulty gripping.',
      'A ganglion cyst: a smooth lump on top of the wrist, which may be painful.',
    ],
    tests: [
      { nameAr: 'فحص اليد والمعصم سريرياً (حركة وقبضة)', nameEn: 'Clinical examination of the hand and wrist (movement and grip)', whyAr: 'الفريق يقارن اليد المصابة بالسليمة ويفحص مجال الحركة وقوة الإمساك ومكان الألم بدقة — نمط النتائج يوجّه بين الكسر والالتواء والأوتار والمفاصل قبل أي خطوة أخرى.', whyEn: 'The team compares the injured hand with the healthy one and checks range of movement, grip strength, and the exact site of pain — the pattern of findings points between fracture, sprain, tendons, and joints before any other step.' },
      { nameAr: 'فحص الإحساس والتنميل في اليد والأصابع', nameEn: 'Sensation and tingling check in the hand and fingers', whyAr: 'التنميل والوخز وفقدان الإحساس علامات انضغاط عصب (كالنفق الرسغي) أو أذية عصبية — وجودها يستدعي مراجعة طبيب حتى بلا إصابة، وهي أهم عند مرضى السكري لأن مشاكل اليد عندهم أخطر.', whyEn: 'Tingling, pins and needles, and loss of sensation are signs of nerve compression (such as carpal tunnel) or nerve injury — their presence warrants a GP visit even without an injury, and matters more with diabetes, because hand problems can be more serious.' },
      { nameAr: 'تقييم علامات الكسر والالتهاب من القائمة العاجلة', nameEn: 'Assessing fracture and infection signs from the urgent list', whyAr: 'شدة الألم وصوت الإصابة وعدم القدرة على التحريك أو الحمل وتغيّر الشكل أو اللون وكتلة حارة حمراء — أي منها يجعل التقييم عاجلاً، لأنه قد يعني كسراً أو التهاباً؛ وNHS ينبّه: إن ظننت كسراً لا تعالجه بنفسك.', whyEn: 'Severe pain, injury sounds, inability to move or hold things, changed shape or colour, and a hot red lump — any of these makes the assessment urgent, because it may mean a fracture or infection; and the NHS warns: if you think your wrist is broken, do not try to treat it yourself.' },
      { nameAr: 'مراجعة المسار بعد أسبوعين من العلاج المنزلي', nameEn: 'Course review after 2 weeks of home treatment', whyAr: 'عدم تحسّن الألم بعد أسبوعين من العناية المنزلية، أو ازدياده أو عودته، أو منعه نشاطاتك المعتادة — كلها معايير رسمية لمراجعة الطبيب وفتح باب تقييم أعمق أو إحالة.', whyEn: 'Pain not improved after 2 weeks of home treatment, getting worse or coming back, or stopping normal activities — all are official criteria for seeing a GP and opening deeper assessment or referral.' },
    ],
    procedures: [
      { nameAr: 'راحة وثلج ونزع الخواتم عند التورّم', nameEn: 'Rest, ice, and removing jewellery if swollen', whyAr: 'أرح معصمك، وضع كمادة ثلج بمنشفة حتى 20 دقيقة كل 2–3 ساعات، وانزع الخواتم إذا تورّمت يدك — ولا كمادات حرارة ولا حمامات ساخنة في أول 2–3 أيام بعد الإصابة.', whyEn: 'Rest your wrist, apply an ice pack wrapped in a towel for up to 20 minutes every 2 to 3 hours, and take off jewellery if your hand looks swollen — and no heat packs or hot baths for the first 2 to 3 days after an injury.' },
      { nameAr: 'جبيرة داعمة — خاصة ليلاً', nameEn: 'A supporting splint — especially at night', whyAr: 'تدعم المعصم وتخفف الألم، وتفيد خصوصاً أعراض الليل في النفق الرسغي؛ والصيدلي يساعد باختيارها (مرنة مطاطية إن احتجت استخدام معصمك) وبالمسكن المناسب (باراسيتامول أو جل/أقراص إيبوبروفين).', whyEn: 'It supports the wrist and eases pain, and especially helps night-time carpal tunnel symptoms; a pharmacist can help choose one (flexible rubber splints if you still need to use your wrist) and advise on painkillers (paracetamol or ibuprofen gel/tablets).' },
      { nameAr: 'حركة لطيفة وتخفيف النشاط المسبّب', nameEn: 'Gentle movement and cutting down the causing activity', whyAr: 'أبقِ يديك ومعصميك يتحركان بتمارين لطيفة للألم والتيبّس الخفيفين، وخفّف ما يسبب الألم (طباعة، أدوات اهتزازية لعملك، عزف)، وتجنّب رفع الثقيل أو الإمساك بشدة — وأدوات مساعدة للمهام الصعبة (فتح علب، تقطيع) تقلل العبء.', whyEn: 'Keep your hands and wrists moving with gentle exercises for mild pain and stiffness, cut down activities causing the pain (typing, vibrating tools for work, playing an instrument), and avoid lifting heavy objects or gripping tightly — gadgets and tools for difficult tasks (opening jars, chopping) reduce the strain.' },
      { nameAr: 'علاج طبيعي / خدمات العضلات والمفاصل (MSK)', nameEn: 'Physiotherapy / musculoskeletal (MSK) services', whyAr: 'لآلام الظهر والمفاصل والأوتار المستمرة: في مناطق كثيرة يمكنك إحالة نفسك لخدمات MSK المجتمعية والعلاج الطبيعي دون إحالة طبيب — تستعيد الحركة والقوة تدريجياً.', whyEn: 'For persistent back, joint, and tendon pain: in many areas you can refer yourself to community MSK services and physiotherapy without a GP referral — gradually restoring movement and strength.' },
    ],
    sourceName: 'NHS — Wrist pain / Hand pain',
    sourceUrl: 'https://www.nhs.uk/symptoms/hand-pain/wrist-pain/',
  },
  {
    id: 'headache',
    nameAr: 'الصداع',
    nameEn: 'Headache',
    patterns: ['صداع', 'ألم في الرأس', 'وجع رأس', 'وجع في الرأس', 'headache', 'head pain', 'ألم بالرأس'],
    emergencyAr: 'طوارئ فوراً إذا الصداع مع: نوبة صرع، أو خدر/ضعف بالجسم أو الوجه، أو بدأ فجأة وبألم شديد جداً، أو بعد إصابة رأس خلال آخر 3 أشهر، أو صعوبة كلام/توازن/مشي/تذكّر، أو نعاس أو تشوّش، أو فقدان نظر، أو طفح لا يختفي بالضغط عليه، أو حرارة عالية جداً وتيبّس رقبة وانزعاج من الضوء.',
    emergencyEn: 'Emergency now if the headache comes with: a seizure, numbness or weakness in the body or face, it started suddenly and is extremely painful, a head injury within the last 3 months, difficulty speaking, balancing, walking or remembering, drowsiness or confusion, loss of vision, a rash that does not fade under pressure, or a very high temperature with a stiff neck and bright lights bothering you.',
    introAr: 'أغلب الصداع يزول وحده وليس علامة على شيء خطير. لكن القائمة أعلاه هي علامات الخطر الرسمية — وجود أي منها يحوّل الصداع من «عالجه في البيت» إلى طوارئ. وموعد عاجل إذا: مشاكل نظر/عين، أو صداع يثور أو يسوء مع الكحّة والعطاس والانحناء والجهد، أو معه استفراغ، أو ألم فك عند الأكل أو ألم/حساسية بفروة الرأس.',
    introEn: 'Most headaches go away on their own and are not a sign of anything more serious. But the list above is the official danger list — any of them turns a headache from "treat at home" into an emergency. And an urgent appointment if: vision or eye problems, a headache triggered or worsened by coughing, sneezing, bending down or exercising, vomiting, or jaw pain when eating or a sore, tender scalp.',
    thinkingAr: [
      'أسباب خطيرة تُستبعد أولاً بعلامات الخطر: نزيف أو التهاب حول الدماغ (حرارة وتيبّس رقبة وطفح)، أو إصابة رأس حديثة، أو مشكلة عصبية مفاجئة (ضعف، كلام، نظر) — لهذا تُسأل عنها قبل كل شيء.',
      'زكام أو إنفلونزا: صداع مع حرارة وأعراض برد — شائع ويزول بزوالها.',
      'توتر ونمط حياة: إجهاد، وضعية سيئة، تخطّي وجبات، قلة سوائل (جفاف)، كحول زائد، إجهاد العينين ومشاكل النظر.',
      'أدوية وهرمونات: أخذ مسكنات كثيرة قد يسبب صداعاً بحد ذاته، وصداع هرموني مع الدورة أو سنّ اليأس.',
      'صداع شديد بنمط خاص: شقيقة (ميغرين) أو صداع عنقودي — يُشتبه بهما مع صداع شديد متكرر بنمط معروف، وبعدهما يأتي دور مفكرة الصداع لتحديد المحفزات.',
    ],
    thinkingEn: [
      'Dangerous causes ruled out first by the red flags: bleeding or infection around the brain (temperature, stiff neck, rash), a recent head injury, or a sudden neurological problem (weakness, speech, vision) — which is why you are asked about them before anything else.',
      'A cold or flu: headache with temperature and cold symptoms — common, and settles as they do.',
      'Tension and lifestyle: stress, bad posture, skipping meals, not drinking enough fluids (dehydration), too much alcohol, eye strain and eyesight problems.',
      'Medicines and hormones: taking too many painkillers can itself cause headaches, and hormonal headaches come with periods or the menopause.',
      'Severe headaches with a special pattern: migraine or cluster headache — suspected with severe recurring headaches in a known pattern; afterwards a headache diary helps work out the triggers.',
    ],
    tests: [
      { nameAr: 'أخذ قصة الصداع ونمطه ومحفزاته', nameEn: 'Taking the headache history, pattern, and triggers', whyAr: 'متى بدأ وكيف (فجأة أم تدريجياً) ومدّته وما يثيره (كحّة، عطاس، انحناء، جهد) وما يرافقه (استفراغ، مشاكل نظر) — النمط هو ما يفرّق الصداع العادي من الذي يحتاج تقييماً عاجلاً.', whyEn: 'When it started and how (suddenly or gradually), how long it lasts, what triggers it (coughing, sneezing, bending down, exercising) and what comes with it (vomiting, vision problems) — the pattern is what separates an ordinary headache from one needing urgent assessment.' },
      { nameAr: 'فحص عصبي (قوة وإحساس وكلام وتوازن وذاكرة)', nameEn: 'Neurological examination (strength, sensation, speech, balance, memory)', whyAr: 'كل بند فيه يقابل علامة خطر رسمية (ضعف أو خدر، صعوبة كلام أو مشي أو تذكّر، نعاس أو تشوّش) — نتيجة الفحص تقرر بين الاطمئنان والإحالة العاجلة للمشفى.', whyEn: 'Each item maps to an official red flag (weakness or numbness, difficulty speaking, walking or remembering, drowsiness or confusion) — the result decides between reassurance and an urgent hospital referral.' },
      { nameAr: 'فحص النظر والعينين وفروة الرأس والفك', nameEn: 'Eye, vision, scalp, and jaw assessment', whyAr: 'مشاكل النظر سبب شائع للصداع وعلامة خطر معاً؛ وألم الفك عند الأكل وحساسية فروة الرأس علامتان عاجلتان محددتان عند كبار السن — الفحص يغطيها كلها بدقائق.', whyEn: 'Eyesight problems are both a common headache cause and a red flag; jaw pain when eating and a tender scalp are specific urgent signs in older adults — the examination covers all of them in minutes.' },
      { nameAr: 'فحص حرارة وتيبّس رقبة وحساسية ضوء وطفح', nameEn: 'Temperature, neck-stiffness, light-sensitivity, and rash screen', whyAr: 'حرارة عالية جداً مع تيبّس رقبة وانزعاج من الضوء وطفح لا يختفي بالضغط — تجميعة التهاب حول الدماغ، أخطر ما يُستبعد في صداع مع حرارة، ووجودها يعني طوارئ فوراً.', whyEn: 'A very high temperature with a stiff neck, bright lights bothering you, and a rash that does not fade under pressure — the combination of infection around the brain, the most dangerous thing to exclude in a headache with fever; its presence means emergency now.' },
    ],
    procedures: [
      { nameAr: 'عناية ذاتية: ماء وراحة واسترخاء ومسكّن بسيط', nameEn: 'Self-care: water, rest, relaxation, and a simple painkiller', whyAr: 'اشرب ماء كافياً، وارتح (خاصة مع زكام/إنفلونزا)، وحاول الاسترخاء لأن التوتر يزيد الصداع، وخذ باراسيتامول أو إيبوبروفين — والصداع قد يدوم من 30 دقيقة لساعات وأحياناً أيام.', whyEn: 'Drink plenty of water, get plenty of rest (especially with a cold or flu), try to relax because stress can make headaches worse, and take paracetamol or ibuprofen — headaches can last 30 minutes, several hours, or sometimes several days.' },
      { nameAr: 'تجنّب ما يزيد الصداع', nameEn: 'Avoiding headache aggravators', whyAr: 'لا تتخطَّ الوجبات ولو بلا شهية، ولا تنم أكثر من عادتك (قد يزيد الصداع)، ولا تجهد عينيك طويلاً (كالشاشات)، ولا تشرب الكحول — وإن كان معك حرارة أو توعّك، ابقَ في البيت وتجنّب مخالطة الناس.', whyEn: 'Do not skip meals even if you do not feel like eating, do not sleep more than usual (it can make the headache worse), do not strain your eyes for long (for example at a screen), and do not drink alcohol — and if you also have a high temperature or feel unwell, stay home and avoid contact with other people.' },
      { nameAr: 'مفكرة صداع ومراجعة عند التكرار', nameEn: 'A headache diary and review if headaches recur', whyAr: 'تدوين وقت الصداع ومحفزاته المحتملة يساعدك ويساعد طبيبك على كشف النمط؛ وراجع طبيباً إذا جرّبت العلاج الذاتي ولم يتحسن أو ازداد، أو إذا صرت تصاب بصداع بانتظام.', whyEn: 'Recording when headaches happen and their possible triggers helps you and your doctor work out the pattern; and see a GP if you have tried treating it yourself and it is not getting better or is getting worse, or you regularly get headaches.' },
    ],
    sourceName: 'NHS — Headaches',
    sourceUrl: 'https://www.nhs.uk/symptoms/headaches/',
  },
  {
    id: 'back-pain',
    nameAr: 'ألم الظهر',
    nameEn: 'Back pain',
    patterns: ['ألم في الظهر', 'ألم الظهر', 'وجع الظهر', 'وجع ظهر', 'ألم أسفل الظهر', 'back pain', 'lower back pain', 'ألم بظهري'],
    emergencyAr: 'طوارئ فوراً إذا ألم الظهر مع: ألم/تنميل/ضعف/خدر في الساقين معاً، أو فقدان إحساس حول الأعضاء التناسلية أو الشرج، أو تغيّرات بالمثانة أو الأمعاء (صعوبة تبوّل أو تسرّب)، أو تغيّرات بالإحساس/القدرة الجنسية، أو ألم صدر، أو بدأ بعد حادث خطير كحادث سيارة.',
    emergencyEn: 'Emergency now if the back pain comes with: pain, tingling, weakness or numbness in both legs, loss of feeling around your genitals or anus, bladder or bowel changes (difficulty peeing, or peeing or pooing yourself), changes in sexual feeling or function, chest pain, or it started after a serious accident such as a car accident.',
    introAr: 'ألم الظهر — خصوصاً أسفله — شائع جداً، ويتحسن عادة خلال أسابيع قليلة وغالباً وحده، وسببه ليس واضحاً دائماً. القائمة أعلاه هي علامات الخطر النادرة والخطيرة. وموعد عاجل إذا شعرت بحرارة/برودة/رجفة أو توعّك عام، أو ألم شديد بدأ فجأة أو يزداد بسرعة.',
    introEn: 'Back pain — particularly lower back pain — is very common, and usually improves within a few weeks, often on its own, and its cause is not always obvious. The list above holds the rare, serious red flags. And an urgent appointment if you feel hot, cold, shivery or generally unwell, or it is severe pain that starts suddenly or is getting worse quickly.',
    thinkingAr: [
      'ضغط على أعصاب ذيل الحبل الشوكي (نادراً وخطيراً): يُشتبه به مع خدر حول الأعضاء التناسلية وتغيّرات المثانة والأمعاء وضعف الساقين معاً — حالة طارئة لأن التأخير قد يجعل الضرر دائماً.',
      'كسر أو سرطان أو التهاب (نادراً جداً): يُفكَّر بها مع حادث خطير، أو فقدان وزن غير مقصود، أو كتلة/تورّم أو تغيّر شكل الظهر، أو ألم لا يتحسن بالراحة أو يسوء ليلاً.',
      'انزلاق غضروفي (ديسك) أو عرق النسا (عصب محبوس): ألم قد ينزل إلى الساق مع تنميل — سبب معروف يحتاج تقييماً وعلاجاً إذا لم يتحسن.',
      'شدّ عضلي (إصابة/التواء): أشيع سبب معروف — ألم بعد جهد أو حركة خاطئة، يتحسن تدريجياً بالحركة.',
      'التهاب فقرات لاصق (أنكيلوزنغ): سبب التهابي لآلام ظهر طويلة وتيبّس، ذكره NHS ضمن الحالات الطبية المسببة.',
    ],
    thinkingEn: [
      'Compression of the cord-tail nerves (rare and serious): suspected with numbness around the genitals, bladder or bowel changes, and weakness in both legs — an emergency because delay can make damage permanent.',
      'A fracture, cancer, or infection (very rarely): considered after a serious accident, with unexplained weight loss, a lump/swelling or changed back shape, or pain that does not improve with rest or is worse at night.',
      'A slipped disc or sciatica (a trapped nerve): pain that may run down the leg with tingling — a known cause needing assessment and treatment if it does not settle.',
      'A pulled muscle (strain): the most common known cause — pain after effort or an awkward movement, improving gradually with activity.',
      'Ankylosing spondylitis: an inflammatory medical condition causing long-standing back pain and stiffness, listed by the NHS among medical causes.',
    ],
    tests: [
      { nameAr: 'فحص أعصاب الطوارئ (إحساس حول الأعضاء، مثانة/أمعاء، ساقان معاً)', nameEn: 'Emergency nerve screen (saddle sensation, bladder/bowel, both legs)', whyAr: 'الأسئلة والفحص عن الخدر حول الأعضاء التناسلية والشرج والتبوّل والتبرّز والوظيفة الجنسية وضعف الساقين يستبعدان حالة ضغط الأعصاب الطارئة أولاً — وهي ما يغيّر كل الخطة إن وُجدت.', whyEn: 'Questions and examination about numbness around the genitals and anus, peeing and pooing, sexual function, and leg weakness rule out the emergency nerve-compression condition first — its presence changes the whole plan.' },
      { nameAr: 'فحص علامات الأسباب الخطيرة النادرة', nameEn: 'Screening for rare serious-cause signs', whyAr: 'فقدان وزن غير مقصود، كتلة أو تورّم أو تغيّر شكل الظهر، ألم لا يتحسن بالراحة أو يسوء ليلاً، ألم يسوء مع العطاس/الكحّة/التبرّز، ألم من أعلى الظهر لا أسفله — كلها معايير رسمية لمراجعة الطبيب لأنها قد تشير لكسر أو سرطان أو التهاب.', whyEn: 'Unexplained weight loss, a lump or swelling or changed back shape, pain not improving with rest or worse at night, pain worse when sneezing, coughing or pooing, pain from the top of the back rather than the lower back — all are official GP criteria because they can point to a fracture, cancer, or infection.' },
      { nameAr: 'مراجعة مسار الألم عبر أسابيع', nameEn: 'Reviewing the pain course over weeks', whyAr: 'لأن أغلب آلام الظهر تتحسن وحدها خلال أسابيع قليلة، عدم التحسن بعد علاج منزلي لأسابيع قليلة هو ما يفتح باب علاجات أعمق — التوقيت جزء من التقييم.', whyEn: 'Because most back pain improves on its own within a few weeks, not improving after treating it at home for a few weeks is what opens the door to further treatments — timing is part of the assessment.' },
      { nameAr: 'تقييم أثر الألم على النشاط اليومي', nameEn: 'Assessing the pain\'s impact on day-to-day activities', whyAr: 'ألم يمنعك من نشاطاتك اليومية، أو يجعلك قلقاً أو عاجزاً عن التعايش — معايير رسمية لمراجعة الطبيب ولو بلا علامات خطر، لأنها تحدد شدة خطة العلاج والدعم.', whyEn: 'Pain stopping you doing day-to-day activities, or leaving you worried or struggling to cope — official criteria for seeing a GP even without red flags, because they set the intensity of the treatment and support plan.' },
    ],
    procedures: [
      { nameAr: 'ابقَ نشطاً + مضاد التهاب + ثلج أو حرارة', nameEn: 'Stay active, an anti-inflammatory, and ice or heat', whyAr: 'استمر بنشاطك اليومي ولا تبقَ بالفراش طويلاً؛ إيبوبروفين قد يفيد (وهو قد لا يناسب الجميع؛ والباراسيتامول وحده غير موصى به لألم الظهر لكن قد يؤخذ مع مسكّن آخر — واسأل صيدلياً أو طبيباً عن المناسب لك)؛ الثلج بمنشفة للألم والتورّم والحرارة لتيبّس المفاصل وتشنّج العضلات.', whyEn: 'Stay active and try to continue your daily activities, and do not stay in bed for long periods; ibuprofen may help (it may not be suitable for everyone; paracetamol on its own is not recommended for back pain but may be used with another painkiller — check with a pharmacist or GP what is suitable for you); an ice pack wrapped in a towel reduces pain and swelling, and a heat pack relieves joint stiffness or muscle spasms.' },
      { nameAr: 'تمارين وإطالات وعلاج طبيعي وعلاج يدوي', nameEn: 'Exercises and stretches, physiotherapy, and manual therapy', whyAr: 'تمارين وإطالات خاصة بألم الظهر (أوقفها إن ازداد الألم وراجع طبيباً) ومشي وسباحة ويوغا وبيلاتس قد تساعد؛ وإذا لم يتحسن الألم بعد أسابيع: جلسات تمرين جماعية وعلاج طبيعي وعلاج يدوي (تدليك وتحريك عضلات وعظام ومفاصل الظهر).', whyEn: 'Specific exercises and stretches for back pain (stop if the pain gets worse and see a GP), and walking, swimming, yoga and pilates may help; and if the pain does not get better after a few weeks: group exercise sessions, physiotherapy, and manual therapy (massaging and moving the muscles, bones and joints in your back).' },
      { nameAr: 'علاجات متقدمة محدودة الحالات', nameEn: 'Advanced treatments for limited cases', whyAr: 'مسكنات موصوفة عند ألم شديد أو غير متحسن، وعلاج سلوكي معرفي للتعايش مع الألم، وإجراء لإغلاق بعض أعصاب الظهر المرسلة لإشارات الألم (لألم أسفل الظهر الطويل فقط)، وجراحة إذا كان السبب حالة كالديسك ولم تنفع العلاجات الأخرى.', whyEn: 'Prescribed painkillers if the pain is severe or not getting better, cognitive behavioural therapy to help cope with pain, a procedure to seal off some of the nerves in the back so they stop sending pain signals (only for long-term lower back pain), and surgery if the cause is a medical condition like a slipped disc and other treatments have not helped.' },
    ],
    sourceName: 'NHS — Back pain',
    sourceUrl: 'https://www.nhs.uk/conditions/back-pain/',
  },
  {
    id: 'sore-throat',
    nameAr: 'ألم الحلق',
    nameEn: 'Sore throat',
    patterns: ['ألم في الحلق', 'التهاب الحلق', 'وجع حلق', 'ألم حلق', 'وجع الحلق', 'sore throat', 'throat pain', 'ألم بالحلق'],
    emergencyAr: 'طوارئ فوراً إذا: صعوبة تنفس أو عجز عن البلع، أو سيلان لعاب (علامة عجز عن البلع)، أو صوت صفير عالٍ مع التنفس (صرير)، أو أعراض شديدة تسوء بسرعة.',
    emergencyEn: 'Emergency now if: difficulty breathing or being unable to swallow, drooling (a sign of not being able to swallow), a high-pitched sound as you breathe (stridor), or severe symptoms getting worse quickly.',
    introAr: 'ألم الحلق سببه عادة فيروسات (كزكام أو إنفلونزا) أو التدخين، ونادراً بكتيريا — ولهذا المضادات لا تُحتاج عادة ولن تخفف الأعراض أو تسرّع الشفاء إلا إذا قرر مختص وجود التهاب بكتيري. راجع طبيباً إذا لم يتحسن بعد أسبوع، أو يتكرر كثيراً، أو معه كتلة في الفم/الرقبة أو قرحة فم تبقى أكثر من 3 أسابيع. وموعد عاجل إذا كنت قلقاً من أعراضك، أو حرارة عالية جداً أو شعور بحر/برد/رجفة، أو علامات جفاف، أو مناعة ضعيفة (كسكري أو علاج كيميائي).',
    introEn: 'Sore throats are usually caused by viruses (like a cold or flu) or smoking, and very occasionally by bacteria — which is why antibiotics are not normally needed and will not relieve symptoms or speed recovery unless a professional judges a bacterial infection. See a GP if it does not improve after a week, you get them often, or there is a lump in your mouth or neck or a mouth ulcer lasting more than 3 weeks. And an urgent appointment if you are worried about your symptoms, have a very high temperature or feel hot, cold or shivery, signs of dehydration, or a weakened immune system (for example, from diabetes or chemotherapy).',
    thinkingAr: [
      'انسداد مجرى هواء علوي (نادراً وطارئاً): يُشتبه به مع صعوبة التنفس وعجز البلع وسيلان اللعاب والصرير — يُستبعد أولاً دائماً.',
      'التهاب بكتيري (سترب/لوزتين): ألم حلق مع حرارة وغدد رقبة متورّمة يرجّحه — وهو الحالة التي قد يُعطى فيها مضاد بقرار مختص.',
      'فيروسات الزكام والإنفلونزا: الأشيع — حلق مؤلم خاصة عند البلع، جاف وخشن، احمرار خلف الفم، رائحة فم، سعال خفيف، غدد رقبة متورّمة.',
      'أسباب مرافقة: التهاب حنجرة، التهاب لوزتين، التهاب حلق عقدي (سترب)، حمى غدية، أو تهيّج من التدخين.',
    ],
    thinkingEn: [
      'An upper-airway blockage (rare and an emergency): suspected with breathing difficulty, inability to swallow, drooling, and stridor — always excluded first.',
      'A bacterial infection (strep/tonsillitis): a sore throat with temperature and swollen neck glands makes it more likely — the situation where an antibiotic may be given by a professional\'s decision.',
      'Cold and flu viruses: the most common — a painful throat especially when swallowing, dry and scratchy, redness at the back of the mouth, bad breath, a mild cough, and swollen neck glands.',
      'Related causes: laryngitis, tonsillitis, strep throat (a bacterial throat infection), glandular fever, or irritation from smoking.',
    ],
    tests: [
      { nameAr: 'فحص الحلق والفم وغدد الرقبة', nameEn: 'Examining the throat, mouth, and neck glands', whyAr: 'الاحمرار خلف الفم وحال اللوزتين وتورّم الغدد — نمطها مع الحرارة والسعال يفرّق الفيروسي من البكتيري ويقرر هل يلزم مضاد أم لا.', whyEn: 'Redness at the back of the mouth, the state of the tonsils, and swollen glands — their pattern, with temperature and cough, separates viral from bacterial and decides whether an antibiotic is needed.' },
      { nameAr: 'تقييم الصيدلي', nameEn: 'Pharmacist assessment', whyAr: 'الصيدلي يقدر حالتك (ولأطفال من عمر 5 سنوات فأكثر)، وقد يعطي نفس علاج المضاد الذي يعطيه الطبيب عند الحاجة، أو ينصحك بمسكنات وأقراص ملطّفة أو يوجّهك لمساعدة أخرى.', whyEn: 'A pharmacist can assess you (and children aged 5 and over), can give the same antibiotic treatment as a GP if you need it, or advise on painkillers and lozenges or direct you to other medical help.' },
      { nameAr: 'فحص علامات الجفاف', nameEn: 'Checking for dehydration signs', whyAr: 'تبوّل أقل من المعتاد أو بول داكن قوي الرائحة — علامة أن ألم البلع يمنع شرباً كافياً، ووجودها يجعل الموعد عاجلاً خاصة عند طفل أو مريض مناعته ضعيفة.', whyEn: 'Peeing less than usual or dark, strong-smelling pee — a sign that painful swallowing is preventing enough drinking; its presence makes the appointment urgent, especially for a child or someone with a weakened immune system.' },
      { nameAr: 'مراجعة المدة والتكرار وكتل/قرح الفم', nameEn: 'Duration, recurrence, and mouth lump/ulcer review', whyAr: 'ألم لا يتحسن بعد أسبوع، أو ألم حلق متكرر كثيراً، أو كتلة في الفم أو الرقبة، أو قرحة فم تبقى أكثر من 3 أسابيع — معايير رسمية لمراجعة الطبيب لأن استمرارها يحتاج تفسيراً أعمق.', whyEn: 'A sore throat not improving after a week, getting sore throats often, a lump in the mouth or neck, or a mouth ulcer lasting more than 3 weeks — official GP criteria because their persistence needs a deeper explanation.' },
    ],
    procedures: [
      { nameAr: 'غرغرة ماء دافئ مالح + سوائل وأطعمة باردة/لينة وراحة', nameEn: 'Warm salt-water gargling, fluids, cool/soft foods, and rest', whyAr: 'الغرغرة (نصف ملعقة صغيرة ملح بكأس ماء دافئ، تُغرغر وتُبصق ولا تُبلع — والأطفال لا يجرّبونها) وماء كافٍ وأطعمة باردة أو لينة وتجنّب التدخين والأماكن المدخّنة ومصّ مكعبات ثلج أو مصاصات أو حلوى صلبة (لا أشياء صغيرة صلبة للأطفال الصغار لخطر الاختناق) — تخفف الألم وتقصّر مدّته.', whyEn: 'Gargling with warm salty water (half a teaspoon of salt in a glass of warm water, gargled and spat out, not swallowed — children should not try this), drinking plenty of water, eating cool or soft foods, avoiding smoking or smoky places, and sucking ice cubes, ice lollies or hard sweets (nothing small and hard for young children because of the choking risk) — they soothe the pain and shorten how long it lasts.' },
      { nameAr: 'مسكنات وأقراص ملطّفة من الصيدلية', nameEn: 'Painkillers and medicated lozenges from a pharmacy', whyAr: 'باراسيتامول أو إيبوبروفين، وأقراص مصّ طبية فيها مخدّر موضعي أو مطهّر أو مضاد التهاب، أو بخاخ مخدّر (دليل فائدته محدود وحده) — كلها بلا وصفة، وتحقق دائماً من النشرة أو اسأل صيدلياً، فبعض الأدوية لا تناسب الجميع (كالحوامل).', whyEn: 'Paracetamol or ibuprofen, medicated lozenges containing a local anaesthetic, antiseptic, or anti-inflammatory medicine, or an anaesthetic spray (although there is little proof it helps on its own) — all available without prescription, and always check the leaflet or speak to a pharmacist, as some medicines are not safe for everyone (for example, in pregnancy).' },
      { nameAr: 'مضاد حيوي — فقط عند قرار مختص بوجود بكتيريا', nameEn: 'An antibiotic — only when a professional judges bacteria', whyAr: 'لأن أغلب ألم الحلق فيروسي، المضاد بلا قرار مختص لا يخفف ولا يسرّع الشفاء؛ يعطيه صيدلي أو طبيب فقط إذا كان ممكناً وجود التهاب بكتيري عندك.', whyEn: 'Because most sore throats are viral, an antibiotic without a professional decision does not relieve symptoms or speed recovery; a pharmacist or GP gives it only if you could have a bacterial infection.' },
    ],
    sourceName: 'NHS — Sore throat',
    sourceUrl: 'https://www.nhs.uk/symptoms/sore-throat/',
  },
  {
    id: 'cough',
    nameAr: 'السعال',
    nameEn: 'Cough',
    patterns: ['سعال', 'كحة', 'عم بكح', 'cough', 'coughing', 'عندي كحة'],
    emergencyAr: 'موعد عاجل فوراً إذا: سعالك سيئ جداً أو يسوء بسرعة (سعال متقطع لا تستطيع إيقافه)، أو تشعر بتوعّك شديد، أو ألم صدر، أو جانب رقبتك متورّم ومؤلم (غدد)، أو صعوبة تنفس، أو تسعل دماً. وراجع طبيباً إذا استمر السعال أكثر من 3 أسابيع، أو تخسر وزناً بلا سبب، أو مناعتك ضعيفة (كعلاج كيميائي أو سكري).',
    emergencyEn: 'Urgent appointment now if: your cough is very bad or quickly getting worse (a hacking cough or you cannot stop coughing), you feel very unwell, you have chest pain, the side of your neck feels swollen and painful (swollen glands), you find it hard to breathe, or you are coughing up blood. And see a GP if the cough lasts more than 3 weeks, you are losing weight for no reason, or you have a weakened immune system (for example, from chemotherapy or diabetes).',
    introAr: 'أغلب السعال من زكام أو إنفلونزا ويزول وحده — عادة لا حاجة لطبيب. السعال نادراً ما يكون علامة شيء خطير كسرطان الرئة، لكن استمراره أكثر من 3 أسابيع هو خط المراجعة الرسمي.',
    introEn: 'Most coughs are caused by a cold or flu and clear on their own — there is usually no need to see a GP. A cough is rarely a sign of something serious like lung cancer, but lasting more than 3 weeks is the official review line.',
    thinkingAr: [
      'علامات تحتاج تقييماً عاجلاً أولاً: سعال دم، صعوبة تنفس، ألم صدر، سعال يسوء بسرعة أو لا يتوقف، توعّك شديد، غدد رقبة متورّمة ومؤلمة — أي منها يخرج السعال من خانة «انتظر» إلى «راجع الآن».',
      'زكام أو إنفلونزا: الأشيع — سعال جديد مع أعراض برد، يتحسن خلال أسابيع.',
      'التهابات مجرى هواء: التهاب قصبات أو كوفيد-19 — سعال أطول مع بلغم أحياناً.',
      'مهيّجات ومزمنات: تدخين، حرقة وارتجاع معدة، حساسية (كحمى القش)، أو مخاط ينزل من خلف الأنف إلى الحلق.',
      'سعال مستمر أكثر من 3 أسابيع: يحتاج تقييم طبيب — وهنا تأتي الفحوص التالية، لأن السعال نادراً ما يخفي سبباً جدياً.',
    ],
    thinkingEn: [
      'Signs needing urgent assessment first: coughing up blood, difficulty breathing, chest pain, a cough quickly getting worse or that cannot stop, feeling very unwell, swollen painful neck glands — any of these moves a cough from "wait" to "be seen now".',
      'A cold or flu: the most common — a new cough with cold symptoms, improving within weeks.',
      'Airway infections: bronchitis or COVID-19 — a longer cough, sometimes with mucus.',
      'Irritants and chronic causes: smoking, heartburn (acid reflux), allergies such as hay fever, or mucus dripping down the throat from the back of the nose.',
      'A persistent cough over 3 weeks: needs a GP assessment — this is where the tests below come in, because a cough rarely hides a serious cause.',
    ],
    tests: [
      { nameAr: 'سماع الصدر بالسماعة الطبية', nameEn: 'Listening to the chest with a stethoscope', whyAr: 'أول ما يفعله الطبيب بموعد سعال: أصوات التنفس توجّهه بين التهاب قصبات والتهاب رئوي ومجرى هواء طبيعي — وتحدد هل يلزم أي فحص آخر.', whyEn: 'The first thing the GP does at a cough appointment: breath sounds point between bronchitis, pneumonia, and a normal airway — and decide whether any further test is needed.' },
      { nameAr: 'عينة من البلغم إن كنت تسعله', nameEn: 'A sample of any mucus you are coughing up', whyAr: 'تحليل البلغم قد يبيّن نوع الالتهاب إن وُجد — يساعد قرار هل يلزم مضاد أصلاً وأي نوع.', whyEn: 'Testing the mucus can show the type of infection if present — it helps the decision of whether an antibiotic is needed at all, and which.' },
      { nameAr: 'أشعة صدر، أو فحص حساسية، أو فحص وظائف رئة', nameEn: 'Chest X-ray, allergy testing, or a lung-function test', whyAr: 'يطلبها الطبيب لسبر سبب سعالك: الأشعة تبيّن الرئة، وفحص الحساسية يكشف محفزاً كحمى القش، ووظائف الرئة تقيس كفاءة التنفس — وبنتائجها يُقرر هل تكفي المتابعة أم تلزم إحالة لمختص في المشفى (وهي نادرة).', whyEn: 'Ordered to find out what is causing your cough: the X-ray shows the lungs, allergy testing reveals a trigger like hay fever, and the lung-function test measures how well your lungs work — their results decide between follow-up and a hospital specialist referral (which is rare).' },
      { nameAr: 'مراجعة المدة والوزن وحال المناعة', nameEn: 'Duration, weight, and immune-status review', whyAr: 'سعال تجاوز 3 أسابيع، أو فقدان وزن بلا سبب، أو مناعة ضعيفة (كعلاج كيميائي أو سكري) — معايير رسمية بحد ذاتها لموعد طبيب ولو بدا السعال بسيطاً، لأنها تغيّر احتمالات السبب.', whyEn: 'A cough over 3 weeks, losing weight for no reason, or a weakened immune system (for example, from chemotherapy or diabetes) — official criteria in themselves for a GP appointment even if the cough seems mild, because they change the likely causes.' },
    ],
    procedures: [
      { nameAr: 'راحة وسوائل ومسكّن عند الحاجة', nameEn: 'Rest, fluids, and a painkiller when needed', whyAr: 'ارتح واشرب سوائل كافية وابقَ في البيت متجنباً الناس إذا معك حرارة عالية أو لا تشعر بلياقة لنشاطك المعتاد؛ وباراسيتامول أو إيبوبروفين لأي ألم — ومشروب ليمون ساخن بعسل قد يشبه أثر شراب السعال (لا يناسب أطفالاً دون سنة؛ ودليل فائدته وفائدة الأعشاب كالبيلارغونيوم محدود).', whyEn: 'Rest, drink plenty of fluids, and stay home avoiding others if you have a high temperature or do not feel well enough for normal activities; paracetamol or ibuprofen treats any pain — and hot lemon and honey can have a similar effect to cough syrup (not suitable for babies under 1 year old; evidence for it and for herbal medicines like pelargonium is limited).' },
      { nameAr: 'أدوية سعال من الصيدلية — تخفف ولا توقف', nameEn: 'Cough medicines from a pharmacy — they ease, not stop', whyAr: 'شراب سعال وأدوية سعال وأقراص مصّ للسعال من الصيدلي: لن توقف السعال لكن قد تجعلك تسعل أقل؛ وبعض أدوية السعال لا تُعطى لأطفال دون 12؛ ومزيلات الاحتقان وأدوية السعال المحتوية كوديين لن توقفه أيضاً — وتحقق من النشرة، فبعضها لا يناسب الجميع (كالحوامل).', whyEn: 'Cough syrup, cough medicine and cough sweets from a pharmacist: they will not stop your cough but may help you cough less; some cough medicines should not be given to children under 12; decongestants and codeine-containing cough medicines will not stop it either — and check the leaflet, as some are not safe for everyone (for example, in pregnancy).' },
      { nameAr: 'مضاد حيوي — استثناء لا قاعدة', nameEn: 'An antibiotic — the exception, not the rule', whyAr: 'لا يُوصف عادة للسعال؛ يعطيه الطبيب فقط عند الحاجة — مثال التهاب بكتيري أو إذا كنت بخطر مضاعفات — لأن أغلب السعال فيروسي.', whyEn: 'Not normally prescribed for coughs; a GP will only prescribe them if you need them — for example, if you have a bacterial infection or you are at risk of complications — because most coughs are viral.' },
    ],
    sourceName: 'NHS — Cough',
    sourceUrl: 'https://www.nhs.uk/symptoms/cough/',
  },
  {
    id: 'dizziness',
    nameAr: 'الدوخة والدوار',
    nameEn: 'Dizziness',
    patterns: ['دوخة', 'دوار', 'عم بدوخ', 'حاسس بدوخة', 'dizziness', 'dizzy', 'vertigo', 'دوخة ودوار'],
    emergencyAr: 'راجع طبيباً ولا تهملها إذا الدوخة مع: صعوبة سمع أو كلام جديدة، أو طنين/أصوات بالأذنين، أو ازدواج/تغيّم رؤية أو أي تغيّر نظر، أو خدر/ضعف بالوجه أو الذراعين أو الساقين، أو تغيّر نبض، أو إغماء/انهيار، أو صداع، أو غثيان/قيء — هذه قائمة NHS الرسمية لمراجعة الطبيب، وبعضها علامات عصبية لا تنتظر.',
    emergencyEn: 'See a GP and do not ignore it if the dizziness comes with: finding it harder to hear or speak, ringing or other sounds in your ears (tinnitus), double or blurred vision or other eyesight changes, numb or weak face, arms or legs, changes to your pulse, fainting or collapsing, headaches, or feeling or being sick — this is the NHS official GP list, and some of these are neurological signs that should not wait.',
    introAr: 'شعور الدوخة أو خفة الرأس أو فقدان التوازن شائع وأحياناً عابر، ولا يكون خطيراً عادة — لكن راجع طبيباً إذا كنت قلقاً، أو إذا لم تذهب الدوخة أو عادت تتكرر. ولا تشخّص السبب بنفسك.',
    introEn: 'Feeling dizzy, lightheaded or off-balance is common and often passes, and it is not usually serious — but see a GP if you are worried, or if it will not go away or keeps coming back. Do not self-diagnose the cause.',
    thinkingAr: [
      'أسباب عصبية/أذنية تحتاج مراجعة أولاً: خدر/ضعف وجه أو أطراف، صعوبة كلام، تغيّرات نظر، تغيّر نبض أو إغماء — علامات قد تشير لمشكلة تتجاوز الأذن الداخلية، ولهذا هي على قائمة الطبيب.',
      'مشاكل الأذن الداخلية: دوخة مع فقدان توازن ونقص سمع وطنين — نمط يوجّه الفحص نحو الأذن.',
      'التهاب المتاهة (لابيرنث): فقدان توازن أو شعور بالدوران مع غثيان/قيء، أحياناً بعد زكام أو إنفلونزا.',
      'هبوط ضغط وضعي: دوخة عند الوقوف أو الجلوس فجأة — انخفاض مفاجئ بضغط الدم.',
      'أثر جانبي لدواء جديد: دوخة بدأت بعد بدء وصفة جديدة — راجع نشرة الدواء وأخبر طبيبك ولا توقفه وحدك.',
    ],
    thinkingEn: [
      'Neurological/ear causes needing review first: numb or weak face or limbs, difficulty speaking, eyesight changes, pulse changes or fainting — signs that can point beyond the inner ear, which is why they are on the GP list.',
      'Inner-ear problems: dizziness with feeling off-balance, losing some hearing, and ringing or other sounds in the ears (tinnitus).',
      'Labyrinthitis: feeling off-balance or like things are spinning, feeling or being sick, sometimes after a cold or flu.',
      'Postural hypotension: dizziness when standing or sitting up suddenly — a sudden drop in blood pressure.',
      'A side effect of new prescription medicine: dizziness starting after a new prescription — check the leaflet, tell your doctor, and do not stop it on your own.',
    ],
    tests: [
      { nameAr: 'قصة الدوخة: نوعها (دوران أم خفة رأس) ومحفزاتها ومرافقاتها', nameEn: 'Dizziness history: type (spinning vs lightheaded), triggers, companions', whyAr: 'الدوران الحقيقي (فيرتيغو) يوجّه نحو الأذن الداخلية، والدوخة عند الوقوف نحو الضغط الوضعي، والبدء بعد دواء جديد نحو أثر جانبي — القصة هي أول «فحص» وتقرر باقي التقييم.', whyEn: 'True spinning (vertigo) points to the inner ear, dizziness on standing to postural blood pressure, and starting after new medicine to a side effect — the history is the first "test" and decides the rest of the assessment.' },
      { nameAr: 'فحص السمع والكلام والأذنين', nameEn: 'Hearing, speech, and ear assessment', whyAr: 'صعوبة سمع جديدة أو طنين أو صعوبة كلام — بنود صريحة بقائمة NHS لمراجعة الطبيب؛ فحصها يفرّق سبباً أذنياً عن سبب يحتاج تقييماً أوسع.', whyEn: 'New difficulty hearing, tinnitus, or difficulty speaking — explicit items on the NHS GP list; assessing them separates an ear cause from one needing wider evaluation.' },
      { nameAr: 'فحص النظر والعصبيات (وجه وذراعان وساقان)', nameEn: 'Vision and neurological screen (face, arms, legs)', whyAr: 'ازدواج/تغيّم رؤية وخدر/ضعف الأطراف أو الوجه علامات لا تُترك للانتظار — الفحص السريع لها يقرر بين اطمئنان ومتابعة عاجلة.', whyEn: 'Double or blurred vision and numb or weak face, arms or legs are signs not left to wait — a quick screen decides between reassurance and urgent follow-up.' },
      { nameAr: 'قياس النبض ومراجعة الإغماء/الانهيار إن حدث', nameEn: 'Pulse check and fainting/collapse review if it happened', whyAr: 'تغيّر النبض والإغماء بنود بقائمة الطبيب الرسمية لأنها قد تربط الدوخة بالقلب أو الضغط — توثيقها يوجّه هل يلزم تقييم قلبي.', whyEn: 'Pulse changes and fainting or collapsing are on the official GP list because they can link dizziness to the heart or blood pressure — documenting them decides whether a cardiac assessment is needed.' },
    ],
    procedures: [
      { nameAr: 'استلقِ حتى تزول، ثم انهض ببطء', nameEn: 'Lie down until it passes, then get up slowly', whyAr: 'الاستلقاء حتى زوال الدوخة ثم النهوض البطيء والتحرك ببطء وحذر يمنع السقوط — وهو أول إجراء أمان عند أي دوخة.', whyEn: 'Lying down until the dizziness passes, then getting up slowly and moving slowly and carefully prevents falls — the first safety step for any dizziness.' },
      { nameAr: 'سوائل كافية وراحة وتجنّب منبهات', nameEn: 'Plenty of fluids, rest, and avoiding stimulants', whyAr: 'اشرب سوائل كافية خاصة الماء، وخذ راحة وافرة، وتجنّب القهوة والسجائر والكحول والمخدرات — كلها قد تزيد الدوخة أو تطيلها.', whyEn: 'Drink plenty of fluids, especially water, get plenty of rest, and avoid coffee, cigarettes, alcohol and drugs — all can worsen or prolong dizziness.' },
      { nameAr: 'لا تنحنِ فجأة ولا تنهض فجأة، ولا أفعال خطرة وأنت دائخ', nameEn: 'No sudden bending or standing, and no dangerous activities while dizzy', whyAr: 'الانحناء المفاجئ والنهوض المفاجئ من جلوس/استلقاء محفزان معروفان؛ والقيادة وتسلّق سلّم واستخدام آلات ثقيلة أثناء الدوخة خطر سقوط وإصابة — أجّلها حتى تزول.', whyEn: 'Bending down suddenly and getting up suddenly after sitting or lying down are known triggers; and driving, climbing a ladder or using heavy machinery while dizzy risks falls and injury — postpone them until it passes.' },
    ],
    sourceName: 'NHS — Dizziness',
    sourceUrl: 'https://www.nhs.uk/symptoms/dizziness/',
  },
  {
    id: 'diarrhoea-vomiting',
    nameAr: 'الإسهال والقيء',
    nameEn: 'Diarrhoea and vomiting',
    patterns: ['إسهال', 'قيء', 'استفراغ', 'عم استفرغ', 'غثيان', 'اسهال وقيء', 'diarrhoea', 'diarrhea', 'vomiting', 'nausea'],
    emergencyAr: 'طوارئ فوراً إذا: قيء دموي أو كطحن القهوة، أو قيء أخضر عند بالغ (أصفر-أخضر/أخضر عند طفل)، أو اشتباه ابتلاع شيء سام، أو تيبّس رقبة وألم عند النظر لضوء ساطع، أو صداع شديد مفاجئ، أو ألم بطن شديد مفاجئ، أو جلد/شفاه/لسان أزرق أو رمادي أو شاحب أو مبقّع، أو صعوبة تنفس شديدة، أو تشوّش أو عدم استجابة معتادة. واتصل بخدمة طبية عاجلة إذا: إسهال دموي أو نزيف من الأسفل، أو عجز عن إبقاء السوائل (قيء مستمر)، أو علامات جفاف رغم أكياس الإماهة، أو إسهال أكثر من 7 أيام أو قيء أكثر من يومين.',
    emergencyEn: 'Emergency now if: vomit with blood or like ground coffee, green vomit in adults (yellow-green or green in children), possible swallowed poison, a stiff neck and pain looking at bright lights, a sudden severe headache, a sudden severe tummy ache, blue, grey, pale or blotchy skin, lips or tongue, severe difficulty breathing, or confusion or not responding as usual. And call urgent medical help if: bloody diarrhoea or bleeding from the bottom, being sick repeatedly and unable to keep fluid down, signs of dehydration despite rehydration sachets, diarrhoea for more than 7 days, or vomiting for more than 2 days.',
    introAr: 'الإسهال والقيء شائعان عند البالغين والأطفال والرضّع، وسببهما غالباً جرثومة معدة (نزلة معوية)، ويتوقفان خلال أيام قليلة — النصيحة نفسها سواء اجتمعا أو انفصلا. أهم شيء في البيت: سوائل كثيرة لتجنّب الجفاف. الإسهال يتوقف عادة خلال 5–7 أيام والقيء خلال يوم أو يومين.',
    introEn: 'Diarrhoea and vomiting are common in adults, children and babies, often caused by a stomach bug, and should stop in a few days — the advice is the same whether together or separately. The most important thing at home is lots of fluids to avoid dehydration. Diarrhoea usually stops within 5 to 7 days and vomiting in 1 or 2 days.',
    thinkingAr: [
      'حالات طارئة تُستبعد أولاً: قيء دموي/أخضر، ألم بطن شديد مفاجئ، علامات سمّية أو عصبية (تيبّس رقبة، تشوّش)، أو جفاف شديد — توقيتها بالساعات لا الأيام.',
      'جرثومة معدة (نزلة معوية): الأشيع — إسهال و/أو قيء يبدآن فجأة ويتوقفان خلال أيام، وينتشران بسهولة بالبيت.',
      'تسمم غذائي: بداية سريعة بعد طعام مشبوه، وقد يصيب من شاركك الطعام.',
      'أسباب أخرى للإسهال: أدوية (راجع النشرة)، عدم تحمّل/حساسية طعام، قولون عصبي (IBS)، قلق، زائدة دودية، مرض أمعاء التهابي، سيلياك، مرض رتوج، علاج إشعاعي للحوض.',
      'أسباب أخرى للقيء: حمل، شقيقة، دوار سفر، التهابات أذن داخلية كالتهاب المتاهة، أدوية، ارتجاع عند الرضّع، أو التهابات أخرى كالتهاب المسالك البولية.',
    ],
    thinkingEn: [
      'Emergencies excluded first: bloody or green vomit, a sudden severe tummy ache, poisoning or neurological signs (stiff neck, confusion), or severe dehydration — their timing is hours, not days.',
      'A stomach bug: the most common — diarrhoea and/or vomiting starting suddenly and stopping within days, spreading easily at home.',
      'Food poisoning: a fast start after suspect food, possibly affecting whoever shared the meal.',
      'Other causes of diarrhoea: medicines (check the leaflet), a food intolerance or allergy, irritable bowel syndrome (IBS), anxiety, appendicitis, inflammatory bowel disease, coeliac disease, diverticular disease, or pelvic radiation treatment.',
      'Other causes of vomiting: pregnancy, migraine, motion sickness, inner-ear infections such as labyrinthitis, medicines, reflux in babies, or other infections such as a urinary tract infection (UTI).',
    ],
    tests: [
      { nameAr: 'فحص علامات الجفاف', nameEn: 'Checking for dehydration signs', whyAr: 'بول داكن قوي الرائحة أو تبوّل أقل من المعتاد (وعند طفل تحت 5: حفاضات مبتلة أقل) — الجفاف هو الخطر العملي الأول هنا، وفحصه يقرر بين سوائل بيتية وتقييم عاجل، والصيدلي خطوة أولى خاصة لكبير سنّ أو ضعيف مناعة أو صاحب حالات تزيد خطر الجفاف.', whyEn: 'Dark, smelly pee or peeing less than usual (in an under-5: fewer wet nappies) — dehydration is the main practical danger here, and checking it decides between home fluids and urgent assessment; a pharmacist is a first step especially for older people, weakened immunity, or conditions raising dehydration risk.' },
      { nameAr: 'مراجعة المدة وعدد مرات القيء وقدرتك على إبقاء السوائل', nameEn: 'Duration, vomiting frequency, and fluid-keeping review', whyAr: 'إسهال أكثر من 7 أيام أو قيء أكثر من يومين، أو قيء متكرر يمنع إبقاء أي سائل — خطوط رسمية للاتصال العاجل، لأنها تعني أن المسار الطبيعي (أيام قليلة) لم يحدث.', whyEn: 'Diarrhoea for more than 7 days or vomiting for more than 2 days, or being sick repeatedly and unable to keep fluid down — official lines for urgent contact, because they mean the normal course (a few days) has not happened.' },
      { nameAr: 'فحص الدم في الإسهال أو القيء', nameEn: 'Checking for blood in diarrhoea or vomit', whyAr: 'إسهال دموي أو نزيف من الأسفل سبب اتصال عاجل، وقيء دموي/كطحن القهوة طارئ — سؤال واحد يغيّر مستوى الاستجابة كلياً.', whyEn: 'Bloody diarrhoea or bleeding from the bottom is a reason for urgent contact, and vomit with blood or like ground coffee is an emergency — one question changes the response level entirely.' },
      { nameAr: 'سؤال عن الطعام المشترك والأدوية الجديدة', nameEn: 'Questions about shared food and new medicines', whyAr: 'طعام شاركه آخرون مرضوا أيضاً يرجّح تسمماً غذائياً، ودواء جديد قد يكون الإسهال/القيء أثره الجانبي (تؤكده نشرة الدواء) — السؤالان يختصران التفسير الأكثر احتمالاً.', whyEn: 'Food shared with others who also fell ill points to food poisoning, and a new medicine may cause diarrhoea/vomiting as a side effect (confirmed by its leaflet) — the two questions shortcut the most likely explanations.' },
    ],
    procedures: [
      { nameAr: 'سوائل كثيرة برشفات صغيرة + أكياس إماهة فموية عند الحاجة', nameEn: 'Lots of fluids in small sips, plus oral rehydration sachets when needed', whyAr: 'ابقَ في البيت وارتح، واشرب ماء أو مشروبات مخففة برشفات صغيرة إن كنت تشعر بالغثيان؛ ومسحوق الإماهة الفموية من الصيدلي يعوّض الأملاح — وتجنّب عصير الفاكهة والمشروبات الغازية لأنها قد تزيد الإسهال، ولا تخفف حليب الرضّع الصناعي عن قوته المعتادة.', whyEn: 'Stay at home and rest, and drink lots of fluids such as water or squash in small sips if you feel sick; oral rehydration powder from a pharmacist replaces lost salts — and avoid fruit juice or fizzy drinks as they can make diarrhoea worse, and do not make baby formula weaker than its usual strength.' },
      { nameAr: 'أكل عند القدرة + باراسيتامول للانزعاج', nameEn: 'Eating when able, and paracetamol for discomfort', whyAr: 'كُل عندما تستطيع وتجنّب الدهني والحارّ؛ وخذ باراسيتامول إن كنت منزعجاً (وتحقق من النشرة قبل إعطائه لطفل) — واستمر بإرضاع طفلك طبيعياً/صناعياً، وبجرعات صغيرة متكررة إن كان يتقيأ، ورشفات ماء بين الرضعات لمن بدأ الطعام الصلب.', whyEn: 'Eat when you feel able to, avoiding fatty or spicy foods; take paracetamol if you are in discomfort (check the leaflet before giving it to your child) — and carry on breast or bottle feeding your baby, with small feeds more often if they are being sick, and small sips of water between feeds for babies on formula or solids.' },
      { nameAr: 'منع الانتشار: غسل يدين وبقاء بالبيت يومين بعد توقف الأعراض', nameEn: 'Stopping spread: handwashing and staying home 2 days after symptoms stop', whyAr: 'اغسل يديك بالماء والصابون مراراً، واغسل ملابس/أغطية عليها قيء أو براز وحدها بغسلة ساخنة، ونظّف مقاعد المرحاض والمقابض والحنفيات والأسطح يومياً، ولا تحضّر طعاماً لغيرك ولا تشارك مناشف وأدوات، ولا سباحة حتى 48 ساعة بعد توقف الأعراض — وابقَ بعيداً عن العمل/المدرسة حتى يمرّ يومان بلا قيء أو إسهال.', whyEn: 'Wash your hands with soap and water frequently, wash clothing or bedding with poo or vomit on it separately on a hot wash, clean toilet seats, flush handles, taps, surfaces and door handles daily, do not prepare food for others or share towels, flannels, cutlery or utensils, and no swimming pool until at least 48 hours after symptoms stop — and stay off school or work until you have not been sick or had diarrhoea for at least 2 days.' },
      { nameAr: 'دواء إيقاف إسهال لساعات — للبالغين فقط وبمشورة صيدلي', nameEn: 'Diarrhoea-stopping medicine for a few hours — adults only, pharmacist-advised', whyAr: 'كالوبراميد: قد يوصي به صيدلي إن احتجت إيقاف الإسهال ساعات قليلة — ولا يُعطى أبداً لأطفال دون 12، ولا أدوية إيقاف إسهال لأطفال دون 12 عموماً، ولا أسبرين لأطفال دون 16.', whyEn: 'Such as loperamide: a pharmacist may recommend it if you need to stop diarrhoea for a few hours — never for children under 12; generally do not give children under 12 medicine to stop diarrhoea, and do not give aspirin to children under 16.' },
    ],
    sourceName: 'NHS — Diarrhoea and vomiting',
    sourceUrl: 'https://www.nhs.uk/conditions/diarrhoea-and-vomiting/',
  },
  {
    id: 'constipation',
    nameAr: 'الإمساك',
    nameEn: 'Constipation',
    patterns: ['إمساك', 'ما عم بقدر اتغوط', 'صعوبة بالتغوط', 'constipation', 'constipated', 'عندي إمساك'],
    emergencyAr: 'راجع طبيباً ولا تؤجل إذا الإمساك مع: دم في البراز، أو فقدان وزن دون محاولة، أو تعب دائم، أو تغيّرات مفاجئة بعادات التغوط، أو ألم بطن، أو انتفاخ متكرر، أو لا يتحسن بالعلاج، أو يتكرر بانتظام — هذه قائمة NHS الرسمية، وبعضها يستبعد أسباباً أعمق نادراً كمرض رتوج أو سرطان أمعاء.',
    emergencyEn: 'See a GP and do not delay if the constipation comes with: blood in your poo, losing weight without trying, feeling tired all the time, sudden changes in your bowel habits, tummy pain, regular bloating, not getting better with treatment, or being regularly constipated — this is the NHS official list, and some of it rules out rarer deeper causes such as diverticular disease or bowel cancer.',
    introAr: 'الإمساك هو تغيّر بعادات التغوط: أقل من 3 مرات بالأسبوع الماضي أو أقل من عادتك، وبراز كبير/صغير غير معتاد وجاف وقاسٍ ومتكتل، وتجهّد أو ألم عند التغوط، وشعور بعدم الإفراغ الكامل — وقد يرافقه ألم بطن وانتفاخ وغثيان. شائع بكل الأعمار، ويُعالج عادة بتغييرات بسيطة بالغذاء ونمط الحياة، وقد تلاحظ فرقاً خلال أيام وأحياناً يحتاج أسابيع.',
    introEn: 'Constipation is changes to how you poo: not pooing at least 3 times during the last week or less often than usual, poo that is unusually large or small and dry, hard or lumpy, straining or pain when pooing, and feeling you have not fully emptied your bowels — possibly with a stomach ache, bloating or feeling sick. It is common at all ages and can usually be treated with simple diet and lifestyle changes; you may notice a difference within days, though sometimes it takes a few weeks.',
    thinkingAr: [
      'أسباب أعمق نادرة تُستبعد بعلامات المراجعة: مرض رتوج أو سرطان أمعاء — نادراً، لكن دم البراز وفقدان الوزن والتغيّر المفاجئ بالعادات هي ما يفتح بابها.',
      'ألياف وسوائل وحركة غير كافية: لا ألياف كافية (فواكه وخضار وحبوب)، لا سوائل كافية، قلة حركة وجلوس/استلقاء طويل وقلة نشاط وتمرين.',
      'عادات وروتين: تجاهل رغبة الذهاب للمرحاض غالباً، أو تغيّر الغذاء أو الروتين اليومي.',
      'أدوية ونفسية: أثر جانبي لدواء (والمسكّنات الأفيونية مثال صريح بقائمة الطبيب)، أو توتر وقلق واكتئاب.',
      'مراحل ترفع الاحتمال: الحمل وبعد الولادة (وشائع فيهما)، وعمر فوق 65. وأحياناً لا سبب واضحاً أصلاً.',
    ],
    thinkingEn: [
      'Rarer deeper causes excluded by the review signs: diverticular disease or bowel cancer — rare, but blood in poo, weight loss, and sudden habit change are what open that door.',
      'Insufficient fibre, fluids, and movement: not eating enough fibre (fruits, vegetables, cereals), not drinking enough fluids, not moving enough with long sitting or lying down, being less active and not exercising.',
      'Habits and routine: often ignoring the urge to go to the toilet, or changing your diet or daily routine.',
      'Medicines and mood: a side effect of medicine (opioid painkillers are an explicit GP-list example), or stress, anxiety or depression.',
      'Stages raising likelihood: pregnancy and after giving birth (it is common in both), and being over 65. And sometimes there is no obvious reason at all.',
    ],
    tests: [
      { nameAr: 'مطابقة تعريف الإمساك: مرات التغوط وشكل البراز والتجهّد والإفراغ', nameEn: 'Matching the constipation definition: frequency, poo form, straining, emptying', whyAr: 'الأسئلة الأربعة بتعريف NHS (أقل من 3 مرات أسبوعياً، براز جاف قاسٍ متكتل، تجهّد/ألم، شعور بعدم إفراغ كامل) تؤكد أن ما عندك إمساك فعلاً قبل أي علاج.', whyEn: 'The four questions in the NHS definition (fewer than 3 poos in the last week, dry hard lumpy poo, straining or pain, feeling not fully emptied) confirm what you have really is constipation before any treatment.' },
      { nameAr: 'فحص علامات قائمة الطبيب (دم، وزن، تعب، تغيّر مفاجئ، ألم بطن)', nameEn: 'GP-list screen (blood, weight, tiredness, sudden change, tummy pain)', whyAr: 'وجود أي منها ينقلك من «غيّر غذاءك» إلى موعد طبيب — لأنها الفاصل بين إمساك عابر وسبب يحتاج تفسيراً.', whyEn: 'Any of these moves you from "change your diet" to a GP appointment — they are the line between passing constipation and a cause needing explanation.' },
      { nameAr: 'مراجعة الأدوية المسببة', nameEn: 'Reviewing causative medicines', whyAr: 'إن كنت تأخذ دواء يسبب إمساكاً (كمسكّنات أفيونية) فهذا بند صريح لمراجعة الطبيب — وتحدّث معه قبل إيقاف أي دواء موصوف، ولا توقفه وحدك.', whyEn: 'If you are taking medicine that causes constipation (such as opioid painkillers) that is an explicit reason to see the GP — and speak to the GP before stopping any prescribed medicine; do not stop it on your own.' },
      { nameAr: 'انتباه خاص عند رعاية مسنّ أو صاحب خرف/صعوبة تعلّم', nameEn: 'Special attention when caring for an older person or someone with dementia or a learning disability', whyAr: 'الإمساك عندهم يُفوَّت بسهولة؛ تغيّرات سلوك كالتشوّش قد تعني ألماً أو انزعاجاً من إمساك غير مُلاحظ — ملاحظتها جزء من التقييم.', whyEn: 'Constipation in them is easily missed; behaviour changes such as confusion might mean they are in pain or discomfort from unnoticed constipation — spotting this is part of the assessment.' },
    ],
    procedures: [
      { nameAr: 'تغييرات غذاء: ألياف تدريجية وسوائل وفواكه سوربيتول', nameEn: 'Diet changes: gradual fibre, fluids, and sorbitol fruits', whyAr: 'غذاء متوازن صحي وفواكه فيها سوربيتول (تفاح، مشمش، عنب وزبيب، توت علّيق، فراولة) وسوائل كافية وتجنّب كحول وزيادة ألياف تدريجياً ونخالة قمح أو شوفان أو بذر كتان — تجعل البراز ألين وأسهل خروجاً؛ وهي آمنة بالحمل أيضاً.', whyEn: 'A healthy balanced diet with fruits containing sorbitol (apples, apricots, grapes and raisins, raspberries, strawberries), plenty of water and fluids while avoiding alcohol, gradually increasing dietary fibre, and adding wheat bran, oats or linseed — they make poo softer and easier to pass; these measures are also safe in pregnancy.' },
      { nameAr: 'روتين مرحاض منتظم ووضعية قدمين على مقعد منخفض', nameEn: 'A regular toilet routine and feet on a low stool', whyAr: 'وقت ومكان منتظمان ووقت كافٍ بلا استعجال، ولا تؤجل إن شعرت بالرغبة؛ وإسناد قدميك على مقعد منخفض مع رفع ركبتيك فوق وركيك إن أمكن يجعل التغوط أسهل ميكانيكياً.', whyEn: 'A regular time and place with plenty of time to use the toilet, and do not delay if you feel the urge; resting your feet on a low stool and raising your knees above your hips if possible makes pooing mechanically easier.' },
      { nameAr: 'نشاط يومي: مشي أو جري', nameEn: 'Daily activity: a walk or run', whyAr: 'زيادة النشاط — مشي أو جري يومي — تساعد على تغوّط أكثر انتظاماً، وهي عكس عامل الخمول المسبب نفسه.', whyEn: 'Increasing activity — a daily walk or run — can help you poo more regularly, countering the inactivity that itself causes constipation.' },
      { nameAr: 'مليّن بمشورة صيدلي — قصير المدى', nameEn: 'A pharmacist-advised laxative — short-term only', whyAr: 'إن لم تفد تغييرات الغذاء ونمط الحياة، الصيدلي يقترح مليّناً مناسباً؛ أغلب المليّنات تعمل خلال 3 أيام وتُستخدم لفترة قصيرة فقط. وللانحشار البرازي الطويل (براز متراكم بآخر الأمعاء، وعرضه الرئيسي إسهال يتسرب حول التراكم): مليّنات أقوى بوصفة، أو تحميلة، أو حقنة صغيرة، أو إزالة بواسطة مختص — لا تفعلها بنفسك.', whyEn: 'If diet and lifestyle changes are not helping, a pharmacist can suggest a suitable laxative; most laxatives work within 3 days and should only be used for a short time. And for long-term faecal impaction (poo built up in the rectum, whose main symptom is diarrhoea leaking through the build-up): stronger prescribed laxatives, a suppository, a mini enema, or removal by a healthcare professional — not something you should do yourself.' },
    ],
    sourceName: 'NHS — Constipation',
    sourceUrl: 'https://www.nhs.uk/conditions/constipation/',
  },
  {
    id: 'urinary',
    nameAr: 'حرقة البول والتهاب المسالك البولية',
    nameEn: 'Urinary tract infection (UTI)',
    patterns: ['حرقة بالبول', 'حرقة البول', 'حرقة عند التبول', 'ألم عند التبول', 'التهاب المسالك', 'التهاب البول', 'كثرة التبول', 'urinary', 'uti', 'burning when peeing'],
    emergencyAr: 'طوارئ فوراً إذا صرت أنت أو طفلك مشوّشاً أو نعسان أو عندك صعوبة كلام. وموعد عاجل إذا: عمرك 65 فأكثر، أو طفل 15 أو أصغر، أو حرارة عالية جداً/منخفضة جداً أو شعور بحر/برد أو رجفة، أو رجل، أو سكري، أو أعراض تسوء بسرعة أو لا تتحسن خلال 48 ساعة من العلاج/العناية الذاتية، أو التهابات متكررة (2 خلال 6 أشهر أو 3 خلال 12 شهراً)، أو قسطرة بولية، أو حامل، أو ألم أسفل البطن أو بالظهر تحت الأضلاع مباشرة، أو دم بالبول، أو مناعة ضعيفة — بعض هذه علامات التهاب كلى قد يكون خطيراً بلا علاج لأنه قد يسبب إنتاناً (سبسس).',
    emergencyEn: 'Emergency now if you or your child are confused, drowsy, or have difficulty speaking. And an urgent appointment if: you are aged 65 or older, a child aged 15 or younger, you have a very high or low temperature, feel hot or cold, or are shivering, you are a man (or trans or non-binary and assigned male at birth), you have diabetes, symptoms get worse quickly or do not improve within 48 hours of starting treatment or self care, you keep getting UTIs (2 within 6 months, or 3 within 12 months), you use a catheter, you are pregnant, you have pain in the lower tummy or in the back just under the ribs, you have blood in your pee (bright pink, red or dark brown), or you have a weakened immune system — some of these could be symptoms of a kidney infection, which can be serious if not treated as it could cause sepsis.',
    introAr: 'التهاب المسالك البولية يصيب أجزاء مختلفة من جهازك البولي: التهاب مثانة، أو التهاب إحليل، أو التهاب كلى. أعراضه: ألم أو حرقة عند التبول، حاجة للتبول أكثر من المعتاد (وبالليل)، وحاجة فجائية/ملحّة، وبول عكر أو فيه دم، وألم أسفل بطن أو ظهر تحت الأضلاع، وحرارة أو شعور بحر/برد ورجفة، أو حرارة منخفضة جداً دون 36، وتعب/وهن. والبول الداكن أو ذو الرائحة وحده قد يعني فقط أنك لا تشرب ماء كافياً. قد تُعالج بمضادات، لكنها ليست لازمة دائماً.',
    introEn: 'UTIs affect different parts of your urinary tract: cystitis (bladder infection), urethritis (infection of the urethra), and kidney infection. Symptoms may include pain or a burning sensation when peeing, needing to pee more often than usual (including at night), needing to pee suddenly or more urgently, cloudy pee, blood in your pee, lower tummy pain or pain in your back just under the ribs, a high temperature or feeling hot or cold and shivery, a very low temperature below 36C, and feeling tired or weak. Dark or smelly pee alone might just mean you have not been drinking enough water. UTIs may be treated with antibiotics, but they are not always needed.',
    thinkingAr: [
      'التهاب كلى يُستبعد أولاً بعلامات القائمة العاجلة: ألم ظهر تحت الأضلاع أو أسفل بطن، حرارة/رجفة، دم بالبول — التهاب كلى بلا علاج قد يسبب إنتاناً (سبسس)، وازدواج الخطر عند حامل وسكري وضعيف مناعة وطفل وكبير سنّ.',
      'التهاب مثانة (الأشيع): حرقة تبول وتكرار وإلحاح وبول عكر — سببه عادة بكتيريا من البراز تدخل المسالك عبر الإحليل، والنساء أقصر إحليلاً فتصلن البكتيريا للمثانة/الكلى بسهولة أكبر.',
      'التهاب إحليل: حرقة مركزة عند التبول بلا تكرار كبير غالباً — جزء من نفس عائلة الالتهابات ويفرّقه الطبيب بالنمط والفحص.',
      'عوامل ترفع الخطر وتفسر التكرار: حمل، مسح من الخلف للأمام، انسداد (حصيات كلى)، إفراغ ناقص (بروستات متضخمة، إمساك عند أطفال)، قسطرة، مناعة ضعيفة (كسكري غير مضبوط أو علاج كيميائي)، سنّ يأس، مبيدات نطاف مع وسائل منع، وقلة سوائل.',
      'صور خاصة: عند أطفال — حرارة وتوعّك عام وتبليل وقيء؛ وعند مسنّين واهنين أو أصحاب قسطرة — تغيّرات سلوك (هياج/تشوّش/هذيان) وتسرّب أسوأ من المعتاد ورجفة/قشعريرة جديدة، بلا حرقة واضحة أحياناً.',
    ],
    thinkingEn: [
      'A kidney infection excluded first by the urgent-list signs: back pain just under the ribs or lower tummy pain, temperature/shivering, blood in pee — an untreated kidney infection can cause sepsis, with doubled risk in pregnancy, diabetes, weakened immunity, children, and older age.',
      'Cystitis, bladder infection (the most common): burning on peeing, frequency, urgency, cloudy pee — usually caused by bacteria from poo entering the urinary tract through the urethra; women have a shorter urethra, so bacteria are more likely to reach the bladder or kidneys.',
      'Urethritis: burning focused on peeing, often without much frequency — part of the same infection family, separated by the doctor by pattern and testing.',
      'Risk factors explaining recurrence: pregnancy, wiping from back to front, blockage such as kidney stones, incomplete emptying (an enlarged prostate in men, constipation in children), urinary catheters, a weakened immune system (poorly controlled diabetes or chemotherapy), the menopause, spermicide with contraception, and not drinking enough fluids.',
      'Special pictures: in children — a high temperature, appearing generally unwell, wetting themselves, being sick; in older, frail people or those with a catheter — changes in behaviour such as agitation or confusion (delirium), leaking worse than usual, and new shivering or shaking (rigors), sometimes without clear burning.',
    ],
    tests: [
      { nameAr: 'تحليل بول عند الطبيب — عند الحاجة', nameEn: 'A urine test at the GP — when needed', whyAr: 'إن ظنّ الطبيب التهاب مسالك قد يعمل تحليل بول — لكنه ليس لازماً دائماً؛ نتيجته تدعم قرار المضاد، وغيابها لا يوقف العلاج عند نمط سريري واضح.', whyEn: 'If a GP thinks you may have a UTI, they may do a urine test, although this is not always needed; its result supports the antibiotic decision, and its absence does not stop treatment when the clinical pattern is clear.' },
      { nameAr: 'مراجعة نمط الأعراض (حرقة/تكرار/إلحاح/عكارة/دم)', nameEn: 'Symptom-pattern review (burning/frequency/urgency/cloudiness/blood)', whyAr: 'النمط الكامل يفرّق التهاباً من مجرد قلة شرب (بول داكن/رائحته وحده قد يكون سوائل قليلة) ومن صور خاصة عند أطفال ومسنّين — وهو باب كل قرار لاحق.', whyEn: 'The full pattern separates an infection from simple under-drinking (dark or smelly pee alone might be that) and from the special pictures in children and older people — it is the gateway to every later decision.' },
      { nameAr: 'فحص قائمة الاستعجال الاثني عشر', nameEn: 'The twelve-item urgency screen', whyAr: 'عمر 65+ أو طفل ≤15، رجل، حامل، سكري، قسطرة، مناعة ضعيفة، دم بالبول، ألم تحت الأضلاع، حرارة قصوى أو رجفة، عدم تحسن خلال 48 ساعة، تكرار 2/6 أشهر أو 3/12 — أي واحد ينقلك من صيدلية/انتظار إلى موعد عاجل، لأن بعضها أعراض التهاب كلى.', whyEn: 'Age 65+, a child 15 or younger, being a man, pregnancy, diabetes, a catheter, a weakened immune system, blood in pee, pain under the ribs, extreme temperature or shivering, no improvement within 48 hours, recurrence of 2 in 6 months or 3 in 12 — any one moves you from pharmacy/waiting to an urgent appointment, because some are kidney-infection symptoms.' },
      { nameAr: 'عدّ الالتهابات السابقة ومراجعة عوامل الخطر', nameEn: 'Recurrence counting and risk-factor review', whyAr: 'بلوغ حدّ التكرار (التهابان بـ6 أشهر أو 3 بـ12 شهراً) يفتح مسار علاج مختلفاً كلياً، ومراجعة عوامل كالحصيات والإفراغ الناقص والقسطرة وسنّ اليأس تبيّن ما يمكن إصلاحه لمنع العودة.', whyEn: 'Reaching the recurrence threshold (2 UTIs in 6 months or 3 in 12 months) opens a completely different treatment path, and reviewing factors like stones, incomplete emptying, catheters, and the menopause shows what can be fixed to prevent return.' },
    ],
    procedures: [
      { nameAr: 'طريق الصيدلي — لنساء 16–64 غير الحوامل/المرضعات', nameEn: 'The pharmacist route — women and girls 16–64, not pregnant or breastfeeding', whyAr: 'إن ظننتِ التهاب مسالك وأنتِ ضمن هذه الفئة، الصيدلي يعطي نفس أدوية الطبيب لعلاج الالتهاب، أو ينصحك أو يوجّهك لمساعدة أخرى — أسرع طريق للحالة البسيطة النموذجية.', whyEn: 'If you think you have a UTI and are in this group, a pharmacist can give the same medicines as a GP to treat it, and can also give advice or direct you to other medical help — the fastest route for a typical simple case.' },
      { nameAr: 'خيارات الطبيب الثلاثة: عناية ذاتية ومسكّن، أو مضاد قصير، أو انتظار 48 ساعة', nameEn: 'The GP\'s three options: self-care and a painkiller, a short antibiotic course, or waiting 48 hours', whyAr: 'قد ينصحك بعناية ذاتية ومسكّن، أو يصف دورة مضاد قصيرة، أو يطلب الانتظار 48 ساعة قبل المضاد لاحتمال زوال الأعراض وحدها — وإن وُصف دواء فخذه كاملاً حتى لو تحسّنت، لأن الإيقاف المبكر يبقي بكتيريا ويغذي المقاومة.', whyEn: 'A GP may offer self-care advice and a painkiller, give a prescription for a short course of antibiotics, or ask you to wait 48 hours before getting antibiotics in case your symptoms go away on their own — and if medicine is prescribed, take all of it even if you start to feel better, because stopping early leaves bacteria and feeds resistance.' },
      { nameAr: 'عناية ذاتية: باراسيتامول حتى 4 مرات يومياً وسوائل لبول فاتح', nameEn: 'Self-care: paracetamol up to 4 times a day, fluids to pale urine', whyAr: 'باراسيتامول يخفف الألم والحرارة (وللأطفال سائل باراسيتامول)، وارتح واشرب سوائل كافية لتتبول بولاً فاتحاً بانتظام خلال اليوم، وتجنّب مشروبات قد تهيّج المثانة كعصائر الفاكهة والقهوة والكحول — وأكياس السيستايت والتوت البري لا دليل أنها تخفف أو تعالج التهاباً بدأ فعلاً (قد تساعد وقاية عند بعض غير الحوامل).', whyEn: 'Paracetamol reduces pain and a high temperature (liquid paracetamol for children), rest and drink enough fluids so you pass pale urine regularly during the day, and avoid drinks that may irritate your bladder like fruit juices, coffee and alcohol — and cystitis sachets and cranberry products have no evidence they help ease symptoms or treat a UTI once it has already started (they may help prevention in some people who are not pregnant).' },
      { nameAr: 'وقاية وعلاج التهابات متكررة', nameEn: 'Prevention and recurrent-UTI treatment', whyAr: 'امسح من الأمام للخلف، وأبقِ المنطقة نظيفة وجافة، واشرب سوائل كافية، وتبوّل بعد الجماع بأقرب وقت، ولا تحبس بولك ولا تستعجل التبول (أفرغ مثانتك كاملة)، وملابس داخلية قطنية غير ضيقة وبلا صابون معطّر حول المنطقة ولا كحول/سكر كثيرين — فكلها تقلل دخول البكتيريا وتكاثرها. وللمتكرر عند الطبيب: مضاد مختلف أو جرعة منخفضة حتى 6 أشهر، أو إستروجين مهبلي حول/بعد سنّ اليأس، أو أقراص تعالج وتمنع العودة، أو إحالة مختص؛ ودي-مانوز ومنتجات التوت البري اليومية عليها بعض دليل وقاية (انتبه: سكر كثير فيها، وتجنّب التوت البري مع وارفارين، واسأل طبيبك بالحمل).', whyEn: 'Wipe from front to back, keep the genital area clean and dry, drink plenty of fluids, pee as soon as possible after sex, do not hold your pee in and do not rush — fully empty your bladder — cotton underwear, nothing tight, no scented soap around the genital area, and not lots of alcohol or sugary food or drinks — all reduce bacteria entering and growing. For recurrent UTIs the GP may prescribe a different antibiotic or a low-dose antibiotic for up to 6 months, vaginal oestrogen in perimenopause or after the menopause, tablets that treat and stop return, or a specialist referral; and D-mannose and daily cranberry products have some evidence for prevention (note: they can contain a lot of sugar, avoid cranberry with warfarin, and speak to your doctor in pregnancy).' },
    ],
    sourceName: 'NHS — Urinary tract infections (UTIs)',
    sourceUrl: 'https://www.nhs.uk/conditions/urinary-tract-infections-utis/',
  },
  {
    id: 'heartburn',
    nameAr: 'الحرقة وارتجاع الحمض',
    nameEn: 'Heartburn and acid reflux',
    patterns: ['حرقة', 'حموضة', 'ارتجاع', 'حرقان في الصدر', 'heartburn', 'acid reflux', 'reflux'],
    emergencyAr: 'تنبيه أولاً: حرقة الصدر قد تتشابه مع ألم قلب — أي ألم صدر ضاغط أو منتشر لذراع/فك أو مع تعرّق/ضيق تنفس يُعامَل كطارئ قلبي (راجع دليل ألم الصدر) قبل افتراض أنه ارتجاع. وللارتجاع نفسه راجع طبيباً إذا: تغييرات نمط الحياة وأدوية الصيدلية لا تفيد، أو حرقة أغلب الأيام، أو طعام يعلق بحلقك، أو قيء متكرر، أو فقدان وزن بلا سبب — واتصل بطبيب فوراً إن ساءت أعراضك بأي وقت.',
    emergencyEn: 'Warning first: chest heartburn can mimic heart pain — any pressing chest pain or pain spreading to the arm/jaw, or with sweating/breathlessness, is treated as a cardiac emergency (see the chest pain guide) before assuming reflux. For reflux itself see a GP if: lifestyle changes and pharmacy medicines are not helping, you have heartburn most days, or food gets stuck in your throat, you are frequently being sick, or losing weight for no reason — and contact a GP at any time if your symptoms are getting worse.',
    introAr: 'الحرقة شعور حارق بالصدر سببه صعود حمض المعدة نحو الحلق (ارتجاع حمضي)؛ وإن تكرر قد يُسمى مرض الارتجاع المعدي المريئي (GORD). أعراضه: حرقة بمنتصف الصدر وطعم حامض مزعج بالفم، وقد يرافقها سعال أو فواق متكرر وبحة صوت ورائحة فم وانتفاخ وغثيان — وتسوء غالباً بعد الأكل وعند الاستلقاء والانحناء.',
    introEn: 'Heartburn is a burning feeling in the chest caused by stomach acid travelling up towards the throat (acid reflux); if it keeps happening it may be called gastro-oesophageal reflux disease (GORD). Symptoms: heartburn in the middle of the chest and an unpleasant sour taste in the mouth, possibly with a cough or hiccups that keep coming back, a hoarse voice, bad breath, bloating and feeling sick — often worse after eating, when lying down, and when bending over.',
    thinkingAr: [
      'ألم قلب يُستبعد أولاً دائماً: الارتجاع والقلب يتشاركان مكان الألم — القاعدة: الألم الضاغط/المنتشر/المصحوب بتعرّق أو ضيق تنفس طارئ قلبي حتى يثبت العكس.',
      'ارتجاع حمضي بسيط متكرر: محفزات طعام وشراب (قهوة، بندورة، كحول، شوكولا، دهني/حارّ)، وزن زائد، تدخين، توتر وقلق، هرمونات (بروجسترون وإستروجين — وحمل)، أو أدوية كمضادات الالتهاب المسكّنة (كإيبوبروفين). وغالباً لا سبب واضحاً أصلاً.',
      'فتق حجابي: جزء من المعدة يصعد إلى الصدر فيسهّل صعود الحمض.',
      'قرحة معدة أو التهاب بكتيري بالمعدة: أسباب أعمق يبحث عنها الطبيب عند استمرار الأعراض أو شدتها.',
    ],
    thinkingEn: [
      'Heart pain excluded first, always: reflux and the heart share the pain location — the rule: pressing/spreading pain or pain with sweating or breathlessness is a cardiac emergency until proven otherwise.',
      'Simple recurring acid reflux: triggers of food and drink (coffee, tomatoes, alcohol, chocolate, fatty or spicy foods), being overweight, smoking, stress and anxiety, hormones (progesterone and oestrogen — and pregnancy), or medicines such as anti-inflammatory painkillers (like ibuprofen). And often there is no obvious reason at all.',
      'A hiatus hernia: part of the stomach moves up into the chest, easing acid\'s rise.',
      'A stomach ulcer or a bacterial infection in the stomach: deeper causes the doctor looks for when symptoms persist or are severe.',
    ],
    tests: [
      { nameAr: 'قصة الأعراض ونمطها (بعد أكل/استلقاء/انحناء) ومحفزاتها', nameEn: 'Symptom history, pattern (after eating/lying/bending), and triggers', whyAr: 'الحرقة التي تسوء بعد الأكل وعند الاستلقاء والانحناء وطعمها الحامض نمط ارتجاع نموذجي؛ وتدوين محفزاتك (أطعمة وأدوية) هو ما يبني خطة نمط الحياة والعلاج.', whyEn: 'Heartburn worse after eating, when lying down and when bending over, with a sour taste, is a typical reflux pattern; recording your triggers (foods and medicines) builds the lifestyle and treatment plan.' },
      { nameAr: 'فحص علامات الطبيب: علوق طعام، قيء متكرر، فقدان وزن', nameEn: 'GP-sign screen: food sticking, frequent vomiting, weight loss', whyAr: 'وجودها ينقل الحالة من صيدلية إلى طبيب، لأن الطبيب يقدم علاجات بديلة/أقوى ويستبعد أسباباً أخطر لأعراضك — وهي وظيفة الموعد الصريحة عند NHS.', whyEn: 'Their presence moves the case from pharmacy to GP, because a GP can provide alternative or stronger treatments and help rule out more serious causes of your symptoms — the stated purpose of the appointment at the NHS.' },
      { nameAr: 'تنظير معدة (غاستروسكوبي) عند إحالة مختص', nameEn: 'Gastroscopy when referred to a specialist', whyAr: 'أنبوب رفيع بكاميرا يمرّ عبر الحلق إلى المعدة — يري الطبيب المريء والمعدة مباشرة لمعرفة سبب أعراضك عندما لا تفيد الأدوية أو تكون الأعراض شديدة.', whyEn: 'A thin tube with a camera passed down your throat into your stomach — it lets the doctor see the oesophagus and stomach directly to find out what is causing your symptoms when medicines do not help or symptoms are severe.' },
      { nameAr: 'فحص بكتيريا المعدة', nameEn: 'Testing for stomach bacteria', whyAr: 'بعض الارتجاع/الحرقة وراءه بكتيريا بالمعدة؛ فحصها عند المختص — وإن وُجدت تُعالج بتركيبة مضادات ومثبط حمض. لولاه قد يستمر السبب رغم علاج الأعراض.', whyEn: 'Some heartburn is driven by bacteria in the stomach; a specialist can test for them — and if found they are treated with a combination of antibiotics and a PPI. Without it the cause may persist despite symptom treatment.' },
    ],
    procedures: [
      { nameAr: 'تغييرات نمط حياة: وجبات أصغر وأكثر تكراراً وأشياء تتجنبها', nameEn: 'Lifestyle changes: smaller, more frequent meals and things to avoid', whyAr: 'كُل وجبات أصغر ومتكررة، واخسر وزناً إن كنت زائداً، واسترخِ؛ وتجنّب طعام/شراب محفزاتك، ولا تأكل خلال 3–4 ساعات قبل النوم، ولا ملابس ضيقة عند الخصر، ولا تدخين، ولا كحول كثير — ولا توقف دواء موصوفاً دون كلام طبيب.', whyEn: 'Eat smaller, more frequent meals, try to lose weight if you are overweight, and find ways to relax; avoid food or drink that triggers your symptoms, do not eat within 3 or 4 hours before bed, do not wear clothes tight around your waist, do not smoke, do not drink too much alcohol — and do not stop any prescribed medicine without speaking to a doctor first.' },
      { nameAr: 'رفع رأس السرير 10–20 سم بكتل — لا بوسائد إضافية', nameEn: 'Raising the head of the bed 10–20cm with blocks — not extra pillows', whyAr: 'خشب أو طوب أو كتب تحت رأس السرير ترفع صدرك ورأسك فوق خصرك فتمنع صعود الحمض ليلاً؛ أما الوسائد الإضافية فتزيد ضغط البطن وقد تفاقم الأعراض — فرق عملي مهم.', whyEn: 'Wood, bricks or books raising the head of your bed by around 10 to 20cm keeps your chest and head above your waist and can stop stomach acid travelling up at night; additional pillows can increase pressure on your belly and make symptoms worse — an important practical difference.' },
      { nameAr: 'مضادات حموضة أو ألجينات من الصيدلية — مع الطعام', nameEn: 'Antacids or alginates from a pharmacy — taken with food', whyAr: 'الصيدلي قد يوصي بها لتخفيف الأعراض؛ الأفضل أخذها مع الطعام أو بعده مباشرة لأن الحرقة تأتي غالباً حينها وقد تعمل أطول مع الطعام — لكنها تخفف قصيراً ولا تعالج المشكلة ولا تُؤخذ بانتظام لفترات طويلة.', whyEn: 'A pharmacist may recommend them to ease symptoms; it is best to take them with food or soon after eating, as that is when heartburn is most likely and they may work longer with food — but they help only in the short term, will not cure the problem, and should not be taken regularly for long periods.' },
      { nameAr: 'مثبط مضخة بروتون (PPI) بوصفة طبيب — وأحياناً بديله H2', nameEn: 'A proton pump inhibitor (PPI) by GP prescription — sometimes an H2 alternative', whyAr: 'يقلل حمض المعدة نفسه (كأوميبرازول ولانزوبرازول) ويؤخذ عادة 4 أو 8 أسابيع حسب شدة الارتجاع؛ وإن عادت الأعراض بعد إيقافه قد تحتاج وصفة أطول؛ وإن لم يفد الـPPI قد يقترح الطبيب مضاد مستقبلات H2 كفاموتيدين؛ وجراحة المعدة/المريء خيار مختص أخير لوقف الارتجاع.', whyEn: 'It reduces how much acid your stomach makes (such as omeprazole or lansoprazole), usually taken for 4 or 8 weeks depending on severity; if symptoms return after stopping you may need a long-term prescription; if a PPI does not help the doctor may suggest an H2 receptor antagonist such as famotidine; and surgery on the stomach or oesophagus is a final specialist option to stop reflux.' },
    ],
    sourceName: 'NHS — Heartburn and acid reflux',
    sourceUrl: 'https://www.nhs.uk/conditions/heartburn-and-acid-reflux/',
  },
  {
    id: 'leg-swelling',
    nameAr: 'تورّم الساقين والقدمين',
    nameEn: 'Swollen ankles, feet and legs (oedema)',
    patterns: ['تورم في الساق', 'تورم الساقين', 'تورم القدمين', 'تورم في رجلي', 'رجلي متورمة', 'swollen legs', 'swollen ankles', 'leg swelling', 'oedema', 'edema'],
    emergencyAr: 'طوارئ فوراً إذا التورّم مع: ضيق تنفس أو صعوبة تنفس، أو صدر مشدود/ثقيل/مؤلم، أو سعال دم، أو خفقان ملحوظ، أو خفة رأس/إغماء/تشوّش/غثيان/تعرّق لزج — قد تكون جلطة في الرئتين وتحتاج علاج مشفى فورياً. وموعد عاجل إذا: تورّم بساق واحدة دون سبب معروف، أو تورّم كثير بعد إصابة أو يزداد، أو شديد/مؤلم/مفاجئ جداً، أو تورّم بمناطق أخرى (وجه/بطن)، أو المنطقة حمراء أو حارة، أو حرارة عالية جداً أو شعور بحر/برد/رجفة، أو عندك سكري مع تورّم قدمين/كاحلين/ساقين.',
    emergencyEn: 'Emergency now if the swelling comes with: feeling short of breath or struggling to breathe, a chest that feels tight, heavy or painful, coughing up blood, palpitations (a more noticeable heartbeat), or feeling lightheaded, faint, confused, sick or clammy — you could have a blood clot in your lungs, which needs immediate hospital treatment. And an urgent appointment if: swelling in 1 ankle, foot or leg with no known cause, a lot of swelling after an injury or worsening swelling, severe, painful or very sudden swelling, swelling in other areas such as your face or tummy, the swollen area is red or hot, a very high temperature or feeling hot, cold or shivery, or you have diabetes with swollen feet, ankles or legs.',
    introAr: 'تورّم الكاحلين والقدمين والساقين سببه غالباً تراكم سوائل فيها (وذمة/أوديما)، ويزول وحده غالباً. قد يصيب ساقاً أو الساقين: جلد منتفخ لامع أو مشدود، وتغيّرات لون وجلد جاف وانزعاج وتيبّس وانخفاضات عند الضغط على الجلد.',
    introEn: 'Swelling in the ankles, feet and legs is often caused by a build-up of fluid in these areas, called oedema, and should go away on its own. It can affect 1 or both legs: swollen or puffy skin that looks shiny or stretched, with changes in skin colour, dry skin, discomfort, stiffness, and dents when you press on the skin.',
    thinkingAr: [
      'جلطة في الرئتين أولاً عند أي علامة صدرية/تنفسية: ضيق تنفس، صدر مشدود/مؤلم، سعال دم، خفقان، دوار/إغماء — التورّم هنا قد يكون مصدر الجلطة أو رفيقها، وعلاجها فوري بالمشفى.',
      'التهاب بالساق المتورّمة: منطقة حمراء أو حارة الملمس مع حرارة عالية أو رجفة — التهاب يحتاج تقييماً عاجلاً لا انتظاراً.',
      'إصابة أو لدغة من جهة واحدة: التواء/شدّ أو لدغة حشرة — تورّم موضعي بعد سبب واضح، لكن ازدياده أو كثرته تستدعي موعداً عاجلاً.',
      'وذمة اعتيادية (الأشيع): وقوف/جلوس طويل بنفس الوضعية، ملح زائد بالطعام، وزن زائد، حمل، أدوية معينة (بعض أدوية الضغط، حبوب منع الحمل، علاج هرموني، مضادات اكتئاب، ستيرويدات)، دوالي، أو مشاكل غدة درقية.',
      'أسباب أعمق قد تكون وراءها: مشاكل كلى أو كبد أو قلب، أو جلطة دموية بالساق، أو التهاب — لهذا التورّم المجهول السبب بساق واحدة عاجل بحد ذاته.',
    ],
    thinkingEn: [
      'A blood clot in the lungs first with any chest/breathing sign: breathlessness, a tight or painful chest, coughing up blood, palpitations, lightheadedness/fainting — the swelling may be the clot\'s source or companion, and its treatment is immediate in hospital.',
      'Infection in the swollen leg: a red or hot swollen area with a very high temperature or shivering — an infection needing urgent assessment, not waiting.',
      'An injury or bite on one side: a strain or sprain or an insect bite or sting — local swelling after a clear cause, though a lot of swelling or worsening swelling still warrants an urgent appointment.',
      'Usual oedema (the most common): standing or sitting in the same position too long, eating too much salty food, being overweight, being pregnant, certain medicines (some blood pressure medicines, contraceptive pills, hormone therapy, antidepressants or steroids), varicose veins, or thyroid problems.',
      'Deeper causes that can be behind it: problems with your kidneys, liver or heart, a blood clot, or an infection — which is why unexplained swelling in 1 leg is itself urgent.',
    ],
    tests: [
      { nameAr: 'تقييم جهة واحدة أم جهتين وسرعة البدء', nameEn: 'One-side vs both-sides and onset-speed assessment', whyAr: 'تورّم الساقين معاً المزمن يميل لأسباب عامة، أما ساق واحدة مجهولة السبب أو بداية مفاجئة جداً أو شديدة فبنود عاجلة رسمية — أول سؤالين يرسمان مستوى الاستعجال.', whyEn: 'Both-legs chronic swelling leans to general causes, while 1 leg with no known cause, or a very sudden or severe start, are official urgent items — the first two questions set the urgency level.' },
      { nameAr: 'فحص الجلد: احمرار/حرارة وانخفاض عند الضغط وتغيّر لون', nameEn: 'Skin examination: redness/heat, pitting dents, colour change', whyAr: 'جلد أحمر حارّ يعني التهاباً محتملاً، وانخفاض يبقى بعد الضغط يؤكد سوائل وذمة، وتغيّرات اللون والجفاف والتيبّس توثّق شدة الوذمة ومسارها.', whyEn: 'Red, hot skin suggests possible infection, a dent remaining after pressing confirms oedema fluid, and colour changes, dryness and stiffness document the swelling\'s severity and course.' },
      { nameAr: 'قياس الحرارة وسؤال الشعور العام', nameEn: 'Temperature and general-illness check', whyAr: 'حرارة عالية جداً أو شعور بحر/برد/رجفة مع تورّم = بند عاجل صريح، لأنه يرجّح التهاباً مرافقاً يحتاج علاجاً لا مراقبة.', whyEn: 'A very high temperature or feeling hot, cold or shivery with swelling is an explicit urgent item, because it points to an accompanying infection needing treatment, not watching.' },
      { nameAr: 'مراجعة الأدوية والحالات المعروفة (قلب/كلى/أوردة/غدة)', nameEn: 'Medicine and known-condition review (heart/kidneys/veins/thyroid)', whyAr: 'أدوية محددة تسبب وذمة وحالات مشخصة بالقلب أو الكلى أو أوردة الساقين تغيّر التفسير والعلاج؛ ومن عنده حالة كهذه يراجع طبيباً إن لم يتحسن تورّم ساقيه بعد أيام علاج منزلي أو ازداد.', whyEn: 'Specific medicines cause oedema, and diagnosed conditions affecting the heart, kidneys or leg veins change the interpretation and treatment; someone with such a condition sees a GP if both legs\' swelling has not improved after a few days of home treatment or gets worse.' },
      { nameAr: 'فحص علامات جلطة الرئة التنفسية/الصدرية', nameEn: 'Lung-clot sign screen (breathing and chest)', whyAr: 'ضيق التنفس وصدر مشدود/ثقيل/مؤلم وسعال الدم والخفقان والدوار — قائمة الطوارئ الرسمية المرافقة للتورّم؛ وجود أي منها ينقلك فوراً لخط الطوارئ، لأن جلطة الرئة تحتاج علاج مشفى فورياً.', whyEn: 'Breathlessness, a tight, heavy or painful chest, coughing up blood, palpitations, and lightheadedness — the official emergency list accompanying swelling; any of them moves you immediately to the emergency line, because a lung clot needs immediate hospital treatment.' },
    ],
    procedures: [
      { nameAr: 'ارفع ساقيك على كرسي أو وسائد كلما استطعت', nameEn: 'Raise your legs on a chair or pillows when you can', whyAr: 'رفع الساقين أو المنطقة المتورّمة يساعد السوائل على العودة بدل تجمعها بالأسفل — أبسط إجراء وأول ما يُجرَّب.', whyEn: 'Raising your legs or the swollen area on a chair or pillows helps fluid return instead of pooling below — the simplest step and the first to try.' },
      { nameAr: 'تمرين لطيف كالمشي + حذاء واسع مريح', nameEn: 'Gentle exercise like walking, and wide comfortable shoes', whyAr: 'المشي اللطيف يحسّن تدفق دمك فيحرك السوائل؛ وحذاء واسع مريح بكعب منخفض ونعل طري لا يضغط القدم المتورّمة — ولا تقف أو تجلس فترات طويلة، ولا ملابس/جوارب/أحذية ضيقة جداً.', whyEn: 'Gentle exercise like walking improves your blood flow and moves fluid; wide, comfortable shoes with a low heel and soft sole do not squeeze a swollen foot — and do not stand or sit for long periods, and avoid clothes, socks or shoes that are too tight.' },
      { nameAr: 'عناية بالقدمين: غسل وتجفيف وترطيب', nameEn: 'Foot care: wash, dry, and moisturise', whyAr: 'غسل قدميك وتجفيفهما وترطيبهما يقي من الالتهابات — الجلد المشدود/الجاف فوق الوذمة أرض خصبة لالتهاب يحوّل حالة بسيطة لعاجلة.', whyEn: 'Washing, drying and moisturising your feet avoids infections — stretched or dry skin over oedema is fertile ground for an infection that turns a simple case urgent.' },
      { nameAr: 'علاج السبب عند الطبيب + تغييرات نمط حياة', nameEn: 'Cause-based GP treatment plus lifestyle changes', whyAr: 'تورّم لا يزول وحده يُعالج بحسب سببه والطبيب يساعدك بالعلاج الصحيح؛ وناقش معه هل تفيد تغييرات نمط حياة (ملح أقل، وزن، حركة) — لأن الدواء الخاطئ لوذمة سببها دواء آخر قد يضر.', whyEn: 'Swelling that does not go away on its own is treated according to its cause, and your GP can help you with the right treatment; speak to your GP about whether lifestyle changes could help (less salt, weight, movement) — because the wrong medicine for medicine-caused oedema can harm.' },
    ],
    sourceName: 'NHS — Swollen ankles, feet and legs (oedema)',
    sourceUrl: 'https://www.nhs.uk/conditions/oedema/',
  },
  {
    id: 'earache',
    nameAr: 'ألم الأذن',
    nameEn: 'Earache',
    patterns: ['ألم في الأذن', 'ألم الأذن', 'وجع أذن', 'وجع الأذن', 'earache', 'ear pain', 'ألم بأذني'],
    emergencyAr: 'موعد عاجل (طبيب عاجل أو خدمة طبية فورية) إذا ألم الأذن مع: استمر أكثر من 2–3 أيام، أو صرت مريضاً بشكل عام، أو حرارة عالية جداً أو شعور بحر/برد/رجفة، أو تورّم حول الأذن، أو سائل يخرج من الأذن، أو نقص سمع أو تغيّر بالسمع، أو شيء عالق بالأذن، أو طفل دون السنتين بألم بالأذنين معاً.',
    emergencyEn: 'Urgent appointment (urgent GP or immediate medical help) if the earache comes with: having it for more than 2 to 3 days, becoming generally unwell, a very high temperature or feeling hot, cold or shivery, swelling around the ear, fluid coming from the ear, hearing loss or a change in hearing, something stuck in the ear, or a child under 2 with earache in both ears.',
    introAr: 'ألم الأذن شائع، خصوصاً عند الأطفال الصغار، ومؤلم لكنه لا يكون عادة علامة على شيء خطير. أكثر آلام أذن الأطفال سببها التهاب أذن يبدأ بالتحسن بعد أيام قليلة. علامات طفل صغير قد يعاني: يفرك/يشدّ أذنه، لا يتفاعل مع بعض الأصوات، حرارة 38 أو أكثر، عصبي/قلق، فاقد شهية، يفقد توازنه.',
    introEn: 'Earache and ear pain are common, particularly in young children; painful, but not usually a sign of anything serious. Most earaches in children are caused by an ear infection, which usually starts to improve after a few days. A young child might have earache if they rub or pull their ear, do not react to some sounds, have a temperature of 38C or above, are irritable or restless, are off their food, or keep losing their balance.',
    thinkingAr: [
      'التهاب أذن (الأشيع، خاصة مع حرارة): ألم مع حرارة عند طفل — وNHS يربط ألم الأذن مع الحمى بالتهاب أذن أو إنفلونزا أو زكام.',
      'مجموعة تغيّر السمع: أذن صمغية (غراء)، تراكم شمع، شيء عالق بالأذن (لا تحاول إخراجه بنفسك — راجع طبيباً)، أو غشاء طبل مثقوب (خصوصاً بعد ضجيج عالٍ أو حادث).',
      'ألم مُحال من الحلق: ألم أذن مع ألم عند البلع — ألم حلق أو التهاب لوزتين أو خراج حول اللوزة (كوينزي، مضاعفة لالتهاب اللوزتين).',
      'ألم مُحال من الأسنان: ألم أذن مع ألم أسنان — تسنين عند الأطفال أو خراج سنّي عند الكبار.',
    ],
    thinkingEn: [
      'An ear infection (the most common, especially with fever): pain with a temperature in a child — the NHS links ear pain with fever to an ear infection, flu, or a cold.',
      'The hearing-change group: glue ear, earwax build-up, an object stuck in the ear (do not try to remove it yourself — see a GP), or a perforated eardrum (particularly after a loud noise or accident).',
      'Pain referred from the throat: ear pain with pain when swallowing — a sore throat, tonsillitis, or quinsy (a complication of tonsillitis).',
      'Pain referred from the teeth: ear pain with toothache — teething in children or a dental abscess in adults.',
    ],
    tests: [
      { nameAr: 'مراجعة المدة والتحسّن (خط 2–3 أيام)', nameEn: 'Duration and improvement review (the 2–3 day line)', whyAr: 'أغلب آلام الأذن تتحسن وحدها، والتهاب الأذن عند الأطفال يبدأ بالتحسن بعد أيام قليلة — عدم التحسن خلال 2–3 أيام هو خط NHS الرسمي لطلب مساعدة طبية، وأبكر إن كنت قلقاً من أعراض أخرى كحرارة عالية أو سائل من الأذن.', whyEn: 'Most earaches get better on their own, and children\'s ear infections usually start to improve after a few days — not improving within 2 to 3 days is the NHS official line for getting medical help, sooner if you are worried about other symptoms such as a high temperature or fluid leaking from the ear.' },
      { nameAr: 'فحص علامات الموعد العاجل الثمانية', nameEn: 'The eight urgent-sign screen', whyAr: 'تورّم حول الأذن، سائل خارج، تغيّر سمع، حرارة عالية جداً/رجفة، توعّك عام، شيء عالق، مدة >2–3 أيام، طفل دون سنتين بأذنين معاً — كل واحد بند عاجل صريح؛ الفحص المنظم لها يمنع فوَات أي منها.', whyEn: 'Swelling around the ear, fluid coming out, hearing change, a very high temperature/shivering, being generally unwell, something stuck, duration over 2–3 days, a child under 2 with both ears — each is an explicit urgent item; screening for them systematically prevents missing any.' },
      { nameAr: 'مطابقة العرض المرافق للسبب (جدول NHS)', nameEn: 'Companion-symptom pattern matching (the NHS table)', whyAr: 'ألم مع ألم أسنان، أو مع تغيّر سمع، أو مع ألم بلع، أو مع حمى — كل مرافق يوجّه لمجموعة أسباب مختلفة كلياً (أسنان، أذن نفسها، حلق، التهاب)؛ سؤال واحد يختصر الطريق. وNHS ينبّه: لا تشخّص السبب بنفسك.', whyEn: 'Pain with toothache, with a change in hearing, with pain when swallowing, or with a fever — each companion points to a completely different cause group (teeth, the ear itself, throat, infection); one question shortens the path. And the NHS warns: do not try to diagnose the cause yourself.' },
      { nameAr: 'تقييم الصيدلي', nameEn: 'Pharmacist assessment', whyAr: 'الصيدلي يقول لك ما تفعله بنفسك، وهل تشتري شيئاً يساعد (كقطرات أذن)، وهل تحتاج طبيباً، ويقدر يعالج التهاب الأذن الوسطى عند أطفال 1–17 سنة ويعطي بعض العلاجات دون طبيب — خطوة أولى سريعة وموثّقة.', whyEn: 'A pharmacist can tell you what to do yourself, whether you can buy anything to help (for example eardrops), whether you need to see a GP, and can treat a middle-ear infection in children aged 1 to 17 — providing some treatments without a GP. A quick, documented first step.' },
    ],
    procedures: [
      { nameAr: 'مسكّنات + قطعة قماش دافئة على الأذن', nameEn: 'Painkillers and a warm flannel on the ear', whyAr: 'باراسيتامول أو إيبوبروفين (والأطفال دون 16 لا أسبرين؛ وبعض المسكنات لا تناسب الجميع كالحوامل — تحقق من النشرة أو خذ مشورة طبية) وقطعة قماش دافئة على الأذن تخفف الألم ريثما تتحسن الحالة وحدها.', whyEn: 'Paracetamol or ibuprofen (children under 16 should not take aspirin; some painkillers are not safe for everyone, for example in pregnancy — always check the leaflet or get medical advice) and placing a warm flannel on the ear relieve pain while it gets better on its own.' },
      { nameAr: 'قواعد حماية الأذن: لا شيء داخلها، لا إزالة شمع، لا ماء', nameEn: 'Ear protection rules: nothing inside, no wax removal, no water', whyAr: 'لا تضع شيئاً داخل أذنك (كأعواد قطن)، ولا تحاول إزالة شمع الأذن، ولا تدع ماء يدخل أذنك — ثلاثتها قد تدفع الشمع/الجسم أعمق أو تجرح الغشاء أو تزيد الالتهاب.', whyEn: 'Do not put anything inside your ear such as cotton buds, do not try to remove earwax, and do not let water get inside your ear — all three can push wax or an object deeper, injure the drum, or worsen infection.' },
      { nameAr: 'علاجات صيدلية وقطرات عند الحاجة', nameEn: 'Pharmacy treatments and eardrops when needed', whyAr: 'الصيدلي يوفر بعض العلاجات دون طبيب وينصح بقطرات أذن عند مناسبتها — علاج موجّه بدل تجربة عشوائية بقطرات بيتية.', whyEn: 'A pharmacist can provide some treatments without a GP and advise on eardrops when appropriate — directed treatment instead of random home-drop experiments.' },
      { nameAr: 'طبيب عند تكرار ألم الأذن', nameEn: 'A GP when earache keeps coming back', whyAr: 'تكرار ألم الأذن عندك أو عند طفلك بند صريح لمراجعة طبيب — التكرار يعني سبباً مستمراً (شمع، أذن صمغية، شيء عالق) يحتاج حلاً لا مسكّنات متكررة.', whyEn: 'You or your child keep getting earache is an explicit reason to see a GP — recurrence means a persisting cause (wax, glue ear, a stuck object) needing a solution, not repeated painkillers.' },
    ],
    sourceName: 'NHS — Earache',
    sourceUrl: 'https://www.nhs.uk/symptoms/earache/',
  },
  {
    id: 'palpitations',
    nameAr: 'خفقان القلب',
    nameEn: 'Heart palpitations',
    patterns: ['خفقان', 'قلبي عم يدق بسرعة', 'دقات قلبي سريعة', 'بحس بقلبي', 'palpitations', 'heart racing', 'خفقان القلب'],
    emergencyAr: 'طوارئ فوراً إذا الخفقان حاصل الآن ولا يزول، أو معه ألم صدر أو ضيق تنفس أو شعور بالإغماء أو إغماء فعلي. وإذا حدثت هذه الأعراض ثم توقفت: اطلب موعد طبيب عاجل أو خدمة طبية فورية اليوم نفسه — لا تنتظر الموعد الروتيني.',
    emergencyEn: 'Emergency now if the palpitations are happening now and do not go away, or they come with chest pain, shortness of breath, or feeling faint or fainting. And if these symptoms happened but have now stopped: ask for an urgent GP appointment or immediate medical help the same day — do not wait for a routine appointment.',
    introAr: 'الخفقان هو أن يصبح نبض قلبك ملحوظاً ومزعجاً: سريعاً جداً، أو غير منتظم مع نبضات ساقطة أو زائدة، أو ضرباً قوياً، أو رفرفة — قد تحسه بصدرك أو رقبتك أو حلقك، ويدوم ثوانٍ أو دقائق أو أطول. عادة غير مؤذٍ، لكن اطلب مساعدة إن تكرر أو رافقته أعراض أخرى.',
    introEn: 'Palpitations are when your heartbeat becomes more noticeable and feels uncomfortable or unusual — racing or beating very fast, irregular with skipped or extra beats (ectopic beats), pounding or thumping, or fluttering — felt in your chest, neck or throat, lasting seconds, minutes or longer. Usually harmless, but get help if you keep getting them or you also have other symptoms.',
    thinkingAr: [
      'مشكلة نظم قلب أو قلب نفسه أولاً عند وجود علامات الخطر: خفقان لا يزول أو مع ألم صدر/ضيق تنفس/إغماء — اضطراب نظم (أريثميا) أو مشاكل قلب أخرى كمرض صمامات، وتقييمها لا ينتظر.',
      'محفزات شائعة (الأغلب): جهد شديد، قلة نوم، توتر وقلق، أدوية (راجع النشرة)، كحول وكافيين ونيكوتين ومخدرات ترفيهية.',
      'حالات جسدية تسبب خفقاناً: فقر دم بنقص الحديد، فرط نشاط الغدة الدرقية — يبحث عنها الطبيب عندما يتكرر الخفقان بلا محفز واضح.',
      'مراحل طبيعية: الخفقان أحياناً علامة دخول سنّ اليأس، وبعض الناس يصابون به أثناء الحمل.',
    ],
    thinkingEn: [
      'A heart-rhythm or heart problem first when danger signs are present: palpitations that do not go away, or with chest pain, breathlessness, or fainting — an arrhythmia or other heart problems such as heart valve disease, whose assessment does not wait.',
      'Common triggers (the majority): strenuous exercise, lack of sleep, stress and anxiety, medicines (check the leaflet), alcohol, caffeine, nicotine and recreational drugs.',
      'Physical conditions that can cause palpitations: iron deficiency anaemia and an overactive thyroid (hyperthyroidism) — looked for when palpitations recur without a clear trigger.',
      'Natural stages: palpitations can sometimes be a sign of going through the menopause, and some people get them during pregnancy.',
    ],
    tests: [
      { nameAr: 'تخطيط القلب (ECG)', nameEn: 'Electrocardiogram (ECG)', whyAr: 'لصقات صغيرة على الجلد تقيس الإشارات الكهربائية من قلبك — الفحص الرئيسي لمعرفة سبب الخفقان، لأنه يلتقط اضطراب النظم إن كان حاصلاً أثناء التسجيل ويوجّه باقي الخطة.', whyEn: 'Small pads stuck to your skin check the electrical signals coming from your heart — the main test to help find out what the cause might be, because it captures a rhythm problem if it is happening during the recording and directs the rest of the plan.' },
      { nameAr: 'قصة الخفقان: مدته وتكراره ومحفزاته', nameEn: 'Palpitation history: duration, recurrence, triggers', whyAr: 'خفقان يتكرر أو يزداد أو يدوم أكثر من دقائق قليلة — معايير مراجعة طبيب رسمية؛ وربطه بجهد/كافيين/دواء/قلة نوم يفرّق المحفَّز العابر من النمط المحتاج تقييماً.', whyEn: 'Palpitations that keep coming back, happen more often, or last longer than a few minutes are official GP criteria; and linking them to exercise, caffeine, a medicine, or lack of sleep separates a passing trigger from a pattern needing assessment.' },
      { nameAr: 'مراجعة الأدوية ونشرة الدواء وحالاتك القلبية وتاريخ عائلتك', nameEn: 'Medicine-leaflet review, your heart conditions, and family history', whyAr: 'بعض الأدوية تسبب خفقاناً (تؤكده نشرتها)، وعندك حالة قلب أو تاريخ عائلي بمشاكل قلب فهذا بحد ذاته سبب لمراجعة الطبيب — ثلاثة أسئلة تغيّر مستوى الاهتمام المطلوب.', whyEn: 'Some medicines cause palpitations (their leaflet confirms it), and having a heart condition or a family history of heart problems is itself a reason to see a GP — three questions that change the required level of attention.' },
      { nameAr: 'إحالة لأخصائي قلب (كارديولوجي) لمزيد فحوص', nameEn: 'Referral to a heart specialist (cardiologist) for further tests', whyAr: 'عندما لا يحسم التخطيط والقصة السبب، أو يُشتبه بسبب قلبي — المختص يجري فحوصاً أعمق ويقرر العلاج، وهو المسار الرسمي عند NHS للحالات غير المحسومة.', whyEn: 'When the ECG and history do not settle the cause, or a heart cause is suspected — the specialist runs deeper tests and decides treatment; this is the official NHS path for unsettled cases.' },
    ],
    procedures: [
      { nameAr: 'غالباً لا علاج لازم — تجنّب المحفزات', nameEn: 'Often no treatment needed — avoid the triggers', whyAr: 'علاج الخفقان يعتمد على سببه وغالباً لا يحتاج علاجاً أصلاً؛ وتجنّب ما يثيره — توتر وتدخين وكافيين وكحول — يساعد عندما لا يكون سببه حالة صحية.', whyEn: 'Treatment depends on the cause, and palpitations often do not need to be treated; avoiding things that can trigger them — such as stress, smoking, caffeine and alcohol — can help if they are not caused by a health condition.' },
      { nameAr: 'أدوية أو إجراء لضبط نبض القلب — عند سبب قلبي', nameEn: 'Medicines or a procedure to control the heartbeat — for a heart cause', whyAr: 'إذا كان خفقانك سببه مشكلة قلب، قد تحتاج أدوية أو إجراء يساعد على ضبط نبض قلبك — قرار مختص بعد فحوصه، لا تجربة ذاتية.', whyEn: 'If your palpitations are caused by a heart problem, you may need medicines or a procedure to help control your heartbeat — a specialist decision after their tests, not self-experimentation.' },
      { nameAr: 'لا تقُد بنفسك عند الذهاب للطوارئ، وخذ أدويتك معك', nameEn: 'Do not drive yourself to emergency care; bring your medicines', whyAr: 'خفقان مع إغماء محتمل يجعل القيادة خطراً عليك وعلى غيرك؛ واصطحاب أدويتك يساعد فريق الطوارئ على ربط الخفقان بدواء أو حالة معروفة فوراً.', whyEn: 'Palpitations with possible fainting make driving a risk to you and others; bringing any medicines you take helps the emergency team link the palpitations to a medicine or known condition immediately.' },
    ],
    sourceName: 'NHS — Heart palpitations',
    sourceUrl: 'https://www.nhs.uk/symptoms/heart-palpitations/',
  },
  {
    id: 'pins-and-needles',
    nameAr: 'التنميل والوخز',
    nameEn: 'Pins and needles',
    patterns: ['تنميل', 'وخز', 'خدر', 'تنميل باليد', 'تنميل بالرجل', 'pins and needles', 'tingling', 'numbness'],
    emergencyAr: 'راجع طبيباً إذا: التنميل ثابت عندك، أو يعود ويتكرر، أو يدوم طويلاً — هذه معايير NHS الوحيدة هنا، لأن التنميل المؤقت من ضغط عابر يزول خلال دقائق. ولا تشخّص السبب بنفسك؛ إن كنت قلقاً راجع طبيباً.',
    emergencyEn: 'See a GP if: you constantly have pins and needles, it keeps coming back, or it lasts a long time — these are the only NHS criteria here, because temporary pins and needles from passing pressure stop within a few minutes. And do not self-diagnose; see a GP if you are worried.',
    introAr: 'التنميل إحساس بوخز أو خدر أو «إبر ودبابيس» — يحدث عندما ينقطع إمداد الدم عن الأعصاب، عادة عندما تجلس أو تنام على جزء من جسمك؛ يدوم دقائق قليلة فقط، ويزول عندما يزول الوزن عن الطرف ويعود الدم للأعصاب. شائع بالذراعين واليدين والساقين والقدمين، وكل الناس يصابون به.',
    introEn: 'Pins and needles feels like a pricking, tingling or numbness sensation. It happens when the blood supply to the nerves is cut off, usually when you sit or sleep on part of your body; it only lasts a few minutes, and stops when the weight is taken off the body part and the blood supply returns to the nerves. It is common in the arms, hands, legs and feet, and everyone can get it.',
    thinkingAr: [
      'ضغط عابر على العصب/الدم (الأشيع بكثير): نوم أو جلوس على الطرف — يزول خلال دقائق من إزالة الوزن، ولا يحتاج شيئاً.',
      'نمط سكري: تنميل ووخز مع ألم أو خدر باليدين والقدمين معاً — توزيع «قفاز وجورب» يفكر فيه الطبيب عند ثبات التنميل.',
      'نمط رينو: تنميل بأصابع اليدين أو القدمين تتغيّر ألوانها — يربط التنميل بالدورة الدموية الطرفية.',
      'نمط فرط تهوية: تنفس سريع جداً مع ارتجاف يدين وتنميل — يأتي بنوبات ويرتبط بالتنفس لا بالعصب نفسه.',
      'نمط عصب مضغوط/متضرر: ألم وتنميل يسافر من الظهر أسفل الساق للقدم (عرق النسا)، أو عصب محبوس بالظهر/الرقبة، أو ضرر عصب بعد إصابة أو مرض.',
      'أسباب طويلة الأمد أخرى: تصلب متعدد (تنميل بأجزاء مختلفة من الجسم)، علاجات كالكيميائي، أدوية معينة (أدوية إيدز، أدوية منع نوبات، بعض المضادات)، مواد سامة (رصاص/إشعاع)، غذاء فقير، أو كحول كثير.',
    ],
    thinkingEn: [
      'Passing pressure on the nerve/blood supply (by far the most common): sitting or sleeping on the limb — it stops within minutes of taking the weight off, and needs nothing.',
      'A diabetes pattern: pins and needles with pain or numbness in the hands and feet together — a "glove and stocking" distribution the doctor thinks of when it persists.',
      'A Raynaud\'s pattern: pins and needles in fingers or toes that change colour — linking the tingling to peripheral circulation.',
      'A hyperventilation pattern: breathing too quickly with trembling hands and pins and needles — it comes in episodes and is tied to breathing, not the nerve itself.',
      'A trapped or damaged nerve pattern: pain and pins and needles travelling from the back down the leg to the foot (sciatica), a trapped nerve in the back or neck, or nerve damage after an injury or illness.',
      'Other long-lasting causes: multiple sclerosis (pins and needles in different parts of the body), treatments such as chemotherapy, some medicines (HIV medicine, medicine to prevent seizures, some antibiotics), toxic substances such as lead or radiation, poor diet, or drinking too much alcohol.',
    ],
    tests: [
      { nameAr: 'مراجعة المدة والثبات والتكرار', nameEn: 'Duration, constancy, and recurrence review', whyAr: 'دقائق بعد جلوس على الطرف = عابر وطبيعي؛ أما الثابت أو العائد مراراً أو الطويل الأمد فهو معيار «راجع طبيباً» الرسمي — أول سؤال يفرّق بينهما.', whyEn: 'Minutes after sitting on the limb means passing and normal; constant, keeping coming back, or long-lasting is the official "see a GP" criterion — the first question separates the two.' },
      { nameAr: 'خريطة التوزيع: أين التنميل بالضبط؟', nameEn: 'Distribution mapping: exactly where is it?', whyAr: 'يدان وقدمان معاً، أصابع تتغيّر ألوانها، خطّ واحد من الظهر للقدم، أو أجزاء مختلفة من الجسم — جدول NHS نفسه مبني على التوزيع، وكل نمط يفتح مجموعة أسباب مختلفة.', whyEn: 'Hands and feet together, fingers or toes changing colour, one line from back to foot, or different parts of the body — the NHS table itself is built on distribution, and each pattern opens a different cause group.' },
      { nameAr: 'مراجعة الأعراض المرافقة (ألم/خدر، لون، تنفس سريع/ارتجاف)', nameEn: 'Companion-symptom review (pain/numbness, colour, fast breathing/trembling)', whyAr: 'المرافقات هي نصف الجدول: ألم وخدر مع تنميل يدي/قدمي، تغيّر لون أصابع، تنفس سريع وارتجاف يدين — بلا مرافقات يبقى الاحتمال الغالب ضغطاً عابراً.', whyEn: 'Companions are half the table: pain and numbness with hand/foot tingling, finger colour change, fast breathing and trembling hands — without companions, passing pressure stays the likely explanation.' },
      { nameAr: 'مراجعة التعرضات: أدوية وعلاجات وكحول وغذاء وإصابات', nameEn: 'Exposure review: medicines, treatments, alcohol, diet, injuries', whyAr: 'قائمة الأسباب الطويلة عند NHS تعرضية بمعظمها: كيميائي، أدوية محددة، سموم كالرصاص، غذاء فقير، كحول كثير، ضرر عصب بعد إصابة/مرض — سؤال التعرضات يختصر نصف القائمة.', whyEn: 'The NHS long-cause list is mostly exposures: chemotherapy, specific medicines, toxins such as lead, poor diet, too much alcohol, nerve damage after injury or illness — the exposure questions shortcut half the list.' },
    ],
    procedures: [
      { nameAr: 'إزالة الضغط وحرّك الطرف حتى يعود الدم', nameEn: 'Remove the pressure and move the limb until blood returns', whyAr: 'التنميل العابر يتوقف عندما يزول الوزن عن الجزء ويعود إمداد الدم للأعصاب — خلال دقائق عادة؛ لا دواء ولا فحص لازمان لهذه الصورة.', whyEn: 'Passing pins and needles stop when the weight is taken off the body part and your blood supply returns to the nerves — usually within a few minutes; no medicine or test is needed for this picture.' },
      { nameAr: 'موعد طبيب عند الثبات أو التكرار — العلاج حسب السبب', nameEn: 'A GP appointment when constant or recurring — treatment depends on the cause', whyAr: 'أي علاج قد تحتاجه للتنميل يعتمد على سببه؛ لهذا الخطوة هي التقييم لا دواء جاهز — والطبيب يبني على نمطك وتوزيعك وتعرضاتك.', whyEn: 'Any treatment you might need for pins and needles will depend on the cause; that is why the step is assessment, not a ready medicine — the doctor builds on your pattern, distribution, and exposures.' },
      { nameAr: 'لا تشخّص بنفسك — وراجع إن كنت قلقاً', nameEn: 'Do not self-diagnose — and see a GP if worried', whyAr: 'تنبيه NHS الصريح: الأعراض المرافقة قد تساعد على إيجاد السبب لكن التشخيص الذاتي مضلل هنا لأن نفس الإحساس يأتي من ضغط عابر ومن حالات مزمنة — القلق بحد ذاته سبب مشروع للمراجعة.', whyEn: 'The NHS explicit warning: other symptoms might help find the cause, but self-diagnosis misleads here because the same sensation comes from passing pressure and from chronic conditions — being worried is itself a valid reason to be seen.' },
    ],
    sourceName: 'NHS — Pins and needles',
    sourceUrl: 'https://www.nhs.uk/symptoms/pins-and-needles/',
  },
  {
    id: 'itchy-skin',
    nameAr: 'حكة الجلد والطفح',
    nameEn: 'Itchy skin',
    patterns: ['حكة', 'حكة بالجلد', 'طفح جلدي', 'طفح', 'بحك جلدي', 'itchy skin', 'itching', 'rash', 'skin rash'],
    emergencyAr: 'راجع طبيباً إذا الحكة: تؤثر على حياتك اليومية، أو لا تتحسن بالعناية الذاتية أو تعود وتتكرر، أو سببها طفح أو كتلة أو تورّم جديد يقلقك، أو على كل جسمك، أو شديدة، أو حدثت أثناء الحمل — وبالحمل تحديداً راجعي طبيباً أو قابلة حتى لو بدت بسيطة، فقد تكون أحياناً من حالة كبد تُدعى ركوداً صفراوياً داخل الكبد أثناء الحمل (ICP).',
    emergencyEn: 'See a GP if the itchy skin: is affecting your daily life, does not get better with self care or keeps coming back, is caused by a new rash, lump or swelling that you are worried about, is all over your body, is severe, or happens during pregnancy — and in pregnancy specifically, check with a GP or midwife even if it seems mild, because it can sometimes be caused by a liver condition called intrahepatic cholestasis of pregnancy (ICP).',
    introAr: 'حكة الجلد لا تكون عادة علامة على شيء خطير، ويمكنك علاجها بنفسك غالباً وتزول عادة بعد أسابيع قليلة. أحياناً سببها جلد جاف أو متشقق أو متهيّج. وNHS ينبّه: لا تشخّص نفسك بنفسك — راجع طبيباً إن كنت قلقاً.',
    introEn: 'Itchy skin is not usually a sign of anything serious. You can often treat it yourself and it will usually go away after a few weeks. Sometimes itching is caused by dry, cracked or irritated skin. And the NHS warns: do not try to diagnose yourself — see a GP if you are worried.',
    thinkingAr: [
      'أسباب أعمق تُستبعد بقائمة الطبيب: مشاكل غدة درقية أو كبد أو كلى (أقل شيوعاً)، وبالحمل ركود صفراوي داخل الكبد (ICP) — لهذا حكة الحمل تُراجَع دائماً حتى لو خفيفة.',
      'تفاعلات جلد مع حرارة أو حساسية: حساسية، شرى (خلايا النحل)، طفح حرّي (حرارة شائكة/دخنية) — حكة مع طفح بعد محفز واضح.',
      'حالات جلد طويلة الأمد: قشرة، إكزيما، صدفية — حكة متكررة بنمط جلدي معروف تحتاج إدارة مستمرة لا علاجاً لمرة.',
      'التهابات فطرية: قلاع (ثروش)، سعفة (تينيا)، قدم رياضي — توزيعات محددة ورطبة غالباً.',
      'طفيليات وحشرات تعيش على الجلد: جرب، قمل رأس، قمل عانة — حكة قد تنتقل للمخالطين وتحتاج علاجاً لهم أيضاً.',
      'مراحل طبيعية: حكة شائعة أثناء الحمل (راجع بند الخطر أعلاه)، وشائعة بعد سنّ اليأس وتتحسن مع الوقت عادة.',
    ],
    thinkingEn: [
      'Deeper causes excluded by the GP list: thyroid, liver or kidney problems (less commonly), and in pregnancy intrahepatic cholestasis of pregnancy (ICP) — which is why pregnancy itching is always checked, even if mild.',
      'Skin reactions to heat or something you are allergic to: allergies, hives, heat rash (prickly heat) — itching with a rash after a clear trigger.',
      'Long-term skin conditions: dandruff, eczema, psoriasis — recurring itching with a known skin pattern needing ongoing management, not a one-off cure.',
      'Fungal skin infections: thrush, ringworm, athlete\'s foot — often in specific, moist distributions.',
      'Parasites or insects living on the skin: scabies, head lice, pubic lice — itching that can spread to contacts, who may need treatment too.',
      'Natural stages: itchy skin is common during pregnancy (see the caution above), and common after the menopause, when it usually gets better over time.',
    ],
    tests: [
      { nameAr: 'فحص الجلد وسؤال الأعراض عند الطبيب', nameEn: 'Skin examination and symptom questions at the GP', whyAr: 'الطبيب ينظر لجلدك ويسألك عن أعراضك — وجود طفح أو تورّم مرافق أو توزيع الحكة هو ما يوجّه بين مجموعات الأسباب الخمس، وهو خطوة التقييم الأولى الرسمية.', whyEn: 'The GP will look at your skin and ask about your symptoms — an accompanying rash or swelling and the itch\'s distribution are what point between the five cause groups; this is the official first assessment step.' },
      { nameAr: 'تحليل دم — قد يساعد على إيجاد السبب', nameEn: 'A blood test — it may help find the cause', whyAr: 'عندما لا يفسّر الجلد وحده الحكة، الطبيب قد يرتّب تحليل دم يبحث عن أسباب داخلية (كغدة وكبد وكلى) — فحص واحد يفتح أو يقفل اتجاه الأسباب الأعمق.', whyEn: 'When the skin alone does not explain the itching, the GP might arrange a blood test looking for internal causes (such as thyroid, liver or kidney) — one test that opens or closes the deeper-causes direction.' },
      { nameAr: 'فحص معايير الطبيب الستة', nameEn: 'The six GP-criteria screen', whyAr: 'تأثير على الحياة اليومية، فشل عناية ذاتية أو تكرار، طفح/كتلة/تورّم جديد مقلق، حكة على كل الجسم، شدة، أو حمل — أي معيار ينقلك من عناية ذاتية إلى موعد، وبعضها (الحمل) لسبب خطير محدد.', whyEn: 'Affecting daily life, self-care failure or recurrence, a worrying new rash, lump or swelling, itching all over the body, severity, or pregnancy — any criterion moves you from self-care to an appointment, and one of them (pregnancy) is for a specific serious reason.' },
      { nameAr: 'فرز الصيدلي: مكان الحكة وأعراض مرافقة', nameEn: 'Pharmacist triage: where it itches, and other symptoms', whyAr: 'أخبر الصيدلي أين جلدك يحكّ وهل عندك أعراض أخرى — بذلك يختار أفضل منتج لك ويقول لك ما تفعله بنفسك وهل تحتاج طبيباً أصلاً.', whyEn: 'Tell the pharmacist where your skin is itchy and if you have any other symptoms — with that they choose the best products for you and tell you what you can do yourself and whether you need to see a GP.' },
    ],
    procedures: [
      { nameAr: 'عناية ذاتية: ربّت لا تخدش، وبرودة، ومرطّب بلا عطر', nameEn: 'Self-care: pat don\'t scratch, coolness, and unperfumed moisturiser', whyAr: 'ربّت أو انقر جلدك بدل خدشه، وضع شيئاً بارداً كمنشفة رطبة، وحمامات/دوش باردة أو فاترة، ومرطّب أو مطرٍّ بلا عطر بانتظام، وأظافر نظيفة قصيرة ومصقولة، وملابس قطن/حرير واسعة، وسائل غسيل لجلد حساس — وتجنّب ملابس ضيقة أو صوف/أقمشة صناعية، ووقتاً طويلاً بالحمام، وصابون/مزيلات/مرطبات معطّرة. هذه تخفف الحكة وتمنع عودتها وضرر الجلد من الخدش.', whyEn: 'Pat or tap your skin instead of scratching it, hold something cool on it like a damp towel, have cool or lukewarm baths or showers, use an unperfumed moisturiser or emollient regularly, keep your nails clean, short and smooth, wear loose cotton or silk clothing, and use laundry liquid or powder for sensitive skin — and avoid tight clothes or wool or synthetic fabrics, long times in the bath or shower, and perfumed soaps, deodorants or moisturisers. These ease itching, help stop it returning, and avoid skin damage from scratching.' },
      { nameAr: 'منتجات صيدلية: مضادات هيستامين وكريمات منعشة', nameEn: 'Pharmacy products: antihistamines and cooling creams', whyAr: 'الصيدلي يخبرك بأفضل المنتجات: أدوية تُدعى مضادات هيستامين قد تساعد ببعض أسباب الحكة، ولوشنات وكريمات ككريمات المنثول التي تساعد بتبريد الجلد.', whyEn: 'A pharmacist can tell you the best products for itchy skin: medicines called antihistamines may help with some causes of itching, and lotions and creams such as menthol creams help by cooling the skin.' },
      { nameAr: 'علاج طبيب: وصفات بحسب السبب، وربما إحالة جلدية', nameEn: 'GP treatment: prescriptions by cause, possibly a dermatology referral', whyAr: 'الطبيب قد يصف كريمات أو لوشنات أو أقراص بحسب سبب حكتك، وقد يحيلك لطبيب مختص بمشاكل الجلد (ديرماتولوجي) عندما يحتاج السبب أو العلاجُ تخصصاً.', whyEn: 'A GP might prescribe creams, lotions or tablets depending on what is causing the itching, and may refer you to a doctor who specialises in skin problems (a dermatologist) when the cause or treatment needs a specialist.' },
    ],
    sourceName: 'NHS — Itchy skin',
    sourceUrl: 'https://www.nhs.uk/symptoms/itchy-skin/',
  },
  {
    id: 'tiredness',
    nameAr: 'التعب والإرهاق',
    nameEn: 'Tiredness and fatigue',
    patterns: ['تعب', 'إرهاق', 'تعبان', 'تعب دائم', 'tiredness', 'fatigue', 'tired all the time'],
    emergencyAr: 'راجع طبيباً إذا: تشعر بالتعب منذ أسابيع قليلة ولا تعرف لماذا، أو تعبك يؤثر على حياتك اليومية، أو تشعر بالتعب مع أعراض أخرى كفقدان وزن أو تغيّرات مزاج، أو قيل لك إنك تصدر أصوات لهاث أو شخير أو اختناق أثناء نومك — فالتعب الطويل بلا تفسير ولا تحسّن قد يكون علامة حالة طبية.',
    emergencyEn: 'See a GP if: you have been feeling tired for a few weeks and are not sure why, your tiredness affects your daily life, or you feel tired and have other symptoms such as weight loss or mood changes, or you have been told you are making gasping, snorting or choking noises when you are asleep — because unexplained tiredness going on for a while and not getting better may be a sign of a medical condition.',
    introAr: 'طبيعي أن تشعر بالتعب أحياناً. لكن إن كنت متعباً طوال الوقت ولا تعرف لماذا، فقد يكون علامة مشكلة. أعراضك قد تعطيك فكرة عن السبب — لكن لا تشخّص نفسك بنفسك؛ راجع طبيباً إن كنت قلقاً.',
    introEn: 'It is normal to feel tired sometimes. But if you are tired all the time and do not know why, it could be a sign of a problem. Your symptoms might give you an idea of what is causing your tiredness or fatigue — but do not self-diagnose; see a GP if you are worried.',
    thinkingAr: [
      'أسباب طبية يبحث عنها الطبيب أولاً عند تعب طويل بلا تفسير: فقر دم بنقص الحديد (قلة طاقة، خفقان ملحوظ، ضيق تنفس، جلد شاحب)، سكري (تعب شديد، عطش شديد، تبوّل أكثر خاصة ليلاً، فقدان وزن)، فرط نشاط درقية (تعب دائم، صعوبة بقاء ساكناً، عصبية وقلق وتهيّج، ضعف عضلات) — وهي ما تُفحص بتحاليل الدم.',
      'انقطاع نفس نومي: تعب نهاري لأنك تستيقظ ليلاً، مع أصوات لهاث/شخير/اختناق نومية وشخير عالٍ — يفسّر تعباً رغم ساعات نوم كافية ظاهرياً.',
      'نوم ونمط حياة (الأشيع): لا نوم كافٍ أو صعوبة نوم (أرق)، غذاء غير صحي وقلة تمرين.',
      'نفسية ومرحلية: توتر واكتئاب وتحديات حياة (كفقدان عزيز أو رعاية مولود جديد)، وتغيّرات هرمونية (بلوغ، حمل، سنّ يأس).',
      'أمراض وعلاجات: بعض الأمراض كالحمى الغدية (مونو) وكوفيد-19، وبعض العلاجات والأدوية كالكيميائي التي تسبب نعاساً لفترة.',
      'إرهاق مزمن شديد (ME/CFS): إرهاق شديد لثلاثة أشهر على الأقل يجعل النشاطات اليومية صعبة جداً، مع مشاكل تفكير وذاكرة وتركيز وأعراض شبيهة بالإنفلونزا.',
    ],
    thinkingEn: [
      'Medical causes the doctor looks for first in long unexplained tiredness: iron deficiency anaemia (lack of energy, noticeable heartbeats, shortness of breath, pale skin), diabetes (very tired, feeling very thirsty, peeing more often particularly at night, weight loss), and an overactive thyroid (tired all the time, finding it hard to stay still, feeling nervous, anxious and irritable, muscle weakness) — the ones checked with blood tests.',
      'Sleep apnoea: tired during the day because of waking up at night, with gasping, snorting or choking noises at night and loud snoring — it explains tiredness despite apparently enough sleep hours.',
      'Sleep and lifestyle (the most common): not getting enough sleep or finding it hard to get to sleep (insomnia), an unhealthy diet and not getting much exercise.',
      'Psychological and stage-related: stress, depression and dealing with life challenges such as bereavement or looking after a new baby, and hormonal changes (puberty, pregnancy, the menopause).',
      'Illnesses and treatments: some illnesses like glandular fever and COVID-19, and some medical treatments and medicines like chemotherapy, which can cause drowsiness for a while.',
      'ME/CFS: extreme fatigue for at least 3 months, making it very hard to do daily activities, with problems with thinking, memory and concentration and flu-like symptoms.',
    ],
    tests: [
      { nameAr: 'تحاليل دم (فقر دم، سكري، فرط درقية)', nameEn: 'Blood tests (anaemia, diabetes, hyperthyroidism)', whyAr: 'قد تحتاج فحوصاً كتحاليل دم للتحقق من فقر الدم أو السكري أو فرط نشاط الدرقية — ثلاثتها أسباب طبية قابلة للعلاج تختفي خلف تعب عام، وتسميتها صريحة عند NHS.', whyEn: 'You may need tests such as blood tests to check for anaemia, diabetes or hyperthyroidism — all three are treatable medical causes hiding behind general tiredness, explicitly named by the NHS.' },
      { nameAr: 'مطابقة نمط الأعراض المرافقة (جدول الحالات الخمس)', nameEn: 'Companion-symptom pattern matching (the five-condition table)', whyAr: 'خفقان وشحوب وضيق نفس، أو عطش وتبوّل ليلي وفقدان وزن، أو عصبية وضعف عضلات، أو أصوات نوم وشخير، أو إرهاق 3 أشهر مع ضباب تفكير — كل نمط يوجّه لحالة من الخمس قبل أي فحص.', whyEn: 'Palpitations with pale skin and breathlessness, thirst with night-time peeing and weight loss, nervousness with muscle weakness, sleep noises with snoring, or 3 months of extreme fatigue with thinking problems — each pattern points to one of the five conditions before any test.' },
      { nameAr: 'مراجعة النوم: ساعات وثبات مواعيد وأرق وشخير', nameEn: 'Sleep review: hours, regular times, insomnia, snoring', whyAr: 'قلة النوم والأرق أشيع سببين، والشخير مع أصوات لهاث/اختناق يرفع انقطاع النفس النومي — المراجعة تفرّق تعب «نوم سيئ» من تعب «مرض مخفي».', whyEn: 'Not enough sleep and insomnia are the most common causes, and snoring with gasping or choking noises raises sleep apnoea — the review separates "poor sleep" tiredness from "hidden illness" tiredness.' },
      { nameAr: 'فحص معايير الطبيب الثلاثة', nameEn: 'The three GP-criteria screen', whyAr: 'تعب أسابيع بلا سبب معلوم، أثر على الحياة اليومية، أو أعراض مرافقة (فقدان وزن، تغيّرات مزاج، أصوات نوم) — أي واحد يجعل التقييم واجباً ولو بدا التعب «عادياً».', whyEn: 'Tired for a few weeks without knowing why, tiredness affecting your daily life, or accompanying symptoms (weight loss, mood changes, sleep noises) — any one makes assessment due even if the tiredness seems "ordinary".' },
    ],
    procedures: [
      { nameAr: 'عادات نوم: مواعيد ثابتة و6–9 ساعات واسترخاء قبل النوم', nameEn: 'Sleep habits: regular times, 6–9 hours, and winding down', whyAr: 'اثبت على مواعيد نوم نفسها واستهدف 6–9 ساعات، واسترخِ قبل موعد نومك بساعتين (قراءة أو موسيقى أو بودكاست)، وغرفة نوم مريحة (لا ساطعة ولا صاخبة ولا حارة) — ولا أكل/كافيين/تمرين بالساعتين قبل النوم، ولا هواتف/شاشات بالساعة قبل النوم، ولا تدخين، ولا كحول كثير.', whyEn: 'Stick to the same sleep times and aim for 6 to 9 hours of sleep, relax a couple of hours before your sleep time (read, or listen to music or a podcast), and have a relaxing sleeping area (not too bright, noisy or warm) — and do not eat, have caffeine or exercise in the couple of hours before sleep, do not use smartphones or screens in the hour before sleep, do not smoke, and do not drink too much alcohol.' },
      { nameAr: 'غذاء صحي وتمرين منتظم', nameEn: 'A healthy diet and regular exercise', whyAr: 'غذاء صحي وتمرين بانتظام — إجراء NHS الأول للتعب، يعالجان معاً عامل «نمط الحياة غير الصحي» وهو من أشيع الأسباب، ويحسّنان النوم نفسه.', whyEn: 'A healthy diet and regular exercise — the NHS first step for tiredness; together they address the "unhealthy lifestyle" factor, one of the most common causes, and improve sleep itself.' },
      { nameAr: 'علاجات بحسب السبب + إحالة مختص عند غموض السبب', nameEn: 'Cause-based treatments, and a specialist referral if the cause is unknown', whyAr: 'علاج التعب يعتمد على سببه: علاجات كلامية كالعلاج السلوكي المعرفي (CBT)، ونصائح لنوم أفضل، ونصائح استرخاء أو تغيير نمط حياة؛ وإن لم يعرف الطبيب السبب فقد يحيلك لمختص — لا يوجد دواء واحد «للتعب» بلا تشخيص.', whyEn: 'Treatment for tiredness or fatigue depends on the cause: talking therapies such as cognitive behavioural therapy (CBT), advice on how to get better sleep, and advice on how to relax or change your lifestyle; and a GP may refer you to a specialist if they do not know the cause — there is no single "tiredness medicine" without a diagnosis.' },
    ],
    sourceName: 'NHS — Tiredness and fatigue',
    sourceUrl: 'https://www.nhs.uk/symptoms/tiredness-and-fatigue/',
  },
];

const NEGATION_BEFORE = ['لا يوجد', 'ما عندي', 'بدون', 'لا أعاني', 'لا اعاني', 'ليس لدي', 'ما في', 'لايوجد', 'لا اشعر', 'لا أشعر', 'دون'];

const NEGATION_BEFORE_NORM = NEGATION_BEFORE.map((n) => normalizeArabic(n));
const GUIDES_NORM = SYMPTOM_GUIDES.map((g) => ({ guide: g, patterns: g.patterns.map((pt) => normalizeArabic(pt)) }));

export function findSymptomGuide(text: string): SymptomGuide | null {
  if (!text) return null;
  const norm = normalizeArabic(text);
  const lower = text.toLowerCase();
  for (const { guide, patterns } of GUIDES_NORM) {
    for (const p of patterns) {
      const isArabic = /[؀-ۿ]/.test(p);
      const hay = isArabic ? norm : lower;
      const needle = isArabic ? p : p.toLowerCase();
      const idx = hay.indexOf(needle);
      if (idx === -1) continue;
      const before = hay.slice(Math.max(0, idx - 16), idx);
      if (NEGATION_BEFORE_NORM.some((n) => before.includes(n))) continue;
      return guide;
    }
  }
  return null;
}

const SYMPTOM_INTENT = ['أعراض', 'اعراض', 'بعاني', 'أعاني من', 'اعاني من', 'عندي عرض', 'مما أعاني', 'مم أعاني', 'symptom', 'suffering from', 'ماذا قد يحدث في المشفى', 'شو ممكن يصير بالمشفى'];

export function hasSymptomIntent(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  const norm = normalizeArabic(text);
  return SYMPTOM_INTENT.some((w) => text.includes(w) || lower.includes(w) || norm.includes(normalizeArabic(w)));
}

export function composeSymptomGuide(guide: SymptomGuide, language: string): string {
  const ar = language === 'ar';
  const L: string[] = [];
  L.push(`🚨 ${ar ? guide.emergencyAr : guide.emergencyEn}`);
  L.push('');
  L.push(ar ? `عن «${guide.nameAr}» — كيف يُقيَّم في المشفى؟` : `About "${guide.nameEn}" — how is it assessed in hospital?`);
  L.push(ar ? guide.introAr : guide.introEn);
  L.push('');
  L.push(ar
    ? 'كيف يفكّر الفريق؟ هذه فئات الأسباب التي يعمل عليها — من الأخطر أولاً، لاستبعادها أو إثباتها بالفحوص. هي ليست تشخيصاً لحالتك:'
    : 'How does the team think? These are the categories of causes they work through — most dangerous first, to rule each out or prove it with tests. This is not a diagnosis of your case:');
  for (const t of (ar ? guide.thinkingAr : guide.thinkingEn)) L.push(`• ${t}`);
  L.push('');
  L.push(ar ? 'الفحوص التي قد تُطلب — ولماذا:' : 'Tests that may be ordered — and why:');
  for (const t of guide.tests) L.push(`• ${ar ? t.nameAr : t.nameEn}: ${ar ? t.whyAr : t.whyEn}`);
  L.push('');
  L.push(ar ? 'إجراءات قد تُعمل — وماذا يستفيد الفريق منها:' : 'Procedures that may be done — and what the team gains from each:');
  for (const pr of guide.procedures) L.push(`• ${ar ? pr.nameAr : pr.nameEn}: ${ar ? pr.whyAr : pr.whyEn}`);
  L.push('');
  L.push(ar
    ? `ملاحظة: هذا شرح تثقيفي عام عن كيفية تعامل الفرق الطبية مع هذا العرض — التشخيص الفعلي يحتاج فحصاً سريرياً ونتائج فحوصك، وهو عند فريقك المعالج وحده. (المصدر: ${guide.sourceName} — ${guide.sourceUrl})`
    : `Note: this is general education about how medical teams assess this symptom — an actual diagnosis needs a clinical examination and your own test results, and belongs to your treating team alone. (Source: ${guide.sourceName} — ${guide.sourceUrl})`);
  return L.join('\n');
}

export function composeSymptomChooser(language: string): string {
  const ar = language === 'ar';
  const names = SYMPTOM_GUIDES.map((g) => (ar ? g.nameAr : g.nameEn)).join('، ');
  return ar
    ? `أخبرني بالعرض الرئيسي الذي تعاني منه، وسأشرح لك كيف يُقيَّمه الفريق في المشفى: ما فئات الأسباب التي يعمل عليها من الأخطر أولاً، وما الفحوص التي قد تُطلب ولماذا، وما الإجراءات التي قد تُعمل وماذا يستفيد الفريق منها. الأعراض المشروحة حالياً: ${names}. اكتب اسم العرض أو صِفه بكلماتك — وإذا كان العرض حاصلاً الآن وبشدة، لا تنتظر الشرح: اطلب المساعدة الطبية فوراً.`
    : `Tell me the main symptom you are suffering from, and I will explain how the hospital team assesses it: the categories of causes they work through, most dangerous first, which tests may be ordered and why, and which procedures may be done and what the team gains from each. Symptoms currently explained: ${names}. Write the symptom's name or describe it in your words — and if the symptom is happening now and severely, do not wait for the explanation: seek medical help immediately.`;
}
