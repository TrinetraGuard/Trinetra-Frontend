import VideoUploadForm from '@/components/VideoUpload/VideoUploadForm';
import React from 'react';

const VideoUploadPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Video Upload</h1>
      <VideoUploadForm />
    </div>
  );
};

export default VideoUploadPage; 