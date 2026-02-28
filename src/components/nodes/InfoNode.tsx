import type { InfoNode as InfoNodeType } from '@/types/protocol';
import { BigButton } from '@/components/ui/BigButton';
import { EncouragementBanner } from '@/components/ui/EncouragementBanner';

interface InfoNodeProps {
  node: InfoNodeType;
  onComplete: () => void;
}

export function InfoNodeComponent({ node, onComplete }: InfoNodeProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center gap-5 px-6 py-10 text-center">
      <h2 className="text-[22px] font-semibold text-on-surface leading-tight">{node.title}</h2>

      {node.description && (
        <p className="text-base text-on-surface-variant leading-relaxed max-w-sm">{node.description}</p>
      )}

      {node.encouragement && (
        <EncouragementBanner message={node.encouragement} />
      )}

      <div className="w-full mt-6">
        <BigButton onClick={onComplete}>
          {node.nextNodeId ? "Let's go" : "Done"}
        </BigButton>
      </div>
    </div>
  );
}
