'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
import type { PosterSlot } from './may-poster-gallery';

interface PosterEditModalProps {
  slot: PosterSlot;
  onSave: (updated: PosterSlot) => void;
  onClose: () => void;
}

export function PosterEditModal({ slot, onSave, onClose }: PosterEditModalProps) {
  const [title, setTitle] = useState(slot.title || '');
  const [content, setContent] = useState(slot.content || '');
  const [date, setDate] = useState(slot.date || '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(slot.photoUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('上传失败');
      const data = await res.json();
      setPhotoUrl(data.url);
    } catch {
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    setUploading(true);
    try {
      const form = new FormData();
      form.append('image', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) throw new Error('上传失败');
      const data = await res.json();
      setPhotoUrl(data.url);
    } catch {
      alert('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        title: title || null,
        content: content || ' ',
        mood: null,
        entryDate: date || new Date().toISOString(),
        status: 'published',
      };

      let entryId = slot.entryId;
      if (entryId) {
        await fetch(`/api/entries/${entryId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } else {
        const res = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          const data = await res.json();
          entryId = data.entry?.id;
        }
      }

      onSave({
        ...slot,
        title,
        content,
        date,
        photoUrl,
        entryId,
      });
    } catch {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center
          bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-bg-overlay w-full max-w-lg mx-4 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
            <span className="text-[10px] tracking-[0.3em] uppercase text-text-faint">
              {slot.date || 'New Slice'}
            </span>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center text-text-faint
                hover:text-text-body transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Upload area */}
          <div className="px-6 pt-5">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative border border-dashed border-border-light
                h-40 flex flex-col items-center justify-center cursor-pointer
                hover:border-border transition-colors bg-bg-muted/50"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="preview"
                  className="w-full h-full object-contain p-2"
                />
              ) : uploading ? (
                <Loader2 size={20} className="animate-spin text-text-faint" />
              ) : (
                <>
                  <Upload size={18} className="text-text-faint mb-2" />
                  <span className="text-[9px] tracking-[0.2em] text-text-faint uppercase">
                    点击或拖拽上传
                  </span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Form fields */}
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="text-[8px] tracking-[0.3em] uppercase text-text-faint block mb-1.5">
                标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="这个瞬间的名字"
                className="w-full border-b border-border-light pb-2 text-sm text-text-heading
                  placeholder:text-text-faint focus:border-border focus:outline-none
                  transition-colors bg-transparent"
              />
            </div>
            <div>
              <label className="text-[8px] tracking-[0.3em] uppercase text-text-faint block mb-1.5">
                记录
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="这一刻发生了什么..."
                rows={4}
                className="w-full border-b border-border-light pb-2 text-sm text-text-heading
                  placeholder:text-text-faint focus:border-border focus:outline-none
                  transition-colors bg-transparent resize-none leading-relaxed"
              />
            </div>
            <div>
              <label className="text-[8px] tracking-[0.3em] uppercase text-text-faint block mb-1.5">
                日期
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="05.01"
                className="w-full border-b border-border-light pb-2 text-sm text-text-heading
                  placeholder:text-text-faint focus:border-border focus:outline-none
                  transition-colors bg-transparent font-mono"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border-subtle flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-[10px] tracking-[0.2em] uppercase text-text-faint
                hover:text-text-body transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || uploading}
              className="px-5 py-1.5 text-[10px] tracking-[0.2em] uppercase text-text-body
                border border-border hover:bg-bg-hover transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
                flex items-center gap-2"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {saving ? '保存中' : '保存'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
