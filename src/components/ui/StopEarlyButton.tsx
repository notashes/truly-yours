interface StopEarlyButtonProps {
  onClick: () => void;
}

export function StopEarlyButton({ onClick }: StopEarlyButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-outline text-xs font-medium tracking-wide transition-colors
        hover:text-on-surface-variant cursor-pointer px-3 py-1.5 rounded-full
        hover:bg-surface-variant"
    >
      Pause
    </button>
  );
}
