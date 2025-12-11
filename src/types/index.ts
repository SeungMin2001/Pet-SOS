export type UserType = 'guardian' | 'rider';

export type RequestStatus =
  | 'pending'
  | 'rider_assigned'
  | 'picking_up'
  | 'on_way_to_hospital'
  | 'completed'
  | 'cancelled';

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string;
  user_type: UserType;
  created_at: string;
}

export interface Pet {
  id: number;
  user_id: number;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  weight?: number; // kg
  size?: 'small' | 'medium' | 'large'; // 소형, 중형, 대형
  medical_notes?: string;
  photo_url?: string;
}

export interface Hospital {
  id: number;
  name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  is_24hour: boolean;
  specialties?: string;
}

export interface EmergencyRequest {
  id: number;
  user_id: number;
  pet_id: number;
  hospital_id: number;
  rider_id?: number;
  symptoms: string;
  pickup_latitude: number;
  pickup_longitude: number;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  pet?: Pet;
  hospital?: Hospital;
  rider?: User;
  user?: User;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Location {
  latitude: number;
  longitude: number;
}
