'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Glyph, Sigil, CreativeMode } from '@subtaste/core';

interface GlyphRevealProps {
  glyph: Glyph;
  sigil: Sigil;
  essence: string;
  creativeMode: CreativeMode;
  shadow: string;
  recogniseBy: string;
  confidence: number;
  secondary?: {
    glyph: Glyph;
    confidence: number;
  };
  onSigilReveal?: () => void;
  onContinue?: () => void;
}

/**
 * Glyph Reveal Component
 *
 * The moment of classification reveal.
 * Three-tier system: Glyph (always), Sigil (on request), Shadow (on sigil reveal).
 * Not celebratory - revelatory.
 */
export function GlyphReveal({
  glyph,
  sigil,
  essence,
  creativeMode,
  shadow,
  recogniseBy,
  confidence,
  secondary,
  onSigilReveal,
  onContinue,
}: GlyphRevealProps) {
  const [sigilRevealed, setSigilRevealed] = useState(false);

  const handleRevealSigil = () => {
    setSigilRevealed(true);
    onSigilReveal?.();
  };

  return (
    <div className="container-sm page-padding">
      <div className="archetype-card">
        {/* Primary Glyph */}
        <motion.div
          className="reveal reveal-glyph"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="archetype-card__glyph">{glyph}</h1>
        </motion.div>

        {/* Essence */}
        <motion.p
          className="archetype-card__essence"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {essence}
        </motion.p>

        {/* Creative Mode */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <span className="text-xs uppercase tracking-wider text-bone-faint">
            Creative Mode
          </span>
          <p className="text-bone-muted mt-1">{creativeMode}</p>
        </motion.div>

        {/* Confidence */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-void-subtle rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-bone-muted"
                initial={{ width: 0 }}
                animate={{ width: `${confidence * 100}%` }}
                transition={{ duration: 1, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <span className="text-xs text-bone-faint font-mono">
              {Math.round(confidence * 100)}%
            </span>
          </div>
        </motion.div>

        {/* Secondary (if present) */}
        {secondary && (
          <motion.div
            className="mb-8 pt-6 border-t border-border-subtle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
          >
            <span className="text-xs uppercase tracking-wider text-bone-faint">
              Secondary influence
            </span>
            <p className="text-bone-muted mt-1">
              {secondary.glyph}{' '}
              <span className="text-bone-faint text-sm">
                ({Math.round(secondary.confidence * 100)}%)
              </span>
            </p>
          </motion.div>
        )}

        {/* Sigil Reveal Section */}
        <AnimatePresence mode="wait">
          {!sigilRevealed ? (
            <motion.div
              key="reveal-trigger"
              className="pt-6 border-t border-border-subtle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              <button
                type="button"
                className="sigil-reveal-link"
                onClick={handleRevealSigil}
              >
                View formal classification
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="sigil-content"
              className="pt-6 border-t border-border-subtle space-y-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Sigil */}
              <div>
                <span className="text-xs uppercase tracking-wider text-bone-faint">
                  Sigil
                </span>
                <p className="font-display text-xl text-rime-bright mt-1 tracking-wide">
                  {sigil}
                </p>
              </div>

              {/* Recognise By */}
              <div>
                <span className="text-xs uppercase tracking-wider text-bone-faint">
                  Recognised by
                </span>
                <p className="text-bone-muted mt-1 text-sm leading-relaxed">
                  {recogniseBy}
                </p>
              </div>

              {/* Shadow */}
              <div>
                <span className="text-xs uppercase tracking-wider text-bone-faint">
                  Shadow
                </span>
                <p className="text-bone-muted mt-1 text-sm leading-relaxed">
                  {shadow}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue button */}
      {onContinue && (
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <button
            type="button"
            className="btn btn-primary"
            onClick={onContinue}
          >
            Continue
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default GlyphReveal;
