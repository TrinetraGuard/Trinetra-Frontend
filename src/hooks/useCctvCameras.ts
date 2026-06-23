import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { DEFAULT_CCTV_CAMERAS, getDefaultCamerasForDisplay } from '@/lib/defaultCctvCameras';
import { normalizeRtspUrl, sortCamerasByChannel } from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';
import { db } from '@/firebase/firebase';

let seedPromise: Promise<void> | null = null;
let syncPromise: Promise<void> | null = null;

async function seedDefaultCamerasIfEmpty(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    const snapshot = await getDocs(query(collection(db, 'cctv_cameras'), limit(1)));
    if (!snapshot.empty) return;

    await Promise.all(
      DEFAULT_CCTV_CAMERAS.map((camera) =>
        addDoc(collection(db, 'cctv_cameras'), {
          placeName: camera.placeName,
          rtspLink: normalizeRtspUrl(camera.rtspLink),
          latitude: camera.latitude,
          longitude: camera.longitude,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      )
    );
  })();

  try {
    await seedPromise;
  } catch (error) {
    seedPromise = null;
    console.error('Failed to seed default CCTV cameras:', error);
  }
}

/** Fix RTSP URLs in Firestore (password @ encoding, channel paths). */
async function syncSiteCameraUrls(): Promise<void> {
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    const existing = await getDocs(collection(db, 'cctv_cameras'));
    const updates: Promise<void>[] = [];

    for (const docSnap of existing.docs) {
      const data = docSnap.data() as { rtspLink?: string; placeName?: string };
      const link = data.rtspLink ?? '';
      const channelMatch = link.match(/\/unicast\/c(\d+)\//i);
      if (!channelMatch) continue;

      const channel = Number.parseInt(channelMatch[1], 10);
      const defaultCam = DEFAULT_CCTV_CAMERAS[channel - 1];
      if (!defaultCam) continue;

      const correctUrl = normalizeRtspUrl(defaultCam.rtspLink);
      const normalizedExisting = normalizeRtspUrl(link);

      if (normalizedExisting !== correctUrl) {
        updates.push(
          updateDoc(doc(db, 'cctv_cameras', docSnap.id), {
            rtspLink: correctUrl,
            placeName: defaultCam.placeName,
            updatedAt: serverTimestamp(),
          }).then(() => undefined)
        );
      }
    }

    await Promise.all(updates);
  })();

  try {
    await syncPromise;
  } catch (error) {
    syncPromise = null;
    console.error('Failed to sync site camera URLs:', error);
  }
}

/** Import site NVR cameras, skipping channels already registered. */
export async function importSiteCameras(): Promise<number> {
  await syncSiteCameraUrls();

  const existing = await getDocs(collection(db, 'cctv_cameras'));
  const existingPaths = new Set(
    existing.docs.map((docSnap) => {
      const data = docSnap.data() as { rtspLink?: string };
      const link = data.rtspLink ?? '';
      const match = link.match(/\/unicast\/c(\d+)\//i);
      return match ? match[1] : link;
    })
  );

  let imported = 0;
  for (const camera of DEFAULT_CCTV_CAMERAS) {
    const channelMatch = camera.rtspLink.match(/\/unicast\/c(\d+)\//i);
    const channel = channelMatch?.[1];
    if (channel && existingPaths.has(channel)) continue;

    await addDoc(collection(db, 'cctv_cameras'), {
      placeName: camera.placeName,
      rtspLink: normalizeRtspUrl(camera.rtspLink),
      latitude: camera.latitude,
      longitude: camera.longitude,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    imported += 1;
  }
  return imported;
}

export function useCctvCameras() {
  const [cameras, setCameras] = useState<CCTV[]>(sortCamerasByChannel(getDefaultCamerasForDisplay()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await seedDefaultCamerasIfEmpty();
      await syncSiteCameraUrls();
    })();

    const q = query(collection(db, 'cctv_cameras'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (cancelled) return;

        if (snapshot.empty) {
          setCameras(sortCamerasByChannel(getDefaultCamerasForDisplay()));
        } else {
          setCameras(
            sortCamerasByChannel(
              snapshot.docs.map((snapshotDoc) => ({
                id: snapshotDoc.id,
                ...snapshotDoc.data(),
              })) as CCTV[]
            )
          );
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to CCTV cameras:', error);
        if (!cancelled) {
          setCameras(sortCamerasByChannel(getDefaultCamerasForDisplay()));
          setLoading(false);
        }
      }
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return { cameras, loading };
}
