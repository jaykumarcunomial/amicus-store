"use server"

import type { AuthResponse, LoginCredentials, User } from "../types/auth";

const API_BASE = "https://dummyjson.com";

export async function loginUser(credentials: LoginCredentials): Promise<{
  success: boolean;
  data?: AuthResponse;
  error?: string;
}> {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials.username.trim(),
        password: credentials.password,
        expiresInMins: credentials.expiresInMins || 60,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Invalid username or password",
      };
    }

    return {
      success: true,
      data: data as AuthResponse,
    };
  } catch (error) {
    console.error("Error during loginUser action:", error);
    return {
      success: false,
      error: "An unexpected error occurred during sign in. Please try again.",
    };
  }
}

export async function getAuthUser(token: string): Promise<{
  success: boolean;
  data?: User;
  error?: string;
}> {
  if (!token) {
    return { success: false, error: "No access token provided" };
  }

  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to fetch authenticated user",
      };
    }

    return {
      success: true,
      data: data as User,
    };
  } catch (error) {
    console.error("Error during getAuthUser action:", error);
    return {
      success: false,
      error: "Failed to verify authenticated session",
    };
  }
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  success: boolean;
  data?: { accessToken: string; refreshToken: string };
  error?: string;
}> {
  if (!refreshToken) {
    return { success: false, error: "No refresh token provided" };
  }

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refreshToken: refreshToken,
        expiresInMins: 60,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to refresh token",
      };
    }

    return {
      success: true,
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    };
  } catch (error) {
    console.error("Error during refreshAccessToken action:", error);
    return {
      success: false,
      error: "Failed to refresh token session",
    };
  }
}
