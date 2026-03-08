"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useSocket } from "@/app/context/SocketContext";
import {
  clearConversation,
  deleteConversation,
  getMessages,
  sendMessage,
  Message,
} from "@/lib/api/message";
import { getAuthToken } from "@/lib/cookies";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  ArrowLeft,
  Loader2,
  User,
  CheckCheck,
  Eraser,
  Trash2,
} from "lucide-react";
import { resolveMediaUrl } from "@/lib/utils";
import { toast } from "@/lib/toast";

interface Participant {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  role: string;
}

export default function ChatPage() {
  const { conversationId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocket();
  const activeConversationId = Array.isArray(conversationId)
    ? conversationId[0]
    : conversationId;
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Normalize both IDs to strings for safe comparison
  const isMyMessage = (senderId: string) => {
    return String(senderId) === String(user?._id);
  };

  const getParticipant = (senderId: string): Participant | undefined => {
    return participants.find((p) => String(p._id) === String(senderId));
  };

  const otherUser = participants.find(
    (p) => String(p._id) !== String(user?._id),
  );

  const fetchData = async () => {
    try {
      const token = await getAuthToken();
      if (!token || !activeConversationId) return;
      const response = await getMessages(token, activeConversationId);
      if (response.success) {
        setMessages(response.data?.messages ?? []);
        setParticipants(response.data?.participants ?? []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to load conversation.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeConversationId) fetchData();
  }, [activeConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket || !activeConversationId) return;
    socket.emit("joinConversation", activeConversationId);

    const handleNewMessage = (message: any) => {
      if (String(message.conversationId) === String(activeConversationId)) {
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleConversationCleared = (payload: any) => {
      if (String(payload?.conversationId) !== String(activeConversationId)) {
        return;
      }

      setMessages([]);
      if (String(payload?.clearedBy) !== String(user?._id)) {
        toast.info("Conversation was cleared.");
      }
    };

    const handleConversationDeleted = (payload: any) => {
      if (String(payload?.conversationId) !== String(activeConversationId)) {
        return;
      }

      if (String(payload?.deletedBy) !== String(user?._id)) {
        toast.info("Conversation was deleted.");
      }
      router.push("/messages");
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("conversationCleared", handleConversationCleared);
    socket.on("conversationDeleted", handleConversationDeleted);
    return () => {
      socket.emit("leaveConversation", activeConversationId);
      socket.off("newMessage", handleNewMessage);
      socket.off("conversationCleared", handleConversationCleared);
      socket.off("conversationDeleted", handleConversationDeleted);
    };
  }, [socket, activeConversationId, user?._id, router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;
    setSending(true);
    try {
      const token = await getAuthToken();
      if (!token || !activeConversationId) return;
      const response = await sendMessage(token, {
        conversationId: activeConversationId,
        content: content.trim(),
      });
      if (response.success) {
        setContent("");
      }
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleClearConversation = async () => {
    if (!activeConversationId || clearing || deleting) return;

    if (
      typeof window !== "undefined" &&
      !window.confirm("Clear all messages in this conversation?")
    ) {
      return;
    }

    setClearing(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await clearConversation(token, activeConversationId);
      if (response?.success) {
        setMessages([]);
        toast.success(response?.message || "Conversation cleared.");
      } else {
        toast.error(response?.message || "Failed to clear conversation.");
      }
    } catch {
      toast.error("Failed to clear conversation.");
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!activeConversationId || clearing || deleting) return;

    if (
      typeof window !== "undefined" &&
      !window.confirm("Delete this conversation permanently?")
    ) {
      return;
    }

    setDeleting(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      const response = await deleteConversation(token, activeConversationId);
      if (response?.success) {
        toast.success(response?.message || "Conversation deleted.");
        router.push("/messages");
      } else {
        toast.error(response?.message || "Failed to delete conversation.");
      }
    } catch {
      toast.error("Failed to delete conversation.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const Header = user?.role === "organizer" ? OrganizerHeader : MusicianHeader;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full pt-24 md:pt-8 pb-4 px-4 md:px-8 overflow-hidden">
        {/* Chat Header */}
        <div className="role-hero-shell mb-4 p-4">
          <div className="role-hero-content flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/messages")}
                className="p-2 hover:bg-secondary rounded-xl transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-2xl bg-secondary flex items-center justify-center border-2 border-background overflow-hidden">
                    {otherUser?.profilePicture ? (
                      <img
                        src={resolveMediaUrl(otherUser.profilePicture)}
                        alt={otherUser.username}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={24} className="text-muted-foreground" />
                    )}
                  </div>
                  <span
                    className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background"
                    style={{ backgroundColor: "var(--spotlight)" }}
                  />
                </div>
                <div>
                  <p className="text-[10px] text-primary font-semibold uppercase tracking-wide mb-1">
                    Conversation
                  </p>
                  <h2 className="font-black text-foreground">
                    {otherUser?.username || "Loading..."}
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest capitalize">
                    {otherUser?.role ?? "user"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearConversation}
                disabled={clearing || deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-60"
              >
                {clearing ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Eraser size={14} />
                )}
                Clear
              </button>

              <button
                type="button"
                onClick={handleDeleteConversation}
                disabled={clearing || deleting}
                className="inline-flex items-center gap-2 rounded-xl border border-red-300/50 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-500/20 transition-colors disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-3 scrollbar-hide">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <div className="text-center py-16 text-muted-foreground font-medium">
                <User size={40} className="mx-auto mb-3 opacity-20" />
                <p>Send your first message!</p>
              </div>
            )}
            {messages.map((msg, idx) => {
              const mine = isMyMessage(msg.senderId);
              const sender = getParticipant(msg.senderId);
              const isFirst =
                idx === 0 ||
                String(messages[idx - 1].senderId) !== String(msg.senderId);
              const showAvatar =
                !mine &&
                (idx === messages.length - 1 ||
                  String(messages[idx + 1]?.senderId) !== String(msg.senderId));

              return (
                <motion.div
                  key={msg._id || idx}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                >
                  {/* Avatar for the other user */}
                  {!mine && (
                    <div className="w-8 h-8 rounded-xl flex-shrink-0 overflow-hidden bg-secondary flex items-center justify-center mb-0.5">
                      {showAvatar ? (
                        sender?.profilePicture ? (
                          <img
                            src={resolveMediaUrl(sender.profilePicture)}
                            alt={sender.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={16} className="text-muted-foreground" />
                        )
                      ) : null}
                    </div>
                  )}

                  <div
                    className={`max-w-[72%] flex flex-col ${mine ? "items-end" : "items-start"}`}
                  >
                    {/* Sender name (only show at first message in a group) */}
                    {!mine && isFirst && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1 ml-1">
                        {sender?.username ?? "Unknown"}
                      </span>
                    )}

                    <div
                      className={`px-4 py-3 shadow-sm ${
                        mine
                          ? "bg-primary text-primary-foreground rounded-[1.5rem] rounded-br-sm"
                          : "bg-card border border-border/60 text-foreground rounded-[1.5rem] rounded-bl-sm"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>

                    {/* Timestamp + read receipt (last message from me) */}
                    {mine && idx === messages.length - 1 && (
                      <div className="flex items-center gap-1 mt-1 mr-1">
                        <span className="text-[9px] text-muted-foreground/50 font-bold">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <CheckCheck size={12} className="text-primary" />
                      </div>
                    )}
                    {!mine && (
                      <span className="text-[9px] text-muted-foreground/40 font-bold mt-1 ml-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  {/* Spacer on other side for my messages */}
                  {mine && <div className="w-8 flex-shrink-0" />}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="mt-2 relative">
          <input
            type="text"
            placeholder={`Message ${otherUser?.username ?? "..."}`}
            className="w-full pl-6 pr-16 py-5 rounded-[2rem] bg-card border border-border/60 outline-none focus:ring-4 focus:ring-primary/10 transition-all font-medium shadow-lg"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-primary text-primary-foreground rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-100"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
