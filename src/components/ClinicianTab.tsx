import React, { useState } from 'react';
import {
  Language,
  ClinicianCase,
  TimelineEvent,
  CaseStatus,
  ReferralStatus
} from '../types';
import {
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserX,
  FileDown,
  PlusCircle,
  Search,
  Filter,
  UserCheck,
  Send,
  Eye,
  Check,
  X,
  Info
} from 'lucide-react';

interface ClinicianTabProps {
  language: Language;
  cases: ClinicianCase[];
  onUpdateCase: (updatedCase: ClinicianCase) => void;
  onAddCase: (newCase: ClinicianCase) => void;
}

// Arabic labels for timeline actors and referral statuses, so the Arabic UI
// does not fall back to English fragments.
const ACTOR_AR: Record<string, string> = {
  'Clinical Laboratory': 'المختبر السريري',
  'Clinical Lab': 'المختبر السريري',
  'Lab Interface': 'واجهة المختبر',
  'Pathology Lab': 'مختبر علم الأمراض',
  'Care Coordinator': 'منسق الرعاية',
  'Coordinator': 'المنسق',
  'Ward Coordinator': 'منسق الجناح',
  'Imaging Coordinator': 'منسق التصوير',
  'Endocrinology Clinic': 'عيادة الغدد الصم',
  'Scheduling Desk': 'مكتب الجدولة',
  'Radiology Dept': 'قسم الأشعة',
  'Radiology': 'الأشعة',
  'System Monitor': 'مراقب النظام',
  'System': 'النظام',
  'EHR Intake Service': 'خدمة استقبال السجلات الصحية',
  'Clinic Nurse': 'ممرضة العيادة',
  'Clinic Secretary': 'سكرتارية العيادة',
  'Nurse Navigator': 'ممرضة الإرشاد',
  'Nurse Sarah': 'الممرضة سارة',
  'Triage Nurse': 'ممرضة الفرز',
  'Health Kiosk': 'كشك الصحة',
  'Ward 4 Team': 'فريق الجناح 4',
  'Phlebotomy': 'سحب الدم',
  'Safety Monitoring Filter': 'مرشح مراقبة السلامة',
  'Check-in Triage System': 'نظام فرز التقييم',
  'Attending Clinician (Simulated)': 'الطبيب المعالج (محاكاة)',
  'System Escalation Engine (Simulated)': 'محرك تصعيد النظام (محاكاة)',
  'Receiving Clinician (Simulated)': 'الطبيب المستلم (محاكاة)',
  'Emergency Triage Lead': 'مسؤول فرز الطوارئ',
  'Triage Lead': 'مسؤول الفرز',
  'Occupational Health Program': 'برنامج الصحة المهنية',
  'Diabetes Screening Program': 'برنامج فحص السكري',
  'Health Kiosk Screening Program': 'برنامج فحص كشك الصحة',
  'Ward 4 Discharge Team': 'فريق خروج الجناح 4',
  'Dr. Tariq': 'د. طارق',
  'Dr. Mona': 'د. منى',
  'Dr. Faisal': 'د. فيصل',
  'Dr. Layla': 'د. ليلى',
  'Dr. Samar': 'د. سمر',
  'Dr. Hisham': 'د. هشام',
  'Dr. Kareem': 'د. كريم',
};

// Builds the displayed timeline in event order: the test order comes first,
// and a completed clinician review is placed right after the result event.
// Nothing is invented here — entries appear only when the case record
// actually documents them.
function buildDisplayTimeline(c: ClinicianCase): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  if (c.testOrder) {
    events.push({
      id: 'order',
      timestamp: c.testOrder.orderedAt,
      title: 'Test Ordered',
      detail: `${c.testOrder.orderedBy} — ${c.testOrder.reason}`,
      actor: c.testOrder.orderedBy.replace(' (Simulated)', ''),
      titleAr: 'طُلب الفحص',
      detailAr: `${c.testOrder.orderedByAr || c.testOrder.orderedBy} — ${c.testOrder.reasonAr || c.testOrder.reason}`,
    });
  }
  const [first, ...rest] = c.timeline;
  if (first) events.push(first);
  if (c.resultReview?.status === 'completed') {
    events.push({
      id: 'review',
      timestamp: c.resultReview.reviewedAt || '',
      title: 'Result Reviewed by Clinician',
      detail: c.resultReview.decision || '',
      actor: (c.resultReview.reviewedBy || '').replace(' (Simulated)', ''),
      titleAr: 'راجع الطبيب النتيجة',
      detailAr: c.resultReview.decisionAr || c.resultReview.decision || '',
    });
  }
  events.push(...rest);
  return events;
}

const REFERRAL_STATUS_AR: Record<string, string> = {
  'none': 'لا يوجد',
  'pending': 'معلقة',
  'accepted': 'مقبولة',
  'completed': 'مكتملة',
  'not needed': 'غير لازمة',
  'unknown': 'غير معروفة',
};

export const ClinicianTab: React.FC<ClinicianTabProps> = ({
  language,
  cases,
  onUpdateCase,
  onAddCase,
}) => {
  const isAr = language === 'ar';

  const [selectedCase, setSelectedCase] = useState<ClinicianCase | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [closureError, setClosureError] = useState<string | null>(null);

  // Add Case Form State
  const [newCaseData, setNewCaseData] = useState({
    id: `RY-${String(cases.length + 1).padStart(3, '0')}`,
    nameAr: '',
    nameEn: '',
    age: '',
    type: 'HbA1c screening',
    resultSummary: '',
    plainLanguageExplanation: '',
    whatItDoesNotEstablish: '',
    sourceNote: '',
    resultDate: new Date().toISOString().split('T')[0],
    owner: '',
    notificationSla: '24 hours',
    referralTarget: '',
    referralStatus: 'none' as ReferralStatus,
    appointmentInfo: 'Not scheduled',
    status: 'on_track' as CaseStatus,
  });

  // Calculate metrics reliably from actual case data
  const totalCases = cases.length;
  const overdueCasesCount = cases.filter((c) => c.status === 'overdue').length;

  // Notification SLA compliance: cases with documented notification / closed / on track vs overdue
  const casesWithSla = cases.filter((c) => c.notificationSla && c.notificationSla !== 'Not provided');
  const notifiedCases = casesWithSla.filter((c) => c.status === 'closed' || c.status === 'on_track');
  const notificationRate = casesWithSla.length > 0
    ? `${Math.round((notifiedCases.length / casesWithSla.length) * 100)}%`
    : 'N/A';

  // Referral completion rate: cases where referralTarget is active
  const casesNeedingReferral = cases.filter(
    (c) => c.referralStatus !== 'not needed' && c.referralStatus !== 'none'
  );
  const completedReferrals = casesNeedingReferral.filter((c) => c.referralStatus === 'completed');
  const referralRate = casesNeedingReferral.length > 0
    ? `${Math.round((completedReferrals.length / casesNeedingReferral.length) * 100)}%`
    : 'N/A';

  // Filtering
  const filteredCases = cases.filter((c) => {
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    const q = searchQuery.toLowerCase();
    const name = `${c.nameAr} ${c.nameEn} ${c.id} ${c.type} ${c.resultSummary}`.toLowerCase();
    const matchesSearch = name.includes(q);
    return matchesFilter && matchesSearch;
  });

  // Export JSON function
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cases, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `riaya_clinician_cases_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Attempt Case Closure
  const handleAttemptClosure = (targetCase: ClinicianCase) => {
    setClosureError(null);
    // Strict requirement from Section 9:
    // "Refuse closure when required evidence or a documented human decision is missing."
    // "Do not close a case merely because a result is normal or a notification was attempted."
    if (!targetCase.closureEvidence && targetCase.status !== 'closed') {
      const err = isAr
        ? 'تم رفض إغلاق الحالة: يتطلب الإغلاق توثيق دليل إتمام أو قرار بشري معتمد في سجل الحالة (Closure Evidence).'
        : 'Case closure blocked: Documented completion evidence or human clinician decision is required to close this case.';
      setClosureError(err);
      return;
    }

    const updated: ClinicianCase = {
      ...targetCase,
      status: 'closed',
      timeline: [
        ...targetCase.timeline,
        {
          id: String(Date.now()),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          title: 'Case Closed (Simulated)',
          detail: 'Documented completion evidence verified; case successfully closed.',
          actor: 'Attending Clinician (Simulated)',
          titleAr: 'أُغلقت الحالة (محاكاة)',
          detailAr: 'تم التحقق من دليل الإتمام الموثق؛ أُغلقت الحالة بنجاح.'
        }
      ]
    };
    onUpdateCase(updated);
    setSelectedCase(updated);
  };

  // Add Escalation Note
  const handleEscalate = (targetCase: ClinicianCase) => {
    const updated: ClinicianCase = {
      ...targetCase,
      status: 'overdue',
      timeline: [
        ...targetCase.timeline,
        {
          id: String(Date.now()),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          title: 'Escalation Alert Issued (Simulated)',
          detail: 'Case escalated to Senior Clinical Care Coordinator for urgent review.',
          actor: 'System Escalation Engine (Simulated)',
          titleAr: 'صدر تنبيه تصعيد (محاكاة)',
          detailAr: 'صُعدت الحالة إلى منسق الرعاية السريرية الأول لمراجعة عاجلة.'
        }
      ]
    };
    onUpdateCase(updated);
    setSelectedCase(updated);
  };

  // Handle Handoff Response
  const handleHandoffResponse = (targetCase: ClinicianCase, newStatus: 'accepted' | 'declined') => {
    const updated: ClinicianCase = {
      ...targetCase,
      handoff: {
        requestedTo: targetCase.handoff?.requestedTo || 'Specialist Lead (Simulated)',
        status: newStatus,
        notes: `Handoff request ${newStatus} at ${new Date().toLocaleTimeString()} (simulated)`
      },
      timeline: [
        ...targetCase.timeline,
        {
          id: String(Date.now()),
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          title: `Handoff ${newStatus === 'accepted' ? 'Accepted' : 'Declined'} (Simulated)`,
          detail: `Simulated clinician-to-clinician handoff was ${newStatus}.`,
          actor: 'Receiving Clinician (Simulated)',
          titleAr: newStatus === 'accepted' ? 'قُبل التسليم (محاكاة)' : 'رُفض التسليم (محاكاة)',
          detailAr: newStatus === 'accepted' ? 'قُبل تسليم الحالة المحاكى بين الأطباء.' : 'رُفض تسليم الحالة المحاكى بين الأطباء.'
        }
      ]
    };
    onUpdateCase(updated);
    setSelectedCase(updated);
  };

  // Handle Add Case Form Submit
  const handleCreateCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseData.nameAr.trim() || !newCaseData.nameEn.trim()) return;

    const created: ClinicianCase = {
      id: newCaseData.id,
      nameAr: newCaseData.nameAr.trim(),
      nameEn: newCaseData.nameEn.trim(),
      age: Number(newCaseData.age) || 50,
      type: newCaseData.type,
      resultSummary: newCaseData.resultSummary || 'Screening assessment pending',
      plainLanguageExplanation: newCaseData.plainLanguageExplanation || 'Synthetic case entered via clinician board.',
      whatItDoesNotEstablish: newCaseData.whatItDoesNotEstablish || 'Preliminary synthetic record.',
      sourceNote: newCaseData.sourceNote || 'Clinician board manual intake',
      resultDate: newCaseData.resultDate || 'Not provided',
      owner: newCaseData.owner.trim() || 'Unassigned',
      notificationSla: newCaseData.notificationSla,
      referralTarget: newCaseData.referralTarget || 'None',
      referralStatus: newCaseData.referralStatus,
      appointmentInfo: newCaseData.appointmentInfo,
      status: !newCaseData.owner.trim() ? 'unassigned' : newCaseData.status,
      scenarioDescription: 'Manually seeded test case (Simulated).',
      timeline: [
        {
          id: '1',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          title: 'Case Created (Simulated)',
          detail: 'New case added via Clinician Board entry form.',
          actor: 'Intake Desk (Simulated)'
        }
      ]
    };

    onAddCase(created);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Prominent Mandatory Notice */}
      <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 text-amber-950 flex items-start gap-3 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <div className="font-bold text-amber-900 mb-0.5">
            {isAr ? 'إشعار البيانات الاصطناعية والمحاكاة السريرية' : 'Synthetic Demonstration Notice'}
          </div>
          <p>
            {isAr
              ? 'جميع المرضى والنتائج والأحداث والإشعارات هي بيانات تجريبية اصطناعية. لا توجد خدمة سريرية أو إشعارات حقيقية متصلة.'
              : 'All patients, results, events, and notifications are synthetic demonstration data. No real clinical service or notification is connected.'}
          </p>
        </div>
      </div>

      {/* Dashboard KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Cases */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isAr ? 'إجمالي الحالات' : 'Total Cases'}
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums">
            {totalCases}
          </div>
          <span className="text-[11px] text-slate-400">
            {isAr ? '(15 بذرة + التنبيهات)' : '(15 seed + alerts)'}
          </span>
        </div>

        {/* SLA Compliance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isAr ? 'الالتزام بمهلة الإبلاغ (SLA)' : 'Notified Within SLA'}
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-sky-800 tabular-nums">
            {notificationRate}
          </div>
          <span className="text-[11px] text-slate-400">
            {isAr ? 'محسوب بدقة أو N/A' : 'Calculated or N/A'}
          </span>
        </div>

        {/* Referrals Completed */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isAr ? 'اكتمال الإحالات' : 'Referrals Completed'}
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 tabular-nums">
            {referralRate}
          </div>
          <span className="text-[11px] text-slate-400">
            {completedReferrals.length} / {casesNeedingReferral.length} {isAr ? 'حالة نشطة' : 'active referrals'}
          </span>
        </div>

        {/* Overdue Cases */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {isAr ? 'الحالات المتأخرة (Overdue)' : 'Overdue Cases'}
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-700 tabular-nums">
            {overdueCasesCount}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">
            {overdueCasesCount > 0 ? (isAr ? 'تتطلب تصعيداً فورياً' : 'Requires escalation') : (isAr ? 'لا يوجد تأخير' : 'None')}
          </span>
        </div>
      </div>

      {/* Action Toolbar & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px]">
            <Search className={`w-4 h-4 text-slate-400 absolute top-3 ${isAr ? 'right-3' : 'left-3'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث بالاسم أو الرقم أو الفحص...' : 'Search cases by ID, name, test...'}
              className={`w-full py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${
                isAr ? 'pr-9 pl-3' : 'pl-9 pr-3'
              }`}
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', ar: 'الكل', en: 'All' },
              { id: 'overdue', ar: 'متأخر', en: 'Overdue' },
              { id: 'on_track', ar: 'منتظم', en: 'On Track' },
              { id: 'unassigned', ar: 'غير مسند', en: 'Unassigned' },
              { id: 'closed', ar: 'مغلق', en: 'Closed' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  filterStatus === st.id
                    ? 'bg-white text-sky-800 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isAr ? st.ar : st.en}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons: Add Case & Export JSON */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-2xs min-h-[40px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAr ? 'إضافة حالة' : 'Add Case'}</span>
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer min-h-[40px]"
            title={isAr ? 'تصدير كافة الحالات بصيغة JSON' : 'Export all cases as JSON'}
          >
            <FileDown className="w-4 h-4 text-slate-600" />
            <span>{isAr ? 'تصدير JSON' : 'Export JSON'}</span>
          </button>
        </div>
      </div>

      {/* Case Table / List View */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-start uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="p-3 text-start">{isAr ? 'رقم الحالة' : 'Case ID'}</th>
                <th className="p-3 text-start">{isAr ? 'اسم المريض' : 'Patient Name'}</th>
                <th className="p-3 text-start">{isAr ? 'العمر' : 'Age'}</th>
                <th className="p-3 text-start">{isAr ? 'نوع الفحص' : 'Case Type'}</th>
                <th className="p-3 text-start">{isAr ? 'النتيجة السريرية' : 'Result Summary'}</th>
                <th className="p-3 text-start">{isAr ? 'المسؤول' : 'Owner'}</th>
                <th className="p-3 text-start">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-3 text-start">{isAr ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => {
                return (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      c.isSimulatedAlert ? 'bg-amber-50/40' : ''
                    }`}
                  >
                    <td className="p-3 font-mono font-bold text-sky-800 whitespace-nowrap">
                      {c.id}
                      {c.isSimulatedAlert && (
                        <span className="block text-[10px] text-amber-700 font-sans">
                          {isAr ? '(محاكاة)' : '(simulated)'}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-slate-900 whitespace-nowrap">
                      {isAr ? c.nameAr : c.nameEn}
                    </td>
                    <td className="p-3 text-slate-600 font-mono tabular-nums">
                      {c.age}
                    </td>
                    <td className="p-3 text-slate-700 font-medium whitespace-nowrap">
                      {isAr ? c.typeAr || c.type : c.type}
                    </td>
                    <td className="p-3 text-slate-800 max-w-xs truncate" title={isAr ? c.resultSummaryAr || c.resultSummary : c.resultSummary}>
                      {isAr ? c.resultSummaryAr || c.resultSummary : c.resultSummary}
                    </td>
                    <td className="p-3 text-slate-600 whitespace-nowrap">
                      {c.owner === 'Unassigned' ? (
                        <span className="text-amber-700 font-semibold">{isAr ? 'غير مسند' : 'Unassigned'}</span>
                      ) : isAr ? (
                        (ACTOR_AR[c.owner.replace(' (Simulated)', '')] || c.owner.replace(' (Simulated)', '')) +
                        (c.owner.includes('(Simulated)') ? ' (محاكاة)' : '')
                      ) : (
                        c.owner
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {c.status === 'closed' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          <CheckCircle2 className="w-3 h-3 text-slate-600" />
                          <span>{isAr ? 'مغلق' : 'Closed'}</span>
                        </span>
                      )}
                      {c.status === 'on_track' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          <span>{isAr ? 'منتظم' : 'On Track'}</span>
                        </span>
                      )}
                      {c.status === 'overdue' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{isAr ? 'متأخر' : 'Overdue'}</span>
                        </span>
                      )}
                      {c.status === 'unassigned' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          <UserX className="w-3 h-3 text-amber-600" />
                          <span>{isAr ? 'غير مسند' : 'Unassigned'}</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setClosureError(null);
                          setSelectedCase(c);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200 text-sky-800 hover:bg-sky-50 text-xs font-semibold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isAr ? 'تفاصيل' : 'Details'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details Modal / Drawer */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-xl border border-slate-200 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-800 text-lg">
                    {selectedCase.id}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                    {isAr ? selectedCase.nameAr : selectedCase.nameEn} ({selectedCase.age} {isAr ? 'سنة' : 'yo'})
                  </span>
                  {selectedCase.isSimulatedAlert && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                      {isAr ? 'محاكاة' : 'Simulated Alert'}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-700 mt-1">
                  {isAr ? selectedCase.typeAr || selectedCase.type : selectedCase.type}: {isAr ? selectedCase.resultSummaryAr || selectedCase.resultSummary : selectedCase.resultSummary}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner for blocked closure */}
            {closureError && (
              <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl text-rose-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{closureError}</span>
              </div>
            )}

            {/* Scenario & Result Details */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900">{isAr ? 'سيناريو الحالة: ' : 'Scenario: '}</span>
                <p className="text-slate-700">{isAr ? selectedCase.scenarioDescriptionAr || selectedCase.scenarioDescription : selectedCase.scenarioDescription}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 border border-slate-100 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">
                    {isAr ? 'الشرح بلغة مبسطة للمريض: ' : 'Plain-Language Explanation: '}
                  </span>
                  <p className="text-slate-600">{isAr ? selectedCase.plainLanguageExplanationAr || selectedCase.plainLanguageExplanation : selectedCase.plainLanguageExplanation}</p>
                </div>
                <div className="p-3 border border-slate-100 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-1">
                    {isAr ? 'ما لا تثبته النتيجة: ' : 'What Result Does NOT Establish: '}
                  </span>
                  <p className="text-slate-600">{isAr ? selectedCase.whatItDoesNotEstablishAr || selectedCase.whatItDoesNotEstablish : selectedCase.whatItDoesNotEstablish}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-slate-400 block">{isAr ? 'تاريخ النتيجة' : 'Result Date'}</span>
                  <span className="font-mono font-medium text-slate-800">{isAr ? selectedCase.resultDateAr || selectedCase.resultDate : selectedCase.resultDate}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-slate-400 block">{isAr ? 'مهلة الإبلاغ (SLA)' : 'Notification SLA'}</span>
                  <span className="font-medium text-slate-800">{isAr ? selectedCase.notificationSlaAr || selectedCase.notificationSla : selectedCase.notificationSla}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-slate-400 block">{isAr ? 'وجهة الإحالة' : 'Referral Target'}</span>
                  <span className="font-medium text-slate-800">{isAr ? selectedCase.referralTargetAr || selectedCase.referralTarget : selectedCase.referralTarget}</span>
                </div>
                <div className="p-2 bg-slate-50 rounded">
                  <span className="text-slate-400 block">{isAr ? 'حالة الإحالة' : 'Referral Status'}</span>
                  <span className="font-medium text-slate-800 capitalize">{isAr ? REFERRAL_STATUS_AR[selectedCase.referralStatus] || selectedCase.referralStatus : selectedCase.referralStatus}</span>
                </div>
              </div>

              {/* Test Order & Result Review — accountability record.
                  Absent data is shown honestly as "Not recorded"; a review is
                  only shown as completed when the case record documents it. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3 rounded-xl border ${selectedCase.testOrder ? 'border-slate-200 bg-white' : 'border-dashed border-amber-300 bg-amber-50/60'}`}>
                  <span className="font-bold text-slate-900 block mb-1">
                    {isAr ? 'طلب الفحص:' : 'Test Order:'}
                  </span>
                  {selectedCase.testOrder ? (
                    <div className="space-y-0.5 text-slate-600">
                      <div>
                        <span className="text-slate-400">{isAr ? 'الطالب: ' : 'Ordered by: '}</span>
                        {isAr
                          ? (ACTOR_AR[selectedCase.testOrder.orderedBy.replace(' (Simulated)', '')] || selectedCase.testOrder.orderedByAr || selectedCase.testOrder.orderedBy) +
                            (selectedCase.testOrder.orderedBy.includes('(Simulated)') ? ' (محاكاة)' : '')
                          : selectedCase.testOrder.orderedBy}
                      </div>
                      <div>
                        <span className="text-slate-400">{isAr ? 'تاريخ الطلب: ' : 'Order date: '}</span>
                        <span className="font-mono">{selectedCase.testOrder.orderedAt}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">{isAr ? 'سبب الطلب: ' : 'Reason: '}</span>
                        {isAr ? selectedCase.testOrder.reasonAr || selectedCase.testOrder.reason : selectedCase.testOrder.reason}
                      </div>
                    </div>
                  ) : (
                    <p className="text-amber-800 font-semibold">
                      {isAr ? 'غير مسجل — لا توجد بيانات طلب فحص لهذه الحالة.' : 'Not recorded — no test-order data exists for this case.'}
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-xl border ${
                  selectedCase.resultReview?.status === 'completed'
                    ? 'border-slate-200 bg-white'
                    : selectedCase.resultReview?.status === 'pending'
                    ? 'border-dashed border-amber-300 bg-amber-50/60'
                    : 'border-dashed border-amber-300 bg-amber-50/60'
                }`}>
                  <span className="font-bold text-slate-900 block mb-1">
                    {isAr ? 'مراجعة النتيجة:' : 'Result Review:'}
                  </span>
                  {selectedCase.resultReview?.status === 'completed' ? (
                    <div className="space-y-0.5 text-slate-600">
                      <div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 mb-1">
                          {isAr ? 'مكتملة' : 'Completed'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">{isAr ? 'المُراجع: ' : 'Reviewed by: '}</span>
                        {isAr
                          ? (ACTOR_AR[(selectedCase.resultReview.reviewedBy || '').replace(' (Simulated)', '')] || selectedCase.resultReview.reviewedByAr || selectedCase.resultReview.reviewedBy) +
                            ((selectedCase.resultReview.reviewedBy || '').includes('(Simulated)') ? ' (محاكاة)' : '')
                          : selectedCase.resultReview.reviewedBy}
                      </div>
                      <div>
                        <span className="text-slate-400">{isAr ? 'وقت المراجعة: ' : 'Reviewed at: '}</span>
                        <span className="font-mono">{selectedCase.resultReview.reviewedAt}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">{isAr ? 'القرار / الخطة: ' : 'Decision / plan: '}</span>
                        {isAr ? selectedCase.resultReview.decisionAr || selectedCase.resultReview.decision : selectedCase.resultReview.decision}
                      </div>
                    </div>
                  ) : selectedCase.resultReview?.status === 'pending' ? (
                    <p className="text-amber-800">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 mb-1">
                        {isAr ? 'بانتظار المراجعة' : 'Pending review'}
                      </span>
                      <br />
                      {isAr
                        ? 'لم تُسجل أي مراجعة مكتملة بعد — التطبيق لا يفترض أن الطبيب رأى النتيجة.'
                        : 'No completed review recorded yet — the app does not assume the clinician has seen this result.'}
                    </p>
                  ) : (
                    <p className="text-amber-800 font-semibold">
                      {isAr ? 'غير مسجل — لا توجد بيانات مراجعة لهذه الحالة.' : 'Not recorded — no review data exists for this case.'}
                    </p>
                  )}
                </div>
              </div>

              {/* SBAR Clinical Summary */}
              {selectedCase.sbar && (
                <div className="p-3 border border-sky-100 bg-sky-50/50 rounded-xl space-y-1">
                  <span className="font-bold text-sky-800 block text-xs">
                    {isAr ? 'ملخص SBAR السريري (محاكاة):' : 'SBAR Clinical Summary (Simulated):'}
                  </span>
                  <div className="text-[11px] text-slate-700 space-y-0.5">
                    <div><strong>{isAr ? 'S (الموقف):' : 'S (Situation):'}</strong> {isAr ? selectedCase.sbarAr?.situation || selectedCase.sbar.situation : selectedCase.sbar.situation}</div>
                    <div><strong>{isAr ? 'B (الخلفية):' : 'B (Background):'}</strong> {isAr ? selectedCase.sbarAr?.background || selectedCase.sbar.background : selectedCase.sbar.background}</div>
                    <div><strong>{isAr ? 'A (التقييم):' : 'A (Assessment):'}</strong> {isAr ? selectedCase.sbarAr?.assessment || selectedCase.sbar.assessment : selectedCase.sbar.assessment}</div>
                    <div><strong>{isAr ? 'R (التوصية):' : 'R (Recommendation):'}</strong> {isAr ? selectedCase.sbarAr?.recommendation || selectedCase.sbar.recommendation : selectedCase.sbar.recommendation}</div>
                  </div>
                </div>
              )}

              {/* Teach-Back Field */}
              {selectedCase.teachBack && (
                <div className="p-3 border border-slate-200 bg-slate-50 rounded-xl space-y-1">
                  <span className="font-bold text-slate-900 block text-xs">
                    {isAr ? 'التحقق من الفهم بتقنية Teach-Back:' : 'Teach-Back Verification Recorded:'}
                  </span>
                  <p className="text-slate-700 text-[11px]">{isAr ? selectedCase.teachBackAr || selectedCase.teachBack : selectedCase.teachBack}</p>
                </div>
              )}

              {/* Clinician-to-Clinician Handoff Request with Accept/Decline */}
              <div className="p-3 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    {isAr ? 'طلب تسليم الحالة بين الأطباء (محاكاة):' : 'Clinician-to-Clinician Handoff (Simulated):'}
                  </span>
                  <span className="text-[11px] font-mono capitalize px-2 py-0.5 rounded bg-slate-100">
                    {selectedCase.handoff?.status || 'none'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleHandoffResponse(selectedCase, 'accepted')}
                    className="flex-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {isAr ? 'قبول التسليم (محاكاة)' : 'Accept Handoff (simulated)'}
                  </button>
                  <button
                    onClick={() => handleHandoffResponse(selectedCase, 'declined')}
                    className="flex-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    {isAr ? 'رفض التسليم (محاكاة)' : 'Decline Handoff (simulated)'}
                  </button>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-900 block text-xs">
                  {isAr ? 'المخطط الزمني للأحداث:' : 'Event Timeline:'}
                </span>
                <div className="space-y-1.5 border-l-2 border-sky-200 pl-3 ml-1">
                  {buildDisplayTimeline(selectedCase).map((evt) => (
                    <div key={evt.id} className="text-[11px] text-slate-700">
                      <div className="font-semibold text-sky-800 flex items-center gap-1.5">
                        <span>{isAr ? evt.titleAr || evt.title : evt.title}</span>
                        <span className="text-[10px] font-mono text-slate-400">({evt.timestamp})</span>
                      </div>
                      <p className="text-slate-600">{isAr ? evt.detailAr || evt.detail : evt.detail} — <span className="italic">{isAr ? ACTOR_AR[evt.actor] || evt.actor : evt.actor}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEscalate(selectedCase)}
                  className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isAr ? 'تصعيد الحالة (محاكاة)' : 'Escalate Case (simulated)'}
                </button>
                {selectedCase.status !== 'closed' && (
                  <button
                    onClick={() => handleAttemptClosure(selectedCase)}
                    className="px-3 py-2 bg-sky-600 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {isAr ? 'إغلاق الحالة بدليل موثق' : 'Close Case with Evidence'}
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                {isAr ? 'إغلاق النافذة' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Case Modal Form */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateCaseSubmit}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">
                {isAr ? 'إضافة حالة سريرية تجريبية جديدة' : 'Add New Synthetic Demonstration Case'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isAr ? 'الاسم بالعربية *' : 'Arabic Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseData.nameAr}
                    onChange={(e) => setNewCaseData({ ...newCaseData, nameAr: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                    placeholder="مثال: عبد الله"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isAr ? 'الاسم بالإنجليزية *' : 'English Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCaseData.nameEn}
                    onChange={(e) => setNewCaseData({ ...newCaseData, nameEn: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                    placeholder="e.g. Abdullah"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isAr ? 'العمر *' : 'Age *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={newCaseData.age}
                    onChange={(e) => setNewCaseData({ ...newCaseData, age: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                    placeholder="54"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isAr ? 'نوع الفحص' : 'Case Type'}
                  </label>
                  <select
                    value={newCaseData.type}
                    onChange={(e) => setNewCaseData({ ...newCaseData, type: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  >
                    <option value="HbA1c screening">HbA1c screening</option>
                    <option value="Mammogram">Mammogram</option>
                    <option value="Blood pressure">Blood pressure</option>
                    <option value="FIT">FIT</option>
                    <option value="LDCT">LDCT</option>
                    <option value="Post-discharge follow-up">Post-discharge follow-up</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isAr ? 'ملخص النتيجة السريرية *' : 'Result Summary *'}
                </label>
                <input
                  type="text"
                  required
                  value={newCaseData.resultSummary}
                  onChange={(e) => setNewCaseData({ ...newCaseData, resultSummary: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  placeholder="e.g. HbA1c 6.8% (Simulated)"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {isAr ? 'المسؤول السريري المسمى (أو اتركه فارغاً لجعله غير مسند)' : 'Named Owner (or leave empty for Unassigned)'}
                </label>
                <input
                  type="text"
                  value={newCaseData.owner}
                  onChange={(e) => setNewCaseData({ ...newCaseData, owner: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  placeholder="Dr. Tariq (Simulated)"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isAr ? 'مهلة الإبلاغ (SLA)' : 'Notification SLA'}
                  </label>
                  <input
                    type="text"
                    value={newCaseData.notificationSla}
                    onChange={(e) => setNewCaseData({ ...newCaseData, notificationSla: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isAr ? 'الحالة السريرية' : 'Case Status'}
                  </label>
                  <select
                    value={newCaseData.status}
                    onChange={(e) => setNewCaseData({ ...newCaseData, status: e.target.value as any })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-slate-900"
                  >
                    <option value="on_track">On Track</option>
                    <option value="overdue">Overdue</option>
                    <option value="unassigned">Unassigned</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-800 text-white rounded-lg text-xs font-bold cursor-pointer shadow-2xs"
              >
                {isAr ? 'حفظ الحالة التجريبية' : 'Save Demo Case'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
