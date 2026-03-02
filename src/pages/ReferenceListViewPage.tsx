import { useParams, useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';

export function ReferenceListViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allReferenceLists } = useContentStore();
  const list = id ? allReferenceLists[id] : null;

  if (!list) {
    return (
      <div className="px-5 pt-12 text-center">
        <p className="text-on-surface-variant">List not found</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors">
          <svg className="w-6 h-6 text-on-surface" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div>
          <h1 className="text-xl font-bold text-on-surface">{list.emoji} {list.name}</h1>
          {list.description && <p className="text-sm text-on-surface-variant">{list.description}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {list.items.map(item => (
          <div key={item.id} className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3">
            {item.emoji && <span className="text-lg">{item.emoji}</span>}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-on-surface">{item.label}</p>
              {item.notes && <p className="text-xs text-on-surface-variant mt-0.5">{item.notes}</p>}
            </div>
          </div>
        ))}
        {list.items.length === 0 && (
          <p className="text-center text-on-surface-variant py-12">This list is empty</p>
        )}
      </div>
    </div>
  );
}
