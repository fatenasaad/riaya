export type Language = 'ar' | 'en';

export type TabId = 'chat' | 'journey' | 'screening' | 'future';

export type JourneyStage = 'before' | 'during' | 'after';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isUrgent?: boolean;
  urgentReason?: string;
  sourceUrl?: string;
  sourceTitle?: string;
}

export interface ArchivedConversation {
  id: string;
  archivedAt: string; // ISO date string
  stage: JourneyStage;
  messages: ChatMessage[];
}

export type ReferralStatus = 'none' | 'pending' | 'accepted' | 'completed' | 'not needed' | 'unknown';
export type CaseStatus = 'unassigned' | 'overdue' | 'on_track' | 'closed';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  actor: string;
  titleAr?: string;
  detailAr?: string;
}

export interface ClinicianCase {
  id: string; // e.g. RY-001 or ALERT-CHAT-XXX
  nameAr: string;
  nameEn: string;
  age: number | string;
  type: string;
  resultSummary: string;
  plainLanguageExplanation: string;
  whatItDoesNotEstablish: string;
  sourceNote: string;
  resultDate: string; // "Not provided", "Unknown", or exact date string
  owner: string; // "Unassigned" or name
  notificationSla: string; // e.g. "24 hours", "48 hours", "Not provided"
  referralTarget: string; // e.g. "Endocrinology", "None"
  referralStatus: ReferralStatus;
  appointmentInfo: string;
  status: CaseStatus;
  scenarioDescription: string;
  isSimulatedAlert?: boolean;
  alertSource?: string;
  timeline: TimelineEvent[];
  sbar?: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  teachBack?: string;
  // Who ordered the test and why (absent = honestly shown as "Not recorded")
  testOrder?: {
    orderedBy: string;
    orderedAt: string;
    reason: string;
    orderedByAr?: string;
    reasonAr?: string;
  };
  // Documented clinician review of the result. A review is only recorded as
  // completed when the case scenario supports it; otherwise it stays pending.
  resultReview?: {
    status: 'completed' | 'pending';
    reviewedBy?: string;
    reviewedAt?: string;
    decision?: string;
    reviewedByAr?: string;
    decisionAr?: string;
  };
  // Arabic display variants (used by the Arabic UI; English remains canonical)
  typeAr?: string;
  resultSummaryAr?: string;
  plainLanguageExplanationAr?: string;
  whatItDoesNotEstablishAr?: string;
  scenarioDescriptionAr?: string;
  referralTargetAr?: string;
  appointmentInfoAr?: string;
  notificationSlaAr?: string;
  resultDateAr?: string;
  closureEvidenceAr?: string;
  teachBackAr?: string;
  sbarAr?: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
  handoff?: {
    requestedTo: string;
    status: 'none' | 'pending' | 'accepted' | 'declined';
    notes?: string;
  };
  closureEvidence?: string;
}

export interface ChecklistItem {
  id: string;
  textAr: string;
  textEn: string;
  completed: boolean;
}

export type SurgeryType = 'general' | 'thyroid' | 'cesarean' | 'catheter' | 'gallbladder' | 'other';

export interface ProcedureAnswer {
  questionId: string;
  answer: 'yes' | 'no';
}

export interface RecoveryCheckIn {
  id: string;
  date: string;
  timestamp: string;
  breathing: 'better' | 'same' | 'worse';
  fever: 'yes' | 'no';
  pain: number; // 0 to 10
  walked: 'yes' | 'no';
  mood: 'good' | 'fair' | 'struggling';
  severeRedFlags?: string[];
  isWarning: boolean;
  isEmergency?: boolean;
  warningSummary?: string;
  surgeryType?: SurgeryType;
  procedureAnswers?: ProcedureAnswer[];
  woundIssue?: 'none' | 'signs';
  appetite?: 'good' | 'low' | 'nausea' | 'vomiting';
  bowelBladder?: 'normal' | 'difficulty';
  sleepQuality?: 'good' | 'broken' | 'none';
  homeSupport?: 'yes' | 'sometimes' | 'alone';
  followUpAppt?: 'confirmed' | 'notyet' | 'none';
  mainConcern?: string;
}

export interface MedicationDoseSlot {
  id: string;
  labelAr: string;
  labelEn: string;
  timeHintAr?: string;
  timeHintEn?: string;
}

export interface PRNUsageEntry {
  id: string;
  medId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amount: string; // e.g. "2 puffs" or "1 tablet"
  timestamp: number;
}

export interface PersonalMedication {
  id: string;
  name: string;
  dose: string;
  frequencyType: 'scheduled' | 'prn';
  timesPerDay?: number; // 1, 2, 3, 4
  doseTimes?: string[]; // user-entered clock times per dose, "HH:mm" — never invented by the app
  duration: string;
  createdAt: string;
}

export interface ScreeningFollowUp {
  ruleId: string;
  bookedDate?: string; // YYYY-MM-DD, optional, entered by the patient
  bookedAt?: string; // ISO timestamp of the self-report
  completedDate?: string; // YYYY-MM-DD, optional, entered by the patient
  completedAt?: string; // ISO timestamp of the self-report
}

export type ScreeningFollowUps = Record<string, ScreeningFollowUp>;

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  scheduleAr: string;
  scheduleEn: string;
  remainingDays?: number;
  instructionsAr?: string;
  instructionsEn?: string;
  doses?: MedicationDoseSlot[];
  isPRN?: boolean;
  specificWarningAr?: string;
  specificWarningEn?: string;
}

export interface EducationCardData {
  id: string;
  titleAr: string;
  titleEn: string;
  sentencesAr: string[];
  sentencesEn: string[];
  sourceTitle?: string;
  sourceUrl?: string;
  isVerifiedSource: boolean;
  unverifiedNoteAr?: string;
  unverifiedNoteEn?: string;
  chatTopicAr: string;
  chatTopicEn: string;
}

export interface ScreeningInputs {
  age?: number;
  sexAssigned?: 'female' | 'male' | 'other';
  isPregnant?: 'yes' | 'no' | 'unknown';
  hasOverweightObesity?: 'yes' | 'no' | 'unknown';
  hasDiabetesRiskFactors?: 'yes' | 'no' | 'unknown';
  bmi?: number;
  hasKnownHypertension?: 'yes' | 'no' | 'unknown';
  smokingStatus?: 'never' | 'former' | 'current' | 'unknown';
  packYears?: number;
  yearsSinceQuitting?: number;
  colorectalTestType?: 'colonoscopy' | 'fit' | 'none' | 'other' | 'unknown';
  colorectalTestDate?: string;
  hasColorectalSymptomsOrHighRisk?: 'yes' | 'no' | 'unknown';
  mammogramDate?: 'within_2_years' | 'more_than_2_years' | 'never' | 'unknown';
  hasBreastHighRisk?: 'yes' | 'no' | 'unknown';
}

export interface ScreeningResultExplanation {
  ruleId: string;
  ruleTitleAr: string;
  ruleTitleEn: string;
  isEligible: boolean | 'insufficient_info' | 'individualized';
  summaryAr: string;
  summaryEn: string;
  missingInputs?: string[];
  // 3 Required Blocks:
  whyThisResultAr: string;
  whyThisResultEn: string;
  whatThisDoesNotEstablishAr: string;
  whatThisDoesNotEstablishEn: string;
  sourceTitle: string;
  sourceYear: string;
  sourceUrl: string;
}
