'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BinaryChoiceProps {
  options: [string, string];
  selected: 0 | 1 | null;
  onSelect: (index: 0 | 1) => void;
  disabled?: boolean;
}

/**
 * Binary Choice Component
 *
 * Two-option selection for profiling questions.
 * Gothic cold futuristic aesthetic.
 */
export function BinaryChoice({
  options,
  selected,
  onSelect,
  disabled = false,
}: BinaryChoiceProps) {
  return (
    <div className="binary">
      {options.map((option, index) => (
        <motion.button
          key={index}
          type="button"
          className={cn(
            'binary__option',
            selected === index && 'binary__option--selected'
          )}
          onClick={() => !disabled && onSelect(index as 0 | 1)}
          disabled={disabled}
          whileHover={{ scale: disabled ? 1 : 1.02 }}
          whileTap={{ scale: disabled ? 1 : 0.98 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <span className="binary__option-text">{option}</span>
        </motion.button>
      ))}
    </div>
  );
}

export default BinaryChoice;
