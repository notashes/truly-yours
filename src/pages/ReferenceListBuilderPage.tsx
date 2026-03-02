import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';
import type { ReferenceList, ReferenceListItem } from '@/types/content';
import { BigButton } from '@/components/ui/BigButton';

const EMOJI_OPTIONS = ['📝', '👕', '👗', '🧥', '👜', '🎒', '🍽️', '💊', '🧴', '🏠', '📦', '🛒', '⭐', '💡', '🎯', '📌'];

export function ReferenceListBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allReferenceLists, saveReferenceList } = useContentStore();

  const existing = id ? allReferenceLists[id] : null;

  const [name, setName] = useState(existing?.name ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '📝');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [items, setItems] = useState<ReferenceListItem[]>(existing?.items ?? []);
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
    setItems(prev => [...prev, { id: crypto.randomUUID(), label: newItemLabel.trim() }]);
    setNewItemLabel('');
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const updateItem = (itemId: string, updates: Partial<ReferenceListItem>) => {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...updates } : i));
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
    const list: ReferenceList = {
      id: id ?? crypto.randomUUID(),
      name: name.trim(),
      emoji,
      description: description.trim(),
      color: 'secondary',
      items,
      source: existing?.source ?? 'user',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    saveReferenceList(list);
    navigate('/manage', { replace: true });
  };

  return (
    <div className="px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <svg className="w-6 h-6 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-on-surface">{id ? 'Edit List' : 'New Reference List'}</h1>
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

      {/* Name */}
      <div className="mb-4">
        <label className="text-sm font-medium text-on-surface-variant mb-1.5 block">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., My Jumpers"
          className="w-full px-4 py-3 rounded-2xl bg-surface-container-low text-on-surface
            placeholder:text-outline border-0 outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="text-sm font-medium text-on-surface-variant mb-1.5 block">Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g., Clean jumpers I can wear"
          className="w-full px-4 py-3 rounded-2xl bg-surface-container-low text-on-surface
            placeholder:text-outline border-0 outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Items */}
      <div className="mb-6">
        <label className="text-sm font-medium text-on-surface-variant mb-2 block">Items ({items.length})</label>

        <div className="flex flex-col gap-2 mb-3">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2 bg-surface-container-low rounded-2xl p-3">
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveItem(index, -1)} disabled={index === 0}
                  className="text-on-surface-variant disabled:opacity-20 p-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                  </svg>
                </button>
                <button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1}
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
                  onChange={e => updateItem(item.id, { label: e.target.value })}
                  className="w-full bg-transparent text-sm text-on-surface outline-none font-medium"
                />
                <input
                  type="text"
                  value={item.notes ?? ''}
                  onChange={e => updateItem(item.id, { notes: e.target.value || undefined })}
                  placeholder="Notes (optional)"
                  className="w-full bg-transparent text-xs text-on-surface-variant outline-none mt-0.5"
                />
              </div>
              <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-full hover:bg-error-container transition-colors flex-shrink-0">
                <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add new item */}
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
        {id ? 'Save Changes' : 'Create List'}
      </BigButton>
    </div>
  );
}
