import {
  ArrowLeft,
  Bot,
  ChevronRight,
  MessageSquare,
  MessagesSquare,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Timestamp, collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { db } from "@/firebase/firebase";
import { admin } from "@/lib/adminTheme";

type MessageRole = "user" | "assistant" | "system";
type MonitorStep = "users" | "chats" | "messages";

interface ChatMessage {
  role: MessageRole;
  text: string;
  timestamp?: string;
}

interface ChatRecord {
  id: string;
  userId: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  userMessageCount: number;
  aiMessageCount: number;
  updatedAt?: Timestamp;
  createdAt?: Timestamp;
  messages: ChatMessage[];
}

interface UserSummary {
  id: string;
  name: string;
  email: string;
}

interface UserWithChats {
  userId: string;
  name: string;
  email: string;
  chats: ChatRecord[];
  totalMessages: number;
}

const STEPS: { key: MonitorStep; label: string }[] = [
  { key: "users", label: "Users" },
  { key: "chats", label: "Chats" },
  { key: "messages", label: "Messages" },
];

function toDateLabel(ts?: Timestamp): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString();
}

function toRelativeTime(ts?: Timestamp): string {
  if (!ts) return "No activity";
  const diffMs = Date.now() - ts.toDate().getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function userInitials(name: string, fallback: string): string {
  const clean = name.trim();
  if (clean) {
    return clean
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }
  return fallback.slice(0, 2).toUpperCase();
}

function normalizeMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const roleRaw = String(data.role ?? "").trim().toLowerCase();
  const role: MessageRole =
    roleRaw === "assistant" || roleRaw === "system" ? roleRaw : "user";
  const text = String(data.text ?? "").trim();
  if (!text) return null;
  return {
    role,
    text,
    timestamp: typeof data.timestamp === "string" ? data.timestamp : undefined,
  };
}

function normalizeChat(id: string, raw: Record<string, unknown>): ChatRecord {
  const messagesRaw = Array.isArray(raw.messages) ? raw.messages : [];
  const messages = messagesRaw
    .map(normalizeMessage)
    .filter((msg): msg is ChatMessage => !!msg);

  return {
    id,
    userId: String(raw.userId ?? ""),
    title: String(raw.title ?? "Untitled Chat"),
    lastMessage: String(raw.lastMessage ?? ""),
    messageCount: Number(raw.messageCount ?? messages.length ?? 0),
    userMessageCount: Number(
      raw.userMessageCount ?? messages.filter((m) => m.role === "user").length
    ),
    aiMessageCount: Number(
      raw.aiMessageCount ?? messages.filter((m) => m.role === "assistant").length
    ),
    updatedAt: raw.updatedAt as Timestamp | undefined,
    createdAt: raw.createdAt as Timestamp | undefined,
    messages,
  };
}

function EmptyPanel({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-base font-semibold text-gray-700">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-gray-500">{description}</p>
    </div>
  );
}

function UserAvatar({
  name,
  fallback,
  size = "md",
}: {
  name: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "lg"
      ? "h-12 w-12 text-sm"
      : size === "sm"
        ? "h-8 w-8 text-[10px]"
        : "h-10 w-10 text-xs";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-600 font-semibold text-white ${sizeClass}`}
    >
      {userInitials(name, fallback)}
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: MonitorStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-2 border-b bg-gray-50 px-4 py-3">
      {STEPS.map((step, index) => {
        const isActive = step.key === currentStep;
        const isComplete = index < currentIndex;
        return (
          <div key={step.key} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4 text-gray-300" />}
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                isActive
                  ? "bg-gray-900 text-white"
                  : isComplete
                    ? "bg-gray-200 text-gray-800"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold">
                {index + 1}
              </span>
              {step.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const AiChatMonitorAdmin = () => {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [users, setUsers] = useState<Record<string, UserSummary>>({});
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [step, setStep] = useState<MonitorStep>("users");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    const chatsQuery = query(collection(db, "chats"), orderBy("updatedAt", "desc"), limit(300));
    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        setChats(
          snapshot.docs.map((doc) => normalizeChat(doc.id, doc.data() as Record<string, unknown>))
        );
        setIsLoadingChats(false);
      },
      () => setIsLoadingChats(false)
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const usersQuery = query(collection(db, "users"), limit(3000));
    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const next: Record<string, UserSummary> = {};
        snapshot.docs.forEach((doc) => {
          const data = doc.data() as Record<string, unknown>;
          next[doc.id] = {
            id: doc.id,
            name: String(data.name ?? "").trim(),
            email: String(data.email ?? "").trim(),
          };
        });
        setUsers(next);
        setIsLoadingUsers(false);
      },
      () => setIsLoadingUsers(false)
    );
    return unsubscribe;
  }, []);

  const usersWithChats = useMemo<UserWithChats[]>(() => {
    const grouped = new Map<string, ChatRecord[]>();
    chats.forEach((chat) => {
      const key = chat.userId || "unknown";
      const list = grouped.get(key) ?? [];
      list.push(chat);
      grouped.set(key, list);
    });

    return Array.from(grouped.entries())
      .map(([userId, userChats]) => {
        const user = users[userId];
        return {
          userId,
          name: user?.name || "Unknown User",
          email: user?.email || "",
          chats: userChats.sort(
            (a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0)
          ),
          totalMessages: userChats.reduce((sum, chat) => sum + chat.messageCount, 0),
        };
      })
      .sort((a, b) => {
        const latestA = a.chats[0]?.updatedAt?.toMillis() ?? 0;
        const latestB = b.chats[0]?.updatedAt?.toMillis() ?? 0;
        return latestB - latestA;
      });
  }, [chats, users]);

  const filteredUsers = useMemo(() => {
    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return usersWithChats;
    return usersWithChats.filter((entry) =>
      [entry.name, entry.email, entry.userId].join(" ").toLowerCase().includes(q)
    );
  }, [userSearchQuery, usersWithChats]);

  const selectedUser = useMemo(
    () => usersWithChats.find((entry) => entry.userId === selectedUserId) ?? null,
    [usersWithChats, selectedUserId]
  );

  const visibleChats = useMemo(() => {
    if (!selectedUser) return [];
    const q = chatSearchQuery.trim().toLowerCase();
    if (!q) return selectedUser.chats;
    return selectedUser.chats.filter((chat) =>
      [chat.title, chat.lastMessage, chat.id].join(" ").toLowerCase().includes(q)
    );
  }, [chatSearchQuery, selectedUser]);

  const selectedChat = useMemo(
    () => visibleChats.find((chat) => chat.id === selectedChatId) ?? null,
    [visibleChats, selectedChatId]
  );

  useEffect(() => {
    if (!selectedUserId) return;
    if (!filteredUsers.some((entry) => entry.userId === selectedUserId)) {
      setSelectedUserId(null);
      setSelectedChatId(null);
      setStep("users");
    }
  }, [filteredUsers, selectedUserId]);

  useEffect(() => {
    if (!selectedChatId) return;
    if (!visibleChats.some((chat) => chat.id === selectedChatId)) {
      setSelectedChatId(null);
      setStep("chats");
    }
  }, [selectedChatId, visibleChats]);

  const totalMessages = useMemo(
    () => chats.reduce((count, chat) => count + chat.messageCount, 0),
    [chats]
  );

  const isLoading = isLoadingChats || isLoadingUsers;

  const selectUser = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedChatId(null);
    setChatSearchQuery("");
    setStep("chats");
  };

  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    setStep("messages");
  };

  const goBackToUsers = () => {
    setSelectedUserId(null);
    setSelectedChatId(null);
    setChatSearchQuery("");
    setStep("users");
  };

  const goBackToChats = () => {
    setSelectedChatId(null);
    setStep("chats");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className={admin.iconWrapSolid}>
              <MessagesSquare className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Chat Monitor</h1>
              <p className="mt-1 text-gray-500">
                Review Netra Chat conversations by user and session
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className={`px-3 py-1 ${admin.badge}`}>
            <Users className="mr-1.5 h-3.5 w-3.5" />
            {usersWithChats.length} users
          </Badge>
          <Badge variant="secondary" className={`px-3 py-1 ${admin.badge}`}>
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            {chats.length} chats
          </Badge>
          <Badge variant="secondary" className={`px-3 py-1 ${admin.badge}`}>
            {totalMessages} messages
          </Badge>
        </div>
      </div>

      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <StepIndicator currentStep={step} />

        <CardContent className="p-0">
          {/* Step 1 — Users (full width) */}
          {step === "users" && (
            <section className="min-h-[680px] bg-white">
              <div className={`border-b px-6 py-5 ${admin.cardHeader}`}>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-gray-700" />
                  <div>
                    <CardTitle className="text-lg">All Users</CardTitle>
                    <CardDescription>Select a user to view their Netra Chat sessions</CardDescription>
                  </div>
                </div>
              </div>

              <div className="mx-auto max-w-3xl space-y-4 p-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={userSearchQuery}
                    onChange={(event) => setUserSearchQuery(event.target.value)}
                    placeholder="Search by name, email, or ID..."
                    className="h-11 pl-9"
                  />
                </div>

                <div className="space-y-2">
                  {isLoading &&
                    [1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100" />
                    ))}

                  {!isLoading && filteredUsers.length === 0 && (
                    <EmptyPanel
                      icon={Users}
                      title="No users found"
                      description="Try a different search or wait for users to start chatting with Netra."
                    />
                  )}

                  {!isLoading &&
                    filteredUsers.map((entry) => (
                      <button
                        key={entry.userId}
                        type="button"
                        onClick={() => selectUser(entry.userId)}
                        className={`group w-full ${admin.listItem}`}
                      >
                        <div className="flex items-center gap-4">
                          <UserAvatar name={entry.name} fallback={entry.userId} size="lg" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className="truncate text-base font-semibold text-gray-900">
                                {entry.name}
                              </p>
                              <Badge variant="secondary" className={`shrink-0 ${admin.badge}`}>
                                {entry.chats.length} chat{entry.chats.length === 1 ? "" : "s"}
                              </Badge>
                            </div>
                            <p className="mt-0.5 truncate text-sm text-gray-500">
                              {entry.email || entry.userId}
                            </p>
                            <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                              <span>{entry.totalMessages} messages</span>
                              <span>·</span>
                              <span>Last active {toRelativeTime(entry.chats[0]?.updatedAt)}</span>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 shrink-0 text-gray-300 transition group-hover:text-gray-700" />
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </section>
          )}

          {/* Step 2 — Chats (full width, replaces users) */}
          {step === "chats" && selectedUser && (
            <section className="min-h-[680px] bg-white">
              <div className={`border-b px-6 py-5 ${admin.cardHeader}`}>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={goBackToUsers} className="shrink-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Users
                  </Button>
                  <UserAvatar name={selectedUser.name} fallback={selectedUser.userId} />
                  <div className="min-w-0">
                    <CardTitle className="truncate text-lg">{selectedUser.name}&apos;s Chats</CardTitle>
                    <CardDescription>
                      {selectedUser.email || selectedUser.userId} · {visibleChats.length} conversation
                      {visibleChats.length === 1 ? "" : "s"}
                    </CardDescription>
                  </div>
                </div>
              </div>

              <div className="mx-auto max-w-3xl space-y-4 p-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={chatSearchQuery}
                    onChange={(event) => setChatSearchQuery(event.target.value)}
                    placeholder="Search chats by title or message..."
                    className="h-11 pl-9"
                  />
                </div>

                <div className="space-y-2">
                  {visibleChats.length === 0 && (
                    <EmptyPanel
                      icon={MessageSquare}
                      title="No chats found"
                      description="This user has no matching conversations for your search."
                    />
                  )}

                  {visibleChats.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => selectChat(chat.id)}
                      className={`group w-full ${admin.listItem}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                          <MessageSquare className="h-6 w-6 text-gray-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="truncate text-base font-semibold text-gray-900">
                              {chat.title || "Untitled Chat"}
                            </p>
                            <Badge variant="secondary" className="shrink-0">
                              {chat.messageCount} msgs
                            </Badge>
                          </div>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                            {chat.lastMessage || "No preview available"}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                            <span>{toRelativeTime(chat.updatedAt)}</span>
                            <span>·</span>
                            <span>{chat.userMessageCount} user</span>
                            <span>·</span>
                            <span>{chat.aiMessageCount} Netra</span>
                          </div>
                        </div>
                        <ChevronRight className="mt-3 h-5 w-5 shrink-0 text-gray-300 transition group-hover:text-gray-700" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Step 3 — Messages (full width, replaces chats) */}
          {step === "messages" && selectedChat && selectedUser && (
            <section className="min-h-[680px] bg-gray-50">
              <div className="border-b bg-white px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={goBackToChats} className="shrink-0">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Chats
                    </Button>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-lg">{selectedChat.title}</CardTitle>
                      <CardDescription>
                        {selectedUser.name} · {selectedChat.messages.length} messages
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className={`w-fit shrink-0 ${admin.badge}`}>
                    <Bot className="mr-1.5 h-3.5 w-3.5" />
                    Netra Chat
                  </Badge>
                </div>
              </div>

              <div className="mx-auto max-w-4xl space-y-4 p-6">
                <div className="grid grid-cols-2 gap-3 rounded-xl border bg-white p-4 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">User</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Email</p>
                    <p className="mt-1 truncate text-sm text-gray-700">{selectedUser.email || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Started</p>
                    <p className="mt-1 text-sm text-gray-700">{toDateLabel(selectedChat.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Updated</p>
                    <p className="mt-1 text-sm text-gray-700">{toDateLabel(selectedChat.updatedAt)}</p>
                  </div>
                </div>

                <div className="rounded-xl border bg-white shadow-sm">
                  <div className="border-b px-4 py-3">
                    <p className="text-sm font-medium text-gray-700">Conversation</p>
                    <p className="text-xs text-gray-400">User messages and Netra Chat responses</p>
                  </div>

                  <div className="max-h-[520px] space-y-4 overflow-y-auto p-4">
                    {selectedChat.messages.length === 0 && (
                      <EmptyPanel
                        icon={MessageSquare}
                        title="No messages"
                        description="This chat session has no stored message content yet."
                      />
                    )}

                    {selectedChat.messages.map((message, index) => {
                      const isUser = message.role === "user";
                      const isAssistant = message.role === "assistant";

                      return (
                        <div
                          key={`${selectedChat.id}-${index}`}
                          className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                              isUser
                                ? "bg-gray-900 text-white"
                                : isAssistant
                                  ? "bg-gray-100 text-gray-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {isUser ? (
                              <UserRound className="h-4 w-4" />
                            ) : isAssistant ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <MessageSquare className="h-4 w-4" />
                            )}
                          </div>

                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
                              isUser
                                ? "rounded-tr-md bg-gray-900 text-white"
                                : isAssistant
                                  ? "rounded-tl-md border border-gray-200 bg-white text-gray-800"
                                  : "rounded-tl-md border bg-gray-50 text-gray-700"
                            }`}
                          >
                            <div
                              className={`mb-1.5 flex items-center justify-between gap-3 ${
                                isUser ? "text-gray-300" : "text-gray-500"
                              }`}
                            >
                              <span className="text-xs font-semibold">
                                {isUser
                                  ? selectedUser.name
                                  : isAssistant
                                    ? "Netra Chat"
                                    : "System"}
                              </span>
                              {message.timestamp && (
                                <span className="text-[10px] opacity-80">
                                  {new Date(message.timestamp).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                              {message.text}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AiChatMonitorAdmin;
