/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  IconX, IconSettings, IconSearch, IconSend, IconTrash2, IconEye, IconDownload,
  IconShare2, IconUsers, IconMessageSquare, IconSun, IconCopy, IconPlus,
} from "@/components/icons/AppIcons";
import { chatbotConfig, chatbotHasLiveAi } from "@/lib/chatbotConfig";
import { getChatbotReply } from "@/lib/chatbotApi";

const STORAGE_KEY = "lerbo_internship_chatbot_v1";
const THEME_KEY = "lerbo_chatbot_theme";
const FONT_KEY = "lerbo_chatbot_font";
const ACCENT_KEY = "lerbo_chatbot_accent";

const ACCENT_OPTIONS = [
  { id: "blue", color: "#2563EB", label: "Blue" },
  { id: "red", color: "#D92D20", label: "Brand red" },
  { id: "teal", color: "#0D9488", label: "Teal" },
  { id: "violet", color: "#7C3AED", label: "Violet" },
];

const FONT_OPTIONS = [
  { id: "sm", label: "Small", size: "13px", line: "1.45" },
  { id: "md", label: "Medium", size: "15px", line: "1.55" },
  { id: "lg", label: "Large", size: "17px", line: "1.6" },
];

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveHistory(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-80)));
  } catch {
    /* ignore */
  }
}

function clearSavedHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function defaultMessages() {
  return [
    { id: uid(), role: "assistant", content: chatbotConfig.greeting, time: nowLabel() },
    { id: uid(), role: "assistant", content: chatbotConfig.humanHandoff, time: nowLabel() },
  ];
}

const BOT_GIF = `${process.env.PUBLIC_URL}/bot/bot.gif`;

function BotAvatar({ size = "md" }) {
  const cls = size === "sm" ? "h-8 w-8 sm:h-10 sm:w-10" : size === "lg" ? "h-14 w-14 sm:h-16 sm:w-16" : "h-10 w-10 sm:h-12 sm:w-12";
  return (
    <div className={`${cls} shrink-0 overflow-hidden bg-transparent`}>
      <img src={BOT_GIF} alt="" className="h-full w-full object-contain object-center" />
    </div>
  );
}

function SettingsMenu({
  open,
  onClose,
  accent,
  setAccent,
  theme,
  setTheme,
  fontId,
  setFontId,
  incognito,
  setIncognito,
  onClear,
  onExport,
  stats,
}) {
  const [panel, setPanel] = useState("colors");

  if (!open) return null;

  const items = [
    { id: "colors", label: "Colors", icon: () => <span className="text-sm">🎨</span> },
    { id: "fonts", label: "Fonts", icon: () => <span className="font-bold">T</span> },
    { id: "theme", label: "Theme", icon: IconSun },
    { id: "greeting", label: "Greeting", icon: IconMessageSquare },
    { id: "stats", label: "Stats", icon: IconUsers },
    { id: "export", label: "Export", icon: IconDownload },
    { id: "share", label: "Share", icon: IconShare2 },
    { id: "incognito", label: "Incognito", icon: IconEye },
    { id: "clear", label: "Clear History", icon: IconTrash2, danger: true },
  ];

  return (
    <>
      <button type="button" className="absolute inset-0 z-20 bg-black/20" aria-label="Close settings" onClick={onClose} />
      <div
        className="absolute inset-x-2 top-14 z-30 flex max-h-[min(520px,calc(100%-4.5rem))] w-auto flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right-4 fade-in duration-200 sm:inset-x-auto sm:right-3 sm:w-[230px]"
        data-testid="chatbot-settings-menu"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-3 py-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Settings</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close settings"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="chatbot-settings-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = panel === item.id || (item.id === "incognito" && incognito);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPanel(item.id);
                  if (item.id === "clear") onClear();
                  if (item.id === "export") onExport();
                  if (item.id === "share") {
                    const url = typeof window !== "undefined" ? window.location.origin : "";
                    if (navigator.share) navigator.share({ title: chatbotConfig.name, url }).catch(() => {});
                    else if (navigator.clipboard) navigator.clipboard.writeText(url).catch(() => {});
                  }
                  if (item.id === "theme") setTheme(theme === "light" ? "soft" : "light");
                  if (item.id === "incognito") setIncognito(!incognito);
                }}
                className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                  item.danger
                    ? "text-rose-600 hover:bg-rose-50"
                    : active
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">{item.label}</span>
                {item.id === "incognito" ? (
                  <span className={`text-[10px] font-bold uppercase ${incognito ? "text-violet-600" : "text-slate-400"}`}>
                    {incognito ? "On" : "Off"}
                  </span>
                ) : null}
              </button>
            );
          })}

          {panel === "colors" && (
            <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Accent</p>
              <div className="flex flex-wrap gap-2">
                {ACCENT_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    type="button"
                    title={o.label}
                    onClick={() => setAccent(o.color)}
                    className={`h-7 w-7 rounded-full border-2 ${accent === o.color ? "border-slate-900" : "border-transparent"}`}
                    style={{ backgroundColor: o.color }}
                  />
                ))}
              </div>
            </div>
          )}

          {panel === "fonts" && (
            <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-3" data-testid="chatbot-fonts-panel">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Message size</p>
              <div className="flex flex-col gap-1.5">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFontId(f.id)}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      fontId === f.id
                        ? "border-sky-500 bg-sky-50 text-sky-800"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-white"
                    }`}
                    style={{ fontSize: f.size, lineHeight: f.line }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {panel === "incognito" && (
            <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600" data-testid="chatbot-incognito-panel">
              <p className="font-semibold text-slate-800">{incognito ? "Incognito is on" : "Incognito is off"}</p>
              <p className="mt-1">
                {incognito
                  ? "Chat is not saved on this device. Closing the chat clears the session."
                  : "Turn on to stop saving chat history to this browser."}
              </p>
              <button
                type="button"
                onClick={() => setIncognito(!incognito)}
                className={`mt-3 w-full rounded-lg px-3 py-2 text-xs font-semibold text-white ${
                  incognito ? "bg-violet-600 hover:bg-violet-700" : "bg-slate-800 hover:bg-slate-900"
                }`}
              >
                {incognito ? "Turn off Incognito" : "Turn on Incognito"}
              </button>
            </div>
          )}

          {panel === "greeting" && (
            <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              {chatbotConfig.greeting}
            </div>
          )}

          {panel === "stats" && (
            <div className="mt-1 space-y-1 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
              <div>Messages: <strong>{stats.total}</strong></div>
              <div>Your messages: <strong>{stats.user}</strong></div>
              <div>AI replies: <strong>{stats.bot}</strong></div>
              <div>Live AI: <strong>{chatbotHasLiveAi() ? "Configured" : "FAQ mode"}</strong></div>
              <div>Incognito: <strong>{incognito ? "On" : "Off"}</strong></div>
            </div>
          )}

          {panel === "theme" && (
            <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="mb-2 font-semibold text-slate-800">Theme: {theme === "soft" ? "Soft" : "Light"}</p>
              <button
                type="button"
                onClick={() => setTheme(theme === "light" ? "soft" : "light")}
                className="w-full rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-900"
              >
                Switch to {theme === "light" ? "Soft" : "Light"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function InternshipChatbot() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commonOpen, setCommonOpen] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [incognito, setIncognito] = useState(false);
  const [accent, setAccent] = useState(() => {
    try {
      return localStorage.getItem(ACCENT_KEY) || "#2563EB";
    } catch {
      return "#2563EB";
    }
  });
  const [fontId, setFontId] = useState(() => {
    try {
      return localStorage.getItem(FONT_KEY) || "md";
    } catch {
      return "md";
    }
  });
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || "light";
    } catch {
      return "light";
    }
  });
  const [messages, setMessages] = useState(() => {
    const saved = loadHistory();
    if (saved?.length) return saved;
    return defaultMessages();
  });
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const incognitoRef = useRef(false);

  const hidden = useMemo(() => {
    const p = location.pathname || "";
    return (
      p.startsWith("/admin")
      || p.startsWith("/login")
      || p.startsWith("/register")
    );
  }, [location.pathname]);

  useEffect(() => {
    incognitoRef.current = incognito;
  }, [incognito]);

  useEffect(() => {
    if (incognito) {
      clearSavedHistory();
      return;
    }
    saveHistory(messages);
  }, [messages, incognito]);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(FONT_KEY, fontId);
    } catch {
      /* ignore */
    }
  }, [fontId]);

  useEffect(() => {
    try {
      localStorage.setItem(ACCENT_KEY, accent);
    } catch {
      /* ignore */
    }
  }, [accent]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open, busy]);

  const toggleIncognito = (next) => {
    const on = typeof next === "boolean" ? next : !incognito;
    setIncognito(on);
    if (on) {
      clearSavedHistory();
      setMessages(defaultMessages());
    }
  };

  if (!chatbotConfig.enabled || hidden) return null;

  const fontOpt = FONT_OPTIONS.find((f) => f.id === fontId) || FONT_OPTIONS[1];

  const filtered = search.trim()
    ? messages.filter((m) => m.content.toLowerCase().includes(search.trim().toLowerCase()))
    : messages;

  const stats = {
    total: messages.length,
    user: messages.filter((m) => m.role === "user").length,
    bot: messages.filter((m) => m.role === "assistant").length,
  };

  const sendText = async (raw) => {
    const text = String(raw || "").trim();
    if (!text || busy) return;

    const userMsg = { id: uid(), role: "user", content: text, time: nowLabel() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setCommonOpen(false);
    setBusy(true);

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const reply = await getChatbotReply(text, history);
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: reply, time: nowLabel() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "assistant", content: chatbotConfig.humanHandoff, time: nowLabel() },
      ]);
    } finally {
      setBusy(false);
      inputRef.current?.focus();
    }
  };

  const clearHistory = () => {
    clearSavedHistory();
    setMessages(defaultMessages());
    setSettingsOpen(false);
  };

  const exportChat = () => {
    const blob = new Blob(
      [messages.map((m) => `[${m.time}] ${m.role}: ${m.content}`).join("\n\n")],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lerbo-internship-chat.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  };

  const closeChat = () => {
    setOpen(false);
    setSettingsOpen(false);
    if (incognitoRef.current) {
      clearSavedHistory();
      setMessages(defaultMessages());
    }
  };

  const panelBg = theme === "soft" ? "bg-slate-50" : "bg-white";

  return (
    <div
      className="pointer-events-none fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-[max(0.75rem,env(safe-area-inset-right))] z-[70] flex max-w-[calc(100vw-1rem)] flex-col items-end gap-2 sm:bottom-5 sm:right-5 sm:gap-3"
      data-testid="internship-chatbot"
    >
      {open && (
        <div
          className={`pointer-events-auto relative flex h-[min(640px,calc(100dvh-5.5rem))] w-[min(100vw-1rem,400px)] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-2xl sm:h-[min(640px,calc(100vh-7rem))] sm:w-[min(100vw-2.5rem,400px)] ${panelBg}`}
          style={{
            ["--chat-accent"]: accent,
            ["--chat-font-size"]: fontOpt.size,
            ["--chat-line-height"]: fontOpt.line,
          }}
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex min-w-0 items-center gap-2">
              <BotAvatar size="sm" />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">{chatbotConfig.agentLabel}</div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
                  </span>
                  {incognito ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-violet-600">
                      <IconEye className="h-3 w-3" /> Incognito
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> New Session
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
              <span className="hidden rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:inline">
                EN
              </span>
              <button
                type="button"
                data-testid="chatbot-settings-toggle"
                onClick={() => setSettingsOpen((v) => !v)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Open settings"
                style={{ color: settingsOpen ? accent : undefined }}
              >
                <IconSettings className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeChat}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-label="Close chat"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="shrink-0 border-b border-slate-100 bg-white px-2.5 py-2 sm:px-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <IconSearch className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search messages..."
                className="min-w-0 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Messages */}
          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-2.5 py-3 sm:space-y-4 sm:px-3 sm:py-4">
            {filtered.map((m) => (
              <div key={m.id} className={`flex gap-1.5 sm:gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "assistant" ? <BotAvatar size="sm" /> : null}
                <div className={`max-w-[82%] sm:max-w-[78%] ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                  <div
                    className={`rounded-2xl px-3 py-2 leading-relaxed shadow-sm sm:px-3.5 sm:py-2.5 ${
                      m.role === "user"
                        ? "rounded-br-md text-white"
                        : "rounded-bl-md border border-slate-100 bg-white text-slate-700"
                    }`}
                    style={{
                      fontSize: "var(--chat-font-size)",
                      lineHeight: "var(--chat-line-height)",
                      ...(m.role === "user" ? { backgroundColor: accent } : null),
                    }}
                  >
                    <span className="break-words whitespace-pre-wrap">{m.content}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 px-1">
                    <span className="text-[10px] text-slate-400">{m.time}</span>
                    {m.role === "assistant" ? (
                      <button
                        type="button"
                        onClick={() => copyText(m.content)}
                        className="text-slate-400 hover:text-slate-600"
                        aria-label="Copy message"
                      >
                        <IconCopy className="h-3 w-3" />
                      </button>
                    ) : null}
                  </div>
                </div>
                {m.role === "user" ? (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-white">
                    U
                  </div>
                ) : null}
              </div>
            ))}
            {busy ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <BotAvatar size="sm" />
                <span className="animate-pulse">Typing…</span>
              </div>
            ) : null}
          </div>

          {/* Common messages */}
          {commonOpen && (
            <div className="max-h-28 shrink-0 overflow-y-auto border-t border-slate-100 bg-white px-2.5 py-2 sm:max-h-32 sm:px-3">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Common messages</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {chatbotConfig.commonMessages.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    onClick={() => {
                      if (c.path?.startsWith("/")) {
                        setCommonOpen(false);
                        navigate(c.path);
                      } else {
                        sendText(c.label);
                      }
                    }}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white sm:px-3 sm:text-xs"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 sm:px-3 sm:pb-3 sm:pt-3">
            <div className="mb-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCommonOpen((v) => !v)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                title="Common messages"
                aria-label="Common messages"
              >
                <IconMessageSquare className="h-4 w-4" />
              </button>
              <Link to="/contact" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100" title="Help">
                ?
              </Link>
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                sendText(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-slate-300 focus:bg-white sm:px-4"
                data-testid="chatbot-input"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition disabled:opacity-40"
                style={{ backgroundColor: accent }}
                aria-label="Send"
                data-testid="chatbot-send"
              >
                <IconSend className="h-4 w-4" />
              </button>
            </form>
          </div>

          <SettingsMenu
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            accent={accent}
            setAccent={setAccent}
            theme={theme}
            setTheme={setTheme}
            fontId={fontId}
            setFontId={setFontId}
            incognito={incognito}
            setIncognito={toggleIncognito}
            onClear={clearHistory}
            onExport={exportChat}
            stats={stats}
          />
        </div>
      )}

      <div className="pointer-events-auto flex items-end gap-2">
        {open ? (
          <button
            type="button"
            onClick={() => setCommonOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 sm:h-12 sm:w-12"
            aria-label="Quick actions"
            title="Common messages"
          >
            <IconPlus className="h-5 w-5" />
          </button>
        ) : null}
        <button
          type="button"
          data-testid="chatbot-toggle"
          onClick={() => {
            if (open) {
              closeChat();
            } else {
              setOpen(true);
              setSettingsOpen(false);
              window.setTimeout(() => inputRef.current?.focus(), 120);
            }
          }}
          className={`flex items-center justify-center overflow-hidden transition hover:scale-105 ${
            open
              ? "h-12 w-12 rounded-full bg-slate-900 text-white shadow-xl sm:h-14 sm:w-14"
              : "h-24 w-24 bg-transparent shadow-none sm:h-36 sm:w-36 md:h-40 md:w-40"
          }`}
          aria-label={open ? "Close internship chatbot" : "Open internship chatbot"}
        >
          {open ? (
            <IconX className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <img src={BOT_GIF} alt="Open internship chatbot" className="h-full w-full object-contain object-center" />
          )}
        </button>
      </div>
    </div>
  );
}
