import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { db } from "@/firebase/firebase";

type VolunteerRecord = {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  appName?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: unknown;
};

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("appName", "==", "Trinetra"),
        where("role", "==", "volunteer")
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const data: VolunteerRecord[] = snap.docs.map((doc) => ({ uid: doc.id, ...(doc.data() as Record<string, unknown>) })) as VolunteerRecord[];
          setVolunteers(data);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load volunteers";
      setError(message);
      setLoading(false);
    }
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) {
      return volunteers;
    }
    const term = search.toLowerCase();
    return volunteers.filter((u) =>
      [u.name, u.email, u.phone, u.uid]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(term))
    );
  }, [volunteers, search]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-2xl">Volunteers</CardTitle>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or UID"
            className="h-10 w-72 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none ring-0 focus:border-gray-400 focus:ring-0"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center text-gray-500">Loading volunteers…</div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-gray-500">No volunteers found.</div>
          ) : (
            <Table>
              <TableCaption>Trinetra volunteers</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[48px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Latitude</TableHead>
                  <TableHead>Longitude</TableHead>
                  <TableHead className="hidden md:table-cell">UID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u, idx) => (
                  <TableRow key={u.uid}>
                    <TableCell className="text-gray-500">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.phone || "—"}</TableCell>
                    <TableCell>{typeof u.latitude === "number" ? u.latitude.toFixed(6) : "—"}</TableCell>
                    <TableCell>{typeof u.longitude === "number" ? u.longitude.toFixed(6) : "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-gray-500">{u.uid}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default Volunteers