import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_CCTV_CAMERAS } from '@/lib/defaultCctvCameras';
import {
  fetchCctvRelayHealth,
  probeCctvNvr,
  type CctvNvrHealth,
  type CctvRelayHealth,
} from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';

type InfraState = 'checking' | 'ready' | 'degraded';

export function useStreamInfrastructure(cameras: CCTV[]) {
  const [relay, setRelay] = useState<CctvRelayHealth>({ online: false });
  const [nvr, setNvr] = useState<CctvNvrHealth>({ online: false });
  const [checking, setChecking] = useState(true);

  const sampleRtsp = useMemo(() => {
    const fromCamera = cameras.find((camera) => camera.rtspLink?.trim())?.rtspLink;
    return fromCamera ?? DEFAULT_CCTV_CAMERAS[0]?.rtspLink ?? '';
  }, [cameras]);

  useEffect(() => {
    let cancelled = false;

    const runCheck = async () => {
      setChecking(true);
      const relayHealth = await fetchCctvRelayHealth();
      if (cancelled) return;
      setRelay(relayHealth);

      if (sampleRtsp) {
        const nvrHealth = await probeCctvNvr(sampleRtsp);
        if (!cancelled) setNvr(nvrHealth);
      } else if (!cancelled) {
        setNvr({ online: false, message: 'No RTSP camera configured' });
      }

      if (!cancelled) setChecking(false);
    };

    void runCheck();
    const intervalId = setInterval(() => void runCheck(), 20000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [sampleRtsp]);

  const state: InfraState = checking
    ? 'checking'
    : relay.online && nvr.online
      ? 'ready'
      : 'degraded';

  const streamsEnabled = relay.online && nvr.online;

  return { relay, nvr, checking, state, streamsEnabled, sampleRtsp };
}
