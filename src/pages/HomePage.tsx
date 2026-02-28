import { useNavigate } from 'react-router-dom';
import { mainProtocols } from '@/protocols';
import { WeatherDisplay } from '@/components/weather/WeatherDisplay';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-12 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-[28px] font-bold text-on-surface tracking-tight">Truly Yours</h1>
          <p className="text-on-surface-variant text-sm mt-0.5">What would you like to do?</p>
        </div>
        <WeatherDisplay />
      </div>

      {/* Protocol grid */}
      <div className="grid grid-cols-2 gap-3">
        {mainProtocols.map((protocol, i) => (
          <button
            key={protocol.id}
            onClick={() => navigate(`/protocol/${protocol.id}`)}
            className={`bg-surface-container-low rounded-[20px] p-5
              hover:bg-surface-container transition-all active:scale-[0.97]
              flex flex-col items-center gap-3 text-center cursor-pointer ripple
              ${i === mainProtocols.length - 1 && mainProtocols.length % 2 !== 0 ? 'col-span-1' : ''}`}
          >
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <span className="text-2xl">{protocol.emoji}</span>
            </div>
            <span className="text-sm font-medium text-on-surface leading-tight">{protocol.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
