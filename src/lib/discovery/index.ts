/**
 * Discovery Module (foundation)
 *
 * The post-vanity-metric connection layer: introduce people by taste
 * PATTERN, consent-first. Foundation only — pure types and a pure
 * matching function. No marketplace, no messaging, no scraping, no DB,
 * no network. Surfaces and storage come in a later chapter.
 *
 * @example
 * ```ts
 * import { findIntroductions } from '@/lib/discovery';
 *
 * const intros = findIntroductions(meId, signals, consent);
 * // intros[0].hello -> "A LIMN, open to curating. Your references rhyme: ... Say hello."
 * ```
 */

export type {
  DiscoveryConsent,
  IntroIntent,
  TasteSignal,
  Introduction,
  MatchConfig,
} from './types';

export { DEFAULT_MATCH_CONFIG } from './types';

export { findIntroductions, buildHello } from './match';
