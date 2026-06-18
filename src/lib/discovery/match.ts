/**
 * Discovery Module - Matching (foundation)
 *
 * Pure functions. No I/O, no DB, no network. Given consenting people's
 * taste signals, produce consent-gated introductions ("say hello").
 *
 * Consent is enforced at the boundary: a person is only ever matched if
 * they are `discoverable`, and (by default) only against candidates who
 * share at least one opted-in intent. Fail closed: missing consent =
 * not matchable.
 */

import {
  DEFAULT_MATCH_CONFIG,
  type DiscoveryConsent,
  type IntroIntent,
  type Introduction,
  type MatchConfig,
  type TasteSignal,
} from './types';

// =============================================================================
// Math helpers (kept local so the foundation has zero dependencies)
// =============================================================================

function cosine(a: number[] | undefined, b: number[] | undefined): number {
  if (!a || !b || a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  // Clamp to 0-1: taste rhyme is non-negative; treat anti-correlation as no rhyme.
  return Math.max(0, dot / (Math.sqrt(na) * Math.sqrt(nb)));
}

/** Cosine over the glyph blend-weight maps, treated as sparse vectors. */
function glyphAffinity(
  a: Record<string, number> | undefined,
  b: Record<string, number> | undefined,
): number {
  if (!a || !b) return 0;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const k of keys) {
    const va = a[k] ?? 0;
    const vb = b[k] ?? 0;
    dot += va * vb;
    na += va * va;
    nb += vb * vb;
  }
  if (na === 0 || nb === 0) return 0;
  return Math.max(0, dot / (Math.sqrt(na) * Math.sqrt(nb)));
}

/** Jaccard overlap of two lineage sets, normalised lowercase. */
function lineageOverlap(a: string[] | undefined, b: string[] | undefined): {
  score: number;
  shared: string[];
} {
  if (!a || !b || a.length === 0 || b.length === 0) return { score: 0, shared: [] };
  const norm = (xs: string[]) =>
    new Set(xs.map((x) => x.trim().toLowerCase()).filter(Boolean));
  const sa = norm(a);
  const sb = norm(b);
  const shared: string[] = [];
  for (const x of sa) if (sb.has(x)) shared.push(x);
  const union = new Set([...sa, ...sb]).size;
  return { score: union === 0 ? 0 : shared.length / union, shared };
}

function sharedIntents(a: IntroIntent[], b: IntroIntent[]): IntroIntent[] {
  const sb = new Set(b);
  return a.filter((x) => sb.has(x));
}

// =============================================================================
// Hello line (authenticity guard applied: plain, specific, no AI tics)
// =============================================================================

const INTENT_PHRASE: Record<IntroIntent, string> = {
  collaboration: 'open to collaborating',
  curation: 'open to curating',
  casting: 'open to casting',
  music_supervision: 'open to music supervision',
  connection: 'open to connecting',
};

/**
 * Build the introduction line. No fake intimacy, no therapy-speak, no
 * "I noticed that...". States the rhyme plainly and ends on it.
 */
export function buildHello(
  candidateGlyph: string,
  intents: IntroIntent[],
  sharedLineage: string[],
): string {
  const parts: string[] = [`A ${candidateGlyph}`];
  if (intents.length > 0) {
    const phrase = INTENT_PHRASE[intents[0]];
    if (phrase) parts.push(phrase);
  }
  let line = parts.join(', ');
  if (sharedLineage.length > 0) {
    const refs = sharedLineage.slice(0, 3).join(', ');
    line += `. Your references rhyme: ${refs}`;
  }
  return `${line}. Say hello.`;
}

// =============================================================================
// Match
// =============================================================================

/**
 * Find introductions for one person against a pool. Consent-gated:
 *  - `subject` must be discoverable, else returns [] (fail closed).
 *  - each candidate must be discoverable.
 *  - by default, subject and candidate must share an opted-in intent.
 *
 * Returns ranked candidates with a plain "say hello" line. Produces a
 * suggestion only; sends nothing.
 */
export function findIntroductions(
  subjectId: string,
  signals: TasteSignal[],
  consent: Record<string, DiscoveryConsent>,
  config: Partial<MatchConfig> = {},
): Introduction[] {
  const cfg: MatchConfig = {
    ...DEFAULT_MATCH_CONFIG,
    ...config,
    weights: { ...DEFAULT_MATCH_CONFIG.weights, ...(config.weights ?? {}) },
  };

  const subjectConsent = consent[subjectId];
  if (!subjectConsent?.discoverable) return []; // fail closed

  const subject = signals.find((s) => s.personId === subjectId);
  if (!subject) return [];

  const wSum =
    cfg.weights.embedding + cfg.weights.glyph + cfg.weights.lineage || 1;

  const out: Introduction[] = [];
  for (const cand of signals) {
    if (cand.personId === subjectId) continue;
    const cc = consent[cand.personId];
    if (!cc?.discoverable) continue; // candidate has not opted in

    const intents = sharedIntents(subjectConsent.openTo, cc.openTo);
    if (cfg.requireSharedIntent && intents.length === 0) continue;

    const emb = cosine(subject.tasteEmbedding, cand.tasteEmbedding);
    const gly = glyphAffinity(subject.blendWeights, cand.blendWeights);
    const lin = lineageOverlap(subject.lineage, cand.lineage);

    let affinity =
      (cfg.weights.embedding * emb +
        cfg.weights.glyph * gly +
        cfg.weights.lineage * lin.score) /
      wSum;

    // Down-weight low-confidence profiles so a thin profile does not
    // produce a confident-looking introduction.
    const conf = Math.min(subject.confidence ?? 1, cand.confidence ?? 1);
    affinity *= 0.5 + 0.5 * conf;

    affinity = Math.round(affinity * 1000) / 1000;
    if (affinity < cfg.minAffinity) continue;

    out.push({
      forPersonId: subjectId,
      candidatePersonId: cand.personId,
      affinity,
      sharedIntents: intents,
      candidateGlyph: cand.glyph,
      sharedLineage: lin.shared,
      hello: buildHello(cand.glyph, intents, lin.shared),
    });
  }

  out.sort((a, b) => b.affinity - a.affinity);
  return out.slice(0, cfg.topK);
}
