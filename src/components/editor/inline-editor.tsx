"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn, moodToColor } from "@/lib/utils";
import { Save, MapPin, CloudSun, Eye, ChevronDown, ChevronUp } from "lucide-react";

const MOOD_EMOJIS = ["", "😢", "😞", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩", "🥳"];

export function InlineEditor() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState("");
  const [saving, setSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const saveDraft = useCallback(async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const url = entryId ? `/api/entries/${entryId}` : "/api/entries";
      const method = entryId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || undefined,
          content,
          mood,
          location: location || null,
          weather: weather || null,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (res.ok && !entryId) {
        setEntryId(data.entry.id);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }, [content, title, mood, location, weather, entryId]);

  useEffect(() => {
    const interval = setInterval(saveDraft, 30000);
    return () => clearInterval(interval);
  }, [saveDraft]);

  const handlePublish = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      const url = entryId ? `/api/entries/${entryId}` : "/api/entries";
      const method = entryId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || undefined,
          content,
          mood,
          location: location || null,
          weather: weather || null,
          status: "published",
        }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        setMood(null);
        setLocation("");
        setWeather("");
        setEntryId(null);
        setShowMeta(false);
        setExpanded(false);
        router.refresh();
      }
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleContentFocus = () => {
    setExpanded(true);
  };

  return (
    <div className="border border-border/50 rounded-xl bg-bg-primary/50 overflow-hidden transition-all duration-300">
      {/* Collapsed: quick input */}
      {!expanded ? (
        <button
          onClick={handleContentFocus}
          className="w-full px-5 py-4 text-left text-text-secondary/40 text-sm hover:bg-bg-secondary/30 transition-colors"
        >
          写点什么...
        </button>
      ) : (
        <div className="px-5 pt-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题（可选）"
            className="w-full bg-transparent font-[var(--font-serif)] text-xl text-text-primary placeholder:text-text-secondary/40 outline-none mb-3"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="此刻的心情、想法、感受..."
            autoFocus
            className="w-full min-h-[160px] bg-transparent text-text-primary text-sm leading-relaxed placeholder:text-text-secondary/30 outline-none resize-none"
          />
        </div>
      )}

      {/* Toolbar */}
      {expanded && (
        <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMeta(!showMeta)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs transition-colors",
                showMeta
                  ? "bg-bg-secondary text-text-primary"
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {showMeta ? "收起" : "更多选项"}
            </button>

            {location && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-secondary text-xs text-text-secondary">
                <MapPin size={10} />
                {location}
              </span>
            )}
            {weather && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-secondary text-xs text-text-secondary">
                <CloudSun size={10} />
                {weather}
              </span>
            )}
            {mood !== null && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg-secondary text-xs text-text-secondary">
                <span style={{ color: moodToColor(mood) }}>●</span>
                {MOOD_EMOJIS[mood]}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary/40">{content.length} 字</span>
            <button
              onClick={saveDraft}
              disabled={saving || !content.trim()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-40"
            >
              <Save size={12} />
              {saving ? "..." : "草稿"}
            </button>
            <button
              onClick={handlePublish}
              disabled={saving || !content.trim()}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs hover:bg-accent/30 transition-colors disabled:opacity-40"
            >
              <Eye size={12} />
              发布
            </button>
            <button
              onClick={() => {
                setExpanded(false);
              }}
              className="flex items-center justify-center w-6 h-6 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors"
            >
              <ChevronUp size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Expanded metadata */}
      {expanded && showMeta && (
        <div className="px-5 pb-4 pt-2 border-t border-border/30 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-xs text-text-secondary mb-1.5 block">心情</label>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(mood === m ? null : m)}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all",
                    mood === m
                      ? "bg-bg-secondary scale-110"
                      : "hover:bg-bg-secondary/50"
                  )}
                  style={
                    mood === m
                      ? { boxShadow: `0 0 8px ${moodToColor(m)}40` }
                      : {}
                  }
                >
                  {MOOD_EMOJIS[m]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">地点</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="你在哪里"
              className="w-full bg-bg-secondary rounded-md px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary/40 outline-none focus:ring-1 focus:ring-accent/30"
            />
          </div>

          <div>
            <label className="text-xs text-text-secondary mb-1.5 block">天气</label>
            <input
              type="text"
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              placeholder="晴 / 雨 / 多云..."
              className="w-full bg-bg-secondary rounded-md px-3 py-1.5 text-sm text-text-primary placeholder:text-text-secondary/40 outline-none focus:ring-1 focus:ring-accent/30"
            />
          </div>
        </div>
      )}
    </div>
  );
}
