import React, { useId, useMemo, useState } from "react";
import { IconX as X } from "@/components/icons/AppIcons";
import { cn } from "@/lib/utils";

/**
 * Multi-select tag field with selected chips, free-text entry, and tappable option buttons.
 */
export default function TagPicker({
  value = [],
  onChange,
  options = [],
  placeholder = "Type and press Enter…",
  dataTestId,
  hint,
  minRecommended = 0,
  labelCount,
  className,
  isLoading = false,
}) {
  const [input, setInput] = useState("");
  const listId = useId();

  const add = (raw) => {
    const t = raw.trim();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    setInput("");
  };

  const remove = (tag) => onChange(value.filter((x) => x !== tag));

  const available = useMemo(() => {
    const q = input.trim().toLowerCase();
    return options.filter((o) => {
      if (value.includes(o)) return false;
      if (!q) return true;
      return o.toLowerCase().includes(q);
    });
  }, [options, value, input]);

  const needsMore = minRecommended > 0 && value.length < minRecommended;

  if (isLoading) {
    return (
      <div className={cn("rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5", className)}>
        Loading options…
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0a0f1a]">
        <div className="flex min-h-[2.75rem] flex-wrap items-center gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700 dark:bg-white/10 dark:text-slate-200"
            >
              <span className="truncate">{tag}</span>
              <button
                type="button"
                onClick={() => remove(tag)}
                className="shrink-0 rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-white/20"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <input
            data-testid={dataTestId}
            list={listId}
            className="min-w-[8rem] flex-1 basis-[8rem] border-0 bg-transparent py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                add(input);
              }
              if (e.key === "Backspace" && !input && value.length) {
                remove(value[value.length - 1]);
              }
            }}
            onBlur={() => {
              if (input.trim()) add(input);
            }}
            placeholder={placeholder}
          />
        </div>
        {options.length > 0 ? (
          <datalist id={listId}>
            {options.map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {labelCount ? (
          <span className={cn("font-medium", needsMore ? "text-amber-600" : "text-slate-500")}>
            {value.length} selected{minRecommended > 0 ? ` · ${minRecommended}+ recommended` : ""}
          </span>
        ) : null}
        {hint ? <span className="text-slate-500">{hint}</span> : null}
      </div>

      {options.length > 0 ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            {input.trim() ? "Matching options" : "Tap to add"}
          </p>
          <div className="flex max-h-52 flex-wrap gap-2 overflow-y-auto pr-1 sm:max-h-56">
            {available.length === 0 ? (
              <span className="text-xs text-slate-500">
                {input.trim() ? "No matches — press Enter to add your own." : "All options selected."}
              </span>
            ) : (
              available.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => add(option)}
                  className="inline-flex max-w-full items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:border-[#D92D20] hover:bg-[#D92D20]/5 hover:text-[#D92D20] dark:border-white/15 dark:bg-[#0a0f1a] dark:text-slate-300 dark:hover:border-[#F87171] dark:hover:text-[#F87171] sm:text-sm"
                  data-testid={dataTestId ? `${dataTestId}-option-${option.replace(/\s+/g, "-").toLowerCase()}` : undefined}
                >
                  <span className="mr-1 text-[#D92D20] dark:text-[#F87171]">+</span>
                  <span className="truncate">{option}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
