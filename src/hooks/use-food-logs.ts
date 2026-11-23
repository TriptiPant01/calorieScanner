import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { fetchRecentFoodLogs, subscribeToFoodLogChanges, type FoodLog } from '@/lib/meals';

/**
 * Loads the last `days` days of logged food. Reloads when the screen gains focus
 * and whenever a meal is saved anywhere in the app.
 */
export function useFoodLogs(days = 7) {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setLogs(await fetchRecentFoodLogs(days));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useEffect(() => subscribeToFoodLogChanges(load), [load]);

  return { logs, loading, error };
}
