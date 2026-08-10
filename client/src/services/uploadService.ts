import api from './api';

export const getPresignedUrl = async (
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; fileUrl: string }> => {
  const response = await api.post('/upload/presigned', { fileName, fileType });
  return response.data;
};

export const uploadFileToS3 = async (
  uploadUrl: string,
  file: File
): Promise<void> => {
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
};
