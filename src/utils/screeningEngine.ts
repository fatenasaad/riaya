import { ScreeningInputs, ScreeningResultExplanation } from '../types';

export function evaluateScreeningRules(inputs: ScreeningInputs): ScreeningResultExplanation[] {
  const results: ScreeningResultExplanation[] = [];

  // -------------------------------------------------------------
  // Rule A — Colorectal Cancer Screening (USPSTF 2021)
  // -------------------------------------------------------------
  {
    const missing: string[] = [];
    if (inputs.age === undefined || isNaN(inputs.age)) missing.push('age');
    if (!inputs.hasColorectalSymptomsOrHighRisk) missing.push('highRiskOrSymptoms');

    if (missing.length > 0) {
      results.push({
        ruleId: 'colorectal',
        ruleTitleAr: 'فحص سرطان القولون والمستقيم (USPSTF 2021)',
        ruleTitleEn: 'Colorectal Cancer Screening (USPSTF 2021)',
        isEligible: 'insufficient_info',
        missingInputs: missing,
        summaryAr: 'معلومات غير كافية لتقييم أهلية فحص القولون والمستقيم بأمان.',
        summaryEn: 'Insufficient information to safely evaluate colorectal screening eligibility.',
        whyThisResultAr: `القاعدة المطبقة: توصية USPSTF (2021). المدخلات المستخدمة: نقص في (${missing.join(', ')}). المعايير تتطلب تحديد العمر بدقة وغياب الأعراض أو عوامل الخطورة العالية.`,
        whyThisResultEn: `Rule applied: USPSTF (2021) Colorectal Screening. Actual inputs used: Missing required fields (${missing.join(', ')}). Eligibility requires confirmed age and average-risk confirmation.`,
        whatThisDoesNotEstablishAr: 'اقتراح الفحص لا يُعد تشخيصاً. والنتيجة الإيجابية لا تعني بالضرورة وجود سرطان. الأعراض والتاريخ المرضي العائلي تتطلب تقييماً سريرياً مباشراً.',
        whatThisDoesNotEstablishEn: 'A screening suggestion is not a diagnosis. A positive screening result does not automatically establish cancer. Symptoms and high-risk family history require clinical assessment.',
        sourceTitle: 'USPSTF: Colorectal Cancer: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening'
      });
    } else if (inputs.hasColorectalSymptomsOrHighRisk === 'yes') {
      results.push({
        ruleId: 'colorectal',
        ruleTitleAr: 'فحص سرطان القولون والمستقيم (USPSTF 2021)',
        ruleTitleEn: 'Colorectal Cancer Screening (USPSTF 2021)',
        isEligible: 'individualized',
        summaryAr: 'توصيات الخطورة المتوسطة لا تنطبق مباشرة لوجود أعراض أو عوامل خطورة تتطلب استشارة الطبيب.',
        summaryEn: 'Average-risk screening rules do not apply due to reported symptoms or high-risk history; clinician consultation required.',
        whyThisResultAr: `القاعدة المطبقة: توصية USPSTF (2021). المدخلات: العمر ${inputs.age} سنة مع وجود أعراض أو تاريخ مرضي عالي الخطورة. معايير الفحص الروتيني تستثني ذوي الخطورة العالية.`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Inputs: Age ${inputs.age}, with reported symptoms or high-risk history. Average-risk guidelines explicitly exclude high-risk or symptomatic individuals.`,
        whatThisDoesNotEstablishAr: 'لا يثبت هذا التقييم تشخيصاً، ولا ينفي الحاجة لفحص فوري. يجب الخضوع لتقييم سريري متخصص لتحديد الفحص التشخيصي الملائم.',
        whatThisDoesNotEstablishEn: 'This does not establish a diagnosis, nor does it guarantee a test is appropriate. Symptoms and high-risk personal/family history require individualized clinician assessment.',
        sourceTitle: 'USPSTF: Colorectal Cancer: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening'
      });
    } else if (inputs.age! >= 45 && inputs.age! <= 75) {
      // Check prior test interval
      if (inputs.colorectalTestType === 'unknown' || (inputs.colorectalTestType !== 'none' && !inputs.colorectalTestDate)) {
        results.push({
          ruleId: 'colorectal',
          ruleTitleAr: 'فحص سرطان القولون والمستقيم (USPSTF 2021)',
          ruleTitleEn: 'Colorectal Cancer Screening (USPSTF 2021)',
          isEligible: 'insufficient_info',
          summaryAr: 'تعذر تحديد موعد الفحص التالي من المعلومات المتوفرة. يرجى التأكيد مع طبيبك المعالج.',
          summaryEn: 'Unable to determine the next screening date from the available information. Please confirm with your healthcare professional.',
          whyThisResultAr: `القاعدة المطبقة: توصية USPSTF (2021) للأعمار 45-75. المدخلات: العمر ${inputs.age} سنة، ولكن نوع الفحص السابق أو تاريخه غير محدد. الفاصل الزمني يعتمد كلياً على نوع الفحص (تنظير كل 10 سنوات مقابل فحص براز FIT سنوي).`,
          whyThisResultEn: `Rule applied: USPSTF (2021) for ages 45-75. Inputs: Age ${inputs.age}, but prior test type or date is unknown. Screening intervals depend strictly on test type (colonoscopy 10-year vs annual FIT).`,
          whatThisDoesNotEstablishAr: 'لا يُعد هذا القرار تشخيصاً، ولا ينفي أهليتك الأساسية للفحص. عدم وضوح الفحص السابق يمنع احتساب الفاصل الآمن بدقة.',
          whatThisDoesNotEstablishEn: 'A screening suggestion is not a diagnosis. Not having test details does not mean you do not need screening; it prevents determining the safe interval.',
          sourceTitle: 'USPSTF: Colorectal Cancer: Screening (2021)',
          sourceYear: '2021',
          sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening'
        });
      } else {
        let isDue = true;
        let noteAr = 'ينصح عموماً بإجراء الفحص للبالغين ذوي الخطورة المتوسطة بين 45 و 75 عاماً.';
        let noteEn = 'Screening is generally recommended for average-risk adults aged 45 to 75.';

        if (inputs.colorectalTestType === 'colonoscopy' && inputs.colorectalTestDate === 'within_10_years') {
          isDue = false;
          noteAr = 'أجريت تنظيراً للقولون خلال السنوات العشر الماضية بنتيجة طبيعية؛ الفحص الروتيني التالي قد لا يكون مستحقاً حالياً وفق هذا الفاصل.';
          noteEn = 'You reported a normal colonoscopy within the past 10 years; routine screening may not yet be due under this interval.';
        } else if (inputs.colorectalTestType === 'fit' && inputs.colorectalTestDate === 'within_1_year') {
          isDue = false;
          noteAr = 'أجريت فحص البراز FIT خلال العام الماضي؛ فحص FIT الروتيني التالي يستحق سنوياً وقد لا يكون مستحقاً اليوم.';
          noteEn = 'You completed a FIT stool test within the past year; next annual FIT test may not be due yet.';
        }

        results.push({
          ruleId: 'colorectal',
          ruleTitleAr: 'فحص سرطان القولون والمستقيم (USPSTF 2021)',
          ruleTitleEn: 'Colorectal Cancer Screening (USPSTF 2021)',
          isEligible: isDue,
          summaryAr: noteAr,
          summaryEn: noteEn,
          whyThisResultAr: `القاعدة المطبقة: توصية USPSTF (2021). المدخلات المستخدمة: العمر ${inputs.age} سنة، نوع الفحص السابق: ${inputs.colorectalTestType || 'لا يوجد'}، التاريخ: ${inputs.colorectalTestDate || 'غير مسجل'}. الفاصل الزمني لاختبار القولون يعتمد على نوع الفحص بدقة.`,
          whyThisResultEn: `Rule applied: USPSTF (2021) for ages 45-75. Inputs: Age ${inputs.age}, prior test: ${inputs.colorectalTestType || 'None'}, interval: ${inputs.colorectalTestDate || 'N/A'}. Distinct test-specific intervals applied.`,
          whatThisDoesNotEstablishAr: 'اقتراح الفحص ليس تشخيصاً، والنتيجة الإيجابية لا تعني بالضرورة وجود سرطان. يجب مراجعة الطبيب لتأكيد الموعد المناسب.',
          whatThisDoesNotEstablishEn: 'A screening suggestion is not a diagnosis. A positive screening result does not automatically establish cancer. Eligibility does not guarantee the test is appropriate for every individual.',
          sourceTitle: 'USPSTF: Colorectal Cancer: Screening (2021)',
          sourceYear: '2021',
          sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening'
        });
      }
    } else if (inputs.age! >= 76 && inputs.age! <= 85) {
      results.push({
        ruleId: 'colorectal',
        ruleTitleAr: 'فحص سرطان القولون والمستقيم (USPSTF 2021)',
        ruleTitleEn: 'Colorectal Cancer Screening (USPSTF 2021)',
        isEligible: 'individualized',
        summaryAr: 'للأعمار بين 76 و 85 عاماً، قرار الفحص فردي ويعتمد على حالتك الصحية وسجل فحوصاتك السابقة.',
        summaryEn: 'For adults aged 76 to 85, screening decision is individualized based on overall health and prior screening history.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021) للأعمار 76-85. المدخلات: العمر ${inputs.age} سنة. توصيات USPSTF لا تطبق قاعدة الفحص الروتيني التلقائي لهذه الفئة وتوصي بقرار فردي مشترك مع الطبيب.`,
        whyThisResultEn: `Rule applied: USPSTF (2021) for adults aged 76-85. Inputs: Age ${inputs.age}. The recommendation does not apply the 45-75 universal rule automatically; clinical decision is individualized.`,
        whatThisDoesNotEstablishAr: 'لا يحدد هذا التقييم تشخيصاً أو استبعاداً قطعياً. يجب مناقشة الفوائد والأعباء الصحية مع طبيبك الخاص.',
        whatThisDoesNotEstablishEn: 'This suggestion does not establish a diagnosis or absolute exclusion. Individualized assessment with a healthcare professional is recommended.',
        sourceTitle: 'USPSTF: Colorectal Cancer: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening'
      });
    } else {
      results.push({
        ruleId: 'colorectal',
        ruleTitleAr: 'فحص سرطان القولون والمستقيم (USPSTF 2021)',
        ruleTitleEn: 'Colorectal Cancer Screening (USPSTF 2021)',
        isEligible: false,
        summaryAr: inputs.age! < 45 ? 'الفحص الروتيني لسرطان القولون لا يوصى به عموماً لمن هم دون سن 45 عاماً ذوي الخطورة المتوسطة.' : 'الأدلة غير كافية للتوصية بفحص مسحي روتيني عام لمن تجاوزوا 85 عاماً.',
        summaryEn: inputs.age! < 45 ? 'Routine colorectal cancer screening is generally not recommended under age 45 for average-risk individuals.' : 'Evidence is insufficient for routine population screening beyond age 85.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات: العمر ${inputs.age} سنة. نطاق الفحص الروتيني الأساسي هو 45-75 سنة.`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Inputs: Age ${inputs.age}. Core routine screening range is ages 45-75.`,
        whatThisDoesNotEstablishAr: 'غياب التوصية الروتينية لا يضمن عدم وجود مشكلة صحية إذا ظهرت أي أعراض كنزيف أو تغير عادات الإخراج.',
        whatThisDoesNotEstablishEn: 'An absence of routine eligibility does not establish that you are free of risk if symptoms develop; symptoms require medical review.',
        sourceTitle: 'USPSTF: Colorectal Cancer: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening'
      });
    }
  }

  // -------------------------------------------------------------
  // Rule B — Breast Cancer Screening (USPSTF 2024)
  // -------------------------------------------------------------
  {
    const missing: string[] = [];
    if (inputs.age === undefined || isNaN(inputs.age)) missing.push('age');
    if (!inputs.sexAssigned) missing.push('sexAssigned');
    if (!inputs.hasBreastHighRisk) missing.push('breastHighRiskStatus');

    if (missing.length > 0) {
      results.push({
        ruleId: 'breast',
        ruleTitleAr: 'فحص سرطان الثدي بالماموجرام (USPSTF 2024)',
        ruleTitleEn: 'Breast Cancer Screening (USPSTF 2024)',
        isEligible: 'insufficient_info',
        missingInputs: missing,
        summaryAr: 'معلومات غير كافية لتقييم فحص الماموجرام بدقة (يرجى تحديد العمر والجنس المحدد عند الولادة وحالة الخطورة العالية).',
        summaryEn: 'Insufficient information to evaluate mammography screening (age, sex assigned at birth, or high-risk status missing).',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2024). المدخلات الناقصة: (${missing.join(', ')}). التوصية تتطلب بيانات محددة عن العمر والجنس المعني وتاريخ الخطورة.`,
        whyThisResultEn: `Rule applied: USPSTF (2024) Breast Screening. Missing: (${missing.join(', ')}). The recommendation relies on sex assigned at birth, age, and high-risk status.`,
        whatThisDoesNotEstablishAr: 'لا يُعد هذا التقييم تشخيصاً. لا نفترض إجابات ناقصة.',
        whatThisDoesNotEstablishEn: 'A screening suggestion is not a diagnosis. Missing inputs are not assumed.',
        sourceTitle: 'USPSTF: Breast Cancer: Screening (2024)',
        sourceYear: '2024',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening'
      });
    } else if (inputs.sexAssigned !== 'female') {
      results.push({
        ruleId: 'breast',
        ruleTitleAr: 'فحص سرطان الثدي بالماموجرام (USPSTF 2024)',
        ruleTitleEn: 'Breast Cancer Screening (USPSTF 2024)',
        isEligible: false,
        summaryAr: 'توصية الفحص الروتيني لـ USPSTF (2024) تنطبق على النساء والأشخاص المعنيين ذوي الخطورة المتوسطة المحددين عند الولادة.',
        summaryEn: 'The USPSTF (2024) routine screening recommendation specifically applies to cisgender women and persons assigned female at birth at average risk.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2024). المدخلات: الجنس المحدد ${inputs.sexAssigned}، العمر ${inputs.age} سنة. لا تنطبق التوصية المسحية الروتينية لعامة الذكور دون خطورة جينية خاصة.`,
        whyThisResultEn: `Rule applied: USPSTF (2024). Inputs: Sex assigned at birth: ${inputs.sexAssigned}, Age ${inputs.age}. Routine population mammography is not recommended for this category without specific high-risk indications.`,
        whatThisDoesNotEstablishAr: 'لا ينفي وجود أي كتل أو أعراض موضعية تحتاج فحصاً سريرياً.',
        whatThisDoesNotEstablishEn: 'Does not establish absence of localized symptoms; any physical breast changes require clinical breast evaluation.',
        sourceTitle: 'USPSTF: Breast Cancer: Screening (2024)',
        sourceYear: '2024',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening'
      });
    } else if (inputs.hasBreastHighRisk === 'yes') {
      results.push({
        ruleId: 'breast',
        ruleTitleAr: 'فحص سرطان الثدي بالماموجرام (USPSTF 2024)',
        ruleTitleEn: 'Breast Cancer Screening (USPSTF 2024)',
        isEligible: 'individualized',
        summaryAr: 'قاعدة الخطورة المتوسطة لا تنطبق لوجود تاريخ إصابة سابق أو متلازمات وراثية أو علاج إشعاعي سابق؛ يتطلب الأمر تقييماً متخصصاً.',
        summaryEn: 'Average-risk screening rules do not apply due to reported high-risk genetic syndrome, prior breast cancer, or prior radiation; specialist care required.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2024). المدخلات: أنثى، العمر ${inputs.age} سنة، مع وجود عوامل خطورة عالية. توصيات USPSTF تستثني حالات الخطورة الجينية العالية كطفرات BRCA.`,
        whyThisResultEn: `Rule applied: USPSTF (2024). Inputs: Female, Age ${inputs.age}, high-risk status: yes. The average-risk rule explicitly excludes individuals with high-risk genetic syndromes or prior chest radiation.`,
        whatThisDoesNotEstablishAr: 'لا يثبت تشخيصاً بالسرطان؛ يوجه نحو بروتوكول فحص متخصص مناسب (مثل الرنين المغناطيسي والماموجرام المبكر).',
        whatThisDoesNotEstablishEn: 'This does not establish cancer; it indicates that a specialized high-risk surveillance protocol is required.',
        sourceTitle: 'USPSTF: Breast Cancer: Screening (2024)',
        sourceYear: '2024',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening'
      });
    } else if (inputs.age! >= 40 && inputs.age! <= 74) {
      if (inputs.mammogramDate === 'within_2_years') {
        results.push({
          ruleId: 'breast',
          ruleTitleAr: 'فحص سرطان الثدي بالماموجرام (USPSTF 2024)',
          ruleTitleEn: 'Breast Cancer Screening (USPSTF 2024)',
          isEligible: false,
          summaryAr: 'تم إجراء ماموجرام خلال العامين الماضيين بنتيجة طبيعية؛ الفحص الروتيني التالي غير مستحق حالياً بموجب قاعدة السنتين.',
          summaryEn: 'A screening mammogram was reported within the last two years; another routine mammogram is not yet due under this 2-year interval rule.',
          whyThisResultAr: `القاعدة المطبقة: USPSTF (2024) للأعمار 40-74 ذوات الخطورة المتوسطة (كل سنتين). المدخلات: العمر ${inputs.age} سنة، آخر فحص: خلال آخر عامين.`,
          whyThisResultEn: `Rule applied: USPSTF (2024) biennial screening (ages 40-74). Inputs: Age ${inputs.age}, prior mammogram reported within the past two years.`,
          whatThisDoesNotEstablishAr: 'لا يثبت عدم استحقاق الفحص إذا ظهرت أي تغيرات جديدة في الثدي أو الحلمة، فالأعراض تستدعي فحصاً فورياً.',
          whatThisDoesNotEstablishEn: 'Not being due for a routine screen does not establish absence of disease if new physical breast symptoms develop.',
          sourceTitle: 'USPSTF: Breast Cancer: Screening (2024)',
          sourceYear: '2024',
          sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening'
        });
      } else {
        results.push({
          ruleId: 'breast',
          ruleTitleAr: 'فحص سرطان الثدي بالماموجرام (USPSTF 2024)',
          ruleTitleEn: 'Breast Cancer Screening (USPSTF 2024)',
          isEligible: true,
          summaryAr: 'يوصى عموماً بإجراء فحص الماموجرام كل عامين للنساء ذوات الخطورة المتوسطة بين سن 40 و 74 عاماً.',
          summaryEn: 'Screening mammography is generally recommended every two years for average-risk women aged 40 to 74.',
          whyThisResultAr: `القاعدة المطبقة: USPSTF (2024). المدخلات: أنثى، العمر ${inputs.age} سنة (ضمن نطاق 40-74)، خطورة متوسطة، لم يجر فحص خلال العامين الماضيين.`,
          whyThisResultEn: `Rule applied: USPSTF (2024). Inputs: Female, Age ${inputs.age} (in 40-74 range), average risk, no mammogram within the past 2 years.`,
          whatThisDoesNotEstablishAr: 'اقتراح الفحص لا يُعد تشخيصاً. وإذا أظهر الفحص أي كثافة أو تغير نسيجي، فهذا لا يعني بالضرورة وجود ورم خبيث بل يتطلب فحوصات إضافية.',
          whatThisDoesNotEstablishEn: 'A screening suggestion is not a diagnosis. A screening finding that needs further assessment does not automatically establish cancer.',
          sourceTitle: 'USPSTF: Breast Cancer: Screening (2024)',
          sourceYear: '2024',
          sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening'
        });
      }
    } else if (inputs.age! >= 75) {
      results.push({
        ruleId: 'breast',
        ruleTitleAr: 'فحص سرطان الثدي بالماموجرام (USPSTF 2024)',
        ruleTitleEn: 'Breast Cancer Screening (USPSTF 2024)',
        isEligible: 'individualized',
        summaryAr: 'للأعمار من 75 عاماً فأكثر، الأدلة العلمية الحالية غير كافية لإصدار توصية عامة للجميع، والقرار يتطلب مناقشة فردية مع الطبيب.',
        summaryEn: 'For adults aged 75 and older, current evidence is insufficient for a universal recommendation; decision requires individualized clinician discussion.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2024) للأعمار 75+. المدخلات: العمر ${inputs.age} سنة. صنفت التوصية الأدلة على أنها غير كافية (Statement I) لهذه الفئة العمرية.`,
        whyThisResultEn: `Rule applied: USPSTF (2024) for age 75+. Inputs: Age ${inputs.age}. Recommendation statement identifies insufficient evidence for universal screening in this age cohort.`,
        whatThisDoesNotEstablishAr: 'لا يثبت عدم جدوى الفحص أو ضرورته؛ بل يعني أن القرار يرتبط بالصحة العامة ومتوسط العمر المتوقع.',
        whatThisDoesNotEstablishEn: 'Does not establish that screening is either ineffective or mandatory; decision balances overall health and individual preference.',
        sourceTitle: 'USPSTF: Breast Cancer: Screening (2024)',
        sourceYear: '2024',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening'
      });
    } else {
      results.push({
        ruleId: 'breast',
        ruleTitleAr: 'فحص سرطان الثدي بالماموجرام (USPSTF 2024)',
        ruleTitleEn: 'Breast Cancer Screening (USPSTF 2024)',
        isEligible: false,
        summaryAr: 'الفحص المسحي الروتيني بالماموجرام يبدأ عموماً من سن 40 عاماً لذوات الخطورة المتوسطة.',
        summaryEn: 'Routine population screening mammography is generally recommended starting at age 40 for average-risk individuals.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2024). المدخلات: العمر ${inputs.age} سنة (أقل من 40).`,
        whyThisResultEn: `Rule applied: USPSTF (2024). Inputs: Age ${inputs.age} (under 40).`,
        whatThisDoesNotEstablishAr: 'لا ينفي وجود أي كتل أو أعراض موضعية تستوجب كشفاً طبياً فورياً.',
        whatThisDoesNotEstablishEn: 'Does not establish that palpable lumps or changes should be ignored; symptoms require targeted medical evaluation.',
        sourceTitle: 'USPSTF: Breast Cancer: Screening (2024)',
        sourceYear: '2024',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening'
      });
    }
  }

  // -------------------------------------------------------------
  // Rule C — Prediabetes and Type 2 Diabetes Screening (USPSTF 2021)
  // -------------------------------------------------------------
  {
    const missing: string[] = [];
    if (inputs.age === undefined || isNaN(inputs.age)) missing.push('age');
    if (!inputs.hasOverweightObesity) missing.push('overweightObesityStatus');

    if (missing.length > 0) {
      results.push({
        ruleId: 'diabetes',
        ruleTitleAr: 'فحص السكري ومقدمات السكري (USPSTF 2021)',
        ruleTitleEn: 'Screening for Prediabetes and Type 2 Diabetes (USPSTF 2021)',
        isEligible: 'insufficient_info',
        missingInputs: missing,
        summaryAr: 'معلومات غير كافية لتقييم أهلية فحص السكري (مطلوب تحديد العمر وحالة الوزن الزائد/السمنة دون تخمين).',
        summaryEn: 'Insufficient information to evaluate diabetes screening (age and overweight/obesity status required without guessing).',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات الناقصة: (${missing.join(', ')}). معايير التوصية تنص صراحة على عدم استنتاج الوزن الزائد أو السمنة من العمر وحده.`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Missing: (${missing.join(', ')}). The criteria strictly prohibit inferring overweight or obesity from age alone.`,
        whatThisDoesNotEstablishAr: 'لا يثبت عدم حاجتك للفحص؛ فقط نحتاج إلى تأكيد مدخل الوزن لتقييم التوصية بدقة.',
        whatThisDoesNotEstablishEn: 'Does not establish lack of eligibility; the required overweight/obesity parameter must be collected directly.',
        sourceTitle: 'USPSTF: Prediabetes and Type 2 Diabetes: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes'
      });
    } else if (inputs.isPregnant === 'yes') {
      results.push({
        ruleId: 'diabetes',
        ruleTitleAr: 'فحص السكري ومقدمات السكري (USPSTF 2021)',
        ruleTitleEn: 'Screening for Prediabetes and Type 2 Diabetes (USPSTF 2021)',
        isEligible: 'individualized',
        summaryAr: 'توصية USPSTF (2021) هذه مخصصة للبالغين غير الحوامل؛ يخضع فحص سكري الحمل لبروتوكول رعاية الحمل المعتاد.',
        summaryEn: 'The USPSTF (2021) rule applies specifically to nonpregnant adults; gestational diabetes screening follows dedicated prenatal protocols.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات: حمل مؤكد. توصية السكري العام تستثني الحوامل لوجود مسار مخصص لسكري الحمل.`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Inputs: Confirmed pregnancy. The asymptomatic type 2 diabetes recommendation excludes pregnant individuals.`,
        whatThisDoesNotEstablishAr: 'لا ينفي الحاجة لفحص سكر الحمل مع طبيب النساء والتوليد.',
        whatThisDoesNotEstablishEn: 'Does not negate the need for gestational diabetes screening as part of standard obstetric care.',
        sourceTitle: 'USPSTF: Prediabetes and Type 2 Diabetes: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes'
      });
    } else if (inputs.age! >= 35 && inputs.age! <= 70 && inputs.hasOverweightObesity === 'yes') {
      results.push({
        ruleId: 'diabetes',
        ruleTitleAr: 'فحص السكري ومقدمات السكري (USPSTF 2021)',
        ruleTitleEn: 'Screening for Prediabetes and Type 2 Diabetes (USPSTF 2021)',
        isEligible: true,
        summaryAr: 'ينصح بإجراء فحص السكري ومقدمات السكري (مثل تحليل HbA1c) للبالغين بين سن 35 و 70 الذين يعانون من زيادة الوزن أو السمنة.',
        summaryEn: 'Screening for prediabetes and type 2 diabetes (such as HbA1c) may be appropriate for asymptomatic adults aged 35 to 70 with overweight or obesity.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات: العمر ${inputs.age} سنة (ضمن نطاق 35-70)، وتم تأكيد وجود زيادة وزن أو سمنة. تنطبق كافة معايير الأهلية.`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Actual inputs: Age ${inputs.age} (in 35-70 range), confirmed overweight/obesity status. All eligibility criteria met.`,
        whatThisDoesNotEstablishAr: 'اقتراح الفحص لا يُعد تشخيصاً بالسكري. والنتيجة الطبيعية لا تعني عدم الحاجة لفحوصات لاحقة كل 3 سنوات.',
        whatThisDoesNotEstablishEn: 'A screening suggestion is not a diagnosis. A positive screening result does not automatically establish diabetes without clinical confirmation.',
        sourceTitle: 'USPSTF: Prediabetes and Type 2 Diabetes: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes'
      });
    } else {
      let reasonAr = '';
      let reasonEn = '';
      if (inputs.hasOverweightObesity === 'no') {
        reasonAr = 'الوزن يقع في النطاق الطبيعي؛ لا تنطبق معايير الفحص الروتيني العام لـ USPSTF لعدم توفر شرط زيادة الوزن أو السمنة.';
        reasonEn = 'Overweight/obesity criterion is not present; standard USPSTF population screening criteria are not met.';
      } else {
        reasonAr = `العمر (${inputs.age}) خارج نطاق 35-70 سنة المعتمد في التوصية المسحية الأساسية.`;
        reasonEn = `Age (${inputs.age}) is outside the core 35-70 screening age bracket of the recommendation.`;
      }

      results.push({
        ruleId: 'diabetes',
        ruleTitleAr: 'فحص السكري ومقدمات السكري (USPSTF 2021)',
        ruleTitleEn: 'Screening for Prediabetes and Type 2 Diabetes (USPSTF 2021)',
        isEligible: false,
        summaryAr: reasonAr,
        summaryEn: reasonEn,
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات: العمر ${inputs.age} سنة، زيادة الوزن: ${inputs.hasOverweightObesity}.`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Inputs: Age ${inputs.age}, Overweight/obesity: ${inputs.hasOverweightObesity}.`,
        whatThisDoesNotEstablishAr: 'عدم انطباق الفحص الروتيني لا يحل محل التقييم الطبي إذا كنت تعاني من أعراض كالعطش الزائد أو التبول المتكرر.',
        whatThisDoesNotEstablishEn: 'Absence of screening eligibility does not dismiss symptoms like excessive thirst or polyuria that require diagnostic review.',
        sourceTitle: 'USPSTF: Prediabetes and Type 2 Diabetes: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes'
      });
    }
  }

  // -------------------------------------------------------------
  // Rule D — Blood Pressure Screening (USPSTF 2021)
  // -------------------------------------------------------------
  {
    const missing: string[] = [];
    if (inputs.age === undefined || isNaN(inputs.age)) missing.push('age');

    if (missing.length > 0) {
      results.push({
        ruleId: 'hypertension',
        ruleTitleAr: 'فحص ضغط الدم لدى البالغين (USPSTF 2021)',
        ruleTitleEn: 'Blood Pressure Screening in Adults (USPSTF 2021)',
        isEligible: 'insufficient_info',
        missingInputs: missing,
        summaryAr: 'معلومات غير كافية لتقييم فحص ضغط الدم (العمر مفقود).',
        summaryEn: 'Insufficient information to evaluate blood pressure screening (age required).',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات الناقصة: العمر.`,
        whyThisResultEn: `Rule applied: USPSTF (2021) Hypertension Screening. Missing: Age.`,
        whatThisDoesNotEstablishAr: 'اقتراح الفحص ليس تشخيصاً ولا يحل محل القياس السريري المباشر.',
        whatThisDoesNotEstablishEn: 'A screening suggestion is not a diagnosis.',
        sourceTitle: 'USPSTF: Hypertension in Adults: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening'
      });
    } else if (inputs.age! >= 18) {
      const isKnown = inputs.hasKnownHypertension === 'yes';
      results.push({
        ruleId: 'hypertension',
        ruleTitleAr: 'فحص ضغط الدم لدى البالغين (USPSTF 2021)',
        ruleTitleEn: 'Blood Pressure Screening in Adults (USPSTF 2021)',
        isEligible: !isKnown,
        summaryAr: isKnown
          ? 'لديك تشخيص سابق بارتفاع ضغط الدم؛ تحتاج لمتابعة علاجية دورية بدلاً من الفحص المسحي الأولي.'
          : 'يوصى بفحص ضغط الدم لجميع البالغين من سن 18 عاماً فأكثر دون تشخيص سابق بارتفاع الضغط.',
        summaryEn: isKnown
          ? 'You have documented known hypertension; active disease management and monitoring applies rather than primary screening.'
          : 'Blood pressure screening is recommended for all adults aged 18 years or older without known hypertension.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات: العمر ${inputs.age} سنة (18+ عاماً)، ضغط دم مشخص مسبقاً: ${inputs.hasKnownHypertension || 'لا'}.`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Inputs: Age ${inputs.age} (>=18), known hypertension: ${inputs.hasKnownHypertension || 'No'}.`,
        whatThisDoesNotEstablishAr: 'القراءة المفردة المرتفعة لا تؤكد وحدها تشخيص فرط ضغط الدم؛ يجب إجراء قياسات تأكيدية خارج العيادة (كالمنزل) قبل بدء أي علاج. لا تغير أدويتك بناءً على هذا النموذج.',
        whatThisDoesNotEstablishEn: 'A single high reading does not, by itself, establish a diagnosis. Confirmatory measurements outside the clinical setting are recommended before starting treatment. Do not alter medications based on this form.',
        sourceTitle: 'USPSTF: Hypertension in Adults: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening'
      });
    } else {
      results.push({
        ruleId: 'hypertension',
        ruleTitleAr: 'فحص ضغط الدم لدى البالغين (USPSTF 2021)',
        ruleTitleEn: 'Blood Pressure Screening in Adults (USPSTF 2021)',
        isEligible: false,
        summaryAr: 'هذه التوصية تنطبق على البالغين من سن 18 عاماً فما فوق.',
        summaryEn: 'This specific USPSTF recommendation covers adults aged 18 and older.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات: العمر ${inputs.age} سنة (أقل من 18).`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Inputs: Age ${inputs.age} (<18).`,
        whatThisDoesNotEstablishAr: 'لا ينفي أهمية فحص ضغط الدم الدوري للأطفال والمراهقين أثناء الفحوصات المدرسية أو عند طبيب الأطفال.',
        whatThisDoesNotEstablishEn: 'Does not preclude pediatric blood pressure assessment performed during routine child wellness exams.',
        sourceTitle: 'USPSTF: Hypertension in Adults: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening'
      });
    }
  }

  // -------------------------------------------------------------
  // Rule E — Lung Cancer Screening (USPSTF 2021)
  // -------------------------------------------------------------
  {
    const missing: string[] = [];
    if (inputs.age === undefined || isNaN(inputs.age)) missing.push('age');
    if (!inputs.smokingStatus || inputs.smokingStatus === 'unknown') missing.push('smokingStatus');

    if (inputs.smokingStatus === 'current' || inputs.smokingStatus === 'former') {
      if (inputs.packYears === undefined || isNaN(inputs.packYears)) missing.push('packYears');
    }
    if (inputs.smokingStatus === 'former') {
      if (inputs.yearsSinceQuitting === undefined || isNaN(inputs.yearsSinceQuitting)) missing.push('yearsSinceQuitting');
    }

    if (missing.length > 0) {
      results.push({
        ruleId: 'lung',
        ruleTitleAr: 'فحص سرطان الرئة بالأشعة المقطعية منخفضة الجرعة (USPSTF 2021)',
        ruleTitleEn: 'Lung Cancer Screening (USPSTF 2021)',
        isEligible: 'insufficient_info',
        missingInputs: missing,
        summaryAr: 'معلومات غير كافية لتقييم فحص سرطان الرئة (المدخلات الناقصة: ' + missing.join(', ') + ').',
        summaryEn: 'Insufficient information to evaluate lung cancer screening (missing: ' + missing.join(', ') + ').',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات الناقصة: (${missing.join(', ')}). معايير الفحص السنوي تتطلب استيفاء كافة الشروط الثلاثة معاً دون تخمين.`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Missing: (${missing.join(', ')}). Eligibility requires all three specific criteria to be met without guessing.`,
        whatThisDoesNotEstablishAr: 'لا يقترح أو يستبعد الفحص دون معرفة تفاصيل التدخين. أي أعراض تنفسية كالسعال المستمر أو نزيف الصدر تتطلب تقييماً فورياً.',
        whatThisDoesNotEstablishEn: 'A screening suggestion is not a diagnosis. Symptoms like persistent coughing or hemoptysis require immediate clinical assessment.',
        sourceTitle: 'USPSTF: Lung Cancer: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening'
      });
    } else if (inputs.smokingStatus === 'never') {
      results.push({
        ruleId: 'lung',
        ruleTitleAr: 'فحص سرطان الرئة بالأشعة المقطعية منخفضة الجرعة (USPSTF 2021)',
        ruleTitleEn: 'Lung Cancer Screening (USPSTF 2021)',
        isEligible: false,
        summaryAr: 'فحص سرطان الرئة السنوي بالأشعة المقطعية منخفضة الجرعة لا يوصى به لغير المدخنين.',
        summaryEn: 'Annual low-dose CT screening for lung cancer is not recommended for individuals who have never smoked.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات: غير مدخن، العمر ${inputs.age} سنة. توصيات USPSTF تشترط تاريخ تدخين لا يقل عن 20 سنة/علبة.`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Inputs: Never smoker, Age ${inputs.age}. Criteria require at least a 20 pack-year smoking history.`,
        whatThisDoesNotEstablishAr: 'غياب الأهلية للفحص الروتيني لا يثبت عدم إمكانية الإصابة إذا ظهرت أعراض غير طبيعية تستدعي الفحص.',
        whatThisDoesNotEstablishEn: 'Does not establish that non-smokers never develop pulmonary conditions; respiratory symptoms still require evaluation.',
        sourceTitle: 'USPSTF: Lung Cancer: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening'
      });
    } else {
      // Must meet ALL: Age 50-80, >= 20 pack-years, currently smokes or quit within past 15 years
      const ageMet = inputs.age! >= 50 && inputs.age! <= 80;
      const packYearsMet = (inputs.packYears || 0) >= 20;
      const smokingTimingMet = inputs.smokingStatus === 'current' || (inputs.smokingStatus === 'former' && (inputs.yearsSinceQuitting || 0) <= 15);

      const allMet = ageMet && packYearsMet && smokingTimingMet;

      let reasonDetailAr = `العمر: ${inputs.age} سنة (المعيار 50-80: ${ageMet ? 'نعم' : 'لا'})، تاريخ التدخين: ${inputs.packYears || 0} سنة/علبة (المعيار 20+: ${packYearsMet ? 'نعم' : 'لا'})، توقيت التدخين: ${inputs.smokingStatus === 'current' ? 'يدخن حالياً' : `أقلع قبل ${inputs.yearsSinceQuitting} سنة`} (المعيار تدخين حالي أو إقلاع خلال 15 سنة: ${smokingTimingMet ? 'نعم' : 'لا'}).`;
      let reasonDetailEn = `Age: ${inputs.age} (criteria 50-80: ${ageMet ? 'Met' : 'Not met'}), Pack-years: ${inputs.packYears || 0} (criteria >=20: ${packYearsMet ? 'Met' : 'Not met'}), Timing: ${inputs.smokingStatus === 'current' ? 'Current smoker' : `Quit ${inputs.yearsSinceQuitting} years ago`} (criteria current or quit <=15y: ${smokingTimingMet ? 'Met' : 'Not met'}).`;

      results.push({
        ruleId: 'lung',
        ruleTitleAr: 'فحص سرطان الرئة بالأشعة المقطعية منخفضة الجرعة (USPSTF 2021)',
        ruleTitleEn: 'Lung Cancer Screening (USPSTF 2021)',
        isEligible: allMet,
        summaryAr: allMet
          ? 'قد يكون الفحص السنوي بالأشعة المقطعية منخفضة الجرعة (LDCT) ملائماً لاستيفاء كافة شروط الأهلية المعتمدة.'
          : 'لا تنطبق كافة معايير الفحص السنوي الثلاثة معاً في هذه الحالة.',
        summaryEn: allMet
          ? 'Annual low-dose CT (LDCT) screening may be appropriate as all specific eligibility criteria are confirmed.'
          : 'The complete set of three required criteria for annual screening is not met.',
        whyThisResultAr: `القاعدة المطبقة: USPSTF (2021). المدخلات المستخدمة: ${reasonDetailAr}`,
        whyThisResultEn: `Rule applied: USPSTF (2021). Actual inputs used: ${reasonDetailEn}`,
        whatThisDoesNotEstablishAr: 'اقتراح الفحص لا يُعد تشخيصاً بالسرطان. وأي عقدة رئوية قد تظهر في الفحص لا تعني بالضرورة وجود ورم خبيث (فمعظم العقد الصغيرة حميدة). كما أن الفحص لا يغني عن الإقلاع عن التدخين.',
        whatThisDoesNotEstablishEn: 'A screening suggestion is not a diagnosis. Detection of a pulmonary nodule on LDCT does not automatically establish cancer (most nodules are benign). Screening is not an alternative to smoking cessation.',
        sourceTitle: 'USPSTF: Lung Cancer: Screening (2021)',
        sourceYear: '2021',
        sourceUrl: 'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening'
      });
    }
  }

  return results;
}
