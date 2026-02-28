import { ProgressBar } from '@/components/ui/ProgressBar';
import { StopEarlyButton } from '@/components/ui/StopEarlyButton';

interface HeaderProps {
  title: string;
  progress?: number;
  onStopEarly?: () => void;
  onBack?: () => void;
}

export function Header({ title, progress, onStopEarly, onBack }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md px-4 pt-3 pb-2">
      <div className="flex items-center justify-between mb-2">
        {onBack ? (
          <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center
            text-on-surface-variant hover:bg-surface-variant transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <div className="w-10" />
        )}

        <h1 className="text-base font-semibold text-on-surface truncate mx-3">{title}</h1>

        {onStopEarly ? (
          <StopEarlyButton onClick={onStopEarly} />
        ) : (
          <div className="w-10" />
        )}
      </div>

      {progress !== undefined && <ProgressBar progress={progress} />}
    </header>
  );
}
