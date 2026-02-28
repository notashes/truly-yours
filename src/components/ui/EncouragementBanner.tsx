import { getEncouragement } from '@/lib/encouragements';

interface EncouragementBannerProps {
  message?: string;
}

export function EncouragementBanner({ message }: EncouragementBannerProps) {
  const text = getEncouragement(message);

  return (
    <div className="animate-fade-in bg-primary-container rounded-2xl px-5 py-3.5 text-center">
      <p className="text-on-primary-container text-sm font-medium">{text}</p>
    </div>
  );
}
