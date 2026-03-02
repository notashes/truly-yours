import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';
import type { StandaloneChecklist } from '@/types/content';
import type { ChecklistItem } from '@/types/protocol';
import { BigButton } from '@/components/ui/BigButton';

const EMOJI_OPTIONS = ['✅', '🧹', '🎒', '🛒', '💊', '🏋️', '📚', '🍳', '🧘', '🌿', '💼', '🎨', '🔧', '🧳', '🏠', '⭐'];

function countAllItems(items: ChecklistItem[]): number {
  let count = 0;
  for (const item of items) {
    count++;
    if (item.children) count += countAllItems(item.children);
  }
  return count;
}

// Recursively update an item anywhere in the tree
function updateItemInTree(items: ChecklistItem[], itemId: string, updates: Partial<ChecklistItem>): ChecklistItem[] {
  return items.map(item => {
    if (item.id === itemId) return { ...item, ...updates };
    if (item.children) return { ...item, children: updateItemInTree(item.children, itemId, updates) };
    return item;
  });
}

// Recursively remove an item anywhere in the tree
function removeItemFromTree(items: ChecklistItem[], itemId: string): ChecklistItem[] {
  return items
    .filter(item => item.id !== itemId)
    .map(item => item.children ? { ...item, children: removeItemFromTree(item.children, itemId) } : item);
}

// Add a child to a specific parent
function addChildToItem(items: ChecklistItem[], parentId: string, child: ChecklistItem): ChecklistItem[] {
  return items.map(item => {
    if (item.id === parentId) {
      return { ...item, children: [...(item.children ?? []), child] };
    }
    if (item.children) return { ...item, children: addChildToItem(item.children, parentId, child) };
    return item;
  });
}

function ItemEditor({ item, onUpdate, onRemove, onAddChild, onMoveUp, onMoveDown, isFirst, isLast, depth = 0 }: {
  item: ChecklistItem;
  onUpdate: (id: string, updates: Partial<ChecklistItem>) => void;
  onRemove: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  depth?: number;
}) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <>
      <div
        className="flex items-center gap-2 bg-surface-container-low rounded-2xl p-3"
        style={depth > 0 ? { marginLeft: `${depth * 16}px` } : undefined}
      >
        <div className="flex flex-col gap-0.5">
          <button onClick={onMoveUp} disabled={isFirst}
            className="text-on-surface-variant disabled:opacity-20 p-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button onClick={onMoveDown} disabled={isLast}
            className="text-on-surface-variant disabled:opacity-20 p-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={item.label}
            onChange={e => onUpdate(item.id, { label: e.target.value })}
            className="w-full bg-transparent text-sm text-on-surface outline-none font-medium"
          />
        </div>
        <button
          onClick={() => onUpdate(item.id, { optional: !item.optional })}
          className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 transition-colors
            ${item.optional ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary-container text-on-primary-container'}`}
        >
          {item.optional ? 'optional' : 'required'}
        </button>
        {depth === 0 && (
          <button
            onClick={() => onAddChild(item.id)}
            className="p-1.5 rounded-full hover:bg-primary-container transition-colors flex-shrink-0"
            title="Add sub-item"
          >
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        )}
        <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-full hover:bg-error-container transition-colors flex-shrink-0">
          <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {hasChildren && item.children!.map((child, ci) => (
        <ItemEditor
          key={child.id}
          item={child}
          onUpdate={onUpdate}
          onRemove={onRemove}
          onAddChild={onAddChild}
          onMoveUp={() => {
            if (ci === 0) return;
            const arr = [...item.children!];
            [arr[ci - 1], arr[ci]] = [arr[ci], arr[ci - 1]];
            onUpdate(item.id, { children: arr });
          }}
          onMoveDown={() => {
            if (ci === item.children!.length - 1) return;
            const arr = [...item.children!];
            [arr[ci], arr[ci + 1]] = [arr[ci + 1], arr[ci]];
            onUpdate(item.id, { children: arr });
          }}
          isFirst={ci === 0}
          isLast={ci === item.children!.length - 1}
          depth={depth + 1}
        />
      ))}
    </>
  );
}

export function ChecklistBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allChecklists, saveChecklist } = useContentStore();

  const existing = id ? allChecklists[id] : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '✅');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [items, setItems] = useState<ChecklistItem[]>(existing?.items ?? []);
  const [newItemLabel, setNewItemLabel] = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmoji(existing.emoji);
      setDescription(existing.description);
      setItems(existing.items);
    }
  }, [existing]);

  const addItem = () => {
    if (!newItemLabel.trim()) return;
    setItems(prev => [...prev, { id: crypto.randomUUID(), label: newItemLabel.trim(), optional: false }]);
    setNewItemLabel('');
  };

  const handleUpdate = (itemId: string, updates: Partial<ChecklistItem>) => {
    setItems(prev => updateItemInTree(prev, itemId, updates));
  };

  const handleRemove = (itemId: string) => {
    setItems(prev => removeItemFromTree(prev, itemId));
  };

  const handleAddChild = (parentId: string) => {
    const child: ChecklistItem = { id: crypto.randomUUID(), label: '', optional: false };
    setItems(prev => addChildToItem(prev, parentId, child));
  };

  const moveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    const newItems = [...items];
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setItems(newItems);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    const checklist: StandaloneChecklist = {
      id: id ?? crypto.randomUUID(),
      name: name.trim(),
      emoji,
      description: description.trim(),
      color: 'tertiary',
      items,
      source: existing?.source ?? 'user',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    saveChecklist(checklist);
    navigate('/manage', { replace: true });
  };

  const totalItems = countAllItems(items);

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <svg className="w-6 h-6 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-on-surface">{id ? 'Edit Checklist' : 'New Checklist'}</h1>
      </div>

      {/* Emoji picker */}
      <div className="mb-4">
        <label className="text-sm font-medium text-on-surface-variant mb-2 block">Icon</label>
        <div className="flex flex-wrap gap-2">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all
                ${emoji === e ? 'bg-primary-container scale-110' : 'bg-surface-container-low hover:bg-surface-container'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-on-surface-variant mb-1.5 block">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Bag Check"
          className="w-full px-4 py-3 rounded-2xl bg-surface-container-low text-on-surface
            placeholder:text-outline border-0 outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="mb-6">
        <label className="text-sm font-medium text-on-surface-variant mb-1.5 block">Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g., Things to check before leaving"
          className="w-full px-4 py-3 rounded-2xl bg-surface-container-low text-on-surface
            placeholder:text-outline border-0 outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Items */}
      <div className="mb-6">
        <label className="text-sm font-medium text-on-surface-variant mb-2 block">Items ({totalItems})</label>

        <div className="flex flex-col gap-2 mb-3">
          {items.map((item, index) => (
            <ItemEditor
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onRemove={handleRemove}
              onAddChild={handleAddChild}
              onMoveUp={() => moveItem(index, -1)}
              onMoveDown={() => moveItem(index, 1)}
              isFirst={index === 0}
              isLast={index === items.length - 1}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newItemLabel}
            onChange={e => setNewItemLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="Add an item..."
            className="flex-1 px-4 py-3 rounded-2xl bg-surface-container-low text-on-surface
              placeholder:text-outline border-0 outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={addItem}
            disabled={!newItemLabel.trim()}
            className="px-4 py-3 rounded-2xl bg-primary text-on-primary font-medium text-sm
              disabled:opacity-40 transition-opacity"
          >
            Add
          </button>
        </div>
      </div>

      <BigButton onClick={handleSave} disabled={!name.trim()}>
        {id ? 'Save Changes' : 'Create Checklist'}
      </BigButton>
    </div>
  );
}
