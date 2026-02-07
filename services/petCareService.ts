import { api, setToken, clearToken } from './api';

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

export const authService = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    const token = response.token || response.Token;
    if (token) {
      await setToken(token);
    }
    // Normalize response
    return {
      ...response,
      token: token,
      roleId: response.roleId || response.RoleId,
      userId: response.userId || response.UserId
    };
  },
  register: async (userData: any) => {
    return await api.post('/auth/register', userData);
  },
  logout: async () => {
    await clearToken();
  }
};

export const petService = {
  getMyPets: async (): Promise<Pet[]> => {
    return await api.get('/pets');
  },
  getPet: async (id: number): Promise<Pet> => {
    return await api.get(`/pets/${id}`);
  },
  createPet: async (petData: any): Promise<Pet> => {
    return await api.post('/pets', petData);
  },
  updatePet: async (id: number, petData: any): Promise<void> => {
    return await api.put(`/pets/${id}`, petData);
  },
  deletePet: async (id: number): Promise<void> => {
    return await api.delete(`/pets/${id}`);
  },
  getPetTypes: async (): Promise<PetType[]> => {
    return await api.get('/pets/types');
  },
  getBreeds: async (typeId: number): Promise<Breed[]> => {
    return await api.get(`/pets/breeds/${typeId}`);
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
  },
  updateProviderPhoto: async (formData: FormData): Promise<any> => {
    return await api.updateProviderPhoto(formData);
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
  updateStatus: async (id: number, status: number): Promise<void> => {
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
  status: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  appointment?: Appointment;
}

export interface StatusMaster {
  id: number;
  statusName: string;
  statusType: 'appointment' | 'payment';
}

export const statusService = {
  getStatuses: async (): Promise<StatusMaster[]> => {
    return await api.get('/statuses');
  },
  getStatusesByType: async (type: string): Promise<StatusMaster[]> => {
    return await api.get(`/statuses/${type}`);
  }
};

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

export const stripeService = {
  onboard: async () => {
    return await api.post('/stripe/onboard');
  },
  getAccountStatus: async () => {
    return await api.get('/stripe/account-status');
  },
  createPaymentIntent: async (paymentId: number) => {
    return await api.post(`/stripe/create-payment-intent/${paymentId}`);
  }
};

export interface ProviderService {
  id?: number;
  providerId?: number;
  serviceTypeId: number;
  price: number;
  description?: string;
  serviceType?: ServiceType;
}

export const providerServicePricingService = {
  getMyServices: async (): Promise<ProviderService[]> => {
    return await api.get('/providerServices/MyServices');
  },
  createService: async (serviceData: ProviderService): Promise<ProviderService> => {
    return await api.post('/providerServices', serviceData);
  },
  updateService: async (id: number, serviceData: ProviderService): Promise<void> => {
    return await api.put(`/providerServices/${id}`, serviceData);
  },
  deleteService: async (id: number): Promise<void> => {
    return await api.delete(`/providerServices/${id}`);
  }
};

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    // Normalize response
    return {
      ...response,
      roleId: response.roleId || response.RoleId
    };
  },
  updateProfile: async (userData: any): Promise<void> => {
    return await api.put('/users/me', userData);
  },
  updateProfilePhoto: async (formData: FormData): Promise<any> => {
    return await api.post('/users/me/photo', formData);
  }
};

export interface SavedProvider {
  id: number;
  ownerId: number;
  providerId: number;
  provider?: Provider;
}

export const savedProviderService = {
  getSavedProviders: async (): Promise<SavedProvider[]> => {
    return await api.get('/savedProviders');
  },
  saveProvider: async (providerId: number): Promise<SavedProvider> => {
    return await api.post('/savedProviders', { providerId });
  },
  unsaveProvider: async (providerId: number): Promise<void> => {
    return await api.delete(`/savedProviders/provider/${providerId}`);
  },
  isProviderSaved: async (providerId: number): Promise<boolean> => {
    return await api.get(`/savedProviders/isSaved/${providerId}`);
  }
};

export interface ProviderPhoto {
  id: number;
  providerId: number;
  url: string;
  description?: string;
  createdAt: string;
}

export const providerPhotoService = {
  getProviderPhotos: async (providerId: number): Promise<ProviderPhoto[]> => {
    return await api.get(`/providerPhotos/provider/${providerId}`);
  },
  getMyPhotos: async (): Promise<ProviderPhoto[]> => {
    return await api.get('/providerPhotos/my');
  },
  addPhoto: async (photoData: { url: string; description?: string }): Promise<ProviderPhoto> => {
    return await api.post('/providerPhotos', photoData);
  },
  deletePhoto: async (id: number): Promise<void> => {
    return await api.delete(`/providerPhotos/${id}`);
  }
};
