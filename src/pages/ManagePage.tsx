import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';
import { BottomSheet } from '@/components/ui/BottomSheet';

type Tab = 'protocols' | 'checklists' | 'lists' | 'modes';

export function ManagePage() {
  const navigate = useNavigate();
  const {
    allProtocols,
    allChecklists, allReferenceLists,
    allModes,
    deleteProtocol, duplicateProtocol,
    deleteChecklist, deleteReferenceList,
    deleteMode,
  } = useContentStore();
  const [tab, setTab] = useState<Tab>('protocols');
  const [showCreate, setShowCreate] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string; name: string } | null>(null);

  const allProtoList = Object.values(allProtocols).filter(p => !p.isSubProtocol);
  const allCheckList = Object.values(allChecklists);
  const allRefList = Object.values(allReferenceLists);

  const handleDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'protocol' || confirmDelete.type === 'protocol-reset') deleteProtocol(confirmDelete.id);
    else if (confirmDelete.type === 'checklist') deleteChecklist(confirmDelete.id);
    else if (confirmDelete.type === 'list') deleteReferenceList(confirmDelete.id);
    else if (confirmDelete.type === 'mode') deleteMode(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div className="px-5 pt-12 pb-6">
      <h1 className="text-[28px] font-bold text-on-surface tracking-tight mb-6">My Stuff</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {([['protocols', 'Protocols'], ['checklists', 'Checklists'], ['lists', 'Lists'], ['modes', 'Modes']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
              ${tab === key
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Protocols tab */}
      {tab === 'protocols' && (
        <div className="flex flex-col gap-2">
          {allProtoList.length === 0 && (
            <p className="text-center text-on-surface-variant py-12">No protocols yet</p>
          )}
          {allProtoList.map(proto => (
            <div key={proto.id} className="bg-surface-container-low rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{proto.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface text-sm truncate">{proto.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {proto.source === 'default' ? 'Built-in' : proto.source === 'user-modified' ? 'Customized' : 'Custom'}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/manage/protocols/${proto.id}/edit`)}
                    className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                    title="Edit"
                  >
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const copy = duplicateProtocol(proto.id);
                      if (copy) navigate(`/manage/protocols/${copy.id}/edit`);
                    }}
                    className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                    title="Duplicate"
                  >
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                  </button>
                  {proto.source === 'user-modified' && (
                    <button
                      onClick={() => setConfirmDelete({ type: 'protocol-reset', id: proto.id, name: proto.name })}
                      className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                      title="Reset to default"
                    >
                      <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                    </button>
                  )}
                  {proto.source === 'user' && (
                    <button
                      onClick={() => setConfirmDelete({ type: 'protocol', id: proto.id, name: proto.name })}
                      className="p-2 rounded-full hover:bg-error-container transition-colors"
                      title="Delete"
                    >
                      <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checklists tab */}
      {tab === 'checklists' && (
        <div className="flex flex-col gap-2">
          {allCheckList.length === 0 && (
            <p className="text-center text-on-surface-variant py-12">No checklists yet. Tap + to create one.</p>
          )}
          {allCheckList.map(cl => (
            <div key={cl.id} className="bg-surface-container-low rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{cl.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface text-sm truncate">{cl.name}</p>
                  <p className="text-xs text-on-surface-variant">{cl.items.length} items</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/manage/checklists/${cl.id}`)}
                    className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                    title="Run"
                  >
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate(`/manage/checklists/${cl.id}/edit`)}
                    className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                  >
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ type: 'checklist', id: cl.id, name: cl.name })}
                    className="p-2 rounded-full hover:bg-error-container transition-colors"
                  >
                    <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reference Lists tab */}
      {tab === 'lists' && (
        <div className="flex flex-col gap-2">
          {allRefList.length === 0 && (
            <p className="text-center text-on-surface-variant py-12">No lists yet. Tap + to create one.</p>
          )}
          {allRefList.map(rl => (
            <div key={rl.id} className="bg-surface-container-low rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{rl.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface text-sm truncate">{rl.name}</p>
                  <p className="text-xs text-on-surface-variant">{rl.items.length} items</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/manage/reference-lists/${rl.id}`)}
                    className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                    title="View"
                  >
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => navigate(`/manage/reference-lists/${rl.id}/edit`)}
                    className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                  >
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ type: 'list', id: rl.id, name: rl.name })}
                    className="p-2 rounded-full hover:bg-error-container transition-colors"
                  >
                    <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modes tab */}
      {tab === 'modes' && (
        <div className="flex flex-col gap-2">
          <div className="bg-surface-container-low rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                <span className="text-lg">✨</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-on-surface text-sm">Normal</p>
                <p className="text-xs text-on-surface-variant">All protocols &middot; Built-in</p>
              </div>
            </div>
          </div>
          {allModes.filter(m => m.id !== '__default__').map(mode => (
            <div key={mode.id} className="bg-surface-container-low rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{mode.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-on-surface text-sm truncate">{mode.name}</p>
                  <p className="text-xs text-on-surface-variant">{mode.protocolIds.length} protocols</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => navigate(`/manage/modes/${mode.id}/edit`)}
                    className="p-2 rounded-full hover:bg-surface-variant transition-colors"
                  >
                    <svg className="w-5 h-5 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete({ type: 'mode', id: mode.id, name: mode.name })}
                    className="p-2 rounded-full hover:bg-error-container transition-colors"
                  >
                    <svg className="w-5 h-5 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl bg-primary text-on-primary
          elevation-3 flex items-center justify-center active:scale-95 transition-transform z-30"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Create bottom sheet */}
      <BottomSheet open={showCreate} onClose={() => setShowCreate(false)} title="Create new">
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setShowCreate(false); navigate('/manage/protocols/new'); }}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="text-lg">📋</span>
            </div>
            <div>
              <p className="font-medium text-on-surface">Protocol</p>
              <p className="text-xs text-on-surface-variant">Step-by-step guided flow with branching</p>
            </div>
          </button>
          <button
            onClick={() => { setShowCreate(false); navigate('/manage/checklists/new'); }}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
              <span className="text-lg">✅</span>
            </div>
            <div>
              <p className="font-medium text-on-surface">Checklist</p>
              <p className="text-xs text-on-surface-variant">List of things to check off (any order)</p>
            </div>
          </button>
          <button
            onClick={() => { setShowCreate(false); navigate('/manage/reference-lists/new'); }}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
              <span className="text-lg">📝</span>
            </div>
            <div>
              <p className="font-medium text-on-surface">Reference List</p>
              <p className="text-xs text-on-surface-variant">List of options to browse (e.g., my jumpers)</p>
            </div>
          </button>
          <button
            onClick={() => { setShowCreate(false); navigate('/manage/modes/new'); }}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
              <span className="text-lg">🎭</span>
            </div>
            <div>
              <p className="font-medium text-on-surface">Mode</p>
              <p className="text-xs text-on-surface-variant">A context that filters which protocols show</p>
            </div>
          </button>
        </div>
      </BottomSheet>

      {/* Delete / Reset confirmation */}
      <BottomSheet
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={confirmDelete?.type === 'protocol-reset' ? 'Reset to default?' : 'Delete?'}
      >
        {confirmDelete && (
          <div className="text-center">
            <p className="text-on-surface-variant mb-6">
              {confirmDelete.type === 'protocol-reset'
                ? <>Reset <strong>{confirmDelete.name}</strong> to its original version? Your customizations will be lost.</>
                : <>Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This can't be undone.</>
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-full bg-surface-container text-on-surface font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className={`flex-1 py-3 rounded-full font-medium ${
                  confirmDelete.type === 'protocol-reset'
                    ? 'bg-primary text-on-primary'
                    : 'bg-error text-on-primary'
                }`}
              >
                {confirmDelete.type === 'protocol-reset' ? 'Reset' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
