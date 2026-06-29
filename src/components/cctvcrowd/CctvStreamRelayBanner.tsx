import { Activity, AlertCircle, Brain, CheckCircle2, Loader2, Server } from 'lucide-react';
import type { CctvNvrHealth, CctvRelayHealth } from '@/lib/cctv';

import type { AiBackendHealth } from '@/hooks/useStreamInfrastructure';
import { admin } from '@/lib/adminTheme';

interface CctvStreamRelayBannerProps {
  relay: CctvRelayHealth;
  nvr: CctvNvrHealth;
  aiBackend?: AiBackendHealth;
  checking?: boolean;
}

export function CctvStreamRelayBanner({
  relay,
  nvr,
  checking = false,
}: CctvStreamRelayBannerProps) {
  if (checking) {
    return (
      <div className={`${admin.warning} flex items-center gap-2`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking AI backend…
      </div>
    );
  }

  // ── AI backend + cameras fully online ─────────────────────────────────
  if (relay.online && nvr.online) {
    return (
      <div className={`${admin.success} flex items-center gap-3`}>
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        <div className="flex-1">
          <span className="font-semibold">Trinetra AI Backend online</span>
          {' — '}
          <span className="text-emerald-700">all 8 cameras active · YOLO detection running</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          LIVE
        </div>
      </div>
    );
  }

  // ── AI backend online but NVR probing in progress ─────────────────────
  if (relay.online && !nvr.online) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <Brain className="h-4 w-4 shrink-0 text-blue-500" />
        <div>
          <span className="font-semibold">Trinetra AI Backend online</span>
          {' — '}
          <span className="text-blue-700">probing camera status…</span>
          {nvr.message && <span className="ml-1 text-xs text-blue-500">({nvr.message})</span>}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-blue-500">
          <Activity className="h-3.5 w-3.5" />
          analytics running
        </div>
      </div>
    );
  }

  // ── AI backend offline ─────────────────────────────────────────────────
  return (
    <div className={`${admin.warning} space-y-3`}>
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <strong>Trinetra AI Backend offline.</strong>{' '}
          Start the backend to enable live analytics and camera status.
        </div>
      </div>
      <div className="pl-6 space-y-1 text-sm">
        <p className="font-mono rounded bg-gray-100 px-2 py-1 text-xs inline-block">
          cd Trinetra-backend &amp;&amp; .venv/bin/uvicorn app.main:app --port 8000 --reload
        </p>
      </div>
      <p className="flex items-center gap-1.5 pl-6 text-xs text-gray-600">
        <Server className="h-3.5 w-3.5" />
        AI Backend on port 8000 · Live video requires on-site NVR access
      </p>
    </div>
  );
}

export default CctvStreamRelayBanner;
