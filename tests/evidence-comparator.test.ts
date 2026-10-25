/**
 * Evidence Comparator suite — INDEPENDENT from the 428 base checks.
 * Run: node --experimental-strip-types tests/evidence-comparator.test.ts
 *
 * These tests verify the comparator's behaviour over the loaded evidence
 * pack: source integrity, computed relations for the two real multi-source
 * topics, the insufficient-evidence state for single-source topics, the
 * user's computed position vs each source, and — via a clearly labelled
 * SYNTHETIC fixture — the potential-conflict branch. The synthetic fixture
 * is fabricated test data, NOT real medical evidence; passing it proves
 * the classifier handles that constructed case as designed, nothing more.
 */
import assert from 'node:assert/strict';
import {
  EVIDENCE_CLAIMS,
  classifyClaims,
  compareTopic,
  userPosition,
  type EvidenceClaim,
} from '../src/utils/evidenceComparator.ts';
import type { ScreeningInputs } from '../src/types';

let passed = 0;
const t = (name: string, fn: () => void) => {
  fn();
  passed++;
  console.log(`ok ${passed} - ${name}`);
};

const who = (topic: string, org: string) =>
  EVIDENCE_CLAIMS.find((c) => c.topic === topic && c.org === org && c.aspect === 'who')!;

// ---------------------------------------------------------- source integrity
t('diabetes loads two who-claims from two independent orgs (USPSTF + ADA)', () => {
  const claims = EVIDENCE_CLAIMS.filter((c) => c.topic === 'diabetes' && c.aspect === 'who');
  assert.equal(claims.length, 2);
  assert.deepEqual(claims.map((c) => c.org).sort(), ['ADA', 'USPSTF']);
});

t('colorectal loads two who-claims plus one complementary how-claim', () => {
  const all = EVIDENCE_CLAIMS.filter((c) => c.topic === 'colorectal');
  assert.equal(all.filter((c) => c.aspect === 'who').length, 2);
  assert.equal(all.filter((c) => c.aspect === 'how').length, 1);
});

t('every claim carries a real https source and bilingual claim/supports/limits', () => {
  for (const c of EVIDENCE_CLAIMS) {
    assert.ok(c.sourceUrl.startsWith('https://'), c.id);
    assert.ok(c.claimAr.length > 20 && c.claimEn.length > 20, c.id);
    assert.ok(c.supportsAr.length > 10 && c.supportsEn.length > 10, c.id);
    assert.ok(c.limitsAr.length > 10 && c.limitsEn.length > 10, c.id);
  }
});

t('ADA diabetes tags match Table 2.5 as read: start 35, no upper limit, no weight condition, risk arm present', () => {
  const ada = who('diabetes', 'ADA');
  assert.equal(ada.ageMin, 35);
  assert.equal(ada.ageMax, null);
  assert.equal(ada.weightRequired, false);
  assert.equal(ada.hasRiskBasedArm, true);
  assert.equal(ada.sourceYear, '2026');
});

t('USPSTF diabetes tags match the 2021 recommendation: 35-70 with overweight required', () => {
  const u = who('diabetes', 'USPSTF');
  assert.equal(u.ageMin, 35);
  assert.equal(u.ageMax, 70);
  assert.equal(u.weightRequired, true);
});

// ------------------------------------------------------ computed relations
t('diabetes relation is COMPUTED as scope_difference (age cap + weight condition), overlap 35-70', () => {
  const r = compareTopic('diabetes');
  assert.equal(r.relation, 'scope_difference');
  assert.deepEqual(r.overlap, { min: 35, max: 70 });
  assert.ok(r.differences.includes('age_max'));
  assert.ok(r.differences.includes('weight_condition'));
  assert.ok(!r.differences.includes('age_min'));
});

t('colorectal relation is COMPUTED as compatible: identical bands, no differences, overlap 45-75', () => {
  const r = compareTopic('colorectal');
  assert.equal(r.relation, 'compatible');
  assert.equal(r.differences.length, 0);
  assert.deepEqual(r.overlap, { min: 45, max: 75 });
});

t('a who-claim vs a how-claim classifies as complementary', () => {
  const howClaim = EVIDENCE_CLAIMS.find((c) => c.topic === 'colorectal' && c.aspect === 'how')!;
  assert.equal(classifyClaims(who('colorectal', 'USPSTF'), howClaim).relation, 'complementary');
});

t('single-source topics honestly report insufficient_evidence', () => {
  for (const topic of ['breast', 'hypertension', 'lung']) {
    const r = compareTopic(topic);
    assert.equal(r.relation, 'insufficient_evidence', topic);
    assert.ok(r.claims.length <= 1, topic);
  }
});

// ------------------------------------------- SYNTHETIC conflict fixture
// SYNTHETIC TEST CASE — NOT REAL MEDICAL EVIDENCE. Two fabricated claims
// with identical scopes and opposite directions exist only to prove the
// potential_conflict branch fires as designed.
const syntheticBase: Omit<EvidenceClaim, 'id' | 'direction'> = {
  topic: 'synthetic',
  org: 'SYNTHETIC',
  sourceTitle: 'SYNTHETIC FIXTURE — not a real source',
  sourceYear: '',
  sourceUrl: 'https://example.invalid/synthetic-fixture',
  aspect: 'who',
  ageMin: 40,
  ageMax: 60,
  individualizedMin: null,
  individualizedMax: null,
  weightRequired: false,
  hasRiskBasedArm: false,
  claimAr: 'ادعاء اصطناعي للاختبار فقط',
  claimEn: 'Synthetic claim for testing only',
  supportsAr: 'لا يدعم شيئاً — بيانات اختبار',
  supportsEn: 'Supports nothing — test data',
  limitsAr: 'ليس دليلاً طبياً حقيقياً',
  limitsEn: 'Not real medical evidence',
};

t('SYNTHETIC fixture: same scope + opposite directions -> potential_conflict', () => {
  const a: EvidenceClaim = { ...syntheticBase, id: 'syn-a', direction: 'recommends' };
  const b: EvidenceClaim = { ...syntheticBase, id: 'syn-b', direction: 'not_recommends' };
  assert.equal(classifyClaims(a, b).relation, 'potential_conflict');
});

t('SYNTHETIC fixture: opposite directions on disjoint scopes -> scope_difference, not conflict', () => {
  const a: EvidenceClaim = { ...syntheticBase, id: 'syn-c', direction: 'recommends' };
  const b: EvidenceClaim = { ...syntheticBase, id: 'syn-d', direction: 'not_recommends', ageMin: 70, ageMax: 80 };
  assert.equal(classifyClaims(a, b).relation, 'scope_difference');
});

t('no REAL loaded pair classifies as potential_conflict (regression guard)', () => {
  for (const topic of ['diabetes', 'colorectal']) {
    assert.notEqual(compareTopic(topic).relation, 'potential_conflict', topic);
  }
});

// ------------------------------------------------------------ user position
const inputs = (over: Partial<ScreeningInputs>): ScreeningInputs => ({ ...over }) as ScreeningInputs;

t('diabetes position: age 40 + overweight -> inside BOTH sources (the agreement zone)', () => {
  const inp = inputs({ age: 40, hasOverweightObesity: 'yes' });
  assert.equal(userPosition(who('diabetes', 'USPSTF'), inp), 'inside_scope');
  assert.equal(userPosition(who('diabetes', 'ADA'), inp), 'inside_scope');
});

t('diabetes position: age 40 + NO overweight -> outside USPSTF, inside ADA (the scope difference, personalised)', () => {
  const inp = inputs({ age: 40, hasOverweightObesity: 'no' });
  assert.equal(userPosition(who('diabetes', 'USPSTF'), inp), 'outside_scope');
  assert.equal(userPosition(who('diabetes', 'ADA'), inp), 'inside_scope');
});

t('diabetes position: age 72 -> outside USPSTF cap, inside ADA (no cap)', () => {
  const inp = inputs({ age: 72, hasOverweightObesity: 'yes' });
  assert.equal(userPosition(who('diabetes', 'USPSTF'), inp), 'outside_scope');
  assert.equal(userPosition(who('diabetes', 'ADA'), inp), 'inside_scope');
});

t('diabetes position: age 30 + overweight -> USPSTF outside; ADA unknown (risk arm needs factors we do not collect)', () => {
  const inp = inputs({ age: 30, hasOverweightObesity: 'yes' });
  assert.equal(userPosition(who('diabetes', 'USPSTF'), inp), 'outside_scope');
  assert.equal(userPosition(who('diabetes', 'ADA'), inp), 'unknown');
});

t('colorectal position: 50 average-risk inside both; 80 individualized in both; symptoms -> outside the average-risk claims', () => {
  const ok = inputs({ age: 50, hasColorectalSymptomsOrHighRisk: 'no' });
  assert.equal(userPosition(who('colorectal', 'USPSTF'), ok), 'inside_scope');
  assert.equal(userPosition(who('colorectal', 'ACS'), ok), 'inside_scope');
  const old = inputs({ age: 80, hasColorectalSymptomsOrHighRisk: 'no' });
  assert.equal(userPosition(who('colorectal', 'USPSTF'), old), 'individualized_zone');
  assert.equal(userPosition(who('colorectal', 'ACS'), old), 'individualized_zone');
  const sym = inputs({ age: 50, hasColorectalSymptomsOrHighRisk: 'yes' });
  assert.equal(userPosition(who('colorectal', 'USPSTF'), sym), 'outside_scope');
});

t("weight answered 'unknown' stays unknown — never collapsed into outside_scope", () => {
  const inp = inputs({ age: 40, hasOverweightObesity: 'unknown' });
  assert.equal(userPosition(who('diabetes', 'USPSTF'), inp), 'unknown');
  const young = inputs({ age: 30, hasOverweightObesity: 'unknown' });
  assert.equal(userPosition(who('diabetes', 'ADA'), young), 'unknown');
});

t('position is unknown — never guessed — when age is missing', () => {
  assert.equal(userPosition(who('diabetes', 'ADA'), inputs({})), 'unknown');
  assert.equal(userPosition(who('colorectal', 'ACS'), inputs({})), 'unknown');
});

console.log(`\n${passed} evidence-comparator tests passed`);
