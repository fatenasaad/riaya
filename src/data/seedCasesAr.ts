// Arabic display overlay for the 15 seed clinician cases.
// The English fields in seedCases.ts remain canonical; this overlay only adds
// Arabic variants so the Arabic UI never shows English case narratives.
export interface CaseArOverlay {
  typeAr: string;
  resultSummaryAr: string;
  plainLanguageExplanationAr: string;
  whatItDoesNotEstablishAr: string;
  scenarioDescriptionAr: string;
  referralTargetAr?: string;
  appointmentInfoAr?: string;
  notificationSlaAr?: string;
  resultDateAr?: string;
  closureEvidenceAr?: string;
  teachBackAr?: string;
  sbarAr?: { situation: string; background: string; assessment: string; recommendation: string };
  testOrderAr?: { orderedByAr: string; reasonAr: string };
  resultReviewAr?: { reviewedByAr: string; decisionAr: string };
  timelineAr: Record<string, { titleAr: string; detailAr: string }>;
}

export const SEED_CASES_AR: Record<string, CaseArOverlay> = {
  'RY-001': {
    testOrderAr: {
      orderedByAr: 'د. طارق (محاكاة)',
      reasonAr: 'فحص سكري روتيني وفق معايير USPSTF (العمر 68 مع عوامل خطر).'
    },
    resultReviewAr: {
      reviewedByAr: 'د. طارق (محاكاة)',
      decisionAr: 'تأكدت النتيجة غير الطبيعية؛ بُدئ بإبلاغ المريض وإعادة الشرح وإحالة الغدد الصم.'
    },
    typeAr: 'فحص السكر التراكمي',
    resultSummaryAr: 'HbA1c بنسبة 7.4%',
    plainLanguageExplanationAr: 'مؤشر سكر الدم خلال الأشهر الثلاثة الماضية يظهر مستويات مرتفعة تتطلب تقييماً سريرياً.',
    whatItDoesNotEstablishAr: 'لا يحدد مضاعفات معينة ولا يحل محل التقييم السريري من طبيب الغدد الصم.',
    scenarioDescriptionAr: 'اكتملت الحلقة بالكامل: تم الإبلاغ، وتأكد الفهم بإعادة الشرح، وقُبلت إحالة الغدد الصم، ورُتب الموعد.',
    referralTargetAr: 'عيادة الغدد الصم',
    appointmentInfoAr: 'مجدول بتاريخ 2026-10-28 الساعة 10:00 صباحاً (محاكاة)',
    notificationSlaAr: '24 ساعة',
    closureEvidenceAr: 'سُجلت إعادة الشرح بنجاح؛ قُبلت الإحالة؛ أكد المريض وقت الموعد.',
    teachBackAr: 'شرح المريض بشكل صحيح أن نتيجة 7.4% تعكس متوسط سكر الدم خلال 3 أشهر وأكد تفاصيل الموعد.',
    sbarAr: {
      situation: 'أبو أحمد، 68 سنة، HbA1c بنسبة 7.4% في فحص روتيني.',
      background: 'لا يوجد حماض كيتوني سكري موثق سابقاً؛ الفحص اقترح متابعة.',
      assessment: 'ضبط سكر الدم يتطلب مراجعة مختص؛ تخطيط لإدارة نمط الحياة والعلاج الدوائي.',
      recommendation: 'حُجز موعد الغدد الصم؛ بُدئ بسجل قياس السكر الصائم.',
    },
    timelineAr: {
      '1': { titleAr: 'صدرت النتيجة', detailAr: 'أبلغ المختبر عن HbA1c بنسبة 7.4%.' },
      '2': { titleAr: 'تم إبلاغ المريض', detailAr: 'اتصل المنسق بالمريض وشرح له الفحص.' },
      '3': { titleAr: 'تم التحقق من الفهم', detailAr: 'اكتملت إعادة الشرح بنجاح.' },
      '4': { titleAr: 'قُبلت الإحالة', detailAr: 'قبلت عيادة الغدد الصم الإحالة.' },
      '5': { titleAr: 'رُتب الموعد', detailAr: 'أُكد التاريخ مع المريض ليوم 28 تشرين الأول.' },
      '6': { titleAr: 'أُغلقت الحالة', detailAr: 'أُغلقت مع دليل إتمام موثق.' },
    },
  },
  'RY-002': {
    testOrderAr: {
      orderedByAr: 'د. منى (محاكاة)',
      reasonAr: 'فحص سرطان ثدي كل سنتين (USPSTF 2024، العمر 55).'
    },
    resultReviewAr: {
      reviewedByAr: 'د. منى (محاكاة)',
      decisionAr: 'BI-RADS 0 — يلزم تقييم تشخيصي؛ بُدئت إحالة عيادة تقييم الثدي.'
    },
    typeAr: 'تصوير الثدي الشعاعي',
    resultSummaryAr: 'موجودات تحتاج تقييماً إضافياً',
    plainLanguageExplanationAr: 'أظهر تصوير الثدي كثافة نسيجية تتطلب تصويراً بالموجات فوق الصوتية ولقطات موجهة إضافية.',
    whatItDoesNotEstablishAr: 'لا يثبت وجود ورم خبيث؛ معظم التقييمات الإضافية تخص تغيّرات حميدة.',
    scenarioDescriptionAr: 'تم الإبلاغ وتأكد الفهم؛ إحالة عيادة تقييم الثدي ما تزال معلقة بعد تجاوز المهلة؛ حالة متأخرة تتطلب تصعيداً.',
    referralTargetAr: 'عيادة تقييم الثدي',
    appointmentInfoAr: 'بانتظار رد استقبال العيادة',
    notificationSlaAr: '48 ساعة',
    teachBackAr: 'تدرك المريضة أن صوراً تشخيصية إضافية لازمة قبل أي تشخيص.',
    sbarAr: {
      situation: 'أم سارة، 55 سنة، تصوير ثدي فحصي يتطلب تقييماً تصويرياً إضافياً.',
      background: 'أُبلغت بسرعة في اليوم الثاني؛ أُرسلت الإحالة إلى عيادة تقييم الثدي.',
      assessment: 'تجاوز رد الإحالة مهلة 14 يوماً دون تأكيد.',
      recommendation: 'تصعيد فوري إلى منسق العيادة الرئيسي.',
    },
    timelineAr: {
      '1': { titleAr: 'صدرت النتيجة', detailAr: 'صُنف تصوير الثدي الفحصي BI-RADS 0.' },
      '2': { titleAr: 'تم إبلاغ المريضة', detailAr: 'أُبلغت المريضة وطُمئنت مع إعادة شرح.' },
      '3': { titleAr: 'أُرسلت الإحالة', detailAr: 'أُرسلت الإحالة إلى عيادة تقييم الثدي.' },
      '4': { titleAr: 'تم تجاوز المهلة', detailAr: 'لم يصل تأكيد استقبال ضمن المهلة المستهدفة.' },
    },
  },
  'RY-003': {
    testOrderAr: {
      orderedByAr: 'برنامج الصحة المهنية',
      reasonAr: 'فحص ارتفاع ضغط الدم في مكان العمل.'
    },
    resultReviewAr: {
      reviewedByAr: 'د. فيصل (محاكاة)',
      decisionAr: 'قراءات عيادة مرتفعة؛ صدر بروتوكول سجل ضغط منزلي للتأكيد.'
    },
    typeAr: 'ضغط الدم',
    resultSummaryAr: '152/96 في قياس متكرر',
    plainLanguageExplanationAr: 'قراءات ضغط الدم في العيادة مرتفعة في قياسين منفصلين.',
    whatItDoesNotEstablishAr: 'لا يثبت ارتفاع ضغط مستمراً دون بروتوكول تأكيد خارج العيادة.',
    scenarioDescriptionAr: 'أُغلقت مع دليل موثق: رُوجع سجل ضغط منزلي لأسبوعين في زيارة متابعة.',
    referralTargetAr: 'متابعة الرعاية الأولية',
    appointmentInfoAr: 'اكتملت زيارة المتابعة بتاريخ 2026-10-08',
    notificationSlaAr: '24 ساعة',
    closureEvidenceAr: 'رُوجع سجل ضغط منزلي موثق لـ14 يوماً؛ المتوسط 128/82 ملم زئبق؛ نُصح المريض.',
    teachBackAr: 'أظهر المريض وضع الكفة الصحيح وتسجيل القياس مرتين يومياً بدقة.',
    timelineAr: {
      '1': { titleAr: 'ضغط فحصي', detailAr: 'سُجل 152/96 ملم زئبق في فحص الصحة المهنية.' },
      '2': { titleAr: 'تم إبلاغ المريض', detailAr: 'قُدم بروتوكول القياس المنزلي وسجله.' },
      '3': { titleAr: 'مراجعة المتابعة', detailAr: 'رُوجع سجل أسبوعين المنزلي؛ المتوسط طبيعي.' },
      '4': { titleAr: 'أُغلقت الحالة', detailAr: 'إغلاق موثق مع الدليل.' },
    },
  },
  'RY-004': {
    testOrderAr: {
      orderedByAr: 'د. ليلى (محاكاة)',
      reasonAr: 'صدر فحص FIT لفحص القولون ضمن مسار الفحص.'
    },
    resultReviewAr: {
      reviewedByAr: 'د. ليلى (محاكاة)',
      decisionAr: 'تأكدت إيجابية FIT؛ بُدئت إحالة تنظير قولون تشخيصي.'
    },
    typeAr: 'فحص الدم الخفي في البراز (FIT)',
    resultSummaryAr: 'إيجابي',
    plainLanguageExplanationAr: 'رصد فحص الدم الخفي المناعي آثاراً مجهرية لدم في العينة.',
    whatItDoesNotEstablishAr: 'لا يثبت وجود سرطان ولا يحدد مكان السليلة؛ يتطلب تنظير قولون تشخيصياً.',
    scenarioDescriptionAr: 'تم إبلاغ المريضة؛ إحالة الجهاز الهضمي لتنظير القولون معلقة.',
    referralTargetAr: 'الجهاز الهضمي (التنظير)',
    appointmentInfoAr: 'الإحالة قيد المراجعة لدى قسم الجهاز الهضمي',
    notificationSlaAr: '24 ساعة',
    timelineAr: {
      '1': { titleAr: 'صدرت النتيجة', detailAr: 'وصلت نتيجة FIT إيجابية.' },
      '2': { titleAr: 'تم إبلاغ المريضة', detailAr: 'شُرحت الحاجة لتنظير قولون تشخيصي.' },
      '3': { titleAr: 'أُرسلت الإحالة', detailAr: 'أُرسلت إلى فرز التنظير.' },
    },
  },
  'RY-005': {
    testOrderAr: {
      orderedByAr: 'برنامج فحص السكري',
      reasonAr: 'فحص ما قبل السكري (USPSTF 2021).'
    },
    typeAr: 'فحص السكر التراكمي',
    resultSummaryAr: '6.1%',
    plainLanguageExplanationAr: 'يقع HbA1c ضمن مجال ما قبل السكري (5.7% – 6.4%).',
    whatItDoesNotEstablishAr: 'لا يثبت الإصابة بالسكري؛ يشير إلى خطر مرتفع قد تساعد فيه تدخلات نمط الحياة.',
    scenarioDescriptionAr: 'لا يوجد مسؤول مسند؛ لم يُبلَّغ بعد أربعة أيام من النتيجة؛ تنبيه حالة غير مسندة.',
    referralTargetAr: 'برنامج نمط الحياة والعافية',
    appointmentInfoAr: 'غير مجدول',
    notificationSlaAr: '48 ساعة',
    timelineAr: {
      '1': { titleAr: 'صدرت النتيجة', detailAr: 'رُفع HbA1c بنسبة 6.1% إلى النظام.' },
      '2': { titleAr: 'راية عدم الإسناد', detailAr: 'لم يطالب أي طبيب بملكية الحالة منذ 4 أيام.' },
    },
  },
  'RY-006': {
    testOrderAr: {
      orderedByAr: 'د. سمر (محاكاة)',
      reasonAr: 'فحص عنق رحم روتيني.'
    },
    resultReviewAr: {
      reviewedByAr: 'د. سمر (محاكاة)',
      decisionAr: 'تأكد LSIL؛ بُدئت إحالة التنظير واكتملت إعادة الشرح.'
    },
    typeAr: 'مسحة عنق الرحم',
    resultSummaryAr: 'تغيّرات منخفضة الدرجة',
    plainLanguageExplanationAr: 'أظهرت خلايا عنق الرحم آفة حرشفية داخل الظهارة منخفضة الدرجة (LSIL).',
    whatItDoesNotEstablishAr: 'لا يشير إلى سرطان عنق الرحم؛ غالباً يزول تلقائياً لكنه يستدعي مراجعة مختص.',
    scenarioDescriptionAr: 'تم الإبلاغ وتأكد الفهم؛ حالة إحالة النسائية غير معروفة وجارٍ التحقق منها.',
    referralTargetAr: 'عيادة تنظير عنق الرحم النسائية',
    appointmentInfoAr: 'جارٍ التحقق من استلام الإحالة لدى مكتب النسائية',
    notificationSlaAr: '48 ساعة',
    teachBackAr: 'تدرك المريضة أن هذا تغيّر ما قبل تشخيصي ووافقت على حجز التنظير.',
    timelineAr: {
      '1': { titleAr: 'صدرت النتيجة', detailAr: 'أبلغت الخلايا عن LSIL.' },
      '2': { titleAr: 'تم إبلاغ المريضة', detailAr: 'نوقشت الموجودات وتُحقق من الفهم بإعادة الشرح.' },
      '3': { titleAr: 'أُرسلت الإحالة', detailAr: 'وضعت الإحالة في قائمة النسائية.' },
      '4': { titleAr: 'التحقق جارٍ', detailAr: 'يتابع المنسق استلام الإحالة.' },
    },
  },
  'RY-007': {
    testOrderAr: {
      orderedByAr: 'د. هشام (محاكاة)',
      reasonAr: 'فحص سرطان الرئة — تاريخ تدخين مؤهل (USPSTF 2021).'
    },
    resultReviewAr: {
      reviewedByAr: 'د. هشام (محاكاة)',
      decisionAr: 'عقدة 4 ملم — تصوير مراقبة منخفض الجرعة بعد 6 أشهر وفق البروتوكول؛ لا حاجة لتدخل غازٍ.'
    },
    typeAr: 'تصوير مقطعي منخفض الجرعة',
    resultSummaryAr: 'عقدة رئوية صغيرة، تحتاج تصوير مراقبة',
    plainLanguageExplanationAr: 'رصد التصوير المقطعي منخفض الجرعة عقدة رئوية 4 ملم غير محددة تتطلب متابعة تصويرية.',
    whatItDoesNotEstablishAr: 'لا يثبت وجود خباثة؛ الغالبية العظمى من العقد الصغيرة أورام حبيبية حميدة.',
    scenarioDescriptionAr: 'تم إبلاغ المريض؛ جُدول تصوير المراقبة.',
    referralTargetAr: 'مراقبة الأمراض الصدرية',
    appointmentInfoAr: 'حُجز تصوير مقطعي منخفض الجرعة للمراقبة بعد 6 أشهر',
    notificationSlaAr: '48 ساعة',
    teachBackAr: 'يدرك المريض أن العقدة صغيرة وأن تصوير المراقبة المنتظم هو النهج الآمن القياسي.',
    timelineAr: {
      '1': { titleAr: 'بُلّغ عن التصوير', detailAr: 'عقدة صلبة غير متكلسة 4 ملم في الفص العلوي الأيمن.' },
      '2': { titleAr: 'تم إبلاغ المريض', detailAr: 'استشارة هاتفية مع د. هشام.' },
      '3': { titleAr: 'حُجزت المراقبة', detailAr: 'جُدول تصوير مقطعي منخفض الجرعة متكرر لنيسان 2027.' },
    },
  },
  'RY-008': {
    testOrderAr: {
      orderedByAr: 'د. منى (محاكاة)',
      reasonAr: 'فحص سرطان ثدي كل سنتين (USPSTF 2024، العمر 52).'
    },
    resultReviewAr: {
      reviewedByAr: 'د. منى (محاكاة)',
      decisionAr: 'BI-RADS 1 طبيعي؛ استدعاء روتيني بعد سنتين.'
    },
    typeAr: 'تصوير الثدي الشعاعي',
    resultSummaryAr: 'نتيجة طبيعية',
    plainLanguageExplanationAr: 'لم يظهر تصوير الثدي الفحصي الثنائي أي كتل مشبوهة أو تكلسات أو تشوّه بنيوي.',
    whatItDoesNotEstablishAr: 'لا يلغي خطر المستقبل؛ يُنصح بفحص روتيني كل سنتين.',
    scenarioDescriptionAr: 'تم إبلاغ المريضة؛ لا إجراء إضافي؛ إغلاق موثق.',
    referralTargetAr: 'لا حاجة',
    appointmentInfoAr: 'الفحص الروتيني التالي في تشرين الأول 2028',
    notificationSlaAr: '7 أيام',
    closureEvidenceAr: 'أُرسل تقرير BI-RADS 1 الطبيعي عبر البوابة الآمنة؛ سُجل تأكيد المريضة؛ عُلمت الحالة كمكتملة.',
    timelineAr: {
      '1': { titleAr: 'صدرت النتيجة', detailAr: 'BI-RADS 1 (طبيعي).' },
      '2': { titleAr: 'تم إبلاغ المريضة', detailAr: 'سُلمت رسالة النتائج عبر البوابة.' },
      '3': { titleAr: 'أُغلقت الحالة', detailAr: 'إغلاق موثق مع نتيجة طبيعية مُتحقق منها.' },
    },
  },
  'RY-009': {
    testOrderAr: {
      orderedByAr: 'د. طارق (محاكاة)',
      reasonAr: 'فحص FIT سنوي للقولون (USPSTF 2021).'
    },
    resultReviewAr: {
      reviewedByAr: 'د. طارق (محاكاة)',
      decisionAr: 'FIT سلبي؛ استدعاء سنوي روتيني بعد 12 شهراً.'
    },
    typeAr: 'فحص الدم الخفي في البراز (FIT)',
    resultSummaryAr: 'سلبي',
    plainLanguageExplanationAr: 'لم يرصد فحص الدم الخفي المناعي السنوي دماً خفياً.',
    whatItDoesNotEstablishAr: 'لا يستبعد آفات غير نازفة؛ ينطبق تكرار الفحص السنوي الروتيني.',
    scenarioDescriptionAr: 'تم إبلاغ المريض؛ إغلاق موثق.',
    referralTargetAr: 'لا حاجة',
    appointmentInfoAr: 'فحص FIT التالي في تشرين الأول 2027',
    notificationSlaAr: '7 أيام',
    closureEvidenceAr: 'وُثقت نتيجة FIT السلبية في السجل الصحي؛ أُبلغ المريض برسالة نصية؛ وُضعت راية استدعاء بعد 12 شهراً.',
    timelineAr: {
      '1': { titleAr: 'صدرت النتيجة', detailAr: 'FIT سلبي.' },
      '2': { titleAr: 'تم إبلاغ المريض', detailAr: 'أُرسل إشعار برسالة نصية وأُكد تسليمه.' },
      '3': { titleAr: 'أُغلقت الحالة', detailAr: 'اكتمل الإغلاق الموثق.' },
    },
  },
  'RY-010': {
    typeAr: 'فحص السكر التراكمي',
    resultSummaryAr: 'وصلت النتيجة؛ الاستقبال غير مكتمل',
    plainLanguageExplanationAr: 'وصلت نتيجة المختبر دون ملف بيانات ديموغرافية أو تسجيل مكتمل للمريضة.',
    whatItDoesNotEstablishAr: 'لا يمكن التحقق من الدواعي السريرية أو التاريخ الطبي حتى يكتمل التسجيل.',
    scenarioDescriptionAr: 'فُتحت الحالة؛ تفاصيل الاستقبال ما تزال ناقصة.',
    referralTargetAr: 'تسجيل استقبال المرضى',
    appointmentInfoAr: 'غير مجدول — الاستقبال معلق',
    notificationSlaAr: 'غير متوفرة',
    resultDateAr: 'غير متوفر',
    timelineAr: {
      '1': { titleAr: 'استقبال غير مكتمل', detailAr: 'عُلمت نتيجة الفحص بسبب بيانات ديموغرافية ناقصة.' },
    },
  },
  'RY-011': {
    testOrderAr: {
      orderedByAr: 'برنامج فحص كشك الصحة',
      reasonAr: 'فحص ضغط دم مجتمعي.'
    },
    resultReviewAr: {
      reviewedByAr: 'د. فيصل (محاكاة)',
      decisionAr: 'قراءة مرتفعة بشكل ملحوظ؛ إبلاغ في اليوم نفسه وحُجز تقييم عاجل صباح الغد.'
    },
    typeAr: 'ضغط الدم',
    resultSummaryAr: '168/102 عند الفحص',
    plainLanguageExplanationAr: 'سُجل ارتفاع ملحوظ في الضغطين الانقباضي والانبساطي خلال فحص كشك الصحة الأولي.',
    whatItDoesNotEstablishAr: 'لا يثبت ارتفاع ضغط لا رجعة فيه؛ يتطلب تقييماً سريرياً عاجلاً وقياساً متكرراً.',
    scenarioDescriptionAr: 'أُبلغ المريض في اليوم نفسه؛ رُتبت مراجعة طبية عاجلة. هذه محاكاة اصطناعية للمتابعة، وليست تشخيصاً.',
    referralTargetAr: 'رعاية أولية بوصول سريع',
    appointmentInfoAr: 'تقييم عاجل مجدول غداً صباحاً 09:00',
    notificationSlaAr: 'عاجل في اليوم نفسه',
    teachBackAr: 'نُصح المريض بالراحة وتجنب الجهد الشديد وإبلاغ أي صداع أو أعراض صدرية فوراً.',
    timelineAr: {
      '1': { titleAr: 'عُلمت القراءة العالية', detailAr: 'ضغط 168/102 ملم زئبق عند الفحص.' },
      '2': { titleAr: 'إبلاغ في اليوم نفسه', detailAr: 'اتصلت الممرضة بالمريض فوراً.' },
      '3': { titleAr: 'حُجز موعد عاجل', detailAr: 'حُجز تقييم ذو أولوية صباح الغد.' },
    },
  },
  'RY-012': {
    testOrderAr: {
      orderedByAr: 'د. منى (محاكاة)',
      reasonAr: 'فحص سرطان ثدي كل سنتين (USPSTF 2024، العمر 49).'
    },
    resultReviewAr: {
      reviewedByAr: 'د. منى (محاكاة)',
      decisionAr: 'كثافة بؤرية غير متماثلة — إحالة تصوير تشخيصي قيد التحضير.'
    },
    typeAr: 'تصوير الثدي الشعاعي',
    resultSummaryAr: 'موجودات تحتاج تقييماً إضافياً',
    plainLanguageExplanationAr: 'أظهر تصوير الثدي الفحصي الروتيني كثافة بؤرية غير متماثلة.',
    whatItDoesNotEstablishAr: 'لا يثبت وجود خباثة؛ يلزم تصوير بالموجات فوق الصوتية تشخيصي إضافي.',
    scenarioDescriptionAr: 'تم إبلاغ المريضة؛ الإحالة قيد التحضير.',
    referralTargetAr: 'تصوير الثدي التشخيصي',
    appointmentInfoAr: 'حزمة الإحالة قيد التحضير',
    notificationSlaAr: '48 ساعة',
    timelineAr: {
      '1': { titleAr: 'صدرت النتيجة', detailAr: 'أُوصي بتصوير إضافي.' },
      '2': { titleAr: 'تم إبلاغ المريضة', detailAr: 'أُبلغت المريضة وبُدئت الإحالة.' },
    },
  },
  'RY-013': {
    testOrderAr: {
      orderedByAr: 'فريق خروج الجناح 4',
      reasonAr: 'خطة متابعة ما بعد الخروج بعد إقامة 9 أيام بسبب التهاب صدري.'
    },
    resultReviewAr: {
      reviewedByAr: 'الممرضة سارة (محاكاة)',
      decisionAr: 'تقييمات الالتزام اليومية فعّالة؛ متابعة العيادة بعد 7 أيام؛ فحص الدم المعلق قيد التتبع.'
    },
    typeAr: 'متابعة ما بعد الخروج',
    resultSummaryAr: 'صدرت خطة الخروج بعد إقامة تسعة أيام؛ قائمة الأدوية تحتاج متابعة التزام يومية.',
    plainLanguageExplanationAr: 'خرج المريض إلى المنزل بعد علاج التهاب صدري شديد. يتطلب مراقبة التزام بأربعة أدوية خروج.',
    whatItDoesNotEstablishAr: 'لا يثبت زوال التهاب الرئة بالكامل؛ يتطلب مراجعة سريرية وفحص دم معلقاً.',
    scenarioDescriptionAr: 'على المسار الصحيح. نفس شخصية محمود الخيالية كما في التبويب الثاني، المرحلة الثالثة.',
    referralTargetAr: 'عيادة الصدرية الخارجية',
    appointmentInfoAr: 'موعد متابعة بعد 7 أيام (2026-10-27)',
    notificationSlaAr: 'تقييم يومي',
    sbarAr: {
      situation: 'محمود، 68 سنة، في المنزل بعد إقامة 9 أيام بسبب التهاب صدري.',
      background: 'وُصف له أموكسيسيلين وباراسيتامول وأوميبرازول وسالبوتامول.',
      assessment: 'يتعافى في المنزل؛ نتيجة فحص دم واحدة معلقة خلال 3 أيام؛ التقييم اليومي فعّال.',
      recommendation: 'تتبع مقاييس التعافي اليومية؛ حضور متابعة العيادة بعد 7 أيام.',
    },
    timelineAr: {
      '1': { titleAr: 'خرج إلى المنزل', detailAr: 'سُلم ملخص الخروج للمريض مع 4 أدوية.' },
      '2': { titleAr: 'تقييم اليوم الأول', detailAr: 'سُجلت الأدوية كمأخوذة؛ التنفس مستقر.' },
    },
  },
  'RY-014': {
    testOrderAr: {
      orderedByAr: 'فريق خروج الجناح 4',
      reasonAr: 'متابعة فحص جرح جراحي بعد الخروج.'
    },
    resultReviewAr: {
      reviewedByAr: 'د. كريم (محاكاة)',
      decisionAr: 'أُرسلت إحالة المتابعة الجراحية إلى العيادة الخارجية؛ القبول معلق.'
    },
    typeAr: 'متابعة ما بعد الخروج',
    resultSummaryAr: 'أُرسلت إحالة موعد المتابعة قبل ستة أيام ولم تُقبل بعد.',
    plainLanguageExplanationAr: 'أُرسلت إحالة متابعة جراحية بعد الخروج إلى عيادة الجراحة الخارجية لكن لم يُسجل قبول.',
    whatItDoesNotEstablishAr: 'لا يشير إلى مضاعفة جراحية؛ يشير إلى تأخير إداري في جدولة فحص الجرح.',
    scenarioDescriptionAr: 'حالة متأخرة تتطلب تصعيداً.',
    referralTargetAr: 'عيادة الجراحة الخارجية',
    appointmentInfoAr: 'بانتظار رد جدولة العيادة',
    notificationSlaAr: '3 أيام',
    timelineAr: {
      '1': { titleAr: 'أُرسلت الإحالة', detailAr: 'أُرسلت إحالة متابعة الخروج.' },
      '2': { titleAr: 'انقضت المهلة', detailAr: 'لم يُؤكد موعد ضمن هدف 3 أيام.' },
      '3': { titleAr: 'راية التأخر', detailAr: 'انقضت 6 أيام دون قبول؛ يلزم تصعيد.' },
    },
  },
  'RY-015': {
    testOrderAr: {
      orderedByAr: 'د. طارق (محاكاة)',
      reasonAr: 'لوحة وظائف كلى عند الخروج (كرياتينين وشوارد).'
    },
    typeAr: 'متابعة ما بعد الخروج',
    resultSummaryAr: 'أُخذ فحص وظائف الكلى قبل أربعة أيام؛ النتيجة لم تصدر بعد.',
    plainLanguageExplanationAr: 'عينة الكرياتينين والشوارد المسحوبة عند الخروج ما تزال بانتظار الإصدار النهائي من المختبر.',
    whatItDoesNotEstablishAr: 'لا يثبت قصوراً كلوياً؛ النتيجة ما تزال قيد المعالجة.',
    scenarioDescriptionAr: 'النتيجة معلقة؛ لم يُبلَّغ المريض بعد.',
    referralTargetAr: 'مراجعة الكلى إذا كان GFR أقل من 60',
    appointmentInfoAr: 'يعتمد على إصدار المختبر',
    notificationSlaAr: 'خلال 24 ساعة من إصدار النتيجة',
    resultDateAr: 'لم يصدر بعد (أُخذ قبل 4 أيام)',
    timelineAr: {
      '1': { titleAr: 'سُحب الدم', detailAr: 'سُحبت الشوارد ولوحة الكلى عند الخروج.' },
      '2': { titleAr: 'تم فحص الحالة', detailAr: 'العينة قيد المعالجة؛ لم يُبلَّغ المريض بعد.' },
    },
  },
};
