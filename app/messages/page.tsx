"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useSocket } from "@/app/context/SocketContext";
import { getConversations, Conversation } from "@/lib/api/message";
import { getAuthToken } from "@/lib/cookies";
import MusicianHeader from "@/app/musician/_components/MusicianHeader";
import OrganizerHeader from "@/app/organizer/_components/OrganizerHeader";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Clock,
  ArrowRight,
  Loader2,
  User,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { resolveMediaUrl } from "@/lib/utils";

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchConversations = async () => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      const response = await getConversations(token);
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      // Refresh conversations list or update locally
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === message.conversationId);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            lastMessage: message.content,
            updatedAt: new Date().toISOString(),
          };
          // Move to top
          return [updated[index], ...updated.filter((_, i) => i !== index)];
        }
        return prev;
      });
    };

    const handleConversationCleared = (payload: any) => {
      const conversationId = String(payload?.conversationId || "");
      if (!conversationId) return;

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                lastMessage: "",
                updatedAt: new Date().toISOString(),
              }
            : conversation,
        ),
      );
    };

    const handleConversationDeleted = (payload: any) => {
      const conversationId = String(payload?.conversationId || "");
      if (!conversationId) return;

      setConversations((prev) =>
        prev.filter((conversation) => conversation._id !== conversationId),
      );
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("conversationCleared", handleConversationCleared);
    socket.on("conversationDeleted", handleConversationDeleted);
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("conversationCleared", handleConversationCleared);
      socket.off("conversationDeleted", handleConversationDeleted);
    };
  }, [socket]);

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipant = conv.participants.find(
      (p: any) => String(p._id) !== String(user?._id),
    );
    if (!searchTerm) return true;
    return otherParticipant?.username
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const Header = user?.role === "organizer" ? OrganizerHeader : MusicianHeader;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-5xl px-6 lg:px-8 pt-24 md:pt-8 pb-16">
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="role-hero-shell mb-8 p-6 md:p-8"
        >
          <div className="role-hero-content">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide mb-3 border border-primary/20">
              <Sparkles size={12} className="animate-pulse" />
              Messages Hub
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
              Messages
            </h1>
            <p className="mt-2 text-muted-foreground font-medium">
              Stay connected with your musical network.
            </p>
            <div className="mt-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              {filteredConversations.length} Conversation
              {filteredConversations.length === 1 ? "" : "s"}
            </div>
          </div>
        </motion.section>

        <div className="relative mb-8 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border/60 outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <AnimatePresence mode="popLayout">
          {filteredConversations.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredConversations.map((conv, index) => {
                const otherParticipant = conv.participants.find(
                  (p: any) => String(p._id) !== String(user?._id),
                );
                return (
                  <motion.div
                    key={conv._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    <Link
                      href={`/messages/${conv._id}`}
                      className="flex items-center justify-between p-6 rounded-3xl border border-border/60 bg-card hover:bg-muted/30 transition-all hover:shadow-lg group"
                    >
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center border-2 border-background shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                          {otherParticipant?.profilePicture ? (
                            <img
                              src={resolveMediaUrl(
                                otherParticipant.profilePicture,
                              )}
                              alt={otherParticipant.username}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User size={30} className="text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-foreground">
                            {otherParticipant?.username || "Unknown user"}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1 font-medium italic">
                            {conv.lastMessage || "No messages yet"}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 mt-2 font-bold uppercase tracking-widest">
                            <Clock size={12} />
                            {new Date(conv.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight size={20} />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20 text-center border-2 border-dashed border-border/60 rounded-[3rem] bg-secondary/5"
            >
              <MessageSquare
                size={48}
                className="mx-auto mb-4 text-muted-foreground/30"
              />
              <h2 className="text-xl font-bold">No conversations found</h2>
              <p className="text-muted-foreground font-medium mt-2">
                Start a conversation by viewing another user's profile.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
