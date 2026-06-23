import Hls from 'hls.js';
import { AlertCircle, Loader2, RefreshCw, VideoOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  getStreamPlaybackUrl,
  isStreamProxyConfigured,
  isValidRtspUrl,
} from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';

type PlayerState = 'idle' | 'loading' | 'playing' | 'error';

interface CCTVStreamPlayerProps {
  camera: CCTV;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  showControls?: boolean;
  showLiveBadge?: boolean;
  compact?: boolean;
  onError?: (message: string) => void;
  onPlaying?: () => void;
}

export function CCTVStreamPlayer({
  camera,
  className = '',
  autoPlay = true,
  muted = true,
  showControls = true,
  showLiveBadge = true,
  compact = false,
  onError,
  onPlaying,
}: CCTVStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayerState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const playback = getStreamPlaybackUrl(camera);

  const destroyPlayer = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.removeAttribute('src');
      video.load();
    }
  }, []);

  const handleFailure = useCallback(
    (message: string) => {
      setState('error');
      setErrorMessage(message);
      onError?.(message);
    },
    [onError]
  );

  useEffect(() => {
    destroyPlayer();
    setState('loading');
    setErrorMessage('');

    if (!playback) {
      const needsProxy = isValidRtspUrl(camera.rtspLink) && !isStreamProxyConfigured();
      handleFailure(
        needsProxy
          ? 'Set VITE_CCTV_PROXY_URL (go2rtc/MediaMTX) to play RTSP streams in the browser.'
          : 'Unable to build a playable stream URL for this camera.'
      );
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
    video.playsInline = true;
    if (showControls) {
      video.controls = true;
    }

    const onVideoPlaying = () => {
      setState('playing');
      onPlaying?.();
    };

    const onVideoError = () => {
      handleFailure('Video playback failed. Check the stream URL and proxy service.');
    };

    video.addEventListener('playing', onVideoPlaying);
    video.addEventListener('error', onVideoError);

    if (playback.type === 'native') {
      video.src = playback.url;
      if (autoPlay) {
        void video.play().catch(() => {
          handleFailure('Autoplay blocked. Click play to start the stream.');
        });
      }
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playback.url;
      if (autoPlay) {
        void video.play().catch(() => {
          handleFailure('Autoplay blocked. Click play to start the stream.');
        });
      }
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });
      hlsRef.current = hls;
      hls.loadSource(playback.url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          void video.play().catch(() => {
            handleFailure('Autoplay blocked. Click play to start the stream.');
          });
        }
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        handleFailure('HLS stream error. Verify the RTSP link and streaming proxy.');
        hls.destroy();
        hlsRef.current = null;
      });
    } else {
      handleFailure('This browser does not support HLS playback.');
    }

    return () => {
      video.removeEventListener('playing', onVideoPlaying);
      video.removeEventListener('error', onVideoError);
      destroyPlayer();
    };
  }, [
    autoPlay,
    camera,
    destroyPlayer,
    handleFailure,
    muted,
    onPlaying,
    playback,
    retryKey,
    showControls,
  ]);

  const retry = () => setRetryKey((value) => value + 1);

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <video
        ref={videoRef}
        className={`h-full w-full bg-black ${state === 'playing' ? 'object-contain' : 'opacity-0'}`}
        muted={muted}
        playsInline
        controls={showControls && state === 'playing'}
      />

      {state === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-900 to-black text-white">
          <Loader2 className="h-8 w-8 animate-spin text-orange-400" />
          <p className="text-sm text-gray-300">Connecting to {camera.placeName}…</p>
        </div>
      )}

      {state === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-gray-900 to-black px-6 text-center text-white">
          <VideoOff className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} text-red-400`} />
          <div className="space-y-2">
            <p className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
              Stream unavailable
            </p>
            {!compact && (
              <p className="mx-auto max-w-md text-xs leading-relaxed text-gray-400">
                {errorMessage}
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-white/20 bg-white/10 text-white hover:bg-white/20"
            onClick={retry}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      )}

      {showLiveBadge && state === 'playing' && (
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2 rounded-full border border-red-400/60 bg-red-600/95 px-3 py-1 text-xs font-semibold text-white shadow-lg">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          LIVE
        </div>
      )}

      {state === 'error' && compact && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/70 p-1.5">
          <AlertCircle className="h-4 w-4 text-red-400" />
        </div>
      )}
    </div>
  );
}

export default CCTVStreamPlayer;
