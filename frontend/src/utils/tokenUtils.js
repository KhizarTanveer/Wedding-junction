/**
 * JWT token utilities
 */

/**
 * Parse a JWT token to extract payload
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function parseToken(token) {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode base64url to base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const jsonPayload = decodeURIComponent(
      atob(base64 + padding)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Check if a token is expired
 * @param {string} token - JWT token
 * @param {number} bufferSeconds - Buffer time before actual expiry (default 60 seconds)
 * @returns {boolean} True if expired or invalid
 */
export function isTokenExpired(token, bufferSeconds = 60) {
  const payload = parseToken(token);

  if (!payload || !payload.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expiryTime = payload.exp * 1000;
  const bufferMs = bufferSeconds * 1000;

  return Date.now() >= expiryTime - bufferMs;
}

/**
 * Get time until token expires
 * @param {string} token - JWT token
 * @returns {number|null} Milliseconds until expiry, or null if invalid
 */
export function getTokenTimeRemaining(token) {
  const payload = parseToken(token);

  if (!payload || !payload.exp) {
    return null;
  }

  const expiryTime = payload.exp * 1000;
  const remaining = expiryTime - Date.now();

  return remaining > 0 ? remaining : 0;
}

/**
 * Extract user ID from token
 * @param {string} token - JWT token
 * @returns {string|null} User ID or null
 */
export function getUserIdFromToken(token) {
  const payload = parseToken(token);
  return payload?.id || payload?.userId || payload?.sub || null;
}

/**
 * Extract user role from token
 * @param {string} token - JWT token
 * @returns {string|null} User role or null
 */
export function getUserRoleFromToken(token) {
  const payload = parseToken(token);
  return payload?.role || null;
}

/**
 * Get token from localStorage safely
 * @returns {string|null} Token or null
 */
export function getStoredToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

/**
 * Get current user from localStorage safely
 * @returns {Object|null} User object or null
 */
export function getStoredUser() {
  try {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuthData() {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  } catch {
    // Ignore errors
  }
}

/**
 * Validate stored auth data
 * @returns {Object} { isValid: boolean, user: Object|null, token: string|null, shouldRefresh: boolean }
 */
export function validateStoredAuth() {
  const token = getStoredToken();
  const user = getStoredUser();

  if (!token || !user) {
    return { isValid: false, user: null, token: null, shouldRefresh: false };
  }

  if (isTokenExpired(token, 0)) {
    clearAuthData();
    return { isValid: false, user: null, token: null, shouldRefresh: false };
  }

  // Check if token will expire soon (within 5 minutes)
  const shouldRefresh = isTokenExpired(token, 300);

  return { isValid: true, user, token, shouldRefresh };
}

export default {
  parseToken,
  isTokenExpired,
  getTokenTimeRemaining,
  getUserIdFromToken,
  getUserRoleFromToken,
  getStoredToken,
  getStoredUser,
  clearAuthData,
  validateStoredAuth,
};
