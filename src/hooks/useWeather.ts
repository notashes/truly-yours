import { useState, useEffect } from 'react';
import type { WeatherData } from '@/types/weather';
import { fetchWeather } from '@/lib/weather-api';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchWeather()
      .then(data => {
        if (!cancelled) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  return { weather, loading, error };
}
