export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const REACTION_EMOJI: Record<string, string> = {
  like: '👍',
  insightful: '💡',
  fire: '🔥',
  code: '🥷',
};

export const REACTION_LABELS: Record<string, string> = {
  like: 'Like',
  insightful: 'Insightful',
  fire: 'Fire',
  code: 'Code Ninja',
};

export const POPULAR_TAGS = [
  'react',
  'node',
  'typescript',
  'javascript',
  'python',
  'system-design',
  'ai',
  'devops',
  'web3',
  'rust',
  'go',
  'database',
];
