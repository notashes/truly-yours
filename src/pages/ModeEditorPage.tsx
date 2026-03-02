import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';
import { BigButton } from '@/components/ui/BigButton';
import type { Mode } from '@/types/content';

const EMOJIS = ['✨', '🌸', '🏖️', '🌙', '💪', '🏠', '🎯', '🧘', '💊', '🌿', '⚡', '🎨', '❄️', '☀️', '🌧️', '🦋'];

export function ModeEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allProtocols, allChecklists, allModes, saveMode } = useContentStore();
  const isEditing = !!id;
  const existing = isEditing ? allModes.find(m => m.id === id) : null;

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✨');
  const [selectedProtocolIds, setSelectedProtocolIds] = useState<string[]>([]);
  const [selectedChecklistIds, setSelectedChecklistIds] = useState<string[]>([]);

  // All non-sub protocols
  const availableProtocols = Object.values(allProtocols).filter(p => !p.isSubProtocol);
  const availableChecklists = Object.values(allChecklists);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmoji(existing.emoji);
      setSelectedProtocolIds(existing.protocolIds);
      setSelectedChecklistIds(existing.checklistIds);
    }
  }, [existing]);

  const toggleProtocol = (pid: string) => {
    setSelectedProtocolIds(prev =>
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const toggleChecklist = (cid: string) => {
    setSelectedChecklistIds(prev =>
      prev.includes(cid) ? prev.filter(id => id !== cid) : [...prev, cid]
    );
  };

  const handleSave = () => {
    if (!name.trim() || selectedProtocolIds.length === 0) return;

    const modeId = isEditing ? id! : `mode_${Date.now()}`;
    const now = new Date().toISOString();
    const mode: Mode = {
      id: modeId,
      name: name.trim(),
      emoji,
      color: 'primary',
      protocolIds: selectedProtocolIds,
      checklistIds: selectedChecklistIds,
      source: existing?.source ?? 'user',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    saveMode(mode);
    navigate('/manage', { replace: true });
  };

  return (
    <div className="px-5 pt-12 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <svg className="w-6 h-6 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-on-surface">{isEditing ? 'Edit Mode' : 'New Mode'}</h1>
      </div>

      {/* Emoji picker */}
      <div className="mb-4">
        <label className="text-xs text-on-surface-variant mb-2 block">Icon</label>
        <div className="flex flex-wrap gap-2">
          {EMOJIS.map(e => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors
                ${emoji === e ? 'bg-primary-container ring-2 ring-primary' : 'bg-surface-container hover:bg-surface-container-high'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="mb-6">
        <label className="text-xs text-on-surface-variant mb-1 block">Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., PMS Mode, Vacation"
          className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface text-sm border-0 outline-none focus:ring-2 ring-primary"
        />
      </div>

      {/* Protocol selection */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-on-surface mb-3">
          Protocols ({selectedProtocolIds.length} selected)
        </h2>
        <div className="flex flex-col gap-2">
          {availableProtocols.map(proto => {
            const selected = selectedProtocolIds.includes(proto.id);
            return (
              <button
                key={proto.id}
                onClick={() => toggleProtocol(proto.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-colors
                  ${selected ? 'bg-primary-container' : 'bg-surface-container-low hover:bg-surface-container'}`}
              >
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
                  ${selected ? 'bg-primary border-primary' : 'border-outline'}`}>
                  {selected && (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className="text-lg">{proto.emoji}</span>
                <span className={`text-sm font-medium ${selected ? 'text-on-primary-container' : 'text-on-surface'}`}>
                  {proto.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Checklist selection */}
      {availableChecklists.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-on-surface mb-3">
            Checklists ({selectedChecklistIds.length} selected)
          </h2>
          <div className="flex flex-col gap-2">
            {availableChecklists.map(cl => {
              const selected = selectedChecklistIds.includes(cl.id);
              return (
                <button
                  key={cl.id}
                  onClick={() => toggleChecklist(cl.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-colors
                    ${selected ? 'bg-primary-container' : 'bg-surface-container-low hover:bg-surface-container'}`}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0
                    ${selected ? 'bg-primary border-primary' : 'border-outline'}`}>
                    {selected && (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </div>
                  <span className="text-lg">{cl.emoji}</span>
                  <span className={`text-sm font-medium ${selected ? 'text-on-primary-container' : 'text-on-surface'}`}>
                    {cl.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Save */}
      <BigButton
        onClick={handleSave}
        disabled={!name.trim() || selectedProtocolIds.length === 0}
      >
        {isEditing ? 'Save Changes' : 'Create Mode'}
      </BigButton>
    </div>
  );
}
