import { useEffect } from 'react';
import type { TimerNode as TimerNodeType } from '@/types/protocol';
import { useTimer, formatTime } from '@/engine/useTimer';
import { BigButton } from '@/components/ui/BigButton';
import { EncouragementBanner } from '@/components/ui/EncouragementBanner';

interface TimerNodeProps {
  node: TimerNodeType;
  onComplete: () => void;
}

export function TimerNodeComponent({ node, onComplete }: TimerNodeProps) {
  const timer = useTimer(node.durationMinutes);

  useEffect(() => {
    timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timer.isComplete) {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [timer.isComplete]);

  const progress = 1 - (timer.remainingSeconds / (node.durationMinutes * 60));

  return (
    <div className="animate-fade-in flex flex-col items-center gap-6 px-6 py-10 text-center">
      <h2 className="text-[22px] font-semibold text-on-surface leading-tight">{node.title}</h2>

      {node.description && (
        <p className="text-base text-on-surface-variant leading-relaxed max-w-sm">{node.description}</p>
      )}

      {/* Circular timer */}
      <div className="relative w-52 h-52 flex items-center justify-center my-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-surface-variant)" strokeWidth="4" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke={timer.isComplete ? 'var(--color-success)' : 'var(--color-primary)'}
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-on-surface tracking-tight">
            {timer.isComplete ? 'Done!' : formatTime(timer.remainingSeconds)}
          </span>
          {!timer.isComplete && (
            <span className="text-xs text-on-surface-variant mt-1">remaining</span>
          )}
        </div>
      </div>

      {timer.isComplete ? (
        <>
          <EncouragementBanner message={node.encouragement ?? "Time's up! Great job!"} />
          <div className="w-full">
            <BigButton onClick={onComplete}>Continue</BigButton>
          </div>
        </>
      ) : (
        node.skipAllowed && (
          <BigButton onClick={() => { timer.skip(); onComplete(); }} variant="gentle">
            Skip timer
          </BigButton>
        )
      )}
    </div>
  );
}
