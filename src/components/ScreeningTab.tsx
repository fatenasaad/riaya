import React, { useState, useEffect } from 'react';
import { Language, ScreeningInputs, ScreeningResultExplanation, ScreeningFollowUps } from '../types';
import { evaluateScreeningRules } from '../utils/screeningEngine';
import { getStoredScreeningFollowUps, setStoredScreeningFollowUps } from '../utils/storage';
import {
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sliders,
  Info,
  CalendarCheck,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';
import { EducationTab } from './EducationTab';
import { buildExplainRecords } from '../utils/explainAgent';
import { compareTopic, userPosition, EVIDENCE_CLAIMS } from '../utils/evidenceComparator';

interface ScreeningTabProps {
  language: Language;
  onAskRiaya: (topic: string) => void;
  guidesJumpSignal?: number;
}

export const ScreeningTab: React.FC<ScreeningTabProps> = ({ language, onAskRiaya, guidesJumpSignal }) => {
  const isAr = language === 'ar';

  const [gatewayView, setGatewayView] = useState<'wizard' | 'guides'>('wizard');

  useEffect(() => {
    if (guidesJumpSignal && guidesJumpSignal > 0) {
      setGatewayView('guides');
      setTimeout(() => {
        const el = document.getElementById('verified-guides');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    }
  }, [guidesJumpSignal]);

  const [wizardStep, setWizardStep] = useState(0);

  // Screening inputs state
  const [inputs, setInputs] = useState<ScreeningInputs>({
    age: undefined,
    sexAssigned: undefined,
    isPregnant: 'no',
    hasOverweightObesity: undefined,
    hasKnownHypertension: 'no',
    smokingStatus: undefined,
    packYears: undefined,
    yearsSinceQuitting: undefined,
    colorectalTestType: undefined,
    colorectalTestDate: undefined,
    hasColorectalSymptomsOrHighRisk: undefined,
    mammogramDate: undefined,
    hasBreastHighRisk: undefined,
  });

  const [hasEvaluated, setHasEvaluated] = useState(false);

  // Patient self-reported follow-up per screening rule (booked / completed).
  // Self-report only — never presented as provider-verified confirmation.
  const [followUps, setFollowUps] = useState<ScreeningFollowUps>(() => getStoredScreeningFollowUps());
  const [followUpDates, setFollowUpDates] = useState<Record<string, { booked: string; completed: string }>>({});

  const recordFollowUp = (ruleId: string, kind: 'booked' | 'completed') => {
    const dateVal = followUpDates[ruleId]?.[kind] || '';
    const current = followUps[ruleId] || { ruleId };
    const updatedEntry =
      kind === 'booked'
        ? { ...current, bookedAt: new Date().toISOString(), bookedDate: dateVal || undefined }
        : { ...current, completedAt: new Date().toISOString(), completedDate: dateVal || undefined };
    const updated = { ...followUps, [ruleId]: updatedEntry };
    setFollowUps(updated);
    setStoredScreeningFollowUps(updated);
  };

  const clearFollowUp = (ruleId: string, kind: 'booked' | 'completed') => {
    const current = followUps[ruleId];
    if (!current) return;
    const updatedEntry = { ...current };
    if (kind === 'booked') {
      delete updatedEntry.bookedAt;
      delete updatedEntry.bookedDate;
    } else {
      delete updatedEntry.completedAt;
      delete updatedEntry.completedDate;
    }
    const updated = { ...followUps };
    if (!updatedEntry.bookedAt && !updatedEntry.completedAt) {
      delete updated[ruleId];
    } else {
      updated[ruleId] = updatedEntry;
    }
    setFollowUps(updated);
    setStoredScreeningFollowUps(updated);
  };

  const results: ScreeningResultExplanation[] = evaluateScreeningRules(inputs);

  // Explain Agent evidence records — built by the deterministic agent module
  // from the same inputs and engine results. No language model involved.
  const explainRecords = buildExplainRecords(inputs, results);
  const [showTrace, setShowTrace] = useState<Record<string, boolean>>({});

  const resetForm = () => {
    setInputs({
      age: undefined,
      sexAssigned: undefined,
      isPregnant: 'no',
      hasOverweightObesity: undefined,
      hasKnownHypertension: 'no',
      smokingStatus: undefined,
      packYears: undefined,
      yearsSinceQuitting: undefined,
      colorectalTestType: undefined,
      colorectalTestDate: undefined,
      hasColorectalSymptomsOrHighRisk: undefined,
      mammogramDate: undefined,
      hasBreastHighRisk: undefined,
    });
    setHasEvaluated(false);
    setWizardStep(0);
  };

  // Questions definition for the Conversational Wizard
  const wizardQuestions = [
    {
      id: 'age',
      titleAr: 'ما هو عمرك الحالي بالسنوات؟',
      titleEn: 'What is your current age in years?',
      whyAr: 'توصيات الفحص الوقائي (مثل القولون، الثدي، السكري، الرئة، وضغط الدم) تعتمد فتراتها وأهليتها الأساسية على الفئات العمرية المحددة علمياً.',
      whyEn: 'Evidence-based preventive screening guidelines define eligibility thresholds and safe intervals strictly by age brackets.',
      render: () => (
        <div className="space-y-2">
          <input
            type="number"
            min="1"
            max="120"
            value={inputs.age || ''}
            onChange={(e) => setInputs({ ...inputs, age: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={isAr ? 'أدخل العمر (مثال: 52)' : 'Enter age (e.g. 52)'}
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-700"
          />
        </div>
      )
    },
    {
      id: 'sex',
      titleAr: 'الجنس المحدد عند الولادة:',
      titleEn: 'Sex assigned at birth:',
      whyAr: 'توصية فحص سرطان الثدي بالماموجرام (USPSTF 2024) تنطبق على النساء والأشخاص المحددين أنثى عند الولادة.',
      whyEn: 'The USPSTF (2024) routine mammography recommendation applies specifically to cisgender women and individuals assigned female at birth.',
      render: () => (
        <div className="grid grid-cols-3 gap-2">
          {[
            { val: 'female', ar: 'أنثى', en: 'Female' },
            { val: 'male', ar: 'ذكر', en: 'Male' },
            { val: 'other', ar: 'آخر / تفضيل عدم التحديد', en: 'Other / Prefer not to say' },
          ].map((opt) => (
            <button
              type="button"
              key={opt.val}
              onClick={() => setInputs({ ...inputs, sexAssigned: opt.val as any })}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors min-h-[48px] cursor-pointer ${
                inputs.sexAssigned === opt.val
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isAr ? opt.ar : opt.en}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'weight',
      titleAr: 'هل تعاني حالياً من زيادة الوزن أو السمنة؟',
      titleEn: 'Do you have overweight or obesity?',
      whyAr: 'توصية فحص السكري لـ USPSTF (2021) تشترط صراحة وجود زيادة وزن أو سمنة للأعمار 35-70، ولا يجوز استنتاجها من العمر وحده دون تأكيد مباشر.',
      whyEn: 'The USPSTF (2021) diabetes recommendation applies specifically to asymptomatic adults aged 35-70 with overweight or obesity. It cannot be assumed.',
      render: () => (
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: 'yes', ar: 'نعم (يوجد زيادة وزن أو سمنة)', en: 'Yes (Overweight or Obesity)' },
            { val: 'no', ar: 'لا (وزن طبيعي)', en: 'No (Normal Weight)' },
          ].map((opt) => (
            <button
              type="button"
              key={opt.val}
              onClick={() => setInputs({ ...inputs, hasOverweightObesity: opt.val as any })}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors min-h-[48px] cursor-pointer ${
                inputs.hasOverweightObesity === opt.val
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isAr ? opt.ar : opt.en}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'hypertension',
      titleAr: 'هل تم تشخيصك سابقاً بارتفاع ضغط الدم؟',
      titleEn: 'Have you been previously diagnosed with high blood pressure (hypertension)?',
      whyAr: 'فحص ضغط الدم المسحي (USPSTF 2021) يهدف للاكتشاف الأولي لدى من ليس لديهم تشخيص معروف مسبقاً.',
      whyEn: 'Blood pressure screening applies as a primary screen for individuals without known hypertension.',
      render: () => (
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: 'no', ar: 'لا (لا يوجد تشخيص مسبق)', en: 'No (No prior diagnosis)' },
            { val: 'yes', ar: 'نعم (مشخص بارتفاع الضغط)', en: 'Yes (Known hypertension)' },
          ].map((opt) => (
            <button
              type="button"
              key={opt.val}
              onClick={() => setInputs({ ...inputs, hasKnownHypertension: opt.val as any })}
              className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition-colors min-h-[48px] cursor-pointer ${
                inputs.hasKnownHypertension === opt.val
                  ? 'bg-sky-600 text-white border-sky-600 shadow-2xs font-semibold'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isAr ? opt.ar : opt.en}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'colorectal',
      titleAr: 'سجل وأعراض فحص القولون والمستقيم:',
      titleEn: 'Colorectal Screening History & Symptoms:',
      whyAr: 'الفترة الآمنة للفحص تعتمد على نوع الفحص السابق (تنظير القولون كل 10 سنوات مقابل فحص البراز FIT سنوياً). وجود أعراض أو تاريخ مرضي عالي الخطورة يتطلب تقييماً متخصصاً.',
      whyEn: 'Intervals differ strictly by test type (10 years for normal colonoscopy vs annual FIT). Symptoms or high risk require specialist diagnostic assessment.',
      render: () => (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isAr ? 'هل تعاني من أعراض (كنزيف أو فقر دم) أو تاريخ عائلي/شخصي عالي الخطورة؟' : 'Any symptoms (visible blood, unexplained anemia) or high-risk history?'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'no', ar: 'لا (خطورة متوسطة / بدون أعراض)', en: 'No (Average Risk)' },
                { val: 'yes', ar: 'نعم (أعراض أو خطورة عالية)', en: 'Yes (Symptoms or High Risk)' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setInputs({ ...inputs, hasColorectalSymptomsOrHighRisk: opt.val as any })}
                  className={`p-2.5 rounded-lg border text-xs font-medium min-h-[44px] cursor-pointer ${
                    inputs.hasColorectalSymptomsOrHighRisk === opt.val
                      ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isAr ? opt.ar : opt.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isAr ? 'نوع آخر فحص قولون تم إجراؤه:' : 'Type of most recent colorectal screening test:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'none', ar: 'لم أجرِ فحصاً من قبل', en: 'Never tested' },
                { val: 'colonoscopy', ar: 'تنظير قولون', en: 'Colonoscopy' },
                { val: 'fit', ar: 'فحص براز FIT', en: 'Stool FIT' },
                { val: 'unknown', ar: 'غير معروف / لست متأكداً', en: 'Unknown / Not sure' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setInputs({ ...inputs, colorectalTestType: opt.val as any })}
                  className={`p-2.5 rounded-lg border text-xs font-medium min-h-[44px] cursor-pointer ${
                    inputs.colorectalTestType === opt.val
                      ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isAr ? opt.ar : opt.en}
                </button>
              ))}
            </div>
          </div>

          {inputs.colorectalTestType === 'colonoscopy' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isAr ? 'تاريخ إجراء تنظير القولون الأخير:' : 'Timing of last normal colonoscopy:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'within_10_years', ar: 'خلال آخر 10 سنوات', en: 'Within past 10 years' },
                  { val: 'more_than_10_years', ar: 'قبل أكثر من 10 سنوات', en: 'More than 10 years ago' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.val}
                    onClick={() => setInputs({ ...inputs, colorectalTestDate: opt.val as any })}
                    className={`p-2.5 rounded-lg border text-xs font-medium min-h-[44px] cursor-pointer ${
                      inputs.colorectalTestDate === opt.val
                        ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isAr ? opt.ar : opt.en}
                  </button>
                ))}
              </div>
            </div>
          )}

          {inputs.colorectalTestType === 'fit' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isAr ? 'تاريخ إجراء فحص البراز FIT الأخير:' : 'Timing of last stool FIT test:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'within_1_year', ar: 'خلال آخر 12 شهراً', en: 'Within past 12 months' },
                  { val: 'more_than_1_year', ar: 'قبل أكثر من 12 شهراً', en: 'More than 12 months ago' },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.val}
                    onClick={() => setInputs({ ...inputs, colorectalTestDate: opt.val as any })}
                    className={`p-2.5 rounded-lg border text-xs font-medium min-h-[44px] cursor-pointer ${
                      inputs.colorectalTestDate === opt.val
                        ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {isAr ? opt.ar : opt.en}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'breast',
      titleAr: 'سجل فحص الثدي وعوامل الخطورة العالية:',
      titleEn: 'Breast Screening History & High-Risk Status:',
      whyAr: 'توصية USPSTF (2024) تنص على فحص الماموجرام كل سنتين للنساء ذوات الخطورة المتوسطة بين 40 و 74 عاماً، وتستثني ذوات الخطورة العالية أو من أجرين فحصاً خلال العامين الماضيين.',
      whyEn: 'The USPSTF (2024) guideline recommends biennial screening for average-risk women 40-74. It excludes individuals with high-risk genetic syndromes or prior breast cancer.',
      render: () => (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isAr ? 'هل يوجد تاريخ إصابة سابقة بسرطان الثدي، أو طفرات جينية عالية الخطورة (مثل BRCA)، أو علاج إشعاعي للصدر؟' : 'Prior breast cancer, high-risk genetic syndrome (e.g. BRCA), or past chest radiation?'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: 'no', ar: 'لا (خطورة متوسطة)', en: 'No (Average Risk)' },
                { val: 'yes', ar: 'نعم (خطورة وراثية أو تاريخ سابق)', en: 'Yes (High Risk / Prior)' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setInputs({ ...inputs, hasBreastHighRisk: opt.val as any })}
                  className={`p-2.5 rounded-lg border text-xs font-medium min-h-[44px] cursor-pointer ${
                    inputs.hasBreastHighRisk === opt.val
                      ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isAr ? opt.ar : opt.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isAr ? 'تاريخ إجراء آخر فحص ماموجرام روتيني:' : 'Timing of last routine screening mammogram:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: 'never', ar: 'لم يسبق الفحص', en: 'Never screened' },
                { val: 'within_2_years', ar: 'خلال آخر سنتين', en: 'Within past 2 years' },
                { val: 'more_than_2_years', ar: 'قبل أكثر من سنتين', en: 'Over 2 years ago' },
                { val: 'unknown', ar: 'غير معروف / غير متأكد', en: 'Unknown / Not sure' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setInputs({ ...inputs, mammogramDate: opt.val as any })}
                  className={`p-2.5 rounded-lg border text-xs font-medium min-h-[44px] cursor-pointer ${
                    inputs.mammogramDate === opt.val
                      ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isAr ? opt.ar : opt.en}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'smoking',
      titleAr: 'سجل التدخين وفحص سرطان الرئة:',
      titleEn: 'Smoking History & Lung Cancer Screening:',
      whyAr: 'توصية USPSTF (2021) تشترط استيفاء 3 معايير معاً للفحص السنوي بالأشعة المقطعية: العمر 50-80، تدخين 20 سنة/علبة على الأقل، وأن يكون الشخص مدخناً حالياً أو أقلع خلال آخر 15 سنة.',
      whyEn: 'The USPSTF (2021) lung cancer rule requires ALL 3 criteria: Age 50-80, >=20 pack-years, and currently smokes or quit within the past 15 years.',
      render: () => (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {isAr ? 'حالة التدخين الحالية:' : 'Current smoking status:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'never', ar: 'لم أدخن قط', en: 'Never Smoked' },
                { val: 'current', ar: 'مدخن حالي', en: 'Current Smoker' },
                { val: 'former', ar: 'مدخن سابق (أقلعت)', en: 'Former Smoker' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.val}
                  onClick={() => setInputs({ ...inputs, smokingStatus: opt.val as any })}
                  className={`p-2.5 rounded-lg border text-xs font-medium min-h-[44px] cursor-pointer ${
                    inputs.smokingStatus === opt.val
                      ? 'bg-sky-600 text-white border-sky-600 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isAr ? opt.ar : opt.en}
                </button>
              ))}
            </div>
          </div>

          {(inputs.smokingStatus === 'current' || inputs.smokingStatus === 'former') && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isAr ? 'معدل التدخين بـ (سنة / علبة) - Pack-Years:' : 'Smoking history in Pack-Years:'}
                <span className="block text-[11px] text-slate-400 font-normal">
                  {isAr ? '(عدد العلب المدخنة يومياً مضروباً في عدد سنوات التدخين)' : '(Packs smoked per day multiplied by number of years smoked)'}
                </span>
              </label>
              <input
                type="number"
                min="0"
                max="150"
                value={inputs.packYears || ''}
                onChange={(e) => setInputs({ ...inputs, packYears: e.target.value ? Number(e.target.value) : undefined })}
                placeholder={isAr ? 'أدخل معدل سنة/علبة (مثال: 25)' : 'Enter pack-years (e.g. 25)'}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          )}

          {inputs.smokingStatus === 'former' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {isAr ? 'كم سنة مضت منذ إقلاعك عن التدخين؟' : 'How many years ago did you quit smoking?'}
              </label>
              <input
                type="number"
                min="0"
                max="80"
                value={inputs.yearsSinceQuitting !== undefined ? inputs.yearsSinceQuitting : ''}
                onChange={(e) => setInputs({ ...inputs, yearsSinceQuitting: e.target.value !== '' ? Number(e.target.value) : undefined })}
                placeholder={isAr ? 'أدخل عدد السنوات منذ الإقلاع (مثال: 8)' : 'Enter years since quit (e.g. 8)'}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold shadow-2xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                {isAr ? 'بوابة الفحوص الوقائية والمسحية' : 'Preventive Screening Gateway'}
              </h1>
              <p className="text-xs text-slate-500">
                {isAr ? 'تطبيق قواعد فرقة الخدمات الوقائية الأمريكية (USPSTF)' : 'Evidence-based USPSTF Preventive Recommendations Engine'}
              </p>
            </div>
          </div>

        </div>

        {/* Regulatory & Safety Notice */}
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-3 text-xs text-sky-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            {isAr
              ? 'تنبيه تعليمي: هذه البوابة نموذج تعليمي استرشادي للأهلية المسحية الأولية، وليست أداة تشخيصية ولا تغني عن استشارة وتقييم الطبيب السريري.'
              : 'Educational Notice: This gateway is an educational demonstration of preliminary screening eligibility, not a diagnostic system or replacement for clinical judgment.'}
          </span>
        </div>
      </div>

      {/* View toggle: screening questionnaire vs the verified guides library */}
      <div className="flex rounded-2xl border border-sky-200 bg-white p-1 shadow-2xs gap-1">
        <button
          type="button"
          onClick={() => setGatewayView('wizard')}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer min-h-[48px] ${gatewayView === 'wizard' ? 'bg-sky-700 text-white shadow-2xs' : 'text-sky-900 hover:bg-sky-50'}`}
        >
          🩺 {isAr ? 'استبيان الفحوصات' : 'Screening Questionnaire'}
        </button>
        <button
          type="button"
          onClick={() => setGatewayView('guides')}
          className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer min-h-[48px] ${gatewayView === 'guides' ? 'bg-sky-700 text-white shadow-2xs' : 'text-sky-900 hover:bg-sky-50'}`}
        >
          📚 {isAr ? 'الأدلة الموثّقة' : 'Verified Guides'}
        </button>
      </div>

      {/* CONVERSATIONAL WIZARD MODE */}
      {gatewayView === 'wizard' && !hasEvaluated && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>{isAr ? `السؤال ${wizardStep + 1} من ${wizardQuestions.length}` : `Question ${wizardStep + 1} of ${wizardQuestions.length}`}</span>
              <span>{Math.round(((wizardStep + 1) / wizardQuestions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-700 h-full transition-all duration-300"
                style={{ width: `${((wizardStep + 1) / wizardQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="p-5 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-4">
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {isAr ? wizardQuestions[wizardStep].titleAr : wizardQuestions[wizardStep].titleEn}
              </h2>
              <p className="text-xs text-sky-800 leading-relaxed">
                <span className="font-semibold">{isAr ? 'لماذا نطلب ذلك؟ ' : 'Why this is requested: '}</span>
                {isAr ? wizardQuestions[wizardStep].whyAr : wizardQuestions[wizardStep].whyEn}
              </p>
            </div>

            <div className="pt-2">
              {wizardQuestions[wizardStep].render()}
            </div>
          </div>

          {/* Wizard Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              disabled={wizardStep === 0}
              onClick={() => setWizardStep((prev) => Math.max(0, prev - 1))}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer min-h-[44px] ${
                wizardStep === 0
                  ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{isAr ? 'السابق' : 'Previous'}</span>
            </button>

            {wizardStep < wizardQuestions.length - 1 ? (
              <button
                type="button"
                onClick={() => setWizardStep((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs min-h-[44px]"
              >
                <span>{isAr ? 'التالي' : 'Next'}</span>
                {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setHasEvaluated(true)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-sky-800 hover:bg-sky-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs min-h-[44px]"
              >
                <span>{isAr ? 'إظهار النتائج الشاملة' : 'View Full Screening Results'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* RESULTS DISPLAY: 3 SEPARATE REQUIRED BLOCKS PER RULE */}
      {gatewayView === 'wizard' && hasEvaluated && (
        <div className="space-y-6 pt-4">
          <div className="border-b border-slate-200 pb-2 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {isAr ? 'نتائج التقييم المسحي (USPSTF):' : 'Screening Evaluation Results (USPSTF):'}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">
                {results.length} {isAr ? 'فحوصات مسحية مقيمة' : 'Guidelines Evaluated'}
              </span>
              <button
                type="button"
                onClick={() => setHasEvaluated(false)}
                className="px-3 py-1.5 rounded-lg border border-sky-600 text-sky-800 text-xs font-semibold hover:bg-sky-50 transition-colors cursor-pointer min-h-[36px]"
              >
                {isAr ? 'تعديل الإجابات' : 'Edit Answers'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {results.map((res) => {
              const title = isAr ? res.ruleTitleAr : res.ruleTitleEn;
              const summary = isAr ? res.summaryAr : res.summaryEn;
              const whyThisResult = isAr ? res.whyThisResultAr : res.whyThisResultEn;
              const whatNotEstablished = isAr ? res.whatThisDoesNotEstablishAr : res.whatThisDoesNotEstablishEn;

              return (
                <div
                  key={res.ruleId}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4"
                >
                  {/* Result Header & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-900 text-base">
                      {title}
                    </h3>
                    <div>
                      {res.isEligible === true && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isAr ? 'فحص مستحق / موصى به' : 'Screening Recommended'}</span>
                        </span>
                      )}
                      {res.isEligible === false && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'غير مستحق روتينياً حالياً' : 'Not Routinely Due'}</span>
                        </span>
                      )}
                      {res.isEligible === 'individualized' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>{isAr ? 'قرار سريري فردي مشترك' : 'Individualized Decision'}</span>
                        </span>
                      )}
                      {res.isEligible === 'insufficient_info' && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{isAr ? 'معلومات غير كافية' : 'Insufficient Information'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Callout */}
                  <div className="p-3.5 bg-slate-50 rounded-xl text-xs sm:text-sm text-slate-800 font-medium">
                    {summary}
                  </div>

                  {/* 3 MANDATORY SEPARATE EXPLANATION BLOCKS */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                    {/* Block 1: Why this result */}
                    <div className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/40 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-sky-800 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-sky-700 inline-block" />
                          <span>{isAr ? '1. سبب هذه النتيجة:' : '1. Why this result:'}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed mt-1">
                          {whyThisResult}
                        </p>
                      </div>
                    </div>

                    {/* Block 2: What this does NOT establish */}
                    <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/40 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-rose-900 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                          <span>{isAr ? '2. ما لا تثبته هذه النتيجة:' : '2. What this does NOT establish:'}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed mt-1">
                          {whatNotEstablished}
                        </p>
                      </div>
                    </div>

                    {/* Block 3: Source */}
                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5 flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                          <span>{isAr ? '3. المصدر والتوثيق:' : '3. Source:'}</span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1">
                          {res.sourceTitle} ({res.sourceYear})
                        </p>
                      </div>
                      <div className="pt-2">
                        <a
                          href={res.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-sky-600 font-semibold hover:underline"
                        >
                          <span>{isAr ? 'رابط التوصية الرسمي' : 'Official USPSTF Guideline'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Explain Agent evidence trace — collapsible audit trail */}
                  {(() => {
                    const record = explainRecords.find((r) => r.ruleId === res.ruleId);
                    if (!record) return null;
                    const open = !!showTrace[res.ruleId];
                    const statusLabel = isAr
                      ? record.verificationStatus === 'determined_by_rule'
                        ? 'محدّد بالقاعدة'
                        : record.verificationStatus === 'clinician_review_required'
                          ? 'يتطلب مراجعة سريرية'
                          : 'لا يمكن التحديد — معلومات ناقصة'
                      : record.verificationStatus === 'determined_by_rule'
                        ? 'Determined by rule'
                        : record.verificationStatus === 'clinician_review_required'
                          ? 'Requires clinician review'
                          : 'Cannot determine — missing inputs';
                    return (
                      <div className="border border-violet-200 bg-violet-50/50 rounded-xl overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setShowTrace((prev) => ({ ...prev, [res.ruleId]: !prev[res.ruleId] }))}
                          className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-bold text-violet-900 hover:bg-violet-100/60 transition-colors cursor-pointer"
                        >
                          <span>
                            {isAr ? 'ورّيني الدليل — لماذا وصل النظام إلى هذه النتيجة؟' : 'Show me the evidence — why did the system reach this result?'}
                          </span>
                          <span className="text-[10px] font-semibold bg-white border border-violet-200 rounded-full px-2 py-0.5 shrink-0">
                            {open ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'عرض السجل' : 'Show trace')}
                          </span>
                        </button>
                        {open && (
                          <div className="px-3.5 pb-3.5 pt-1 space-y-3 text-xs text-slate-700 leading-relaxed">
                            <p className="text-[11px] text-slate-500">
                              {isAr
                                ? 'هذا السجل أنتجه وكيل التفسير الحتمي من مدخلاتك وقاعدة USPSTF — دون أي نص مولّد من نموذج لغوي.'
                                : 'This trace was produced by the deterministic Explain Agent from your inputs and the USPSTF rule — with no language-model text.'}
                            </p>
                            <div>
                              <div className="font-bold text-slate-900 mb-1">{isAr ? 'الحقائق المستخدمة:' : 'Facts used:'}</div>
                              <ul className="space-y-1">
                                {record.factsUsed.map((f, i) => (
                                  <li key={i} className="flex gap-2">
                                    <span className="text-violet-700 font-bold">•</span>
                                    <span>{isAr ? f.labelAr : f.labelEn}: <b>{isAr ? f.valueAr : f.valueEn}</b></span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="space-y-1">
                              <div><b>{isAr ? 'القاعدة:' : 'Rule:'}</b> {record.ruleId} — {isAr ? record.ruleTitleAr : record.ruleTitleEn}</div>
                              <div>
                                <b>{isAr ? 'المصدر الموثّق:' : 'Verified source:'}</b>{' '}
                                <a href={record.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 font-semibold hover:underline">
                                  {record.sourceTitle} ({record.sourceYear})
                                </a>
                              </div>
                              <div><b>{isAr ? 'حالة التحقق:' : 'Verification status:'}</b> {statusLabel}</div>
                              {record.noRecommendationIssued && (
                                <div className="text-rose-700 font-semibold">
                                  {isAr
                                    ? 'لم تُصدر أي توصية لهذه القاعدة — المعلومات الناقصة تمنع التحديد، ولم يُخترع أي بديل.'
                                    : 'No recommendation was issued for this rule — missing inputs prevent determination, and no substitute was invented.'}
                                </div>
                              )}
                              {record.missingInputs.length > 0 && (
                                <div><b>{isAr ? 'معلومات ناقصة:' : 'Missing inputs:'}</b> {record.missingInputs.join(', ')}</div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 mb-1">{isAr ? 'السبب كما طبّقته القاعدة:' : 'Reasoning as applied by the rule:'}</div>
                              <p>{isAr ? record.reasoningAr : record.reasoningEn}</p>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 mb-1">{isAr ? 'حدود الاستنتاج:' : 'Limits of this conclusion:'}</div>
                              <p>{isAr ? record.limitsAr : record.limitsEn}</p>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 mb-1">
                                {isAr ? 'ما الذي قد يغيّر هذه النتيجة؟ — مُتحقق بإعادة تشغيل المحرك على مدخلات معدّلة، لا تخمين:' : 'What could change this result? — verified by re-running the engine on modified inputs, not guessed:'}
                              </div>
                              {record.outcomeChanges.length > 0 ? (
                                <ul className="space-y-1">
                                  {record.outcomeChanges.map((c, i) => {
                                    const decisionLabel = isAr
                                      ? c.newDecision === 'eligible'
                                        ? 'مستحق للفحص'
                                        : c.newDecision === 'not_eligible'
                                          ? 'غير مستحق روتينياً'
                                          : c.newDecision === 'individualized'
                                            ? 'قرار فردي مع الطبيب'
                                            : 'معلومات غير كافية'
                                      : c.newDecision === 'eligible'
                                        ? 'Eligible'
                                        : c.newDecision === 'not_eligible'
                                          ? 'Not routinely eligible'
                                          : c.newDecision === 'individualized'
                                            ? 'Individualized decision'
                                            : 'Insufficient information';
                                    return (
                                      <li key={i} className="flex gap-2">
                                        <span className="text-violet-700 font-bold">•</span>
                                        <span>
                                          {isAr
                                            ? <>تغيير <b>{c.fieldLabelAr}</b> من «{c.fromAr}» إلى «{c.toAr}» ← تصبح النتيجة: <b>{decisionLabel}</b></>
                                            : <>Changing <b>{c.fieldLabelEn}</b> from “{c.fromEn}” to “{c.toEn}” → the result becomes: <b>{decisionLabel}</b></>}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : (
                                <p>{isAr ? 'لا يمكن تحديد تغيير واحد يقلب هذه النتيجة من المدخلات الحالية.' : 'No single change to the current inputs can be identified that would flip this result.'}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Multi-source evidence comparison (curated pre-loaded pack — not a live search) */}
                  {(() => {
                    const cmp = compareTopic(res.ruleId);
                    const extra = EVIDENCE_CLAIMS.filter((c) => c.topic === res.ruleId && c.aspect === 'how');
                    const relLabel: Record<string, { ar: string; en: string }> = {
                      compatible: { ar: 'متوافقة في النطاق الأساسي', en: 'Compatible on the core scope' },
                      scope_difference: { ar: 'اختلاف في النطاق — ليس تعارضاً', en: 'Difference in scope — not a conflict' },
                      complementary: { ar: 'مكمّلة لبعضها', en: 'Complementary' },
                      potential_conflict: { ar: 'تعارض محتمل — الأدلة غير متوافقة هنا', en: 'Potential conflict — the evidence does not agree here' },
                      insufficient_evidence: { ar: 'أدلة غير كافية للمقارنة', en: 'Insufficient evidence to compare' },
                    };
                    const diffLabel: Record<string, { ar: string; en: string }> = {
                      age_min: { ar: 'عمر البدء', en: 'starting age' },
                      age_max: { ar: 'السقف العمري', en: 'upper age limit' },
                      weight_condition: { ar: 'شرط الوزن', en: 'weight condition' },
                      individualized_band: { ar: 'نطاق القرار الفردي', en: 'individualized-decision band' },
                    };
                    const posLabel: Record<string, { ar: string; en: string }> = {
                      inside_scope: { ar: 'داخل نطاق هذا المصدر', en: 'Inside this source\u2019s scope' },
                      outside_scope: { ar: 'خارج نطاق هذا المصدر', en: 'Outside this source\u2019s scope' },
                      individualized_zone: { ar: 'في منطقة القرار الفردي عند هذا المصدر', en: 'In this source\u2019s individualized-decision zone' },
                      unknown: { ar: 'لا يمكن التحديد من المدخلات المتوفرة', en: 'Cannot be determined from the available inputs' },
                    };
                    const scopeLine = (c: (typeof cmp.claims)[number]) =>
                      c.aspect !== 'who'
                        ? isAr
                          ? 'يتحدث عن أنواع الفحوص وفواصلها'
                          : 'Covers test types and intervals'
                        : `${isAr ? 'النطاق' : 'Scope'}: ${c.ageMin ?? '—'}–${c.ageMax === null ? (isAr ? 'بلا سقف مذكور' : 'no upper limit stated') : c.ageMax}${c.weightRequired ? (isAr ? ' — بشرط زيادة الوزن/السمنة' : ' — requires overweight or obesity') : ''}`;
                    const card = (c: (typeof cmp.claims)[number], showPos: boolean) => (
                      <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-2.5 space-y-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span className="text-[11px] font-bold text-slate-800">{c.org}</span>
                          <span className="text-[10px] text-slate-500">{c.sourceTitle}{c.sourceYear ? ` (${c.sourceYear})` : ''}</span>
                          <a href={c.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-sky-700 hover:underline">
                            {isAr ? 'المصدر' : 'Source'} <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-relaxed">{isAr ? c.claimAr : c.claimEn}</p>
                        <p className="text-[10px] text-slate-500">{scopeLine(c)}</p>
                        <p className="text-[10px] text-slate-600">
                          <span className="font-semibold">{isAr ? 'ما يدعمه: ' : 'Supports: '}</span>
                          {isAr ? c.supportsAr : c.supportsEn}
                        </p>
                        <p className="text-[10px] text-slate-600">
                          <span className="font-semibold">{isAr ? 'حدوده: ' : 'Limits: '}</span>
                          {isAr ? c.limitsAr : c.limitsEn}
                        </p>
                        {showPos && (
                          <p className="text-[10px] font-semibold text-sky-800">
                            {isAr ? 'موقعك من هذا المصدر: ' : 'Your position vs this source: '}
                            {isAr ? posLabel[userPosition(c, inputs)].ar : posLabel[userPosition(c, inputs)].en}
                          </p>
                        )}
                      </div>
                    );
                    return (
                      <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50/60 p-3 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-sky-950">{cmp.relation === 'insufficient_evidence' ? (isAr ? '🔍 مقارنة الأدلة' : '🔍 Evidence comparison') : (isAr ? '🔍 مقارنة الأدلة — مصدران مستقلان' : '🔍 Evidence comparison — two independent sources')}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cmp.relation === 'potential_conflict' ? 'bg-rose-100 text-rose-800' : cmp.relation === 'insufficient_evidence' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'}`}>
                            {isAr ? relLabel[cmp.relation].ar : relLabel[cmp.relation].en}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {isAr
                            ? 'مقارنة ضمن حزمة أدلة منسّقة محمّلة مسبقاً داخل التطبيق — ليست بحثاً حياً على الإنترنت. العلاقة بين المصدرين محسوبة من نطاقاتهما الموثّقة، لا مكتوبة يدوياً.'
                            : 'A comparison over a curated evidence pack pre-loaded in the app — not a live web search. The relation between the sources is computed from their documented scopes, not hand-written.'}
                        </p>
                        {cmp.relation === 'insufficient_evidence' ? (
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            {isAr
                              ? 'لهذا الفحص مصدر موثّق واحد محمّل حالياً (USPSTF) — لذلك لا توجد مقارنة متعددة المصادر له، ولا ندّعي غير ذلك.'
                              : 'Only one verified source is currently loaded for this check (USPSTF) — so no multi-source comparison exists for it, and we do not claim otherwise.'}
                          </p>
                        ) : (
                          <>
                            <div className="grid sm:grid-cols-2 gap-2">{cmp.claims.map((c) => card(c, true))}</div>
                            {cmp.overlap && (
                              <p className="text-[11px] text-slate-700">
                                <span className="font-semibold">{isAr ? 'منطقة الاتفاق: ' : 'Where they agree: '}</span>
                                {isAr
                                  ? `كلا المصدرين يوصي بالفحص لأعمار ${cmp.overlap.min}–${cmp.overlap.max === null ? 'وما فوق' : cmp.overlap.max} ضمن شروط كل منهما.`
                                  : `Both sources recommend screening for ages ${cmp.overlap.min}–${cmp.overlap.max === null ? 'and above' : cmp.overlap.max}, under each one's conditions.`}
                              </p>
                            )}
                            {cmp.differences.length > 0 && (
                              <p className="text-[11px] text-slate-700">
                                <span className="font-semibold">{isAr ? 'أين يختلف النطاق: ' : 'Where the scopes differ: '}</span>
                                {cmp.differences.map((d) => (isAr ? diffLabel[d].ar : diffLabel[d].en)).join(isAr ? '، ' : ', ')}
                                {isAr ? ' — اختلاف التغطية لا يعني أن أحدهما مخطئ.' : ' — a difference in coverage does not mean one of them is wrong.'}
                              </p>
                            )}
                            {extra.length > 0 && (
                              <div className="space-y-1.5">
                                <p className="text-[11px] font-semibold text-slate-700">{isAr ? 'أدلة مكمّلة (أنواع الفحوص وفواصلها):' : 'Complementary evidence (test types and intervals):'}</p>
                                {extra.map((c) => card(c, false))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()}

                  {/* Patient follow-up self-report: booked / completed (per screening result) */}
                  {(res.isEligible === true || res.isEligible === 'individualized') && (() => {
                    const fu = followUps[res.ruleId];
                    const drafts = followUpDates[res.ruleId] || { booked: '', completed: '' };
                    const setDraft = (kind: 'booked' | 'completed', val: string) =>
                      setFollowUpDates((prev) => ({
                        ...prev,
                        [res.ruleId]: { ...(prev[res.ruleId] || { booked: '', completed: '' }), [kind]: val },
                      }));
                    return (
                      <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-3">
                        <div className="text-xs font-bold text-indigo-900">
                          {isAr ? 'متابعة خطوتك التالية:' : 'Track your next step:'}
                        </div>

                        {/* Booked row */}
                        {fu?.bookedAt ? (
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                              <CalendarCheck className="w-3.5 h-3.5" />
                              <span>
                                {isAr ? 'سجّلت أنك حجزت الموعد' : 'You recorded that you booked the appointment'}
                                {fu.bookedDate ? ` — ${fu.bookedDate}` : ''}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => clearFollowUp(res.ruleId, 'booked')}
                              className="text-indigo-700 font-semibold hover:underline"
                            >
                              {isAr ? 'إلغاء التسجيل' : 'Undo'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => recordFollowUp(res.ruleId, 'booked')}
                              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                              <CalendarCheck className="w-3.5 h-3.5" />
                              <span>{isAr ? 'حجزت الموعد' : 'I booked the appointment'}</span>
                            </button>
                            <input
                              type="date"
                              value={drafts.booked}
                              onChange={(e) => setDraft('booked', e.target.value)}
                              className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                              aria-label={isAr ? 'تاريخ الموعد (اختياري)' : 'Appointment date (optional)'}
                            />
                            <span className="text-[11px] text-slate-500">{isAr ? 'التاريخ اختياري' : 'Date optional'}</span>
                          </div>
                        )}

                        {/* Completed row */}
                        {fu?.completedAt ? (
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>
                                {isAr ? 'سجّلت أنك أجريت الفحص' : 'You recorded that you completed the screening'}
                                {fu.completedDate ? ` — ${fu.completedDate}` : ''}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => clearFollowUp(res.ruleId, 'completed')}
                              className="text-indigo-700 font-semibold hover:underline"
                            >
                              {isAr ? 'إلغاء التسجيل' : 'Undo'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => recordFollowUp(res.ruleId, 'completed')}
                              className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-white border border-indigo-600 text-indigo-700 hover:bg-indigo-50"
                            >
                              <ClipboardCheck className="w-3.5 h-3.5" />
                              <span>{isAr ? 'أجريت الفحص' : 'I completed the screening'}</span>
                            </button>
                            <input
                              type="date"
                              value={drafts.completed}
                              onChange={(e) => setDraft('completed', e.target.value)}
                              className="text-xs border border-slate-300 rounded-lg px-2 py-1.5 bg-white"
                              aria-label={isAr ? 'تاريخ إجراء الفحص (اختياري)' : 'Screening date (optional)'}
                            />
                            <span className="text-[11px] text-slate-500">{isAr ? 'التاريخ اختياري' : 'Date optional'}</span>
                          </div>
                        )}

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {isAr
                            ? 'هذا التسجيل إبلاغ ذاتي منك لمتابعتك الشخصية فقط، ولا يُعد تأكيداً من جهة الرعاية بأن الموعد حُجز أو أن الفحص أُجري.'
                            : 'This is your own self-report for personal follow-up only. It is not a provider confirmation that the appointment was booked or the screening was performed.'}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verified Guides — permanently visible section (the library lives here, beside the screening rules it supports) */}
      <div id="verified-guides" className={`space-y-5 ${gatewayView === 'guides' ? '' : 'hidden'}`}>
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            {isAr ? 'الأدلة الموثّقة' : 'Verified Guides'}
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mt-1">
            {isAr
              ? 'أدلة مبسطة من مصادر طبية رسمية موثّقة — نفس المصادر التي تُبنى عليها قواعد هذه البوابة وإجابات رعاية.'
              : 'Plain-language guides from verified official medical sources — the same sources behind this gateway’s rules and Riaya’s answers.'}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wide">
            {isAr ? 'أدلة الفحوص الوقائية' : 'Preventive Screening Guides'}
          </h3>
          <EducationTab
            language={language}
            onAskRiaya={onAskRiaya}
            onlyIds={['card-6', 'card-7', 'card-8', 'card-9']}
            bare
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-sky-800 uppercase tracking-wide">
            {isAr ? 'أدلة رحلة العلاج' : 'Hospital Journey Guides'}
          </h3>
          <EducationTab
            language={language}
            onAskRiaya={onAskRiaya}
            onlyIds={['card-1', 'card-2', 'card-3', 'card-4', 'card-5', 'card-10']}
            bare
          />
        </div>
      </div>
    </div>
  );
};
