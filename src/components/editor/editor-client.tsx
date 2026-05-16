"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn, moodToColor } from "@/lib/utils";
import {
  Save,
  ArrowLeft,
  MapPin,
  CloudSun,
  Eye,
} from "lucide-react";

const MOOD_EMOJIS = ["", "😢", "😞", "😕", "😐", "🙂", "😊", "😄", "😁", "🤩", "🥳"];

export function EditorClient() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState("");
  const [saving, setSaving] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [showMeta, setShowMeta] = useState(false);

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
        window.history.replaceState(null, "", `/editor/${data.entry.id}`);
      }
    } catch {
      // silent fail for auto-save
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
        const data = await res.json();
        router.push(`/entry/${data.entry.id}`);
      }
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex items-center gap-3">
            <button
              onClick={saveDraft}
              disabled={saving || !content.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors disabled:opacity-40"
            >
              <Save size={14} />
              {saving ? "保存中..." : "存草稿"}
            </button>
            <button
              onClick={handlePublish}
              disabled={saving || !content.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/20 text-accent text-xs hover:bg-accent/30 transition-colors disabled:opacity-40"
            >
              <Eye size={14} />
              发布
            </button>
          </div>
        </div>
      </div>

      {/* Editor area */}
      <div className="max-w-3xl mx-auto px-6 py-8 pb-32">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="标题（可选）"
          className="w-full bg-transparent font-[var(--font-serif)] text-3xl text-text-primary placeholder:text-text-secondary/40 outline-none mb-6"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="此刻的心情、想法、感受..."
          className="w-full min-h-[60vh] bg-transparent text-text-primary text-base leading-relaxed placeholder:text-text-secondary/30 outline-none resize-none"
        />
      </div>

      {/* Bottom metadata bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-bg-primary/90 backdrop-blur-md z-50">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMeta(!showMeta)}
              className={cn(
                "px-3 py-1 rounded-full text-xs transition-colors",
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

          <span className="text-xs text-text-secondary/40">
            {content.length} 字
          </span>
        </div>

        {showMeta && (
          <div className="max-w-3xl mx-auto px-6 pb-4 pt-2 border-t border-border/50 grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs text-text-secondary mb-1.5 block">心情</label>
              <div className="flex gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(mood === m ? null : m)}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all",
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
    </div>
  );
}
