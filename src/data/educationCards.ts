import { EducationCardData } from '../types';

export const EDUCATION_CARDS: EducationCardData[] = [
  {
    id: 'card-1',
    titleAr: 'كيف أستعد لدخول المستشفى المخطط له؟',
    titleEn: 'How do I prepare for a planned hospital admission?',
    sentencesAr: [
      'جهز قائمة كاملة ومحدثة بجميع أدويتك الحالية مع جرعاتها وأوقات تناولها بما فيها الفيتامينات والمكملات.',
      'احرص على إحضار وثائق إثبات الهوية والتأمين الصحي وسجلات الحساسية المعروفة.',
      'اطلب من فريقك الطبي تعليمات واضحة وفردية بخصوص الصيام وتناول الأدوية في صباح يوم العملية ولا توقف أي دواء بمفردك.',
      'رتب مسبقاً وسيلة انتقال آمنة للعودة إلى المنزل بعد الخروج ومساعدة منزلية إن دعت الحاجة.'
    ],
    sentencesEn: [
      'Prepare an up-to-date list of all current medications, exact dosages, and schedules, including supplements.',
      'Bring your identification, insurance paperwork, and a written record of any known drug or material allergies.',
      'Ask your clinical care team for individualized fasting and medication instructions before surgery, and never stop medicines without their advice.',
      'Arrange safe transportation home in advance and check whether you will need assistance with daily tasks during initial recovery.'
    ],
    isVerifiedSource: false,
    unverifiedNoteAr: 'لم يتم العثور على مصدر طبي موثوق ومباشر لهذا السؤال.',
    unverifiedNoteEn: 'A suitable, direct verified medical source was not found for this question.',
    chatTopicAr: 'ما هي أهم الإرشادات العملية للاستعداد لدخول المستشفى؟',
    chatTopicEn: 'What are the most important practical steps to prepare for a hospital admission?'
  },
  {
    id: 'card-2',
    titleAr: 'أثناء إقامتك: افهم وشارك في خطة رعايتك',
    titleEn: 'During your stay: understand and take part in your care',
    sentencesAr: [
      'من حقك تماماً أن تسأل عن الغرض من كل دواء جديد أو فحص دم أو أشعة يطلبها الفريق الطبي.',
      'دوّن أسئلتك وملاحظاتك أولاً بأول في دفتر ملاحظات حتى تطرحها في جولة الأطباء اليومية.',
      'إذا شعرت بأي عرض غير معتاد أو ألم جديد أو ضيق، أبلغ ممرضتك فوراً ولا تنتظر الجولة المعتادة.',
      'تعرف على الطبيب والممرض المسؤولين مباشرة عن رعايتك خلال الوردية الحالية لتسهيل التواصل المستمر.'
    ],
    sentencesEn: [
      'You have the full right to understand the clinical purpose behind each new medication, lab test, or scan requested.',
      'Write down questions as they arise during the day so you are ready when the medical team conducts ward rounds.',
      'Promptly report new, changing, or worrying symptoms to your bedside nurse instead of waiting for scheduled visits.',
      'Identify the lead nurse and attending doctor caring for you during each shift to maintain seamless communication.'
    ],
    isVerifiedSource: false,
    unverifiedNoteAr: 'لم يتم العثور على مصدر طبي موثوق ومباشر لهذا السؤال.',
    unverifiedNoteEn: 'A suitable, direct verified medical source was not found for this question.',
    chatTopicAr: 'كيف أشارك بفعالية في قرارات رعايتي أثناء وجودي في المستشفى؟',
    chatTopicEn: 'How can I actively participate in my care plan during my hospital stay?'
  },
  {
    id: 'card-3',
    titleAr: 'افهم خطة خروجك قبل مغادرة المستشفى',
    titleEn: 'Understand your discharge plan before you leave',
    sentencesAr: [
      'تأكد من استلام ملخص خروج ورقي يوضح سبب تنويمك والعلاجات التي تلقيتها.',
      'راجع قائمة أدويتك الجديدة وتأكد من معرفة الفارق بينها وبين أدويتك القديمة قبل التنويم.',
      'اسأل عن مواعيد المتابعة القادمة، والفحوصات المعلقة التي لا تزال نتائجها قيد الإنجاز.',
      'اطلب معرفة من يجب الاتصال به في المستشفى إذا واجهتك أي استفسارات أو أعراض بعد العودة إلى المنزل.'
    ],
    sentencesEn: [
      'Make sure to receive a written discharge summary explaining your diagnosis, hospital course, and interventions received.',
      'Review your post-discharge medication list to identify new prescriptions, discontinued drugs, and schedule adjustments.',
      'Confirm upcoming outpatient follow-up appointments and verify whether any pending laboratory results remain outstanding.',
      'Obtain contact details for your discharge coordinator or ward advice line should non-emergency questions arise.'
    ],
    isVerifiedSource: false,
    unverifiedNoteAr: 'لم يتم العثور على مصدر طبي موثوق ومباشر لهذا السؤال.',
    unverifiedNoteEn: 'A suitable, direct verified medical source was not found for this question.',
    chatTopicAr: 'ما هي أهم الأسئلة التي يجب أن أطرحها قبل الخروج من المستشفى؟',
    chatTopicEn: 'What questions should I ask my care team before being discharged?'
  },
  {
    id: 'card-4',
    titleAr: 'التعافي بعد الخروج: الضعف والإرهاق الطبيعي',
    titleEn: 'Recovery after hospital: managing weakness and fatigue',
    sentencesAr: [
      'الشعور بالضعف العام وقلة النشاط أمر شائع وطبيعي بعد الإقامة في المستشفى نتيجة ملازمة الفراش والتعافي المناعي.',
      'استعد نشاطك بالتدريج عبر المشي الخفيف داخل الغرفة مع أخذ فترات راحة منتظمة وتجنب الإجهاد الشديد.',
      'احرص على شرب السوائل الكافية وتناول وجبات مغذية متوازنة لدعم ترميم الأنسجة.',
      'إذا كان الضعف يزداد بشكل حاد أو مصحوباً بضيق نفس أو دوخة مستمرة، اتصل بفريقك الطبي لتقييم الحالة.'
    ],
    sentencesEn: [
      'Experiencing generalized fatigue and reduced endurance is common after hospitalization due to bed rest and systemic recovery.',
      'Rebuild your physical stamina gradually through short walks indoors, pacing your daily activities, and resting frequently.',
      'Maintain adequate hydration and balanced nutritional intake to fuel tissue repair and immune recuperation.',
      'If weakness worsens abruptly, prevents safe mobility, or is accompanied by breathlessness or dizziness, seek clinical review.'
    ],
    isVerifiedSource: false,
    unverifiedNoteAr: 'لم يتم العثور على مصدر طبي موثوق ومباشر لهذا السؤال.',
    unverifiedNoteEn: 'A suitable, direct verified medical source was not found for this question.',
    chatTopicAr: 'كيف أتعامل مع الشعور بالإرهاق بعد الخروج من المستشفى؟',
    chatTopicEn: 'How can I safely manage post-hospital weakness and fatigue at home?'
  },
  {
    id: 'card-5',
    titleAr: 'أمان الأدوية بعد الخروج من المستشفى',
    titleEn: 'Medication safety after hospital discharge',
    sentencesAr: [
      'تناول الأدوية بالجرعات والأوقات المحددة تماماً ولا توقف أي مضاد حيوي أو علاج قبل إكمال المدة الموصوفة دون استشارة الطبيب.',
      'استخدم منظم حبوب أسبوعي أو سجلاً يومياً لتتبع الجرعات وتجنب نسيانها أو تكرارها عن طريق الخطأ.',
      'راجع الصيدلي أو الطبيب عند ملاحظة أي أعراض جانبية كالغثيان أو الطفح الجلدي قبل اتخاذ أي قرار بالتوقف.',
      'تخلص بأمان من الأدوية التي طلب منك الفريق الطبي التوقف عنها لمنع الخلط بينها وبين الأدوية الحالية.'
    ],
    sentencesEn: [
      'Take all discharge medications strictly as prescribed; complete full courses of antibiotics unless instructed otherwise by a clinician.',
      'Use a daily pill organizer or checklist to record taken doses and avoid accidental missed or duplicated medicines.',
      'Consult your pharmacist or physician if you notice unexpected side effects such as nausea or skin rashes before altering doses.',
      'Safely discard or separate discontinued medications to avoid accidentally resuming outdated treatments.'
    ],
    isVerifiedSource: false,
    unverifiedNoteAr: 'لم يتم العثور على مصدر طبي موثوق ومباشر لهذا السؤال.',
    unverifiedNoteEn: 'A suitable, direct verified medical source was not found for this question.',
    chatTopicAr: 'كيف أنظم أدويتي الجديدة بعد الخروج وأتجنب التداخلات الدوائية؟',
    chatTopicEn: 'How do I organize my discharge medications safely and prevent errors?'
  },
  {
    id: 'card-6',
    titleAr: 'فحص السكري والسكري الخفي (HbA1c)',
    titleEn: 'Screening for Prediabetes and Type 2 Diabetes (HbA1c)',
    sentencesAr: [
      'توصي فرقة الخدمات الوقائية الأمريكية (USPSTF 2021) بفحص السكري ومقدمات السكري للبالغين الذين تتراوح أعمارهم بين 35 و 70 عاماً والذين يعانون من زيادة الوزن أو السمنة دون أعراض.',
      'يقيس فحص السكر التراكمي (HbA1c) متوسط نسبة السكر في الدم خلال الشهرين إلى الثلاثة أشهر الماضية عبر عينة دم بسيطة.',
      'النتيجة الطبيعية أقل من 5.7%، بينما تتراوح مرحلة مقدمات السكري بين 5.7% و 6.4%، وتعتبر النتيجة 6.5% أو أعلى مؤشراً يستدعي تأكيد تشخيص السكري سريرياً.',
      'الفحص يساعد في اكتشاف التغيرات مبكراً حيث يمكن للحمية والنشاط البدني منع تطور السكري أو تأخيره.'
    ],
    sentencesEn: [
      'The USPSTF (2021) recommends screening for prediabetes and type 2 diabetes in asymptomatic, nonpregnant adults aged 35 to 70 years who have overweight or obesity.',
      'The hemoglobin A1c blood test measures average blood glucose control over the preceding 2 to 3 months.',
      'An HbA1c below 5.7% is considered normal, 5.7% to 6.4% indicates prediabetes, and 6.5% or greater suggests diabetes requiring clinical verification.',
      'Early detection allows timely lifestyle interventions and medical support to prevent or delay clinical diabetes progression.'
    ],
    sourceTitle: 'USPSTF: Screening for Prediabetes and Type 2 Diabetes (2021)',
    sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes',
    isVerifiedSource: true,
    chatTopicAr: 'ماذا تعني نتيجة فحص السكر التراكمي HbA1c وما هي الخطوات التالية؟',
    chatTopicEn: 'What does my HbA1c screening result mean and what are the next steps?'
  },
  {
    id: 'card-7',
    titleAr: 'فحص ضغط الدم الدوري للبالغين',
    titleEn: 'Blood Pressure Screening in Adults',
    sentencesAr: [
      'توصي فرقة الخدمات الوقائية الأمريكية (USPSTF 2021) بإجراء فحص دوري لضغط الدم لجميع البالغين من سن 18 عاماً فأكثر الذين ليس لديهم تشخيص سابق بارتفاع الضغط.',
      'القراءة المفردة المرتفعة في العيادة لا تؤكد وحدها الإصابة بفرط ضغط الدم، حيث يوصى بإجراء قياسات تأكيدية خارج العيادة (كالمنزل) قبل بدء العلاج.',
      'يعتبر ضغط الدم طبيعياً عندما يكون أقل من 120/80 ملم زئبق.',
      'ارتفاع ضغط الدم غالباً ما يكون بدون أعراض واضحة، لذا فإن الفحص الدوري هو الوسيلة الموثوقة للاكتشاف المبكر وحماية القلب والدماغ والكلى.'
    ],
    sentencesEn: [
      'The USPSTF (2021) recommends blood pressure screening for all adults aged 18 years and older without known hypertension.',
      'A single elevated in-office reading does not by itself establish a diagnosis of hypertension; confirmatory measurements outside the clinic setting are recommended before initiating therapy.',
      'Normal blood pressure is generally defined as systolic under 120 mmHg and diastolic under 80 mmHg.',
      'Because high blood pressure usually presents without symptoms, routine screening is vital for cardiovascular and renal protection.'
    ],
    sourceTitle: 'USPSTF: Hypertension in Adults: Screening (2021)',
    sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening',
    isVerifiedSource: true,
    chatTopicAr: 'كيف يتم قياس وتأكيد ضغط الدم خارج العيادة بشكل صحيح؟',
    chatTopicEn: 'How is blood pressure accurately measured and confirmed outside the clinic?'
  },
  {
    id: 'card-8',
    titleAr: 'فحص سرطان الثدي (الماموجرام الدوري)',
    titleEn: 'Breast Cancer Screening (Mammography)',
    sentencesAr: [
      'توصي فرقة الخدمات الوقائية الأمريكية (USPSTF 2024) بإجراء فحص الماموجرام الدوري كل سنتين للنساء والأشخاص المعنيين من سن 40 إلى 74 عاماً ذوي الخطورة المتوسطة.',
      'الماموجرام هو تصوير بالأشعة السينية بجرعة منخفضة يمكنه اكتشاف الكتل قبل الشعور بها بسنوات.',
      'إذا تم إجراء ماموجرام خلال العامين الماضيين وكانت النتيجة طبيعية، فعادة لا يكون الفحص الروتيني مستحقاً حالياً وفق هذه التوصية.',
      'لا تنطبق هذه التوصية العامة ذات الخطورة المتوسطة على من لديهم تاريخ شخصي أو متلازمات جينية عالية الخطورة حيث يحتاج هؤلاء لتقييم متخصص فردي.'
    ],
    sentencesEn: [
      'The USPSTF (2024) recommends biennial screening mammography for women and other people to whom the recommendation applies, aged 40 to 74 years at average risk.',
      'Screening mammograms use low-dose X-rays to detect tissue alterations years before they can be felt physically.',
      'If you have completed a routine mammogram within the past two years with normal results, the next routine screen may not yet be due under this rule.',
      'This average-risk guideline does not apply to individuals with prior breast cancer, genetic syndromes, or past high-dose chest radiation, who require individualized protocols.'
    ],
    sourceTitle: 'USPSTF: Breast Cancer: Screening (2024)',
    sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening',
    isVerifiedSource: true,
    chatTopicAr: 'ماذا تتوقع السيدة عند إجراء فحص الماموجرام وما هي أهميته؟',
    chatTopicEn: 'What should one expect during a routine screening mammogram?'
  },
  {
    id: 'card-9',
    titleAr: 'فحص سرطان القولون والمستقيم (FIT وتنظير القولون)',
    titleEn: 'Colorectal Cancer Screening (FIT and Colonoscopy)',
    sentencesAr: [
      'توصي فرقة الخدمات الوقائية الأمريكية (USPSTF 2021) بفحص سرطان القولون والمستقيم للبالغين ذوي الخطورة المتوسطة من سن 45 إلى 75 عاماً.',
      'تختلف فترات الفحص حسب نوع الاختبار: فحص الدم الخفي في البراز المناعي (FIT) يجرى سنوياً، بينما تنظير القولون الطبيعي يجرى عادة كل 10 سنوات.',
      'بالنسبة للأشخاص من سن 76 إلى 85 عاماً، يكون قرار الفحص فردياً بناءً على الحالة الصحية العامة وسجل الفحوصات السابقة.',
      'وجود أعراض كالنزيف أو فقر الدم أو تاريخ عائلي يتطلب تقييماً سريرياً مباشراً وليس مجرد فحص مسحي روتيني.'
    ],
    sentencesEn: [
      'The USPSTF (2021) recommends colorectal cancer screening for average-risk adults aged 45 to 75 years.',
      'Screening intervals depend strictly on test type: annual stool tests (FIT) vs. 10-year intervals for a normal screening colonoscopy.',
      'For adults aged 76 to 85, screening decisions are individualized based on overall health and prior screening history.',
      'Anyone presenting with visible bleeding, unexplained weight loss, or family history requires targeted diagnostic evaluation rather than routine screening.'
    ],
    sourceTitle: 'USPSTF: Colorectal Cancer: Screening (2021)',
    sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening',
    isVerifiedSource: true,
    chatTopicAr: 'ما الفرق بين فحص البراز FIT وتنظير القولون وأيهما يناسبني؟',
    chatTopicEn: 'What is the difference between a FIT stool test and colonoscopy for screening?'
  },
  {
    id: 'card-10',
    titleAr: 'متى يجب طلب المساعدة الطبية العاجلة أو الطارئة؟',
    titleEn: 'When should you seek urgent emergency medical care?',
    sentencesAr: [
      'اطلب المساعدة الطبية الطارئة فوراً عند حدوث صعوبة حادة في التنفس، أو ألم وضغط شديد ومستمر في الصدر أو الرقبة.',
      'استدعِ الطوارئ فوراً عند ملاحظة ضعف مفاجئ في جانب من الوجه أو الذراع أو ثقل مفاجئ في النطق أو تشوش ذهني حاد.',
      'أي نزيف حاد غير مسيطر عليه أو تورم سريع في الرقبة بعد جراحة يتطلب تدخلاً إسعافياً عاجلاً بدون تأخير.',
      'إذا كنت منوماً داخل المستشفى، اضغط زر استدعاء التمريض بجوار سريرك فوراً لإبلاغ الفريق الطبي عند أي شعور بالخطر.'
    ],
    sentencesEn: [
      'Seek emergency medical assistance immediately for severe breathlessness, crushing chest pain, or rapid swelling of the neck.',
      'Call emergency services right away if someone develops sudden facial drooping, one-sided limb weakness, slurred speech, or acute confusion.',
      'Significant or uncontrolled bleeding requires immediate hospital-based emergency stabilization.',
      'If you are an inpatient in a hospital, press your bedside call button immediately to notify your clinical nursing team.'
    ],
    isVerifiedSource: false,
    unverifiedNoteAr: 'لم يتم العثور على مصدر طبي موثوق ومباشر لهذا السؤال.',
    unverifiedNoteEn: 'A suitable, direct verified medical source was not found for this question.',
    chatTopicAr: 'ما هي الأعراض التحذيرية الحمراء التي تستوجب التوجه الفوري للطوارئ؟',
    chatTopicEn: 'What are the red-flag emergency symptoms requiring immediate emergency care?'
  }
];
