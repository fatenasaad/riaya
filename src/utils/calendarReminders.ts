import type { PersonalMedication } from '../types';

// Calendar (.ics) medication reminders.
// Honest design: the app only GENERATES a file. The user imports it into their
// phone calendar; alarms then come from the calendar app and can fire while
// Riaya is closed. Dose times are always user-entered — never invented here.

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function medHasCompleteTimes(med: PersonalMedication): boolean {
  if (med.frequencyType !== 'scheduled') return false;
  const need = med.timesPerDay || 1;
  if (!med.doseTimes || med.doseTimes.length !== need) return false;
  return med.doseTimes.every((t) => TIME_RE.test(t));
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

// Fold long content lines per RFC 5545 (max ~75 octets, CRLF + space).
function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 73) return line;
  const parts: string[] = [];
  let current = '';
  let currentBytes = 0;
  for (const ch of line) {
    const len = new TextEncoder().encode(ch).length;
    if (currentBytes + len > 73) {
      parts.push(current);
      current = ' ' + ch;
      currentBytes = 1 + len;
    } else {
      current += ch;
      currentBytes += len;
    }
  }
  if (current) parts.push(current);
  return parts.join('\r\n');
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// Floating local time (no timezone suffix): the phone calendar interprets it
// in the device's own timezone, which is what a dose reminder needs.
function floatingDateTime(d: Date): string {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}00`
  );
}

function utcStamp(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

// First occurrence: today at the dose time, or tomorrow if it already passed.
function firstOccurrence(time: string, now: Date): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
  if (d.getTime() <= now.getTime()) d.setDate(d.getDate() + 1);
  return d;
}

export function buildICSForMedication(med: PersonalMedication, isAr: boolean): string | null {
  if (!medHasCompleteTimes(med)) return null;
  const now = new Date();
  const summary = isAr ? `جرعة دواء: ${med.name} — ${med.dose}` : `Medication dose: ${med.name} — ${med.dose}`;
  const description = isAr
    ? 'تذكير أنشأه تطبيق رعاية من جدول أدخلته بنفسك. سجّل الجرعة في التطبيق بعد تناولها — التسجيل إبلاغ ذاتي. راجع دائماً وصفتك الفعلية.'
    : 'Reminder created by Riaya from a schedule you entered yourself. Log the dose in the app after taking it — logging is self-reporting. Always follow your actual prescription.';

  const events = (med.doseTimes as string[])
    .map((time, i) => {
      const start = firstOccurrence(time, now);
      const lines = [
        'BEGIN:VEVENT',
        `UID:riaya-${med.id}-dose-${i + 1}@riaya.demo`,
        `DTSTAMP:${utcStamp(now)}`,
        `DTSTART:${floatingDateTime(start)}`,
        'RRULE:FREQ=DAILY',
        `SUMMARY:${escapeICS(summary)}`,
        `DESCRIPTION:${escapeICS(description)}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeICS(summary)}`,
        'TRIGGER:PT0M',
        'END:VALARM',
        'END:VEVENT',
      ];
      return lines.map(foldLine).join('\r\n');
    })
    .join('\r\n');

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Riaya//Medication Reminders//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', events, 'END:VCALENDAR'].join('\r\n') + '\r\n';
}

// Google Calendar template links — the simplest path: one tap opens Google
// Calendar with a daily recurring reminder pre-filled; the user just taps
// Save. A template link carries a single event, so one link per dose time.
export function buildGoogleCalendarUrls(med: PersonalMedication, isAr: boolean): string[] {
  if (!medHasCompleteTimes(med)) return [];
  const now = new Date();
  const text = isAr ? `جرعة دواء: ${med.name} — ${med.dose}` : `Medication dose: ${med.name} — ${med.dose}`;
  const details = isAr
    ? 'تذكير أنشأه تطبيق رعاية من جدول أدخلته بنفسك. سجّل الجرعة في التطبيق بعد تناولها — التسجيل إبلاغ ذاتي. راجع دائماً وصفتك الفعلية.'
    : 'Reminder created by Riaya from a schedule you entered yourself. Log the dose in the app after taking it — logging is self-reporting. Always follow your actual prescription.';
  return (med.doseTimes as string[]).map((time) => {
    const stamp = floatingDateTime(firstOccurrence(time, now));
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text,
      dates: `${stamp}/${stamp}`,
      details,
      recur: 'RRULE:FREQ=DAILY',
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  });
}

export function downloadICSForMedication(med: PersonalMedication, isAr: boolean): boolean {
  const ics = buildICSForMedication(med, isAr);
  if (!ics) return false;
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeName = med.name.replace(/[^\p{L}\p{N}]+/gu, '-').slice(0, 40) || 'medication';
  a.download = `riaya-reminder-${safeName}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}
