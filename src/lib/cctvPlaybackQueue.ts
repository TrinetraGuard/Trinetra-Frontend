/** Serializes CCTV playback setup so the NVR is not hit with 8 RTSP connects at once. */
let chain: Promise<void> = Promise.resolve();
let lastStartedAt = 0;

const MIN_GAP_MS = 600;

export async function enqueueCctvPlayback<T>(task: () => Promise<T>): Promise<T> {
  const run = async (): Promise<T> => {
    const waitMs = Math.max(0, MIN_GAP_MS - (Date.now() - lastStartedAt));
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    lastStartedAt = Date.now();
    return task();
  };

  const result = chain.then(run, run);
  chain = result.then(
    () => undefined,
    () => undefined
  );
  return result;
}

export function resetCctvPlaybackQueue(): void {
  chain = Promise.resolve();
  lastStartedAt = 0;
}
