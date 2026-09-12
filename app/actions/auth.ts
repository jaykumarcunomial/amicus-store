"use server"

import { revalidateTag } from "next/cache";
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
      next: { revalidate: false, tags: ['auth-user'] }
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

export async function purgeUserCache(): Promise<{ success: boolean }> {
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag("auth-user", { expire: 0 });
    return { success: true };
  } catch (error) {
    console.error("Error purging auth-user cache tag:", error);
    return { success: false };
  }
}

export async function updateUserProfile(
  userId: number,
  userData: Partial<User>
): Promise<{
  success: boolean;
  data?: User;
  error?: string;
}> {
  if (!userId) {
    return { success: false, error: "No user ID provided" };
  }

  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Failed to update profile",
      };
    }

    // Purge cached user details upon profile update
    try {
      revalidateTag("auth-user", { expire: 0 });
    } catch {
      // ignore in environments where revalidateTag is mock or no-op
    }

    return {
      success: true,
      data: data as User,
    };
  } catch (error) {
    console.error("Error during updateUserProfile action:", error);
    return {
      success: false,
      error: "Failed to update user profile",
    };
  }
}
