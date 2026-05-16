"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDate, formatRelativeTime, moodToColor } from "@/lib/utils";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  MapPin,
  Music,
  CloudSun,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Entry } from "@/types";

const MOOD_EMOJIS = ["", "😢", "😞", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩", "🥳"];

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    async function fetchEntry() {
      try {
        const res = await fetch(`/api/entries/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setEntry(data.entry);
        } else {
          router.push("/dashboard");
        }
      } catch {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }
    fetchEntry();
  }, [params.id, router]);

  const handleDelete = async () => {
    if (!entry) return;
    const res = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!entry) return null;

  const hasImages = entry.images.length > 0;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top bar */}
      <div className="sticky top-14 z-40 border-b border-border bg-bg-primary/90 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft size={16} />
            返回
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/editor/${entry.id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <Edit3 size={14} />
              编辑
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-text-secondary hover:text-red-400 hover:bg-bg-secondary transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto px-6 py-10"
      >
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <time className="text-sm text-text-secondary">
            {formatDate(entry.entryDate)}
          </time>
          {entry.mood !== null && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-secondary text-xs text-text-secondary">
              <span style={{ color: moodToColor(entry.mood) }}>●</span>
              {MOOD_EMOJIS[entry.mood]} {entry.mood}/10
            </span>
          )}
          {entry.location && (
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin size={12} />
              {entry.location}
            </span>
          )}
          {entry.weather && (
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <CloudSun size={12} />
              {entry.weather}
            </span>
          )}
          {entry.status === "draft" && (
            <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs">
              草稿
            </span>
          )}
        </div>

        {/* Title */}
        {entry.title && (
          <h1 className="font-[var(--font-serif)] text-3xl md:text-4xl text-text-primary mb-8 leading-tight">
            {entry.title}
          </h1>
        )}

        {/* Image gallery */}
        {hasImages && (
          <div className="mb-8">
            <div className="relative rounded-lg overflow-hidden bg-bg-secondary">
              <img
                src={entry.images[imageIndex].url}
                alt={entry.images[imageIndex].caption || ""}
                className="w-full max-h-[500px] object-contain"
              />
              {entry.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {entry.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === imageIndex
                          ? "bg-accent w-4"
                          : "bg-text-secondary/30 hover:bg-text-secondary/60"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            {entry.images[imageIndex].caption && (
              <p className="text-xs text-text-secondary mt-2 text-center">
                {entry.images[imageIndex].caption}
              </p>
            )}
          </div>
        )}

        {/* Content */}
        <div className="prose-custom text-text-primary text-base leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </div>

        {/* Music anchor */}
        {entry.musicAnchors.length > 0 && (
          <div className="mt-10 p-4 rounded-lg bg-bg-secondary/50 border border-border">
            {entry.musicAnchors.map((track) => (
              <div key={track.id} className="flex items-center gap-3">
                {track.albumArtUrl && (
                  <img
                    src={track.albumArtUrl}
                    alt={track.trackName}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">
                    {track.trackName}
                  </p>
                  {track.artist && (
                    <p className="text-xs text-text-secondary truncate">
                      {track.artist}
                    </p>
                  )}
                </div>
                {track.sourceUrl && (
                  <a
                    href={track.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent/80 transition-colors"
                  >
                    <Music size={16} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <span className="text-xs text-text-secondary/40">
            最后编辑于 {formatRelativeTime(entry.updatedAt)}
          </span>
          <span className="text-xs text-text-secondary/40">
            {entry.content.length} 字
          </span>
        </div>
      </motion.article>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-card border border-border rounded-lg p-6 max-w-sm w-full mx-4"
            >
              <h3 className="text-text-primary font-medium mb-2">确认删除</h3>
              <p className="text-sm text-text-secondary mb-6">
                这篇记录将被永久删除，无法恢复。
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 rounded-md text-sm text-red-400 bg-red-400/10 hover:bg-red-400/20 transition-colors"
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
