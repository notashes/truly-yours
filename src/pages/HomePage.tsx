import { useNavigate } from 'react-router-dom';
import { useContentStore } from '@/store/useContentStore';
import { WeatherDisplay } from '@/components/weather/WeatherDisplay';
import { ModeSwitcher } from '@/components/ModeSwitcher';

export function HomePage() {
  const navigate = useNavigate();
  const { visibleProtocols, visibleChecklists, allModes } = useContentStore();

  return (
    <div className="px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-[28px] font-bold text-on-surface tracking-tight">Truly Yours</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">What would you like to do?</p>
        </div>
        <WeatherDisplay />
      </div>

      {/* Mode switcher — only show when there are user modes */}
      {allModes.length > 1 && (
        <div className="mb-6">
          <ModeSwitcher />
        </div>
      )}

      {/* Protocol grid */}
      <div className="grid grid-cols-2 gap-3">
        {visibleProtocols.map((protocol, i) => (
          <button
            key={protocol.id}
            onClick={() => navigate(`/protocol/${protocol.id}`)}
            className={`bg-surface-container-low rounded-[20px] p-5
              hover:bg-surface-container transition-all active:scale-[0.97]
              flex flex-col items-center gap-3 text-center cursor-pointer ripple
              ${i === visibleProtocols.length - 1 && visibleProtocols.length % 2 !== 0 ? 'col-span-1' : ''}`}
          >
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <span className="text-2xl">{protocol.emoji}</span>
            </div>
            <span className="text-sm font-medium text-on-surface leading-tight">{protocol.name}</span>
          </button>
        ))}
      </div>

      {/* Standalone checklists */}
      {Object.keys(visibleChecklists).length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-on-surface mt-8 mb-3">Checklists</h2>
          <div className="flex flex-col gap-2">
            {Object.values(visibleChecklists).map(checklist => (
              <button
                key={checklist.id}
                onClick={() => navigate(`/manage/checklists/${checklist.id}`)}
                className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-3
                  hover:bg-surface-container transition-all active:scale-[0.98] cursor-pointer ripple text-left"
              >
                <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{checklist.emoji}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-on-surface">{checklist.name}</span>
                  {checklist.description && (
                    <p className="text-xs text-on-surface-variant mt-0.5">{checklist.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
