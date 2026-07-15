import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";
import {
  clearAuthData,
  isTokenExpired,
  validateStoredAuth,
} from "../utils/tokenUtils";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Ref to track if we've done initial validation
  const hasValidated = useRef(false);

  // Ref for logout callbacks (e.g., to clear ChatContext)
  const logoutCallbacksRef = useRef([]);

  /**
   * Register a callback to be called on logout
   */
  const registerLogoutCallback = useCallback((callback) => {
    logoutCallbacksRef.current.push(callback);
    // Return unregister function
    return () => {
      logoutCallbacksRef.current = logoutCallbacksRef.current.filter(
        (cb) => cb !== callback
      );
    };
  }, []);

  /**
   * Clear all auth state and notify registered callbacks
   */
  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthError(null);
    clearAuthData();

    // Call all registered logout callbacks
    logoutCallbacksRef.current.forEach((callback) => {
      try {
        callback();
      } catch (err) {
        console.error("Logout callback error:", err);
      }
    });
  }, []);

  /**
   * Logout user and redirect to login
   */
  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  /**
   * Validate token with server
   */
  const validateToken = useCallback(async (tokenToValidate) => {
    if (!tokenToValidate) {
      return false;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`,
        },
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();
      return data.status === "success" && data.user;
    } catch {
      // Network error - don't logout, might be temporary
      return null; // null indicates network error
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback((userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setAuthError(null);
    localStorage.setItem("currentUser", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
  }, []);

  /**
   * Update user data
   */
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user]
  );

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = Boolean(user && token);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initAuth = async () => {
      const { isValid, user: storedUser, token: storedToken } = validateStoredAuth();

      if (!isValid) {
        setIsLoading(false);
        return;
      }

      // Set state from localStorage first
      setUser(storedUser);
      setToken(storedToken);

      // Validate with server if we haven't yet
      if (!hasValidated.current) {
        hasValidated.current = true;
        setIsValidating(true);

        const validationResult = await validateToken(storedToken);

        if (validationResult === false) {
          // Token is invalid, clear auth
          clearAuth();
        } else if (validationResult === null) {
          // Network error - keep current auth state
          setAuthError("Unable to verify session. Please check your connection.");
        }

        setIsValidating(false);
      }

      setIsLoading(false);
    };

    initAuth();
  }, [validateToken, clearAuth]);

  /**
   * Periodically check token expiration
   */
  useEffect(() => {
    if (!token) return;

    const checkExpiry = () => {
      if (isTokenExpired(token, 120)) {
        // Token expired or will expire in 2 minutes
        logout();
      }
    };

    // Check immediately on mount
    checkExpiry();

    // Check every 30 seconds for better coverage
    const interval = setInterval(checkExpiry, 30000);

    return () => clearInterval(interval);
  }, [token, logout]);

  const value = {
    user,
    token,
    isLoading,
    isValidating,
    isAuthenticated,
    authError,
    login,
    logout,
    updateUser,
    hasRole,
    validateToken,
    registerLogoutCallback,
    clearAuthError: () => setAuthError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Hook for protected routes - validates auth on mount
 */
export function useRequireAuth(options = {}) {
  const { redirectTo = "/login", requiredRole = null } = options;
  const auth = useAuth();
  const navigate = useNavigate();

  // Memoize the role check result to avoid stale closure issues
  const hasRequiredRole = requiredRole ? auth.hasRole(requiredRole) : true;

  useEffect(() => {
    if (auth.isLoading) return;

    if (!auth.isAuthenticated) {
      navigate(redirectTo, { replace: true });
      return;
    }

    if (requiredRole && !hasRequiredRole) {
      navigate("/", { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, hasRequiredRole, requiredRole, redirectTo, navigate]);

  return auth;
}

export default AuthContext;
