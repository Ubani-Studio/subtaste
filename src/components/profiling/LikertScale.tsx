'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LikertScaleProps {
  scale: 5 | 7;
  lowLabel: string;
  highLabel: string;
  selected: number | null;
  onSelect: (value: number) => void;
  disabled?: boolean;
}

/**
 * Likert Scale Component
 *
 * 5 or 7 point scale for profiling questions.
 * Minimal, clinical aesthetic.
 */
export function LikertScale({
  scale,
  lowLabel,
  highLabel,
  selected,
  onSelect,
  disabled = false,
}: LikertScaleProps) {
  const points = Array.from({ length: scale }, (_, i) => i + 1);

  return (
    <div className="space-y-3">
      <div className="likert">
        {points.map((point, index) => (
          <motion.button
            key={point}
            type="button"
            className={cn(
              'likert__option',
              selected === point && 'likert__option--selected'
            )}
            onClick={() => !disabled && onSelect(point)}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.1 }}
            whileTap={{ scale: disabled ? 1 : 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
              ease: [0.16, 1, 0.3, 1],
            }}
            aria-label={`${point} out of ${scale}`}
          />
        ))}
      </div>
      <div className="likert__labels">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}

export default LikertScale;
