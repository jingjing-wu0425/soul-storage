"use client";

import { cn, formatRelativeTime, moodToColor, generateExcerpt } from "@/lib/utils";
import type { Entry } from "@/types";

interface EntryCardProps {
  entry: Entry;
  featured?: boolean;
}

export function EntryCard({ entry, featured = false }: EntryCardProps) {
  const excerpt = entry.excerpt || generateExcerpt(entry.content);
  const coverImage = entry.images[0];

  return (
    <article
      className={cn(
        "group relative rounded-lg border border-border bg-bg-card overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5",
        featured && "min-h-[220px]"
      )}
    >
      {/* Cover image for featured card */}
      {featured && coverImage && (
        <div className="absolute inset-0">
          <img
            src={coverImage.url}
            alt={coverImage.caption || entry.title || ""}
            className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/80 to-transparent" />
        </div>
      )}

      <div className={cn("relative p-5 flex flex-col gap-3", featured && "p-6")}>
        {/* Top row: date + mood */}
        <div className="flex items-center justify-between">
          <time className="text-xs text-text-secondary">
            {formatRelativeTime(entry.entryDate)}
          </time>
          {entry.mood !== null && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: moodToColor(entry.mood) }}
              />
              <span className="text-xs text-text-secondary">{entry.mood}</span>
            </div>
          )}
        </div>

        {/* Title */}
        {entry.title && (
          <h3
            className={cn(
              "font-[var(--font-serif)] text-text-primary leading-snug line-clamp-2",
              featured ? "text-xl" : "text-base"
            )}
          >
            {entry.title}
          </h3>
        )}

        {/* Excerpt */}
        <p className={cn(
          "text-text-secondary text-sm leading-relaxed",
          featured ? "line-clamp-4" : "line-clamp-2"
        )}>
          {excerpt}
        </p>

        {/* Bottom row: metadata */}
        <div className="flex items-center gap-3 mt-auto pt-2">
          {entry.location && (
            <span className="text-xs text-text-secondary/60 truncate max-w-[140px]">
              {entry.location}
            </span>
          )}
          {entry.musicAnchors?.length > 0 && (
            <span className="text-xs text-accent/60 truncate">
              {entry.musicAnchors[0].trackName}
            </span>
          )}
          {entry.images?.length > 1 && (
            <span className="text-xs text-text-secondary/40 ml-auto">
              +{entry.images.length} 张图片
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
