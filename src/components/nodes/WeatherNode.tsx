import { useWeather } from '@/hooks/useWeather';
import type { WeatherQuestionNode } from '@/types/protocol';
import { OptionCard } from '@/components/ui/OptionCard';

interface WeatherNodeProps {
  node: WeatherQuestionNode;
  onSelect: (nextNodeId: string) => void;
}

export function WeatherNodeComponent({ node, onSelect }: WeatherNodeProps) {
  const { weather, loading, error } = useWeather();

  if (loading) {
    return (
      <div className="animate-fade-in flex flex-col items-center gap-6 px-6 py-10 text-center">
        <div className="text-4xl animate-pulse-soft">🌡️</div>
        <p className="text-base text-on-surface-variant">Checking the weather...</p>
      </div>
    );
  }

  if (weather && !error) {
    const adjustedTemp = weather.temperature;
    const matchedRange = node.temperatureRanges.find(
      r => adjustedTemp >= r.minTemp && adjustedTemp < r.maxTemp
    );

    return (
      <div className="animate-fade-in flex flex-col items-center gap-5 px-6 py-10 text-center">
        <h2 className="text-[22px] font-semibold text-on-surface leading-tight">{node.title}</h2>

        <div className="bg-surface-container rounded-[28px] p-6 w-full">
          <div className="text-5xl mb-2">{weather.weatherEmoji}</div>
          <p className="text-4xl font-semibold text-on-surface">{weather.temperature}°C</p>
          <p className="text-on-surface-variant text-sm mt-1">{weather.weatherLabel} in Lyon</p>
        </div>

        {matchedRange && (
          <div className="w-full mt-2">
            <p className="text-on-surface-variant text-sm mb-3">Based on the weather:</p>
            <OptionCard
              label={matchedRange.label}
              emoji="👗"
              onClick={() => onSelect(matchedRange.nextNodeId)}
            />
          </div>
        )}

        {!matchedRange && (
          <div className="w-full flex flex-col gap-2.5 mt-2">
            <p className="text-on-surface-variant text-sm">Choose what feels right:</p>
            {node.temperatureRanges.map((range, idx) => (
              <OptionCard
                key={idx}
                label={range.label}
                onClick={() => onSelect(range.nextNodeId)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in flex flex-col items-center gap-5 px-6 py-10 text-center">
      <h2 className="text-[22px] font-semibold text-on-surface leading-tight">{node.title}</h2>
      <p className="text-on-surface-variant text-sm">Couldn't check the weather. What does it feel like?</p>
      <div className="w-full flex flex-col gap-2.5">
        {node.temperatureRanges.map((range, idx) => (
          <OptionCard
            key={idx}
            label={range.label}
            onClick={() => onSelect(range.nextNodeId)}
          />
        ))}
      </div>
    </div>
  );
}
