import React, { useState, useEffect } from 'react';
import {
  Language,
  TabId,
  JourneyStage,
  ChatMessage,
  ArchivedConversation,
  ChecklistItem,
  RecoveryCheckIn,
  ClinicianCase,
  PersonalMedication,
  PRNUsageEntry
} from './types';
import {
  getStoredLanguage,
  setStoredLanguage,
  getStoredStage,
  setStoredStage,
  getStoredChecklist,
  setStoredChecklist,
  getStoredDoctorNotes,
  setStoredDoctorNotes,
  getStoredMedsTaken,
  setStoredMedsTaken,
  getStoredCheckins,
  setStoredCheckins,
  getStoredChatHistory,
  setStoredChatHistory,
  getStoredChatArchive,
  setStoredChatArchive,
  getStoredClinicianCases,
  setStoredClinicianCases,
  getStoredPersonalMeds,
  setStoredPersonalMeds,
  getStoredPRNUsageLogs,
  setStoredPRNUsageLogs,
  resetAllDemoData
} from './utils/storage';
import { Header } from './components/Header';
import { ChatTab } from './components/ChatTab';
import { JourneyTab } from './components/JourneyTab';
import { ScreeningTab } from './components/ScreeningTab';
import { ClinicianTab } from './components/ClinicianTab';
import { FutureVisionTab } from './components/FutureVisionTab';
import { detectIntakeRoute } from './utils/intakeRouter';
import type { SurgeryType } from './types';

export default function App() {
  const [language, setLanguage] = useState<Language>(getStoredLanguage);
  const [currentTab, setCurrentTab] = useState<TabId>('chat');
  const [stage, setStage] = useState<JourneyStage>(getStoredStage);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>(getStoredChatHistory);
  const [archivedConversations, setArchivedConversations] = useState<ArchivedConversation[]>(getStoredChatArchive);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [urgentAlertBanner, setUrgentAlertBanner] = useState<string | null>(null);
  const [prefilledPrompt, setPrefilledPrompt] = useState<string | undefined>(undefined);
  const [journeyJump, setJourneyJump] = useState<{ n: number; phase: JourneyStage; afterView?: 'general' | 'personal' | 'meds'; surgeryType?: SurgeryType; fromChat?: boolean } | null>(null);

  // Journey state
  const [checklist, setChecklist] = useState<ChecklistItem[]>(getStoredChecklist);
  const [doctorNotes, setDoctorNotes] = useState<string>(getStoredDoctorNotes);
  const [medsTaken, setMedsTaken] = useState<Record<string, Record<string, boolean>>>(getStoredMedsTaken);
  const [checkins, setCheckins] = useState<RecoveryCheckIn[]>(getStoredCheckins);
  const [personalMeds, setPersonalMeds] = useState<PersonalMedication[]>(getStoredPersonalMeds);
  const [prnLogs, setPrnLogs] = useState<PRNUsageEntry[]>(getStoredPRNUsageLogs);

  // Clinician cases state (15 initial seed cases + any new simulated alerts)
  const [clinicianCases, setClinicianCases] = useState<ClinicianCase[]>(getStoredClinicianCases);

  // Sync document direction and lang attribute with selected language
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.title = language === 'ar' ? 'رعاية' : 'Riaya';
    setStoredLanguage(language);
  }, [language]);

  // Persist stage
  const handleStageChange = (newStage: JourneyStage) => {
    setStage(newStage);
    setStoredStage(newStage);
  };

  // Toggle Language
  const handleToggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
  };

  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Send message to Gemini through backend with streaming for fast response
  const handleSendMessage = async (userText: string) => {
    // Abort any prior in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setStoredChatHistory(newMessages);
    setIsChatLoading(true);
    setChatError(null);

    // Welcome-page intake routing: only on the FIRST message of a fresh
    // conversation, and only for a clear first-person statement about the
    // user's own procedure (see utils/intakeRouter). The message is still
    // answered in chat; the user lands in their Journey space and can return
    // to the answer at any time — context is never lost.
    if (messages.length === 0) {
      const route = detectIntakeRoute(userText);
      if (route) {
        handleStageChange(route.phase);
        setJourneyJump({ n: Date.now(), phase: route.phase, afterView: route.afterView, surgeryType: route.surgeryType, fromChat: true });
        setCurrentTab('journey');
      }
    }

    // Client-side red flag warning check for instant safety guidance
    const lower = userText.toLowerCase();
    const urgentEnFlags = [
      'cannot breathe', "can't breathe", 'difficulty breathing', 'shortness of breath',
      'severe chest pain', 'crushing chest pain', 'chest pressure', 'heart attack',
      'neck swelling', 'throat closing', 'swollen neck',
      'severe bleeding', 'uncontrolled bleeding',
      'sudden weakness', 'facial droop', 'face drooping', 'arm weakness', 'stroke',
      'passed out', 'unconscious', 'fainted', 'loss of consciousness', 'confused suddenly'
    ];
    const urgentArFlags = [
      'صعوبة في التنفس', 'ضيق تنفس شديد', 'لا أستطيع التنفس', 'اختناق',
      'ألم شديد في الصدر', 'ألم في الصدر', 'ضغط على الصدر', 'ذبحة',
      'تورم سريع في الرقبة', 'انتفاخ الرقبة', 'انسداد الحلق',
      'نزيف حاد', 'نزيف مستمر', 'سعال دم',
      'ضعف مفاجئ', 'شلل في الوجه', 'ثقل في اللسان', 'جلطة',
      'فقدان الوعي', 'أغمي علي', 'إغماء', 'تشوش ذهني مفاجئ'
    ];

    const isWoundFever = (
      (userText.includes('جرح') || userText.includes('القيصرية') || userText.includes('العملية')) &&
      (userText.includes('حرارة') || userText.includes('سخونة') || userText.includes('حمى') || userText.includes('صديد') || userText.includes('قيح') || userText.includes('يوجعني') || userText.includes('يزداد ألم'))
    ) || (
      (lower.includes('wound') || lower.includes('incision') || lower.includes('c-section') || lower.includes('cesarean')) &&
      (lower.includes('fever') || lower.includes('worsening pain') || lower.includes('pus') || lower.includes('discharge'))
    );

    const hasUrgentSign = urgentEnFlags.some((f) => lower.includes(f)) || urgentArFlags.some((f) => userText.includes(f)) || isWoundFever;

    if (hasUrgentSign) {
      const bannerText = isWoundFever
        ? (language === 'ar'
            ? 'تنبيه طبي عاجل: ازدياد ألم جرح العملية مع وجود حرارة/حمى يستدعي تقييماً سريرياً عاجلاً وفحصاً فورياً من قِبل طبيبك أو قسم طوارئ الولادة لاستبعاد التهاب الجرح.'
            : 'Urgent Medical Alert: Worsening surgical wound pain accompanied by fever requires immediate clinical evaluation by your surgical/obstetric team to rule out wound infection.')
        : (language === 'ar'
            ? 'قد تكون هذه حالة طارئة. اطلب المساعدة الطبية فوراً. إذا كنت في المستشفى، أبلغ الفريق الطبي مباشرة.'
            : 'This may be an emergency. Seek immediate medical help now. If you are in hospital, alert your care team immediately.');
      
      setUrgentAlertBanner(bannerText);

      // Create simulated alert in Clinician Board without claiming real notification was sent
      const alertId = `ALERT-CHAT-${Date.now().toString().slice(-4)}`;
      const simulatedAlert: ClinicianCase = {
        id: alertId,
        nameAr: isWoundFever ? 'مريضة جراحة (ألم جرح وحمى)' : 'مريض المحادثة (تنبيه أعراض حادة)',
        nameEn: isWoundFever ? 'Surgical Patient (Wound Pain + Fever)' : 'Chat Patient (Red-Flag Alert)',
        age: 'Unknown',
        type: isWoundFever ? 'Post-Op Wound Danger Sign' : 'Emergency Warning Sign (Chat)',
        resultSummary: userText.slice(0, 70),
        plainLanguageExplanation: language === 'ar'
          ? (isWoundFever ? 'رصد ازدياد ألم الجرح مع حمى، مما يشتبه بحدوث التهاب جرح جراحي يتطلب تقييماً طبياً عاجلاً.' : 'تم رصد عرض تحذيري محتمل أثناء المحادثة يستوجب تقييماً إسعافياً عاجلاً.')
          : (isWoundFever ? 'Worsening post-operative wound pain with fever flagged for suspected surgical site infection.' : 'Potential life-threatening or red-flag symptom detected during natural chat conversation.'),
        whatItDoesNotEstablish: 'Does not establish definitive diagnosis or hospital admission; flagged for demonstration.',
        sourceNote: 'Simulated AI Chat Red-Flag Monitor',
        resultDate: new Date().toISOString().split('T')[0],
        owner: 'Triage Lead (Simulated)',
        notificationSla: 'Immediate (Urgent)',
        referralTarget: isWoundFever ? 'Obstetrics / Surgical Triage' : 'Emergency Department Review',
        referralStatus: 'pending',
        appointmentInfo: 'Simulated Triage Case Generated',
        status: 'overdue',
        scenarioDescription: 'Simulated red-flag alert generated from AI chat interaction. (Simulated — not sent to a real clinician).',
        typeAr: isWoundFever ? 'علامة خطر جرح ما بعد العملية' : 'علامة تحذير طارئة (محادثة)',
        resultSummaryAr: userText.slice(0, 70),
        plainLanguageExplanationAr: isWoundFever
          ? 'رصد ازدياد ألم الجرح مع حمى، مما يشتبه بحدوث التهاب جرح جراحي يتطلب تقييماً طبياً عاجلاً.'
          : 'تم رصد عرض تحذيري محتمل أثناء المحادثة يستوجب تقييماً إسعافياً عاجلاً.',
        whatItDoesNotEstablishAr: 'لا يثبت تشخيصاً نهائياً ولا قبولاً في المستشفى؛ عُلم لأغراض العرض.',
        scenarioDescriptionAr: 'تنبيه علامة حمراء محاكى مولّد من تفاعل محادثة الذكاء الاصطناعي. (محاكاة — لم يُرسل إلى طبيب حقيقي).',
        referralTargetAr: isWoundFever ? 'فرز النسائية / الجراحة' : 'مراجعة قسم الطوارئ',
        appointmentInfoAr: 'حالة فرز محاكاة تم إنشاؤها',
        notificationSlaAr: 'فوري (عاجل)',
        isSimulatedAlert: true,
        alertSource: 'AI chat',
        timeline: [
          {
            id: '1',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            title: isWoundFever ? 'Wound Infection Sign Flagged (Simulated)' : 'Red-Flag Detected (Simulated)',
            detail: `User reported: "${userText.slice(0, 50)}..."`,
            actor: 'Safety Monitoring Filter',
            titleAr: isWoundFever ? 'عُلمت علامة التهاب جرح (محاكاة)' : 'رُصدت علامة حمراء (محاكاة)',
            detailAr: `أبلغ المستخدم: "${userText.slice(0, 50)}..."`
          }
        ]
      };

      const updatedCases = [simulatedAlert, ...clinicianCases];
      setClinicianCases(updatedCases);
      setStoredClinicianCases(updatedCases);
    }

    try {
      const historyPayload = messages.slice(-8).map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      // Try streaming endpoint first for fast time-to-first-token
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          stage,
          language,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        // Fallback to standard chat endpoint if stream not supported
        const fallbackRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userText,
            history: historyPayload,
            stage,
            language,
          }),
          signal: controller.signal,
        });

        if (!fallbackRes.ok) {
          const errJson = await fallbackRes.json().catch(() => ({}));
          throw new Error(errJson.message || errJson.details || 'Server error occurred');
        }

        const data = await fallbackRes.json();
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUrgent: data.isUrgent || hasUrgentSign,
          urgentReason: data.urgentReason,
        };

        const finalMessages = [...newMessages, assistantMsg];
        setMessages(finalMessages);
        setStoredChatHistory(finalMessages);
        return;
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      const assistantMsgId = `msg-${Date.now()}-assistant`;

      if (reader) {
        let isDone = false;
        while (!isDone) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  accumulatedText += data.text;
                  const streamingAssistantMsg: ChatMessage = {
                    id: assistantMsgId,
                    role: 'assistant',
                    text: accumulatedText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isUrgent: hasUrgentSign,
                  };
                  setMessages([...newMessages, streamingAssistantMsg]);
                }
                if (data.done) {
                  isDone = true;
                  const finalAssistantMsg: ChatMessage = {
                    id: assistantMsgId,
                    role: 'assistant',
                    text: accumulatedText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isUrgent: data.isUrgent || hasUrgentSign,
                    urgentReason: data.urgentReason,
                  };
                  const updatedFinal = [...newMessages, finalAssistantMsg];
                  setMessages(updatedFinal);
                  setStoredChatHistory(updatedFinal);
                }
              } catch (e) {}
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled or navigated away
        return;
      }
      console.error('Chat error:', err);
      const fallbackError = language === 'ar'
        ? 'خدمة الذكاء الاصطناعي غير متوفرة حالياً. يمكنك تصفح التثقيف الصحي الموثق في التبويب المخصص.'
        : 'The AI model service is currently unavailable. Please refer to our verified guides in the Screening Gateway.';
      setChatError(fallbackError);
    } finally {
      setIsChatLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Clear chat and cancel active requests
  const handleClearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([]);
    setStoredChatHistory([]);
    setUrgentAlertBanner(null);
  };

  // Home = the intake picture with the six starting points. From any tab, and
  // from any point inside a conversation, the home button returns there; the
  // current conversation is archived first, never deleted.
  const handleGoHome = () => {
    handleArchiveAndNewChat();
    setCurrentTab('chat');
  };

  // Archive the current conversation and start a fresh one
  const buildArchiveEntry = (msgs: ChatMessage[], st: JourneyStage): ArchivedConversation => ({
    id: `arch-${Date.now()}`,
    archivedAt: new Date().toISOString(),
    stage: st,
    messages: msgs,
  });

  const handleArchiveAndNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (messages.length > 0) {
      const updated = [buildArchiveEntry(messages, stage), ...archivedConversations];
      setArchivedConversations(updated);
      setStoredChatArchive(updated);
    }
    setMessages([]);
    setStoredChatHistory([]);
    setUrgentAlertBanner(null);
  };

  // Reopen an archived conversation (the current one is archived first, never lost)
  const handleRestoreArchivedConversation = (id: string) => {
    const target = archivedConversations.find((c) => c.id === id);
    if (!target) return;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    let remaining = archivedConversations.filter((c) => c.id !== id);
    if (messages.length > 0) {
      remaining = [buildArchiveEntry(messages, stage), ...remaining];
    }
    setArchivedConversations(remaining);
    setStoredChatArchive(remaining);
    setMessages(target.messages);
    setStoredChatHistory(target.messages);
    handleStageChange(target.stage);
    setUrgentAlertBanner(null);
  };

  // Permanently delete one archived conversation
  const handleDeleteArchivedConversation = (id: string) => {
    const updated = archivedConversations.filter((c) => c.id !== id);
    setArchivedConversations(updated);
    setStoredChatArchive(updated);
  };

  // Handle Ask Riaya from Education tab
  const handleAskRiayaFromEducation = (topic: string) => {
    setCurrentTab('chat');
    setPrefilledPrompt(topic);
    // Send immediately to AI assistant
    handleSendMessage(topic);
  };

  const [guidesJump, setGuidesJump] = useState(0);
  const handleNavigateToGuides = () => {
    setCurrentTab('screening');
    setGuidesJump((j) => j + 1);
  };

  // Welcome-page chips: land the user directly in the matching Journey space
  const handleWelcomeNavigate = (phase: JourneyStage, afterView?: 'general' | 'personal' | 'meds') => {
    handleStageChange(phase);
    setJourneyJump({ n: Date.now(), phase, afterView });
    setCurrentTab('journey');
  };

  // Journey labs card: ask Riaya to explain a result/report in chat
  const handleAskAboutLabs = () => {
    setCurrentTab('chat');
    handleSendMessage(
      language === 'ar'
        ? 'أريد فهم نتيجة تحليل أو تقرير طبي خاص فيني — ساعدني أفهم شو بتعني النتيجة، وشو يلي ما فينا نستنتجو منها لحالها، وأيمتى لازم راجع طبيبي.'
        : 'I want to understand a lab result or medical report of mine — help me understand what it means, what cannot be concluded from it alone, and when I should check with my doctor.'
    );
  };

  // Bridge from the recovery check-in: for operations without a curated
  // question module, Riaya generates the procedure-specific follow-up
  // questions conversationally in the chat.
  // Checklist toggle
  const handleToggleChecklist = (id: string) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updated);
    setStoredChecklist(updated);
  };

  // Doctor notes update
  const handleUpdateDoctorNotes = (notes: string) => {
    setDoctorNotes(notes);
    setStoredDoctorNotes(notes);
  };

  // Medication dose taken toggle (supports separate dose slots)
  const handleToggleMedTaken = (date: string, slotId: string) => {
    const currentForDate = { ...(medsTaken[date] || {}) };
    // Clear legacy un-slotted med key if present
    const legacyMedId = slotId.includes('_dose_') ? slotId.split('_dose_')[0] : null;
    if (legacyMedId && currentForDate[legacyMedId]) {
      delete currentForDate[legacyMedId];
    }
    currentForDate[slotId] = !currentForDate[slotId];
    const updated = {
      ...medsTaken,
      [date]: currentForDate,
    };
    setMedsTaken(updated);
    setStoredMedsTaken(updated);
  };

  // Add Recovery Check-in
  const handleAddCheckin = (checkinData: Omit<RecoveryCheckIn, 'id' | 'timestamp'>) => {
    const newCheckin: RecoveryCheckIn = {
      ...checkinData,
      id: `checkin-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    const updated = [newCheckin, ...checkins];
    setCheckins(updated);
    setStoredCheckins(updated);
  };

  // Simulate coordinator alert from check-in
  const handleSimulateCoordinatorAlert = (alertCase: Partial<ClinicianCase>) => {
    const fullCase: ClinicianCase = {
      id: alertCase.id || `ALERT-COORD-${Date.now().toString().slice(-4)}`,
      nameAr: alertCase.nameAr || 'محمود (تنبيه منسق)',
      nameEn: alertCase.nameEn || 'Mahmoud (Coordinator Alert)',
      age: alertCase.age || 68,
      type: alertCase.type || 'Post-discharge follow-up',
      resultSummary: alertCase.resultSummary || 'Daily check-in warning',
      plainLanguageExplanation: alertCase.plainLanguageExplanation || 'Recovery check-in alert flagged for coordinator triage.',
      whatItDoesNotEstablish: alertCase.whatItDoesNotEstablish || 'Preliminary check-in trigger.',
      sourceNote: alertCase.sourceNote || 'Daily Recovery Check-In',
      resultDate: alertCase.resultDate || new Date().toISOString().split('T')[0],
      owner: alertCase.owner || 'Nurse Sarah (Simulated)',
      notificationSla: alertCase.notificationSla || 'Within 4 hours',
      referralTarget: alertCase.referralTarget || 'Care Coordinator Triage',
      referralStatus: alertCase.referralStatus || 'pending',
      appointmentInfo: alertCase.appointmentInfo || 'Coordinator triage pending (Simulated)',
      status: alertCase.status || 'on_track',
      scenarioDescription: alertCase.scenarioDescription || 'Phase 3 recovery check-in alert (Simulated).',
      typeAr: alertCase.typeAr,
      resultSummaryAr: alertCase.resultSummaryAr,
      plainLanguageExplanationAr: alertCase.plainLanguageExplanationAr,
      whatItDoesNotEstablishAr: alertCase.whatItDoesNotEstablishAr,
      scenarioDescriptionAr: alertCase.scenarioDescriptionAr,
      referralTargetAr: alertCase.referralTargetAr,
      appointmentInfoAr: alertCase.appointmentInfoAr,
      notificationSlaAr: alertCase.notificationSlaAr,
      isSimulatedAlert: true,
      alertSource: alertCase.alertSource || 'Daily recovery check-in',
      timeline: [
        {
          id: '1',
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
          title: 'Alert Logged (Simulated)',
          detail: 'Recovery check-in flagged clinical parameters requiring clinical coordinator review.',
          actor: 'Check-in Triage System',
          titleAr: 'سُجل التنبيه (محاكاة)',
          detailAr: 'رصد تقييم التعافي معايير سريرية تتطلب مراجعة منسق سريري.'
        }
      ]
    };

    const updated = [fullCase, ...clinicianCases];
    setClinicianCases(updated);
    setStoredClinicianCases(updated);
  };

  // Update clinician case
  const handleUpdateCase = (updatedCase: ClinicianCase) => {
    const updated = clinicianCases.map((c) => (c.id === updatedCase.id ? updatedCase : c));
    setClinicianCases(updated);
    setStoredClinicianCases(updated);
  };

  // Add new clinician case
  const handleAddCase = (newCase: ClinicianCase) => {
    const updated = [newCase, ...clinicianCases];
    setClinicianCases(updated);
    setStoredClinicianCases(updated);
  };

  // Personal medications handlers
  const handleAddPersonalMed = (medData: Omit<PersonalMedication, 'id' | 'createdAt'>) => {
    const newMed: PersonalMedication = {
      ...medData,
      id: `pmed-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [...personalMeds, newMed];
    setPersonalMeds(updated);
    setStoredPersonalMeds(updated);
  };

  const handleDeletePersonalMed = (id: string) => {
    const updated = personalMeds.filter((m) => m.id !== id);
    setPersonalMeds(updated);
    setStoredPersonalMeds(updated);
  };

  const handleUpdatePersonalMed = (id: string, patch: Partial<PersonalMedication>) => {
    const updated = personalMeds.map((m) => (m.id === id ? { ...m, ...patch } : m));
    setPersonalMeds(updated);
    setStoredPersonalMeds(updated);
  };

  // PRN as-needed usage logs handlers
  const handleAddPRNLog = (entryData: Omit<PRNUsageEntry, 'id' | 'timestamp'>) => {
    const newEntry: PRNUsageEntry = {
      ...entryData,
      id: `prn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    const updated = [newEntry, ...prnLogs];
    setPrnLogs(updated);
    setStoredPRNUsageLogs(updated);
  };

  const handleDeletePRNLog = (id: string) => {
    const updated = prnLogs.filter((l) => l.id !== id);
    setPrnLogs(updated);
    setStoredPRNUsageLogs(updated);
  };

  // Reset all demo data
  const handleResetAllData = () => {
    resetAllDemoData();
    setChecklist(getStoredChecklist());
    setDoctorNotes('');
    setMedsTaken({});
    setCheckins([]);
    setPersonalMeds([]);
    setPrnLogs([]);
    setMessages([]);
    setArchivedConversations([]);
    setClinicianCases(getStoredClinicianCases());
    setUrgentAlertBanner(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header with Navigation and Language Toggle */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onToggleLanguage={handleToggleLanguage}
      />

      {/* Main Tab Content View */}
      <main className={`flex-1 flex flex-col ${currentTab === 'chat' ? 'pb-0' : 'pb-16'}`}>
        {(
          <div className="w-full max-w-7xl mx-auto px-4 pt-3">
            <button
              type="button"
              onClick={handleGoHome}
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 hover:border-sky-400 text-sky-900 shadow-2xs transition-colors cursor-pointer min-h-[44px]"
            >
              🏠 {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Back to home'}
            </button>
          </div>
        )}
        {currentTab === 'chat' && (
          <ChatTab
            language={language}
            stage={stage}
            onChangeStage={handleStageChange}
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearChat={handleClearChat}
            archivedConversations={archivedConversations}
            onArchiveAndNewChat={handleArchiveAndNewChat}
            onRestoreArchivedConversation={handleRestoreArchivedConversation}
            onDeleteArchivedConversation={handleDeleteArchivedConversation}
            isLoading={isChatLoading}
            errorState={chatError}
            onNavigateToGuides={handleNavigateToGuides}
            prefilledPrompt={prefilledPrompt}
            onClearPrefilledPrompt={() => setPrefilledPrompt(undefined)}
            urgentAlertBanner={urgentAlertBanner}
            onWelcomeNavigate={handleWelcomeNavigate}
          />
        )}

        {currentTab === 'journey' && (
          <JourneyTab
            language={language}
            currentPhase={stage}
            onChangePhase={handleStageChange}
            checklist={checklist}
            onToggleChecklist={handleToggleChecklist}
            doctorNotes={doctorNotes}
            onUpdateDoctorNotes={handleUpdateDoctorNotes}
            medsTaken={medsTaken}
            onToggleMedTaken={handleToggleMedTaken}
            personalMeds={personalMeds}
            onAddPersonalMed={handleAddPersonalMed}
            onDeletePersonalMed={handleDeletePersonalMed}
            onUpdatePersonalMed={handleUpdatePersonalMed}
            prnLogs={prnLogs}
            onAddPRNLog={handleAddPRNLog}
            onDeletePRNLog={handleDeletePRNLog}
            checkins={checkins}
            onAddCheckin={handleAddCheckin}
            onResetAllDemoData={handleResetAllData}
            onSimulateCoordinatorAlert={handleSimulateCoordinatorAlert}
            journeyJump={journeyJump}
            onAskAboutLabs={handleAskAboutLabs}
          />
        )}

        {currentTab === 'screening' && (
          <ScreeningTab language={language} onAskRiaya={handleAskRiayaFromEducation} guidesJumpSignal={guidesJump} />
        )}

        {currentTab === 'future' && (
          <>
            <FutureVisionTab language={language} />
            <div className="max-w-7xl mx-auto px-4 pt-2 pb-2">
              <div className="bg-violet-50 border-2 border-violet-300 rounded-2xl p-4 text-violet-950 shadow-2xs">
                <div className="font-bold text-violet-900 mb-1 text-sm sm:text-base">
                  {language === 'ar'
                    ? 'تصميم مستقبلي — بيانات تجريبية: لوحة التنسيق السريري'
                    : 'Future design — demonstration data: Clinical Coordination Board'}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {language === 'ar'
                    ? 'هكذا ستبدو لوحة التنسيق السريري عندما تُبنى بالشراكة مع مستشفى: مسؤول مسمّى لكل حالة، ومهل متابعة، وتصعيد موثّق، وإغلاق موثّق. ما يلي محاكاة تصميمية تفاعلية — ليست جزءاً من النموذج العامل للمريض، ولا توجد حالات حقيقية ولا أطباء متصلون بها.'
                    : 'This is how the clinical coordination board would look when built in partnership with a hospital: a named owner for every case, follow-up deadlines, documented escalation, and documented closure. What follows is an interactive design simulation — it is not part of the working patient prototype, and no real cases or clinicians are connected to it.'}
                </p>
              </div>
            </div>
            <ClinicianTab
              language={language}
              cases={clinicianCases}
              onUpdateCase={handleUpdateCase}
              onAddCase={handleAddCase}
            />
          </>
        )}
      </main>

      {/* Footer (hidden on the chat tab so the chat fills the screen, messenger-style) */}
      {currentTab !== 'chat' && (
      <footer className="border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-sky-950 font-serif">
              {language === 'ar' ? 'رعاية' : 'Riaya'}
            </span>
            <span className="mx-2 text-slate-300">·</span>
            <span>
              {language === 'ar'
                ? 'المرافق الصحي الذكي للمريض من دخول المستشفى حتى التعافي في المنزل'
                : 'The AI Hospital Journey Companion'}
            </span>
          </div>
          <div className="text-sky-800 font-medium">
            Developed by Faten Asaad
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}
