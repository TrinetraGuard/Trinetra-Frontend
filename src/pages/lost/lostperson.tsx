import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DocumentData,
  QuerySnapshot,
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Eye, Loader2, MapPin, Send, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Timestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";

// ---------------- TYPES ---------------- //
type FirestoreReport = {
  id: string;
  userId: string;
  name: string;
  aadhar: string;
  contact: string;
  placeLost: string;
  address: string;
  imageUrl?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

type Volunteer = {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  role?: string;
};

type UserInfo = {
  name?: string;
  email?: string;
  phone?: string;
};

// Haversine distance calculation in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------- HELPERS ---------------- //
const statusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes("found")) return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("review")) return "bg-blue-100 text-blue-800 border-blue-200";
  if (s.includes("pending")) return "bg-gray-100 text-gray-800 border-gray-200";
  return "bg-orange-100 text-orange-800 border-orange-200";
};

const fmtDate = (ts?: Timestamp | Date | null) => {
  try {
    if (!ts) return "—";
    if (ts instanceof Date) return ts.toLocaleString();
    if (typeof ts === "object" && "toDate" in ts && typeof ts.toDate === "function") {
      return ts.toDate().toLocaleString();
    }
  } catch {
    return "—";
  }
  return "—";
};

// ---------------- MAIN COMPONENT ---------------- //
const LostpersonAdmin = () => {
  const [reports, setReports] = useState<FirestoreReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<FirestoreReport | null>(null);
  const [reporterInfo, setReporterInfo] = useState<UserInfo | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [nearbyVolunteers, setNearbyVolunteers] = useState<Volunteer[]>([]);
  const [sendingAlert, setSendingAlert] = useState<string | null>(null);
  const [showVolunteers, setShowVolunteers] = useState(false);

  // 1️⃣ Load volunteers
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "volunteer"));
    const unsub = onSnapshot(q, (snap) => {
      const vols: Volunteer[] = snap.docs.map((d) => ({
        ...(d.data() as Volunteer),
        uid: d.id,
      }));
      setVolunteers(vols);
    });
    return () => unsub();
  }, []);

  // 2️⃣ Firestore live listener for reports
  useEffect(() => {
    const q = collectionGroup(db, "reports");
    const unsub = onSnapshot(
      q,
      (snap: QuerySnapshot<DocumentData>) => {
        const items: FirestoreReport[] = snap.docs.map((d) => {
          const data = d.data();
          const userId = d.ref.parent.parent?.id || "";
          return {
            id: d.id,
            userId,
            name: data.name,
            aadhar: data.aadhar,
            contact: data.contact,
            placeLost: data.placeLost,
            address: data.address,
            imageUrl: data.imageUrl,
            latitude: data.latitude,
            longitude: data.longitude,
            status: data.status ?? "Pending",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          };
        });

        items.sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() || 0;
          const tb = b.createdAt?.toMillis?.() || 0;
          return tb - ta;
        });

        setReports(items);
        setLoading(false);
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  // 3️⃣ Find nearby volunteers (within 5km)
  const findNearbyVolunteers = (report: FirestoreReport) => {
    if (!report.latitude || !report.longitude) {
      setNearbyVolunteers([]);
      return;
    }

    const nearby = volunteers.filter((vol) => {
      if (!vol.latitude || !vol.longitude) return false;
      const distance = haversine(
        report.latitude!,
        report.longitude!,
        vol.latitude,
        vol.longitude
      );
      return distance <= 5; // 5km radius
    });

    // Sort by distance (closest first)
    nearby.sort((a, b) => {
      const distA = haversine(
        report.latitude!,
        report.longitude!,
        a.latitude!,
        a.longitude!
      );
      const distB = haversine(
        report.latitude!,
        report.longitude!,
        b.latitude!,
        b.longitude!
      );
      return distA - distB;
    });

    setNearbyVolunteers(nearby);
    setShowVolunteers(true);
  };

  // 4️⃣ Send alert to volunteer
  const sendAlertToVolunteer = async (report: FirestoreReport, volunteer: Volunteer) => {
    if (!report.latitude || !report.longitude) {
      alert("Location data is missing for this report. Cannot send alert.");
      return;
    }

    setSendingAlert(volunteer.uid);
    try {
      await addDoc(collection(db, "volunteer_alerts"), {
        volunteerId: volunteer.uid,
        volunteerName: volunteer.name || "Unknown",
        volunteerEmail: volunteer.email || "",
        reportId: report.id,
        reportUserId: report.userId,
        lostPersonName: report.name,
        lostPersonAadhar: report.aadhar,
        lostPersonContact: report.contact,
        lostPersonImage: report.imageUrl || "",
        placeLost: report.placeLost,
        address: report.address,
        latitude: report.latitude,
        longitude: report.longitude,
        status: "pending",
        sentAt: new Date(),
        read: false,
      });

      alert(`Alert sent successfully to ${volunteer.name || volunteer.email || "volunteer"}!`);
    } catch (error) {
      console.error("Error sending alert:", error);
      alert("Failed to send alert. Please try again.");
    } finally {
      setSendingAlert(null);
    }
  };

  // 5️⃣ Fetch reporter details
  const fetchReporterInfo = async (userId: string) => {
    try {
      const userRef = doc(collection(db, "users"), userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserInfo;
        setReporterInfo(data);
      } else setReporterInfo(null);
    } catch (err) {
      console.error("Failed to fetch reporter:", err);
    }
  };

  // 6️⃣ Update report status
  const setStatus = async (row: FirestoreReport, newStatus: string) => {
    setSavingId(row.id);
    try {
      const ref = doc(db, "lostReports", row.userId, "reports", row.id);
      await updateDoc(ref, { status: newStatus, updatedAt: new Date() });
    } catch (e) {
      console.error("Failed to update:", e);
    } finally {
      setSavingId(null);
    }
  };

  // 7️⃣ Delete report
  const deleteReport = async (row: FirestoreReport) => {
    if (!window.confirm(`Delete report for ${row.name}?`)) return;
    setDeletingId(row.id);
    try {
      const ref = doc(db, "lostReports", row.userId, "reports", row.id);
      await deleteDoc(ref);
    } catch (e) {
      console.error("Failed to delete:", e);
    } finally {
      setDeletingId(null);
    }
  };

  // 8️⃣ View details
  const handleView = async (report: FirestoreReport) => {
    setViewReport(report);
    setShowVolunteers(false);
    setNearbyVolunteers([]);
    await fetchReporterInfo(report.userId);
    if (report.latitude && report.longitude) {
      findNearbyVolunteers(report);
    }
  };

  // ---------------- UI ---------------- //
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Lost Person Reports</h1>

      <div className="overflow-x-auto rounded-xl border bg-white shadow">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 text-sm text-gray-700">
              <TableHead>Photo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Aadhaar</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Place Lost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {reports.map((r) => (
              <TableRow key={`${r.userId}-${r.id}`}>
                <TableCell>
                  {r.imageUrl ? (
                    <img
                      src={r.imageUrl}
                      alt={r.name}
                      className="w-20 h-20 rounded-lg object-contain border cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      onClick={() => setPreviewSrc(r.imageUrl!)}
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 border rounded flex items-center justify-center text-gray-400">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.aadhar}</TableCell>
                <TableCell>{r.contact}</TableCell>
                <TableCell>{r.placeLost}</TableCell>
                <TableCell>
                  <Select
                    value={r.status || "Pending"}
                    onValueChange={(v) => setStatus(r, v)}
                    disabled={savingId === r.id}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Review">In Review</SelectItem>
                      <SelectItem value="Found">Found</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{fmtDate(r.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => handleView(r)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    {r.latitude && r.longitude && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setViewReport(r);
                          findNearbyVolunteers(r);
                        }}
                        title="Find nearby volunteers"
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Volunteers
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteReport(r)}
                      disabled={deletingId === r.id}
                    >
                      {deletingId === r.id ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-1" />
                      )}
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* IMAGE PREVIEW */}
      <Dialog open={!!previewSrc} onOpenChange={() => setPreviewSrc(null)}>
        <DialogContent className="max-w-4xl bg-white">
          <DialogHeader>
            <DialogTitle>Photo Preview</DialogTitle>
          </DialogHeader>
          {previewSrc && (
            <div className="flex items-center justify-center bg-gray-50 rounded-lg p-4">
              <img 
                src={previewSrc} 
                alt="Preview" 
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-md" 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DETAILED VIEW */}
      <Dialog 
        open={!!viewReport} 
        onOpenChange={() => {
          setViewReport(null);
          setShowVolunteers(false);
          setNearbyVolunteers([]);
        }}
      >
        <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lost Person Details</DialogTitle>
          </DialogHeader>

          {viewReport && (
            <div className="space-y-6">
              {/* Lost Person Info */}
              <div className="flex gap-4">
                <div className="w-32 h-32 rounded-lg border bg-gray-50 flex items-center justify-center overflow-hidden">
                  {viewReport.imageUrl ? (
                    <img
                      src={viewReport.imageUrl}
                      alt="Lost Person"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">No Image</div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div className="text-gray-500">Name</div>
                  <div className="font-medium">{viewReport.name}</div>

                  <div className="text-gray-500">Aadhaar</div>
                  <div className="font-medium">{viewReport.aadhar}</div>

                  <div className="text-gray-500">Contact</div>
                  <div className="font-medium">{viewReport.contact}</div>

                  <div className="text-gray-500">Status</div>
                  <span className={`font-semibold border rounded px-2 py-0.5 ${statusClass(viewReport.status || "Pending")}`}>
                    {viewReport.status}
                  </span>
                </div>
              </div>

              {/* Location Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1 font-medium">Place Lost</div>
                  <div className="p-3 bg-gray-50 rounded border">{viewReport.placeLost}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1 font-medium">Address</div>
                  <div className="p-3 bg-gray-50 rounded border">{viewReport.address}</div>
                </div>
              </div>

              {/* Reporter Info */}
              {reporterInfo && (
                <div className="border-t pt-4 text-sm">
                  <div className="font-semibold text-gray-700 mb-2">Reported By</div>
                  <div className="grid grid-cols-2 gap-y-1">
                    <div className="text-gray-500">Name</div>
                    <div>{reporterInfo.name || "—"}</div>

                    <div className="text-gray-500">Email</div>
                    <div>{reporterInfo.email || "—"}</div>

                    <div className="text-gray-500">Phone</div>
                    <div>{reporterInfo.phone || "—"}</div>
                  </div>
                </div>
              )}

              {/* Location Coordinates */}
              {viewReport.latitude && viewReport.longitude && (
                <div className="border-t pt-4 text-sm">
                  <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Coordinates
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-500 text-xs">Latitude</div>
                      <div className="font-mono text-sm">{viewReport.latitude}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">Longitude</div>
                      <div className="font-mono text-sm">{viewReport.longitude}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nearby Volunteers Section */}
              {viewReport.latitude && viewReport.longitude && (
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-700">
                        Nearby Volunteers (within 5km)
                      </h3>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => findNearbyVolunteers(viewReport)}
                    >
                      Refresh
                    </Button>
                  </div>

                  {showVolunteers && (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {nearbyVolunteers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                          No volunteers found within 5km radius of this location.
                        </div>
                      ) : (
                        nearbyVolunteers.map((vol) => {
                          const distance = haversine(
                            viewReport.latitude!,
                            viewReport.longitude!,
                            vol.latitude!,
                            vol.longitude!
                          );
                          return (
                            <div
                              key={vol.uid}
                              className="p-3 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">
                                    {vol.name || "Unknown Volunteer"}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {vol.email && <div>Email: {vol.email}</div>}
                                    {vol.phone && <div>Phone: {vol.phone}</div>}
                                    <div className="text-blue-600 font-medium mt-1">
                                      Distance: {distance.toFixed(2)} km
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => sendAlertToVolunteer(viewReport, vol)}
                                  disabled={sendingAlert === vol.uid}
                                  className="ml-4"
                                >
                                  {sendingAlert === vol.uid ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4 mr-1" />
                                      Send Alert
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {!showVolunteers && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => findNearbyVolunteers(viewReport)}
                      className="w-full"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Find Nearby Volunteers
                    </Button>
                  )}
                </div>
              )}

              {!viewReport.latitude || !viewReport.longitude ? (
                <div className="border-t pt-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                    <strong>Note:</strong> Location coordinates are missing. Please update the report with latitude and longitude to find nearby volunteers.
                  </div>
                </div>
              ) : null}

              {/* Time Info */}
              <div className="border-t pt-4 text-xs text-gray-500">
                Created: {fmtDate(viewReport.createdAt)}  
                <br />
                Updated: {fmtDate(viewReport.updatedAt)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LostpersonAdmin;
