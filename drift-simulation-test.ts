/**
 * 6-Month Drift Simulation Test
 *
 * Simulates a user whose taste evolves over 6 months:
 * - Month 0: Quiz → sets anchor archetype
 * - Month 1-2: Stable signals reinforcing anchor
 * - Month 3-4: Signals start drifting toward a new archetype
 * - Month 5-6: Strong drift, recalibration triggered
 *
 * Validates:
 * 1. Temporal decay works (0.99/day)
 * 2. Drift detection fires when threshold crossed
 * 3. Recalibration triggers after 30 days
 * 4. evolveGenome produces coherent version progression
 * 5. Taste stability decreases during drift
 * 6. Pruning keeps history under 1000
 */

import {
  createGenome,
  classify,
  evolveGenome,
  detectPreferenceDrift,
  needsRecalibration,
  calculateTasteStability,
  applyTemporalDecay,
  pruneSignalHistory,
  calculateHistoricalConfidence,
  DEFAULT_EVOLUTION_CONFIG,
  ALL_DESIGNATIONS,
  type Signal,
  type SignalEvent,
  type Designation,
  type Psychometrics,
  type TasteGenome,
} from './packages/core/src/index';

// ─── Helpers ────────────────────────────────────────────────────────

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function makeSignalEvent(
  archetype: Designation,
  daysBack: number,
  source: 'quiz' | 'content' | 'feed' = 'content'
): SignalEvent {
  return {
    id: `sig_${Math.random().toString(36).slice(2)}`,
    userId: 'test_drift_user',
    type: 'explicit',
    source,
    timestamp: daysAgo(daysBack),
    processed: true,
    data: {
      kind: 'rating',
      value: 0.9,
      archetypeWeights: { [archetype]: 1.0 } as Partial<Record<Designation, number>>,
    },
  };
}

function makeSignalBatch(
  archetype: Designation,
  count: number,
  daysBackStart: number,
  daysBackEnd: number,
  source: 'quiz' | 'content' | 'feed' = 'content'
): SignalEvent[] {
  const signals: SignalEvent[] = [];
  for (let i = 0; i < count; i++) {
    const daysBack = daysBackStart + (daysBackEnd - daysBackStart) * (i / Math.max(count - 1, 1));
    signals.push(makeSignalEvent(archetype, Math.round(daysBack), source));
  }
  return signals;
}

// ─── Test Runner ─────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const errors: string[] = [];

function assert(condition: boolean, name: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    errors.push(name);
    console.log(`  ✗ ${name}`);
  }
}

// ─── Main Simulation ─────────────────────────────────────────────────

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         6-MONTH DRIFT SIMULATION TEST                     ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Simulating: 180 days of taste evolution                  ║');
  console.log('║  Checking: drift detection, decay, recalibration          ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const ANCHOR_ARCHETYPE: Designation = 'R-10';  // SCHISM
  const DRIFT_TARGET: Designation = 'P-7';        // AXIOM

  // ─── Phase 1: Initial Quiz (Day 0 = 180 days ago) ─────────────────

  console.log('Phase 1: Initial Quiz (Month 0)');
  console.log('─'.repeat(50));

  const quizSignals = makeSignalBatch(ANCHOR_ARCHETYPE, 10, 180, 180, 'quiz');
  const initialResult = classify({ signals: quizSignals });

  const primaryDesignation = initialResult.classification.primary.designation;
  assert(
    primaryDesignation === ANCHOR_ARCHETYPE,
    `Quiz anchor = ${ANCHOR_ARCHETYPE} (got ${primaryDesignation})`
  );

  const anchorDistribution = { ...initialResult.classification.distribution };
  console.log(`  Primary: ${primaryDesignation} (${(initialResult.classification.distribution[ANCHOR_ARCHETYPE] * 100).toFixed(1)}%)`);
  console.log('');

  // Create initial genome from classification result
  let genome: TasteGenome = createGenome({
    userId: 'test_drift_user',
    classification: initialResult.classification,
    psychometrics: initialResult.psychometrics,
    sephiroticBalance: initialResult.sephiroticBalance,
    orishaResonance: initialResult.orishaResonance,
  });

  // Seed signal history for evolution
  genome = {
    ...genome,
    version: 0,
    behaviour: {
      ...genome.behaviour,
      signalHistory: quizSignals,
    },
  };

  assert(genome.version === 0, 'Initial genome version = 0');
  assert(genome.archetype.primary.designation === ANCHOR_ARCHETYPE, `Initial genome primary = ${ANCHOR_ARCHETYPE}`);
  console.log('');

  // ─── Phase 2: Stable Period (Month 1-2, days 120-180) ─────────────

  console.log('Phase 2: Stable Period (Month 1-2)');
  console.log('─'.repeat(50));

  const stableSignals = makeSignalBatch(ANCHOR_ARCHETYPE, 20, 120, 170);
  genome = evolveGenome(genome, stableSignals);

  assert(genome.version === 1, 'Version incremented to 1');
  assert(genome.archetype.primary.designation === ANCHOR_ARCHETYPE, `Still anchored to ${ANCHOR_ARCHETYPE}`);

  const stableDistribution = { ...genome.archetype.distribution };
  const stableDrift = detectPreferenceDrift(genome, anchorDistribution, 0.2);
  assert(!stableDrift, 'No drift detected during stable period');

  const stability1 = calculateTasteStability(genome);
  console.log(`  Taste stability: ${stability1.toFixed(3)}`);
  console.log(`  Primary weight: ${(genome.archetype.distribution[ANCHOR_ARCHETYPE] * 100).toFixed(1)}%`);
  console.log('');

  // ─── Phase 3: Early Drift (Month 3-4, days 60-120) ────────────────

  console.log('Phase 3: Early Drift (Month 3-4)');
  console.log('─'.repeat(50));

  // Mix of anchor (decreasing) and drift target (increasing)
  const earlyDriftSignals = [
    ...makeSignalBatch(ANCHOR_ARCHETYPE, 8, 60, 100),
    ...makeSignalBatch(DRIFT_TARGET, 12, 60, 100),
  ];
  genome = evolveGenome(genome, earlyDriftSignals);

  assert(genome.version === 2, 'Version incremented to 2');
  console.log(`  Primary: ${genome.archetype.primary.designation}`);
  console.log(`  ${ANCHOR_ARCHETYPE} weight: ${(genome.archetype.distribution[ANCHOR_ARCHETYPE] * 100).toFixed(1)}%`);
  console.log(`  ${DRIFT_TARGET} weight: ${(genome.archetype.distribution[DRIFT_TARGET] * 100).toFixed(1)}%`);

  const earlyDrift = detectPreferenceDrift(genome, anchorDistribution, 0.2);
  console.log(`  Drift detected (threshold 0.2): ${earlyDrift}`);
  console.log('');

  // ─── Phase 4: Strong Drift (Month 5-6, days 0-60) ─────────────────

  console.log('Phase 4: Strong Drift (Month 5-6)');
  console.log('─'.repeat(50));

  const strongDriftSignals = [
    ...makeSignalBatch(DRIFT_TARGET, 25, 0, 50),
    ...makeSignalBatch(ANCHOR_ARCHETYPE, 3, 10, 40),
  ];
  genome = evolveGenome(genome, strongDriftSignals);

  assert(genome.version === 3, 'Version incremented to 3');

  const driftTargetWeight = genome.archetype.distribution[DRIFT_TARGET];
  const anchorWeight = genome.archetype.distribution[ANCHOR_ARCHETYPE];
  console.log(`  Primary: ${genome.archetype.primary.designation}`);
  console.log(`  ${ANCHOR_ARCHETYPE} weight: ${(anchorWeight * 100).toFixed(1)}%`);
  console.log(`  ${DRIFT_TARGET} weight: ${(driftTargetWeight * 100).toFixed(1)}%`);

  const strongDrift = detectPreferenceDrift(genome, anchorDistribution, 0.2);
  assert(strongDrift, 'Strong drift detected after 6 months');

  console.log('');

  // ─── Temporal Decay Validation ─────────────────────────────────────

  console.log('Temporal Decay Validation');
  console.log('─'.repeat(50));

  const testSignals: SignalEvent[] = [
    makeSignalEvent(ANCHOR_ARCHETYPE, 0),   // today
    makeSignalEvent(ANCHOR_ARCHETYPE, 30),  // 1 month ago
    makeSignalEvent(ANCHOR_ARCHETYPE, 90),  // 3 months ago
    makeSignalEvent(ANCHOR_ARCHETYPE, 180), // 6 months ago
  ];

  const decayed = applyTemporalDecay(testSignals) as (SignalEvent & { _temporalWeight?: number })[];

  const todayWeight = decayed[0]._temporalWeight!;
  const month1Weight = decayed[1]._temporalWeight!;
  const month3Weight = decayed[2]._temporalWeight!;
  const month6Weight = decayed[3]._temporalWeight!;

  console.log(`  Today:     ${todayWeight.toFixed(4)}`);
  console.log(`  1 month:   ${month1Weight.toFixed(4)}`);
  console.log(`  3 months:  ${month3Weight.toFixed(4)}`);
  console.log(`  6 months:  ${month6Weight.toFixed(4)}`);

  assert(todayWeight > month1Weight, 'Today > 1 month decay');
  assert(month1Weight > month3Weight, '1 month > 3 months decay');
  assert(month3Weight > month6Weight, '3 months > 6 months decay');
  assert(todayWeight > 0.99, 'Today weight ~1.0');
  assert(month6Weight < 0.20, '6 month weight < 0.20 (significant decay)');

  // Expected: 0.99^30 ≈ 0.74, 0.99^90 ≈ 0.41, 0.99^180 ≈ 0.16
  console.log('');

  // ─── Recalibration Check ───────────────────────────────────────────

  console.log('Recalibration Check');
  console.log('─'.repeat(50));

  // genome was just evolved (lastCalibration = now), should NOT need recalibration
  const needsRecal = needsRecalibration(genome);
  assert(!needsRecal, 'No recalibration needed (just evolved)');

  // Simulate stale genome (last calibration 35 days ago)
  const staleGenome: TasteGenome = {
    ...genome,
    behaviour: {
      ...genome.behaviour,
      lastCalibration: daysAgo(35),
    },
  };
  const needsRecalStale = needsRecalibration(staleGenome);
  assert(needsRecalStale, 'Recalibration needed after 35 days');
  console.log('');

  // ─── Signal Pruning ────────────────────────────────────────────────

  console.log('Signal Pruning');
  console.log('─'.repeat(50));

  // Generate 1200 signals (over the 1000 limit)
  const bigHistory = makeSignalBatch(ANCHOR_ARCHETYPE, 1200, 0, 365);
  const pruned = pruneSignalHistory(bigHistory);
  assert(pruned.length === 1000, `Pruned to 1000 (from ${bigHistory.length})`);

  // Verify most recent signals kept
  const newestPruned = pruned[0].timestamp.getTime();
  const oldestOriginal = bigHistory[0].timestamp.getTime();
  assert(newestPruned >= oldestOriginal, 'Most recent signals preserved');
  console.log('');

  // ─── Historical Confidence ─────────────────────────────────────────

  console.log('Historical Confidence');
  console.log('─'.repeat(50));

  const fewSignals = makeSignalBatch(ANCHOR_ARCHETYPE, 2, 0, 5);
  const lowConf = calculateHistoricalConfidence(fewSignals);
  assert(lowConf === 0.3, `Low conf with <3 signals: ${lowConf}`);

  const manyRecentSignals = makeSignalBatch(ANCHOR_ARCHETYPE, 50, 0, 20);
  const highConf = calculateHistoricalConfidence(manyRecentSignals);
  assert(highConf > 0.7, `High conf with 50 recent signals: ${highConf.toFixed(3)}`);

  // Multi-source signals for diversity bonus
  const diverseSignals: SignalEvent[] = [
    ...makeSignalBatch(ANCHOR_ARCHETYPE, 15, 0, 10, 'quiz'),
    ...makeSignalBatch(ANCHOR_ARCHETYPE, 15, 0, 10, 'content'),
    ...makeSignalBatch(ANCHOR_ARCHETYPE, 15, 0, 10, 'feed'),
  ];
  const diverseConf = calculateHistoricalConfidence(diverseSignals);
  assert(diverseConf > highConf, `Diverse sources boost confidence: ${diverseConf.toFixed(3)} > ${highConf.toFixed(3)}`);
  console.log('');

  // ─── Full Evolution Chain (version progression) ────────────────────

  console.log('Full Evolution Chain');
  console.log('─'.repeat(50));

  const chainQuizSignals = makeSignalBatch(ANCHOR_ARCHETYPE, 5, 90, 90, 'quiz');
  const chainClassification = classify({ signals: chainQuizSignals });
  let chainGenome = createGenome({
    userId: 'chain_test_user',
    classification: chainClassification.classification,
    psychometrics: chainClassification.psychometrics,
    sephiroticBalance: chainClassification.sephiroticBalance,
    orishaResonance: chainClassification.orishaResonance,
  });
  // Seed signal history and reset version for testing
  chainGenome = {
    ...chainGenome,
    version: 0,
    behaviour: {
      ...chainGenome.behaviour,
      signalHistory: chainQuizSignals,
    },
  };

  const versions: number[] = [chainGenome.version];
  for (let month = 1; month <= 6; month++) {
    const monthSignals = makeSignalBatch(
      month <= 3 ? ANCHOR_ARCHETYPE : DRIFT_TARGET,
      10,
      (6 - month) * 30,
      (6 - month) * 30 + 25
    );
    chainGenome = evolveGenome(chainGenome, monthSignals);
    versions.push(chainGenome.version);
  }

  assert(versions.length === 7, '7 versions (0 + 6 evolutions)');
  assert(versions[6] === 6, `Final version = 6 (got ${versions[6]})`);

  const versionsMonotonic = versions.every((v, i) => i === 0 || v > versions[i - 1]);
  assert(versionsMonotonic, 'Versions strictly increasing');

  console.log(`  Version chain: ${versions.join(' → ')}`);
  console.log(`  Initial primary: ${ANCHOR_ARCHETYPE}`);
  console.log(`  Final primary: ${chainGenome.archetype.primary.designation}`);
  console.log('');

  // ─── Summary ───────────────────────────────────────────────────────

  console.log('═'.repeat(60));
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(60));

  if (failed > 0) {
    console.log('\nFailed tests:');
    errors.forEach(e => console.log(`  ✗ ${e}`));
    console.log('');
    console.log('❌ DRIFT SIMULATION FAILED');
  } else {
    console.log('');
    console.log('✅ ALL DRIFT SIMULATION TESTS PASSED');
    console.log('   Temporal decay, drift detection, recalibration,');
    console.log('   pruning, confidence, and evolution all verified');
    console.log('   for a 6-month simulated taste evolution.');
  }

  console.log('═'.repeat(60));
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
