import { EducationCardData } from '../types';

export const EDUCATION_CARDS: EducationCardData[] = [
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
];
