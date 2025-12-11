import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsUserType: (userType: 'guardian' | 'rider') => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    user_type: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        // 데모 토큰인 경우 API 호출 없이 사용자 정보 설정
        if (token.startsWith('demo_token_')) {
          const userType = token.replace('demo_token_', '') as 'guardian' | 'rider';
          const demoUser: User = {
            id: userType === 'guardian' ? 1 : 2,
            email: userType === 'guardian' ? 'user@demo.com' : 'rider@demo.com',
            name: userType === 'guardian' ? '김보호' : '박배달',
            phone: userType === 'guardian' ? '010-1111-2222' : '010-3333-4444',
            user_type: userType,
            created_at: new Date().toISOString(),
          };
          setUser(demoUser);
        } else {
          // 실제 토큰인 경우 API 호출
          const userData = await authAPI.getMe();
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await AsyncStorage.removeItem('access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      await AsyncStorage.setItem('access_token', response.access_token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const loginAsUserType = async (userType: 'guardian' | 'rider') => {
    try {
      // 데모용 간단 로그인 - 토큰 없이 사용자 정보만 설정
      const demoUser: User = {
        id: userType === 'guardian' ? 1 : 2,
        email: userType === 'guardian' ? 'user@demo.com' : 'rider@demo.com',
        name: userType === 'guardian' ? '김보호' : '박배달',
        phone: userType === 'guardian' ? '010-1111-2222' : '010-3333-4444',
        user_type: userType,
        created_at: new Date().toISOString(),
      };

      // 데모 토큰 저장
      await AsyncStorage.setItem('access_token', 'demo_token_' + userType);
      setUser(demoUser);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    user_type: string;
  }) => {
    try {
      const response = await authAPI.register(data);
      await AsyncStorage.setItem('access_token', response.access_token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('access_token');
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsUserType, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
