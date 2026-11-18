'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { authClient, signIn, signUp, signOut, getSession } from '@/lib/auth-client';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    businessName?: string
  ) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'pizzahub_token';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const normalizeUser = (authUser: any): User => {
    return {
      _id: authUser.id || authUser._id,
      id: authUser.id || authUser._id,
      name: authUser.name,
      email: authUser.email,
      image: authUser.image,
      role: (authUser.role as UserRole) || 'customer',
      isBlocked: !!authUser.isBlocked,
      businessName: authUser.businessName,
      subscriptionPlan: authUser.subscriptionPlan || 'free',
      subscriptionExpiresAt: authUser.subscriptionExpiresAt,
      createdAt: authUser.createdAt,
      updatedAt: authUser.updatedAt,
    };
  };

  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const sessionResult = await getSession();

      if (sessionResult && sessionResult.data && sessionResult.data.user) {
        const normalized = normalizeUser(sessionResult.data.user);
        setUser(normalized);

        // Store active session token if present
        if (sessionResult.data.session?.token) {
          localStorage.setItem(TOKEN_KEY, sessionResult.data.session.token);
        }
      } else {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (!storedToken) {
          setUser(null);
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Session verification check failed:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const result = await signIn.email({
        email,
        password,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Invalid email or password.');
      }

      if (!result.data?.user) {
        throw new Error('Authentication succeeded but user payload is missing.');
      }

      const normalized = normalizeUser(result.data.user);

      const sessionData = result.data as any;
      if (sessionData?.token) {
        localStorage.setItem(TOKEN_KEY, sessionData.token);
      } else if (sessionData?.session?.token) {
        localStorage.setItem(TOKEN_KEY, sessionData.session.token);
      }

      setUser(normalized);
      return normalized;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/dashboard`,
      });
    } catch (error) {
      console.error('Google sign-in error:', error);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    businessName?: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      if (role === 'admin') {
        throw new Error('Self-registering as Administrator is prohibited.');
      }

      const payload: any = {
        name,
        email,
        password,
        role,
      };

      if (role === 'vendor' && businessName) {
        payload.businessName = businessName;
      }

      const result = await signUp.email(payload);

      if (result.error) {
        throw new Error(result.error.message || 'Registration failed.');
      }

      if (!result.data?.user) {
        throw new Error('Registration completed but user payload is missing.');
      }

      const normalized = normalizeUser(result.data.user);

      const registerData = result.data as any;
      if (registerData?.token) {
        localStorage.setItem(TOKEN_KEY, registerData.token);
      } else if (registerData?.session?.token) {
        localStorage.setItem(TOKEN_KEY, registerData.session.token);
      }

      setUser(normalized);
      return normalized;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (err) {
      console.warn('[AuthContext] Error logging out:', err);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      setUser(null);
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    loginWithGoogle,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
