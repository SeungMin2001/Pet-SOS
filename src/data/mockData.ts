import { Pet, Hospital, EmergencyRequest, User } from '../types';

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'user@demo.com',
    name: '김보호',
    phone: '010-1111-2222',
    user_type: 'guardian',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    email: 'rider@demo.com',
    name: '박배달',
    phone: '010-3333-4444',
    user_type: 'rider',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    email: 'user3@demo.com',
    name: '이철수',
    phone: '010-5555-6666',
    user_type: 'guardian',
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    email: 'user4@demo.com',
    name: '박영희',
    phone: '010-7777-8888',
    user_type: 'guardian',
    created_at: new Date().toISOString(),
  },
];

// Mock Pets Data
export const mockPets: Pet[] = [
  {
    id: 1,
    user_id: 1,
    name: '뭉치',
    species: '강아지',
    breed: '골든 리트리버',
    age: 3,
    weight: 28,
    size: 'large',
    medical_notes: '슬개골 탈구 병력 있음',
    photo_url: '',
  },
  {
    id: 2,
    user_id: 1,
    name: '나비',
    species: '고양이',
    breed: '코리안 숏헤어',
    age: 2,
    weight: 4.5,
    size: 'small',
    medical_notes: '알레르기 있음 (닭고기)',
    photo_url: '',
  },
];

// Mock Hospitals Data
export const mockHospitals: Hospital[] = [
  {
    id: 1,
    name: '24시 우리동물병원',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
    latitude: 37.5012,
    longitude: 127.0396,
    is_24hour: true,
    specialties: '외과, 내과, 응급',
  },
  {
    id: 2,
    name: '서울동물메디컬센터',
    address: '서울시 서초구 서초대로 456',
    phone: '02-2345-6789',
    latitude: 37.4946,
    longitude: 127.0283,
    is_24hour: false,
    specialties: '내과, 피부과',
  },
  {
    id: 3,
    name: '강남펫클리닉',
    address: '서울시 강남구 역삼동 789',
    phone: '02-3456-7890',
    latitude: 37.4979,
    longitude: 127.0276,
    is_24hour: false,
    specialties: '일반진료',
  },
  {
    id: 4,
    name: '반려동물응급센터',
    address: '서울시 송파구 올림픽로 234',
    phone: '02-4567-8901',
    latitude: 37.5145,
    longitude: 127.1059,
    is_24hour: true,
    specialties: '응급, 중환자',
  },
];

// Mock Emergency Requests Data
export const mockEmergencyRequests: EmergencyRequest[] = [
  {
    id: 1,
    user_id: 1,
    pet_id: 1,
    hospital_id: 1,
    rider_id: 2,
    symptoms: '갑자기 다리를 절뚝이며 아파합니다',
    status: 'picking_up',
    pickup_latitude: 37.4979,
    pickup_longitude: 127.0276,
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15분 전
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    pet: mockPets[0],
    hospital: mockHospitals[0],
    user: mockUsers[0],
  },
  {
    id: 2,
    user_id: 3,
    pet_id: 3,
    hospital_id: 2,
    rider_id: undefined,
    symptoms: '구토와 설사 증상이 있습니다',
    status: 'pending',
    pickup_latitude: 37.5082,
    pickup_longitude: 127.0633,
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5분 전
    updated_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    pet: {
      id: 3,
      user_id: 3,
      name: '초코',
      species: '강아지',
      breed: '푸들',
      age: 5,
      weight: 6.5,
      size: 'small',
      medical_notes: '',
      photo_url: '',
    },
    hospital: mockHospitals[1],
    user: mockUsers[2],
  },
  {
    id: 3,
    user_id: 4,
    pet_id: 4,
    hospital_id: 4,
    rider_id: undefined,
    symptoms: '호흡곤란 증상이 있습니다',
    status: 'pending',
    pickup_latitude: 37.5172,
    pickup_longitude: 127.0473,
    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2분 전
    updated_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    pet: {
      id: 4,
      user_id: 4,
      name: '루이',
      species: '고양이',
      breed: '페르시안',
      age: 4,
      weight: 5.2,
      size: 'medium',
      medical_notes: '천식 있음',
      photo_url: '',
    },
    hospital: mockHospitals[3],
    user: mockUsers[3],
  },
];

// Rider's current location (for demo) - 실시간 업데이트 시뮬레이션
export let mockRiderLocation = {
  latitude: 37.5065,
  longitude: 127.0538,
};

// 라이더 위치를 요청에 따라 가져오기 (픽업 위치에서 병원으로 이동하는 시뮬레이션)
export const getRiderLocationForRequest = (requestId: number) => {
  const request = mockEmergencyRequests.find(r => r.id === requestId);
  if (!request || !request.rider_id) {
    return mockRiderLocation;
  }

  // 상태에 따라 라이더 위치 반환
  switch (request.status) {
    case 'rider_assigned':
      // 픽업 위치로 이동 중 (픽업 위치와 라이더 현재 위치 사이)
      return {
        latitude: (mockRiderLocation.latitude + request.pickup_latitude) / 2,
        longitude: (mockRiderLocation.longitude + request.pickup_longitude) / 2,
      };
    case 'picking_up':
      // 픽업 위치에 도착
      return {
        latitude: request.pickup_latitude,
        longitude: request.pickup_longitude,
      };
    case 'on_way_to_hospital':
      // 병원으로 이동 중 (픽업 위치와 병원 사이)
      if (request.hospital) {
        return {
          latitude: (request.pickup_latitude + request.hospital.latitude) / 2,
          longitude: (request.pickup_longitude + request.hospital.longitude) / 2,
        };
      }
      return mockRiderLocation;
    case 'completed':
      // 병원에 도착
      if (request.hospital) {
        return {
          latitude: request.hospital.latitude,
          longitude: request.hospital.longitude,
        };
      }
      return mockRiderLocation;
    default:
      return mockRiderLocation;
  }
};
