import { normalizeArabic } from './arabicText.ts';

// Verified general health FAQ — a deterministic bank of general questions,
// each answer structured from ONE named published source that was opened and
// read when the entry was written (NHS, fetched 24 Oct 2026). The model never
// writes these answers: a message matches only when it is question-shaped
// (or a bare topic lookup) AND names a bank topic; personal statements about
// the user's own case do not match and stay with the normal flow. Answers are
// general education, never personal advice, and each prints its source.
export interface FaqEntry {
  id: string;
  topics: string[];
  answerAr: string;
  answerEn: string;
  sourceTitle: string;
  sourceUrl: string;
  allowBare: boolean;
  excludes?: string[];
}

const SRC = 'NHS';

export const GENERAL_FAQ: FaqEntry[] = [
  {
    id: 'diabetes',
    topics: ['سكري', 'السكري', 'diabetes'],
    excludes: ['تراكمي', 'hba1c'],
    allowBare: true,
    answerAr: `عن مرض السكري من النوع الثاني — شرح عام:

• هو حالة لا ينتج فيها الجسم ما يكفي من هرمون الإنسولين، أو لا يعمل الإنسولين كما يجب (مقاومة الإنسولين). الإنسولين يساعد الجسم على استخدام الغلوكوز (السكر) للطاقة، فبدونه يرتفع سكر الدم.
• يختلف عن النوع الأول (سببه مشكلة في الجهاز المناعي)؛ والنوع الثاني قد يمكن الوقاية منه أو إدخاله في هجوع بإنقاص الوزن وتحسين الغذاء.
• يُدار بالغذاء والنشاط البدني، أو بالأدوية بقرار الطبيب.
• بقاء سكر الدم مرتفعاً قد يسبب مع الوقت مضاعفات مثل أمراض القلب والكلى والسكتة ومشاكل الأعصاب.

هذه معلومات عامة — تشخيص حالتك وخطة علاجها عند طبيبك وحده.`,
    answerEn: `About type 2 diabetes — general information:

• It is a condition where the body cannot make enough insulin, or the insulin it makes does not work properly (insulin resistance). Insulin helps the body use glucose (sugar) for energy, so without enough of it, blood glucose becomes too high.
• It differs from type 1 diabetes (an immune-system problem); type 2 may be preventable, or put into remission, by losing weight and improving diet.
• It is managed with diet and exercise, or medicines decided by your doctor.
• Persistently high blood glucose can cause complications such as heart disease, kidney disease, stroke and nerve problems.

This is general information — diagnosis and treatment of your own case belong to your doctor.`,
    sourceTitle: `${SRC} — What is type 2 diabetes?`,
    sourceUrl: 'https://www.nhs.uk/conditions/type-2-diabetes/what-is-type-2-diabetes/',
  },
  {
    id: 'hypertension',
    topics: ['ضغط الدم', 'ارتفاع الضغط', 'blood pressure', 'hypertension'],
    allowBare: true,
    answerAr: `عن ارتفاع ضغط الدم — شرح عام:

• هو شائع جداً، وخصوصاً مع التقدم بالعمر، و**عادة بلا أي أعراض** — الطريقة الوحيدة لمعرفته هي قياس الضغط.
• تُعدّ القراءة مرتفعة عادة إذا كانت 140/90 أو أكثر عند القياس عند مختص، أو 135/85 أو أكثر عند القياس في المنزل.
• بقاؤه مرتفعاً يجهد الأوعية الدموية والقلب وأعضاء مثل الدماغ والكليتين والعينين، ويرفع خطر أمراض القلب والجلطات إن لم يُعالج.
• تساعد تغييرات نمط الحياة: غذاء متوازن وملح أقل، نشاط منتظم (الهدف حوالي 150 دقيقة أسبوعياً)، إنقاص الوزن الزائد، وترك التدخين والكحول.
• أدوية الضغط يقررها الطبيب وتؤخذ عادة حبة مرة يومياً، وقد يحتاج الشخص أكثر من دواء واحد.

معلومات عامة — قياسك أنت وتفسيره عند فريقك الطبي.`,
    answerEn: `About high blood pressure — general information:

• It is very common, especially in older adults, and **usually causes no symptoms** — the only way to know is to have your blood pressure checked.
• A reading is usually considered high at 140/90 or above when checked by a healthcare professional, or 135/85 or above at home.
• Left high, it strains your blood vessels, heart and organs such as the brain, kidneys and eyes, and raises the risk of heart disease and strokes if untreated.
• Lifestyle changes help: a balanced lower-salt diet, regular exercise (aim about 150 minutes a week), losing excess weight, and not smoking or drinking too much alcohol.
• Blood-pressure medicines are decided by a doctor, usually taken once a day; some people need more than one.

General information — your own readings and what they mean are for your care team.`,
    sourceTitle: `${SRC} — High blood pressure`,
    sourceUrl: 'https://www.nhs.uk/conditions/high-blood-pressure/',
  },
  {
    id: 'fever',
    topics: ['حرارة', 'حمى', 'الحمى', 'fever'],
    allowBare: true,
    answerAr: `عن ارتفاع الحرارة (الحمى) عند البالغين — شرح عام:

• تُعدّ الحرارة مرتفعة عادة عند 38 درجة مئوية أو أكثر، وغالباً تكون علامة أن الجسم يقاتل التهاباً مثل الزكام أو الإنفلونزا — وليست بحد ذاتها مرضاً.
• علاماتها: الإحساس بالحرارة أو البرودة أو الرجفة (القشعريرة)، التعرّق، واحمرار الجلد ودفئه.
• للعناية في المنزل: راحة كافية، سوائل كثيرة (الماء أفضل) حتى لا يحدث جفاف، وباراسيتامول أو إيبوبروفين إذا كنت منزعجاً.
• اطلب موعداً عاجلاً أو مساعدة طبية إذا عالجتها في المنزل ولم تتحسن أو ساءت.
• أغلب حالات الحرارة تتحسن وحدها خلال أيام.

معلومات عامة — إذا كانت حرارتك مصحوبة بأعراض شديدة أو مقلقة، اطلب رعاية طبية ولا تكتفِ بالشرح.`,
    answerEn: `About high temperature (fever) in adults — general information:

• A temperature of 38C or above is usually considered high. It is most often a sign your body is fighting an infection such as a cold or flu — not an illness by itself.
• Signs include feeling hot, cold or shivery (chills), sweating, and warm red skin.
• Self-care: plenty of rest, lots of fluids (water is best) to avoid dehydration, and paracetamol or ibuprofen if you feel uncomfortable.
• Ask for urgent medical help if you have been treating it at home and it is not getting better or is getting worse.
• Most fevers settle on their own within days.

General information — if a fever comes with severe or worrying symptoms, seek medical care rather than relying on an explanation.`,
    sourceTitle: `${SRC} — High temperature (fever) in adults`,
    sourceUrl: 'https://www.nhs.uk/symptoms/fever-in-adults/',
  },
  {
    id: 'antibiotics',
    topics: ['مضاد حيوي', 'مضادات حيوية', 'المضادات', 'antibiotic', 'antibiotics'],
    allowBare: true,
    answerAr: `عن المضادات الحيوية — شرح عام:

• هي أدوية تعالج الالتهابات **البكتيرية** أو تقي منها: تقتل البكتيريا أو تمنع انتشارها.
• **لا تعمل ضد الفيروسات** — فلا تفيد في الزكام والإنفلونزا وأكثر حالات السعال والتهاب الحلق.
• كثير من الالتهابات البكتيرية الخفيفة تتحسن وحدها دون مضاد.
• أخذها عند عدم الحاجة مشكلة كبيرة اسمها **مقاومة المضادات**: قد لا تعود فعالة عندك عندما تحتاجها فعلاً.
• آثارها الشائعة: غثيان وإسهال وانتفاخ؛ وبعض الناس لديهم حساسية منها (خصوصاً البنسلين).
• لا تأخذ أبداً مضاداً موصوفاً لشخص آخر، وخذ دواءك كما هو موصوف لك تماماً.

معلومات عامة — قرار أنك تحتاج مضاداً من عدمه عند طبيبك أو الصيدلي.`,
    answerEn: `About antibiotics — general information:

• They treat or prevent **bacterial** infections by killing bacteria or stopping them spreading.
• **They do not work for viral infections** such as colds and flu, and most coughs and sore throats.
• Many mild bacterial infections get better on their own without antibiotics.
• Taking them when not needed drives **antibiotic resistance** — they may stop working for you when you really need them.
• Common side effects include nausea and diarrhoea; some people are allergic to them, especially penicillin.
• Never take antibiotics prescribed for someone else, and take your own exactly as directed.

General information — whether you need an antibiotic is a decision for your doctor or pharmacist.`,
    sourceTitle: `${SRC} — Antibiotics`,
    sourceUrl: 'https://www.nhs.uk/conditions/antibiotics/',
  },
  {
    id: 'anaesthesia-fasting',
    topics: ['صيام', 'الصيام', 'تخدير', 'التخدير', 'fasting', 'anaesthetic', 'anaesthesia', 'anesthetic'],
    allowBare: true,
    answerAr: `عن التخدير العام والصيام قبله — شرح عام:

• التخدير العام يجعلك نائماً تماماً أثناء العملية: لا تشعر بألم ولا تدرك ما يحدث، وعضلاتك مرتخية، ويراقبك فريق التخدير طوال الوقت (نبض وضغط وأكسجين) مع أنبوب يساعدك على التنفس.
• قبل التخدير ستتلقى تعليمات **بالتوقف عن الأكل والشرب قبلها بساعات عادة — للتأكد من أن معدتك فارغة**. الساعات الدقيقة يحددها فريقك، والتزم بتعليماتهم هم بالضبط.
• في التقييم قبل العملية أخبر الفريق بأدويتك وحالاتك وأي حساسية سابقة من التخدير أو الأدوية.
• بعد الاستيقاظ: نعاس في البداية، وقد تشعر بغثيان أو ألم حلق من الأنبوب، وتأثير التخدير قد يبقى حوالي 24 ساعة (لا قيادة ولا قرارات مهمة خلالها، وليبقَ معك مرافق).

معلومات عامة — تعليمات الصيام الخاصة بعمليتك تصلك من فريقك وهي الملزمة.`,
    answerEn: `About general anaesthetic and fasting before it — general information:

• A general anaesthetic makes you fully asleep for the procedure: you feel no pain, are unaware of what happens, and your muscles are relaxed, while the anaesthetic team monitors you throughout (pulse, blood pressure, oxygen) with a tube helping you breathe.
• Before it, you will be told **when to stop eating and drinking — usually a few hours before, to make sure your stomach is empty**. The exact hours come from your own team; follow their instructions precisely.
• At the pre-operative assessment, tell the team about your medicines, conditions, and any previous allergic reaction to anaesthetic or medicines.
• Afterwards you will feel drowsy at first, may have nausea or a sore throat from the tube, and effects can last about 24 hours (no driving or important decisions, and have someone stay with you).

General information — your own fasting instructions come from your team and are the ones that bind.`,
    sourceTitle: `${SRC} — General anaesthetic`,
    sourceUrl: 'https://www.nhs.uk/conditions/anaesthesia/',
  },
  {
    id: 'cholesterol',
    topics: ['كولسترول', 'كوليسترول', 'cholesterol'],
    allowBare: true,
    answerAr: `عن ارتفاع الكولسترول — شرح عام:

• الكولسترول مادة دهنية في الدم؛ وارتفاعه يعني وجود كمية زائدة منها.
• من أسبابه: الأكل الدهني، قلة الحركة، الوزن الزائد، التدخين والكحول — وقد يكون وراثياً في العائلة.
• **عادة بلا أي أعراض** — لا يمكن معرفته إلا بفحص دم.
• الكولسترول الزائد قد يسدّ الأوعية الدموية ويرفع خطر مشاكل القلب والجلطات.
• ينخفض بالأكل الصحي والحركة الأكثر، وبعض الناس يحتاجون أيضاً دواءً بقرار الطبيب.

معلومات عامة — نتيجتك أنت وتفسيرها عند طبيبك.`,
    answerEn: `About high cholesterol — general information:

• Cholesterol is a fatty substance in your blood; high cholesterol means you have too much of it.
• Causes include eating fatty food, not exercising enough, being overweight, smoking and alcohol — and it can run in families.
• **It does not usually cause symptoms** — you can only find out from a blood test.
• Too much cholesterol can block your blood vessels and makes heart problems or a stroke more likely.
• It can be lowered by eating healthily and getting more exercise; some people also need medicine decided by their doctor.

General information — your own result and its meaning belong with your doctor.`,
    sourceTitle: `${SRC} — High cholesterol`,
    sourceUrl: 'https://www.nhs.uk/conditions/high-cholesterol/',
  },
  {
    id: 'dehydration',
    topics: ['جفاف', 'الجفاف', 'dehydration'],
    allowBare: true,
    answerAr: `عن الجفاف — شرح عام:

• علاماته عند البالغين: عطش، بول أصفر غامق قوي الرائحة، تبوّل أقل من المعتاد، دوخة أو خفة رأس، تعب، وجفاف الفم والشفاه واللسان.
• يحدث بسهولة أكثر مع: الاستفراغ أو الإسهال، الحرارة المرتفعة، التعرق والحر الشديد، بعض الأدوية المدرّة للبول، ومرض السكري.
• علاجه الأساسي: شرب السوائل؛ وإذا كان الشرب صعباً لغثيان، ابدأ برشفات صغيرة وزد تدريجياً، وتجنّب الكافيين والكحول لأنهما يزيدان الجفاف. الصيدلي قد ينصح بمحاليل الإماهة الفموية لتعويض الأملاح والسكر عند فقدان سوائل كثير.
• علامات تستدعي مساعدة عاجلة: تعب غير معتاد، دوخة عند الوقوف لا تزول، تنفس سريع أو نبض سريع.
• الوقاية: اشرب خلال اليوم ما يكفي ليكون لون بولك فاتحاً، وزد الكمية عند المرض أو الحر أو الجهد.

معلومات عامة — الأطفال وكبار السن أكثر عرضة للجفاف ويحتاجون انتباهاً أبكر.`,
    answerEn: `About dehydration — general information:

• Signs in adults: feeling thirsty, dark yellow strong-smelling pee, peeing less often than usual, dizziness or light-headedness, tiredness, and a dry mouth, lips and tongue.
• It happens more easily with vomiting or diarrhoea, a high temperature, heavy sweating or heat, medicines that make you pee more (diuretics), and diabetes.
• The main treatment is drinking fluids; if drinking is hard because you feel sick, start with small sips and build up, and avoid caffeine and alcohol, which dehydrate you. A pharmacist may recommend oral rehydration solutions to replace lost salts and sugar.
• Signs needing urgent help: unusual tiredness, dizziness on standing that does not go away, fast breathing or a fast heart rate.
• Prevention: drink enough during the day that your pee is a pale colour, and drink more when ill, in heat, or exercising.

General information — babies, children and older adults are more at risk and need earlier attention.`,
    sourceTitle: `${SRC} — Dehydration`,
    sourceUrl: 'https://www.nhs.uk/conditions/dehydration/',
  },
  {
    id: 'vaccines',
    topics: ['لقاح', 'لقاحات', 'تطعيم', 'vaccine', 'vaccines', 'vaccination'],
    allowBare: true,
    answerAr: `عن اللقاحات — شرح عام:

• اللقاحات تعلّم جهازك المناعي صنع أجسام مضادة تحميك من الأمراض — ومن الآمن أن يتعلّم بهذه الطريقة أكثر من أن يصاب بالمرض نفسه.
• تحميك وتحمي من حولك: بوقف انتشار المرض تصل الحماية لمن لا يستطيعون التلقيح (رضّع صغار أو مرضى مناعتهم ضعيفة) — وتُسمى مناعة القطيع.
• كل لقاح يخضع لاختبارات سلامة صارمة قبل اعتماده، ويبقى مراقباً للآثار الجانبية بعد استخدامه.
• آثارها الشائعة خفيفة وقصيرة: ألم واحمرار مكان الإبرة ليومين أو ثلاثة، أو حرارة خفيفة ليوم أو يومين.
• اللقاحات لا تُضعف الجهاز المناعي ولا تُحمّله فوق طاقته، ولا علاقة مثبتة بينها وبين التوحّد.

معلومات عامة — جدول لقاحاتك أنت ولأطفالك عند طبيبك أو ممرضة المركز.`,
    answerEn: `About vaccines — general information:

• Vaccines teach your immune system how to create antibodies that protect you from diseases — it is much safer to learn this way than by catching the disease.
• They protect you and people around you: by stopping diseases spreading, they shield those who cannot be vaccinated (young babies, people with weakened immune systems) — this is herd immunity.
• Every vaccine undergoes rigorous safety testing before approval and is continually monitored for side effects afterwards.
• Common side effects are mild and short-lived: a sore, red arm for 2 to 3 days, or a mild temperature for 1 or 2 days.
• Vaccines do not overload or weaken the immune system, and studies have found no link between vaccines and autism.

General information — your own and your children's schedule is with your doctor or practice nurse.`,
    sourceTitle: `${SRC} — Why vaccination is important`,
    sourceUrl: 'https://www.nhs.uk/conditions/vaccinations/why-vaccination-is-important-and-the-safest-way-to-protect-yourself/',
  },
  {
    id: 'paracetamol',
    topics: ['باراسيتامول', 'سيتامول', 'paracetamol'],
    allowBare: true,
    answerAr: `عن الباراسيتامول — شرح عام:

• هو مسكّن ألم شائع يُستخدم للصداع وآلام المفاصل وأعراض الزكام والإنفلونزا (ومنها الحرارة) وألم الأسنان والتهاب الحلق.
• الجرعة والفاصل بين الجرعات مطبوعان على العلبة أو النشرة — التزم بهما بالضبط، وإذا لم تكن متأكداً اسأل صيدلياً.
• ⚠️ **لا تأخذه مع أدوية أخرى تحتوي باراسيتامول** (كثير من أدوية الزكام تحتويه) — أخذ كمية زائدة قد يؤذي الكبد.
• قد لا يناسب من لديهم مشاكل كبد أو كلى أو من يشربون الكحول بكثرة — تحقق من النشرة أو اسأل مختصاً.
• يُعدّ عادة الخيار الأول للمسكّنات أثناء الحمل والرضاعة.

معلومات عامة تثقيفية — ليست وصفة؛ لألمك أنت التزم بنشرة دوائك أو اسأل صيدلياً.`,
    answerEn: `About paracetamol — general information:

• It is a common painkiller used for headaches, joint pain, cold and flu symptoms (including fever), toothache and sore throat.
• The dose and the gap between doses are printed on the packet or leaflet — follow them exactly, and ask a pharmacist if unsure.
• ⚠️ **Do not take it with other medicines that contain paracetamol** (many cold and flu remedies do) — taking too much can damage your liver.
• It may not be suitable if you have a liver or kidney condition or drink heavily — check the leaflet or ask a professional.
• It is usually the first-choice painkiller during pregnancy and breastfeeding.

General educational information, not a prescription — for your own pain, follow your medicine's leaflet or ask a pharmacist.`,
    sourceTitle: `${SRC} — Paracetamol for adults`,
    sourceUrl: 'https://www.nhs.uk/medicines/paracetamol-for-adults/about-paracetamol-for-adults/',
  },
  {
    id: 'wound-care',
    topics: ['جرح', 'جروح', 'العناية بالجرح', 'wound care', 'stitches'],
    allowBare: false,
    answerAr: `عن العناية بجرح أو خدش في المنزل — شرح عام:

• أوقف أي نزيف: اضغط على الجرح بضمادة أو قطعة قماش نظيفة، وارفع الطرف المصاب فوق مستوى القلب إن أمكن. إذا خرج الدم عبر الضمادة، أضف أخرى فوقها بدل إزالة الأولى.
• بعد توقف النزيف: نظّف الجرح بشطفه بماء نظيف، وجفّف ما حوله، وغطِّه بضمادة أو لاصق معقّم، وحافظ على الضمادة نظيفة وجافة وبدّلها عند الحاجة؛ يمكن إزالتها بعد أيام عندما يغلق الجرح.
• اطلب موعداً عاجلاً إذا: بقي الجرح متسخاً بعد التنظيف أو فيه تراب/قيح، أو كان من عضّة، أو صار متورماً وأحمر وأكثر ألماً أو خرج منه قيح، أو كان أكبر من حوالي 5 سم، أو شعرت بتوعّك عام أو حرارة.
• 🚨 طوارئ فوراً إذا: لم يتوقف النزيف، أو كان الدم يندفع بقوة وأحمر فاتحاً، أو فقدت الإحساس قرب الجرح أو صعُبت حركته، أو كان الجرح كبيراً أو عميقاً جداً أو فيه جسم عالق (لا تحاول إخراجه بنفسك).

معلومات عامة للإسعاف الأولي — جروح ما بعد العمليات لتعليمات فريقك الجراحي الأولوية دائماً.`,
    answerEn: `About caring for a cut or graze at home — general information:

• Stop any bleeding: press on the wound with a bandage or clean cloth, and raise the injured limb above heart level if you can. If blood soaks through, add another layer on top rather than removing the first.
• Once bleeding stops: clean the wound by rinsing with clean water, pat dry around it, and cover with a sterile dressing or plaster. Keep the dressing clean and dry and change it as needed; it can come off after a few days once the wound has closed.
• Get an urgent appointment if: the wound stays dirty after cleaning or contains soil/pus, it was a bite, it becomes swollen, red and more painful or pus is coming out, it is larger than about 5cm, or you feel generally unwell or have a high temperature.
• 🚨 Emergency care now if: bleeding will not stop, blood spurts out bright red, you lose feeling near the wound or cannot move it, or the wound is very large or deep or has something stuck in it (do not try to remove it yourself).

General first-aid information — for post-operative wounds, your surgical team's instructions always come first.`,
    sourceTitle: `${SRC} — Cuts and grazes`,
    sourceUrl: 'https://www.nhs.uk/conditions/cuts-and-grazes/',
  },
];

const QUESTION_MARKERS = [
  'شو', 'شو هو', 'شو هي', 'شو يعني', 'ما هو', 'ما هي', 'ليش', 'لماذا', 'كيف', 'معلومات عن', 'حكيني عن', 'خبرني عن', 'اشرح',
  'what is', 'what are', 'why', 'how does', 'how do', 'tell me about',
];

const ENTRIES_NORM = GENERAL_FAQ.map((e) => ({
  entry: e,
  topics: e.topics.map((t) => normalizeArabic(t).toLowerCase()),
  excludes: (e.excludes ?? []).map((t) => normalizeArabic(t).toLowerCase()),
}));
const MARKERS_NORM = QUESTION_MARKERS.map((m) => normalizeArabic(m).toLowerCase());

export function findGeneralFaq(message: string): FaqEntry | null {
  if (!message) return null;
  const norm = normalizeArabic(message).toLowerCase();
  const tokens = norm.split(/\s+/).filter(Boolean);
  const hasMarker = MARKERS_NORM.some((m) => norm.includes(m));
  for (const { entry, topics, excludes } of ENTRIES_NORM) {
    if (excludes.some((x) => norm.includes(x))) continue;
    for (const topic of topics) {
      const idx = norm.indexOf(topic);
      if (idx === -1) continue;
      if (hasMarker) return entry;
      // Bare lookup: a short message that starts with the topic («سكري»,
      // «السكري؟») — personal statements («أنا مريض سكري…») start with other
      // words and are long, so they never match here.
      if (entry.allowBare && tokens.length <= 3 && idx <= 2) return entry;
    }
  }
  return null;
}

export function composeFaqReply(entry: FaqEntry, language: string): string {
  const body = language === 'ar' ? entry.answerAr : entry.answerEn;
  const sourceLine =
    language === 'ar'
      ? `(المصدر: ${entry.sourceTitle} — ${entry.sourceUrl})`
      : `(Source: ${entry.sourceTitle} — ${entry.sourceUrl})`;
  return `${body}\n${sourceLine}`;
}
