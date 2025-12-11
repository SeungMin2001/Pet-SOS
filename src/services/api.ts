import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Pet,
  Hospital,
  EmergencyRequest,
  AuthResponse,
  Location,
} from '../types';
import { mockPets, mockHospitals, mockEmergencyRequests } from '../data/mockData';

// Update this URL to your backend URL
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Check if in demo mode
const isDemoMode = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return token && token.startsWith('demo_token_');
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      // 데모 모드인 경우 API 호출 차단
      if (token.startsWith('demo_token_')) {
        return Promise.reject({ isDemoMode: true, message: 'Demo mode - no API calls' });
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    user_type: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', data);
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Pets API
export const petsAPI = {
  getMyPets: async (): Promise<Pet[]> => {
    // 데모 모드인 경우 더미 데이터 반환
    if (await isDemoMode()) {
      return mockPets;
    }
    const response = await api.get('/api/pets');
    return response.data;
  },

  createPet: async (data: {
    name: string;
    species: string;
    breed?: string;
    age?: number;
    medical_notes?: string;
    photo_url?: string;
  }): Promise<Pet> => {
    // 데모 모드인 경우 더미 데이터 반환
    if (await isDemoMode()) {
      const newPet: Pet = {
        id: mockPets.length + 1,
        user_id: 1,
        name: data.name,
        species: data.species,
        breed: data.breed,
        age: data.age,
        medical_notes: data.medical_notes,
        photo_url: data.photo_url,
      };
      mockPets.push(newPet);
      return newPet;
    }
    const response = await api.post('/api/pets', data);
    return response.data;
  },

  updatePet: async (petId: number, data: Partial<Pet>): Promise<Pet> => {
    const response = await api.put(`/api/pets/${petId}`, data);
    return response.data;
  },

  deletePet: async (petId: number): Promise<void> => {
    await api.delete(`/api/pets/${petId}`);
  },
};

// Hospitals API
export const hospitalsAPI = {
  getNearbyHospitals: async (
    lat: number,
    lng: number,
    radius: number = 10
  ): Promise<Hospital[]> => {
    // 데모 모드인 경우 더미 데이터 반환
    if (await isDemoMode()) {
      return mockHospitals;
    }
    const response = await api.get('/api/hospitals/nearby', {
      params: { lat, lng, radius },
    });
    return response.data;
  },

  getHospital: async (hospitalId: number): Promise<Hospital> => {
    const response = await api.get(`/api/hospitals/${hospitalId}`);
    return response.data;
  },
};

// Requests API
export const requestsAPI = {
  createRequest: async (data: {
    pet_id: number;
    hospital_id: number;
    symptoms: string;
    pickup_latitude: number;
    pickup_longitude: number;
  }): Promise<EmergencyRequest> => {
    // 데모 모드인 경우 더미 데이터 생성
    if (await isDemoMode()) {
      const pet = mockPets.find(p => p.id === data.pet_id);
      const hospital = mockHospitals.find(h => h.id === data.hospital_id);
      const now = new Date().toISOString();
      const newRequest: EmergencyRequest = {
        id: mockEmergencyRequests.length + 1,
        user_id: 1,
        pet_id: data.pet_id,
        hospital_id: data.hospital_id,
        symptoms: data.symptoms,
        status: 'pending',
        pickup_latitude: data.pickup_latitude,
        pickup_longitude: data.pickup_longitude,
        created_at: now,
        updated_at: now,
        pet,
        hospital,
      };
      mockEmergencyRequests.push(newRequest);
      return newRequest;
    }
    const response = await api.post('/api/requests', data);
    return response.data;
  },

  getMyRequests: async (): Promise<EmergencyRequest[]> => {
    // 데모 모드인 경우 더미 데이터 반환
    if (await isDemoMode()) {
      return mockEmergencyRequests.filter(r => r.user_id === 1);
    }
    const response = await api.get('/api/requests/my');
    return response.data;
  },

  getRequest: async (requestId: number): Promise<EmergencyRequest> => {
    // 데모 모드인 경우 더미 데이터 반환
    if (await isDemoMode()) {
      const request = mockEmergencyRequests.find(r => r.id === requestId);
      if (!request) {
        throw new Error('Request not found');
      }
      return request;
    }
    const response = await api.get(`/api/requests/${requestId}`);
    return response.data;
  },

  cancelRequest: async (requestId: number): Promise<void> => {
    // 데모 모드인 경우 더미 데이터에서 삭제
    if (await isDemoMode()) {
      const index = mockEmergencyRequests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        mockEmergencyRequests[index].status = 'cancelled';
      }
      return;
    }
    await api.delete(`/api/requests/${requestId}`);
  },
};

// Riders API
export const ridersAPI = {
  updateActiveStatus: async (
    latitude: number,
    longitude: number,
    is_active: boolean
  ): Promise<void> => {
    // 데모 모드인 경우 아무것도 하지 않음
    if (await isDemoMode()) {
      return;
    }
    await api.put('/api/riders/active', {
      latitude,
      longitude,
      is_active,
    });
  },

  getAvailableRequests: async (): Promise<EmergencyRequest[]> => {
    // 데모 모드인 경우 더미 데이터 반환
    if (await isDemoMode()) {
      return mockEmergencyRequests.filter(r => r.status === 'pending');
    }
    const response = await api.get('/api/riders/requests/available');
    return response.data;
  },

  acceptRequest: async (requestId: number): Promise<EmergencyRequest> => {
    // 데모 모드인 경우 더미 데이터 업데이트
    if (await isDemoMode()) {
      const request = mockEmergencyRequests.find(r => r.id === requestId);
      if (request) {
        request.status = 'rider_assigned';
        request.rider_id = 2;
      }
      return request!;
    }
    const response = await api.post(`/api/riders/requests/${requestId}/accept`);
    return response.data;
  },

  updateRequestStatus: async (
    requestId: number,
    status: string
  ): Promise<EmergencyRequest> => {
    // 데모 모드인 경우 더미 데이터 업데이트
    if (await isDemoMode()) {
      const request = mockEmergencyRequests.find(r => r.id === requestId);
      if (request) {
        request.status = status as any;
      }
      return request!;
    }
    const response = await api.put(`/api/riders/requests/${requestId}/status`, {
      status,
    });
    return response.data;
  },

  updateLocation: async (
    latitude: number,
    longitude: number,
    is_active: boolean
  ): Promise<void> => {
    // 데모 모드인 경우 아무것도 하지 않음
    if (await isDemoMode()) {
      return;
    }
    await api.post('/api/riders/location', {
      latitude,
      longitude,
      is_active,
    });
  },

  getMyRiderRequests: async (): Promise<EmergencyRequest[]> => {
    // 데모 모드인 경우 더미 데이터 반환
    if (await isDemoMode()) {
      return mockEmergencyRequests.filter(r => r.rider_id === 2);
    }
    const response = await api.get('/api/riders/my-requests');
    return response.data;
  },
};

export default api;
