import { AlertCircle, CheckCircle2, Loader2, Server, WifiOff } from 'lucide-react';

import { admin } from '@/lib/adminTheme';
import type { CctvNvrHealth, CctvRelayHealth } from '@/lib/cctv';

interface CctvStreamRelayBannerProps {
  relay: CctvRelayHealth;
  nvr: CctvNvrHealth;
  checking?: boolean;
}

export function CctvStreamRelayBanner({ relay, nvr, checking = false }: CctvStreamRelayBannerProps) {
  if (checking) {
    return (
      <div className={`${admin.warning} flex items-center gap-2`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking stream relay and NVR…
      </div>
    );
  }

  if (relay.online && nvr.online) {
    return (
      <div className={`${admin.success} flex items-center gap-2`}>
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Stream relay and NVR are online — live feeds should play in the browser.
      </div>
    );
  }

  return (
    <div className={`${admin.warning} space-y-3`}>
      {!relay.online && (
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>Stream relay offline.</strong> Start go2rtc from{' '}
            <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">Trinetra-Backend</code>:{' '}
            <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">./scripts/start-cctv-relay.sh</code>
            , then run <code className="rounded bg-gray-200 px-1.5 py-0.5 text-sm">go run .</code>
            {relay.message ? ` (${relay.message})` : ''}
          </div>
        </div>
      )}

      {relay.online && !nvr.online && (
        <div className="flex items-start gap-2">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <strong>
              NVR unreachable{nvr.host ? ` at ${nvr.host}${nvr.port ? `:${nvr.port}` : ''}` : ''}.
            </strong>{' '}
            Live video cannot load until the NVR responds on your network.
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-700">
              <li>Confirm the NVR is powered on and connected to the LAN.</li>
              <li>Your Mac must be on the same network (currently 192.168.1.x).</li>
              <li>Verify the NVR IP in CCTV Management matches the device (default 192.168.1.30).</li>
            </ul>
            {nvr.message && (
              <p className="mt-2 text-xs text-gray-600">{nvr.message}</p>
            )}
          </div>
        </div>
      )}

      <p className="flex items-center gap-1.5 pl-6 text-xs text-gray-600">
        <Server className="h-3.5 w-3.5" />
        Relay on port 1984 · Backend proxies at /api/v1/cctv/proxy
      </p>
    </div>
  );
}

export default CctvStreamRelayBanner;
