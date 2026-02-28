import type { QuestionNode as QuestionNodeType } from '@/types/protocol';
import { OptionCard } from '@/components/ui/OptionCard';

interface QuestionNodeProps {
  node: QuestionNodeType;
  onSelect: (nextNodeId: string) => void;
}

export function QuestionNodeComponent({ node, onSelect }: QuestionNodeProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center gap-5 px-6 py-10">
      <h2 className="text-[22px] font-semibold text-on-surface text-center leading-tight">{node.title}</h2>

      {node.description && (
        <p className="text-base text-on-surface-variant text-center leading-relaxed max-w-sm">{node.description}</p>
      )}

      <div className="w-full flex flex-col gap-2.5 mt-3">
        {node.options.map(option => (
          <OptionCard
            key={option.nextNodeId}
            label={option.label}
            emoji={option.emoji}
            onClick={() => onSelect(option.nextNodeId)}
          />
        ))}
      </div>
    </div>
  );
}
