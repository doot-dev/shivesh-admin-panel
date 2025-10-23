import { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";

/**
 * Generic fetch hook for GET requests
 * @param {Function} fetchFunction - The API call function to execute
 * @param {Array} dependencies - Dependencies array for useEffect
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to fetch on mount (default: true)
 * @param {boolean} options.showToast - Whether to show error toast (default: true)
 * @param {Function} options.onSuccess - Callback function on success
 * @param {Function} options.onError - Callback function on error
 * @returns {Object} { data, loading, error, refetch }
 */
export const useFetch = (
  fetchFunction,
  dependencies = [],
  options = {}
) => {
  const {
    autoFetch = true,
    showToast = true,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction();
      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err?.message || "An error occurred while fetching data";
      setError(errorMessage);

      if (showToast) {
        toast.error(errorMessage);
      }

      if (onError) {
        onError(err);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, onSuccess, onError, showToast]);

  useEffect(() => {
    if (autoFetch) {
      refetch();
    }
  }, [autoFetch, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
    setData, // Allows manual state updates when needed
  };
};
