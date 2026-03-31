'use client';

import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  total: number;
  current: number;
  className?: string;
}

/**
 * Progress Indicator Component
 *
 * Minimal progress segments for profiling stages.
 * Not gamified - just clinical progress tracking.
 */
export function ProgressIndicator({
  total,
  current,
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn('progress', className)}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            'progress__segment',
            i < current && 'progress__segment--complete',
            i === current && 'progress__segment--active'
          )}
        />
      ))}
    </div>
  );
}

export default ProgressIndicator;
