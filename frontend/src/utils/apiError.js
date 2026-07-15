/**
 * Error types for API error classification
 */
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR', // 409 - duplicate
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * User-friendly error messages for each error type
 */
export const ErrorMessages = {
  [ErrorTypes.NETWORK_ERROR]: 'Connection error. Please check your internet and try again.',
  [ErrorTypes.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorTypes.AUTH_ERROR]: 'Please log in to continue.',
  [ErrorTypes.NOT_FOUND_ERROR]: 'The requested resource was not found.',
  [ErrorTypes.CONFLICT_ERROR]: 'This action has already been completed.',
  [ErrorTypes.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment and try again.',
  [ErrorTypes.SERVER_ERROR]: 'Server error. Please try again later.',
  [ErrorTypes.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

/**
 * Classify an API error based on the response and error object
 * @param {Error|null} error - The error object (if fetch failed)
 * @param {Response|null} response - The fetch Response object (if available)
 * @param {Object|null} responseBody - The parsed response body (if available)
 * @returns {Object} Classified error with type, message, and details
 */
export function classifyError(error, response, responseBody = null) {
  // Network error - no response at all
  if (!response && error) {
    return {
      type: ErrorTypes.NETWORK_ERROR,
      message: ErrorMessages[ErrorTypes.NETWORK_ERROR],
      details: error.message,
      isRetryable: true,
    };
  }

  // No response and no error - unknown state
  if (!response) {
    return {
      type: ErrorTypes.UNKNOWN_ERROR,
      message: ErrorMessages[ErrorTypes.UNKNOWN_ERROR],
      details: null,
      isRetryable: true,
    };
  }

  const status = response.status;
  const serverMessage = responseBody?.message || null;

  // 400 - Bad Request / Validation Error
  if (status === 400) {
    return {
      type: ErrorTypes.VALIDATION_ERROR,
      message: serverMessage || ErrorMessages[ErrorTypes.VALIDATION_ERROR],
      details: responseBody?.errors || null,
      isRetryable: false,
    };
  }

  // 401/403 - Authentication/Authorization Error
  if (status === 401 || status === 403) {
    return {
      type: ErrorTypes.AUTH_ERROR,
      message: serverMessage || ErrorMessages[ErrorTypes.AUTH_ERROR],
      details: null,
      isRetryable: false,
      shouldLogout: status === 401,
    };
  }

  // 404 - Not Found
  if (status === 404) {
    return {
      type: ErrorTypes.NOT_FOUND_ERROR,
      message: serverMessage || ErrorMessages[ErrorTypes.NOT_FOUND_ERROR],
      details: null,
      isRetryable: false,
    };
  }

  // 409 - Conflict (duplicate resource)
  if (status === 409) {
    return {
      type: ErrorTypes.CONFLICT_ERROR,
      message: serverMessage || ErrorMessages[ErrorTypes.CONFLICT_ERROR],
      details: null,
      isRetryable: false,
    };
  }

  // 429 - Rate Limit
  if (status === 429) {
    return {
      type: ErrorTypes.RATE_LIMIT_ERROR,
      message: serverMessage || ErrorMessages[ErrorTypes.RATE_LIMIT_ERROR],
      details: null,
      isRetryable: true,
    };
  }

  // 5xx - Server Error
  if (status >= 500) {
    return {
      type: ErrorTypes.SERVER_ERROR,
      message: serverMessage || ErrorMessages[ErrorTypes.SERVER_ERROR],
      details: null,
      isRetryable: true,
    };
  }

  // Default for other 4xx errors
  if (status >= 400 && status < 500) {
    return {
      type: ErrorTypes.UNKNOWN_ERROR,
      message: serverMessage || ErrorMessages[ErrorTypes.UNKNOWN_ERROR],
      details: null,
      isRetryable: false,
    };
  }

  return {
    type: ErrorTypes.UNKNOWN_ERROR,
    message: ErrorMessages[ErrorTypes.UNKNOWN_ERROR],
    details: null,
    isRetryable: true,
  };
}

/**
 * Helper to create a classified error from a fetch call
 * @param {Error} error - The caught error
 * @returns {Object} Classified network error
 */
export function createNetworkError(error) {
  return classifyError(error, null, null);
}

/**
 * Helper to check if an error is a specific type
 * @param {Object} classifiedError - The classified error object
 * @param {string} errorType - The error type to check
 * @returns {boolean}
 */
export function isErrorType(classifiedError, errorType) {
  return classifiedError?.type === errorType;
}

export default {
  ErrorTypes,
  ErrorMessages,
  classifyError,
  createNetworkError,
  isErrorType,
};
