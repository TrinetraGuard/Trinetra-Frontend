const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface UploadResponse {
  unique_faces_count: number;
  faces: string[];
  message: string;
  processing_time_seconds: number;
}

export const uploadVideo = async (
  videoFile: File,
  location: {
    name?: string;
    latitude?: number;
    longitude?: number;
  }
): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('video', videoFile);
  if (location.name) formData.append('location_name', location.name);
  if (location.latitude) formData.append('latitude', String(location.latitude));
  if (location.longitude) formData.append('longitude', String(location.longitude));

  const res = await fetch(`${API_BASE_URL}/upload-video`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");

  return res.json();
};