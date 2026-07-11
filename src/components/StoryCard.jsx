import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { IconChevronRight, IconChevronLeft } from "@/components/icons/AppIcons";

const PLACEMENT_PHOTOS = [1, 2, 3, 4].map(
  (n) => `${process.env.PUBLIC_URL}/placement/${n}.png`
);

export function placementPhoto(index = 0) {
  return PLACEMENT_PHOTOS[Math.abs(index) % PLACEMENT_PHOTOS.length];
}

export function StoryCard({
  quote,
  name,
  role,
  photo,
  photoIndex = 0,
  href = "/stories",
  truncate = true,
  className = "",
}) {
  const src = photo || placementPhoto(photoIndex);
  const text = truncate && quote && quote.length > 140 ? `${quote.slice(0, 140).trim()}…` : quote;

  return (
    <article className={`story-card flex h-full w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.08)] ${className}`}>
      <div className="flex flex-1 flex-col px-6 pb-4 pt-6">
        <span className="font-display text-5xl leading-none text-[#22C55E]" aria-hidden>
          “
        </span>
        <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate-600">
          {text}
        </p>
        <Link
          to={href}
          className="mt-4 inline-flex items-center text-sm font-semibold text-[#2563EB] transition hover:underline"
        >
          Read more <IconChevronRight className="ml-0.5 h-4 w-4" />
        </Link>
      </div>
      <div className="flex items-center gap-3 bg-[#F3F4F6] px-6 py-4">
        <img
          src={src}
          alt=""
          className="h-11 w-11 shrink-0 rounded-full object-cover object-center"
          loading="lazy"
        />
        <div className="min-w-0">
          <div className="truncate font-semibold text-slate-900">{name}</div>
          {role ? <div className="truncate text-xs text-slate-500">{role}</div> : null}
        </div>
      </div>
    </article>
  );
}

export function StoryCarousel({ items, href = "/stories" }) {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 340, behavior: "smooth" });
    window.setTimeout(updateArrows, 320);
  };

  return (
    <div className="relative" data-testid="story-carousel">
      <div
        ref={scrollerRef}
        onScroll={updateArrows}
        className="flex gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <StoryCard
            key={`${item.name || item.n}-${i}`}
            quote={item.quote || item.q}
            name={item.name || item.n || item.who}
            role={item.role || item.r || item.from}
            photo={item.photo || item.img}
            photoIndex={i}
            href={href}
            className="w-[300px] shrink-0 sm:w-[320px]"
          />
        ))}
      </div>

      {canPrev && (
        <button
          type="button"
          aria-label="Previous stories"
          onClick={() => scrollBy(-1)}
          className="absolute -left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 sm:flex"
        >
          <IconChevronLeft className="h-5 w-5" />
        </button>
      )}
      <button
        type="button"
        aria-label="Next stories"
        onClick={() => scrollBy(1)}
        disabled={!canNext}
        className="absolute -right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 disabled:opacity-40 sm:flex"
      >
        <IconChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default StoryCard;
