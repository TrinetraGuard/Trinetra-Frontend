import {useEffect, useMemo, useState} from "react";
import {collection, onSnapshot, orderBy, query, Timestamp} from "firebase/firestore";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";
import {db, storage} from "@/firebase/firebase";
import {
  deleteScheduledNotification,
  NotificationPayload,
  NotificationRecord,
  sendInstantNotification,
  TargetAudience,
  upsertScheduledNotification,
} from "@/lib/notificationsAdmin";

interface FormState {
  title: string;
  body: string;
  imageUrl: string;
  targetAudience: TargetAudience;
  targetUserIdsText: string;
  targetGroupId: string;
  type: string;
  deliveryMode: "tokens" | "topic";
  topic: string;
  scheduledAt: string;
}

const defaultFormState: FormState = {
  title: "",
  body: "",
  imageUrl: "",
  targetAudience: "all",
  targetUserIdsText: "",
  targetGroupId: "",
  type: "alert",
  deliveryMode: "tokens",
  topic: "trinetra_all_users",
  scheduledAt: "",
};

function toDateTimeInputValue(timestamp?: Timestamp): string {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toDisplayDate(ts?: Timestamp): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString();
}

function parseTargetUsers(value: string): string[] {
  return value
    .split(/[\n,]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mapDocToNotificationRecord(id: string, raw: Record<string, unknown>): NotificationRecord {
  return {
    id,
    title: String(raw.title ?? ""),
    body: String(raw.body ?? ""),
    imageUrl: raw.imageUrl ? String(raw.imageUrl) : undefined,
    targetAudience: (raw.targetAudience as TargetAudience) ?? "all",
    targetUserIds: Array.isArray(raw.targetUserIds) ? raw.targetUserIds.map((x) => String(x)) : undefined,
    targetGroupId: raw.targetGroupId ? String(raw.targetGroupId) : undefined,
    status: String(raw.status ?? "draft") as NotificationRecord["status"],
    createdAt: raw.createdAt as Timestamp | undefined,
    updatedAt: raw.updatedAt as Timestamp | undefined,
    sentAt: raw.sentAt as Timestamp | undefined,
    scheduledAt: raw.scheduledAt as Timestamp | undefined,
    errorMessage: raw.errorMessage ? String(raw.errorMessage) : undefined,
    createdBy: raw.createdBy ? String(raw.createdBy) : undefined,
    deliveryMode: raw.deliveryMode ? String(raw.deliveryMode) as NotificationRecord["deliveryMode"] : "tokens",
    topic: raw.topic ? String(raw.topic) : undefined,
    deliveryStats: raw.deliveryStats ? raw.deliveryStats as NotificationRecord["deliveryStats"] : undefined,
  };
}

const NotificationsAdmin = () => {
  const [form, setForm] = useState<FormState>(defaultFormState);
  const [allNotifications, setAllNotifications] = useState<NotificationRecord[]>([]);
  const [editingScheduledId, setEditingScheduledId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [feedback, setFeedback] = useState<{type: "success" | "error"; message: string} | null>(null);

  useEffect(() => {
    const q = query(collection(db, "notifications"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAllNotifications(
        snapshot.docs.map((doc) =>
          mapDocToNotificationRecord(doc.id, doc.data() as Record<string, unknown>),
        ),
      );
    });
    return unsubscribe;
  }, []);

  const scheduledNotifications = useMemo(
    () => allNotifications.filter((n) => n.status === "scheduled"),
    [allNotifications],
  );
  const sentNotifications = useMemo(
    () => allNotifications.filter((n) => n.status === "sent"),
    [allNotifications],
  );
  const deliverySummary = useMemo(() => {
    const withStats = sentNotifications
      .map((item) => item.deliveryStats)
      .filter((stats): stats is NonNullable<NotificationRecord["deliveryStats"]> => !!stats);

    const totalNotifications = withStats.length;
    const totals = withStats.reduce(
      (acc, stats) => {
        acc.targets += stats.totalTargets ?? 0;
        acc.tokens += stats.totalTokens ?? 0;
        acc.success += stats.successCount ?? 0;
        acc.failure += stats.failureCount ?? 0;
        acc.invalid += stats.invalidTokenCount ?? 0;
        acc.retries += stats.retriedTokenCount ?? 0;
        return acc;
      },
      {targets: 0, tokens: 0, success: 0, failure: 0, invalid: 0, retries: 0},
    );

    const attempts = totals.success + totals.failure;
    const successRate = attempts > 0 ? (totals.success / attempts) * 100 : 0;

    return {
      totalNotifications,
      ...totals,
      successRate,
    };
  }, [sentNotifications]);

  const resetForm = () => {
    setForm(defaultFormState);
    setEditingScheduledId(null);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({...prev, [key]: value}));
  };

  const buildPayload = (): NotificationPayload => {
    if (!form.title.trim()) throw new Error("Title is required.");
    if (!form.body.trim()) throw new Error("Message is required.");
    if (form.targetAudience === "users" && parseTargetUsers(form.targetUserIdsText).length === 0) {
      throw new Error("At least one target user ID is required for Users audience.");
    }
    if (form.targetAudience === "group" && !form.targetGroupId.trim()) {
      throw new Error("Group ID is required for Group audience.");
    }
    if (form.deliveryMode === "topic" && form.targetAudience !== "all") {
      throw new Error("Topic delivery currently supports only All Users audience.");
    }
    if (form.deliveryMode === "topic" && !form.topic.trim()) {
      throw new Error("Topic is required when delivery mode is Topic Broadcast.");
    }
    return {
      title: form.title.trim(),
      body: form.body.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      targetAudience: form.targetAudience,
      targetUserIds: form.targetAudience === "users" ? parseTargetUsers(form.targetUserIdsText) : undefined,
      targetGroupId: form.targetAudience === "group" ? form.targetGroupId.trim() : undefined,
      type: form.type.trim() || "alert",
      deliveryMode: form.deliveryMode,
      topic: form.deliveryMode === "topic" ? form.topic.trim() : undefined,
    };
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setFeedback(null);
    setIsUploadingImage(true);
    try {
      const imageRef = ref(storage, `notifications/${Date.now()}-${file.name}`);
      await uploadBytes(imageRef, file);
      const imageUrl = await getDownloadURL(imageRef);
      setField("imageUrl", imageUrl);
      setFeedback({type: "success", message: "Image uploaded successfully."});
    } catch (error) {
      console.error("Failed to upload image", error);
      setFeedback({type: "error", message: "Image upload failed. Please retry."});
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSendNow = async () => {
    setFeedback(null);
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const response = await sendInstantNotification(payload);
      setFeedback({
        type: "success",
        message: `Notification sent successfully (${response.notificationId}).`,
      });
      resetForm();
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to send notification.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSchedule = async () => {
    setFeedback(null);
    setIsSubmitting(true);
    try {
      if (!form.scheduledAt) {
        throw new Error("Please choose a schedule date and time.");
      }
      const payload = buildPayload();
      const response = await upsertScheduledNotification({
        ...payload,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        notificationId: editingScheduledId ?? undefined,
      });
      setFeedback({
        type: "success",
        message: editingScheduledId ?
          `Scheduled notification updated (${response.notificationId}).` :
          `Notification scheduled (${response.notificationId}).`,
      });
      resetForm();
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to schedule notification.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditScheduled = (record: NotificationRecord) => {
    setEditingScheduledId(record.id);
    setForm({
      title: record.title,
      body: record.body,
      imageUrl: record.imageUrl ?? "",
      targetAudience: record.targetAudience,
      targetUserIdsText: (record.targetUserIds ?? []).join(", "),
      targetGroupId: record.targetGroupId ?? "",
      type: "alert",
      deliveryMode: record.deliveryMode ?? "tokens",
      topic: record.topic ?? "trinetra_all_users",
      scheduledAt: toDateTimeInputValue(record.scheduledAt),
    });
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  const handleDeleteScheduled = async (notificationId: string) => {
    const confirmed = window.confirm("Delete this scheduled notification?");
    if (!confirmed) return;
    setFeedback(null);
    setIsSubmitting(true);
    try {
      await deleteScheduledNotification(notificationId);
      if (editingScheduledId === notificationId) {
        resetForm();
      }
      setFeedback({type: "success", message: "Scheduled notification deleted."});
    } catch (error) {
      console.error(error);
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to delete scheduled notification.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingScheduledId ? "Edit Scheduled Notification" : "Push Notification Dashboard"}</CardTitle>
          <CardDescription>
            Send instant push notifications, schedule future campaigns, and manage delivery from one panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback && (
            <div
              className={`rounded-md border px-3 py-2 text-sm ${
                feedback.type === "success" ?
                  "border-green-200 bg-green-50 text-green-800" :
                  "border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              placeholder="Festival traffic advisory"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={form.body}
              onChange={(event) => setField("body", event.target.value)}
              placeholder="Roads near Panchavati are temporarily closed."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="audience">Target Audience</Label>
              <select
                id="audience"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.targetAudience}
                onChange={(event) => setField("targetAudience", event.target.value as TargetAudience)}
              >
                <option value="all">All Users</option>
                <option value="users">Specific Users</option>
                <option value="group">User Group</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Payload Type</Label>
              <Input
                id="type"
                value={form.type}
                onChange={(event) => setField("type", event.target.value)}
                placeholder="alert"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="deliveryMode">Delivery Mode</Label>
              <select
                id="deliveryMode"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={form.deliveryMode}
                onChange={(event) => setField("deliveryMode", event.target.value as FormState["deliveryMode"])}
              >
                <option value="tokens">Direct Device Tokens</option>
                <option value="topic">FCM Topic Broadcast</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (required for topic mode)</Label>
              <Input
                id="topic"
                value={form.topic}
                onChange={(event) => setField("topic", event.target.value)}
                placeholder="trinetra_all_users"
                disabled={form.deliveryMode !== "topic"}
              />
            </div>
          </div>

          {form.targetAudience === "users" && (
            <div className="space-y-2">
              <Label htmlFor="targetUsers">Target User IDs</Label>
              <Textarea
                id="targetUsers"
                value={form.targetUserIdsText}
                onChange={(event) => setField("targetUserIdsText", event.target.value)}
                placeholder="uid_1, uid_2, uid_3"
                rows={3}
              />
              <p className="text-xs text-gray-500">Use comma or new line separated user IDs.</p>
            </div>
          )}

          {form.targetAudience === "group" && (
            <div className="space-y-2">
              <Label htmlFor="targetGroup">Target Group ID</Label>
              <Input
                id="targetGroup"
                value={form.targetGroupId}
                onChange={(event) => setField("targetGroupId", event.target.value)}
                placeholder="pilgrim-volunteers"
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="scheduleAt">Schedule (optional for send-now)</Label>
              <Input
                id="scheduleAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) => setField("scheduledAt", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL (optional)</Label>
              <Input
                id="imageUrl"
                value={form.imageUrl}
                onChange={(event) => setField("imageUrl", event.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUpload">Upload Image (optional)</Label>
            <Input
              id="imageUpload"
              type="file"
              accept="image/*"
              disabled={isUploadingImage}
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                void handleImageUpload(file);
              }}
            />
            {isUploadingImage && <p className="text-xs text-gray-500">Uploading image...</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button disabled={isSubmitting || isUploadingImage} onClick={handleSendNow}>
              Send Now
            </Button>
            <Button
              variant="secondary"
              disabled={isSubmitting || isUploadingImage}
              onClick={handleSchedule}
            >
              {editingScheduledId ? "Update Schedule" : "Schedule Notification"}
            </Button>
            {editingScheduledId && (
              <Button variant="outline" disabled={isSubmitting} onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Analytics</CardTitle>
          <CardDescription>
            Overall delivery health across sent notifications with recorded FCM stats.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border p-3">
            <p className="text-xs text-gray-500">Tracked Notifications</p>
            <p className="mt-1 text-xl font-semibold">{deliverySummary.totalNotifications}</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-gray-500">Success Rate</p>
            <p className="mt-1 text-xl font-semibold">{deliverySummary.successRate.toFixed(1)}%</p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-gray-500">Deliveries (ok / failed)</p>
            <p className="mt-1 text-xl font-semibold">
              {deliverySummary.success} / {deliverySummary.failure}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className="text-xs text-gray-500">Invalid Tokens / Retries</p>
            <p className="mt-1 text-xl font-semibold">
              {deliverySummary.invalid} / {deliverySummary.retries}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled Notifications</CardTitle>
            <CardDescription>Auto-sent by scheduler when due.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduledNotifications.length === 0 && (
              <p className="text-sm text-gray-500">No scheduled notifications.</p>
            )}
            {scheduledNotifications.map((record) => (
              <div key={record.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{record.title}</h3>
                  <Badge>{record.targetAudience}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-700">{record.body}</p>
                <p className="mt-2 text-xs text-gray-500">Scheduled: {toDisplayDate(record.scheduledAt)}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Mode: {record.deliveryMode ?? "tokens"}{record.topic ? ` • Topic: ${record.topic}` : ""}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditScheduled(record)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isSubmitting}
                    onClick={() => void handleDeleteScheduled(record.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sent Notifications</CardTitle>
            <CardDescription>Recent successfully delivered pushes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentNotifications.length === 0 && (
              <p className="text-sm text-gray-500">No sent notifications yet.</p>
            )}
            {sentNotifications.slice(0, 30).map((record) => (
              <div key={record.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{record.title}</h3>
                  <Badge variant="secondary">{record.targetAudience}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-700">{record.body}</p>
                <p className="mt-2 text-xs text-gray-500">Sent: {toDisplayDate(record.sentAt ?? record.updatedAt)}</p>
                {record.deliveryStats && (
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-gray-600 md:grid-cols-3">
                    <span>Targets: {record.deliveryStats.totalTargets}</span>
                    <span>Tokens: {record.deliveryStats.totalTokens}</span>
                    <span>Success: {record.deliveryStats.successCount}</span>
                    <span>Failures: {record.deliveryStats.failureCount}</span>
                    <span>Invalid: {record.deliveryStats.invalidTokenCount}</span>
                    <span>Retries: {record.deliveryStats.retriedTokenCount}</span>
                  </div>
                )}
                {(record.deliveryMode || record.topic) && (
                  <p className="mt-1 text-xs text-gray-500">
                    Mode: {record.deliveryMode ?? "tokens"}{record.topic ? ` • Topic: ${record.topic}` : ""}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsAdmin;
