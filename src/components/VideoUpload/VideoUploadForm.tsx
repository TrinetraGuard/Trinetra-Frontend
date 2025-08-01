import { UploadResponse, uploadVideo } from '@/api/video';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FacePreviewGrid from './FacePreviewGrid';

const VideoUploadForm: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const response = await uploadVideo(videoFile, {
        name: locationName,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });
      setResult(response);
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">📤 Upload Video</h2>

      <div className="space-y-2">
        <Label htmlFor="video">Video File</Label>
        <Input
          id="video"
          type="file"
          accept="video/*"
          onChange={(e) => {
            if (e.target.files?.[0]) setVideoFile(e.target.files[0]);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="locationName">Location Name</Label>
        <Input
          id="locationName"
          placeholder="e.g. Trimbakeshwar Gate 1"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            placeholder="e.g. 19.9368"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            placeholder="e.g. 73.7769"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={uploading} className="w-full">
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {result && (
        <div className="mt-6 space-y-3 p-4 bg-gray-50 border rounded-xl">
          <p className="font-medium text-green-700">✅ {result.message}</p>
          <p>
            ⏱ Processing Time:{' '}
            <strong>{result.processing_time_seconds}</strong> seconds
          </p>
          <p>
            🧠 Unique Faces Detected:{' '}
            <strong>{result.unique_faces_count}</strong>
          </p>
          <FacePreviewGrid faces={result.faces} />
        </div>
      )}
    </div>
  );
};

export default VideoUploadForm;