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
