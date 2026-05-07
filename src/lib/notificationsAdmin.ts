import {getFunctions, httpsCallable} from "firebase/functions";
import {Timestamp} from "firebase/firestore";

export type TargetAudience = "all" | "users" | "group";
export type NotificationStatus = "sent" | "scheduled" | "processing" | "failed" | "draft";
export type DeliveryMode = "tokens" | "topic";

export interface NotificationDeliveryStats {
  totalTargets: number;
  totalTokens: number;
  successCount: number;
  failureCount: number;
  invalidTokenCount: number;
  retriedTokenCount: number;
  deliveryMode: DeliveryMode;
  topic?: string;
  topicMessageId?: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  targetAudience: TargetAudience;
  targetUserIds?: string[];
  targetGroupId?: string;
  status: NotificationStatus;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  scheduledAt?: Timestamp;
  sentAt?: Timestamp;
  errorMessage?: string;
  createdBy?: string;
  deliveryMode?: DeliveryMode;
  topic?: string;
  deliveryStats?: NotificationDeliveryStats;
}

export interface NotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
  targetAudience: TargetAudience;
  targetUserIds?: string[];
  targetGroupId?: string;
  type?: string;
  deliveryMode?: DeliveryMode;
  topic?: string;
}

export interface ScheduledNotificationPayload extends NotificationPayload {
  scheduledAt: string;
  notificationId?: string;
}

const functions = getFunctions();

const sendInstantCallable = httpsCallable<NotificationPayload, {notificationId: string; status: string}>(
  functions,
  "sendInstantNotification",
);

const upsertScheduledCallable = httpsCallable<ScheduledNotificationPayload, {notificationId: string; status: string}>(
  functions,
  "upsertScheduledNotification",
);

const deleteScheduledCallable = httpsCallable<{notificationId: string}, {ok: boolean}>(
  functions,
  "deleteScheduledNotification",
);

export async function sendInstantNotification(payload: NotificationPayload): Promise<{notificationId: string; status: string}> {
  const response = await sendInstantCallable(payload);
  return response.data;
}

export async function upsertScheduledNotification(
  payload: ScheduledNotificationPayload,
): Promise<{notificationId: string; status: string}> {
  const response = await upsertScheduledCallable(payload);
  return response.data;
}

export async function deleteScheduledNotification(notificationId: string): Promise<void> {
  await deleteScheduledCallable({notificationId});
}
