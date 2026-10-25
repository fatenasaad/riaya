// Structured follow-up questions for operations WITHOUT a curated question
// set (the "another operation" flow). Safety design, by construction:
// - The model may ONLY produce monitoring questions (bilingual text).
// - It never assigns severity, never gives advice or verdicts, and the app
//   never treats an answer as triage. Escalation stays with the deterministic
//   core check-in questions and the red-flag list in the same form.
// - Output is validated strictly; anything unexpected is rejected and the
//   client falls back to the existing prose bridge answer.

export interface GeneratedQuestion {
  ar: string;
  en: string;
}

// Treatment / instruction phrasing that must never appear inside a
// generated monitoring question (checked against both languages).
const BLOCKED_PHRASES = [
  'يجب عليك', 'يجب أن تتناول', 'يجب ان تتناول', 'توقف عن تناول', 'زد الجرعة', 'قلل الجرعة',
  'جرعة', 'ملغ', 'مليغرام', 'ملي غرام',
  'you should take', 'you must take', 'stop taking', 'increase the dose', 'decrease the dose',
  'dosage', 'milligram', 'prescribe', 'prescription',
];

export function buildFollowupQuestionsPrompt(operationName: string): string {
  return `You generate home follow-up monitoring questions for a patient recovering at home after this operation: "${operationName}".

STRICT RULES:
- Base the questions ONLY on general post-surgery recovery monitoring principles (NHS "recovery after surgery" guidance): wound condition, bleeding, fever or infection signs, pain trend, breathing and chest symptoms, leg swelling (blood clots), eating and drinking, bowel and bladder function, mobility.
- Every question must be answerable with yes or no.
- Order the questions most safety-critical first.
- Do NOT give advice, explanations, diagnoses, severity labels, numbers, or thresholds. Questions only.
- Do NOT claim these questions are an official protocol for this operation.
- Write each question in Arabic and in English, in plain, simple language.
- Return ONLY valid JSON, with no markdown fences and no extra text, in exactly this shape:
{"questions":[{"ar":"...","en":"..."}]}
- Return 5 to 8 questions.`;
}

export function parseGeneratedQuestions(raw: string): GeneratedQuestion[] | null {
  if (!raw || typeof raw !== 'string') return null;
  let text = raw.trim();
  // Strip markdown code fences if the model added them anyway.
  text = text.replace(/```(?:json)?/gi, '').trim();
  // Accept BOTH shapes the model produces in practice: the documented
  // {"questions":[...]} object AND a bare JSON array [...] — plus prose
  // wrapped around either.
  let arr: unknown[] | null = null;
  const tryParse = (t: string): unknown => { try { return JSON.parse(t); } catch { return undefined; } };
  let data = tryParse(text);
  if (data === undefined) {
    const objStart = text.indexOf('{');
    const objEnd = text.lastIndexOf('}');
    if (objStart !== -1 && objEnd > objStart) data = tryParse(text.slice(objStart, objEnd + 1));
  }
  if (data === undefined) {
    const arrStart = text.indexOf('[');
    const arrEnd = text.lastIndexOf(']');
    if (arrStart !== -1 && arrEnd > arrStart) data = tryParse(text.slice(arrStart, arrEnd + 1));
  }
  if (Array.isArray(data)) arr = data;
  else if (data && typeof data === 'object' && Array.isArray((data as { questions?: unknown }).questions)) {
    arr = (data as { questions: unknown[] }).questions;
  }
  if (!arr) return null;
  const seen = new Set<string>();
  const out: GeneratedQuestion[] = [];
  for (const item of arr) {
    // Accept plain strings and {ar|question|text, en|english} objects.
    let ar = '';
    let en = '';
    if (typeof item === 'string') {
      ar = item.trim();
    } else if (item && typeof item === 'object') {
      const rec = item as Record<string, unknown>;
      for (const k of ['ar', 'arabic', 'question_ar', 'question', 'text']) {
        if (typeof rec[k] === 'string' && (rec[k] as string).trim()) { ar = (rec[k] as string).trim(); break; }
      }
      for (const k of ['en', 'english', 'question_en']) {
        if (typeof rec[k] === 'string' && (rec[k] as string).trim()) { en = (rec[k] as string).trim(); break; }
      }
    }
    // Arabic is required; English is a display bonus (the UI falls back to
    // the Arabic text) — an Arabic-only answer must NOT sink the whole set.
    if (ar.length < 8 || ar.length > 300 || en.length > 300) continue;
    if (!ar.includes('؟') && !en.includes('?')) continue;
    // Content screen: a generated question must be a pure monitoring
    // question. Reject anything carrying numbers/thresholds (digits in
    // either script) or treatment/instruction phrasing — those belong to
    // the medical team, never to a generated question.
    const joined = `${ar} ${en}`;
    if (/[0-9٠-٩]/.test(joined)) continue;
    if (BLOCKED_PHRASES.some((p) => joined.includes(p) || en.toLowerCase().includes(p))) continue;
    const key = (en || ar).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ar, en });
    if (out.length >= 10) break;
  }
  if (out.length < 3) return null;
  return out;
}
