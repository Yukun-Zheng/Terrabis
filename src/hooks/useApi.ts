import { useState, useCallback } from 'react';
import { fetchJson } from '../utils/api';

export function useApi<T = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const request = useCallback(async (url: string, options?: RequestInit) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchJson<T>(url, options);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, request };
} 