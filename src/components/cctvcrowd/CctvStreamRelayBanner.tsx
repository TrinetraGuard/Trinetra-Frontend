import { Activity, AlertCircle, Brain, CheckCircle2, Loader2, Server, Video } from 'lucide-react';
import type { CctvNvrHealth, CctvRelayHealth } from '@/lib/cctv';

import type { AiBackendHealth } from '@/hooks/useStreamInfrastructure';
import { useHlsStreamStatus } from '@/hooks/useHlsStreamStatus';
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
  const { readyChannels, anyReady, checked } = useHlsStreamStatus();

  if (checking) {
    return (
      <div className={`${admin.warning} flex items-center gap-2`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking AI backend…
      </div>
    );
  }

  // ── AI backend online ────────────────────────────────────────────────────
  if (relay.online || nvr.online) {
    if (anyReady) {
      // HLS streams running — full live mode
      return (
        <div className={`${admin.success} flex items-center gap-3`}>
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <div className="flex-1">
            <span className="font-semibold">Live cameras active</span>
            {' — '}
            <span className="text-emerald-700">
              {readyChannels.size}/8 streams live · YOLO analytics running
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            LIVE
          </div>
        </div>
      );
    }

    // Backend online, HLS not started yet
    return (
      <div className="space-y-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <div className="flex items-center gap-3">
          <Brain className="h-4 w-4 shrink-0 text-blue-500" />
          <div className="flex-1">
            <span className="font-semibold">AI Backend online · analytics active</span>
            {' — '}
            <span className="text-blue-700">
              Run the HLS streamer to enable live camera video
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-500">
            <Activity className="h-3.5 w-3.5" />
            {checked ? 'waiting for streams' : 'checking…'}
          </div>
        </div>
        <div className="flex items-start gap-2 pl-7 text-xs text-blue-800">
          <Video className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
          <div>
            Open a new terminal and run:{' '}
            <code className="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-blue-900">
              cd Trinetra-backend &amp;&amp; bash start-hls.sh
            </code>
          </div>
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
      <div className="space-y-1 pl-6 text-sm">
        <p className="inline-block rounded bg-gray-100 px-2 py-1 font-mono text-xs">
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
