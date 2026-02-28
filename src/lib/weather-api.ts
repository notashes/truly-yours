import type { WeatherData } from '@/types/weather';
import { getWeatherInfo } from './weather-codes';

const LYON_LAT = 45.76;
const LYON_LON = 4.84;
const CACHE_KEY = 'ty_weather';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function fetchWeather(): Promise<WeatherData> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: WeatherData = JSON.parse(cached);
      if (Date.now() - new Date(data.fetchedAt).getTime() < CACHE_TTL_MS) {
        return data;
      }
    }
  } catch {
    // ignore cache errors
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LYON_LAT}&longitude=${LYON_LON}&current=temperature_2m,weather_code&timezone=Europe/Paris`;
  const res = await fetch(url);

  if (!res.ok) {
    // Return stale cache if available
    const stale = localStorage.getItem(CACHE_KEY);
    if (stale) return JSON.parse(stale);
    throw new Error('Weather fetch failed');
  }

  const json = await res.json();
  const info = getWeatherInfo(json.current.weather_code);

  const weather: WeatherData = {
    temperature: Math.round(json.current.temperature_2m),
    weatherCode: json.current.weather_code,
    weatherLabel: info.label,
    weatherEmoji: info.emoji,
    fetchedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(weather));
  } catch {
    // storage full
  }

  return weather;
}
