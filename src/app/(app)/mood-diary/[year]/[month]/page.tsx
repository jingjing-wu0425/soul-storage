'use client';

import { useState, useCallback, useMemo, use } from 'react';
import { MayPosterGallery } from '@/components/poster/may-poster-gallery';
import { PosterEditModal } from '@/components/poster/poster-edit-modal';
import { PosterViewModal } from '@/components/poster/poster-view-modal';
import { PosterCropModal } from '@/components/poster/poster-crop-modal';
import type { PosterSlot, CanvasState } from '@/components/poster/may-poster-gallery';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function buildSlots(year: number, month: number): PosterSlot[] {
  const days = getDaysInMonth(year, month);
  const mm = String(month).padStart(2, '0');
  const slots: PosterSlot[] = [];
  let id = 1;
  const sizes: PosterSlot['size'][] = ['small', 'medium', 'large'];

  for (let d = 1; d <= days; d += 3) {
    const size = sizes[id % 3];
    const col = (id - 1) % 4;
    const row = Math.floor((id - 1) / 4);
    slots.push({
      id: String(id),
      size,
      voidText: `${mm}.${String(d).padStart(2, '0')}`,
      x: col * 320 + 40,
      y: row * 440 + 20,
    });
    id++;
  }
  return slots;
}

export default function MoodDiaryMonthPage({ params }: { params: Promise<{ year: string; month: string }> }) {
  const { year: yearStr, month: monthStr } = use(params);
  const year = Number(yearStr);
  const month = Number(monthStr);
  const initialSlots = useMemo(() => buildSlots(year, month), [year, month]);

  const [slots, setSlots] = useState<PosterSlot[]>(initialSlots);
  const [canvasState, setCanvasState] = useState<CanvasState>({ strokes: [], blocks: [], stickers: [], textBoxes: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [croppingId, setCroppingId] = useState<string | null>(null);

  const editingSlot = editingId ? slots.find((s) => s.id === editingId) : null;
  const viewingSlot = viewingId ? slots.find((s) => s.id === viewingId) : null;
  const croppingSlot = croppingId ? slots.find((s) => s.id === croppingId) : null;

  const handleCrop = useCallback((id: string, croppedUrl: string) => {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, photoUrl: croppedUrl } : s)));
    setCroppingId(null);
  }, []);

  const handleSave = useCallback((updated: PosterSlot) => {
    setSlots((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingId(null);
  }, []);

  const handleSaveLayout = useCallback((layout: PosterSlot[], canvas: CanvasState) => {
    setSlots(layout);
    setCanvasState(canvas);
  }, []);

  return (
    <>
      <MayPosterGallery
        slots={slots}
        savedCanvas={canvasState}
        onEdit={setEditingId}
        onView={setViewingId}
        onCrop={setCroppingId}
        onSaveLayout={handleSaveLayout}
      />

      {editingSlot && (
        <PosterEditModal
          slot={editingSlot}
          onSave={handleSave}
          onClose={() => setEditingId(null)}
        />
      )}

      {viewingSlot && (
        <PosterViewModal
          slot={viewingSlot}
          onClose={() => setViewingId(null)}
        />
      )}

      {croppingSlot && croppingSlot.photoUrl && (
        <PosterCropModal
          slot={croppingSlot}
          onCrop={handleCrop}
          onClose={() => setCroppingId(null)}
        />
      )}
    </>
  );
}
