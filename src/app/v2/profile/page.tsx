'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GlyphReveal } from '@/components/profiling';
import { PANTHEON, type Glyph, type Sigil, type CreativeMode } from '@subtaste/core';

interface GenomeData {
  glyph: Glyph;
  designation: string;
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
}

/**
 * Profile Page
 *
 * Displays the user's taste genome.
 * Gothic cold futuristic aesthetic.
 */
export default function ProfilePageV2() {
  const router = useRouter();
  const [genome, setGenome] = useState<GenomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGenome() {
      const userId = localStorage.getItem('subtaste_user_id');

      if (!userId) {
        router.push('/v2/quiz');
        return;
      }

      try {
        const response = await fetch(`/api/v2/genome/${userId}/public`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch genome');
        }

        // Get archetype details from PANTHEON
        const designation = data.archetype.primary.designation;
        const archetype = PANTHEON[designation as keyof typeof PANTHEON];

        setGenome({
          glyph: archetype.glyph,
          designation,
          sigil: archetype.sigil,
          essence: archetype.essence,
          creativeMode: archetype.creativeMode as CreativeMode,
          shadow: archetype.shadow,
          recogniseBy: archetype.recogniseBy,
          confidence: data.confidence,
          secondary: data.archetype.secondary ? {
            glyph: data.archetype.secondary.glyph,
            confidence: data.archetype.secondary.confidence,
          } : undefined,
        });
      } catch (err) {
        console.error('Genome fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    fetchGenome();
  }, [router]);

  const handleSigilReveal = async () => {
    const userId = localStorage.getItem('subtaste_user_id');
    if (!userId) return;

    try {
      await fetch(`/api/v2/genome/${userId}/sigil`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Sigil reveal error:', err);
    }
  };

  const handleRetakeQuiz = () => {
    router.push('/v2/quiz');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-8 h-8 border-2 border-bone-faint border-t-bone rounded-full animate-spin mx-auto" />
          <p className="text-bone-muted text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="container-sm text-center">
          <p className="text-bone-muted mb-4">{error}</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleRetakeQuiz}
          >
            Take the quiz
          </button>
        </div>
      </div>
    );
  }

  if (!genome) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="container-sm text-center">
          <p className="text-bone-muted mb-4">No profile found.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleRetakeQuiz}
          >
            Take the quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <GlyphReveal
          glyph={genome.glyph}
          sigil={genome.sigil}
          essence={genome.essence}
          creativeMode={genome.creativeMode}
          shadow={genome.shadow}
          recogniseBy={genome.recogniseBy}
          confidence={genome.confidence}
          secondary={genome.secondary}
          onSigilReveal={handleSigilReveal}
        />

        {/* Actions */}
        <div className="container-sm px-4 pb-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleRetakeQuiz}
            >
              Retake quiz
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
