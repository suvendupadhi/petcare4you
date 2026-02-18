import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import Constants from 'expo-constants';
import { globalLogout } from '@/context/AuthContext';

// Use 10.0.2.2 for Android emulator to access localhost on host machine
const getBaseUrl = () => {
  // Use environment variables if available (common for web hosting like Vercel/Netlify)
  // process.env.EXPO_PUBLIC_API_URL is the standard for Expo
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) return envUrl;

  // Web fallback
  if (Platform.OS === 'web') {
    // If we're on web and no env var, assume it's same host or localhost
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      return `${window.location.protocol}//${window.location.host}/api`;
    }
    return 'http://localhost:5088/api';
  }

  // Expo Go (iOS + Android) — DEV ONLY
  if (__DEV__) {
    const host = Constants.expoConfig?.hostUri?.split(':')[0];
    if (host) {
      return `http://${host}:5088/api`;
    }
  }

  // Production (App Store / Play Store) fallback
  return 'https://petcareapi.azurewebsites.net/api'; // Updated with a more realistic placeholder for hosting
};

const BASE_URL = getBaseUrl();
export const ROOT_URL = BASE_URL.replace('/api', '');

export const getImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${ROOT_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Debugging: Print to console and show alert on device
console.log('API Base URL:', BASE_URL);
// if (Platform.OS !== 'web') {
//   Alert.alert('API Config', `Base URL: ${BASE_URL}`);
// } else {
//   console.info('%c API Config ', 'background: #222; color: #bada55', BASE_URL);
// }

const TOKEN_KEY = 'auth_token';

export const setToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

async function request(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  
  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Only set Content-Type to application/json if it's not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    await globalLogout();
    throw new Error('Session expired. Please log in again.');
  }

  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    console.error(`API Error [${response.status}] ${endpoint}:`, data);
    throw new Error(data?.message || response.statusText || 'API request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return data;
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, body: any, options?: RequestInit) => 
    request(endpoint, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint: string, body: any, options?: RequestInit) => 
    request(endpoint, { ...options, method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint: string, body: any, options?: RequestInit) => 
    request(endpoint, { ...options, method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'DELETE' }),
  
  // Notifications
  getNotifications: () => request('/Notifications', { method: 'GET' }),
  getUnreadCount: () => request('/Notifications/unread-count', { method: 'GET' }),
  markNotificationsAsRead: () => request('/Notifications/mark-as-read', { method: 'PUT' }),
  markNotificationAsRead: (id: number) => request(`/Notifications/${id}/mark-as-read`, { method: 'PUT' }),
  deleteNotification: (id: number) => request(`/Notifications/${id}`, { method: 'DELETE' }),

  // User Profile Photo
  updateProfilePhoto: (formData: FormData) => request('/Users/me/photo', { method: 'POST', body: formData }),

  // Provider Profile Photo
  updateProviderPhoto: (formData: FormData) => request('/Providers/me/photo', { method: 'POST', body: formData }),

  // Saved Providers
  getSavedProviders: () => request('/SavedProviders', { method: 'GET' }),
  saveProvider: (providerId: number) => request('/SavedProviders', { method: 'POST', body: JSON.stringify({ providerId }) }),
  unsaveProvider: (providerId: number) => request(`/SavedProviders/provider/${providerId}`, { method: 'DELETE' }),
  isProviderSaved: (providerId: number) => request(`/SavedProviders/isSaved/${providerId}`, { method: 'GET' }),
  
  // Revenue
  getRevenueSummary: () => request('/Payments/revenue-summary', { method: 'GET' }),
};
