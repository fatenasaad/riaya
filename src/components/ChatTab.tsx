import React, { useState, useEffect, useRef } from 'react';
import {
  ChatMessage,
  ArchivedConversation,
  JourneyStage,
  Language,
  ClinicianCase
} from '../types';
import {
  Send,
  RotateCcw,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Clock,
  Loader2,
  Archive,
  FolderOpen,
  Trash2
} from 'lucide-react';
import { renderMarkdownContent, getSourceLabel } from '../utils/markdownRenderer';

interface ChatTabProps {
  language: Language;
  stage: JourneyStage;
  onChangeStage: (stage: JourneyStage) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearChat: () => void;
  archivedConversations: ArchivedConversation[];
  onArchiveAndNewChat: () => void;
  onRestoreArchivedConversation: (id: string) => void;
  onDeleteArchivedConversation: (id: string) => void;
  isLoading: boolean;
  errorState: string | null;
  onNavigateToGuides: () => void;
  prefilledPrompt?: string;
  onClearPrefilledPrompt?: () => void;
  urgentAlertBanner: string | null;
  onWelcomeNavigate?: (phase: JourneyStage, afterView?: 'general' | 'personal' | 'meds') => void;
}

export const ChatTab: React.FC<ChatTabProps> = ({
  language,
  stage,
  onChangeStage,
  messages,
  onSendMessage,
  onClearChat,
  archivedConversations,
  onArchiveAndNewChat,
  onRestoreArchivedConversation,
  onDeleteArchivedConversation,
  isLoading,
  errorState,
  onNavigateToGuides,
  prefilledPrompt,
  onClearPrefilledPrompt,
  urgentAlertBanner,
  onWelcomeNavigate,
}) => {
  const isAr = language === 'ar';
  const [inputText, setInputText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle prefilled prompt from education cards or external links
  useEffect(() => {
    if (prefilledPrompt) {
      setInputText(prefilledPrompt);
      if (onClearPrefilledPrompt) onClearPrefilledPrompt();
    }
  }, [prefilledPrompt, onClearPrefilledPrompt]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const textToSend = inputText.trim();
    setInputText('');
    await onSendMessage(textToSend);
  };

  const handleStarterClick = async (question: string) => {
    if (isLoading) return;
    await onSendMessage(question);
  };

  const starterQuestions: Record<JourneyStage, Array<{ ar: string; en: string }>> = {
    before: [
      {
        ar: 'ماذا يجب أن أجهز قبل الدخول للمستشفى؟',
        en: 'What should I prepare before admission?'
      },
      {
        ar: 'أشعر بالخوف من التخدير — ماذا أتوقع؟',
        en: 'I am frightened of anaesthesia — what should I expect?'
      },
      {
        ar: 'ماذا أسأل فريقي الطبي عن أدويتي قبل العملية؟',
        en: 'What should I ask my team about my medications before surgery?'
      }
    ],
    during: [
      {
        ar: 'لماذا تم طلب هذا الفحص؟',
        en: 'Why was this investigation requested?'
      },
      {
        ar: 'ما هي الأسئلة التي يجب أن أطرحها على الطبيب حول الإجراء؟',
        en: 'What questions should I ask my doctor about my procedure?'
      },
      {
        ar: 'هل يمكنك شرح هذا المصطلح الطبي بلغة بسيطة؟',
        en: 'Can you explain this medical term in simple language?'
      }
    ],
    after: [
      {
        ar: 'ساعدني في فهم تعليمات الخروج من المستشفى.',
        en: 'Help me understand my discharge instructions.'
      },
      {
        ar: 'ما الذي يجب أن أعرفه عن التعافي في المنزل؟',
        en: 'What should I know about recovering at home?'
      },
      {
        ar: 'ما هي الأعراض التي تستوجب التواصل مع فريقي الطبي؟',
        en: 'Which symptoms should make me contact my healthcare team?'
      }
    ]
  };

  const stageLabels: Record<JourneyStage, { ar: string; en: string }> = {
    before: { ar: 'قبل دخول المستشفى', en: '1. Before Hospital' },
    during: { ar: 'أثناء الإقامة في المستشفى', en: '2. During Hospital Stay' },
    after: { ar: 'بعد الخروج والتعافي في المنزل', en: '3. After Discharge at Home' }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 max-w-5xl w-full mx-auto px-2 sm:px-4 py-2">
      {/* Journey Stage Selector Bar */}
      <div className="bg-white border border-sky-100 rounded-xl p-2 mb-2 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isAr ? 'مرحلة الرحلة الحالية:' : 'Current Journey Stage:'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
            {(['before', 'during', 'after'] as JourneyStage[]).map((s) => (
              <button
                key={s}
                onClick={() => onChangeStage(s)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer text-center truncate ${
                  stage === s
                    ? 'bg-sky-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title={isAr ? stageLabels[s].ar : stageLabels[s].en}
              >
                {isAr ? stageLabels[s].ar : stageLabels[s].en}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onNavigateToGuides}
              className="flex items-center justify-center gap-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer text-slate-500 hover:text-sky-600 border-slate-200 hover:border-sky-200"
              title={isAr ? 'الأدلة التعليمية الموثّقة' : 'Verified educational guides'}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isAr ? 'الأدلة الموثّقة' : 'Guides'}</span>
            </button>
            <button
              onClick={() => setShowArchive((v) => !v)}
              className={`flex items-center justify-center gap-1 text-xs px-2.5 py-1.5 rounded-md border transition-colors cursor-pointer ${
                showArchive
                  ? 'text-sky-800 border-sky-300 bg-sky-50 font-semibold'
                  : 'text-slate-500 hover:text-sky-600 border-slate-200 hover:border-sky-200'
              }`}
              title={isAr ? 'المحادثات المؤرشفة' : 'Archived conversations'}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isAr ? 'الأرشيف' : 'Archive'}</span>
              {archivedConversations.length > 0 && (
                <span className="bg-sky-600 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {archivedConversations.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center justify-center gap-1 text-xs text-slate-500 hover:text-rose-600 px-2.5 py-1.5 rounded-md border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
              title={isAr ? 'بدء محادثة جديدة' : 'Start new conversation'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'محادثة جديدة' : 'New Chat'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Archived Conversations Panel */}
      {showArchive && (
        <div className="bg-white border border-sky-100 rounded-xl p-3 mb-2 shadow-2xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2">
            <Archive className="w-4 h-4 text-sky-700" />
            <span>{isAr ? 'المحادثات المؤرشفة' : 'Archived conversations'}</span>
          </div>
          {archivedConversations.length === 0 ? (
            <p className="text-xs text-slate-500 leading-relaxed">
              {isAr
                ? 'لا توجد محادثات مؤرشفة بعد. عند بدء محادثة جديدة تُحفظ المحادثة الحالية هنا بدل حذفها.'
                : 'No archived conversations yet. When you start a new chat, the current one is saved here instead of being deleted.'}
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {archivedConversations.map((conv) => {
                const firstUser = conv.messages.find((m) => m.role === 'user');
                const preview = firstUser
                  ? firstUser.text.length > 70
                    ? firstUser.text.slice(0, 70) + '…'
                    : firstUser.text
                  : isAr
                  ? 'محادثة بدون أسئلة'
                  : 'Conversation with no questions';
                const dateLabel = new Date(conv.archivedAt).toLocaleString(isAr ? 'ar' : 'en', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });
                return (
                  <div
                    key={conv.id}
                    className="border border-slate-200 rounded-lg p-2.5 flex flex-col gap-1.5 bg-slate-50/60"
                  >
                    <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
                      <span className="font-medium">
                        {isAr ? stageLabels[conv.stage].ar : stageLabels[conv.stage].en}
                      </span>
                      <span className="font-mono">{dateLabel}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{preview}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">
                        {conv.messages.length} {isAr ? 'رسالة' : 'messages'}
                      </span>
                      {pendingDeleteId === conv.id ? (
                        <span className="flex items-center gap-1.5">
                          <span className="text-[11px] text-rose-700 font-medium">
                            {isAr ? 'حذف نهائي؟' : 'Delete permanently?'}
                          </span>
                          <button
                            onClick={() => {
                              onDeleteArchivedConversation(conv.id);
                              setPendingDeleteId(null);
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-md cursor-pointer"
                          >
                            {isAr ? 'نعم، احذف' : 'Yes, delete'}
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(null)}
                            className="px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 rounded-md cursor-pointer"
                          >
                            {isAr ? 'إلغاء' : 'Cancel'}
                          </button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              onRestoreArchivedConversation(conv.id);
                              setShowArchive(false);
                            }}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-sky-800 bg-sky-100/70 hover:bg-sky-100 rounded-md cursor-pointer"
                          >
                            <FolderOpen className="w-3 h-3" />
                            {isAr ? 'فتح' : 'Open'}
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(conv.id)}
                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            {isAr ? 'حذف' : 'Delete'}
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Prominent Emergency Warning Banner (if active) */}
      {urgentAlertBanner && (
        <div className="bg-rose-50 border-2 border-rose-600 text-rose-950 p-3 sm:p-4 rounded-xl mb-3 flex items-start gap-3 shadow-sm animate-pulse">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <div className="font-bold text-base text-rose-900 mb-1">
              {isAr ? 'تنبيه طارئ فوري' : 'Immediate Emergency Alert'}
            </div>
            <p className="font-medium leading-relaxed">
              {urgentAlertBanner}
            </p>
            <div className="mt-2 text-xs text-rose-700 font-mono">
              {isAr
                ? 'تم تسجيل تنبيه محاكاة في لوحة الطبيب (Simulated Alert). لا نعد جهة مراقبة طوارئ سريرية.'
                : 'A simulated alert was logged to Clinician Board. Riaya is not an emergency monitoring service.'}
            </div>
          </div>
        </div>
      )}

      {/* Main Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 py-2">
        {/* Welcome Message (Riaya's introduction) — part of the conversation once it starts; the intake hero replaces it on a fresh conversation */}
        <div className={`flex items-start gap-3 bg-sky-50/70 border border-sky-100 rounded-2xl p-4 text-slate-800 ${messages.length === 0 ? 'hidden' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
            {isAr ? 'ر' : 'R'}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-800 text-sm">
                {isAr ? 'رعاية' : 'Riaya'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {isAr ? 'مرافق الذكاء الاصطناعي' : 'Patient Companion'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">
              {isAr
                ? 'أهلاً بك، أنا رعاية، مرافقتك الذكية للتثقيف الصحي خلال رحلتك العلاجية. أنا هنا لشرح المصطلحات الطبية، والإجابة عن استفساراتك حول مراحل وجودك في المستشفى، ومساعدتك على الاستعداد بلغة بسيطة وموثوقة. سأشرح لك ما أعرفه، ومن أين جاءت المعلومة، وما الذي لا أستطيع تأكيده.'
                : 'Welcome, I am Riaya, your compassionate patient-education companion. I am here to explain medical concepts, help you navigate your hospital journey, and answer your questions in clear, supportive language. I will explain what I know, where the information came from, and what I cannot confirm.'}
            </p>
            <div className="text-xs text-sky-800/80 bg-sky-100/50 p-2 rounded-lg">
              {isAr
                ? 'ملاحظة سريرية: أنا أداة تثقيفية تجريبية ولا أحل محل تقييم طبيبك المختص أو خدمات الطوارئ.'
                : 'Clinical notice: I provide educational guidance using synthetic demo context and cannot replace your qualified medical team.'}
            </div>
          </div>
        </div>

        {/* Intake welcome hero — a fresh conversation opens here: one question,
            tappable starting points, and routing into the Journey space.
            It disappears as soon as the conversation starts. */}
        {messages.length === 0 && (
          <div className="my-6 sm:my-10 text-center space-y-5 px-2">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-extrabold font-serif tracking-tight text-sky-950">
                {isAr ? 'رعاية' : 'Riaya'}
              </h1>
              <p className="text-base sm:text-lg font-semibold text-sky-800">
                {isAr ? 'رفيقك في رحلة التعافي' : 'Your companion on the road to recovery'}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                {isAr
                  ? 'مساعدك الصحي لفهم حالتك، والاستعداد للمستشفى، ومتابعة تعافيك في المنزل. سأشرح لك ما أعرفه، ومن أين جاءت المعلومة، وما الذي لا أستطيع تأكيده.'
                  : 'Your health companion to understand your condition, prepare for hospital, and follow your recovery at home. I will explain what I know, where the information came from, and what I cannot confirm.'}
              </p>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-800">
              {isAr ? 'ما الذي تحتاج المساعدة فيه اليوم؟' : 'What do you need help with today?'}
            </p>
            <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => onWelcomeNavigate?.('before')}
                className="w-full text-start text-sm px-4 py-3 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 hover:border-sky-400 text-slate-800 transition-colors cursor-pointer min-h-[48px]"
              >
                🏥 {isAr ? 'أستعد لدخول المستشفى' : 'I am preparing for hospital admission'}
              </button>
              <button
                type="button"
                onClick={() => onWelcomeNavigate?.('after', 'personal')}
                className="w-full text-start text-sm px-4 py-3 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 hover:border-sky-400 text-slate-800 transition-colors cursor-pointer min-h-[48px]"
              >
                🩺 {isAr ? 'أجريت عملية وأريد متابعة تعافيي' : 'I had an operation and want to follow my recovery'}
              </button>
              <button
                type="button"
                onClick={() => onWelcomeNavigate?.('after', 'meds')}
                className="w-full text-start text-sm px-4 py-3 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 hover:border-sky-400 text-slate-800 transition-colors cursor-pointer min-h-[48px]"
              >
                💊 {isAr ? 'أريد أن أفهم أدويتي' : 'I want to understand my medications'}
              </button>
              <button
                type="button"
                onClick={() => handleStarterClick(isAr ? 'أريد فهم نتيجة تحليل أو تقرير طبي — كيف تساعدني؟' : 'I want to understand a lab result or a medical report — how can you help me?')}
                className="w-full text-start text-sm px-4 py-3 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 hover:border-sky-400 text-slate-800 transition-colors cursor-pointer min-h-[48px]"
              >
                🧪 {isAr ? 'أريد فهم نتيجة تحليل أو تقرير طبي' : 'I want to understand a lab result or medical report'}
              </button>
              <button
                type="button"
                onClick={() => handleStarterClick(isAr ? 'عندي أعراض وأريد أن أفهم ماذا قد يحدث في المشفى' : 'I have symptoms and I want to understand what may happen in hospital')}
                className="w-full text-start text-sm px-4 py-3 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 hover:border-sky-400 text-slate-800 transition-colors cursor-pointer min-h-[48px]"
              >
                🤒 {isAr ? 'عندي أعراض — شو ممكن يصير بالمشفى؟' : 'I have symptoms — what may happen in hospital?'}
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.focus()}
                className="w-full text-start text-sm px-4 py-3 rounded-xl border border-sky-200 bg-white hover:bg-sky-50 hover:border-sky-400 text-slate-800 transition-colors cursor-pointer min-h-[48px]"
              >
                ❓ {isAr ? 'لدي سؤال صحي عام' : 'I have a general health question'}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {isAr ? 'أو اكتب سؤالك مباشرة في الأسفل' : 'Or type your question directly below'}
            </p>
          </div>
        )}

        {/* Render Conversation Messages */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                  isUser
                    ? 'bg-slate-700 text-white'
                    : 'bg-sky-700 text-white'
                }`}
              >
                {isUser ? (isAr ? 'أنت' : 'You') : (isAr ? 'ر' : 'R')}
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-2xs ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-tr-xs'
                    : msg.isUrgent
                    ? 'bg-rose-50 border border-rose-300 text-slate-900 rounded-tl-xs'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs'
                }`}
              >
                {/* Header label for assistant */}
                {!isUser && (
                  <div className="flex items-center justify-between gap-2 mb-1 border-b border-slate-100 pb-1 text-xs text-slate-500">
                    <span className="font-semibold text-sky-800">
                      {isAr ? 'رعاية' : 'Riaya'}
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {msg.timestamp}
                    </span>
                  </div>
                )}

                {/* Urgent indicator if flagged */}
                {msg.isUrgent && (
                  <div className="mb-2 p-2 bg-rose-100/70 border border-rose-300 rounded text-rose-900 text-xs font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>
                      {isAr
                        ? 'تنبيه: يتضمن هذا السؤال أعراضاً قد تشير لحالة طارئة.'
                        : 'Alert: This message contains symptoms that may require emergency attention.'}
                    </span>
                  </div>
                )}

                {/* Formatted Message Body with Markdown typography and clickable verified links */}
                <div className="text-slate-800">
                  {renderMarkdownContent(msg.text, isAr)}
                </div>

                {/* Sources info */}
                {msg.sourceUrl && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs flex items-center gap-1.5 text-sky-800 font-medium">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 text-sky-600" />
                    <span className="shrink-0">{isAr ? 'المصدر المعتمد: ' : 'Verified source: '}</span>
                    <a
                      href={msg.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold hover:text-sky-950 truncate"
                    >
                      {msg.sourceTitle || getSourceLabel(msg.sourceUrl, isAr)}
                    </a>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading state indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {isAr ? 'ر' : 'R'}
            </div>
            <div className="bg-white border border-sky-100 rounded-2xl rounded-tl-xs p-3.5 shadow-2xs flex items-center gap-2 text-slate-700 text-xs sm:text-sm font-medium">
              <Loader2 className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
              <span>{isAr ? 'رعاية تعد إجابة طبية موثقة ومبسطة...' : 'Riaya is generating a verified, plain-language response...'}</span>
            </div>
          </div>
        )}

        {/* Error state with fallback to Education tab */}
        {errorState && (
          <div className="bg-amber-50 border border-amber-300 p-3.5 rounded-xl text-amber-950 text-sm space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{isAr ? 'تعذر الاتصال بخدمة الذكاء الاصطناعي' : 'AI Model Service Unavailable'}</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              {errorState}
            </p>
            <div className="pt-1">
              <button
                onClick={onNavigateToGuides}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isAr ? 'الانتقال إلى التثقيف الصحي البديل' : 'View Verified Educational Guides'}</span>
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSubmit} className="mt-2 bg-white border border-sky-200 rounded-2xl p-2 shadow-xs">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isAr
                ? 'اطرح سؤالك هنا (مثال: ما الذي يجب أن أجهزه قبل العملية؟)'
                : 'Ask your question here (e.g. What should I prepare before surgery?)'
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none min-h-[44px]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer min-h-[44px] shrink-0 ${
              !inputText.trim() || isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-sky-600 text-white hover:bg-sky-800 shadow-2xs'
            }`}
          >
            <Send className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
            <span className="hidden sm:inline">{isAr ? 'إرسال' : 'Send'}</span>
          </button>
        </div>
      </form>

      <div className="text-center text-[10px] text-slate-400 pt-1 pb-0.5">Developed by Faten Asaad</div>

      {/* Confirmation Modal for Clearing Chat */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">
              {isAr ? 'تأكيد بدء محادثة جديدة' : 'Start New Conversation?'}
            </h3>
            <p className="text-sm text-slate-600">
              {isAr
                ? 'ستُحفظ المحادثة الحالية في الأرشيف (يمكنك فتحها أو حذفها لاحقاً من زر الأرشيف) وستبدأ محادثة جديدة فارغة. هل تريد المتابعة؟'
                : 'The current conversation will be saved to the archive (you can reopen or delete it later from the Archive button) and a fresh conversation will start. Do you wish to proceed?'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg min-h-[44px] cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onArchiveAndNewChat();
                  setShowClearConfirm(false);
                }}
                className="px-3.5 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-800 rounded-lg min-h-[44px] cursor-pointer shadow-2xs"
              >
                {isAr ? 'أرشف وابدأ جديدة' : 'Archive & Start New'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
