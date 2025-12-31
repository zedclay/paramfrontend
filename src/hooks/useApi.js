import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { handleApiError } from '../utils/apiErrorHandler';
import logger from '../utils/logger';

/**
 * Custom hook for API calls with loading and error states
 * @param {Function} apiCall - Async function that returns axios promise
 * @returns {{data: any, loading: boolean, error: string|null, execute: Function, reset: Function}}
 */
export const useApi = (apiCall) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiCall(...args);
        setData(response.data);
        return { success: true, data: response.data };
      } catch (err) {
        const { message } = handleApiError(err);
        setError(message);
        logger.error('API call failed:', err);
        return { success: false, error: message };
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};

/**
 * Hook for fetching data on mount
 * @param {Function} fetchFunction - Async function to fetch data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {{data: any, loading: boolean, error: string|null, refetch: Function}}
 */
export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchFunction();
      setData(response?.data?.data || response?.data || response);
    } catch (err) {
      const { message } = handleApiError(err);
      setError(message);
      logger.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;
