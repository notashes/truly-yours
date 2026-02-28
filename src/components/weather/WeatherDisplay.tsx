import { useWeather } from '@/hooks/useWeather';

export function WeatherDisplay() {
  const { weather, loading } = useWeather();

  if (loading || !weather) return null;

  return (
    <div className="flex items-center gap-1.5 bg-surface-container rounded-full px-3 py-1.5">
      <span className="text-sm">{weather.weatherEmoji}</span>
      <span className="text-sm font-medium text-on-surface">{weather.temperature}°</span>
    </div>
  );
}
