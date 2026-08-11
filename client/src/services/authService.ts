import api from './api';
import { AuthResponse } from '../types';

export const loginWithGoogle = async (credential: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/google', { credential });
  return response.data;
};

export const loginWithOracle = async (code: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/oracle/callback', { code });
  return response.data;
};

export const getOracleLoginUrl = async (): Promise<{ url: string; state: string }> => {
  const response = await api.get<{ success: boolean; url: string; state: string }>('/auth/oracle/url');
  return { url: response.data.url, state: response.data.state };
};

