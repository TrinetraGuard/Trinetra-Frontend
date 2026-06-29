/**
 * AI Face Search Panel — Lost & Found AI component.
 *
 * Lets admins:
 *   1. Register a lost person with a photo into the AI backend
 *   2. Trigger on-demand face scan across all live cameras
 *   3. View face-match detections with similarity score + camera name
 */

import {
  Camera,
  Eye,
  Loader2,
  RefreshCw,
  ScanFace,
  Search,
  Trash2,
  Upload,
  User,
  UserCheck,
  UserX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  createLostPerson,
  deleteLostPerson,
  type FaceDetection,
  getLostPersons,
  type LostPerson,
  triggerFaceScan,
  updateLostPersonStatus,
  uploadLostPersonPhoto,
  type WsMessage,
  createAnalyticsWebSocket,
} from '@/lib/trinetraApi';

const statusColor: Record<string, string> = {
  missing: 'bg-orange-100 text-orange-800 border-orange-200',
  found: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-700 border-gray-200',
};

export function AiFaceSearch() {
  const [persons, setPersons] = useState<LostPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState<number | null>(null);
  const [newMatch, setNewMatch] = useState<{ person: string; camera: string } | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPersons = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLostPersons();
      setPersons(data);
    } catch {
      // backend may not be running — silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPersons();

    // Listen for real-time face match alerts
    const ws = createAnalyticsWebSocket((msg: WsMessage) => {
      if (msg.event === 'face_match') {
        const d = msg.data as { person_id: number; camera_name: string; similarity_score: number };
        setNewMatch({ person: `Person #${d.person_id}`, camera: d.camera_name });
        setTimeout(() => setNewMatch(null), 8000);
        void loadPersons(); // refresh list
      }
    });
    wsRef.current = ws;

    return () => ws.close();
  }, [loadPersons]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setFormError('Name is required');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const fd = new FormData();
      fd.append('name', formName.trim());
      if (formAge) fd.append('age', formAge);
      if (formGender) fd.append('gender', formGender);
      if (formDesc) fd.append('description', formDesc);
      if (formLocation) fd.append('last_seen_location', formLocation);
      if (formContact) fd.append('contact_phone', formContact);
      if (photoFile) fd.append('photo', photoFile);

      await createLostPerson(fd);
      setShowForm(false);
      resetForm();
      await loadPersons();
    } catch {
      setFormError('Failed to save. Is the AI backend running?');
    } finally {
      setSaving(false);
    }
  };

  const handleScan = async (personId: number) => {
    setScanning(personId);
    try {
      await triggerFaceScan(personId);
      await loadPersons();
    } catch {
      // ignore
    } finally {
      setScanning(null);
    }
  };

  const handleMarkFound = async (personId: number) => {
    try {
      await updateLostPersonStatus(personId, 'found');
      await loadPersons();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (personId: number) => {
    if (!window.confirm('Delete this record from the AI backend?')) return;
    try {
      await deleteLostPerson(personId);
      await loadPersons();
    } catch {
      // ignore
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormAge('');
    setFormGender('');
    setFormDesc('');
    setFormContact('');
    setFormLocation('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setFormError('');
  };

  const missingCount = persons.filter((p) => p.status === 'missing').length;
  const foundCount = persons.filter((p) => p.status === 'found').length;

  return (
    <div className="space-y-5">
      {/* Real-time match alert */}
      {newMatch && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow">
          <ScanFace className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>
            <strong>Face Match!</strong> {newMatch.person} spotted in{' '}
            <strong>{newMatch.camera}</strong>
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <ScanFace className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Face Search</h2>
            <p className="text-sm text-gray-500">
              YOLO + DeepFace real-time matching across live cameras
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => void loadPersons()}>
            <RefreshCw className="mr-1 h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowForm((s) => !s)}>
            {showForm ? 'Cancel' : <><Upload className="mr-1 h-3.5 w-3.5" /> Register Person</>}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Registered</p>
              <p className="text-xl font-bold">{persons.length}</p>
            </div>
            <User className="h-6 w-6 text-gray-400" />
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Missing</p>
              <p className="text-xl font-bold text-orange-600">{missingCount}</p>
            </div>
            <UserX className="h-6 w-6 text-orange-400" />
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Found</p>
              <p className="text-xl font-bold text-emerald-600">{foundCount}</p>
            </div>
            <UserCheck className="h-6 w-6 text-emerald-400" />
          </CardContent>
        </Card>
      </div>

      {/* Registration form */}
      {showForm && (
        <Card className="border-blue-200 bg-blue-50/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Register Missing Person</CardTitle>
            <CardDescription>
              Upload a clear face photo — AI will scan all live cameras automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="ai-name">Full name *</Label>
                <Input
                  id="ai-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>
              <div>
                <Label htmlFor="ai-age">Age</Label>
                <Input
                  id="ai-age"
                  type="number"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  placeholder="35"
                />
              </div>
              <div>
                <Label htmlFor="ai-gender">Gender</Label>
                <select
                  id="ai-gender"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value)}
                >
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div>
                <Label htmlFor="ai-contact">Contact number</Label>
                <Input
                  id="ai-contact"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="ai-location">Last seen location</Label>
                <Input
                  id="ai-location"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Gate 3, Main Temple"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="ai-desc">Description</Label>
                <Input
                  id="ai-desc"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Wearing orange kurta, carrying blue bag…"
                />
              </div>
            </div>

            {/* Photo upload */}
            <div>
              <Label>Face photo (required for AI scan)</Label>
              <div
                className="mt-1 flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-blue-300 bg-white p-4 hover:bg-blue-50"
                onClick={() => fileRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="h-24 w-24 rounded-full object-cover shadow" />
                ) : (
                  <Upload className="h-10 w-10 text-blue-400" />
                )}
                <p className="text-xs text-gray-500">Click to upload JPEG / PNG / WebP</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}

            <div className="flex gap-2">
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? 'Saving…' : 'Register & Start Scan'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Persons table */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : persons.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            <ScanFace className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            No AI records yet. Register a missing person to start face scanning.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">AI Missing Persons Registry</CardTitle>
            <CardDescription>Auto-scanned every 60 seconds against all live cameras</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-12">Photo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Detections</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {persons.map((p) => (
                    <TableRow key={p.id}>
                      {/* Photo */}
                      <TableCell>
                        {p.photo_url ? (
                          <img
                            src={`${import.meta.env.VITE_TRINETRA_API_URL ?? '/trinetra-api'}${p.photo_url}`}
                            alt={p.name}
                            className="h-10 w-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </TableCell>

                      {/* Name */}
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          {p.age && (
                            <p className="text-xs text-gray-400">
                              {p.age}y {p.gender ?? ''}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Details */}
                      <TableCell className="hidden sm:table-cell text-xs text-gray-500 max-w-[160px]">
                        <div className="truncate">{p.last_seen_location ?? '—'}</div>
                        <div className="truncate">{p.contact_phone ?? '—'}</div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge className={`border text-xs ${statusColor[p.status] ?? ''}`}>
                          {p.status}
                        </Badge>
                        {p.found_camera_id && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700">
                            <Camera className="h-3 w-3" />
                            {p.found_camera_id}
                          </div>
                        )}
                      </TableCell>

                      {/* Detections */}
                      <TableCell className="hidden md:table-cell">
                        {p.detections.length === 0 ? (
                          <span className="text-xs text-gray-400">No matches yet</span>
                        ) : (
                          <div className="space-y-1">
                            {p.detections.slice(0, 2).map((d) => (
                              <div key={d.id} className="flex items-center gap-1.5 text-xs">
                                <Camera className="h-3 w-3 text-gray-400" />
                                <span className="text-gray-600">{d.camera_id}</span>
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] px-1">
                                  {(d.similarity_score * 100).toFixed(0)}% match
                                </Badge>
                              </div>
                            ))}
                            {p.detections.length > 2 && (
                              <p className="text-[10px] text-gray-400">
                                +{p.detections.length - 2} more
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {/* Trigger face scan */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            disabled={scanning === p.id || !p.photo_url}
                            title={p.photo_url ? 'Scan all cameras now' : 'Upload photo first'}
                            onClick={() => void handleScan(p.id)}
                          >
                            {scanning === p.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Search className="h-3 w-3" />
                            )}
                          </Button>

                          {/* Mark found */}
                          {p.status === 'missing' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs text-emerald-700 border-emerald-300"
                              onClick={() => void handleMarkFound(p.id)}
                              title="Mark as found"
                            >
                              <UserCheck className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Delete */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs text-red-600 border-red-200"
                            onClick={() => void handleDelete(p.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
