interface BigButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gentle';
  className?: string;
}

export function BigButton({ onClick, children, variant = 'primary', className = '' }: BigButtonProps) {
  const base = 'min-h-14 w-full px-8 rounded-full text-base font-semibold tracking-wide transition-all active:scale-[0.97] cursor-pointer ripple';

  const variants = {
    primary: 'bg-primary text-on-primary elevation-2 hover:elevation-3',
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-variant',
    gentle: 'bg-transparent text-on-surface-variant hover:text-on-surface text-sm font-medium underline underline-offset-4 decoration-outline-variant',
  };

  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
}
