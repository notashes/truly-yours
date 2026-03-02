import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';
import { BigButton } from '@/components/ui/BigButton';
import type { ChecklistItem } from '@/types/protocol';

function getAllItems(items: ChecklistItem[]): ChecklistItem[] {
  const result: ChecklistItem[] = [];
  for (const item of items) {
    result.push(item);
    if (item.children) result.push(...getAllItems(item.children));
  }
  return result;
}

function ChecklistItemRow({ item, checked, onToggle, depth = 0 }: {
  item: ChecklistItem;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  depth?: number;
}) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <>
      <button
        onClick={() => onToggle(item.id)}
        className={`flex items-center gap-3 p-4 rounded-2xl transition-all text-left
          ${checked[item.id] ? 'bg-success-container/50' : 'bg-surface-container-low'}`}
        style={depth > 0 ? { marginLeft: `${depth * 20}px`, width: `calc(100% - ${depth * 20}px)` } : undefined}
      >
        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
          ${checked[item.id] ? 'bg-success border-success' : 'border-outline'}`}>
          {checked[item.id] && (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          )}
        </div>
        <span className={`text-sm font-medium flex-1 transition-all
          ${checked[item.id] ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
          {item.label}
        </span>
        {item.optional && (
          <span className="text-xs text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full flex-shrink-0">
            optional
          </span>
        )}
      </button>
      {hasChildren && item.children!.map(child => (
        <ChecklistItemRow key={child.id} item={child} checked={checked} onToggle={onToggle} depth={depth + 1} />
      ))}
    </>
  );
}

export function StandaloneChecklistRunnerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allChecklists } = useContentStore();
  const checklist = id ? allChecklists[id] : null;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  if (!checklist) {
    return (
      <div className="px-5 pt-12 text-center">
        <p className="text-on-surface-variant">Checklist not found</p>
      </div>
    );
  }

  const toggle = (itemId: string) => {
    setChecked(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const allItems = getAllItems(checklist.items);
  const allRequiredDone = allItems
    .filter(i => !i.optional)
    .every(i => checked[i.id]);

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalCount = allItems.length;

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <svg className="w-6 h-6 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-on-surface">{checklist.emoji} {checklist.name}</h1>
          {checklist.description && <p className="text-sm text-on-surface-variant">{checklist.description}</p>}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-on-surface-variant mb-1">
          <span>{checkedCount} of {totalCount}</span>
        </div>
        <div className="h-1 bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-8">
        {checklist.items.map(item => (
          <ChecklistItemRow key={item.id} item={item} checked={checked} onToggle={toggle} />
        ))}
      </div>

      {allRequiredDone && (
        <div className="animate-fade-in">
          <BigButton onClick={() => navigate('/', { replace: true })}>
            All done!
          </BigButton>
        </div>
      )}
    </div>
  );
}
