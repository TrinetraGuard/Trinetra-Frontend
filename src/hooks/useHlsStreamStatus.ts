/**
 * Polls the backend every 5 seconds to check which camera channels
 * have HLS streams ready. Returns a Set of ready channel numbers.
 */
import { useEffect, useRef, useState } from 'react';

interface StreamStatusItem {
  channel: number;
  ready: boolean;
  hls_url: string | null;
}

export function useHlsStreamStatus() {
  const [readyChannels, setReadyChannels] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = async () => {
    try {
      const res = await fetch('/trinetra-api/api/v1/streams/', { method: 'GET' });
      if (!res.ok) return;
      const data = (await res.json()) as { cameras: StreamStatusItem[] };
      const ready = new Set<number>(
        data.cameras.filter((c) => c.ready).map((c) => c.channel)
      );
      setReadyChannels(ready);
      setChecked(true);
    } catch {
      setChecked(true);
    }
  };

  useEffect(() => {
    void poll();
    timerRef.current = setInterval(() => void poll(), 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const anyReady = readyChannels.size > 0;
  const allReady = checked && readyChannels.size >= 8;

  return { readyChannels, anyReady, allReady, checked };
}
