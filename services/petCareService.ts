import { api, setToken, clearToken } from './api';

export interface User {
  id: number;
  email: string;
  phoneNumber?: string;
  firstName: string;
  lastName: string;
  userType: 'owner' | 'provider';
  provider?: Provider;
}

export interface Provider {
  id: number;
  userId: number;
  companyName: string;
  description: string;
  serviceTypes?: ServiceType[];
  serviceTypeIds?: number[];
  hourlyRate: number;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  user?: User;
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
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  petName: string;
  petType: string;
  description: string;
  totalPrice: number;
  provider?: Provider;
  owner?: User;
  payment?: Payment;
}

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      await setToken(response.token);
    }
    return response;
  },
  register: async (userData: any) => {
    return await api.post('/auth/register', userData);
  },
  logout: async () => {
    await clearToken();
  }
};

export const providerService = {
  getProviders: async (serviceTypeIds?: number[], city?: string): Promise<Provider[]> => {
    let endpoint = '/providers';
    const params = new URLSearchParams();
    if (serviceTypeIds && serviceTypeIds.length > 0) {
      params.append('serviceTypeIds', serviceTypeIds.join(','));
    }
    if (city) params.append('city', city);
    
    const queryString = params.toString();
    if (queryString) endpoint += `?${queryString}`;
    
    return await api.get(endpoint);
  },
  getProvider: async (id: number): Promise<Provider> => {
    return await api.get(`/providers/${id}`);
  },
  createProvider: async (providerData: any): Promise<Provider> => {
    return await api.post('/providers', providerData);
  },
  updateProvider: async (id: number, providerData: any): Promise<void> => {
    console.log(`petCareService: updateProvider called for id ${id}`, providerData);
    return await api.put(`/providers/${id}`, providerData);
  }
};

export const serviceTypeService = {
  getServiceTypes: async (): Promise<ServiceType[]> => {
    return await api.get('/serviceTypes');
  },
  getServiceType: async (id: number): Promise<ServiceType> => {
    return await api.get(`/serviceTypes/${id}`);
  }
};

export const appointmentService = {
  getOwnerAppointments: async (): Promise<Appointment[]> => {
    return await api.get('/appointments/owner');
  },
  getProviderAppointments: async (): Promise<Appointment[]> => {
    return await api.get('/appointments/provider');
  },
  getAppointment: async (id: number): Promise<Appointment> => {
    return await api.get(`/appointments/${id}`);
  },
  createAppointment: async (appointmentData: any): Promise<Appointment> => {
    return await api.post('/appointments', appointmentData);
  },
  updateAppointment: async (id: number, appointmentData: any): Promise<Appointment> => {
    return await api.put(`/appointments/${id}`, appointmentData);
  },
  updateStatus: async (id: number, status: string): Promise<void> => {
    return await api.patch(`/appointments/${id}/status`, { status });
  }
};

export interface Availability {
  id?: number;
  providerId: number;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export const availabilityService = {
  getProviderAvailability: async (providerId: number): Promise<Availability[]> => {
    return await api.get(`/availability/provider/${providerId}`);
  },
  getMyAvailability: async (): Promise<Availability[]> => {
    return await api.get('/availability/my');
  },
  createAvailability: async (data: any): Promise<Availability> => {
    return await api.post('/availability', data);
  },
  deleteAvailability: async (id: number): Promise<void> => {
    return await api.delete(`/availability/${id}`);
  }
};

export interface Payment {
  id: number;
  appointmentId: number;
  userId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  appointment?: Appointment;
}

export const paymentService = {
  getProviderPayments: async (): Promise<Payment[]> => {
    return await api.get('/payments/provider');
  },
  getOwnerPayments: async (): Promise<Payment[]> => {
    return await api.get('/payments/owner');
  },
  createPayment: async (paymentData: any): Promise<Payment> => {
    return await api.post('/payments', paymentData);
  }
};

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    return await api.get('/users/me');
  },
  updateProfile: async (userData: any): Promise<void> => {
    return await api.put('/users/me', userData);
  }
};
