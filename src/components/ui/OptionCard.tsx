interface OptionCardProps {
  label: string;
  emoji?: string;
  onClick: () => void;
}

export function OptionCard({ label, emoji, onClick }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full min-h-16 px-5 py-4 rounded-2xl bg-surface-container-low
        hover:bg-surface-container transition-all active:scale-[0.98]
        flex items-center gap-4 text-left cursor-pointer ripple elevation-1"
    >
      {emoji && (
        <span className="text-2xl flex-shrink-0 w-11 h-11 rounded-full bg-primary-container
          flex items-center justify-center">
          {emoji}
        </span>
      )}
      <span className="text-base font-medium text-on-surface">{label}</span>
    </button>
  );
}
