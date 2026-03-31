/**
 * Migration: Old Systems -> THE TWELVE
 *
 * Maps legacy constellation and viral archetype systems to THE TWELVE.
 * Used for migrating existing user profiles.
 */

import type { Designation } from '@subtaste/core';
import type { ConstellationId } from '../constellations/types';
import type { ArchetypeId } from '../archetypes/types';

// =============================================================================
// Viral Archetypes (8) -> THE TWELVE
// =============================================================================

/**
 * Map 8 viral archetypes to THE TWELVE designations
 *
 * Mappings based on archetype essence and creative mode alignment:
 * - vespyr (Sage) -> P-7 VAULT (Archival) - knowledge keeper
 * - ignyx (Rebel) -> R-10 SCHISM (Contrarian) - productive fracture
 * - auryn (Enlightened) -> S-0 KETH (Visionary) - standard setter
 * - prismae (Artist) -> N-5 LIMN (Integrative) - unexpected pairings
 * - solara (Leader) -> H-6 TOLL (Advocacy) - the summons
 * - crypta (Hermit) -> P-7 VAULT (Archival) - deep collector
 * - vertex (Visionary) -> V-2 OMEN (Prophetic) - ahead of time
 * - fluxus (Connector) -> N-5 LIMN (Integrative) - binding outline
 */
export const VIRAL_TO_TWELVE: Record<ArchetypeId, Designation> = {
  vespyr: 'P-7',   // Sage -> VAULT
  ignyx: 'R-10',   // Rebel -> SCHISM
  auryn: 'S-0',    // Enlightened -> KETH
  prismae: 'N-5',  // Artist -> LIMN
  solara: 'H-6',   // Leader -> TOLL
  crypta: 'P-7',   // Hermit -> VAULT
  vertex: 'V-2',   // Visionary -> OMEN
  fluxus: 'N-5',   // Connector -> LIMN
};

/**
 * Secondary affinities for viral archetypes
 * Used to populate distribution with more nuance
 */
export const VIRAL_TO_TWELVE_AFFINITIES: Record<ArchetypeId, Partial<Record<Designation, number>>> = {
  vespyr: {
    'P-7': 0.5,    // VAULT - primary
    'Ø': 0.25,     // VOID - receptive
    'D-8': 0.15,   // WICK - channelling
    'L-3': 0.1,    // SILT - patient
  },
  ignyx: {
    'R-10': 0.5,   // SCHISM - primary
    'C-4': 0.25,   // CULL - editorial cut
    'H-6': 0.15,   // TOLL - advocacy
    'V-2': 0.1,    // OMEN - prophetic
  },
  auryn: {
    'S-0': 0.5,    // KETH - primary
    'N-5': 0.25,   // LIMN - integrative
    'T-1': 0.15,   // STRATA - architectural
    'H-6': 0.1,    // TOLL - advocacy
  },
  prismae: {
    'N-5': 0.5,    // LIMN - primary
    'D-8': 0.25,   // WICK - channelling
    'V-2': 0.15,   // OMEN - prophetic
    'F-9': 0.1,    // ANVIL - manifestation
  },
  solara: {
    'H-6': 0.5,    // TOLL - primary
    'S-0': 0.25,   // KETH - visionary
    'F-9': 0.2,    // ANVIL - manifestation
    'R-10': 0.05,  // SCHISM - contrarian
  },
  crypta: {
    'P-7': 0.5,    // VAULT - primary
    'L-3': 0.25,   // SILT - patient
    'Ø': 0.15,     // VOID - receptive
    'T-1': 0.1,    // STRATA - architectural
  },
  vertex: {
    'V-2': 0.5,    // OMEN - primary
    'T-1': 0.25,   // STRATA - architectural
    'R-10': 0.15,  // SCHISM - contrarian
    'F-9': 0.1,    // ANVIL - manifestation
  },
  fluxus: {
    'N-5': 0.5,    // LIMN - primary
    'Ø': 0.25,     // VOID - receptive
    'L-3': 0.15,   // SILT - patient
    'D-8': 0.1,    // WICK - channelling
  },
};

// =============================================================================
// Constellations (27) -> THE TWELVE
// =============================================================================

/**
 * Map 27 constellations directly to THE TWELVE
 * This provides a more accurate mapping than going through viral archetypes
 */
export const CONSTELLATION_TO_TWELVE: Record<ConstellationId, Designation> = {
  // Dreamy/contemplative cluster -> VAULT, VOID, WICK
  somnexis: 'Ø',       // VOID - receptive dreamer
  astryde: 'V-2',      // OMEN - celestial foresight
  opalith: 'D-8',      // WICK - channelling

  // Dark/intense cluster -> SCHISM, CULL
  vantoryx: 'R-10',    // SCHISM - dark fracture
  velocine: 'R-10',    // SCHISM - intense contrarian
  nycataria: 'C-4',    // CULL - nocturnal editor

  // Warm/radiant cluster -> KETH, TOLL, LIMN
  luminth: 'S-0',      // KETH - radiant standard
  lucidyne: 'N-5',     // LIMN - clear integration
  aurivox: 'H-6',      // TOLL - golden voice

  // Creative/colourful cluster -> LIMN, WICK
  chromyne: 'N-5',     // LIMN - chromatic integration
  prismant: 'N-5',     // LIMN - prismatic blending
  iridrax: 'D-8',      // WICK - iridescent channel
  holofern: 'V-2',     // OMEN - holographic vision

  // Bold/leader cluster -> TOLL, KETH, ANVIL
  radianth: 'H-6',     // TOLL - radiant advocacy
  holovain: 'S-0',     // KETH - holistic vision
  prismora: 'F-9',     // ANVIL - prismatic manifestation

  // Dark/mysterious cluster -> VAULT, SILT
  obscyra: 'P-7',      // VAULT - obscure archive
  noctyra: 'P-7',      // VAULT - nocturnal keeper
  glaceryl: 'L-3',     // SILT - glacial patience

  // Futuristic/digital cluster -> STRATA, OMEN
  nexyra: 'T-1',       // STRATA - nexus architecture
  fluxeris: 'V-2',     // OMEN - flux prediction
  velisynth: 'T-1',    // STRATA - synthetic layers

  // Organic/connector cluster -> VOID, SILT, LIMN
  silquor: 'L-3',      // SILT - silken patience
  glemyth: 'Ø',        // VOID - mythic reception
  vireth: 'Ø',         // VOID - verdant emptiness
  glovern: 'L-3',      // SILT - organic growth
  crysolen: 'N-5',     // LIMN - crystalline integration
};

// =============================================================================
// Migration Functions
// =============================================================================

/**
 * Migrate a viral archetype profile to THE TWELVE
 */
export function migrateViralArchetype(
  archetypeId: ArchetypeId,
  blendWeights?: Partial<Record<ArchetypeId, number>>
): {
  primaryDesignation: Designation;
  distribution: Partial<Record<Designation, number>>;
} {
  const primaryDesignation = VIRAL_TO_TWELVE[archetypeId];

  // If no blend weights, use default affinities
  if (!blendWeights) {
    return {
      primaryDesignation,
      distribution: VIRAL_TO_TWELVE_AFFINITIES[archetypeId],
    };
  }

  // Convert blend weights to THE TWELVE distribution
  const distribution: Partial<Record<Designation, number>> = {};

  for (const [viral, weight] of Object.entries(blendWeights)) {
    if (weight === undefined || weight <= 0) continue;

    const affinities = VIRAL_TO_TWELVE_AFFINITIES[viral as ArchetypeId];
    if (!affinities) continue;

    for (const [designation, affinity] of Object.entries(affinities)) {
      const contribution = weight * (affinity || 0);
      distribution[designation as Designation] =
        (distribution[designation as Designation] || 0) + contribution;
    }
  }

  // Normalise
  const total = Object.values(distribution).reduce((sum, w) => sum + (w || 0), 0);
  if (total > 0) {
    for (const key of Object.keys(distribution) as Designation[]) {
      distribution[key] = (distribution[key] || 0) / total;
    }
  }

  return { primaryDesignation, distribution };
}

/**
 * Migrate a constellation profile to THE TWELVE
 */
export function migrateConstellation(
  constellationId: ConstellationId,
  blendWeights?: Partial<Record<ConstellationId, number>>
): {
  primaryDesignation: Designation;
  distribution: Partial<Record<Designation, number>>;
} {
  const primaryDesignation = CONSTELLATION_TO_TWELVE[constellationId];

  // If no blend weights, return primary only
  if (!blendWeights) {
    return {
      primaryDesignation,
      distribution: { [primaryDesignation]: 1.0 },
    };
  }

  // Convert constellation weights to THE TWELVE distribution
  const distribution: Partial<Record<Designation, number>> = {};

  for (const [constellation, weight] of Object.entries(blendWeights)) {
    if (weight === undefined || weight <= 0) continue;

    const designation = CONSTELLATION_TO_TWELVE[constellation as ConstellationId];
    if (!designation) continue;

    distribution[designation] = (distribution[designation] || 0) + weight;
  }

  // Normalise
  const total = Object.values(distribution).reduce((sum, w) => sum + (w || 0), 0);
  if (total > 0) {
    for (const key of Object.keys(distribution) as Designation[]) {
      distribution[key] = (distribution[key] || 0) / total;
    }
  }

  return { primaryDesignation, distribution };
}

/**
 * Get designation from any legacy archetype ID
 */
export function legacyToDesignation(
  legacyId: string
): Designation | null {
  // Check if it's a viral archetype
  if (legacyId in VIRAL_TO_TWELVE) {
    return VIRAL_TO_TWELVE[legacyId as ArchetypeId];
  }

  // Check if it's a constellation
  if (legacyId in CONSTELLATION_TO_TWELVE) {
    return CONSTELLATION_TO_TWELVE[legacyId as ConstellationId];
  }

  return null;
}

export default {
  VIRAL_TO_TWELVE,
  VIRAL_TO_TWELVE_AFFINITIES,
  CONSTELLATION_TO_TWELVE,
  migrateViralArchetype,
  migrateConstellation,
  legacyToDesignation,
};
