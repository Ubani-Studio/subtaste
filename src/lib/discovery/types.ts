/**
 * Discovery Module - Type Definitions (foundation)
 *
 * The post-vanity-metric discovery layer: introduce people by taste
 * PATTERN, not by followers. "X is looking for a scoutboard like yours;
 * her pattern rhymes with what you have been chasing; she's a LIMN,
 * could be a good curator. Say hello."
 *
 * This is the FOUNDATION ONLY: pure data shapes + a pure matching
 * function. No marketplace, no messaging, no scraping, no DB writes,
 * no network calls. Wiring (storage, surfaces, notifications) is a
 * later chapter and lives elsewhere.
 *
 * Doctrine (load-bearing, do not erode):
 *  - Consent-first. A match is only ever an INTRODUCTION ("say hello"),
 *    never a follow, never a forced contact. Both parties must have
 *    opted IN to discovery before either appears in the other's
 *    candidate set. We notice footsteps; we never follow people home.
 *  - No dressed-up extraction. A match SHARES value (a rhyme worth a
 *    hello), it does not mine the person. No taste data leaves the
 *    consenting context.
 *  - Authenticity guard. The introduction line is plain and specific.
 *    No fake intimacy, no therapy-speak, no "I noticed that...".
 *  - Powered by Ikenga taste + lineage signals: the subtaste glyph +
 *    taste embedding, optionally crossed with the writer's influence
 *    lineage (the influences their work credits). Influences that
 *    rhyme across two people IS "find collaborators whose references
 *    rhyme with yours."
 */

// =============================================================================
// Consent
// =============================================================================

/**
 * A person's discovery consent. No one is matchable without an explicit
 * opt-in. Absence of a record means NOT consenting (fail closed).
 */
export interface DiscoveryConsent {
  /** The subject's opaque id. Never a scraped identifier. */
  personId: string;

  /** Has this person opted IN to being introduced to others? */
  discoverable: boolean;

  /**
   * What this person is open to. An empty set means "discoverable but
   * not seeking anything specific" — still requires `discoverable`.
   */
  openTo: IntroIntent[];

  /** When consent was given / last updated. ISO 8601. */
  updatedAt: string;
}

/**
 * The kinds of introduction a person may opt into. Deliberately small.
 */
export type IntroIntent =
  | 'collaboration'
  | 'curation'
  | 'casting'
  | 'music_supervision'
  | 'connection';

// =============================================================================
// Taste signal (the matchable surface of a person)
// =============================================================================

/**
 * The minimal, portable taste signal used for matching. Built from a
 * subtaste profile (the glyph + taste embedding) plus, optionally, the
 * person's credited influence lineage from Ikenga. Nothing here is PII;
 * it is taste shape, not identity.
 */
export interface TasteSignal {
  personId: string;

  /** The Twelve glyph id (KETH, STRATA, ...). */
  glyph: string;

  /**
   * Blend weights across the Twelve (or the V2 archetypes), 0-1. Used
   * for a soft glyph-affinity term so a near-neighbour glyph still
   * rhymes. Keyed by glyph/archetype id.
   */
  blendWeights?: Record<string, number>;

  /**
   * The composite taste embedding (e.g. subtaste V2 128-dim vector).
   * The primary similarity term.
   */
  tasteEmbedding?: number[];

  /**
   * Credited influence lineage: the references this person's work
   * traces to (films, artists, records, motifs). Normalised lowercase
   * titles. Overlap here is the "your influences rhyme with mine"
   * signal sourced from Ikenga's two-board influence lineage.
   */
  lineage?: string[];

  /** Confidence of the underlying profile, 0-1. Down-weights low-data matches. */
  confidence?: number;
}

// =============================================================================
// Introduction (the only output)
// =============================================================================

/**
 * A proposed, consent-gated introduction. This is a suggestion to "say
 * hello", surfaced to BOTH parties or held until both accept, depending
 * on the surface that later consumes it. The foundation only produces
 * the candidate; it never sends anything.
 */
export interface Introduction {
  /** Who the candidate is being shown to. */
  forPersonId: string;

  /** The candidate they might say hello to. */
  candidatePersonId: string;

  /** Why this is a rhyme, 0-1. Higher = closer taste pattern. */
  affinity: number;

  /** The shared intent both opted into, if any was the basis. */
  sharedIntents: IntroIntent[];

  /** The candidate's glyph, for the "she's a LIMN" framing. */
  candidateGlyph: string;

  /** Overlapping credited influences, if lineage was provided. */
  sharedLineage: string[];

  /**
   * A plain, specific introduction line. No fake intimacy, no
   * therapy-speak, no mirror-speak. Ends on the rhyme, not a lesson.
   */
  hello: string;
}

// =============================================================================
// Match configuration
// =============================================================================

export interface MatchConfig {
  /** Max candidates to return per person. */
  topK: number;

  /** Minimum affinity to surface at all, 0-1. */
  minAffinity: number;

  /**
   * Weights for the affinity terms. Sum is normalised internally, so
   * relative magnitude is what matters.
   */
  weights: {
    embedding: number; // cosine over the taste embedding
    glyph: number; // soft glyph-blend affinity
    lineage: number; // credited-influence overlap (Ikenga signal)
  };

  /**
   * Require at least one SHARED opted-in intent before a candidate is
   * surfaced. Default true (consent-first: only introduce people who
   * both want the same kind of hello).
   */
  requireSharedIntent: boolean;
}

export const DEFAULT_MATCH_CONFIG: MatchConfig = {
  topK: 5,
  minAffinity: 0.35,
  weights: { embedding: 0.55, glyph: 0.2, lineage: 0.25 },
  requireSharedIntent: true,
};
