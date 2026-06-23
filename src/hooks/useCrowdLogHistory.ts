import { useEffect, useState } from 'react';

import { getCrowdLogs, subscribeCrowdLogs } from '@/lib/crowdAnalyticsStore';
import type { CrowdLogEntry } from '@/types/crowdReports';

export function useCrowdLogHistory(): CrowdLogEntry[] {
  const [logs, setLogs] = useState<CrowdLogEntry[]>(() => getCrowdLogs());

  useEffect(() => {
    return subscribeCrowdLogs(() => setLogs(getCrowdLogs()));
  }, []);

  return logs;
}
