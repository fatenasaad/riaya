import {
  ChecklistItem,
  ClinicianCase,
  ChatMessage,
  ArchivedConversation,
  RecoveryCheckIn,
  SurgeryType,
  Language,
  JourneyStage,
  PersonalMedication,
  PRNUsageEntry,
  ScreeningFollowUps
} from '../types';
import { INITIAL_SEED_CASES } from '../data/seedCases';
import { INITIAL_BEFORE_CHECKLIST } from '../data/journeyData';

const KEYS = {
  LANG: 'riaya_language',
  STAGE: 'riaya_journey_stage',
  CHECKLIST: 'riaya_checklist',
  NOTES: 'riaya_doctor_notes',
  MEDS_TAKEN: 'riaya_meds_taken',
  CHECKINS: 'riaya_recovery_checkins',
  CHAT: 'riaya_chat_history',
  CHAT_ARCHIVE: 'riaya_chat_archive',
  CASES: 'riaya_clinician_cases',
  PERSONAL_MEDS: 'riaya_personal_meds',
  PRN_LOGS: 'riaya_prn_usage_logs',
  SCREENING_FOLLOWUPS: 'riaya_screening_followups',
  SURGERY_TYPE: 'riaya_surgery_type',
};

export function getStoredLanguage(): Language {
  try {
    const val = localStorage.getItem(KEYS.LANG);
    if (val === 'en' || val === 'ar') return val;
  } catch (e) {}
  return 'ar'; // Arabic default
}

export function setStoredLanguage(lang: Language) {
  try {
    localStorage.setItem(KEYS.LANG, lang);
  } catch (e) {}
}

export function getStoredStage(): JourneyStage {
  try {
    const val = localStorage.getItem(KEYS.STAGE);
    if (val === 'before' || val === 'during' || val === 'after') return val;
  } catch (e) {}
  return 'before';
}

export function setStoredStage(stage: JourneyStage) {
  try {
    localStorage.setItem(KEYS.STAGE, stage);
  } catch (e) {}
}

export function getStoredChecklist(): ChecklistItem[] {
  try {
    const val = localStorage.getItem(KEYS.CHECKLIST);
    if (val) return JSON.parse(val);
  } catch (e) {}
  return INITIAL_BEFORE_CHECKLIST;
}

export function setStoredChecklist(items: ChecklistItem[]) {
  try {
    localStorage.setItem(KEYS.CHECKLIST, JSON.stringify(items));
  } catch (e) {}
}

export function getStoredDoctorNotes(): string {
  try {
    return localStorage.getItem(KEYS.NOTES) || '';
  } catch (e) {}
  return '';
}

export function setStoredDoctorNotes(notes: string) {
  try {
    localStorage.setItem(KEYS.NOTES, notes);
  } catch (e) {}
}

export function getStoredMedsTaken(): Record<string, Record<string, boolean>> {
  try {
    const val = localStorage.getItem(KEYS.MEDS_TAKEN);
    if (val) return JSON.parse(val);
  } catch (e) {}
  return {};
}

export function setStoredMedsTaken(data: Record<string, Record<string, boolean>>) {
  try {
    localStorage.setItem(KEYS.MEDS_TAKEN, JSON.stringify(data));
  } catch (e) {}
}

export function getStoredCheckins(): RecoveryCheckIn[] {
  try {
    const val = localStorage.getItem(KEYS.CHECKINS);
    if (val) return JSON.parse(val);
  } catch (e) {}
  return [];
}

export function setStoredCheckins(items: RecoveryCheckIn[]) {
  try {
    localStorage.setItem(KEYS.CHECKINS, JSON.stringify(items));
  } catch (e) {}
}

export function getStoredChatHistory(): ChatMessage[] {
  try {
    const val = localStorage.getItem(KEYS.CHAT);
    if (val) return JSON.parse(val);
  } catch (e) {}
  return [];
}

export function setStoredChatHistory(chat: ChatMessage[]) {
  try {
    localStorage.setItem(KEYS.CHAT, JSON.stringify(chat));
  } catch (e) {}
}

export function getStoredChatArchive(): ArchivedConversation[] {
  try {
    const val = localStorage.getItem(KEYS.CHAT_ARCHIVE);
    if (val) {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function setStoredChatArchive(archive: ArchivedConversation[]) {
  try {
    localStorage.setItem(KEYS.CHAT_ARCHIVE, JSON.stringify(archive));
  } catch (e) {}
}

export function getStoredSurgeryType(): SurgeryType {
  try {
    const val = localStorage.getItem(KEYS.SURGERY_TYPE);
    if (val === 'thyroid' || val === 'cesarean' || val === 'catheter' || val === 'gallbladder' || val === 'other' || val === 'general') return val;
  } catch (e) {}
  return 'general';
}

export function setStoredSurgeryType(type: SurgeryType) {
  try {
    localStorage.setItem(KEYS.SURGERY_TYPE, type);
  } catch (e) {}
}

export function getStoredClinicianCases(): ClinicianCase[] {
  try {
    const val = localStorage.getItem(KEYS.CASES);
    if (val) {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed) && parsed.length >= 15) {
        return parsed;
      }
    }
  } catch (e) {}
  return INITIAL_SEED_CASES;
}

export function setStoredClinicianCases(cases: ClinicianCase[]) {
  try {
    localStorage.setItem(KEYS.CASES, JSON.stringify(cases));
  } catch (e) {}
}

export function getStoredPersonalMeds(): PersonalMedication[] {
  try {
    const val = localStorage.getItem(KEYS.PERSONAL_MEDS);
    if (val) return JSON.parse(val);
  } catch (e) {}
  return [];
}

export function setStoredPersonalMeds(meds: PersonalMedication[]) {
  try {
    localStorage.setItem(KEYS.PERSONAL_MEDS, JSON.stringify(meds));
  } catch (e) {}
}

export function getStoredScreeningFollowUps(): ScreeningFollowUps {
  try {
    const val = localStorage.getItem(KEYS.SCREENING_FOLLOWUPS);
    if (val) return JSON.parse(val);
  } catch (e) {}
  return {};
}

export function setStoredScreeningFollowUps(followUps: ScreeningFollowUps) {
  try {
    localStorage.setItem(KEYS.SCREENING_FOLLOWUPS, JSON.stringify(followUps));
  } catch (e) {}
}

export function getStoredPRNUsageLogs(): PRNUsageEntry[] {
  try {
    const val = localStorage.getItem(KEYS.PRN_LOGS);
    if (val) return JSON.parse(val);
  } catch (e) {}
  return [];
}

export function setStoredPRNUsageLogs(logs: PRNUsageEntry[]) {
  try {
    localStorage.setItem(KEYS.PRN_LOGS, JSON.stringify(logs));
  } catch (e) {}
}

export function resetAllDemoData() {
  try {
    localStorage.removeItem(KEYS.CHECKLIST);
    localStorage.removeItem(KEYS.NOTES);
    localStorage.removeItem(KEYS.MEDS_TAKEN);
    localStorage.removeItem(KEYS.CHECKINS);
    localStorage.removeItem(KEYS.CHAT);
    localStorage.removeItem(KEYS.CHAT_ARCHIVE);
    localStorage.removeItem(KEYS.CASES);
    localStorage.removeItem(KEYS.PERSONAL_MEDS);
    localStorage.removeItem(KEYS.PRN_LOGS);
    localStorage.removeItem(KEYS.SCREENING_FOLLOWUPS);
    localStorage.removeItem(KEYS.SURGERY_TYPE);
    // Keep language preference
  } catch (e) {}
}
