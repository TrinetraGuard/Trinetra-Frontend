import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { db } from "@/firebase/firebase";

type UserRecord = {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  appName?: string;
};

const Volunteersmangement = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    setError("");
    try {
      const usersRef = collection(db, "users");
      const q = query(
        usersRef,
        where("appName", "==", "Trinetra"),
        where("role", "==", "user"),
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const data: UserRecord[] = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Record<string, unknown>) })) as UserRecord[];
          setUsers(data);
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load users";
      setError(message);
      setLoading(false);
    }
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) {
      return users;
    }
    const term = search.toLowerCase();
    return users.filter((u) =>
      [u.name, u.email, u.phone, u.uid]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .some((v) => v.includes(term))
    );
  }, [users, search]);

  const promoteToVolunteer = async (uid: string) => {
    try {
      setUpdatingId(uid);
      await updateDoc(doc(db, "users", uid), { role: "volunteer" });
    } catch (e: unknown) {
      // eslint-disable-next-line no-alert
      alert(e instanceof Error ? e.message : "Failed to update role");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-2xl">Users eligible for promotion</CardTitle>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or UID"
            className="h-10 w-72 rounded-md border border-gray-300 bg-white px-3 text-sm outline-none ring-0 focus:border-gray-400 focus:ring-0"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-40 items-center justify-center text-gray-500">Loading users…</div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-red-600">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-gray-500">No eligible users found.</div>
          ) : (
            <Table>
              <TableCaption>Promote users to volunteers</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[48px]">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden md:table-cell">UID</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u, idx) => (
                  <TableRow key={u.uid}>
                    <TableCell className="text-gray-500">{idx + 1}</TableCell>
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.phone || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-gray-500">{u.uid}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={updatingId === u.uid}
                        onClick={() => promoteToVolunteer(u.uid)}
                      >
                        {updatingId === u.uid ? "Updating…" : "Promote to Volunteer"}
                      </Button>
                    </TableCell>
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

export default Volunteersmangement