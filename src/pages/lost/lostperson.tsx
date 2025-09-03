import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DocumentData,
  QuerySnapshot,
  collectionGroup,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { Loader2, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Timestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

// --- Types ---
type FirestoreReport = {
  id: string; // reportId
  userId: string; // derived from parent path
  name: string;
  aadhar: string;
  contact: string;
  placeLost: string;
  address: string;
  status?: string;
  createdAt?: Timestamp | null; // Firestore Timestamp or undefined
};

type LostPersonAPI = {
  aadhar_number: string;
  image_path?: string;
};

type LostPersonsResponse = {
  success: boolean;
  data: { lost_persons: LostPersonAPI[] };
};

// --- Small helpers ---
const statusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("found")) {
    return "bg-green-100 text-green-800 border-green-200";
  }
  if (s.includes("review")) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }
  if (s.includes("pending")) {
    return "bg-gray-100 text-gray-800 border-gray-200";
  }
  return "bg-orange-100 text-orange-800 border-orange-200";
};

const fmtDate = (ts?: Timestamp | Date | null) => {
  try {
    if (!ts) {
      return "—";
    }
    // Firestore Timestamp
    // @ts-expect-error duck-typing to handle Firestore Timestamp
    if (typeof ts.toDate === "function") {
      // @ts-expect-error ts may be a Firestore Timestamp
      return ts.toDate().toLocaleString();
    }
    if (ts instanceof Date) {
      return ts.toLocaleString();
    }
  } catch (error) {
    // Fallback if date formatting fails
    // eslint-disable-next-line no-console
    console.error("Failed to format date:", error);
  }
  return "—";
};

const getDateAndTime = (ts?: Timestamp | Date | null): { date: string; time: string } => {
  try {
    if (!ts) {
      return { date: "—", time: "" };
    }
    // @ts-expect-error Firestore Timestamp duck-typing
    if (typeof ts.toDate === "function") {
      // @ts-expect-error ts may be a Firestore Timestamp
      const d = ts.toDate() as Date;
      return { date: d.toLocaleDateString(), time: d.toLocaleTimeString() };
    }
    if (ts instanceof Date) {
      return { date: ts.toLocaleDateString(), time: ts.toLocaleTimeString() };
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to split date/time:", error);
  }
  return { date: "—", time: "" };
};

// --- Component ---
const LostpersonAdmin = () => {
  const [reports, setReports] = useState<FirestoreReport[]>([]);
  const [imgMap, setImgMap] = useState<Record<string, string>>({}); // aadhar -> imageUrl
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<FirestoreReport | null>(null);

  // 1) Fetch image map once (API) and cache
  useEffect(() => {
    const loadImages = async () => {
      try {
        const r = await fetch(
          "https://trinetraguard-backend-local.onrender.com/api/v1/lost-persons/"
        );
        const j: LostPersonsResponse = await r.json();
        if (j?.success && Array.isArray(j.data?.lost_persons)) {
          const map: Record<string, string> = {};
          j.data.lost_persons.forEach((p) => {
            if (p.image_path && p.aadhar_number) {
              const filename = p.image_path.split("/").pop();
              if (filename) {
                map[p.aadhar_number] =
                  "https://trinetraguard-backend-local.onrender.com/api/v1/images/" +
                  filename;
              }
            }
          });
          setImgMap(map);
        }
      } catch (e) {
        console.error("Image API fetch failed:", e);
      }
    };
    loadImages();
  }, []);

  // 2) Live Firestore reports (collectionGroup across users)
  useEffect(() => {
    const q = collectionGroup(db, "reports");
    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) => {
        const items: FirestoreReport[] = snap.docs.map((d) => {
          const data = d.data() || {};
          // parent path: lostReports/{userId}/reports/{reportId}
          const userId = d.ref.parent.parent?.id || "";
          return {
            id: d.id,
            userId,
            name: data.name ?? "",
            aadhar: data.aadhar ?? "",
            contact: data.contact ?? "",
            placeLost: data.placeLost ?? "",
            address: data.address ?? "",
            status: data.status ?? "Pending",
            createdAt: data.createdAt,
          };
        });

        // sort by createdAt desc (locally; avoids required Firestore index)
        items.sort((a, b) => {
          const ta =
            a.createdAt && typeof a.createdAt.toMillis === "function"
              ? a.createdAt.toMillis()
              : 0;
          const tb =
            b.createdAt && typeof b.createdAt.toMillis === "function"
              ? b.createdAt.toMillis()
              : 0;
          return tb - ta;
        });

        setReports(items);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore reports listener error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  // 3) Merge image url by aadhar
  const rows = useMemo(
    () =>
      reports.map((r) => ({
        ...r,
        imageUrl: r.aadhar ? imgMap[r.aadhar] : undefined,
      })),
    [reports, imgMap]
  );

  // 4) Update status
  const setStatus = async (row: FirestoreReport, newStatus: string) => {
    setSavingId(row.id);
    try {
      const ref = doc(db, "lostReports", row.userId, "reports", row.id);
      await updateDoc(ref, { status: newStatus });
      // Optimistic local update (listener will also push the change)
      setReports((prev) =>
        prev.map((p) =>
          p.id === row.id ? { ...p, status: newStatus } : p
        )
      );
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setSavingId(null);
    }
  };

  // 5) Delete report
  const deleteReport = async (row: FirestoreReport) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the report for "${row.name || "Unknown"}"?`
    );
    if (!confirmed) return;
    setDeletingId(row.id);
    try {
      const ref = doc(db, "lostReports", row.userId, "reports", row.id);
      await deleteDoc(ref);
      // Optimistic local removal (listener will also update)
      setReports((prev) => prev.filter((p) => p.id !== row.id));
    } catch (e) {
      console.error("Failed to delete report:", e);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading lost persons...
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      <div className="overflow-x-hidden rounded-xl border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Aadhaar</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="whitespace-nowrap text-xs">Place</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.userId}-${r.id}`}>
                {/* Photo */}
                <TableCell className="whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {r.imageUrl ? (
                      <img
                        src={r.imageUrl}
                        alt={r.name}
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer border"
                        onClick={() => setPreviewSrc(r.imageUrl!)}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
                        N/A
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Name */}
                <TableCell className="font-semibold whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis align-middle">{r.name || "—"}</TableCell>

                {/* Aadhaar */}
                <TableCell className="whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis align-middle">{r.aadhar || "—"}</TableCell>

                {/* Contact */}
                <TableCell className="whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis align-middle">{r.contact || "—"}</TableCell>

                {/* Place */}
                <TableCell className="whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis align-middle text-xs">{r.placeLost || "—"}</TableCell>

                {/* Address */}
                <TableCell className="whitespace-nowrap max-w-[260px] overflow-hidden text-ellipsis align-middle">{r.address || "—"}</TableCell>

                {/* Uploaded */}
                <TableCell className="align-middle">
                  {(() => {
                    const dt = getDateAndTime(r.createdAt);
                    return (
                      <div className="leading-tight">
                        <div className="whitespace-nowrap">{dt.date}</div>
                        <div className="whitespace-nowrap text-muted-foreground text-xs">{dt.time}</div>
                      </div>
                    );
                  })()}
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Select
                    value={(r.status || "Pending").toString()}
                    onValueChange={(v) => setStatus(r, v)}
                    disabled={deletingId === r.id}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Found">Found</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>

                {/* Actions: quick status buttons */}
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2 whitespace-nowrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setViewReport(r)}
                      title="View details"
                    >
                      View
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === r.id || savingId === r.id}
                      onClick={() => deleteReport(r)}
                      title="Delete report"
                    >
                      {deletingId === r.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="mr-2 h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Image preview */}
      <Dialog open={!!previewSrc} onOpenChange={() => setPreviewSrc(null)}>
        <DialogContent className="max-w-3xl bg-white">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewSrc && (
            <img
              src={previewSrc}
              alt="Preview"
              className="w-full h-auto rounded-xl"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View details */}
      <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Report Details</DialogTitle>
          </DialogHeader>
          {viewReport && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden">
                  {viewReport.aadhar && rows.find(x => x.id === viewReport.id)?.imageUrl ? (
                    <img
                      src={rows.find(x => x.id === viewReport.id)?.imageUrl}
                      alt={viewReport.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Photo</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="font-medium text-gray-500">Name</div>
                  <div className="text-gray-900">{viewReport.name || "—"}</div>

                  <div className="font-medium text-gray-500">Aadhaar</div>
                  <div className="text-gray-900">{viewReport.aadhar || "—"}</div>

                  <div className="font-medium text-gray-500">Contact</div>
                  <div className="text-gray-900">{viewReport.contact || "—"}</div>

                  <div className="font-medium text-gray-500">Uploaded</div>
                  <div className="text-gray-900">{fmtDate(viewReport.createdAt)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-500 mb-1">Place</div>
                  <div className="rounded-md border bg-gray-50 p-3 text-gray-900">
                    {viewReport.placeLost || "—"}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-500 mb-1">Address</div>
                  <div className="rounded-md border bg-gray-50 p-3 text-gray-900">
                    {viewReport.address || "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${statusClass(viewReport.status || 'Pending')}`}>
                    {viewReport.status || 'Pending'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setViewReport(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LostpersonAdmin;
