import React from 'react';
import { TabId, Language } from '../types';
import { MessageSquare, Compass, BookOpen, ShieldCheck, ClipboardList, Globe, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  language,
  onToggleLanguage,
}) => {
  const isAr = language === 'ar';

  const tabs: Array<{ id: TabId; labelAr: string; labelEn: string; icon: React.ReactNode }> = [
    { id: 'chat', labelAr: 'محادثة رعاية', labelEn: 'Riaya Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'journey', labelAr: 'رحلتي', labelEn: 'My Journey', icon: <Compass className="w-4 h-4" /> },
    { id: 'screening', labelAr: 'بوابة الفحوص', labelEn: 'Screening Gateway', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'future', labelAr: 'التصور المستقبلي', labelEn: 'Future Vision', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-sky-100 shadow-xs">
      {/* Top persistent notice strip */}
      <div className="bg-sky-800 text-sky-50 px-4 py-1.5 text-xs text-center font-normal flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span>
          {isAr
            ? 'نموذج أولي للتثقيف الصحي ومتابعة رحلة المريض — يعمل ببيانات تجريبية حفاظاً على الخصوصية، ويدعم فريقك الطبي ولا يحلّ محله.'
            : 'Health-education and patient-journey prototype — runs on synthetic data to protect privacy, and supports your medical team, never replaces it.'}
        </span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">
        {/* Zone 1: Single text wordmark (Never combine 'Riaya — رعاية') */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black text-xl shadow-2xs">
            {isAr ? 'ر' : 'R'}
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-sky-950 block leading-tight">
              {isAr ? 'رعاية' : 'Riaya'}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap min-h-[44px] cursor-pointer ${
                  isActive
                    ? 'bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-sky-800 hover:bg-slate-50'
                }`}
              >
                {tab.icon}
                <span>{isAr ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Toggle Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium shadow-2xs min-h-[44px] cursor-pointer transition-colors"
            title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
          >
            <Globe className="w-3.5 h-3.5 text-sky-700" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Secondary Tab Strip (top sub-bar) */}
      <div className="lg:hidden border-t border-slate-100 overflow-x-auto px-2 py-1.5 flex gap-1 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap min-h-[40px] shrink-0 transition-colors ${
                isActive
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.icon}
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
