import { ClinicianCase } from '../types';
import { SEED_CASES_AR } from './seedCasesAr';

export const INITIAL_SEED_CASES: ClinicianCase[] = [
  {
    id: 'RY-001',
    nameAr: 'أبو أحمد',
    nameEn: 'Abu Ahmad',
    age: 68,
    type: 'HbA1c screening',
    resultSummary: 'HbA1c 7.4%',
    plainLanguageExplanation: 'Fasting blood glucose marker over past 3 months shows elevated glycemic levels requiring clinical evaluation.',
    whatItDoesNotEstablish: 'Does not establish specific complications or replace clinical evaluation by an endocrinologist.',
    sourceNote: 'USPSTF Screening for Prediabetes and Type 2 Diabetes (2021)',
    resultDate: '2026-10-10',
    owner: 'Dr. Tariq (Simulated)',
    notificationSla: '24 hours',
    referralTarget: 'Endocrinology Clinic',
    referralStatus: 'completed',
    appointmentInfo: 'Scheduled for 2026-10-28 at 10:00 AM (Simulated)',
    status: 'closed',
    scenarioDescription: 'Full loop completed; notified; understanding confirmed by teach-back; endocrinology referral accepted; appointment arranged.',
    testOrder: {
      orderedBy: 'Dr. Tariq (Simulated)',
      orderedAt: '2026-10-09',
      reason: 'Routine diabetes screening per USPSTF criteria (age 68 with risk factors).'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Tariq (Simulated)',
      reviewedAt: '2026-10-10 13:30',
      decision: 'Abnormal result confirmed; patient notification, teach-back, and endocrinology referral initiated.'
    },
    closureEvidence: 'Teach-back recorded; referral accepted; patient confirmed appointment time.',
    teachBack: 'Patient correctly explained the 7.4% test reflects 3-month sugar averages and confirmed appointment details.',
    sbar: {
      situation: 'Abu Ahmad, 68yo, HbA1c 7.4% on routine screening.',
      background: 'No prior documented diabetic ketoacidosis; screening suggested follow-up.',
      assessment: 'Glycemic control requires specialist review; lifestyle and medical management planning.',
      recommendation: 'Endocrinology appointment booked; fasting glucose log initiated.'
    },
    timeline: [
      { id: '1', timestamp: '2026-10-10 09:15', title: 'Result Issued', detail: 'HbA1c 7.4% reported by lab.', actor: 'Clinical Laboratory' },
      { id: '2', timestamp: '2026-10-10 14:00', title: 'Patient Notified', detail: 'Coordinator called patient and explained test.', actor: 'Care Coordinator' },
      { id: '3', timestamp: '2026-10-10 14:20', title: 'Understanding Checked', detail: 'Teach-back completed successfully.', actor: 'Care Coordinator' },
      { id: '4', timestamp: '2026-10-11 11:00', title: 'Referral Accepted', detail: 'Endocrinology accepted referral.', actor: 'Endocrinology Clinic' },
      { id: '5', timestamp: '2026-10-12 10:30', title: 'Appointment Arranged', detail: 'Date confirmed with patient for Oct 28.', actor: 'Scheduling Desk' },
      { id: '6', timestamp: '2026-10-12 11:00', title: 'Case Closed', detail: 'Closed with documented completion evidence.', actor: 'Dr. Tariq' }
    ]
  },
  {
    id: 'RY-002',
    nameAr: 'أم سارة',
    nameEn: 'Um Sarah',
    age: 55,
    type: 'Mammogram',
    resultSummary: 'Finding that needs further assessment',
    plainLanguageExplanation: 'Mammogram identified a tissue density requiring diagnostic ultrasound and targeted views.',
    whatItDoesNotEstablish: 'Does not establish malignancy; most additional assessments represent benign changes.',
    sourceNote: 'USPSTF Breast Cancer: Screening (2024)',
    resultDate: '2026-10-02',
    owner: 'Dr. Mona (Simulated)',
    notificationSla: '48 hours',
    referralTarget: 'Breast Assessment Clinic',
    referralStatus: 'pending',
    appointmentInfo: 'Pending clinic intake response',
    status: 'overdue',
    scenarioDescription: 'Notified and understanding confirmed; referral to Breast Assessment Clinic pending beyond SLA; overdue demonstration case requiring escalation.',
    testOrder: {
      orderedBy: 'Dr. Mona (Simulated)',
      orderedAt: '2026-10-01',
      reason: 'Biennial breast cancer screening (USPSTF 2024, age 55).'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Mona (Simulated)',
      reviewedAt: '2026-10-02 16:00',
      decision: 'BI-RADS 0 — diagnostic assessment required; referral to Breast Assessment Clinic initiated.'
    },
    closureEvidence: undefined,
    teachBack: 'Patient understands that further diagnostic images are needed before any diagnosis is made.',
    sbar: {
      situation: 'Um Sarah, 55yo, screening mammogram requires further imaging assessment.',
      background: 'Notified promptly on day 2; referral transmitted to Breast Assessment Clinic.',
      assessment: 'Referral response exceeded 14-day SLA without confirmation.',
      recommendation: 'Immediate escalation to clinic lead coordinator.'
    },
    timeline: [
      { id: '1', timestamp: '2026-10-02 11:30', title: 'Result Issued', detail: 'Screening mammogram marked BI-RADS 0.', actor: 'Radiology Dept' },
      { id: '2', timestamp: '2026-10-03 10:00', title: 'Patient Notified', detail: 'Patient informed and reassured with teach-back.', actor: 'Nurse Navigator' },
      { id: '3', timestamp: '2026-10-03 14:00', title: 'Referral Sent', detail: 'Referral sent to Breast Assessment Clinic.', actor: 'Nurse Navigator' },
      { id: '4', timestamp: '2026-10-18 09:00', title: 'SLA Breached', detail: 'No intake confirmation received within target window.', actor: 'System Monitor' }
    ]
  },
  {
    id: 'RY-003',
    nameAr: 'خالد',
    nameEn: 'Khaled',
    age: 47,
    type: 'Blood pressure',
    resultSummary: '152/96 on repeat measurement',
    plainLanguageExplanation: 'Office blood pressure readings elevated on two separate measurements.',
    whatItDoesNotEstablish: 'Does not establish sustained hypertension without out-of-office confirmatory protocol.',
    sourceNote: 'USPSTF Hypertension in Adults: Screening (2021)',
    resultDate: '2026-09-20',
    owner: 'Dr. Faisal (Simulated)',
    notificationSla: '24 hours',
    referralTarget: 'Primary Care follow-up',
    referralStatus: 'completed',
    appointmentInfo: 'Follow-up visit completed on 2026-10-08',
    status: 'closed',
    scenarioDescription: 'Closed with documented evidence: two-week home blood pressure diary reviewed at a follow-up visit.',
    testOrder: {
      orderedBy: 'Occupational Health Program',
      orderedAt: '2026-09-20',
      reason: 'Workplace hypertension screening.'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Faisal (Simulated)',
      reviewedAt: '2026-09-20 14:00',
      decision: 'Elevated office readings; home blood-pressure diary protocol issued for confirmation.'
    },
    closureEvidence: 'Documented 14-day home BP log reviewed; average 128/82 mmHg; patient counseled.',
    teachBack: 'Patient demonstrated accurate cuff placement and twice-daily measurement logging.',
    timeline: [
      { id: '1', timestamp: '2026-09-20 08:30', title: 'Screening BP', detail: '152/96 mmHg noted at occupational health check.', actor: 'Clinic Nurse' },
      { id: '2', timestamp: '2026-09-20 15:00', title: 'Patient Notified', detail: 'Home BP protocol and log provided.', actor: 'Dr. Faisal' },
      { id: '3', timestamp: '2026-10-08 11:00', title: 'Follow-up Review', detail: 'Reviewed 2-week home log; average normal.', actor: 'Dr. Faisal' },
      { id: '4', timestamp: '2026-10-08 11:30', title: 'Case Closed', detail: 'Documented closure with evidence.', actor: 'Dr. Faisal' }
    ]
  },
  {
    id: 'RY-004',
    nameAr: 'مريم',
    nameEn: 'Mariam',
    age: 39,
    type: 'FIT',
    resultSummary: 'Positive',
    plainLanguageExplanation: 'Fecal immunochemical test detected microscopic traces of blood in sample.',
    whatItDoesNotEstablish: 'Does not establish cancer or polyp location; requires diagnostic colonoscopy.',
    sourceNote: 'USPSTF Colorectal Cancer: Screening (2021)',
    resultDate: '2026-10-18',
    owner: 'Dr. Layla (Simulated)',
    notificationSla: '24 hours',
    referralTarget: 'Gastroenterology (Endoscopy)',
    referralStatus: 'pending',
    appointmentInfo: 'Referral under review by GI department',
    status: 'on_track',
    scenarioDescription: 'Patient notified; gastroenterology referral for colonoscopy pending.',
    testOrder: {
      orderedBy: 'Dr. Layla (Simulated)',
      orderedAt: '2026-10-15',
      reason: 'Colorectal screening FIT issued under the screening pathway.'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Layla (Simulated)',
      reviewedAt: '2026-10-19 08:45',
      decision: 'Positive FIT confirmed; diagnostic colonoscopy referral initiated.'
    },
    timeline: [
      { id: '1', timestamp: '2026-10-18 16:45', title: 'Result Issued', detail: 'FIT positive result received.', actor: 'Clinical Laboratory' },
      { id: '2', timestamp: '2026-10-19 09:30', title: 'Patient Notified', detail: 'Explained need for diagnostic colonoscopy.', actor: 'Dr. Layla' },
      { id: '3', timestamp: '2026-10-19 11:00', title: 'Referral Transmitted', detail: 'Transmitted to Endoscopy triage.', actor: 'Care Coordinator' }
    ]
  },
  {
    id: 'RY-005',
    nameAr: 'سامي',
    nameEn: 'Sami',
    age: 61,
    type: 'HbA1c',
    resultSummary: '6.1%',
    plainLanguageExplanation: 'HbA1c falls within the prediabetes range (5.7% - 6.4%).',
    whatItDoesNotEstablish: 'Does not establish diabetes; indicates elevated risk where lifestyle interventions may help.',
    sourceNote: 'USPSTF Screening for Prediabetes and Type 2 Diabetes (2021)',
    resultDate: '2026-10-17',
    owner: 'Unassigned',
    notificationSla: '48 hours',
    referralTarget: 'Lifestyle & Wellness Program',
    referralStatus: 'none',
    appointmentInfo: 'Not scheduled',
    status: 'unassigned',
    scenarioDescription: 'No owner assigned; not notified four days after result; unassigned alert.',
    testOrder: {
      orderedBy: 'Diabetes Screening Program',
      orderedAt: '2026-10-16',
      reason: 'Prediabetes screening (USPSTF 2021).'
    },
    resultReview: { status: 'pending' },
    timeline: [
      { id: '1', timestamp: '2026-10-17 10:00', title: 'Result Issued', detail: 'HbA1c 6.1% uploaded to system.', actor: 'Lab Interface' },
      { id: '2', timestamp: '2026-10-21 08:00', title: 'Unassigned Flag', detail: 'No clinician claimed ownership for 4 days.', actor: 'System Monitor' }
    ]
  },
  {
    id: 'RY-006',
    nameAr: 'ليلى',
    nameEn: 'Laila',
    age: 44,
    type: 'Pap test',
    resultSummary: 'Low-grade changes',
    plainLanguageExplanation: 'Cervical cytology showed low-grade squamous intraepithelial lesion (LSIL).',
    whatItDoesNotEstablish: 'Does not indicate cervical cancer; often clears spontaneously but warrants specialist review.',
    sourceNote: 'Clinical cervical screening guidelines',
    resultDate: '2026-10-15',
    owner: 'Dr. Samar (Simulated)',
    notificationSla: '48 hours',
    referralTarget: 'Gynaecology Colposcopy Clinic',
    referralStatus: 'unknown',
    appointmentInfo: 'Verifying referral receipt with gynaecology desk',
    status: 'on_track',
    scenarioDescription: 'Notified and understanding confirmed; gynaecology referral status unknown and being verified.',
    testOrder: {
      orderedBy: 'Dr. Samar (Simulated)',
      orderedAt: '2026-10-14',
      reason: 'Routine cervical screening.'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Samar (Simulated)',
      reviewedAt: '2026-10-16 09:30',
      decision: 'LSIL confirmed; colposcopy referral initiated and teach-back completed.'
    },
    teachBack: 'Patient understands this is a pre-diagnostic change and agreed to colposcopy booking.',
    timeline: [
      { id: '1', timestamp: '2026-10-15 14:00', title: 'Result Issued', detail: 'Cytology reported LSIL.', actor: 'Pathology Lab' },
      { id: '2', timestamp: '2026-10-16 10:30', title: 'Patient Notified', detail: 'Discussed findings and teach-back verified.', actor: 'Dr. Samar' },
      { id: '3', timestamp: '2026-10-17 09:00', title: 'Referral Sent', detail: 'Referral queued for Gynaecology.', actor: 'Clinic Secretary' },
      { id: '4', timestamp: '2026-10-20 12:00', title: 'Verification Underway', detail: 'Coordinator following up on referral receipt.', actor: 'Care Coordinator' }
    ]
  },
  {
    id: 'RY-007',
    nameAr: 'عمر',
    nameEn: 'Omar',
    age: 58,
    type: 'LDCT',
    resultSummary: 'Small lung nodule, needs surveillance scan',
    plainLanguageExplanation: 'Low-dose CT identified an indeterminate 4mm pulmonary nodule requiring imaging follow-up.',
    whatItDoesNotEstablish: 'Does not establish malignancy; vast majority of small nodules are benign granulomas.',
    sourceNote: 'USPSTF Lung Cancer: Screening (2021)',
    resultDate: '2026-10-14',
    owner: 'Dr. Hisham (Simulated)',
    notificationSla: '48 hours',
    referralTarget: 'Pulmonology Surveillance',
    referralStatus: 'accepted',
    appointmentInfo: 'Surveillance low-dose CT booked in 6 months',
    status: 'on_track',
    scenarioDescription: 'Patient notified; surveillance scan scheduled.',
    testOrder: {
      orderedBy: 'Dr. Hisham (Simulated)',
      orderedAt: '2026-10-12',
      reason: 'Lung cancer screening — eligible smoking history (USPSTF 2021).'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Hisham (Simulated)',
      reviewedAt: '2026-10-15 09:00',
      decision: '4mm nodule — surveillance LDCT in 6 months per protocol; no invasive workup indicated.'
    },
    teachBack: 'Patient understands nodule is small and regular surveillance scan is the standard safe approach.',
    timeline: [
      { id: '1', timestamp: '2026-10-14 16:00', title: 'Scan Reported', detail: '4mm solid non-calcified nodule right upper lobe.', actor: 'Radiology' },
      { id: '2', timestamp: '2026-10-15 11:00', title: 'Patient Notified', detail: 'Phone consultation with Dr. Hisham.', actor: 'Dr. Hisham' },
      { id: '3', timestamp: '2026-10-16 14:00', title: 'Surveillance Booked', detail: 'Repeat low-dose CT scheduled for April 2027.', actor: 'Imaging Coordinator' }
    ]
  },
  {
    id: 'RY-008',
    nameAr: 'هند',
    nameEn: 'Hind',
    age: 52,
    type: 'Mammogram',
    resultSummary: 'Normal result',
    plainLanguageExplanation: 'Bilateral screening mammography demonstrated no suspicious masses, calcifications, or architectural distortion.',
    whatItDoesNotEstablish: 'Does not eliminate future risk; routine 2-year interval screening recommended.',
    sourceNote: 'USPSTF Breast Cancer: Screening (2024)',
    resultDate: '2026-10-12',
    owner: 'Dr. Mona (Simulated)',
    notificationSla: '7 days',
    referralTarget: 'None needed',
    referralStatus: 'not needed',
    appointmentInfo: 'Routine screening due October 2028',
    status: 'closed',
    scenarioDescription: 'Patient notified; no further action; documented closure.',
    testOrder: {
      orderedBy: 'Dr. Mona (Simulated)',
      orderedAt: '2026-10-10',
      reason: 'Biennial breast cancer screening (USPSTF 2024, age 52).'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Mona (Simulated)',
      reviewedAt: '2026-10-12 15:00',
      decision: 'BI-RADS 1 normal; routine 2-year recall.'
    },
    closureEvidence: 'Normal BI-RADS 1 report sent via secure portal; patient confirmation logged; case marked complete.',
    timeline: [
      { id: '1', timestamp: '2026-10-12 09:00', title: 'Result Issued', detail: 'BI-RADS 1 (Normal).', actor: 'Radiology' },
      { id: '2', timestamp: '2026-10-13 10:00', title: 'Patient Notified', detail: 'Results letter delivered via portal.', actor: 'System' },
      { id: '3', timestamp: '2026-10-13 11:00', title: 'Case Closed', detail: 'Documented closure with verified normal result.', actor: 'Dr. Mona' }
    ]
  },
  {
    id: 'RY-009',
    nameAr: 'يوسف',
    nameEn: 'Yousef',
    age: 70,
    type: 'FIT',
    resultSummary: 'Negative',
    plainLanguageExplanation: 'Annual fecal immunochemical test did not detect occult blood.',
    whatItDoesNotEstablish: 'Does not rule out non-bleeding lesions; routine annual repeat screening applies.',
    sourceNote: 'USPSTF Colorectal Cancer: Screening (2021)',
    resultDate: '2026-10-11',
    owner: 'Dr. Tariq (Simulated)',
    notificationSla: '7 days',
    referralTarget: 'None needed',
    referralStatus: 'not needed',
    appointmentInfo: 'Next FIT screening due October 2027',
    status: 'closed',
    scenarioDescription: 'Patient notified; documented closure.',
    testOrder: {
      orderedBy: 'Dr. Tariq (Simulated)',
      orderedAt: '2026-10-08',
      reason: 'Annual colorectal screening FIT (USPSTF 2021).'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Tariq (Simulated)',
      reviewedAt: '2026-10-11 17:00',
      decision: 'Negative FIT; routine annual recall in 12 months.'
    },
    closureEvidence: 'Negative FIT documented in EHR; patient notified via SMS; recall flag set for 12 months.',
    timeline: [
      { id: '1', timestamp: '2026-10-11 13:00', title: 'Result Issued', detail: 'FIT negative.', actor: 'Clinical Lab' },
      { id: '2', timestamp: '2026-10-12 09:30', title: 'Patient Notified', detail: 'SMS notification sent and confirmed delivered.', actor: 'Coordinator' },
      { id: '3', timestamp: '2026-10-12 10:00', title: 'Case Closed', detail: 'Documented closure completed.', actor: 'Dr. Tariq' }
    ]
  },
  {
    id: 'RY-010',
    nameAr: 'نور',
    nameEn: 'Nour',
    age: 33,
    type: 'HbA1c',
    resultSummary: 'Result received; intake incomplete',
    plainLanguageExplanation: 'Laboratory result received without complete patient demographic or registration file.',
    whatItDoesNotEstablish: 'Cannot verify clinical indications or past medical history until registration completes.',
    sourceNote: 'Clinical Laboratory Intake',
    resultDate: 'Not provided',
    owner: 'Unassigned',
    notificationSla: 'Not provided',
    referralTarget: 'Patient Intake Registration',
    referralStatus: 'unknown',
    appointmentInfo: 'Not scheduled - intake pending',
    status: 'unassigned',
    scenarioDescription: 'Case opened; intake details still missing.',
    timeline: [
      { id: '1', timestamp: 'Not provided', title: 'Incomplete Intake', detail: 'Test result flagged due to incomplete demographics.', actor: 'EHR Intake Service' }
    ]
  },
  {
    id: 'RY-011',
    nameAr: 'كريم',
    nameEn: 'Karim',
    age: 64,
    type: 'Blood pressure',
    resultSummary: '168/102 at screening',
    plainLanguageExplanation: 'Markedly elevated systolic and diastolic blood pressure recorded during initial health kiosk screening.',
    whatItDoesNotEstablish: 'Does not establish irreversible hypertension; requires urgent clinical evaluation and repeat measurement.',
    sourceNote: 'USPSTF Hypertension in Adults: Screening (2021)',
    resultDate: '2026-10-21',
    owner: 'Dr. Faisal (Simulated)',
    notificationSla: 'Same-day urgent',
    referralTarget: 'Rapid Access Primary Care',
    referralStatus: 'accepted',
    appointmentInfo: 'Urgent evaluation scheduled for tomorrow morning 09:00 AM',
    status: 'on_track',
    scenarioDescription: 'Patient notified the same day; urgent clinician review arranged. This is a synthetic demonstration of follow-up, not a diagnosis.',
    testOrder: {
      orderedBy: 'Health Kiosk Screening Program',
      orderedAt: '2026-10-21',
      reason: 'Community hypertension screening.'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Faisal (Simulated)',
      reviewedAt: '2026-10-21 13:30',
      decision: 'Markedly elevated reading; same-day notification and urgent next-morning evaluation booked.'
    },
    teachBack: 'Patient advised to rest, avoid strenuous exertion, and report any headache or chest symptoms immediately.',
    timeline: [
      { id: '1', timestamp: '2026-10-21 11:15', title: 'High Reading Flagged', detail: 'BP 168/102 mmHg at screening.', actor: 'Health Kiosk' },
      { id: '2', timestamp: '2026-10-21 12:00', title: 'Same-Day Notification', detail: 'Nurse called patient immediately.', actor: 'Triage Nurse' },
      { id: '3', timestamp: '2026-10-21 14:30', title: 'Urgent Slot Booked', detail: 'Booked next-morning priority evaluation.', actor: 'Dr. Faisal' }
    ]
  },
  {
    id: 'RY-012',
    nameAr: 'سارة',
    nameEn: 'Sara',
    age: 49,
    type: 'Mammogram',
    resultSummary: 'Finding that needs further assessment',
    plainLanguageExplanation: 'Routine screening mammogram showed an asymmetrical focal density.',
    whatItDoesNotEstablish: 'Does not establish malignancy; further diagnostic ultrasound is required.',
    sourceNote: 'USPSTF Breast Cancer: Screening (2024)',
    resultDate: '2026-10-20',
    owner: 'Dr. Mona (Simulated)',
    notificationSla: '48 hours',
    referralTarget: 'Diagnostic Breast Imaging',
    referralStatus: 'pending',
    appointmentInfo: 'Referral packet in preparation',
    status: 'on_track',
    scenarioDescription: 'Patient notified; referral being prepared.',
    testOrder: {
      orderedBy: 'Dr. Mona (Simulated)',
      orderedAt: '2026-10-19',
      reason: 'Biennial breast cancer screening (USPSTF 2024, age 49).'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Mona (Simulated)',
      reviewedAt: '2026-10-21 08:30',
      decision: 'Asymmetrical focal density — diagnostic imaging referral being prepared.'
    },
    timeline: [
      { id: '1', timestamp: '2026-10-20 15:30', title: 'Result Issued', detail: 'Further imaging recommended.', actor: 'Radiology' },
      { id: '2', timestamp: '2026-10-21 10:00', title: 'Patient Notified', detail: 'Patient informed and referral initiated.', actor: 'Dr. Mona' }
    ]
  },
  {
    id: 'RY-013',
    nameAr: 'محمود',
    nameEn: 'Mahmoud',
    age: 68,
    type: 'Post-discharge follow-up',
    resultSummary: 'Discharge plan issued after a nine-day hospital stay; medication list needs daily adherence follow-up.',
    plainLanguageExplanation: 'Patient discharged home following treatment for severe chest infection. Requires adherence monitoring for 4 discharge medications.',
    whatItDoesNotEstablish: 'Does not establish complete resolution of lung infection; requires clinical review and pending blood test.',
    sourceNote: 'Hospital Discharge Summary (Synthetic Demo Case)',
    resultDate: '2026-10-20',
    owner: 'Nurse Sarah (Simulated)',
    notificationSla: 'Daily check-in',
    referralTarget: 'Outpatient Respiratory Clinic',
    referralStatus: 'accepted',
    appointmentInfo: 'Follow-up appointment in 7 days (2026-10-27)',
    status: 'on_track',
    scenarioDescription: 'On track. Use the same fictional Mahmoud as in Tab 2, Phase 3.',
    testOrder: {
      orderedBy: 'Ward 4 Discharge Team',
      orderedAt: '2026-10-20',
      reason: 'Post-discharge follow-up plan after a 9-day stay for chest infection.'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Nurse Sarah (Simulated)',
      reviewedAt: '2026-10-21 09:00',
      decision: 'Daily adherence check-ins active; clinic follow-up in 7 days; pending blood test tracked.'
    },
    sbar: {
      situation: 'Mahmoud, 68yo, home post 9-day stay for chest infection.',
      background: 'Prescribed Amoxicillin, Paracetamol, Omeprazole, Salbutamol.',
      assessment: 'Recovering at home; 1 blood test result pending in 3 days; daily check-in active.',
      recommendation: 'Track daily recovery metrics; attend clinic follow-up in 7 days.'
    },
    timeline: [
      { id: '1', timestamp: '2026-10-20 12:00', title: 'Discharged Home', detail: 'Discharge summary handed to patient with 4 medications.', actor: 'Ward 4 Team' },
      { id: '2', timestamp: '2026-10-21 10:00', title: 'First Day Check-in', detail: 'Medications logged as taken; breathing stable.', actor: 'Nurse Sarah' }
    ]
  },
  {
    id: 'RY-014',
    nameAr: 'سعاد',
    nameEn: 'Souad',
    age: 59,
    type: 'Post-discharge follow-up',
    resultSummary: 'Follow-up appointment referral sent six days ago, not yet accepted.',
    plainLanguageExplanation: 'Post-discharge surgical follow-up referral transmitted to outpatient surgical clinic but no acceptance logged.',
    whatItDoesNotEstablish: 'Does not indicate surgical complication; indicates administrative delay in scheduling wound check.',
    sourceNote: 'Post-discharge Care Coordination',
    resultDate: '2026-10-15',
    owner: 'Dr. Kareem (Simulated)',
    notificationSla: '3 days',
    referralTarget: 'Outpatient Surgical Clinic',
    referralStatus: 'pending',
    appointmentInfo: 'Awaiting clinic scheduling response',
    status: 'overdue',
    scenarioDescription: 'Overdue demonstration case requiring escalation.',
    testOrder: {
      orderedBy: 'Ward 4 Discharge Team',
      orderedAt: '2026-10-15',
      reason: 'Post-discharge surgical wound-check follow-up.'
    },
    resultReview: {
      status: 'completed',
      reviewedBy: 'Dr. Kareem (Simulated)',
      reviewedAt: '2026-10-15 15:00',
      decision: 'Surgical follow-up referral sent to outpatient clinic; acceptance pending.'
    },
    timeline: [
      { id: '1', timestamp: '2026-10-15 11:00', title: 'Referral Sent', detail: 'Discharge follow-up referral dispatched.', actor: 'Ward Coordinator' },
      { id: '2', timestamp: '2026-10-18 11:00', title: 'SLA Elapsed', detail: 'No appointment confirmed within 3-day target.', actor: 'System Monitor' },
      { id: '3', timestamp: '2026-10-21 09:00', title: 'Overdue Flag', detail: '6 days elapsed without acceptance; escalation required.', actor: 'Care Coordinator' }
    ]
  },
  {
    id: 'RY-015',
    nameAr: 'طارق',
    nameEn: 'Tarek',
    age: 63,
    type: 'Post-discharge follow-up',
    resultSummary: 'Kidney function test taken four days ago; result not yet issued.',
    plainLanguageExplanation: 'Serum creatinine and electrolytes sample drawn at discharge lab draw is pending final laboratory release.',
    whatItDoesNotEstablish: 'Does not establish renal impairment; result is still being processed.',
    sourceNote: 'Clinical Chemistry Laboratory',
    resultDate: 'Not yet issued (taken 4 days ago)',
    owner: 'Dr. Tariq (Simulated)',
    notificationSla: 'Within 24 hours of result release',
    referralTarget: 'Nephrology review if GFR < 60',
    referralStatus: 'none',
    appointmentInfo: 'Dependent on lab release',
    status: 'on_track',
    scenarioDescription: 'Result pending; patient not yet notified.',
    testOrder: {
      orderedBy: 'Dr. Tariq (Simulated)',
      orderedAt: '2026-10-18',
      reason: 'Discharge renal function panel (creatinine and electrolytes).'
    },
    resultReview: { status: 'pending' },
    timeline: [
      { id: '1', timestamp: '2026-10-18 08:30', title: 'Blood Drawn', detail: 'Electrolytes and renal panel drawn at discharge.', actor: 'Phlebotomy' },
      { id: '2', timestamp: '2026-10-21 10:00', title: 'Status Checked', detail: 'Sample in progress; patient not yet notified.', actor: 'Dr. Tariq' }
    ]
  }
];

// Apply the Arabic display overlay so the Arabic UI shows Arabic case
// narratives (English fields remain canonical and unchanged).
for (const c of INITIAL_SEED_CASES) {
  const o = SEED_CASES_AR[c.id];
  if (!o) continue;
  c.typeAr = o.typeAr;
  c.resultSummaryAr = o.resultSummaryAr;
  c.plainLanguageExplanationAr = o.plainLanguageExplanationAr;
  c.whatItDoesNotEstablishAr = o.whatItDoesNotEstablishAr;
  c.scenarioDescriptionAr = o.scenarioDescriptionAr;
  c.referralTargetAr = o.referralTargetAr;
  c.appointmentInfoAr = o.appointmentInfoAr;
  c.notificationSlaAr = o.notificationSlaAr;
  c.resultDateAr = o.resultDateAr;
  c.closureEvidenceAr = o.closureEvidenceAr;
  c.teachBackAr = o.teachBackAr;
  if (o.sbarAr) c.sbarAr = o.sbarAr;
  if (o.testOrderAr && c.testOrder) {
    c.testOrder.orderedByAr = o.testOrderAr.orderedByAr;
    c.testOrder.reasonAr = o.testOrderAr.reasonAr;
  }
  if (o.resultReviewAr && c.resultReview) {
    c.resultReview.reviewedByAr = o.resultReviewAr.reviewedByAr;
    c.resultReview.decisionAr = o.resultReviewAr.decisionAr;
  }
  c.timeline = c.timeline.map((e) => {
    const t = o.timelineAr[e.id];
    return t ? { ...e, titleAr: t.titleAr, detailAr: t.detailAr } : e;
  });
}
