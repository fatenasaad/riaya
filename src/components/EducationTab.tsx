import React, { useState } from 'react';
import { Language, EducationCardData } from '../types';
import { EDUCATION_CARDS } from '../data/educationCards';
import {
  BookOpen,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Search,
  Info
} from 'lucide-react';

interface EducationTabProps {
  language: Language;
  onAskRiaya: (topic: string) => void;
  onlyIds?: string[];
  bare?: boolean;
}

export const EducationTab: React.FC<EducationTabProps> = ({
  language,
  onAskRiaya,
  onlyIds,
  bare,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = EDUCATION_CARDS.filter((card) => {
    if (onlyIds && !onlyIds.includes(card.id)) return false;
    const q = searchQuery.toLowerCase();
    const title = (isAr ? card.titleAr : card.titleEn).toLowerCase();
    const sentences = (isAr ? card.sentencesAr : card.sentencesEn).join(' ').toLowerCase();
    return title.includes(q) || sentences.includes(q);
  });

  return (
    <div className={bare ? 'space-y-6' : 'max-w-6xl mx-auto px-4 py-4 space-y-6'}>
      {/* Header Banner (hidden when embedded as a section) */}
      {!bare && (
      <>
      <div className="bg-white border border-sky-100 rounded-2xl p-6 shadow-2xs space-y-2">
        <div className="flex items-center gap-2.5 text-sky-800">
          <BookOpen className="w-6 h-6 text-sky-600" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {isAr ? 'مكتبة التثقيف الصحي الموثقة' : 'Verified Patient Education Library'}
          </h1>
        </div>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          {isAr
            ? 'دليل مبسط وشامل يغطي إرشادات الاستعداد للمستشفى، وإدارة التعافي المنزلي، وأهم التوصيات الوقائية المعتمدة لفحوصات الكشف المبكر.'
            : 'Clear, plain-language patient guides covering hospital admission preparation, discharge recovery, and accredited preventive screening recommendations.'}
        </p>

        {/* Search bar */}
        <div className="pt-2 max-w-md">
          <div className="relative">
            <Search className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isAr ? 'right-3.5' : 'left-3.5'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث في بطاقات التثقيف الصحي...' : 'Search educational guides...'}
              className={`w-full py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-700/20 focus:border-sky-700 ${
                isAr ? 'pr-10 pl-3' : 'pl-10 pr-3'
              }`}
            />
          </div>
        </div>
      </div>

      </>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCards.map((card, idx) => {
          const sentences = isAr ? card.sentencesAr : card.sentencesEn;
          const title = isAr ? card.titleAr : card.titleEn;
          const chatTopic = isAr ? card.chatTopicAr : card.chatTopicEn;

          return (
            <div
              key={card.id}
              className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all space-y-4"
            >
              <div className="space-y-3">
                {/* Title */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {title}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    #{idx + 1}
                  </span>
                </div>

                {/* 3-5 concise plain-language sentences */}
                <div className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {sentences.map((stn, i) => (
                    <p key={i} className="flex items-start gap-2">
                      <span className="text-sky-700 font-bold shrink-0 mt-0.5">•</span>
                      <span>{stn}</span>
                    </p>
                  ))}
                </div>
              </div>

              {/* Source Line & Action Button */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                {/* Source Line */}
                <div className="text-xs text-slate-500">
                  {card.isVerifiedSource && card.sourceUrl ? (
                    <div className="flex items-center gap-1.5 text-sky-800 font-medium">
                      <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="shrink-0">{isAr ? 'المصدر المعتمد: ' : 'Verified source: '}</span>
                      <a
                        href={card.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-sky-950 truncate flex items-center gap-1"
                        title={card.sourceTitle}
                      >
                        <span className="truncate">{card.sourceTitle}</span>
                        <ExternalLink className="w-3 h-3 shrink-0 inline" />
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-500 italic">
                      <Info className="w-3.5 h-3.5 shrink-0" />
                      <span>{isAr ? card.unverifiedNoteAr : card.unverifiedNoteEn}</span>
                    </div>
                  )}
                </div>

                {/* Ask Riaya Button */}
                <button
                  onClick={() => onAskRiaya(chatTopic)}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs sm:text-sm font-semibold transition-colors cursor-pointer min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4 text-sky-600" />
                  <span>{isAr ? 'اسأل رعاية عن هذا الموضوع' : 'Ask Riaya about this'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">
            {isAr ? 'لم يتم العثور على بطاقات مطابقة' : 'No matching educational guides found'}
          </h3>
          <p className="text-xs text-slate-500">
            {isAr ? 'جرب البحث بكلمات أخرى أو امسح شريط البحث.' : 'Try adjusting your search query or clear the filter.'}
          </p>
        </div>
      )}
    </div>
  );
};
