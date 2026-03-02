import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';
import { protocolToBuilderSteps, builderStepsToProtocol } from '@/engine/protocolSerializer';
import type { BuilderStep, BuilderBranch } from '@/engine/protocolSerializer';
import type { ChecklistItem } from '@/types/protocol';
import { BigButton } from '@/components/ui/BigButton';
import { BottomSheet } from '@/components/ui/BottomSheet';

const EMOJIS = ['📋', '🚿', '🌙', '🧹', '⚡', '👗', '🍳', '🧘', '💊', '🎒', '🏠', '💼', '🎨', '⭐', '🌿', '🔧'];
const STEP_TYPES = [
  { type: 'info' as const, label: 'Show a message', emoji: '💬', desc: 'Display text to read' },
  { type: 'instruction' as const, label: 'Give an instruction', emoji: '👉', desc: 'A step to complete before moving on' },
  { type: 'question' as const, label: 'Ask a question', emoji: '❓', desc: 'Multiple choice with branching paths' },
  { type: 'checklist' as const, label: 'Checklist', emoji: '✅', desc: 'Items to check off' },
  { type: 'timer' as const, label: 'Set a timer', emoji: '⏱️', desc: 'Wait for a set time' },
  { type: 'reference-list-link' as const, label: 'Link a reference list', emoji: '📝', desc: 'Show a browsable list mid-protocol' },
];

function uid() {
  return `step_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function makeDefaultStep(type: BuilderStep['type']): BuilderStep {
  const step: BuilderStep = { tempId: uid(), type, title: '' };
  if (type === 'question') step.options = [{ label: '', emoji: '', steps: [] }, { label: '', emoji: '', steps: [] }];
  if (type === 'checklist') step.checklistItems = [];
  if (type === 'timer') { step.durationMinutes = 5; step.skipAllowed = true; }
  return step;
}

// === Step Editor (inline) ===
function StepEditor({ step, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, referenceLists }: {
  step: BuilderStep;
  onChange: (s: BuilderStep) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  referenceLists: Record<string, { id: string; name: string; emoji: string }>;
}) {
  const [expanded, setExpanded] = useState(!step.title);
  const typeInfo = STEP_TYPES.find(t => t.type === step.type);

  return (
    <div className="bg-surface-container-low rounded-2xl overflow-hidden">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <span className="text-lg">{typeInfo?.emoji ?? '📄'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-on-surface truncate">
            {step.title || <span className="text-on-surface-variant italic">Untitled step</span>}
          </p>
          <p className="text-xs text-on-surface-variant">{typeInfo?.label}</p>
        </div>
        <svg className={`w-5 h-5 text-on-surface-variant transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Expanded editor */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Title</label>
            <input
              value={step.title}
              onChange={e => onChange({ ...step, title: e.target.value })}
              placeholder="What does this step say?"
              className="w-full p-3 rounded-xl bg-surface-container text-on-surface text-sm border-0 outline-none focus:ring-2 ring-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Description (optional)</label>
            <textarea
              value={step.description ?? ''}
              onChange={e => onChange({ ...step, description: e.target.value })}
              placeholder="Extra details or helpful context"
              rows={2}
              className="w-full p-3 rounded-xl bg-surface-container text-on-surface text-sm border-0 outline-none focus:ring-2 ring-primary resize-none"
            />
          </div>

          {/* Encouragement */}
          <div>
            <label className="text-xs text-on-surface-variant mb-1 block">Encouragement (optional)</label>
            <input
              value={step.encouragement ?? ''}
              onChange={e => onChange({ ...step, encouragement: e.target.value })}
              placeholder="e.g., You're doing great!"
              className="w-full p-3 rounded-xl bg-surface-container text-on-surface text-sm border-0 outline-none focus:ring-2 ring-primary"
            />
          </div>

          {/* Type-specific fields */}
          {step.type === 'question' && (
            <QuestionEditor step={step} onChange={onChange} referenceLists={referenceLists} />
          )}
          {step.type === 'checklist' && (
            <ChecklistEditor step={step} onChange={onChange} />
          )}
          {step.type === 'timer' && (
            <TimerEditor step={step} onChange={onChange} />
          )}
          {step.type === 'reference-list-link' && (
            <RefListLinkEditor step={step} onChange={onChange} referenceLists={referenceLists} />
          )}

          {/* Actions bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-outline-variant">
            <button onClick={onMoveUp} disabled={isFirst} className="p-2 rounded-full hover:bg-surface-variant disabled:opacity-30 transition-colors">
              <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
              </svg>
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="p-2 rounded-full hover:bg-surface-variant disabled:opacity-30 transition-colors">
              <svg className="w-4 h-4 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <div className="flex-1" />
            <button onClick={onDelete} className="px-3 py-1.5 rounded-full text-error text-xs font-medium hover:bg-error-container transition-colors">
              Delete step
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// === Question sub-editor ===
function QuestionEditor({ step, onChange, referenceLists }: {
  step: BuilderStep;
  onChange: (s: BuilderStep) => void;
  referenceLists: Record<string, { id: string; name: string; emoji: string }>;
}) {
  const options = step.options ?? [];

  const updateOption = (idx: number, patch: Partial<BuilderBranch>) => {
    const newOpts = options.map((o, i) => i === idx ? { ...o, ...patch } : o);
    onChange({ ...step, options: newOpts });
  };

  const addOption = () => {
    onChange({ ...step, options: [...options, { label: '', emoji: '', steps: [] }] });
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    onChange({ ...step, options: options.filter((_, i) => i !== idx) });
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs text-on-surface-variant">Options</label>
      {options.map((opt, idx) => (
        <div key={idx} className="bg-surface-container rounded-xl p-3">
          <div className="flex gap-2 mb-2">
            <input
              value={opt.emoji ?? ''}
              onChange={e => updateOption(idx, { emoji: e.target.value })}
              placeholder="🔹"
              className="w-12 p-2 rounded-lg bg-surface-container-high text-center text-sm border-0 outline-none"
            />
            <input
              value={opt.label}
              onChange={e => updateOption(idx, { label: e.target.value })}
              placeholder={`Option ${idx + 1}`}
              className="flex-1 p-2 rounded-lg bg-surface-container-high text-on-surface text-sm border-0 outline-none focus:ring-2 ring-primary"
            />
            {options.length > 2 && (
              <button onClick={() => removeOption(idx)} className="p-2 text-error">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* Sub-steps for this branch */}
          {opt.steps.length > 0 && (
            <div className="ml-4 border-l-2 border-outline-variant pl-3 flex flex-col gap-2 mt-2">
              {opt.steps.map((subStep, si) => (
                <StepEditor
                  key={subStep.tempId}
                  step={subStep}
                  onChange={(updated) => {
                    const newSteps = opt.steps.map((s, i) => i === si ? updated : s);
                    updateOption(idx, { steps: newSteps });
                  }}
                  onDelete={() => {
                    updateOption(idx, { steps: opt.steps.filter((_, i) => i !== si) });
                  }}
                  onMoveUp={() => {
                    if (si === 0) return;
                    const arr = [...opt.steps];
                    [arr[si - 1], arr[si]] = [arr[si], arr[si - 1]];
                    updateOption(idx, { steps: arr });
                  }}
                  onMoveDown={() => {
                    if (si === opt.steps.length - 1) return;
                    const arr = [...opt.steps];
                    [arr[si], arr[si + 1]] = [arr[si + 1], arr[si]];
                    updateOption(idx, { steps: arr });
                  }}
                  isFirst={si === 0}
                  isLast={si === opt.steps.length - 1}
                  referenceLists={referenceLists}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => {
              const newStep = makeDefaultStep('info');
              updateOption(idx, { steps: [...opt.steps, newStep] });
            }}
            className="mt-2 ml-4 text-xs text-primary font-medium flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add step after this option
          </button>
        </div>
      ))}
      <button onClick={addOption} className="text-sm text-primary font-medium flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add option
      </button>
    </div>
  );
}

// === Checklist sub-editor ===
function ChecklistEditor({ step, onChange }: { step: BuilderStep; onChange: (s: BuilderStep) => void }) {
  const items = step.checklistItems ?? [];
  const [newLabel, setNewLabel] = useState('');

  const addItem = () => {
    if (!newLabel.trim()) return;
    const item: ChecklistItem = { id: uid(), label: newLabel.trim(), optional: false };
    onChange({ ...step, checklistItems: [...items, item] });
    setNewLabel('');
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-on-surface-variant">Checklist items</label>
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-2 bg-surface-container rounded-xl p-2">
          <input
            value={item.label}
            onChange={e => {
              const newItems = items.map((it, i) => i === idx ? { ...it, label: e.target.value } : it);
              onChange({ ...step, checklistItems: newItems });
            }}
            className="flex-1 p-2 rounded-lg bg-surface-container-high text-on-surface text-sm border-0 outline-none"
          />
          <button
            onClick={() => {
              const newItems = items.map((it, i) => i === idx ? { ...it, optional: !it.optional } : it);
              onChange({ ...step, checklistItems: newItems });
            }}
            className={`text-xs px-2 py-1 rounded-full ${item.optional ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary-container text-on-primary-container'}`}
          >
            {item.optional ? 'optional' : 'required'}
          </button>
          <button
            onClick={() => onChange({ ...step, checklistItems: items.filter((_, i) => i !== idx) })}
            className="p-1 text-error"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="Add an item..."
          className="flex-1 p-3 rounded-xl bg-surface-container text-on-surface text-sm border-0 outline-none focus:ring-2 ring-primary"
        />
        <button onClick={addItem} className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container text-sm font-medium">
          Add
        </button>
      </div>
    </div>
  );
}

// === Timer sub-editor ===
function TimerEditor({ step, onChange }: { step: BuilderStep; onChange: (s: BuilderStep) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-xs text-on-surface-variant mb-1 block">Duration (minutes)</label>
        <input
          type="number"
          value={step.durationMinutes ?? 5}
          onChange={e => onChange({ ...step, durationMinutes: Math.max(1, parseInt(e.target.value) || 1) })}
          min={1}
          className="w-24 p-3 rounded-xl bg-surface-container text-on-surface text-sm border-0 outline-none focus:ring-2 ring-primary"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-on-surface">
        <input
          type="checkbox"
          checked={step.skipAllowed ?? true}
          onChange={e => onChange({ ...step, skipAllowed: e.target.checked })}
          className="w-5 h-5 rounded accent-primary"
        />
        Allow skipping
      </label>
    </div>
  );
}

// === Reference List Link sub-editor ===
function RefListLinkEditor({ step, onChange, referenceLists }: {
  step: BuilderStep;
  onChange: (s: BuilderStep) => void;
  referenceLists: Record<string, { id: string; name: string; emoji: string }>;
}) {
  const lists = Object.values(referenceLists);
  return (
    <div>
      <label className="text-xs text-on-surface-variant mb-1 block">Reference list</label>
      {lists.length === 0 ? (
        <p className="text-sm text-on-surface-variant italic">No reference lists created yet. Create one in My Stuff first.</p>
      ) : (
        <div className="flex flex-col gap-1">
          {lists.map(rl => (
            <button
              key={rl.id}
              onClick={() => onChange({ ...step, referenceListId: rl.id })}
              className={`flex items-center gap-2 p-3 rounded-xl text-left transition-colors text-sm
                ${step.referenceListId === rl.id ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'}`}
            >
              <span>{rl.emoji}</span>
              <span className="font-medium">{rl.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// === Main Builder Page ===
export function ProtocolBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allProtocols, allReferenceLists, saveProtocol } = useContentStore();
  const isEditing = !!id;
  const existing = id ? allProtocols[id] : null;

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📋');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('primary');
  const [steps, setSteps] = useState<BuilderStep[]>([]);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Load existing protocol for editing
  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setEmoji(existing.emoji);
      setDescription(existing.description);
      setColor(existing.color);
      setSteps(protocolToBuilderSteps(existing));
    }
  }, [existing]);

  const addStep = (type: BuilderStep['type']) => {
    setSteps(prev => [...prev, makeDefaultStep(type)]);
    setShowTypePicker(false);
  };

  const updateStep = (idx: number, updated: BuilderStep) => {
    setSteps(prev => prev.map((s, i) => i === idx ? updated : s));
  };

  const deleteStep = (idx: number) => {
    setSteps(prev => prev.filter((_, i) => i !== idx));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    setSteps(prev => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const handleSave = () => {
    if (!name.trim() || steps.length === 0) return;

    const protocolId = isEditing ? id! : `protocol_${Date.now()}`;
    const protocol = builderStepsToProtocol(steps, {
      id: protocolId,
      name: name.trim(),
      emoji,
      description: description.trim(),
      color,
    });

    // Preserve existing metadata on edit
    if (existing) {
      protocol.source = existing.source === 'default' ? 'user-modified' : existing.source;
      protocol.createdAt = existing.createdAt ?? protocol.createdAt;
      protocol.baseProtocolId = existing.baseProtocolId;
    }

    saveProtocol(protocol);
    navigate('/manage', { replace: true });
  };

  const refListsSimple = Object.fromEntries(
    Object.entries(allReferenceLists).map(([k, v]) => [k, { id: v.id, name: v.name, emoji: v.emoji }])
  );

  return (
    <div className="px-5 pt-12 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <svg className="w-6 h-6 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-on-surface">{isEditing ? 'Edit Protocol' : 'New Protocol'}</h1>
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
      <div className="mb-4">
        <label className="text-xs text-on-surface-variant mb-1 block">Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Morning Routine"
          className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface text-sm border-0 outline-none focus:ring-2 ring-primary"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="text-xs text-on-surface-variant mb-1 block">Description (optional)</label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g., A gentle way to start the day"
          className="w-full p-3 rounded-xl bg-surface-container-low text-on-surface text-sm border-0 outline-none focus:ring-2 ring-primary"
        />
      </div>

      {/* Color (hidden from complexity, just use default) */}
      <input type="hidden" value={color} />

      {/* Steps */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-on-surface mb-3">Steps ({steps.length})</h2>
        <div className="flex flex-col gap-2">
          {steps.map((step, idx) => (
            <StepEditor
              key={step.tempId}
              step={step}
              onChange={updated => updateStep(idx, updated)}
              onDelete={() => deleteStep(idx)}
              onMoveUp={() => moveStep(idx, -1)}
              onMoveDown={() => moveStep(idx, 1)}
              isFirst={idx === 0}
              isLast={idx === steps.length - 1}
              referenceLists={refListsSimple}
            />
          ))}
        </div>

        <button
          onClick={() => setShowTypePicker(true)}
          className="mt-3 w-full py-3 rounded-2xl border-2 border-dashed border-outline-variant text-on-surface-variant text-sm font-medium flex items-center justify-center gap-2 hover:border-primary hover:text-primary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Step
        </button>
      </div>

      {/* Save button */}
      <BigButton
        onClick={handleSave}
        disabled={!name.trim() || steps.length === 0}
      >
        {isEditing ? 'Save Changes' : 'Create Protocol'}
      </BigButton>

      {/* Step type picker */}
      <BottomSheet open={showTypePicker} onClose={() => setShowTypePicker(false)} title="Add a step">
        <div className="flex flex-col gap-2">
          {STEP_TYPES.map(st => (
            <button
              key={st.type}
              onClick={() => addStep(st.type)}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
                <span className="text-lg">{st.emoji}</span>
              </div>
              <div>
                <p className="font-medium text-on-surface">{st.label}</p>
                <p className="text-xs text-on-surface-variant">{st.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
