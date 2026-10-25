// Unit checks for the verified lab reference module.
import {
  LAB_ENTRIES, findLabInText, findUncoveredLab, hasLabIntent, isDefinitionQuestion,
  normalizeDigits, extractValue, toCanonical, compareBand, detectVariantOrSex,
} from '../src/utils/labReference.ts';

let passed = 0, failed = 0;
function check(name: string, cond: boolean) {
  if (cond) { passed++; console.log('PASS ', name); }
  else { failed++; console.log('FAIL ', name); }
}

const entry = (id: string) => LAB_ENTRIES.find((e) => e.id === id)!;
const bandKind = (id: string, setKey: string, canonical: number) => {
  const set = entry(id).bandSets.find((s) => s.key === setKey)!;
  return compareBand(set, canonical).kind;
};

// Digits & value extraction
check('arabic-indic digits normalize', normalizeDigits('٥.٦') === '5.6');
check('arabic decimal separator', extractValue('القيمة ٥٫٦') === 5.6);
check('value with thousands comma', extractValue('الكريات 11,000') === 11000);
check('no value → null', extractValue('ما في رقم هون') === null);

// Detection
check('glucose alias + arabic value', (() => { const h = findLabInText('السكر ٥.٦'); return h?.entry.id === 'glucose' && h.value === 5.6; })());
check('fasting variant detected', findLabInText('سكر صائم 130')?.bandSetKey === 'fasting');
check('random variant detected', findLabInText('سكر عشوائي 180')?.bandSetKey === 'random');
check('a1c alias', findLabInText('التراكمي ٦.٢')?.entry.id === 'hba1c');
check('hemoglobin female', (() => { const h = findLabInText('الهيموغلوبين 11.5 لامرأة'); return h?.entry.id === 'hemoglobin' && h.bandSetKey === 'female'; })());
check('hemoglobin sex ambiguous without sex', findLabInText('الهيموغلوبين 14')?.sexAmbiguous === true);
check('creatinine alias', findLabInText('الكرياتينين 1.6')?.entry.id === 'creatinine');
check('potassium alias', findLabInText('البوتاسيوم 5.6')?.entry.id === 'potassium');
check('wbc alias', findLabInText('الكريات البيضاء 8500')?.entry.id === 'wbc');
check('platelets alias', findLabInText('الصفائح 120')?.entry.id === 'platelets');
check('tsh alias latin', findLabInText('TSH 7.2')?.entry.id === 'tsh');
check('no lab → null', findLabInText('كيف الطقس اليوم') === null);
check('variant answer resolves from own message', detectVariantOrSex(entry('glucose'), 'صائم') === 'fasting');
check('sex answer resolves from own message', detectVariantOrSex(entry('hemoglobin'), 'لامرأة') === 'female');

// Unit conversion heuristics
check('glucose 5.6 → mmol heuristic → 100.8 mg/dL', Math.abs(toCanonical(entry('glucose'), 5.6, 'السكر ٥.٦').value - 100.8) < 0.01);
check('glucose 130 stays mg/dL', toCanonical(entry('glucose'), 130, 'سكر صائم 130').value === 130);
check('creatinine 100 → µmol heuristic', Math.abs(toCanonical(entry('creatinine'), 100, 'كرياتينين 100').value - 100 / 88.4) < 0.001);
check('hemoglobin 115 g/L → 11.5', toCanonical(entry('hemoglobin'), 115, 'هيموغلوبين 115').value === 11.5);
check('wbc 8500 per µL → 8.5', toCanonical(entry('wbc'), 8500, '8500').value === 8.5);

// Band placement (canonical values)
check('fasting 100.8 → borderline (prediabetes)', bandKind('glucose', 'fasting', 100.8) === 'borderline');
check('fasting 95 → normal', bandKind('glucose', 'fasting', 95) === 'normal');
check('fasting 65 → low', bandKind('glucose', 'fasting', 65) === 'low');
check('fasting 130 → high (diabetes range)', bandKind('glucose', 'fasting', 130) === 'high');
check('random 150 → borderline', bandKind('glucose', 'random', 150) === 'borderline');
check('random 210 → high', bandKind('glucose', 'random', 210) === 'high');
check('a1c 5.6 → normal', bandKind('hba1c', 'default', 5.6) === 'normal');
check('a1c 6.0 → borderline', bandKind('hba1c', 'default', 6.0) === 'borderline');
check('a1c 6.5 → high', bandKind('hba1c', 'default', 6.5) === 'high');
check('hemoglobin F 11.5 → low', bandKind('hemoglobin', 'female', 11.5) === 'low');
check('hemoglobin M 15 → normal', bandKind('hemoglobin', 'male', 15) === 'normal');
check('creatinine M 1.6 → high', bandKind('creatinine', 'male', 1.6) === 'high');
check('creatinine F 0.9 → normal', bandKind('creatinine', 'female', 0.9) === 'normal');
check('potassium 5.6 → high', bandKind('potassium', 'default', 5.6) === 'high');
check('potassium 4.2 → normal', bandKind('potassium', 'default', 4.2) === 'normal');
check('sodium 130 → low', bandKind('sodium', 'default', 130) === 'low');
check('wbc 8.5 → normal', bandKind('wbc', 'default', 8.5) === 'normal');
check('wbc 15 → high', bandKind('wbc', 'default', 15) === 'high');
check('platelets 120 → low', bandKind('platelets', 'default', 120) === 'low');
check('tsh 7 → high', bandKind('tsh', 'default', 7) === 'high');
check('tsh 2 → normal', bandKind('tsh', 'default', 2) === 'normal');

// Intent / uncovered / definition guards
check('labs starter has intent', hasLabIntent('أريد فهم نتيجة تحليل أو تقرير طبي خاص فيني'));
check('uncovered vitamin D detected', findUncoveredLab('فيتامين د 25')?.nameEn === 'Vitamin D');
check('uncovered cholesterol detected', findUncoveredLab('الكولسترول 240')?.nameEn === 'Cholesterol');
check('definition question detected', isDefinitionQuestion('شو هو مرض السكري؟'));
check('plain statement is not a definition question', !isDefinitionQuestion('السكر ٥.٦'));

console.log(`\nTOTAL: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
