import api from './api';
import { Post, PostsResponse } from '../types';

export const getPosts = async (
  page = 1,
  limit = 10,
  tag?: string,
  type?: string
): Promise<PostsResponse> => {
  const params: any = { page, limit };
  if (tag) params.tag = tag;
  if (type) params.type = type;
  const response = await api.get<PostsResponse>('/posts', { params });
  return response.data;
};

export const createPost = async (data: {
  content: string;
  type?: string;
  mediaUrl?: string;
  tags?: string[];
}): Promise<{ success: boolean; post: Post }> => {
  const response = await api.post('/posts', data);
  return response.data;
};

export const createPoll = async (data: {
  content: string;
  options: string[];
  tags?: string[];
}): Promise<{ success: boolean; post: Post }> => {
  const response = await api.post('/posts/poll', data);
  return response.data;
};

export const toggleReaction = async (
  postId: string,
  type: string
): Promise<{ success: boolean; post: Post }> => {
  const response = await api.post(`/posts/${postId}/react`, { type });
  return response.data;
};

export const votePoll = async (
  postId: string,
  optionId: string
): Promise<{ success: boolean; post: Post }> => {
  const response = await api.post(`/posts/${postId}/vote`, { optionId });
  return response.data;
};
