/* eslint-disable react/no-unescaped-entities */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { IconSearch as Search, IconX as X, IconGraduationCap as GraduationCap, IconBriefcase as Briefcase, IconBuilding2 as Building2, IconFileText as FileText } from "@/components/icons/AppIcons";
import api from "@/lib/api";

const KIND_META = {
  student:     { label: "Student",     icon: GraduationCap, color: "text-rose-700 bg-rose-50" },
  startup:     { label: "Startup",     icon: Briefcase,     color: "text-amber-700 bg-amber-50" },
  institution: { label: "Institution", icon: Building2,     color: "text-sky-700 bg-sky-50" },
  internship:  { label: "Internship",  icon: FileText,      color: "text-emerald-700 bg-emerald-50" },
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const popoverRef = useRef(null);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 30);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Debounced search
  const fetchResults = useCallback(async (text) => {
    if (!text || text.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/search?q=${encodeURIComponent(text)}`);
      setResults(data.results || []);
      setActiveIdx(0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => fetchResults(q), 200);
    return () => clearTimeout(t);
  }, [q, open, fetchResults]);

  const handleSelect = (r) => {
    if (!r?.url) return;
    setOpen(false);
    setQ("");
    setResults([]);
    navigate(r.url);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(results[activeIdx]);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 30); }}
        className="flex items-center gap-2 rounded-none border border-slate-200 bg-white p-0 text-sm text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:text-slate-600"
        data-testid="global-search-trigger"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Search anything...</span>
        <kbd className="ml-3 hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 sm:inline-block">⌘K</kbd>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 px-4 pt-24" data-testid="global-search-popover">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
              <Search className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search students, startups, institutions, internships..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                data-testid="global-search-input"
              />
              <button onClick={() => setOpen(false)} className="text-slate-600 dark:text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-400">Searching...</div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-600 dark:text-slate-400">{q ? "No results found" : "Type to search the entire platform"}</div>
              ) : (
                <ul>
                  {results.map((r, i) => {
                    const M = KIND_META[r.kind];
                    const Icon = M?.icon || Search;
                    return (
                      <li key={`${r.kind}-${r.id}`}>
                        <button
                          onClick={() => handleSelect(r)}
                          onMouseEnter={() => setActiveIdx(i)}
                          data-testid={`global-search-result-${r.kind}-${r.id}`}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm ${i === activeIdx ? "bg-slate-50" : ""}`}
                        >
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${M?.color || "bg-slate-100"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-semibold text-slate-900">{r.title}</div>
                            <div className="truncate text-xs text-slate-500">{r.subtitle}</div>
                          </div>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">{M?.label || r.kind}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-[10px] text-slate-600 dark:text-slate-400">
              <span>↑ ↓ navigate · ↵ open · Esc close</span>
              <span>{results.length} results</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
