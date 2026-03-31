# SUBTASTE MIGRATION AUDIT

## Phase 1: System Audit

Audit Date: 2026-01-30
Auditor: Codex (GPT-5)

---

## 1. Current Architecture Summary

- Monorepo with a Next.js app in `src/` (App Router) and workspace packages in `packages/core`, `packages/profiler`, `packages/sdk`.
- THE TWELVE system is implemented in `@subtaste/core` (pantheon, engine, genome) and `@subtaste/profiler` (questions, instruments, progressive orchestration).
- Legacy systems remain in `src/lib/constellations`, `src/lib/archetypes`, `src/lib/quiz`, and `src/lib/scoring`, and are still referenced by `/api/profile` and `/api/quiz` routes.
- Runtime usage is split: v2 quiz uses the genome service (THE TWELVE), while v1 endpoints still use constellations.

## 2. Current Archetypes

### 2.1 THE TWELVE (target)

Location: `packages/core/src/pantheon/definitions.ts`

Attributes: designation, glyph, sigil, essence, creativeMode, shadow, recogniseBy.

Types: `packages/core/src/types/archetype.ts`.

### 2.2 Constellations (legacy, 27)

Location: `src/lib/constellations/config.ts`

Structure: `ConstellationConfig` with `displayName`, `shortDescription`, `visualProfile`, `musicProfile`, `traitProfile` (Big Five + novelty, aesthetic sensitivity, risk tolerance), and `exampleScenes`.

### 2.3 Viral archetypes (legacy, 8)

Location: `src/lib/archetypes/config.ts`

Structure: `ArchetypeConfig` with display name, title, emoji/icon fields, taglines, social sharing metadata, trait profile, and enneagram affinities.

Status: conflicts with brand guidance (emojis and social-first tone).

## 3. Current Profiling Mechanism

### 3.1 THE TWELVE profiling (available, not fully wired)

- Question bank in `packages/profiler/src/questions/bank.ts` (binary, Likert, ranking).
- Progressive stages in `packages/profiler/src/progressive/stages.ts` (initial, music, deep).
- Response mapping in `packages/profiler/src/questions/mapping.ts` converts answers to archetype weights and explicit signals.
- Implicit signal mapping in `packages/profiler/src/instruments/implicit.ts`.
- Orchestration in `packages/profiler/src/progressive/orchestrator.ts`.

### 3.2 Legacy quiz (active in v1)

- `src/lib/quiz/questions.ts` defines 12 AB/multiple/image questions mapped to trait deltas and aesthetic adjustments.
- `src/lib/scoring` still computes constellation and viral archetype results.
- `/api/quiz` and `/api/quiz/refine` consume the legacy quiz and scoring.

### 3.3 v2 quiz (partial THE TWELVE integration)

- `/api/v2/quiz` calls `processQuizSubmission` in `src/lib/genome-service.ts`.
- `processQuizSubmission` currently maps only three binary questions via `inferArchetypeWeights` and emits `preference` signals.
- This bypasses the profiler question bank and does not support Likert or ranking inputs yet.

### 3.4 Gap to the algorithm

- Internal psychometrics in `packages/core/src/pantheon/internal.ts` uses a single openness weight, not per-facet weights.
- v2 quiz does not yet use the progressive stage definitions or question mappings from `@subtaste/profiler`.

## 4. Current Data Model

- Prisma `ConstellationProfile` includes legacy constellation and viral archetype fields plus THE TWELVE fields (`designation`, `glyph`, `sigil`, `sigilRevealed`, `dimensionScores`, `signalBreakdown`, `migratedToTwelve`). See `prisma/schema.prisma`.
- `ProfilingProgress` and `SignalHistory` tables exist for progressive profiling and temporal decay.
- `packages/core/src/types/genome.ts` defines `TasteGenome` with public, formal, `_engine`, behaviour, and cross-modal layers. `toPublicGenome` strips `_engine` and unrevealed sigils.
- `src/lib/genome-service.ts` serialises genomes into `ConstellationProfile.blendWeights` under `_genomeData` and stores distributions for compatibility.

## 5. Current API and Exports

- `/api/profile` still uses legacy constellation scoring and profile export.
- `/api/quiz` and `/api/quiz/refine` use the legacy quiz and scoring.
- `/api/v2/quiz` uses THE TWELVE engine and returns a public genome.
- `@subtaste/core` exports pantheon, engine, genome, and types. `packages/core/src/pantheon/internal.ts` is not exported from the public index (server-only).
- `@subtaste/profiler` exports question banks, mapping, instruments, and progressive orchestration.
- `@subtaste/sdk` exposes hooks (`useGenome`, `useProfiler`) for client consumption.

## 6. Dependencies and Infrastructure

- Next.js 16, React 19, Prisma 7, Supabase, Framer Motion, Vitest.
- Database: Prisma with Postgres adapter.

## 7. Migration Map (Phase 1.2)

| Current Element | Status | Migration Path |
|---|---|---|
| `src/lib/constellations/` | Legacy | Map to THE TWELVE or re-profile; retain only for historical data |
| `src/lib/archetypes/` | Legacy | Map to THE TWELVE; remove emoji and social-share fields |
| `src/lib/quiz/questions.ts` | Legacy | Replace with `@subtaste/profiler` stages and question bank |
| `src/lib/scoring/` | Legacy | Replace with `@subtaste/core` classify and psychometrics |
| `/api/profile` | Legacy | Switch to genome-service + public genome output |
| `/api/quiz`, `/api/quiz/refine` | Legacy | Deprecate or re-route to `/api/v2/quiz` |
| `/api/v2/quiz` | Partial | Integrate `@subtaste/profiler` stages and mapping; support Likert and ranking |
| `packages/core/src/pantheon/internal.ts` | Server-only | Keep unbundled on client; only server imports |

---

## Phase 1 Findings Summary

- THE TWELVE system, internal mappings, and classification engine are implemented in `@subtaste/core`.
- Progressive profiling exists in `@subtaste/profiler` but is not yet wired to the current UI or v2 API.
- Legacy constellation and viral archetype paths remain active in production routes.
