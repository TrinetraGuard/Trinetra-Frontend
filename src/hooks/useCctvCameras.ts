import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { DEFAULT_CCTV_CAMERAS, getDefaultCamerasForDisplay } from '@/lib/defaultCctvCameras';
import { normalizeRtspUrl } from '@/lib/cctv';
import type { CCTV } from '@/types/cctv';
import { db } from '@/firebase/firebase';
import { useEffect, useState } from 'react';

let seedPromise: Promise<void> | null = null;

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

/** Import site NVR cameras, skipping channels already registered. */
export async function importSiteCameras(): Promise<number> {
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
  const [cameras, setCameras] = useState<CCTV[]>(getDefaultCamerasForDisplay());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void seedDefaultCamerasIfEmpty();

    const q = query(collection(db, 'cctv_cameras'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (cancelled) return;

        if (snapshot.empty) {
          setCameras(getDefaultCamerasForDisplay());
        } else {
          setCameras(
            snapshot.docs.map((snapshotDoc) => ({
              id: snapshotDoc.id,
              ...snapshotDoc.data(),
            })) as CCTV[]
          );
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to CCTV cameras:', error);
        if (!cancelled) {
          setCameras(getDefaultCamerasForDisplay());
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
