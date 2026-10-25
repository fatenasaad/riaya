// Verified lab reference module — general adult reference ranges and plain
// explanations for a small set of common tests, each range taken from a
// named published source (verified 24 Oct 2026):
// - Glucose bands & A1C bands: MedlinePlus (Prediabetes page; A1C page;
//   Diabetes encyclopedia article) — fasting normal <=99 mg/dL, prediabetes
//   100–125, diabetes >=126; A1C normal <5.7%, prediabetes 5.7–6.4%,
//   diabetes >=6.5%; 2-hour/random thresholds <140 / 140–199 / >=200 mg/dL.
// - Hemoglobin: MedlinePlus encyclopedia — male 13.8–17.2, female 12.1–15.1 g/dL.
// - Creatinine: MedlinePlus encyclopedia (current) — men 0.7–1.3 mg/dL
//   (62–115 µmol/L), women 0.5–0.95 mg/dL (44–84 µmol/L).
// - Potassium 3.7–5.2 mmol/L and Sodium 135–145 mmol/L: MedlinePlus (NIH)
//   electrolyte ranges as published in its encyclopedia set.
// - WBC 4.5–11.0 and Platelets 150–450 (×10⁹/L): standard MedlinePlus CBC ranges.
// - TSH 0.5–5.0 mIU/L: general adult range (Cleveland Clinic / MedlinePlus).
// The app NEVER diagnoses: it places a value inside a published GENERAL band,
// explains the test in plain language, lists general possible reasons for
// high/low values, and always closes by deferring to the treating doctor and
// to the range printed on the patient's own report.

export type LabBandKind = 'low' | 'normal' | 'borderline' | 'high';

export interface LabBand {
  upTo: number; // exclusive upper bound in canonical units
  kind: LabBandKind;
  labelAr: string;
  labelEn: string;
}

export interface LabBandSet {
  key: string; // 'default' | 'fasting' | 'random' | 'male' | 'female'
  labelAr: string;
  labelEn: string;
  rangeTextAr: string;
  rangeTextEn: string;
  bands: LabBand[];
}

export interface LabEntry {
  id: string;
  nameAr: string;
  nameEn: string;
  aliases: string[];
  canonicalUnit: string;
  bandSets: LabBandSet[];
  measuresAr: string;
  measuresEn: string;
  highAr: string;
  highEn: string;
  lowAr: string;
  lowEn: string;
  sourceName: string;
  sourceUrl?: string;
}

const B = (upTo: number, kind: LabBandKind, labelAr: string, labelEn: string): LabBand => ({ upTo, kind, labelAr, labelEn });

export const LAB_ENTRIES: LabEntry[] = [
  {
    id: 'glucose',
    nameAr: 'سكر الدم (الغلوكوز)',
    nameEn: 'Blood glucose (blood sugar)',
    aliases: ['السكر', 'سكر الدم', 'سكر صائم', 'سكر عشوائي', 'السكر الصائم', 'السكر العشوائي', 'الغلوكوز', 'الجلوكوز', 'glucose', 'blood sugar'],
    canonicalUnit: 'mg/dL',
    bandSets: [
      {
        key: 'fasting', labelAr: 'سكر صائم', labelEn: 'Fasting glucose',
        rangeTextAr: 'المجالات العامة للصائم: طبيعي حتى 99، مقدمات سكري 100–125، مجال السكري 126 فأكثر (mg/dL)',
        rangeTextEn: 'General fasting bands: normal up to 99, prediabetes 100–125, diabetes range 126 or higher (mg/dL)',
        bands: [
          B(70, 'low', 'أدنى من الطبيعي — ضمن مجال انخفاض سكر الدم (أقل من 70)', 'Below normal — in the low blood sugar range (under 70)'),
          B(100, 'normal', 'ضمن المجال الطبيعي العام لسكر الصائم', 'Within the general normal range for fasting glucose'),
          B(126, 'borderline', 'فوق الطبيعي — ضمن المجال المعروف بمقدمات السكري', 'Above normal — in the range known as prediabetes'),
          B(Infinity, 'high', 'ضمن المجال المتوافق مع تشخيص السكري عند تأكيده بإعادة القياس عند الطبيب', 'In the range consistent with a diabetes diagnosis when confirmed by repeat testing with your doctor'),
        ],
      },
      {
        key: 'random', labelAr: 'سكر عشوائي / بعد الأكل', labelEn: 'Random / post-meal glucose',
        rangeTextAr: 'المجالات العامة (قياس بعد ساعتين من الأكل أو اختبار التحمل): طبيعي أقل من 140، فوق الطبيعي 140–199، مجال السكري 200 فأكثر (mg/dL). توقيت القياس بالنسبة للأكل يغيّر التفسير.',
        rangeTextEn: 'General bands (2 hours after eating or a glucose tolerance test): normal under 140, above normal 140–199, diabetes range 200 or higher (mg/dL). Timing relative to food changes interpretation.',
        bands: [
          B(70, 'low', 'أدنى من الطبيعي — ضمن مجال انخفاض سكر الدم (أقل من 70)', 'Below normal — in the low blood sugar range (under 70)'),
          B(140, 'normal', 'ضمن المجال العام المتوقع بعد الأكل', 'Within the general expected range after food'),
          B(200, 'borderline', 'فوق المجال العام بعد الأكل', 'Above the general post-meal range'),
          B(Infinity, 'high', 'ضمن المجال المتوافق مع تشخيص السكري عند تأكيده عند الطبيب، خاصة مع وجود أعراض', 'In the range consistent with a diabetes diagnosis when confirmed by your doctor, especially with symptoms'),
        ],
      },
    ],
    measuresAr: 'يقيس كمية الغلوكوز (السكر) في الدم، وهو مصدر الطاقة الأساسي للجسم، وينظّمه بشكل رئيسي هرمون الإنسولين.',
    measuresEn: 'It measures the amount of glucose (sugar) in the blood — the body\'s main energy source, regulated mainly by insulin.',
    highAr: 'بشكل عام، قد يرتفع سكر الدم مع: مرض السكري أو مقدماته، المرض الحاد أو الالتهابات أو الضغط الجسدي، بعض الأدوية (مثل الكورتيزون)، أو مشاكل في البنكرياس.',
    highEn: 'In general, blood sugar may be higher with: diabetes or prediabetes, acute illness, infections or physical stress, some medicines (such as steroids), or pancreas problems.',
    lowAr: 'بشكل عام، قد ينخفض سكر الدم مع: تخطي الوجبات أو الصيام الطويل، جرعة زائدة من أدوية السكري أو الإنسولين، الجهد البدني الشديد، أو شرب الكحول.',
    lowEn: 'In general, blood sugar may be lower with: skipped meals or long fasting, too much diabetes medicine or insulin, intense physical exertion, or alcohol.',
    sourceName: 'MedlinePlus — U.S. National Library of Medicine',
    sourceUrl: 'https://medlineplus.gov/prediabetes.html',
  },
  {
    id: 'hba1c',
    nameAr: 'السكر التراكمي (HbA1c)',
    nameEn: 'HbA1c (A1C)',
    aliases: ['التراكمي', 'سكر تراكمي', 'السكر التراكمي', 'hba1c', 'a1c', 'الهيموغلوبين السكري'],
    canonicalUnit: '%',
    bandSets: [
      {
        key: 'default', labelAr: 'السكر التراكمي', labelEn: 'HbA1c',
        rangeTextAr: 'المجالات العامة: طبيعي أقل من 5.7%، مقدمات سكري 5.7–6.4%، مجال السكري 6.5% فأكثر',
        rangeTextEn: 'General bands: normal below 5.7%, prediabetes 5.7–6.4%, diabetes range 6.5% or higher',
        bands: [
          B(5.7, 'normal', 'ضمن المجال الطبيعي العام', 'Within the general normal range'),
          B(6.5, 'borderline', 'ضمن المجال المعروف بمقدمات السكري', 'In the range known as prediabetes'),
          B(Infinity, 'high', 'ضمن المجال المتوافق مع تشخيص السكري عند تأكيده عند الطبيب', 'In the range consistent with a diabetes diagnosis when confirmed by your doctor'),
        ],
      },
    ],
    measuresAr: 'يعكس متوسط سكر الدم خلال الأشهر الثلاثة الماضية تقريباً، لأنه يقيس نسبة الهيموغلوبين المرتبط بالسكر داخل كريات الدم الحمراء.',
    measuresEn: 'It reflects average blood sugar over roughly the past three months, by measuring the share of hemoglobin carrying sugar inside red blood cells.',
    highAr: 'بشكل عام، ارتفاع التراكمي يعني أن متوسط سكر الدم كان مرتفعاً خلال الأشهر الماضية (سكري أو مقدمات سكري غير مضبوطة).',
    highEn: 'In general, a high A1C means average blood sugar has been high over past months (diabetes or prediabetes that is not controlled).',
    lowAr: 'قد تتأثر دقة التراكمي بحالات مثل فقر الدم، فقدان الدم، أو بعض أمراض الكلى والكبد، فيعطي قراءة لا تعكس السكر الحقيقي — طبيبك يقرأه مع باقي تحاليلك.',
    lowEn: 'A1C accuracy can be affected by conditions such as anemia, blood loss, or some kidney and liver diseases, giving a reading that does not reflect true blood sugar — your doctor reads it together with your other results.',
    sourceName: 'MedlinePlus — U.S. National Library of Medicine',
    sourceUrl: 'https://medlineplus.gov/a1c.html',
  },
  {
    id: 'hemoglobin',
    nameAr: 'الهيموغلوبين (خضاب الدم)',
    nameEn: 'Hemoglobin',
    aliases: ['الهيموغلوبين', 'هيموغلوبين', 'الخضاب', 'خضاب الدم', 'hemoglobin', 'haemoglobin'],
    canonicalUnit: 'g/dL',
    bandSets: [
      {
        key: 'male', labelAr: 'لدى الرجال', labelEn: 'For men',
        rangeTextAr: 'المجال العام لدى الرجال: 13.8–17.2 g/dL',
        rangeTextEn: 'General range for men: 13.8–17.2 g/dL',
        bands: [B(13.8, 'low', 'أدنى من المجال العام للرجال', 'Below the general range for men'), B(17.2, 'normal', 'ضمن المجال العام للرجال', 'Within the general range for men'), B(Infinity, 'high', 'أعلى من المجال العام للرجال', 'Above the general range for men')],
      },
      {
        key: 'female', labelAr: 'لدى النساء', labelEn: 'For women',
        rangeTextAr: 'المجال العام لدى النساء: 12.1–15.1 g/dL',
        rangeTextEn: 'General range for women: 12.1–15.1 g/dL',
        bands: [B(12.1, 'low', 'أدنى من المجال العام للنساء', 'Below the general range for women'), B(15.1, 'normal', 'ضمن المجال العام للنساء', 'Within the general range for women'), B(Infinity, 'high', 'أعلى من المجال العام للنساء', 'Above the general range for women')],
      },
    ],
    measuresAr: 'الهيموغلوبين هو البروتين داخل كريات الدم الحمراء الذي يحمل الأكسجين من الرئتين إلى أنسجة الجسم.',
    measuresEn: 'Hemoglobin is the protein inside red blood cells that carries oxygen from the lungs to the body\'s tissues.',
    highAr: 'بشكل عام، قد يرتفع الهيموغلوبين مع: الجفاف، التدخين، السكن في المرتفعات، أو بعض أمراض الرئة والقلب.',
    highEn: 'In general, hemoglobin may be higher with: dehydration, smoking, living at high altitude, or some lung and heart diseases.',
    lowAr: 'بشكل عام، انخفاض الهيموغلوبين يعني فقر دم، وقد يحدث مع: فقدان الدم (نزيف)، نقص الحديد أو فيتامين B12 أو الفولات، الحمل، أو الأمراض المزمنة.',
    lowEn: 'In general, low hemoglobin means anemia, which may occur with: blood loss (bleeding), iron, vitamin B12 or folate deficiency, pregnancy, or chronic diseases.',
    sourceName: 'MedlinePlus Medical Encyclopedia — U.S. National Library of Medicine',
  },
  {
    id: 'creatinine',
    nameAr: 'الكرياتينين',
    nameEn: 'Creatinine',
    aliases: ['الكرياتينين', 'كرياتينين', 'creatinine'],
    canonicalUnit: 'mg/dL',
    bandSets: [
      {
        key: 'male', labelAr: 'لدى الرجال', labelEn: 'For men',
        rangeTextAr: 'المجال العام لدى الرجال: 0.7–1.3 mg/dL',
        rangeTextEn: 'General range for men: 0.7–1.3 mg/dL',
        bands: [B(0.7, 'low', 'أدنى من المجال العام للرجال', 'Below the general range for men'), B(1.3, 'normal', 'ضمن المجال العام للرجال', 'Within the general range for men'), B(Infinity, 'high', 'أعلى من المجال العام للرجال', 'Above the general range for men')],
      },
      {
        key: 'female', labelAr: 'لدى النساء', labelEn: 'For women',
        rangeTextAr: 'المجال العام لدى النساء: 0.5–0.95 mg/dL',
        rangeTextEn: 'General range for women: 0.5–0.95 mg/dL',
        bands: [B(0.5, 'low', 'أدنى من المجال العام للنساء', 'Below the general range for women'), B(0.95, 'normal', 'ضمن المجال العام للنساء', 'Within the general range for women'), B(Infinity, 'high', 'أعلى من المجال العام للنساء', 'Above the general range for women')],
      },
    ],
    measuresAr: 'الكرياتينين فضلات كيميائية ناتجة عن العضلات، تتخلص منها الكليتان — فيُستخدم مستواه في الدم كمؤشر على كفاءة عمل الكلى.',
    measuresEn: 'Creatinine is a chemical waste product from muscles that the kidneys remove — its blood level is used as an indicator of how well the kidneys work.',
    highAr: 'بشكل عام، قد يرتفع الكرياتينين مع: مشاكل الكلى (ضرر أو فشل أو عدوى أو نقص تروية)، انسداد المسالك البولية، الجفاف وفقدان السوائل، أو تحلل العضلات.',
    highEn: 'In general, creatinine may be higher with: kidney problems (damage, failure, infection, or reduced blood flow), a blocked urinary tract, dehydration and fluid loss, or muscle breakdown.',
    lowAr: 'بشكل عام، قد يكون الكرياتينين منخفضاً عند من لديهم كتلة عضلية قليلة، ولا يعني عادة كفاءة كلى «فائقة».',
    lowEn: 'In general, creatinine may be lower in people with low muscle mass, and it does not usually mean "extra-efficient" kidneys.',
    sourceName: 'MedlinePlus Medical Encyclopedia — U.S. National Library of Medicine',
    sourceUrl: 'https://medlineplus.gov/ency/article/003475.htm',
  },
  {
    id: 'potassium',
    nameAr: 'البوتاسيوم',
    nameEn: 'Potassium',
    aliases: ['البوتاسيوم', 'بوتاسيوم', 'potassium'],
    canonicalUnit: 'mmol/L',
    bandSets: [
      {
        key: 'default', labelAr: 'البوتاسيوم', labelEn: 'Potassium',
        rangeTextAr: 'المجال العام: 3.7–5.2 mmol/L',
        rangeTextEn: 'General range: 3.7–5.2 mmol/L',
        bands: [B(3.7, 'low', 'أدنى من المجال العام', 'Below the general range'), B(5.2, 'normal', 'ضمن المجال العام', 'Within the general range'), B(Infinity, 'high', 'أعلى من المجال العام', 'Above the general range')],
      },
    ],
    measuresAr: 'البوتاسيوم معدن أساسي لعمل الأعصاب والعضلات — بما فيها عضلة القلب — وللحفاظ على توازن السوائل في الجسم.',
    measuresEn: 'Potassium is a mineral essential for nerve and muscle function — including the heart muscle — and for fluid balance in the body.',
    highAr: 'بشكل عام، قد يرتفع البوتاسيوم مع: مشاكل الكلى، بعض أدوية الضغط، مكملات البوتاسيوم، أو تحلل الأنسجة. الارتفاع الكبير قد يؤثر على نظم القلب، لذلك يتابعه الطبيب بجدية.',
    highEn: 'In general, potassium may be higher with: kidney problems, some blood-pressure medicines, potassium supplements, or tissue breakdown. A large rise can affect heart rhythm, so doctors follow it seriously.',
    lowAr: 'بشكل عام، قد ينخفض البوتاسيوم مع: القيء أو الإسهال، أدوية إدرار البول، التعرق الشديد، أو قلة تناول الطعام.',
    lowEn: 'In general, potassium may be lower with: vomiting or diarrhea, water pills (diuretics), heavy sweating, or poor food intake.',
    sourceName: 'MedlinePlus — U.S. National Library of Medicine',
  },
  {
    id: 'sodium',
    nameAr: 'الصوديوم',
    nameEn: 'Sodium',
    aliases: ['الصوديوم', 'صوديوم', 'sodium'],
    canonicalUnit: 'mmol/L',
    bandSets: [
      {
        key: 'default', labelAr: 'الصوديوم', labelEn: 'Sodium',
        rangeTextAr: 'المجال العام: 135–145 mmol/L',
        rangeTextEn: 'General range: 135–145 mmol/L',
        bands: [B(135, 'low', 'أدنى من المجال العام', 'Below the general range'), B(145, 'normal', 'ضمن المجال العام', 'Within the general range'), B(Infinity, 'high', 'أعلى من المجال العام', 'Above the general range')],
      },
    ],
    measuresAr: 'الصوديوم معدن ينظّم توازن الماء في الجسم وضغط الدم، ويساعد الأعصاب والعضلات على العمل.',
    measuresEn: 'Sodium is a mineral that regulates the body\'s water balance and blood pressure, and helps nerves and muscles work.',
    highAr: 'بشكل عام، قد يرتفع الصوديوم غالباً مع فقدان الماء من الجسم (جفاف) أكثر مما يرتفع من كثرة الملح: قيء أو إسهال أو تعرق أو حمى دون تعويض السوائل.',
    highEn: 'In general, sodium rises most often from losing body water (dehydration) rather than from salt alone: vomiting, diarrhea, sweating, or fever without replacing fluids.',
    lowAr: 'بشكل عام، قد ينخفض الصوديوم مع: زيادة سوائل الجسم، القيء أو الإسهال، بعض الأدوية (مثل مدرات البول)، أو بعض مشاكل الهرمونات والكلى والقلب.',
    lowEn: 'In general, sodium may be lower with: excess body fluid, vomiting or diarrhea, some medicines (such as diuretics), or some hormone, kidney, and heart problems.',
    sourceName: 'MedlinePlus — U.S. National Library of Medicine',
  },
  {
    id: 'wbc',
    nameAr: 'كريات الدم البيضاء (WBC)',
    nameEn: 'White blood cells (WBC)',
    aliases: ['الكريات البيضاء', 'كريات الدم البيضاء', 'كريات بيضاء', 'البيضاء', 'wbc', 'white blood'],
    canonicalUnit: '×10⁹/L',
    bandSets: [
      {
        key: 'default', labelAr: 'كريات الدم البيضاء', labelEn: 'White blood cells',
        rangeTextAr: 'المجال العام: 4.5–11.0 ×10⁹/L (أي 4500–11000 خلية/µL)',
        rangeTextEn: 'General range: 4.5–11.0 ×10⁹/L (4,500–11,000 cells/µL)',
        bands: [B(4.5, 'low', 'أدنى من المجال العام', 'Below the general range'), B(11.0, 'normal', 'ضمن المجال العام', 'Within the general range'), B(Infinity, 'high', 'أعلى من المجال العام', 'Above the general range')],
      },
    ],
    measuresAr: 'كريات الدم البيضاء هي خلايا جهاز المناعة التي تدافع عن الجسم ضد العدوى والالتهاب.',
    measuresEn: 'White blood cells are the immune system cells that defend the body against infection and inflammation.',
    highAr: 'بشكل عام، قد ترتفع الكريات البيضاء مع: العدوى (خاصة البكتيرية)، الالتهاب، الضغط الجسدي أو الجراحة، أو بعض الأدوية مثل الكورتيزون.',
    highEn: 'In general, white cells may be higher with: infection (especially bacterial), inflammation, physical stress or surgery, or some medicines such as steroids.',
    lowAr: 'بشكل عام، قد تنخفض الكريات البيضاء مع: بعض العدوى الفيروسية، مشاكل نخاع العظم، أمراض المناعة الذاتية، أو بعض الأدوية.',
    lowEn: 'In general, white cells may be lower with: some viral infections, bone-marrow problems, autoimmune diseases, or some medicines.',
    sourceName: 'MedlinePlus Medical Encyclopedia — U.S. National Library of Medicine',
  },
  {
    id: 'platelets',
    nameAr: 'الصفائح الدموية',
    nameEn: 'Platelets',
    aliases: ['الصفائح', 'صفائح دموية', 'الصفائح الدموية', 'platelets', 'platelet'],
    canonicalUnit: '×10⁹/L',
    bandSets: [
      {
        key: 'default', labelAr: 'الصفائح الدموية', labelEn: 'Platelets',
        rangeTextAr: 'المجال العام: 150–450 ×10⁹/L (أي 150000–450000 /µL)',
        rangeTextEn: 'General range: 150–450 ×10⁹/L (150,000–450,000 /µL)',
        bands: [B(150, 'low', 'أدنى من المجال العام', 'Below the general range'), B(450, 'normal', 'ضمن المجال العام', 'Within the general range'), B(Infinity, 'high', 'أعلى من المجال العام', 'Above the general range')],
      },
    ],
    measuresAr: 'الصفائح هي أجزاء خلوية صغيرة تساعد الدم على التجلط وإيقاف النزيف عند حدوث جرح.',
    measuresEn: 'Platelets are small cell fragments that help blood clot and stop bleeding when a wound occurs.',
    highAr: 'بشكل عام، قد ترتفع الصفائح كرد فعل على: التهاب أو عدوى، نقص الحديد، نزيف حديث، أو بعد استئصال الطحال.',
    highEn: 'In general, platelets may rise as a reaction to: inflammation or infection, iron deficiency, recent bleeding, or after spleen removal.',
    lowAr: 'بشكل عام، قد تنخفض الصفائح مع: مشاكل نخاع العظم، تكسير مناعي للصفائح، بعض الأدوية، أو أمراض الكبد والطحال.',
    lowEn: 'In general, platelets may be lower with: bone-marrow problems, immune destruction of platelets, some medicines, or liver and spleen diseases.',
    sourceName: 'MedlinePlus Medical Encyclopedia — U.S. National Library of Medicine',
  },
  {
    id: 'tsh',
    nameAr: 'هرمون الغدة الدرقية المحفّز (TSH)',
    nameEn: 'TSH (thyroid-stimulating hormone)',
    aliases: ['tsh', 'هرمون الغدة الدرقية', 'تحليل الغدة', 'الغدة الدرقية tsh'],
    canonicalUnit: 'mIU/L',
    bandSets: [
      {
        key: 'default', labelAr: 'TSH', labelEn: 'TSH',
        rangeTextAr: 'المجال العام للبالغين: 0.5–5.0 mIU/L تقريباً (يختلف بوضوح بين المختبرات)',
        rangeTextEn: 'General adult range: about 0.5–5.0 mIU/L (varies noticeably between laboratories)',
        bands: [B(0.5, 'low', 'أدنى من المجال العام', 'Below the general range'), B(5.0, 'normal', 'ضمن المجال العام', 'Within the general range'), B(Infinity, 'high', 'أعلى من المجال العام', 'Above the general range')],
      },
    ],
    measuresAr: 'TSH هرمون تفرزه الغدة النخامية ليأمر الغدة الدرقية بالعمل: ارتفاعه غالباً يعني أن الدرقية خاملة فتحاول النخامية تحفيزها أكثر، وانخفاضه غالباً يعني أن الدرقية نشيطة أكثر من اللازم.',
    measuresEn: 'TSH is a pituitary hormone that tells the thyroid gland to work: a high level usually means the thyroid is underactive so the pituitary pushes harder, and a low level usually means the thyroid is overactive.',
    highAr: 'بشكل عام، TSH المرتفع يشير غالباً إلى قصور الغدة الدرقية (خمولها)، وأشيع أسبابه التهاب الدرقية المناعي (هاشيموتو).',
    highEn: 'In general, a high TSH most often points to an underactive thyroid (hypothyroidism), whose most common cause is autoimmune thyroiditis (Hashimoto).',
    lowAr: 'بشكل عام، TSH المنخفض يشير غالباً إلى فرط نشاط الغدة الدرقية، أو إلى جرعة زائدة من دواء الغدة (ليفوثيروكسين) عند من يعالجون به.',
    lowEn: 'In general, a low TSH most often points to an overactive thyroid, or to too high a dose of thyroid medicine (levothyroxine) in people treated with it.',
    sourceName: 'Cleveland Clinic / MedlinePlus — general adult range',
  },
];

// Tests people commonly ask about that are NOT in the verified set yet.
export const UNCOVERED_LABS: { match: string[]; nameAr: string; nameEn: string }[] = [
  { match: ['فيتامين د', 'vitamin d'], nameAr: 'فيتامين د', nameEn: 'Vitamin D' },
  { match: ['كولسترول', 'الكولسترول', 'cholesterol'], nameAr: 'الكولسترول', nameEn: 'Cholesterol' },
  { match: ['الدهون الثلاثية', 'triglyceride'], nameAr: 'الدهون الثلاثية', nameEn: 'Triglycerides' },
  { match: ['فيريتين', 'ferritin', 'مخزون الحديد'], nameAr: 'الفيريتين (مخزون الحديد)', nameEn: 'Ferritin' },
  { match: ['كالسيوم', 'calcium'], nameAr: 'الكالسيوم', nameEn: 'Calcium' },
  { match: ['يوريا', 'bun', 'urea'], nameAr: 'اليوريا', nameEn: 'Urea (BUN)' },
  { match: ['انزيمات الكبد', 'enzymes alt', ' alt', ' ast'], nameAr: 'إنزيمات الكبد', nameEn: 'Liver enzymes' },
  { match: ['psa', 'البروستات'], nameAr: 'PSA (البروستات)', nameEn: 'PSA' },
];

export function normalizeDigits(s: string): string {
  return (s || '')
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/٫/g, '.')
    .replace(/٬/g, ',');
}

export function extractValue(text: string): number | null {
  const norm = normalizeDigits(text).replace(/,/g, '');
  const m = norm.match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const v = parseFloat(m[1]);
  return Number.isFinite(v) ? v : null;
}

export interface LabHit {
  entry: LabEntry;
  value: number | null;
  bandSetKey: string | null; // resolved variant/sex key, if determinable
  sexAmbiguous: boolean;
}

const SEX_MALE = ['رجل', 'ذكر', 'لرجل', 'للرجال', 'male', 'man'];
const SEX_FEMALE = ['امرأة', 'انثى', 'أنثى', 'لمرأة', 'للنساء', 'نساء', 'female', 'woman'];

function detectSex(text: string): 'male' | 'female' | null {
  const lower = text.toLowerCase();
  if (SEX_FEMALE.some((w) => text.includes(w) || lower.includes(w))) return 'female';
  if (SEX_MALE.some((w) => text.includes(w) || lower.includes(w))) return 'male';
  return null;
}

// Convert a raw reported value into the entry's canonical unit, using
// magnitude heuristics that are stated in the reply when applied.
export function toCanonical(entry: LabEntry, raw: number, text: string): { value: number; assumedUnit: string | null } {
  const lower = text.toLowerCase();
  switch (entry.id) {
    case 'glucose': {
      if (lower.includes('mmol') || text.includes('ممول')) return { value: raw * 18, assumedUnit: 'mmol/L' };
      if (lower.includes('mg')) return { value: raw, assumedUnit: 'mg/dL' };
      // Heuristic: a glucose value under 30 can only be mmol/L.
      if (raw < 30) return { value: raw * 18, assumedUnit: 'mmol/L' };
      return { value: raw, assumedUnit: 'mg/dL' };
    }
    case 'creatinine': {
      if (text.includes('µmol') || lower.includes('umol') || raw > 20) return { value: raw / 88.4, assumedUnit: 'µmol/L' };
      return { value: raw, assumedUnit: 'mg/dL' };
    }
    case 'hemoglobin': {
      if (raw > 40) return { value: raw / 10, assumedUnit: 'g/L' };
      return { value: raw, assumedUnit: 'g/dL' };
    }
    case 'wbc':
    case 'platelets': {
      if (raw > 1000) return { value: raw / 1000, assumedUnit: '/µL' };
      return { value: raw, assumedUnit: '×10⁹/L' };
    }
    default:
      return { value: raw, assumedUnit: entry.canonicalUnit };
  }
}

export function findLabInText(text: string): LabHit | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  let best: { entry: LabEntry; aliasLen: number } | null = null;
  for (const entry of LAB_ENTRIES) {
    for (const alias of entry.aliases) {
      const a = alias.toLowerCase();
      const hit = a.length <= 3 ? new RegExp(`\\b${a}\\b`).test(lower) : lower.includes(a) || text.includes(alias);
      if (hit && (!best || a.length > best.aliasLen)) best = { entry, aliasLen: a.length };
    }
  }
  if (!best) return null;
  const entry = best.entry;
  const value = extractValue(text);
  let bandSetKey: string | null = null;
  let sexAmbiguous = false;
  if (entry.id === 'glucose') {
    if (text.includes('صائم') || text.includes('صيام') || lower.includes('fasting')) bandSetKey = 'fasting';
    else if (text.includes('عشوائي') || text.includes('بعد الأكل') || text.includes('بعد الاكل') || lower.includes('random') || lower.includes('after eating') || lower.includes('post-meal')) bandSetKey = 'random';
  } else if (entry.bandSets.length === 2 && entry.bandSets[0].key === 'male') {
    const sex = detectSex(text);
    bandSetKey = sex;
    sexAmbiguous = !sex;
  } else {
    bandSetKey = entry.bandSets[0].key;
  }
  return { entry, value, bandSetKey, sexAmbiguous };
}

export function findUncoveredLab(text: string): { nameAr: string; nameEn: string } | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const u of UNCOVERED_LABS) {
    if (u.match.some((m) => lower.includes(m) || text.includes(m))) return u;
  }
  return null;
}

const LAB_INTENT = ['تحليل', 'نتيجة', 'نتيجتي', 'فحص', 'مخبر', 'مختبر', 'lab result', 'test result', 'blood test', 'قيمة التحليل', 'طلع عندي', 'طلعت نتيجتي'];

export function hasLabIntent(text: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return LAB_INTENT.some((w) => text.includes(w) || lower.includes(w));
}

export function isDefinitionQuestion(text: string): boolean {
  const lower = (text || '').toLowerCase();
  return ['شو هو', 'شو هي', 'ما هو', 'ما هي', 'شو يعني', 'what is', 'what does'].some((p) => text.includes(p) || lower.includes(p));
}

export function compareBand(set: LabBandSet, canonicalValue: number): LabBand {
  for (const band of set.bands) {
    if (canonicalValue < band.upTo) return band;
  }
  return set.bands[set.bands.length - 1];
}

// Resolve a band-set key (glucose variant or sex) from any text — used to
// apply an answer like "صائم" or "لامرأة" that arrives in its own message.
export function detectVariantOrSex(entry: LabEntry, text: string): string | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (entry.id === 'glucose') {
    if (text.includes('صائم') || text.includes('صيام') || lower.includes('fasting')) return 'fasting';
    if (text.includes('عشوائي') || text.includes('بعد الأكل') || text.includes('بعد الاكل') || lower.includes('random') || lower.includes('after eating') || lower.includes('post-meal')) return 'random';
    return null;
  }
  if (entry.bandSets.length === 2 && entry.bandSets[0].key === 'male') {
    return detectSex(text);
  }
  return entry.bandSets[0].key;
}
