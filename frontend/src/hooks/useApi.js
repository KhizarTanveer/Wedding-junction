import { useState, useEffect, useRef } from "react";
import { API_URL } from "../config/api";

export function useApi(endpoint, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track if component is mounted to prevent state updates after unmount
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cancel any in-flight request from previous render
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const fetchData = async () => {
      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}${endpoint}`, {
          signal: abortController.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch data");
        const result = await res.json();

        // Only update state if request wasn't aborted
        if (!abortController.signal.aborted) {
          setData(result.data || result.vendors || result);
          setLoading(false);
        }
      } catch (err) {
        // Ignore abort errors - these are expected on cleanup
        if (err.name === "AbortError") {
          return;
        }
        if (!abortController.signal.aborted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    if (endpoint) {
      fetchData();
    }

    // Cleanup: abort the request when component unmounts or dependencies change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, ...dependencies]);

  return { data, loading, error };
}

export function useFeaturedVendors() {
  return useApi("/api/vendors/featured");
}

export function useCategories() {
  return useApi("/api/categories");
}

export function useCategoryByName(name) {
  return useApi(name ? `/api/categories/${name}` : null);
}

export function useVendorsByCategory(categoryName) {
  return useApi(categoryName ? `/api/vendors/category/${categoryName}` : null);
}

export function useVendorById(id) {
  return useApi(id ? `/api/vendors/${id}` : null);
}

export function useServices() {
  return useApi("/api/services");
}
