import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Hook to persist form data across page refreshes
 * @param {string} key - Unique storage key for this form
 * @param {Object} initialData - Initial form data
 * @param {Object} options - Configuration options
 * @returns {Object} Form state and handlers
 */
export function useFormPersist(key, initialData, options = {}) {
  const {
    storage = sessionStorage, // Use sessionStorage by default (clears on tab close)
    debounceMs = 500, // Debounce save interval
    excludeFields = [], // Fields to never persist (e.g., passwords)
    onRestored = null, // Callback when data is restored
  } = options;

  const storageKey = `form_persist_${key}`;
  const debounceTimer = useRef(null);
  const [isRestored, setIsRestored] = useState(false);

  /**
   * Load persisted data
   */
  const loadPersistedData = useCallback(() => {
    try {
      const stored = storage.getItem(storageKey);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      // Validate stored data has expected structure
      if (typeof parsed !== "object" || parsed === null) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }, [storage, storageKey]);

  /**
   * Get initial state (persisted or default)
   */
  const getInitialState = useCallback(() => {
    const persisted = loadPersistedData();
    if (persisted) {
      // Merge persisted data with initial data (in case of new fields)
      return { ...initialData, ...persisted };
    }
    return initialData;
  }, [loadPersistedData, initialData]);

  const [formData, setFormData] = useState(getInitialState);

  /**
   * Save data to storage (debounced)
   */
  const saveToStorage = useCallback(
    (data) => {
      // Clear any pending save
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      debounceTimer.current = setTimeout(() => {
        try {
          // Filter out excluded fields
          const dataToSave = { ...data };
          excludeFields.forEach((field) => {
            delete dataToSave[field];
          });

          storage.setItem(storageKey, JSON.stringify(dataToSave));
        } catch {
          // Storage full or unavailable - ignore
        }
      }, debounceMs);
    },
    [storage, storageKey, debounceMs, excludeFields]
  );

  /**
   * Update form field
   */
  const updateField = useCallback(
    (name, value) => {
      setFormData((prev) => {
        const updated = { ...prev, [name]: value };
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  /**
   * Update multiple fields at once
   */
  const updateFields = useCallback(
    (updates) => {
      setFormData((prev) => {
        const updated = { ...prev, ...updates };
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage]
  );

  /**
   * Handle input change event
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      updateField(name, type === "checkbox" ? checked : value);
    },
    [updateField]
  );

  /**
   * Clear persisted data
   */
  const clearPersisted = useCallback(() => {
    try {
      storage.removeItem(storageKey);
    } catch {
      // Ignore errors
    }
  }, [storage, storageKey]);

  /**
   * Reset form to initial state and clear storage
   */
  const resetForm = useCallback(() => {
    clearPersisted();
    setFormData(initialData);
  }, [clearPersisted, initialData]);

  /**
   * Manually trigger save
   */
  const saveNow = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    try {
      const dataToSave = { ...formData };
      excludeFields.forEach((field) => {
        delete dataToSave[field];
      });

      storage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch {
      // Ignore errors
    }
  }, [storage, storageKey, formData, excludeFields]);

  /**
   * Check if form has unsaved changes
   */
  const hasChanges = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  /**
   * Mark form as successfully submitted (clears storage)
   */
  const onSubmitSuccess = useCallback(() => {
    clearPersisted();
  }, [clearPersisted]);

  // Call onRestored callback if data was restored
  useEffect(() => {
    if (!isRestored) {
      const persisted = loadPersistedData();
      if (persisted && onRestored) {
        onRestored(persisted);
      }
      setIsRestored(true);
    }
  }, [isRestored, loadPersistedData, onRestored]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    formData,
    setFormData: updateFields,
    updateField,
    handleChange,
    resetForm,
    clearPersisted,
    saveNow,
    hasChanges,
    onSubmitSuccess,
    isRestored,
  };
}

export default useFormPersist;
