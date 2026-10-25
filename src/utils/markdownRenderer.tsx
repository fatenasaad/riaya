import React from 'react';
import { ExternalLink, Info } from 'lucide-react';

// Pre-defined verified medical source whitelist and descriptive labels
const VERIFIED_SOURCE_MAP: Record<string, { titleAr: string; titleEn: string }> = {
  'https://www.nice.org.uk/guidance/NG192/chapter/recommendations': {
    titleAr: 'إرشادات NICE الرسمية (الولادة القيصرية)',
    titleEn: 'NICE Official Guideline (Caesarean Birth)',
  },
  'https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/breastfeeding-and-lifestyle/medicines/': {
    titleAr: 'إرشادات NHS الرسمية (الأدوية أثناء الرضاعة)',
    titleEn: 'NHS Official Guide (Medicines in Breastfeeding)',
  },
  'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/colorectal-cancer-screening': {
    titleAr: 'توصية USPSTF (فحص سرطان القولون والمستقيم)',
    titleEn: 'USPSTF: Colorectal Cancer Screening',
  },
  'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening': {
    titleAr: 'توصية USPSTF (فحص سرطان الثدي)',
    titleEn: 'USPSTF: Breast Cancer Screening',
  },
  'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/screening-for-prediabetes-and-type-2-diabetes': {
    titleAr: 'توصية USPSTF (فحص السكري ومقدمات السكري)',
    titleEn: 'USPSTF: Prediabetes & Type 2 Diabetes Screening',
  },
  'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening': {
    titleAr: 'توصية USPSTF (فحص ضغط الدم لدى البالغين)',
    titleEn: 'USPSTF: Hypertension in Adults Screening',
  },
  'https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/lung-cancer-screening': {
    titleAr: 'توصية USPSTF (فحص سرطان الرئة)',
    titleEn: 'USPSTF: Lung Cancer Screening',
  },
};

export function getSourceLabel(url: string, isAr: boolean): string {
  const cleanUrl = url.trim().replace(/[.,;:)\]]+$/, '');
  for (const [key, val] of Object.entries(VERIFIED_SOURCE_MAP)) {
    if (cleanUrl.toLowerCase().startsWith(key.toLowerCase()) || key.toLowerCase().startsWith(cleanUrl.toLowerCase())) {
      return isAr ? val.titleAr : val.titleEn;
    }
  }
  if (cleanUrl.includes('nice.org.uk')) {
    return isAr ? 'إرشادات NICE الرسمية (الولادة القيصرية)' : 'NICE Official Guideline (Caesarean Birth)';
  }
  if (cleanUrl.includes('nhs.uk')) {
    return isAr ? 'إرشادات NHS الرسمية (الأدوية أثناء الرضاعة)' : 'NHS Official Guide (Medicines in Breastfeeding)';
  }
  if (cleanUrl.includes('uspreventiveservicestaskforce')) {
    return isAr ? 'توصية USPSTF الرسمية' : 'USPSTF Official Recommendation';
  }
  return cleanUrl;
}

/**
 * Parses inline formatting:
 * - Bold: **text**
 * - Italic: *text*
 * - Markdown links: [title](url)
 * - Bare URLs: https://...
 * Strips raw '**' or '*' symbols so they never show up raw in the UI.
 */
export function parseInlineMarkdown(text: string, isAr: boolean): React.ReactNode[] {
  if (!text) return [];

  // Match:
  // 1. [Label](url)
  // 2. https://...
  // 3. **bold**
  // 4. *italic*
  const pattern = /(\[[^\]]+\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s]+|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const parts = text.split(pattern);

  return parts.map((part, idx) => {
    if (!part) return null;

    // Check Markdown Link [Label](url)
    const mdLinkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)$/);
    if (mdLinkMatch) {
      const explicitLabel = mdLinkMatch[1];
      const url = mdLinkMatch[2];
      const friendlyLabel = getSourceLabel(url, isAr);
      const displayLabel = explicitLabel && explicitLabel !== url ? explicitLabel : friendlyLabel;
      return (
        <a
          key={`mdl-${idx}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mx-1 text-sky-800 hover:text-sky-950 font-semibold underline bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded text-xs transition-colors"
        >
          <span>{displayLabel}</span>
          <ExternalLink className="w-3 h-3 inline shrink-0" />
        </a>
      );
    }

    // Check Bare URL
    if (part.startsWith('http://') || part.startsWith('https://')) {
      const cleanUrl = part.replace(/[.,;:)\]]+$/, '');
      const trailing = part.slice(cleanUrl.length);
      const label = getSourceLabel(cleanUrl, isAr);
      return (
        <React.Fragment key={`url-${idx}`}>
          <a
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mx-1 text-sky-800 hover:text-sky-950 font-semibold underline bg-sky-50 hover:bg-sky-100 px-2 py-0.5 rounded text-xs transition-colors"
          >
            <span>{label}</span>
            <ExternalLink className="w-3 h-3 inline shrink-0" />
          </a>
          {trailing}
        </React.Fragment>
      );
    }

    // Check Bold **content**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const content = part.slice(2, -2).trim();
      return (
        <strong key={`b-${idx}`} className="font-bold text-slate-900">
          {content}
        </strong>
      );
    }

    // Check Italic *content*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const content = part.slice(1, -1).trim();
      return (
        <em key={`em-${idx}`} className="italic text-slate-800">
          {content}
        </em>
      );
    }

    // Regular text: clean any stray markdown artifacts like unmatched ** or *
    const cleanedText = part.replace(/\*\*/g, '').replace(/(^|[^\w])\*([^\w]|$)/g, '$1$2');
    return <span key={`txt-${idx}`}>{cleanedText}</span>;
  });
}

/**
 * Renders complete message content from Markdown lines:
 * - Headings (#, ##, ###, or **Heading:**) -> rendered in actual bold typography
 * - Bullet lists (*, -, •) -> clean bullet markers without raw * or -
 * - Numbered lists (1., 2.) -> styled numerals
 * - Fallback source notices -> styled info callout
 * - Paragraphs -> leading-relaxed with inline bold/italic/links
 */
export function renderMarkdownContent(rawText: string, isAr: boolean): React.ReactNode {
  if (!rawText) return null;

  const lines = rawText.split('\n');

  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, lIdx) => {
        const trimmed = line.trim();

        // Empty line
        if (!trimmed) {
          return <div key={lIdx} className="h-1" />;
        }

        // Fallback note check: "لم يتم العثور على مصدر طبي موثوق ومباشر لهذا السؤال."
        const isFallbackNotice =
          trimmed.includes('لم يتم العثور على مصدر طبي موثوق ومباشر') ||
          trimmed.includes('لم نتمكن من التحقق من مصدر') ||
          trimmed.includes('direct verified medical source was not found') ||
          trimmed.includes('verified source could not be confirmed');

        if (isFallbackNotice) {
          return (
            <div
              key={lIdx}
              className="my-2 p-2.5 bg-slate-50 border border-slate-200/90 rounded-lg text-slate-600 text-xs flex items-center gap-2 italic"
            >
              <Info className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{trimmed.replace(/^[«"]+|[»"]+$/g, '')}</span>
            </div>
          );
        }

        // Markdown Headings: #, ##, ###, ####
        const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (headingMatch) {
          const content = headingMatch[2].replace(/\*\*/g, '').trim();
          return (
            <h4
              key={lIdx}
              className="font-bold text-slate-900 text-sm sm:text-base mt-2 mb-1 border-b border-slate-100 pb-0.5"
            >
              {content}
            </h4>
          );
        }

        // Standalone bold heading line: e.g. **علامات الخطر:** or **Routine Recovery:**
        const boldHeadingMatch = trimmed.match(/^\*\*([^*]+)\*\*:\s*$/) || trimmed.match(/^\*\*([^*]+)\*\*\s*$/);
        if (boldHeadingMatch) {
          return (
            <div
              key={lIdx}
              className="font-bold text-slate-900 text-sm sm:text-base mt-2 mb-1"
            >
              {boldHeadingMatch[1]}
            </div>
          );
        }

        // Bullet point list item: * item or - item or • item
        const bulletMatch = trimmed.match(/^(\*|-|•)\s+(.*)$/);
        if (bulletMatch) {
          const content = bulletMatch[2];
          return (
            <div key={lIdx} className="flex items-start gap-2 ps-1.5 my-1">
              <span className="text-sky-700 font-bold shrink-0 mt-0.5 text-base leading-none">•</span>
              <div className="flex-1 leading-relaxed">
                {parseInlineMarkdown(content, isAr)}
              </div>
            </div>
          );
        }

        // Numbered list item: 1. item
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const content = numberedMatch[2];
          return (
            <div key={lIdx} className="flex items-start gap-2 ps-1.5 my-1">
              <span className="font-bold text-sky-600 shrink-0 mt-0.5 text-xs sm:text-sm min-w-[1.25rem]">
                {num}.
              </span>
              <div className="flex-1 leading-relaxed">
                {parseInlineMarkdown(content, isAr)}
              </div>
            </div>
          );
        }

        // Standard text paragraph
        return (
          <p key={lIdx} className="leading-relaxed">
            {parseInlineMarkdown(line, isAr)}
          </p>
        );
      })}
    </div>
  );
}
