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

export interface AiBackendHealth {
  online: boolean;
  cameras_live: number;
  cameras_total: number;
  simulation_mode: boolean;
}

export function useStreamInfrastructure(cameras: CCTV[]) {
  // relay.online now reflects the AI backend health (fetchCctvRelayHealth was updated to call AI backend)
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

      // fetchCctvRelayHealth now checks the AI backend (Go backend/go2rtc removed)
      const relayHealth = await fetchCctvRelayHealth();
      if (cancelled) return;
      setRelay(relayHealth);

      if (sampleRtsp) {
        const nvrHealth = await probeCctvNvr(sampleRtsp);
        if (!cancelled) setNvr(nvrHealth);
      } else if (!cancelled) {
        setNvr({ online: false, message: 'No camera configured' });
      }

      if (!cancelled) setChecking(false);
    };

    void runCheck();
    const intervalId = setInterval(() => void runCheck(), 20_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [sampleRtsp]);

  // Derive AI backend info from relay health
  const aiBackend: AiBackendHealth = {
    online: relay.online,
    cameras_live: nvr.online ? 8 : 0,
    cameras_total: 8,
    simulation_mode: true,
  };

  const state: InfraState = checking ? 'checking' : relay.online ? 'ready' : 'degraded';

  // streamsEnabled = false always: go2rtc is removed, video needs the relay.
  // AI analytics still works via aiBackend.online.
  const streamsEnabled = false;

  return { relay, nvr, aiBackend, checking, state, streamsEnabled, sampleRtsp };
}
