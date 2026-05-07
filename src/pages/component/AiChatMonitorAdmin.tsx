import {useEffect, useMemo, useState} from "react";
import {Timestamp, collection, limit, onSnapshot, orderBy, query} from "firebase/firestore";

import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardDescription, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {db} from "@/firebase/firebase";

type MessageRole = "user" | "assistant" | "system";

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

function toDateLabel(ts?: Timestamp): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString();
}

function toRelativeTime(ts?: Timestamp): string {
  if (!ts) return "No activity";
  const now = Date.now();
  const diffMs = now - ts.toDate().getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function userInitials(name: string, fallback: string): string {
  const clean = name.trim();
  if (clean) {
    const parts = clean.split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
  }
  return fallback.slice(0, 2).toUpperCase();
}

function normalizeMessage(raw: unknown): ChatMessage | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const roleRaw = String(data.role ?? "").trim().toLowerCase();
  const role: MessageRole = roleRaw === "assistant" || roleRaw === "system" ? roleRaw : "user";
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
  const messages = messagesRaw.map(normalizeMessage).filter((msg): msg is ChatMessage => !!msg);

  return {
    id,
    userId: String(raw.userId ?? ""),
    title: String(raw.title ?? "Untitled Chat"),
    lastMessage: String(raw.lastMessage ?? ""),
    messageCount: Number(raw.messageCount ?? messages.length ?? 0),
    userMessageCount: Number(raw.userMessageCount ?? messages.filter((m) => m.role === "user").length),
    aiMessageCount: Number(raw.aiMessageCount ?? messages.filter((m) => m.role === "assistant").length),
    updatedAt: raw.updatedAt as Timestamp | undefined,
    createdAt: raw.createdAt as Timestamp | undefined,
    messages,
  };
}

const AiChatMonitorAdmin = () => {
  const [chats, setChats] = useState<ChatRecord[]>([]);
  const [users, setUsers] = useState<Record<string, UserSummary>>({});
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    const chatsQuery = query(collection(db, "chats"), orderBy("updatedAt", "desc"), limit(300));
    const unsubscribe = onSnapshot(
      chatsQuery,
      (snapshot) => {
        setChats(snapshot.docs.map((doc) => normalizeChat(doc.id, doc.data() as Record<string, unknown>)));
        setIsLoadingChats(false);
      },
      () => setIsLoadingChats(false),
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
      () => setIsLoadingUsers(false),
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
        const totalMessagesForUser = userChats.reduce((sum, chat) => sum + chat.messageCount, 0);
        return {
          userId,
          name: user?.name || "Unknown User",
          email: user?.email || "",
          chats: userChats.sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0)),
          totalMessages: totalMessagesForUser,
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
    return usersWithChats.filter((entry) => {
      const haystack = [entry.name, entry.email, entry.userId].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [userSearchQuery, usersWithChats]);

  const selectedUser = useMemo(
    () => filteredUsers.find((entry) => entry.userId === selectedUserId) ?? null,
    [filteredUsers, selectedUserId],
  );

  const visibleChats = useMemo(() => {
    if (!selectedUser) return [];
    const q = chatSearchQuery.trim().toLowerCase();
    if (!q) return selectedUser.chats;
    return selectedUser.chats.filter((chat) =>
      [chat.title, chat.lastMessage, chat.id].join(" ").toLowerCase().includes(q),
    );
  }, [chatSearchQuery, selectedUser]);

  const selectedChat = useMemo(
    () => visibleChats.find((chat) => chat.id === selectedChatId) ?? null,
    [visibleChats, selectedChatId],
  );

  useEffect(() => {
    if (!selectedUserId) return;
    const userStillVisible = filteredUsers.some((entry) => entry.userId === selectedUserId);
    if (!userStillVisible) {
      setSelectedUserId(null);
      setSelectedChatId(null);
    }
  }, [filteredUsers, selectedUserId]);

  useEffect(() => {
    if (!selectedChatId) return;
    const chatStillVisible = visibleChats.some((chat) => chat.id === selectedChatId);
    if (!chatStillVisible) {
      setSelectedChatId(null);
    }
  }, [selectedChatId, visibleChats]);

  const totalMessages = useMemo(
    () => chats.reduce((count, chat) => count + chat.messageCount, 0),
    [chats],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Chat Monitor</h1>
          <p className="text-sm text-gray-500">Select user, open chat, and review messages in one organized screen.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Users: {usersWithChats.length}
          </Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Chats: {chats.length}
          </Badge>
          <Badge variant="secondary" className="bg-gray-100 text-gray-700">
            Messages: {totalMessages}
          </Badge>
        </div>
      </div>

      <Card className="overflow-hidden border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="grid min-h-[700px] grid-cols-1 xl:grid-cols-12">
            <section className="border-b bg-white xl:col-span-3 xl:border-b-0 xl:border-r">
              <div className="border-b px-4 py-3">
                <CardTitle className="text-base">Users</CardTitle>
                <CardDescription>Select a user to load their chats.</CardDescription>
              </div>
              <div className="space-y-3 p-4">
                <Input
                  value={userSearchQuery}
                  onChange={(event) => setUserSearchQuery(event.target.value)}
                  placeholder="Search users..."
                  className="h-10"
                />

                <div className="max-h-[580px] space-y-2 overflow-y-auto pr-1">
                  {(isLoadingChats || isLoadingUsers) && <p className="text-sm text-gray-500">Loading users...</p>}

                  {!isLoadingChats && filteredUsers.length === 0 && (
                    <p className="text-sm text-gray-500">No users found for this query.</p>
                  )}

                  {filteredUsers.map((entry) => {
                    const selected = selectedUser?.userId === entry.userId;
                    return (
                      <button
                        key={entry.userId}
                        onClick={() => {
                          setSelectedUserId(entry.userId);
                          setSelectedChatId(null);
                        }}
                        className={`w-full rounded-md border p-3 text-left transition ${
                          selected
                            ? "border-gray-900 bg-gray-50 shadow-sm ring-1 ring-gray-200"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
                              {userInitials(entry.name, entry.userId)}
                            </div>
                            <p className="truncate text-sm font-semibold">{entry.name}</p>
                          </div>
                          <Badge variant="secondary">{entry.chats.length}</Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-500">{entry.email || entry.userId}</p>
                        <p className="mt-2 text-[11px] text-gray-400">Last active: {toRelativeTime(entry.chats[0]?.updatedAt)}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="border-b bg-white xl:col-span-4 xl:border-b-0 xl:border-r">
              <div className="border-b px-4 py-3">
                <CardTitle className="text-base">{selectedUser ? `${selectedUser.name}'s Chats` : "Chats"}</CardTitle>
                <CardDescription>{selectedUser ? "Select chat to open messages." : "Choose a user first."}</CardDescription>
              </div>
              <div className="space-y-3 p-4">
                <Input
                  value={chatSearchQuery}
                  onChange={(event) => setChatSearchQuery(event.target.value)}
                  placeholder="Search chats..."
                  className="h-10"
                  disabled={!selectedUser}
                />

                <div className="max-h-[580px] space-y-2 overflow-y-auto pr-1">
                  {!selectedUser && <p className="text-sm text-gray-500">Select a user to load chats.</p>}
                  {selectedUser && visibleChats.length === 0 && (
                    <p className="text-sm text-gray-500">No chats found for this user.</p>
                  )}

                  {selectedUser &&
                    visibleChats.map((chat) => {
                      const selected = selectedChat?.id === chat.id;
                      return (
                        <button
                          key={chat.id}
                          onClick={() => setSelectedChatId(chat.id)}
                          className={`w-full rounded-md border p-3 text-left transition ${
                            selected
                              ? "border-gray-900 bg-gray-50 shadow-sm ring-1 ring-gray-200"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold">{chat.title || "Untitled Chat"}</p>
                            <Badge variant="secondary">{chat.messageCount}</Badge>
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs text-gray-600">{chat.lastMessage || "No preview available"}</p>
                          <p className="mt-2 text-[11px] text-gray-400">Updated: {toDateLabel(chat.updatedAt)}</p>
                        </button>
                      );
                    })}
                </div>
              </div>
            </section>

            <section className="bg-gray-50 xl:col-span-5">
              <div className="border-b bg-white px-4 py-3">
                <CardTitle className="text-base">{selectedChat?.title || "Conversation Viewer"}</CardTitle>
                <CardDescription>
                  {selectedChat ? "User and Netra Chat messages." : "Select a chat to open conversation."}
                </CardDescription>
              </div>

              <div className="space-y-4 p-4">
                {!selectedUser && <p className="text-sm text-gray-500">Select a user first.</p>}
                {selectedUser && !selectedChat && <p className="text-sm text-gray-500">Now select a chat to view messages.</p>}

                {selectedChat && (
                  <>
                    <div className="grid grid-cols-1 gap-3 rounded-md border bg-white p-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-gray-500">Name of User</p>
                        <p className="text-sm font-semibold">{selectedUser?.name || selectedChat.userId || "Unknown User"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium">{selectedUser?.email || "—"}</p>
                      </div>
                    </div>

                    <div className="max-h-[560px] space-y-3 overflow-y-auto rounded-md border bg-white p-3">
                      {selectedChat.messages.length === 0 && (
                        <p className="text-sm text-gray-500">No message content found in this chat.</p>
                      )}

                      {selectedChat.messages.map((message, index) => {
                        const isUser = message.role === "user";
                        const isAssistant = message.role === "assistant";
                        return (
                          <div key={`${selectedChat.id}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`w-full max-w-[92%] rounded-xl px-3 py-2 shadow-sm ${
                                isUser
                                  ? "border border-blue-100 bg-blue-50"
                                  : isAssistant
                                    ? "border border-emerald-100 bg-emerald-50"
                                    : "border bg-white"
                              }`}
                            >
                              <div className="mb-1 flex items-center justify-between gap-2">
                                <Badge variant={isUser ? "default" : "secondary"}>
                                  {isUser ? selectedUser?.name || "User" : isAssistant ? "Netra Chat" : "System"}
                                </Badge>
                                <span className="text-[11px] text-gray-400">
                                  {message.timestamp ? new Date(message.timestamp).toLocaleString() : ""}
                                </span>
                              </div>
                              <p className="whitespace-pre-wrap break-words text-sm text-gray-800">{message.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiChatMonitorAdmin;
