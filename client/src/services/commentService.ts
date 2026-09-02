import api from './api';
import { Comment, CommentsResponse } from '../types';

export const getComments = async (
  postId: string,
  page = 1,
  limit = 20
): Promise<CommentsResponse> => {
  const response = await api.get<CommentsResponse>(
    `/posts/${postId}/comments`,
    { params: { page, limit } }
  );
  return response.data;
};

export const createComment = async (
  postId: string,
  content: string,
  parentComment?: string
): Promise<{ success: boolean; comment: Comment }> => {
  const response = await api.post(`/posts/${postId}/comments`, { 
    content, 
    parentComment 
  });
  return response.data;
};
