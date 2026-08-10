import api from './api';
import { AuthResponse } from '../types';

export const loginWithGoogle = async (credential: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/google', { credential });
  return response.data;
};
