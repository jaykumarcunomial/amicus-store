"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthContextType, LoginCredentials, User } from '../types/auth';
import { loginUser, getAuthUser, refreshAccessToken, purgeUserCache, updateUserProfile } from '../actions/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'dummyjson_access_token',
  REFRESH_TOKEN: 'dummyjson_refresh_token',
  USER: 'dummyjson_user',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to set cookie for server-side or cross-tab awareness
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Clear session helper
  const logout = useCallback(async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      deleteCookie(STORAGE_KEYS.ACCESS_TOKEN);
      deleteCookie(STORAGE_KEYS.REFRESH_TOKEN);
      deleteCookie(STORAGE_KEYS.USER);
    }

    if (typeof purgeUserCache === 'function') {
      try {
        await purgeUserCache();
      } catch (err) {
        console.error('Error purging server user cache on logout:', err);
      }
    }
  }, []);

  // Save session helper
  const saveSession = useCallback((token: string, rToken: string, userData: User) => {
    setAccessToken(token);
    setRefreshToken(rToken);
    setUser(userData);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, rToken);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setCookie(STORAGE_KEYS.ACCESS_TOKEN, token);
      setCookie(STORAGE_KEYS.REFRESH_TOKEN, rToken);
      setCookie(STORAGE_KEYS.USER, JSON.stringify(userData));
    }
  }, []);

  // Refresh token helper
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const currentRefreshToken = refreshToken || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) : null);
    if (!currentRefreshToken) {
      logout();
      return false;
    }

    try {
      const res = await refreshAccessToken(currentRefreshToken);
      if (res.success && res.data) {
        setAccessToken(res.data.accessToken);
        setRefreshToken(res.data.refreshToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.data.accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, res.data.refreshToken);
          setCookie(STORAGE_KEYS.ACCESS_TOKEN, res.data.accessToken);
          setCookie(STORAGE_KEYS.REFRESH_TOKEN, res.data.refreshToken);
        }
        return true;
      } else {
        logout();
        return false;
      }
    } catch {
      logout();
      return false;
    }
  }, [refreshToken, logout]);

  // Validate session against /auth/me
  const validateSession = useCallback(async (): Promise<User | null> => {
    const currentToken = accessToken || (typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) : null);
    if (!currentToken) return null;

    try {
      const res = await getAuthUser(currentToken);
      if (res.success && res.data) {
        setUser(res.data);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data));
          setCookie(STORAGE_KEYS.USER, JSON.stringify(res.data));
        }
        return res.data;
      } else {
        // Access token might have expired, try refresh
        const refreshed = await refreshSession();
        if (refreshed) {
          const newToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
          if (newToken) {
            const retryRes = await getAuthUser(newToken);
            if (retryRes.success && retryRes.data) {
              setUser(retryRes.data);
              return retryRes.data;
            }
          }
        }
        return null;
      }
    } catch {
      return null;
    }
  }, [accessToken, refreshSession]);

  // Login handler
  const login = useCallback(async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const res = await loginUser(credentials);
      if (res.success && res.data) {
        const { accessToken, refreshToken, ...userData } = res.data;
        saveSession(accessToken, refreshToken, userData as User);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: res.error || 'Login failed. Please verify credentials.' };
      }
    } catch (err) {
      setIsLoading(false);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'An unexpected error occurred during login',
      };
    }
  }, [saveSession]);

  // Hydrate session on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const storedUser = localStorage.getItem(STORAGE_KEYS.USER);

    if (storedToken && storedRefreshToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setAccessToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setUser(parsedUser);
      } catch {
        // JSON parsing error
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }

    setIsLoading(false);
  }, []);

  // Update user profile and purge cache
  const updateProfile = useCallback(
    async (updatedFields: Partial<User>): Promise<{ success: boolean; data?: User; error?: string }> => {
      if (!user) {
        return { success: false, error: 'No authenticated user to update' };
      }

      try {
        if (typeof updateUserProfile === 'function') {
          const res = await updateUserProfile(user.id, updatedFields);
          if (!res.success) {
            return res;
          }
        }
      } catch (err) {
        console.error('Error updating user profile via action:', err);
      }

      // Optimistically update local user state and storage
      const mergedUser = { ...user, ...updatedFields };
      setUser(mergedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mergedUser));
        setCookie(STORAGE_KEYS.USER, JSON.stringify(mergedUser));
      }

      if (typeof purgeUserCache === 'function') {
        try {
          await purgeUserCache();
        } catch {
          // ignore error
        }
      }

      return { success: true, data: mergedUser };
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user && !!accessToken,
        isLoading,
        login,
        logout,
        refreshSession,
        validateSession,
        updateProfile,
        purgeCache: purgeUserCache,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
