import api from './api';

export interface User {
  id: number;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  address?: string;
  profileImageUrl?: string;
  roleId: number;
  provider?: Provider;
}

export interface PetType {
  id: number;
  name: string;
  isActive?: boolean;
}

export interface Breed {
  id: number;
  petTypeId: number;
  name: string;
  origin?: string;
  description?: string;
}

export interface Pet {
  id: number;
  ownerId: number;
  petTypeId: number;
  breedId?: number;
  name: string;
  age?: number;
  weight?: number;
  medicalNotes?: string;
  profileImageUrl?: string;
  petType?: PetType;
  breed?: Breed;
}

export interface Provider {
  id: number;
  userId: number;
  companyName: string;
  description: string;
  serviceTypes?: ServiceType[];
  serviceTypeIds?: number[];
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  profileImageUrl?: string;
  user?: User;
  providerServices?: ProviderService[];
}

export interface ServiceType {
  id: number;
  name: string;
  description: string;
  iconName: string;
}

export interface Appointment {
  id: number;
  ownerId: number;
  providerId: number;
  petId?: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: number;
  petName: string;
  petType: string;
  description: string;
  totalPrice: number;
  provider?: Provider;
  owner?: User;
  pet?: Pet;
  payment?: Payment;
}

export interface Availability {
  id?: number;
  providerId: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Payment {
  id: number;
  appointmentId: number;
  userId: number;
  amount: number;
  status: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  appointment?: Appointment;
}

export interface RevenueSummary {
  totalRevenue: number;
  pendingRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  growthRate: number;
  totalAppointments: number;
  completedAppointments: number;
  averageRevenuePerAppointment: number;
}

export interface ProviderService {
  id?: number;
  providerId?: number;
  serviceTypeId: number;
  price: number;
  description?: string;
  serviceType?: ServiceType;
}

export interface ProviderPhoto {
  id: number;
  providerId: number;
  url: string;
  description?: string;
  createdAt: string;
}

export interface SavedProvider {
  id: number;
  ownerId: number;
  providerId: number;
  provider?: Provider;
}

export interface Review {
  id: number;
  appointmentId: number;
  ownerId: number;
  providerId: number;
  rating: number;
  comment: string;
  createdAt: string;
  owner?: User;
}

export interface Tip {
  id: number;
  userRoleId?: number;
  serviceTypeId?: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/Auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_type', response.data.roleId === 1 ? 'owner' : 'provider');
    }
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/Auth/register', data);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_type');
  },
  forgotPassword: async (email: string) => {
    const response = await api.post('/Auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (data: any) => {
    const response = await api.post('/Auth/reset-password', data);
    return response.data;
  },
  changePassword: async (data: any) => {
    const response = await api.post('/Auth/change-password', data);
    return response.data;
  },
};

export const petService = {
  getMyPets: async (): Promise<Pet[]> => {
    const response = await api.get('/Pets');
    return response.data;
  },
  getPet: async (id: number): Promise<Pet> => {
    const response = await api.get(`/Pets/${id}`);
    return response.data;
  },
  createPet: async (petData: any): Promise<Pet> => {
    const response = await api.post('/Pets', petData);
    return response.data;
  },
  updatePet: async (id: number, petData: any): Promise<void> => {
    await api.put(`/Pets/${id}`, petData);
  },
  deletePet: async (id: number): Promise<void> => {
    await api.delete(`/Pets/${id}`);
  },
  getPetTypes: async (): Promise<PetType[]> => {
    const response = await api.get('/Pets/types');
    return response.data;
  },
  getBreeds: async (typeId: number): Promise<Breed[]> => {
    const response = await api.get(`/Pets/breeds/${typeId}`);
    return response.data;
  }
};

export const providerService = {
  getProviders: async (serviceTypeIds?: number[], city?: string): Promise<Provider[]> => {
    let endpoint = '/Providers';
    const params = new URLSearchParams();
    if (serviceTypeIds && serviceTypeIds.length > 0) {
      params.append('serviceTypeIds', serviceTypeIds.join(','));
    }
    if (city) params.append('city', city);
    
    const queryString = params.toString();
    if (queryString) endpoint += `?${queryString}`;
    
    const response = await api.get(endpoint);
    return response.data;
  },
  getProvider: async (id: number): Promise<Provider> => {
    const response = await api.get(`/Providers/${id}`);
    return response.data;
  },
  createProvider: async (providerData: any): Promise<Provider> => {
    const response = await api.post('/Providers', providerData);
    return response.data;
  },
  updateProvider: async (id: number, providerData: any): Promise<void> => {
    await api.put(`/Providers/${id}`, providerData);
  }
};

export const serviceTypeService = {
  getServiceTypes: async (): Promise<ServiceType[]> => {
    const response = await api.get('/ServiceTypes');
    return response.data;
  }
};

export const appointmentService = {
  getOwnerAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/Appointments/owner');
    return response.data;
  },
  getProviderAppointments: async (): Promise<Appointment[]> => {
    const response = await api.get('/Appointments/provider');
    return response.data;
  },
  getAppointment: async (id: number): Promise<Appointment> => {
    const response = await api.get(`/Appointments/${id}`);
    return response.data;
  },
  createAppointment: async (appointmentData: any): Promise<Appointment> => {
    const response = await api.post('/Appointments', appointmentData);
    return response.data;
  },
  updateStatus: async (id: number, status: number): Promise<void> => {
    await api.patch(`/Appointments/${id}/status`, { status });
  }
};

export const availabilityService = {
  getProviderAvailability: async (providerId: number): Promise<Availability[]> => {
    const response = await api.get(`/Availability/provider/${providerId}`);
    return response.data;
  },
  getMyAvailability: async (): Promise<Availability[]> => {
    const response = await api.get('/Availability/my');
    return response.data;
  },
  createAvailability: async (data: any): Promise<Availability> => {
    const response = await api.post('/Availability', data);
    return response.data;
  },
  deleteAvailability: async (id: number): Promise<void> => {
    await api.delete(`/Availability/${id}`);
  }
};

export const paymentService = {
  getRevenueSummary: async (): Promise<RevenueSummary> => {
    const response = await api.get('/Payments/revenue-summary');
    return response.data;
  },
  getProviderPayments: async (): Promise<Payment[]> => {
    const response = await api.get('/Payments/provider');
    return response.data;
  }
};

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/Users/me');
    return response.data;
  },
  updateProfile: async (userData: any): Promise<void> => {
    await api.put('/Users/me', userData);
  }
};

export const notificationService = {
  getNotifications: async (): Promise<any[]> => {
    const response = await api.get('/Notifications');
    return response.data;
  },
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get('/Notifications/unread-count');
    return response.data;
  },
  markAsRead: async (id: number): Promise<void> => {
    await api.put(`/Notifications/${id}/mark-as-read`);
  },
  markAllAsRead: async (): Promise<void> => {
    await api.put('/Notifications/mark-as-read');
  },
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/Notifications/${id}`);
  }
};

export const providerServicePricingService = {
  getMyServices: async (): Promise<ProviderService[]> => {
    const response = await api.get('/ProviderServices/MyServices');
    return response.data;
  },
  createService: async (serviceData: ProviderService): Promise<ProviderService> => {
    const response = await api.post('/ProviderServices', serviceData);
    return response.data;
  },
  updateService: async (id: number, serviceData: ProviderService): Promise<void> => {
    await api.put(`/ProviderServices/${id}`, serviceData);
  },
  deleteService: async (id: number): Promise<void> => {
    await api.delete(`/ProviderServices/${id}`);
  }
};

export const savedProviderService = {
  getSavedProviders: async (): Promise<SavedProvider[]> => {
    const response = await api.get('/SavedProviders');
    return response.data;
  },
  saveProvider: async (providerId: number): Promise<SavedProvider> => {
    const response = await api.post('/SavedProviders', { providerId });
    return response.data;
  },
  unsaveProvider: async (providerId: number): Promise<void> => {
    await api.delete(`/SavedProviders/provider/${providerId}`);
  },
  isProviderSaved: async (providerId: number): Promise<boolean> => {
    const response = await api.get(`/SavedProviders/isSaved/${providerId}`);
    return response.data;
  }
};

export const reviewService = {
  getProviderReviews: async (providerId: number): Promise<Review[]> => {
    const response = await api.get(`/Reviews/provider/${providerId}`);
    return response.data;
  },
  createReview: async (reviewData: { appointmentId: number; providerId: number; rating: number; comment: string }): Promise<Review> => {
    const response = await api.post('/Reviews', reviewData);
    return response.data;
  }
};

export const tipService = {
  getTips: async (serviceTypeId?: number, includeInactive: boolean = false): Promise<Tip[]> => {
    let url = `/Tips?includeInactive=${includeInactive}`;
    if (serviceTypeId) url += `&serviceTypeId=${serviceTypeId}`;
    const response = await api.get(url);
    return response.data;
  },
  getTip: async (id: number): Promise<Tip> => {
    const response = await api.get(`/Tips/${id}`);
    return response.data;
  },
  createTip: async (tipData: Partial<Tip>): Promise<Tip> => {
    const response = await api.post('/Tips', tipData);
    return response.data;
  },
  updateTip: async (id: number, tipData: Partial<Tip>): Promise<void> => {
    await api.put(`/Tips/${id}`, tipData);
  },
  deleteTip: async (id: number): Promise<void> => {
    await api.delete(`/Tips/${id}`);
  },
  getRandomTip: async (serviceTypeId?: number): Promise<Tip> => {
    let url = '/Tips/random';
    if (serviceTypeId) url += `?serviceTypeId=${serviceTypeId}`;
    const response = await api.get(url);
    return response.data;
  }
};

const RECENT_PROVIDERS_KEY = 'recent_providers';

export const recentProviderService = {
  getRecentProviders: async (): Promise<Provider[]> => {
    try {
      // Try to get from backend first
      const response = await api.get('/ProviderServices/recent');
      if (response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      console.warn('Failed to fetch recent providers from backend, falling back to local storage', error);
    }

    try {
      const stored = localStorage.getItem(RECENT_PROVIDERS_KEY);
      const ids: number[] = stored ? JSON.parse(stored) : [];
      if (ids.length === 0) return [];
      
      const providers = await Promise.all(
        ids.map(async (id) => {
          try {
            return await providerService.getProvider(id);
          } catch {
            return null;
          }
        })
      );
      return providers.filter((p): p is Provider => p !== null);
    } catch (error) {
      console.error('Error getting recent providers from local storage:', error);
      return [];
    }
  },
  addRecentProvider: async (providerId: number): Promise<void> => {
    try {
      const stored = localStorage.getItem(RECENT_PROVIDERS_KEY);
      let ids: number[] = stored ? JSON.parse(stored) : [];
      
      ids = ids.filter(id => id !== providerId);
      ids.unshift(providerId);
      ids = ids.slice(0, 10);
      
      localStorage.setItem(RECENT_PROVIDERS_KEY, JSON.stringify(ids));
    } catch (error) {
      console.error('Error adding recent provider to local storage:', error);
    }
  }
};
