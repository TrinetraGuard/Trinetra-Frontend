import { AlertCircle, CheckCircle2, Loader2, Server } from 'lucide-react';
import { useEffect, useState } from 'react';

import { admin } from '@/lib/adminTheme';
import { getTrinetraApiBase, probeCctvProxy } from '@/lib/cctv';

type RelayState = 'checking' | 'online' | 'offline';

export function CctvStreamRelayBanner() {
  const [state, setState] = useState<RelayState>('checking');
  const usesBackend = Boolean(getTrinetraApiBase());

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      const online = await probeCctvProxy();
      if (!cancelled) setState(online ? 'online' : 'offline');
    };

    void check();
    const intervalId = setInterval(() => void check(), 15000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  if (state === 'checking') {
    return (
      <div className={`${admin.warning} flex items-center gap-2`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking stream relay…
      </div>
    );
  }

  if (state === 'online') {
    return (
      <div className={`${admin.success} flex items-center gap-2`}>
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Stream relay is online — RTSP cameras will play as live HLS feeds
        {usesBackend ? ' via Trinetra backend.' : '.'}
      </div>
    );
  }

  return (
    <div className={`${admin.warning} space-y-2`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <strong>Stream relay offline.</strong> RTSP cameras need go2rtc running to show live
          video in the browser.
          {usesBackend ? (
            <>
              {' '}
              From <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">Trinetra-Backend</code>{' '}
              run{' '}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">./scripts/start-cctv-relay.sh</code>{' '}
              (no Docker needed), then start the Go backend with{' '}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">go run .</code>.
            </>
          ) : (
            <>
              {' '}
              Run{' '}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">npm run cctv:proxy</code>{' '}
              or{' '}
              <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">./scripts/start-cctv-relay.sh</code>{' '}
              in Trinetra-Backend.
            </>
          )}
        </div>
      </div>
      <p className="flex items-center gap-1.5 pl-6 text-xs text-gray-600">
        <Server className="h-3.5 w-3.5" />
        {usesBackend
          ? 'Backend proxies go2rtc at /api/v1/cctv/proxy. Relay listens on port 1984.'
          : 'Relay listens on port 1984. Start with ./scripts/start-cctv-relay.sh (no Docker required).'}
      </p>
    </div>
  );
}

export default CctvStreamRelayBanner;
