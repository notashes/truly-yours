import type { ChecklistNode as ChecklistNodeType } from '@/types/protocol';
import { BigButton } from '@/components/ui/BigButton';
import { EncouragementBanner } from '@/components/ui/EncouragementBanner';

interface ChecklistNodeProps {
  node: ChecklistNodeType;
  results: Record<string, boolean>;
  onToggle: (itemId: string) => void;
  onComplete: () => void;
}

export function ChecklistNodeComponent({ node, results, onToggle, onComplete }: ChecklistNodeProps) {
  const requiredItems = node.items.filter(i => !i.optional);
  const allRequiredDone = requiredItems.every(i => results[i.id]);

  return (
    <div className="animate-fade-in flex flex-col items-center gap-5 px-6 py-10">
      <h2 className="text-[22px] font-semibold text-on-surface text-center leading-tight">{node.title}</h2>

      {node.description && (
        <p className="text-base text-on-surface-variant text-center leading-relaxed max-w-sm">{node.description}</p>
      )}

      <div className="w-full flex flex-col gap-2 mt-1">
        {node.items.map(item => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`w-full px-4 py-3.5 rounded-2xl flex items-center gap-4 text-left
              transition-all active:scale-[0.98] cursor-pointer ripple
              ${results[item.id]
                ? 'bg-success-container'
                : 'bg-surface-container-low hover:bg-surface-container'
              }`}
          >
            <div className={`w-5 h-5 rounded-[6px] border-2 flex items-center justify-center flex-shrink-0
              transition-colors
              ${results[item.id]
                ? 'bg-success border-success'
                : 'border-outline'
              }`}
            >
              {results[item.id] && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`text-base font-medium ${results[item.id] ? 'line-through text-on-surface-variant' : 'text-on-surface'}`}>
              {item.label}
              {item.optional && <span className="text-outline text-xs font-normal ml-2">(optional)</span>}
            </span>
          </button>
        ))}
      </div>

      {node.encouragement && (
        <EncouragementBanner message={node.encouragement} />
      )}

      <div className="w-full mt-4">
        <BigButton onClick={onComplete} variant={allRequiredDone ? 'primary' : 'secondary'}>
          {allRequiredDone ? "All done" : "Continue anyway"}
        </BigButton>
      </div>
    </div>
  );
}
