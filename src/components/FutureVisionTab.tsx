import React from 'react';
import { Language } from '../types';
import {
  Sparkles,
  KeyRound,
  FileSearch,
  FlaskConical,
  Route,
  Pill,
  History,
  ShieldCheck,
  Fingerprint,
  Database,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Bell,
  Smartphone,
  UserPlus,
  AlarmClock,
  TrendingUp,
} from 'lucide-react';

interface FutureVisionTabProps {
  language: Language;
}

// FUTURE VISION gateway — a clearly-labelled roadmap page.
// NOTHING here is functional in this prototype: no patient login, no personal
// records, no connection to any hospital or laboratory system. The page
// presents the future development direction exactly as designed by the
// developer, marked as vision throughout.
export const FutureVisionTab: React.FC<FutureVisionTabProps> = ({ language }) => {
  const isAr = language === 'ar';

  // The envisioned lab-test status chain — the axis of this page.
  // Every stage depends on data reported by the source system; a stage the
  // source has not reported is shown as "Unknown", never assumed completed.
  const labChain: Array<{ titleAr: string; titleEn: string; bodyAr: string; bodyEn: string }> = [
    {
      titleAr: 'طُلب التحليل',
      titleEn: 'Test ordered',
      bodyAr: 'سجّل الطبيب الطلب في نظام المشفى، مع سبب الطلب.',
      bodyEn: 'The clinician recorded the order in the hospital system, with its reason.',
    },
    {
      titleAr: 'أُخذت العينة',
      titleEn: 'Sample collected',
      bodyAr: 'إذا أتاحت بيانات النظام المصدر هذه المعلومة.',
      bodyEn: 'If the source system makes this information available.',
    },
    {
      titleAr: 'التحليل قيد المعالجة',
      titleEn: 'Test in processing',
      bodyAr: 'العينة عند المخبر والتحليل جارٍ.',
      bodyEn: 'The sample is with the laboratory and analysis is underway.',
    },
    {
      titleAr: 'صدرت النتيجة',
      titleEn: 'Result issued',
      bodyAr: 'النتيجة معتمدة في نظام المخبر — وصدورها لا يعني أن الطبيب راجعها.',
      bodyEn: 'The result is approved in the laboratory system — its issuance does not mean the clinician has reviewed it.',
    },
    {
      titleAr: 'النتيجة بانتظار مراجعة الطبيب',
      titleEn: 'Awaiting clinician review',
      bodyAr: 'إذا لم تكن المراجعة موثقة بعد في النظام المصدر.',
      bodyEn: 'If the review is not yet documented in the source system.',
    },
    {
      titleAr: 'رُوجعت النتيجة ووُثّقت خطة المتابعة',
      titleEn: 'Reviewed, follow-up plan documented',
      bodyAr: 'فقط عندما يؤكد النظام المصدر أن المراجعة تمت فعلاً.',
      bodyEn: 'Only when the source system confirms the review actually happened.',
    },
  ];

  const features: Array<{
    icon: React.ReactNode;
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
  }> = [
    {
      icon: <KeyRound className="w-5 h-5" />,
      titleAr: 'بوابة المريض',
      titleEn: 'Patient Portal',
      bodyAr: 'تسجيل دخول آمن يتيح للمريض الاطلاع على بياناته الصحية المصرّح بعرضها، وملفه الشخصي المستمر: حالته الحالية، سجله السابق، وسوابقه (أمراض مزمنة، عمليات، حساسية، أدوية ثابتة).',
      bodyEn: 'Secure login letting the patient view their authorised health data and their continuous personal record: current state, past record, and antecedents (chronic conditions, operations, allergies, regular medications).',
    },
    {
      icon: <FlaskConical className="w-5 h-5" />,
      titleAr: 'متابعة التحاليل',
      titleEn: 'Lab Follow-up',
      bodyAr: 'عرض حالة كل تحليل عبر سلسلته الكاملة — طُلب، أُخذت العينة، قيد المعالجة، صدرت النتيجة، بانتظار المراجعة، رُوجع — وفق بيانات النظام المصدر حصراً؛ والمرحلة غير المُبلَّغة تظهر «غير معروفة».',
      bodyEn: 'The status of every test across its full chain — ordered, sample collected, in processing, result issued, awaiting review, reviewed — strictly per source-system data; an unreported stage is shown as \u201CUnknown\u201D.',
    },
    {
      icon: <FileSearch className="w-5 h-5" />,
      titleAr: 'شرح النتائج',
      titleEn: 'Result Explanation',
      bodyAr: 'شرح مبسط للنتيجة ومغزاها المحتمل، بالاستناد إلى مراجع موثوقة والسياق الصحي المتاح — دون استبدال مراجعة الطبيب أو تقديم تشخيص مؤكد من نتيجة منفردة.',
      bodyEn: 'A plain-language explanation of the result and its possible meaning, grounded in trusted references and the available health context — never replacing the clinician\u2019s review or giving a definite diagnosis from a single result.',
    },
    {
      icon: <Route className="w-5 h-5" />,
      titleAr: 'متابعة الإحالات',
      titleEn: 'Referral Follow-up',
      bodyAr: 'جهة الإحالة والخطوة التالية وحالة الموعد وفق المعلومات المسجلة فعلياً — مع التمييز بين إرسال الإحالة وحجز الموعد وحضور المريض فعلاً.',
      bodyEn: 'The referral destination, the next step, and the appointment status, per what is actually recorded — distinguishing a referral being sent from an appointment being booked and from the patient actually attending.',
    },
    {
      icon: <Pill className="w-5 h-5" />,
      titleAr: 'خطة الرعاية والأدوية',
      titleEn: 'Care Plan & Medications',
      bodyAr: 'عرض خطة العلاج المعتمدة وأدويتها مع الغرض وطريقة الاستخدام وفق الوصفة، وتذكيرات اختيارية — دون أي تعديل علاجي مستقل من التطبيق.',
      bodyEn: 'The approved treatment plan and its medications, with purpose and usage per the prescription, plus optional reminders — with no independent treatment changes by the app.',
    },
    {
      icon: <History className="w-5 h-5" />,
      titleAr: 'استمرارية الرعاية',
      titleEn: 'Continuity of Care',
      bodyAr: 'تسلسل زمني واحد للإجراءات المكتملة والمعلّقة عبر الرحلة كلها، يميّز بين صدور النتيجة ومراجعتها، وبين إرسال الإحالة واكتمال المتابعة.',
      bodyEn: 'One timeline of completed and pending actions across the whole journey, distinguishing result issuance from review, and referral sending from completed follow-up.',
    },
  ];

  // Mini visual mocks under each feature card — static illustrations only
  // (no working controls), each captioned as synthetic example data.
  const mockCaption = (
    <div className="text-[10px] text-slate-400 mt-2">{isAr ? 'مثال توضيحي — بيانات تجريبية' : 'Illustrative example — synthetic data'}</div>
  );
  const featureMocks: React.ReactNode[] = [
    // Patient Portal
    <div key="m0" className="mt-3">
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] space-y-1.5">
        <div className="flex justify-between"><span>🗓️ {isAr ? 'موعد مراجعة — عيادة الفحوص' : 'Review appointment — Screening clinic'}</span><span className="text-slate-400">{isAr ? '٢٨ تشرين الأول 10:30' : '28 Oct 10:30'}</span></div>
        <div className="flex justify-between"><span>🧪 {isAr ? 'نتيجة جديدة: سكر صائم' : 'New result: Fasting glucose'}</span><span className="px-1.5 rounded bg-sky-100 text-sky-800 font-bold">{isAr ? 'جديد' : 'New'}</span></div>
      </div>
      {mockCaption}
    </div>,
    // Lab Follow-up
    <div key="m1" className="mt-3">
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] space-y-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{isAr ? 'طُلب ✓' : 'Ordered ✓'}</span>
          <span className="text-slate-300">←</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">{isAr ? 'عينة ✓' : 'Sample ✓'}</span>
          <span className="text-slate-300">←</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">{isAr ? 'قيد المعالجة' : 'Processing'}</span>
        </div>
        <div className="text-slate-400">{isAr ? 'آخر تحديث من المخبر: قبل ساعتين' : 'Last update from the lab: 2 hours ago'}</div>
      </div>
      {mockCaption}
    </div>,
    // Result Explanation
    <div key="m2" className="mt-3">
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] space-y-1.5">
        <div className="flex justify-between items-center">
          <span>{isAr ? 'سكر صائم: 5.6 mmol/L' : 'Fasting glucose: 5.6 mmol/L'}</span>
          <span className="px-1.5 py-0.5 rounded-full border border-sky-300 text-sky-800 font-bold">{isAr ? 'اشرح لي بلغة بسيطة' : 'Explain it simply'}</span>
        </div>
        <div className="text-slate-400">{isAr ? 'شرح عام من مجالات مرجعية منشورة — لا يشخّص حالتك' : 'A general explanation from published reference ranges — not a diagnosis of your case'}</div>
      </div>
      {mockCaption}
    </div>,
    // Referral Follow-up
    <div key="m3" className="mt-3">
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] space-y-1.5">
        <div className="flex justify-between"><span>🫀 {isAr ? 'إحالة إلى عيادة القلب' : 'Referral to Cardiology'}</span><span className="px-1.5 rounded bg-amber-100 text-amber-800 font-bold">{isAr ? 'المهلة: ٥ أيام — تبقّى يومان' : 'Deadline: 5 days — 2 left'}</span></div>
        <div className="text-slate-500">{isAr ? 'المسؤول المسمّى: منسّقة الرعاية' : 'Named owner: Care coordinator'}</div>
      </div>
      {mockCaption}
    </div>,
    // Care Plan & Medications
    <div key="m4" className="mt-3">
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] space-y-1.5">
        <div className="flex justify-between"><span>{isAr ? 'دواء تجريبي أ' : 'Demo medicine A'}</span><span className="text-emerald-700 font-bold">✓ {isAr ? 'أُخذ 08:00' : 'Taken 08:00'}</span></div>
        <div className="flex justify-between"><span>{isAr ? 'دواء تجريبي ب' : 'Demo medicine B'}</span><span className="text-slate-400">⏳ 20:00 — {isAr ? 'لم يحن وقته' : 'Not due yet'}</span></div>
      </div>
      {mockCaption}
    </div>,
    // Continuity of Care
    <div key="m5" className="mt-3">
      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-[11px] space-y-1">
        <div>● {isAr ? 'الخروج من المشفى موثّق' : 'Hospital discharge documented'}</div>
        <div>● {isAr ? 'مكالمة متابعة بعد ٤٨ ساعة' : 'Follow-up call after 48 hours'}</div>
        <div className="text-slate-400">○ {isAr ? 'مراجعة العيادة — مجدولة' : 'Clinic review — scheduled'}</div>
      </div>
      {mockCaption}
    </div>,
  ];

  const requirements: Array<{
    icon: React.ReactNode;
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
  }> = [
    {
      icon: <Database className="w-5 h-5" />,
      titleAr: 'تكامل آمن مع المشفى والمختبر',
      titleEn: 'Secure Hospital & Lab Integration',
      bodyAr: 'ربط عبر واجهات قياسية مع أنظمة المشفى والمختبر، بحيث تصل الطلبات والنتائج والمراجعات كرسائل مهيكلة وتُستورد تلقائياً فور اعتمادها — دون إدخال يدوي.',
      bodyEn: 'Connection through standard interfaces to hospital and laboratory systems, so orders, results, and reviews arrive as structured messages and are imported automatically once approved — with no manual entry.',
    },
    {
      icon: <Fingerprint className="w-5 h-5" />,
      titleAr: 'الهوية والصلاحيات والخصوصية',
      titleEn: 'Identity, Access & Privacy',
      bodyAr: 'تحقق موثوق من هوية المريض، وصلاحيات وصول محددة، وحماية لبيانات المرضى وفق الأنظمة — بحيث لا يرى أي مستخدم إلا بياناته المصرّح بها.',
      bodyEn: 'Reliable patient identity verification, defined access permissions, and protection of patient data under regulation — so no user ever sees data beyond what they are authorised for.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      titleAr: 'توثيق مصدر كل معلومة',
      titleEn: 'Provenance for Every Datum',
      bodyAr: 'كل معلومة تحمل مصدرها وتاريخ آخر تحديث لها. والبيانات المتعارضة أو التي يتعذّر ربطها بمريض أو حالة تُحال إلى منسّق بشري لمعالجتها — ولا تُحلّ تلقائياً ولا تُستكمل بالتخمين أبداً.',
      bodyEn: 'Every datum carries its source and last-updated time. Conflicting data, or data that cannot be linked to a patient or a case, is referred to a human coordinator for handling — it is never resolved automatically and never completed by guessing.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header + honesty banner */}
      <div className="bg-white rounded-2xl border border-violet-200 shadow-xs overflow-hidden">
        <div className="bg-violet-700 text-white px-5 py-4 flex items-start gap-3">
          <Sparkles className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h2 className="text-lg font-extrabold leading-snug">
              {isAr ? 'بوابة التصور المستقبلي — خريطة الطريق' : 'Future Vision Gateway — Roadmap'}
            </h2>
            <p className="text-violet-100 text-xs mt-1 leading-relaxed">
              {isAr
                ? 'هذه الصفحة تعرض اتجاه تطوير مستقبلي صممته مطوّرة التطبيق: كيف يمكن أن تتطور رعاية من نموذج تثقيف ومتابعة مستقل إلى خدمة مترابطة مع بيانات المشفى والمختبر. لا شيء فيها مفعّل في هذا النموذج الأولي — لا تسجيل دخول، ولا سجلات شخصية، ولا أي اتصال بأنظمة حقيقية، وكل البيانات هنا اصطناعية.'
                : 'This page presents a future development direction designed by the app\u2019s developer: how Riaya could evolve from a standalone education and follow-up prototype into a service connected to hospital and laboratory data. Nothing here is active in this prototype — no login, no personal records, no connection to real systems, and all data here is synthetic.'}
            </p>
          </div>
        </div>
        <div className="p-5 text-sm leading-relaxed text-slate-700">
          {isAr
            ? 'هدف المشروع الأساسي هو تقليل الفجوة بين اكتشاف الحاجة إلى الفحص ووصول المريض إلى الرعاية المناسبة. المسار المستقبلي المتوخّى امتداد واحد متصل: تحديد الحاجة إلى الفحص ← طلب الفحص ← متابعة حالة التحليل ← توضيح النتيجة بعد صدورها ← توثيق مراجعة الطبيب ← متابعة الإحالة أو خطة الرعاية ← إغلاق الرحلة بعد توثيق اكتمال الخطوات. أما النموذج الحالي، فيعرض فقط ما يستطيع تنفيذه فعلياً.'
            : 'The project\u2019s core aim is to narrow the gap between discovering the need for a test and the patient reaching the right care. The envisioned future pathway is one connected chain: identify the screening need → test ordered → lab status followed → result explained after issuance → clinician review documented → referral or care plan followed → journey closed once completion is documented. The current prototype shows only what it can actually do.'}
        </div>
      </div>

      {/* AXIS: the lab-test status chain */}
      <div className="bg-white rounded-2xl border border-violet-200 shadow-xs p-5">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-violet-700" />
          {isAr ? 'محور التصور: سلسلة حالة التحليل' : 'The axis: the lab-test status chain'}
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
          {isAr
            ? 'كل مرحلة في هذه السلسلة تعتمد على بيانات يبلّغها النظام المصدر (المشفى أو المخبر). المرحلة التي لم يبلّغها المصدر بعد تظهر «غير معروفة» — ولا يفترض التطبيق أبداً أنها تمت.'
            : 'Every stage in this chain depends on data reported by the source system (hospital or laboratory). A stage the source has not yet reported is shown as \u201CUnknown\u201D — the app never assumes it happened.'}
        </p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {labChain.map((s, i) => (
            <div key={i} className="relative rounded-xl border border-violet-200 bg-violet-50/50 p-3.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-700 text-white text-xs font-black flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="font-bold text-slate-900 text-sm">{isAr ? s.titleAr : s.titleEn}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{isAr ? s.bodyAr : s.bodyEn}</p>
            </div>
          ))}
        </div>
        {/* Worked example: ONE demo test walking the chain — done / current / unknown */}
        <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="font-bold text-slate-900 text-sm">
              {isAr ? 'مثال عملي: تحليل واحد عبر السلسلة' : 'Worked example: one test walking the chain'}
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
              {isAr ? 'مثال توضيحي — بيانات تجريبية بالكامل' : 'Illustrative example — fully synthetic data'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {isAr ? 'مريض تجريبي — تحليل سكر الدم الصائم، طلبته عيادة الفحوص:' : 'Demo patient — a fasting blood glucose test ordered by the screening clinic:'}
          </p>
          <div className="mt-3 space-y-2">
            {[
              { t: isAr ? 'طُلب التحليل' : 'Test ordered', d: isAr ? '١٢ تشرين الأول — 09:10' : '12 Oct — 09:10', st: 'done' },
              { t: isAr ? 'أُخذت العينة' : 'Sample collected', d: isAr ? '١٢ تشرين الأول — 09:40' : '12 Oct — 09:40', st: 'done' },
              { t: isAr ? 'التحليل قيد المعالجة' : 'Test in processing', d: isAr ? '١٢ تشرين الأول — 11:05' : '12 Oct — 11:05', st: 'done' },
              { t: isAr ? 'صدرت النتيجة' : 'Result issued', d: isAr ? '١٣ تشرين الأول — 08:15' : '13 Oct — 08:15', st: 'done' },
              { t: isAr ? 'النتيجة بانتظار مراجعة الطبيب — الحالة الحالية (منذ يومين؛ المهلة ٣ أيام)' : 'Awaiting clinician review — CURRENT STATE (2 days; deadline 3 days)', d: isAr ? 'لم تصل مراجعة موثقة بعد' : 'No documented review has arrived yet', st: 'current' },
              { t: isAr ? 'رُوجعت النتيجة ووُثّقت خطة المتابعة' : 'Reviewed, follow-up plan documented', d: isAr ? 'غير معروفة — لم يبلّغها النظام المصدر' : 'Unknown — not reported by the source system', st: 'unknown' },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${row.st === 'done' ? 'bg-emerald-600 text-white' : row.st === 'current' ? 'bg-amber-500 text-white animate-pulse' : 'bg-white border border-dashed border-slate-300 text-slate-400'}`}>
                  {row.st === 'done' ? '✓' : row.st === 'current' ? '●' : '؟'}
                </span>
                <span className={`font-semibold ${row.st === 'unknown' ? 'text-slate-400' : 'text-slate-800'}`}>{row.t}</span>
                <span className="text-slate-400">— {row.d}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs leading-relaxed text-amber-900">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            {isAr
              ? 'مثال على الصدق في العرض: إذا وصلت النتيجة ولم تصل أي مراجعة موثقة، تبقى حالة الحالة «النتيجة بانتظار مراجعة الطبيب» مهما طال الوقت — ولا تتحول إلى «رُوجعت» إلا بحدث فعلي من النظام المصدر. وغياب الحدث المتوقع بعد مهلته هو بالذات ما يطلق التصعيد.'
              : 'Honesty in display, by example: if the result has arrived but no documented review has, the case stays at \u201Cawaiting clinician review\u201D however long it takes — it only becomes \u201Creviewed\u201D by an actual event from the source system. And the absence of an expected event past its deadline is precisely what triggers escalation.'}
          </p>
        </div>
      </div>

      {/* Proposed future features */}
      <div>
        <h3 className="font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-violet-700" />
          {isAr ? 'الميزات المستقبلية المقترحة:' : 'Proposed future features:'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-800 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{isAr ? s.titleAr : s.titleEn}</div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{isAr ? s.bodyAr : s.bodyEn}</p>
                </div>
              </div>
              {featureMocks[i]}
            </div>
          ))}
        </div>
      </div>

      {/* Implementation requirements */}
      <div>
        <h3 className="font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-violet-700" />
          {isAr ? 'متطلبات التنفيذ:' : 'Implementation requirements:'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {requirements.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-2">
                {r.icon}
              </div>
              <div className="font-bold text-slate-900 text-sm">{isAr ? r.titleAr : r.titleEn}</div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">{isAr ? r.bodyAr : r.bodyEn}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Smart dose reminders with a Riaya account — future design, NOT implemented */}
      <div className="bg-white border border-violet-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-violet-100 text-violet-800 border border-violet-200 rounded-full px-2.5 py-1">
            <Sparkles className="w-3.5 h-3.5" />
            {isAr ? 'تصميم مستقبلي — غير منفّذ' : 'Future design — not implemented'}
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-violet-700" />
          {isAr ? 'تذكير الجرعات الذكي — بحساب رعاية' : 'Smart Dose Reminders — with a Riaya Account'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ol className="space-y-3 text-sm text-slate-700 leading-relaxed list-none">
            <li className="flex gap-2.5">
              <UserPlus className="w-4.5 h-4.5 text-violet-700 shrink-0 mt-0.5" />
              <span>{isAr ? 'المريض ينشئ حساب رعاية ويسجّل دخوله مرة واحدة.' : 'The patient creates a Riaya account and signs in once.'}</span>
            </li>
            <li className="flex gap-2.5">
              <Pill className="w-4.5 h-4.5 text-violet-700 shrink-0 mt-0.5" />
              <span>{isAr ? 'يضيف أدويته مرة واحدة — تُحفظ في حسابه وتتزامن على أجهزته.' : 'Medications are added once — saved to the account and synced across devices.'}</span>
            </li>
            <li className="flex gap-2.5">
              <Smartphone className="w-4.5 h-4.5 text-violet-700 shrink-0 mt-0.5" />
              <span>{isAr ? 'في وقت الجرعة يصله إشعار دفع من رعاية نفسه — يرنّ ويظهر على الشاشة المقفولة حتى والتطبيق مغلق، بلا ملفات تقويم ولا خطوات إضافية.' : 'At dose time, a push notification from Riaya itself arrives — ringing and appearing on the lock screen even with the app closed, with no calendar files or extra steps.'}</span>
            </li>
            <li className="flex gap-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-violet-700 shrink-0 mt-0.5" />
              <span>{isAr ? 'من الإشعار نفسه: «أخذت الجرعة» أو «ذكّرني بعد 15 دقيقة» — والتأكيد يُسجَّل فوراً.' : 'From the notification itself: "Took my dose" or "Remind me in 15 minutes" — the confirmation is logged instantly.'}</span>
            </li>
            <li className="flex gap-2.5">
              <TrendingUp className="w-4.5 h-4.5 text-violet-700 shrink-0 mt-0.5" />
              <span>{isAr ? 'إذا لم يؤكّد خلال المهلة، يصعَّد التنبيه إلى صاحب الحالة المسؤول — نفس منطق التصعيد في لوحة التنسيق أدناه.' : 'If there is no confirmation within the window, the alert escalates to the named case owner — the same escalation logic as the coordination board below.'}</span>
            </li>
          </ol>

          {/* Static phone mock — illustrative only */}
          <div className="flex justify-center">
            <div className="w-56 rounded-[1.8rem] border-4 border-slate-800 bg-slate-100 p-2.5 space-y-2 shadow-md">
              <div className="text-center text-[10px] text-slate-500 font-semibold">
                <AlarmClock className="w-3.5 h-3.5 inline -mt-0.5" /> 08:00
              </div>
              <div className="bg-white rounded-2xl p-3 shadow-sm space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                  <Bell className="w-3.5 h-3.5 text-blue-800" />
                  {isAr ? 'رعاية — وقت جرعتك' : 'Riaya — Time for your dose'}
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isAr ? 'دواء تجريبي 500 ملغ — حبة واحدة' : 'Demo medication 500 mg — one tablet'}
                </p>
                <div className="flex gap-1.5 pt-0.5">
                  <span className="flex-1 text-center text-[10px] font-bold bg-blue-800 text-white rounded-lg py-1.5">
                    {isAr ? 'أخذت الجرعة' : 'Took my dose'}
                  </span>
                  <span className="flex-1 text-center text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-lg py-1.5">
                    {isAr ? 'ذكّرني بعد 15 دقيقة' : 'Remind me in 15 min'}
                  </span>
                </div>
              </div>
              <p className="text-center text-[9px] text-slate-400">
                {isAr ? 'نموذج توضيحي — بيانات تجريبية' : 'Illustrative mock — demo data'}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
          {isAr
            ? 'يتطلب هذا التصميم خادماً وحسابات مستخدمين — خارج نطاق النموذج الحالي الذي يعمل بلا حسابات، وتذكيراته اليوم عبر تقويم الهاتف.'
            : 'This design requires a server and user accounts — outside the current prototype, which works without accounts and delivers reminders through the phone calendar today.'}
        </p>
      </div>

      {/* Verification & methodology — judge-facing evidence, kept off the patient journey */}
      <div className="bg-white rounded-2xl border border-violet-200 shadow-xs p-5">
        <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-violet-700" />
          {isAr ? 'التحقق والمنهجية — للمحكّمين والمراجعين' : 'Verification & Methodology — for judges and reviewers'}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {[
            { n: '5', ar: 'قواعد فحص — كل قاعدة مربوطة بمصدر USPSTF الخاص بها (العنوان والسنة والرابط)', en: 'screening rules — each bound to its own USPSTF source (title, year, URL)' },
            { n: '10 + 21', ar: 'أدلة موثّقة + أدلة أعراض تشرح كيف يعمل فريق المشفى (مصادر NHS)', en: 'verified guides + symptom guides explaining how hospital teams work (NHS sources)' },
            { n: '428', ar: 'فحصاً آلياً ناجحاً: 374 اختبار وحدة + 54 حالة تقييم مطابقة عبر 6 محاور', en: 'automated checks passing: 374 unit tests + 54 conformance-evaluation cases across 6 axes' },
            { n: '24 Oct 2026', ar: 'تاريخ التشغيل — على نسخة التقديم المرشحة الحالية', en: 'run date — on the current submission-candidate build' },
          ].map((t, i) => (
            <div key={i} className="rounded-xl border border-violet-100 bg-violet-50/50 p-3 text-center">
              <div className="text-lg font-black text-violet-800">{t.n}</div>
              <div className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{isAr ? t.ar : t.en}</div>
            </div>
          ))}
        </div>
        <div className="text-xs text-slate-600 leading-relaxed mt-4 space-y-2">
          <p>
            {isAr
              ? 'محاور التقييم الستة: مطابقة قرارات الفحص للقواعد المرجعية (بما فيها الأعمار الحدّية)، اكتمال التفسير، التعامل مع علامات الخطر، سلامة المصدر لكل قاعدة، سلوك عدم اليقين (لا قرار عند نقص المعلومات — مع تسمية الحقول الناقصة)، وسلامة المدخلات (النفي، الأرقام العربية، غربال الأسئلة المولّدة).'
              : 'The six evaluation axes: screening-decision conformance to the reference rules (including boundary ages), explanation completeness, red-flag handling, per-rule source integrity, uncertainty behaviour (no decision when information is missing — with the missing fields named), and input safety (negation, Arabic-Indic digits, the generated-question screen).'}
          </p>
          <p>
            {isAr
              ? 'انضباط التسمية: ما يُقاس هو «نسبة مطابقة قرارات النظام للقواعد المرجعية ضمن مجموعة الاختبار» — وليس «دقة طبية»، ولا يثبت أداءً على مرضى حقيقيين. الحالات مكتوبة يدوياً لاختبار قواعد مكتوبة يدوياً، وهذا مُفصَح عنه. التقرير الكامل بالنتائج والقيود موجود في ملف EVALUATION.md بالمستودع.'
              : 'Naming discipline: what is measured is the conformance rate of the system\u2019s decisions to the reference rules within the test set — not "medical accuracy", and it does not establish performance on real patients. The cases are hand-written to test hand-written rules, and that is disclosed. The full report, with results and limitations, is in the repository\u2019s EVALUATION.md.'}
          </p>
        </div>
      </div>

      {/* Limits of the current model */}
      <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs leading-relaxed text-sky-800">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          {isAr
            ? 'حدود النموذج الحالي: هذه الميزات رؤية مستقبلية وليست وظائف مفعّلة. ما يعمل فعلاً اليوم هو ما تراه في بقية التبويبات — المحادثة التثقيفية من مصادر موثقة، متابعة الرحلة والأدوية، بوابة الفحوص بقواعد USPSTF الخمس، ولوحة تنسيق الحالات ببيانات سيناريو اصطناعية موسومة كمحاكاة. النموذج الحالي لا يتصل بأنظمة مشفى أو مختبر حقيقية، ولا يملك وصولاً إلى سجلات مرضى فعلية.'
            : 'Limits of the current model: these features are a future vision, not active functions. What actually works today is what you see in the other tabs — education chat from verified sources, journey and medication follow-up, the five-rule USPSTF screening gateway, and the case-coordination board on synthetic scenario data labelled as simulation. The current prototype does not connect to real hospital or laboratory systems and has no access to actual patient records.'}
        </p>
      </div>

      <div className="flex items-start gap-2.5 text-[11px] leading-relaxed text-slate-400 px-1">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>
          {isAr
            ? 'تنبيه للعرض: لا تُوصف محتويات هذه البوابة في أي مادة تقديم على أنها «ما تم بناؤه» — هي الاتجاه المستقبلي فقط.'
            : 'Presentation note: the contents of this gateway must never be described in any submission material as \u201Cwhat has been built\u201D — they are the future direction only.'}
        </p>
      </div>
    </div>
  );
};

export default FutureVisionTab;
