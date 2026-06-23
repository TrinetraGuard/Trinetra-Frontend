export type CCTVStatus = 'active' | 'inactive';

export interface CCTV {
  id?: string;
  placeName: string;
  rtspLink: string;
  latitude: number;
  longitude: number;
  status: CCTVStatus;
  lastStatusCheck?: Date | { toDate: () => Date };
  createdAt?: Date | { toDate: () => Date };
  updatedAt?: Date | { toDate: () => Date };
}

export type StreamPlaybackType = 'hls' | 'native';

export interface StreamPlayback {
  url: string;
  type: StreamPlaybackType;
}
