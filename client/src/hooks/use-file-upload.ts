import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFiles = async (files: File[]): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('Uploading files:', files);
      const formData = new FormData();
      files.forEach((file) => {
        console.log('Appending file:', file.name, file.size);
        formData.append('files', file);
      });

      console.log('FormData entries:');
      const entries = Array.from(formData.entries());
      entries.forEach(([key, value]) => {
        console.log(key, value);
      });

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      console.log('Making API request...');
      const response = await apiRequest('POST', '/api/upload', formData);
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      clearInterval(progressInterval);
      setUploadProgress(100);

      return result.batchId;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
  };
}
