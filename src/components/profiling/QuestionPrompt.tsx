'use client';

import { motion } from 'framer-motion';

interface QuestionPromptProps {
  prompt: string;
  subtext?: string;
}

/**
 * Question Prompt Component
 *
 * Displays the question text with optional subtext.
 * Reveals with subtle animation.
 */
export function QuestionPrompt({ prompt, subtext }: QuestionPromptProps) {
  return (
    <div className="space-y-2 text-center mb-8">
      <motion.h2
        className="text-xl md:text-2xl text-bone font-normal"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {prompt}
      </motion.h2>
      {subtext && (
        <motion.p
          className="text-sm text-bone-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {subtext}
        </motion.p>
      )}
    </div>
  );
}

export default QuestionPrompt;
