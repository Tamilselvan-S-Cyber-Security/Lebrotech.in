/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { navForRole } from "@/lib/roles";
import api, { formatApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import StatusBadge from "@/components/StatusBadge";
import { IconSend as Send, IconMessageSquare as MessageSquare, IconArrowLeft as ArrowLeft } from "@/components/icons/AppIcons";
import { toast } from "sonner";

const POLL_MS = 5000;

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default function Messages() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const initialAppId = params.get("application_id");
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(initialAppId);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const lastTimestampRef = useRef(null);

  const nav = navForRole(user?.role);

  const loadThreads = useCallback(async () => {
    try {
      const { data } = await api.get("/messages/threads");
      setThreads(data);
    } catch { /* silent */ }
  }, []);

  const loadMessages = useCallback(async (appId, sinceISO = null) => {
    if (!appId) return;
    try {
      const url = sinceISO ? `/messages/${appId}?since=${encodeURIComponent(sinceISO)}` : `/messages/${appId}`;
      const { data } = await api.get(url);
      if (sinceISO) {
        if (data.length === 0) return;
        setMessages((prev) => [...prev, ...data]);
      } else {
        setMessages(data);
      }
      if (data.length > 0) {
        lastTimestampRef.current = data[data.length - 1].created_at;
      }
      // mark read
      await api.post(`/messages/${appId}/read`).catch(() => {});
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadThreads(); }, [loadThreads]);

  // When selection changes, reset + load full history
  useEffect(() => {
    if (!selected) return;
    setMessages([]);
    lastTimestampRef.current = null;
    loadMessages(selected, null);
    // update URL param
    setParams((sp) => {
      sp.set("application_id", selected);
      return sp;
    }, { replace: true });
  }, [selected, loadMessages, setParams]);

  // Polling for new messages on the active thread + thread list refresh
  useEffect(() => {
    if (!selected) return;
    const iv = setInterval(() => {
      loadMessages(selected, lastTimestampRef.current);
      loadThreads();
    }, POLL_MS);
    return () => clearInterval(iv);
  }, [selected, loadMessages, loadThreads]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const send = async (e) => {
    e?.preventDefault();
    if (!selected || !draft.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/messages/${selected}`, { body: draft.trim() });
      setMessages((m) => [...m, data]);
      lastTimestampRef.current = data.created_at;
      setDraft("");
      loadThreads();
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find((t) => t.application_id === selected);
  const peerName = user?.role === "startup" ? activeThread?.student_name : activeThread?.startup_name;

  return (
    <DashboardLayout nav={nav} title="Messages">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Thread list */}
        <div className={`rounded-2xl border border-slate-200 bg-white lg:col-span-4 ${selected ? "hidden lg:block" : ""}`} data-testid="threads-list">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-700">Conversations</h3>
          </div>
          {threads.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              <MessageSquare className="mx-auto mb-2 h-6 w-6 text-slate-600 dark:text-slate-400" />
              {user?.role === "startup" ? "Applications you receive will appear here." : "Apply to internships to start a conversation."}
            </div>
          ) : (
            <ul className="max-h-[600px] divide-y divide-slate-100 overflow-y-auto">
              {threads.map((t) => (
                <li key={t.application_id}>
                  <button
                    onClick={() => setSelected(t.application_id)}
                    data-testid={`thread-${t.application_id}`}
                    className={`block w-full px-4 py-3 text-left hover:bg-slate-50 ${selected === t.application_id ? "bg-rose-50" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-slate-900">
                        {user?.role === "startup" ? t.student_name : t.startup_name}
                      </span>
                      {t.unread_count > 0 ? (
                        <Badge className="bg-rose-600 text-[10px] text-white">{t.unread_count}</Badge>
                      ) : null}
                    </div>
                    <div className="truncate text-xs text-slate-500">{t.opportunity_title}</div>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={t.application_status} />
                      <span className="ml-auto text-[10px] text-slate-600 dark:text-slate-400">{fmtTime(t.last_message_at)}</span>
                    </div>
                    {t.last_message_body ? (
                      <div className="mt-1 line-clamp-1 text-xs text-slate-500">{t.last_message_body}</div>
                    ) : (
                      <div className="mt-1 text-[10px] italic text-slate-600 dark:text-slate-400">No messages yet — start the conversation</div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Active conversation */}
        <div className={`flex flex-col rounded-2xl border border-slate-200 bg-white lg:col-span-8 ${!selected ? "hidden lg:flex" : "flex"}`} data-testid="message-pane">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center p-12 text-center text-sm text-slate-500">
              <div>
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-600 dark:text-slate-400" />
                Select a conversation to start chatting.
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(null)} className="lg:hidden">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <div>
                    <div className="font-semibold text-slate-900">{peerName || "Conversation"}</div>
                    <div className="text-xs text-slate-500">{activeThread?.opportunity_title}</div>
                  </div>
                </div>
                {activeThread?.application_status ? <StatusBadge status={activeThread.application_status} /> : null}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" style={{ maxHeight: 560 }} data-testid="messages-list">
                {messages.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500">
                    No messages yet. Say hi 👋
                  </div>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender_role === user?.role;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`} data-testid={`message-${m.id}`}>
                        <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${mine ? "bg-[#D92D20] text-white" : "bg-slate-100 text-slate-900"}`}>
                          {!mine ? <div className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-70">{m.sender_name}</div> : null}
                          <div className="whitespace-pre-wrap break-words text-sm">{m.body}</div>
                          <div className={`mt-1 text-[10px] ${mine ? "text-rose-100" : "text-slate-600 dark:text-slate-400"}`}>{fmtTime(m.created_at)}</div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={send} className="border-t border-slate-200 p-3" data-testid="message-form">
                <div className="flex items-end gap-2">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                    }}
                    placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
                    rows={2}
                    className="flex-1 resize-none"
                    data-testid="message-input"
                  />
                  <Button type="submit" disabled={sending || !draft.trim()} className="bg-[#D92D20] hover:bg-[#B91C1C]" data-testid="message-send">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
