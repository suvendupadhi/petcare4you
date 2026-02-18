import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useSegments } from 'expo-router';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

interface User {
  id: number;
  email: string;
  roleId: number;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadStorageData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)' || segments.length === 0 || segments[0] === 'index' || segments[0] === 'forgot-password' || segments[0] === 'register-owner' || segments[0] === 'register-provider' || segments[0] === 'reset-password';

    if (!token && !inAuthGroup) {
      // Redirect to login if not authenticated and trying to access protected route
      router.replace('/');
    } else if (token && inAuthGroup) {
      // Redirect to dashboard if already authenticated and trying to access auth route
      if (user?.roleId === 1) { // Owner
        router.replace('/owner-dashboard');
      } else if (user?.roleId === 2) { // Provider
        router.replace('/provider-dashboard');
      }
    }
  }, [user, token, isLoading, segments]);

  async function loadStorageData() {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch (e) {
      console.error('Failed to load auth data', e);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, newToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
    ]);
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    router.replace('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper to access logout from outside components (like api.ts)
let logoutFn: (() => Promise<void>) | null = null;
export const setGlobalLogout = (fn: () => Promise<void>) => {
  logoutFn = fn;
};
export const globalLogout = async () => {
  if (logoutFn) await logoutFn();
};
