import { resolveAssetUrl } from "@/lib/assets";

/** Optional internship cover image — only renders when a valid URL is present. */
export default function OpportunityImage({ src, alt = "", className = "" }) {
  const url = resolveAssetUrl(src);
  if (!url) return null;
  return (
    <div className={`overflow-hidden bg-slate-100 dark:bg-white/5 ${className}`}>
      <img
        src={url}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
          const wrap = e.currentTarget.parentElement;
          if (wrap) wrap.style.display = "none";
        }}
      />
    </div>
  );
}

export function normalizeImageUrl(value) {
  const v = String(value || "").trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v) || v.startsWith("data:")) return v;
  if (v.startsWith("//")) return `https:${v}`;
  return null;
}
