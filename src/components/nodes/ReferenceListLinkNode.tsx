import { useState } from 'react';
import type { ReferenceListLinkNode } from '@/types/protocol';
import type { ReferenceList } from '@/types/content';
import { BigButton } from '@/components/ui/BigButton';
import { EncouragementBanner } from '@/components/ui/EncouragementBanner';
import { BottomSheet } from '@/components/ui/BottomSheet';

interface Props {
  node: ReferenceListLinkNode;
  referenceList?: ReferenceList;
  onComplete: () => void;
}

export function ReferenceListLinkNodeComponent({ node, referenceList, onComplete }: Props) {
  const [showList, setShowList] = useState(false);

  return (
    <div className="animate-fade-in flex flex-col items-center gap-5 px-6 py-10 text-center">
      <h2 className="text-[22px] font-semibold text-on-surface leading-tight">{node.title}</h2>

      {node.description && (
        <p className="text-base text-on-surface-variant leading-relaxed max-w-sm">{node.description}</p>
      )}

      {node.encouragement && (
        <EncouragementBanner message={node.encouragement} />
      )}

      {referenceList && (
        <button
          onClick={() => setShowList(true)}
          className="bg-secondary-container text-on-secondary-container rounded-full px-6 py-3
            font-medium text-sm hover:opacity-90 transition-opacity active:scale-[0.97]"
        >
          View: {referenceList.emoji} {referenceList.name}
        </button>
      )}

      <div className="w-full mt-4">
        <BigButton onClick={onComplete}>
          Continue
        </BigButton>
      </div>

      {referenceList && (
        <BottomSheet open={showList} onClose={() => setShowList(false)} title={referenceList.name}>
          <div className="flex flex-col gap-2">
            {referenceList.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-2xl">
                {item.emoji && <span className="text-lg">{item.emoji}</span>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface">{item.label}</p>
                  {item.notes && <p className="text-xs text-on-surface-variant mt-0.5">{item.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}
