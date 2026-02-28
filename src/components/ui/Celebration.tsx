import { useEffect, useState } from 'react';
import { getEncouragement } from '@/lib/encouragements';

const CONFETTI_COLORS = ['#D4795C', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899', '#F59E0B'];

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  size: number;
}

export function Celebration({ message }: { message?: string }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const displayMessage = message ?? getEncouragement();

  useEffect(() => {
    const confetti: ConfettiPiece[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 1.5,
      size: 6 + Math.random() * 10,
    }));
    setPieces(confetti);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {pieces.map(p => (
        <div
          key={p.id}
          className="animate-confetti absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-scale-in bg-surface elevation-3 rounded-[28px] p-8 mx-6 text-center max-w-sm pointer-events-auto">
          <div className="text-5xl mb-4">🎉</div>
          <p className="text-xl font-semibold text-on-surface">{displayMessage}</p>
        </div>
      </div>
    </div>
  );
}
