import { ChecklistItem, MedicationItem } from '../types';

export const INITIAL_BEFORE_CHECKLIST: ChecklistItem[] = [
  {
    id: 'check-1',
    textAr: 'إعداد قائمة كاملة بالأدوية الحالية والجرعات المحددة',
    textEn: 'Prepare a list of current medications and doses.',
    completed: false
  },
  {
    id: 'check-2',
    textAr: 'إعداد قائمة بالحساسية المعروفة تجاه الأدوية أو الأطعمة أو المواد',
    textEn: 'Prepare a list of known allergies.',
    completed: false
  },
  {
    id: 'check-3',
    textAr: 'تجهيز وثائق إثبات الهوية والتأمين الصحي (إن وجدت)',
    textEn: 'Prepare identification and insurance documents, if applicable.',
    completed: false
  },
  {
    id: 'check-4',
    textAr: 'تسجيل أسماء وأرقام المتخصصين الصحيين المعتادين المتابعين لحالتك',
    textEn: 'Record the names of usual healthcare professionals.',
    completed: false
  },
  {
    id: 'check-5',
    textAr: 'كتابة الأسئلة والاستفسارات لطرحها على الفريق الطبي',
    textEn: 'Write down questions to ask the care team.',
    completed: false
  },
  {
    id: 'check-6',
    textAr: 'طلب تعليمات فردية من الفريق الطبي بشأن الصيام وتناول الأدوية قبل الإجراء المخطط',
    textEn: 'Ask the care team for individualized instructions about fasting and medication before a planned procedure.',
    completed: false
  }
];

export const DURING_HOSPITAL_POINTS = [
  {
    id: 'point-1',
    titleAr: 'اسأل عن الغرض من كل دواء وفحص',
    titleEn: 'Ask what each medication and investigation is for',
    descAr: 'استفسر دائماً عن سبب إضافة أي علاج جديد أو طلب فحص دم أو أشعة وما يتوقعه الفريق من نتائجه.',
    descEn: 'Inquire whenever a medication or test is ordered, understanding what it treats and what results are expected.'
  },
  {
    id: 'point-2',
    titleAr: 'دوّن أسئلتك فور خطورها في ذهنك',
    titleEn: 'Write down questions as they arise',
    descAr: 'استخدم دفتر الملاحظات المرفق لتدوين أي استفسار حتى تكون مستعداً عند مرور الطبيب أو الممرض.',
    descEn: 'Capture thoughts in your notepad immediately so you can discuss them calmly during doctor rounds.'
  },
  {
    id: 'point-3',
    titleAr: 'بلّغ فوراً عن أي أعراض جديدة أو مقلقة',
    titleEn: 'Report new or worrying symptoms promptly',
    descAr: 'لا تنتظر الجولة الصباحية أو المسائية إذا شعرت بألم متزايد أو ضيق؛ اضغط زر استدعاء التمريض في الحال.',
    descEn: 'Do not wait for scheduled rounds if you experience pain, dizziness, or shortness of breath; alert staff immediately.'
  },
  {
    id: 'point-4',
    titleAr: 'اعرف من هو المسؤول عن رعايتك اليوم',
    titleEn: 'Ask who is responsible for your care today',
    descAr: 'تعرف على الطبيب المعالج وممرضك المباشر في بداية كل وردية لضمان متابعة مستمرة وواضحة.',
    descEn: 'Identify the on-duty bedside nurse and primary attending clinician managing your room today.'
  }
];

export const MAHMOUD_DISCHARGE_MEDS: MedicationItem[] = [
  {
    id: 'med-amox',
    name: 'Amoxicillin',
    dose: '500 mg',
    scheduleAr: 'ثلاث مرات يومياً (متبقي 5 أيام)',
    scheduleEn: 'Three times daily (5 days remaining)',
    remainingDays: 5,
    isPRN: false,
    doses: [
      { id: '1', labelAr: 'الجرعة الأولى', labelEn: 'Dose 1', timeHintAr: 'صباحاً (مع الإفطار)', timeHintEn: 'Morning (with breakfast)' },
      { id: '2', labelAr: 'الجرعة الثانية', labelEn: 'Dose 2', timeHintAr: 'ظهراً (مع الغداء)', timeHintEn: 'Midday (with lunch)' },
      { id: '3', labelAr: 'الجرعة الثالثة', labelEn: 'Dose 3', timeHintAr: 'مساءً (مع العشاء)', timeHintEn: 'Evening (with dinner)' },
    ]
  },
  {
    id: 'med-para',
    name: 'Paracetamol',
    dose: '1 g',
    scheduleAr: 'حتى ثلاث مرات يومياً عند اللزوم',
    scheduleEn: 'Up to three times daily as needed',
    isPRN: true,
    specificWarningAr: 'تنبيه: أدوية أخرى قد تحتوي على الباراسيتامول نفسه — لا تتجاوز الحد اليومي في وصفتك',
    specificWarningEn: 'Notice: Other medications may contain paracetamol as well — do not exceed the daily limit in your prescription.'
  },
  {
    id: 'med-omep',
    name: 'Omeprazole',
    dose: '20 mg',
    scheduleAr: 'مرة واحدة يومياً صباحاً',
    scheduleEn: 'Once daily in the morning',
    isPRN: false,
    doses: [
      { id: '1', labelAr: 'جرعة الصباح', labelEn: 'Morning Dose', timeHintAr: 'قبل الإفطار بنصف ساعة', timeHintEn: '30 min before breakfast' }
    ]
  },
  {
    id: 'med-salb',
    name: 'Salbutamol Inhaler',
    dose: '100 mcg (2 puffs)',
    scheduleAr: 'بختان عند اللزوم',
    scheduleEn: 'Two puffs as needed',
    isPRN: true,
    specificWarningAr: 'إذا ازداد احتياجك للبخاخ أو لم يخفّ ضيق النفس بعده، تواصل مع فريقك الطبي فوراً',
    specificWarningEn: 'If your need for the inhaler increases or shortness of breath is not relieved after using it, contact your healthcare team immediately.'
  }
];
