export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  image?: string;
  role?: string;
}

export interface AuthResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender?: string;
  image?: string;
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  expiresInMins?: number;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => void | Promise<void>;
  refreshSession: () => Promise<boolean>;
  validateSession: () => Promise<User | null>;
  updateProfile?: (updatedFields: Partial<User>) => Promise<{ success: boolean; data?: User; error?: string }>;
  purgeCache?: () => Promise<{ success: boolean }>;
}
