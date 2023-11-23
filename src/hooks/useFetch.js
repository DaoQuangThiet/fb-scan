import { useCallback, useEffect, useState } from 'react';

const defaultOptions = {
  enabled: true,
};

/**
 * Executes an array of asynchronous functions sequentially and collects their results,
 * args of current execute function is result of previous function
 */
async function executeSequentially(fns) {
  return fns.reduce(async (prevPromise, currentFn) => {
    const previousResult = await prevPromise;
    const result = await currentFn(...previousResult);
    return [...previousResult, result];
  }, Promise.resolve([]));
}

export function useDependentFetch(
  fns,
  { enabled = true, initialData, onError } = defaultOptions
) {
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState();

  const fetchData = useCallback(async () => {
    if (fns.length === 0 || !enabled) return;
    try {
      setIsLoading(true);
      const _data = await executeSequentially(fns);
      setData(_data);
    } catch (err) {
      setErrors(err);
      console.log('Feching Fail!', err);
      onError?.(err.message);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fns.length, enabled]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    errors,
  };
}
