import { useHistory } from '@/hooks/useHistory';
import { useContentStore } from '@/store/useContentStore';

export function HistoryPage() {
  const { runs } = useHistory();
  const { allProtocols } = useContentStore();

  return (
    <div className="px-5 pt-12 pb-6">
      <h1 className="text-[28px] font-bold text-on-surface tracking-tight mb-6">History</h1>

      {runs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-on-surface-variant font-medium">No completed protocols yet</p>
          <p className="text-outline text-sm mt-1">Your progress will show up here</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {runs.map(run => {
            const protocol = allProtocols[run.protocolId];
            const date = new Date(run.startedAt);

            return (
              <div
                key={run.id}
                className="bg-surface-container-low rounded-2xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">{protocol?.emoji ?? '📋'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-on-surface text-sm truncate">
                      {protocol?.name ?? run.protocolId}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {' '}
                      {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {run.stoppedEarly ? (
                      <span className="text-xs font-medium bg-surface-variant text-on-surface-variant px-2.5 py-1 rounded-full">partial</span>
                    ) : (
                      <span className="text-xs font-medium bg-success-container text-success px-2.5 py-1 rounded-full">done</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
