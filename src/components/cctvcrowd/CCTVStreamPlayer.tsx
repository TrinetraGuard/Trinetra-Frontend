import Hls from 'hls.js';
import { AlertCircle, Loader2, RefreshCw, VideoOff } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  isStreamProxyConfigured,
  isValidRtspUrl,
  resolveStreamPlayback,
} from '@/lib/cctv';
import type { CCTV, StreamPlayback } from '@/types/cctv';

type PlayerState = 'idle' | 'loading' | 'playing' | 'error';

interface CCTVStreamPlayerProps {
  camera: CCTV;
  className?: string;
  autoPlay?: boolean;
  muted?: boolean;
  showControls?: boolean;
  showLiveBadge?: boolean;
  compact?: boolean;
  startupDelayMs?: number;
  onError?: (message: string) => void;
  onPlaying?: () => void;
}

function attachPlayback(
  playback: StreamPlayback,
  video: HTMLVideoElement,
  autoPlay: boolean,
  onFail: (message: string) => void,
  hlsRef: React.MutableRefObject<Hls | null>,
  networkRetriesRef: React.MutableRefObject<number>
) {
  if (playback.type === 'native') {
    video.src = playback.url;
    if (autoPlay) {
      void video.play().catch(() => {
        onFail('Autoplay blocked. Click play to start the stream.');
      });
    }
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = playback.url;
    if (autoPlay) {
      void video.play().catch(() => {
        onFail('Autoplay blocked. Click play to start the stream.');
      });
    }
    return;
  }

  if (!Hls.isSupported()) {
    onFail('This browser does not support HLS playback.');
    return;
  }

  const hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    backBufferLength: 30,
    manifestLoadingTimeOut: 60000,
    manifestLoadingMaxRetry: 5,
    levelLoadingTimeOut: 60000,
    fragLoadingTimeOut: 60000,
  });
  hlsRef.current = hls;
  hls.loadSource(playback.url);
  hls.attachMedia(video);
  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    networkRetriesRef.current = 0;
    if (autoPlay) {
      void video.play().catch(() => {
        onFail('Autoplay blocked. Click play to start the stream.');
      });
    }
  });
  hls.on(Hls.Events.ERROR, (_event, data) => {
    if (!data.fatal) return;
    if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRetriesRef.current < 5) {
      networkRetriesRef.current += 1;
      hls.startLoad();
      return;
    }
    onFail(
      'HLS stream error. Verify the RTSP link, Trinetra backend, stream relay, and that the camera is online on your network.'
    );
    hls.destroy();
    hlsRef.current = null;
  });
}

export function CCTVStreamPlayer({
  camera,
  className = '',
  autoPlay = true,
  muted = true,
  showControls = true,
  showLiveBadge = true,
  compact = false,
  startupDelayMs = 0,
  onError,
  onPlaying,
}: CCTVStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const networkRetriesRef = useRef(0);
  const connectAttemptRef = useRef(0);
  const [state, setState] = useState<PlayerState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryKey, setRetryKey] = useState(0);

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
    let cancelled = false;
    let removeVideoListeners: (() => void) | undefined;

    destroyPlayer();
    networkRetriesRef.current = 0;
    connectAttemptRef.current = 0;
    setState('loading');
    setErrorMessage('');

    void (async () => {
      if (startupDelayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, startupDelayMs));
      }
      if (cancelled) return;

      const maxAttempts = 3;
      let playback: StreamPlayback | null = null;

      while (connectAttemptRef.current < maxAttempts && !cancelled) {
        connectAttemptRef.current += 1;
        const result = await resolveStreamPlayback(camera);
        playback = result.playback;
        if (playback) break;
        if (result.errorMessage && connectAttemptRef.current >= maxAttempts) {
          handleFailure(result.errorMessage);
          return;
        }
        if (connectAttemptRef.current >= maxAttempts) break;
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      if (cancelled) return;

      if (!playback) {
        const isRtsp = isValidRtspUrl(camera.rtspLink);
        handleFailure(
          isRtsp
            ? isStreamProxyConfigured()
              ? 'Unable to connect to this camera. Check the RTSP URL and that the camera is reachable from the stream relay.'
              : 'Start the Trinetra backend and stream relay to play RTSP cameras in the browser.'
            : 'Unable to build a playable stream URL for this camera.'
        );
        return;
      }

      const video = videoRef.current;
      if (!video || cancelled) return;

      video.muted = muted;
      video.playsInline = true;
      video.controls = showControls;

      const onVideoReady = () => {
        setState('playing');
        onPlaying?.();
      };

      const onVideoError = () => {
        handleFailure('Video playback failed. Check the stream URL.');
      };

      video.addEventListener('playing', onVideoReady);
      video.addEventListener('canplay', onVideoReady);
      video.addEventListener('error', onVideoError);
      removeVideoListeners = () => {
        video.removeEventListener('playing', onVideoReady);
        video.removeEventListener('canplay', onVideoReady);
        video.removeEventListener('error', onVideoError);
      };

      attachPlayback(playback, video, autoPlay, handleFailure, hlsRef, networkRetriesRef);
    })();

    return () => {
      cancelled = true;
      removeVideoListeners?.();
      destroyPlayer();
    };
  }, [
    autoPlay,
    camera,
    destroyPlayer,
    handleFailure,
    muted,
    onPlaying,
    retryKey,
    showControls,
    startupDelayMs,
  ]);

  useEffect(() => {
    if (state !== 'loading') return;

    const timeoutId = window.setTimeout(() => {
      handleFailure(
        'Connection timed out. Make sure the Trinetra AI backend is running and the camera RTSP URL is reachable from this machine.'
      );
    }, 30000);

    return () => window.clearTimeout(timeoutId);
  }, [state, handleFailure, retryKey]);

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
