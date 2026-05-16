'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Lock, MousePointer2, Pen, Square, Music, Crop, Type, Trash2, Undo2,
} from 'lucide-react';

// ─── Types ───

export type CellSize = 'small' | 'medium' | 'large';
export type Tool = 'select' | 'draw' | 'shape' | 'sticker' | 'text';

export interface PosterSlot {
  id: string;
  size: CellSize;
  photoUrl?: string;
  title?: string;
  content?: string;
  date?: string;
  voidText?: string;
  entryId?: string;
  x?: number;
  y?: number;
  photoScale?: number;
}

export interface DrawStroke { id: string; points: { x: number; y: number }[]; color: string; width: number; }
export interface ColorBlock { id: string; x: number; y: number; w: number; h: number; color: string; opacity: number; }
export interface StickerItem { id: string; x: number; y: number; symbol: string; scale: number; }

export interface TextBox {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
}

export interface CanvasState {
  strokes: DrawStroke[];
  blocks: ColorBlock[];
  stickers: StickerItem[];
  textBoxes: TextBox[];
}

interface MayPosterGalleryProps {
  slots: PosterSlot[];
  savedCanvas: CanvasState;
  onEdit: (id: string) => void;
  onView: (id: string) => void;
  onCrop?: (id: string) => void;
  onSaveLayout?: (slots: PosterSlot[], canvas: CanvasState) => void;
}

// ─── Constants ───

const INK_COLORS = ['#1a1a1a', '#e07a5f', '#4a6fa5', '#6b7d7d', '#9b8b7e', '#c4956a'];
const SHAPE_COLORS = ['#9b8b7e', '#4a5d4e', '#e07a5f', '#4a6fa5', '#c4956a', '#6b7d7d'];
const STICKER_SET = ['♪', '♫', '♩', '∞', '△', '○', '□', '◇', '✦', '→', '☕', '◐'];
const FONT_OPTIONS = [
  { label: '衬线', value: 'Georgia, "Noto Serif SC", serif' },
  { label: '无衬线', value: '"Inter", system-ui, sans-serif' },
  { label: '等宽', value: '"Courier New", monospace' },
  { label: '手写', value: 'cursive' },
];
const COL_PCTS = [0.30, 0.35, 0.30];

// ─── Tool Button ───

function ToolBtn({ icon, active, onClick, tip }: { icon: React.ReactNode; active: boolean; onClick: () => void; tip: string }) {
  return (
    <button onClick={onClick} title={tip}
      className={`w-10 h-10 flex items-center justify-center rounded transition-colors
        ${active ? 'bg-bg-hover text-text-heading' : 'text-text-faint hover:text-text-body hover:bg-bg-hover'}`}>
      {icon}
    </button>
  );
}

// ─── Masonry Card (view mode) ───

function MasonryCard({ slot, index, onEdit, onView }: {
  slot: PosterSlot; index: number;
  onEdit: (id: string) => void; onView: (id: string) => void;
}) {
  const isEven = index % 2 === 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      className={`group cursor-pointer ${isEven ? 'mt-10' : 'mt-4'}`}
      onClick={slot.photoUrl ? () => onView(slot.id) : () => onEdit(slot.id)}
    >
      <div className="relative overflow-hidden border-[0.5px] border-black/8 hover:shadow-lg transition-shadow duration-300">
        {slot.photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slot.photoUrl} alt={slot.title || ''} className="w-full object-cover select-none pointer-events-none" draggable={false} loading="lazy" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 pointer-events-none" />
            <span className="absolute top-2 left-2 text-[6px] tracking-[0.12em] text-white/70 font-mono uppercase select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">{slot.date || ''}</span>
            <span className="absolute bottom-2 left-2 right-2 text-[7px] tracking-[0.08em] text-white/80 uppercase select-none pointer-events-none truncate opacity-0 group-hover:opacity-100 transition-opacity duration-300">{slot.title || ''}</span>
          </>
        ) : (
          <div className="w-full flex flex-col items-center justify-center border-[0.5px] border-dashed border-border-light/50 min-h-[160px] hover:border-border/60 hover:bg-bg-surface/40 transition-all">
            <div className="w-6 h-6 rounded-full border border-border-light/60 text-text-faint/80 flex items-center justify-center group-hover:border-border group-hover:text-text-faint transition-all">
              <Plus size={10} strokeWidth={1.5} />
            </div>
            <span className="text-[7px] tracking-[0.4em] text-text-faint/80 uppercase select-none mt-2">{slot.voidText || ''}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Edit Photo Item ───

function EditPhotoItem({ slot, measured, pos, zIndex, scale, canDrag, onEdit, onView, onCrop, onBringToFront, onDragEnd, onScale }: {
  slot: PosterSlot;
  measured: { w: number; h: number };
  pos: { x: number; y: number };
  zIndex: number; scale: number; canDrag: boolean;
  onEdit: (id: string) => void; onView: (id: string) => void; onCrop?: (id: string) => void;
  onBringToFront: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onScale: (id: string, scale: number) => void;
}) {
  const w = measured.w * scale;
  const h = measured.h * scale;
  const lastDist = useRef(0);
  const touchIds = useRef<number[]>([]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.stopPropagation();
      touchIds.current = [e.touches[0].identifier, e.touches[1].identifier];
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastDist.current = Math.sqrt(dx * dx + dy * dy);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 2 || touchIds.current.length !== 2) return;
    e.stopPropagation();
    const t0 = Array.from(e.touches).find((t) => t.identifier === touchIds.current[0]);
    const t1 = Array.from(e.touches).find((t) => t.identifier === touchIds.current[1]);
    if (!t0 || !t1) return;
    const dx = t0.clientX - t1.clientX;
    const dy = t0.clientY - t1.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (lastDist.current > 0) {
      onScale(slot.id, Math.min(Math.max(scale * (dist / lastDist.current), 0.3), 3));
    }
    lastDist.current = dist;
  }, [scale, slot.id, onScale]);

  const handleResize = useCallback((e: React.PointerEvent) => {
    e.preventDefault(); e.stopPropagation();
    const sx = e.clientX; const sw = w;
    const onMove = (ev: PointerEvent) => {
      onScale(slot.id, Math.min(Math.max((sw + ev.clientX - sx) / measured.w, 0.3), 3));
    };
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp);
  }, [w, measured.w, slot.id, onScale]);

  return (
    <motion.div
      className="absolute group"
      style={{ zIndex, width: w, height: h }}
      initial={false}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ duration: 0 }}
      drag={canDrag}
      dragMomentum={false} dragElastic={0} dragTransition={{ power: 0 }}
      onDragStart={() => onBringToFront(slot.id)}
      onPointerDown={() => canDrag && onBringToFront(slot.id)}
      onDragEnd={(_, info) => onDragEnd(slot.id, pos.x + info.offset.x, pos.y + info.offset.y)}
      whileDrag={canDrag ? { boxShadow: '0 8px 30px rgba(0,0,0,0.12)' } : undefined}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => { touchIds.current = []; lastDist.current = 0; }}
    >
      <div className="w-full h-full relative overflow-hidden border-[0.5px] border-black/8 cursor-grab active:cursor-grabbing"
        onDoubleClick={() => slot.photoUrl ? onView(slot.id) : onEdit(slot.id)}>
        {slot.photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slot.photoUrl} alt={slot.title || ''} className="w-full h-full object-cover select-none pointer-events-none" draggable={false} />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center border-[0.5px] border-dashed border-border-light/50">
            <Plus size={14} className="text-text-faint/60" />
            <span className="text-[7px] tracking-[0.4em] text-text-faint/80 mt-1 select-none">{slot.voidText || ''}</span>
          </div>
        )}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onEdit(slot.id); }}
        className="absolute -bottom-1 -right-1 z-10 w-4 h-4 rounded-full border border-border/40 text-text-faint/60 bg-bg-surface/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-border transition-all">
        <Plus size={8} strokeWidth={1.5} />
      </button>
      {slot.photoUrl && onCrop && (
        <button onClick={(e) => { e.stopPropagation(); onCrop(slot.id); }}
          className="absolute top-1 left-1 z-10 w-4 h-4 rounded-full border border-border/40 text-text-faint/60 bg-bg-surface/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 hover:border-border transition-all">
          <Crop size={8} strokeWidth={1.5} />
        </button>
      )}
      <div onPointerDown={handleResize}
        className="absolute -bottom-1.5 -right-1.5 z-20 w-3.5 h-3.5 bg-bg-surface border border-border/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-nwse-resize hover:border-border">
        <svg width="14" height="14" viewBox="0 0 14 14" className="absolute inset-0">
          <line x1="10" y1="14" x2="14" y2="10" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
          <line x1="6" y1="14" x2="14" y2="6" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        </svg>
      </div>
    </motion.div>
  );
}

// ─── Text Box Item ───

function TextBoxItem({ box, selected, onSelect, onUpdate, onDelete }: {
  box: TextBox; selected: boolean;
  onSelect: () => void; onUpdate: (b: TextBox) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <motion.div
      className="absolute"
      style={{ left: box.x, top: box.y, zIndex: 150 }}
      drag={!editing}
      dragMomentum={false}
      onDragEnd={(_, info) => onUpdate({ ...box, x: box.x + info.offset.x, y: box.y + info.offset.y })}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
    >
      {editing ? (
        <textarea
          autoFocus
          value={box.text}
          onChange={(e) => onUpdate({ ...box, text: e.target.value })}
          onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === 'Escape') (e.target as HTMLTextAreaElement).blur(); }}
          style={{ fontSize: box.fontSize, fontFamily: box.fontFamily, color: box.color }}
          className="bg-bg-surface/80 border border-border outline-none resize p-1 min-w-[80px] min-h-[30px] leading-snug"
        />
      ) : (
        <div
          style={{ fontSize: box.fontSize, fontFamily: box.fontFamily, color: box.color }}
          className={`p-1 whitespace-pre-wrap leading-snug select-none
            ${selected ? 'border border-dashed border-border/60' : 'border border-transparent'}
            ${!box.text ? 'text-text-faint' : ''}`}
        >
          {box.text || '双击编辑'}
        </div>
      )}
      {selected && !editing && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="absolute -top-2 -right-2 w-4 h-4 bg-red-400 text-white rounded-full flex items-center justify-center">
          <Trash2 size={8} />
        </button>
      )}
    </motion.div>
  );
}

// ─── Main Gallery ───

export function MayPosterGallery({ slots, savedCanvas, onEdit, onView, onCrop, onSaveLayout }: MayPosterGalleryProps) {
  const [editing, setEditing] = useState(false);
  const [tool, setTool] = useState<Tool>('select');

  // Edit mode: measured positions from masonry DOM
  const [measurements, setMeasurements] = useState<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [scales, setScales] = useState<Record<string, number>>(Object.fromEntries(slots.map((s) => [s.id, s.photoScale ?? 1])));
  const [topZ, setTopZ] = useState(slots.length);
  const [zMap, setZMap] = useState<Record<string, number>>(Object.fromEntries(slots.map((s, i) => [s.id, i + 1])));

  // Creative layers
  const [strokes, setStrokes] = useState<DrawStroke[]>([]);
  const [blocks, setBlocks] = useState<ColorBlock[]>([]);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [textBoxes, setTextBoxes] = useState<TextBox[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Undo history
  const historyRef = useRef<string[]>([]);
  const MAX_HISTORY = 50;
  const [historyLen, setHistoryLen] = useState(0);

  const pushHistory = useCallback(() => {
    const snapshot = JSON.stringify({
      positions: Object.fromEntries(Object.entries(positions)),
      scales: Object.fromEntries(Object.entries(scales)),
      strokes, blocks, stickers, textBoxes,
    });
    historyRef.current = [...historyRef.current.slice(-MAX_HISTORY), snapshot];
    setHistoryLen(historyRef.current.length);
  }, [positions, scales, strokes, blocks, stickers, textBoxes]);

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const snapshot = JSON.parse(historyRef.current[historyRef.current.length - 1]);
    historyRef.current = historyRef.current.slice(0, -1);
    setHistoryLen(historyRef.current.length);
    if (snapshot.positions) setPositions(snapshot.positions);
    if (snapshot.scales) setScales(snapshot.scales);
    if (snapshot.strokes) setStrokes(snapshot.strokes);
    if (snapshot.blocks) setBlocks(snapshot.blocks);
    if (snapshot.stickers) setStickers(snapshot.stickers);
    if (snapshot.textBoxes) setTextBoxes(snapshot.textBoxes);
  }, []);

  // Tool settings
  const [inkColor, setInkColor] = useState(INK_COLORS[0]);
  const [inkWidth, setInkWidth] = useState(1.5);
  const [shapeColor, setShapeColor] = useState(SHAPE_COLORS[0]);
  const [placingSticker, setPlacingSticker] = useState<string | null>(null);
  const [textFont, setTextFont] = useState(FONT_OPTIONS[0].value);
  const [textSize, setTextSize] = useState(18);
  const [textColor, setTextColor] = useState(INK_COLORS[0]);

  // Drawing refs
  const currentStroke = useRef<{ id: string; points: { x: number; y: number }[] } | null>(null);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [previewShape, setPreviewShape] = useState<ColorBlock | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const editRef = useRef<HTMLDivElement>(null);
  const [, forceRender] = useState(0);

  // Keyboard shortcut: Ctrl+Z to undo
  React.useEffect(() => {
    if (!editing) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, undo]);

  // Measure masonry DOM → enter edit
  const enterEdit = useCallback(() => {
    const wrap = canvasRef.current?.querySelector('[data-masonry-wrap]') as HTMLElement | null;
    if (wrap) {
      const wrapRect = wrap.getBoundingClientRect();
      const cards = wrap.querySelectorAll('[data-masonry-card]');
      const m: Record<string, { x: number; y: number; w: number; h: number }> = {};
      cards.forEach((card) => {
        const id = card.getAttribute('data-masonry-card');
        if (!id) return;
        const r = card.getBoundingClientRect();
        m[id] = { x: r.left - wrapRect.left, y: r.top - wrapRect.top, w: r.width, h: r.height };
      });
      setMeasurements(m);
      setPositions((prev) => {
        const p: Record<string, { x: number; y: number }> = {};
        for (const [id, val] of Object.entries(m)) {
          p[id] = prev[id] ?? { x: val.x, y: val.y };
        }
        return p;
      });
    }
    // Restore creative layers from saved state
    setStrokes(savedCanvas.strokes);
    setBlocks(savedCanvas.blocks);
    setStickers(savedCanvas.stickers);
    setTextBoxes(savedCanvas.textBoxes);
    historyRef.current = [];
    setHistoryLen(0);
    setEditing(true);
  }, [savedCanvas]);

  const bringToFront = useCallback((id: string) => {
    setTopZ((p) => { const n = p + 1; setZMap((m) => ({ ...m, [id]: n })); return n; });
  }, []);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    pushHistory();
    setPositions((p) => ({ ...p, [id]: { x, y } }));
  }, [pushHistory]);

  const handleScale = useCallback((id: string, s: number) => {
    pushHistory();
    setScales((p) => ({ ...p, [id]: s }));
  }, [pushHistory]);

  // Coordinate helper for creative tools
  const getPos = useCallback((e: React.PointerEvent) => {
    const el = editRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // Tool pointer handlers (used on the overlay)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!editing || tool === 'select') return;
    const pos = getPos(e);
    if (tool === 'draw') {
      currentStroke.current = { id: `s-${Date.now()}`, points: [pos] };
    } else if (tool === 'shape') {
      setShapeStart(pos);
    } else if (tool === 'sticker' && placingSticker) {
      pushHistory();
      setStickers((prev) => [...prev, { id: `k-${Date.now()}`, x: pos.x, y: pos.y, symbol: placingSticker, scale: 1 }]);
      setPlacingSticker(null);
    } else if (tool === 'text') {
      pushHistory();
      setTextBoxes((prev) => [...prev, {
        id: `t-${Date.now()}`, x: pos.x, y: pos.y, text: '',
        fontSize: textSize, fontFamily: textFont, color: textColor,
      }]);
    }
  }, [editing, tool, placingSticker, getPos, textSize, textFont, textColor]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!editing || tool === 'select') return;
    const pos = getPos(e);
    if (tool === 'draw' && currentStroke.current) {
      currentStroke.current.points.push(pos);
      forceRender((n) => n + 1);
    } else if (tool === 'shape' && shapeStart) {
      setPreviewShape({
        id: 'preview', x: Math.min(shapeStart.x, pos.x), y: Math.min(shapeStart.y, pos.y),
        w: Math.abs(pos.x - shapeStart.x), h: Math.abs(pos.y - shapeStart.y),
        color: shapeColor, opacity: 0.3,
      });
    }
  }, [editing, tool, shapeStart, shapeColor, getPos]);

  const handlePointerUp = useCallback(() => {
    const stroke = currentStroke.current;
    currentStroke.current = null;
    const hasStroke = stroke && stroke.points.length > 1;
    const hasShape = previewShape && previewShape.w > 10 && previewShape.h > 10;
    if (hasStroke || hasShape) pushHistory();
    if (hasStroke) {
      setStrokes((prev) => [...prev, { id: stroke.id, points: [...stroke.points], color: inkColor, width: inkWidth }]);
    }
    if (hasShape) {
      setBlocks((prev) => [...prev, { ...previewShape!, id: `b-${Date.now()}`, opacity: 0.5 }]);
    }
    setPreviewShape(null);
    setShapeStart(null);
  }, [inkColor, inkWidth, previewShape, pushHistory]);

  const handleSave = useCallback(() => {
    const updated = slots.map((s) => ({
      ...s,
      x: positions[s.id]?.x ?? s.x ?? 0,
      y: positions[s.id]?.y ?? s.y ?? 0,
      photoScale: scales[s.id] ?? s.photoScale ?? 1,
    }));
    onSaveLayout?.(updated, { strokes, blocks, stickers, textBoxes });
    setEditing(false);
  }, [slots, positions, scales, strokes, blocks, stickers, textBoxes, onSaveLayout]);

  // Text box management
  const updateTextBox = useCallback((b: TextBox) => {
    setTextBoxes((prev) => prev.map((t) => (t.id === b.id ? b : t)));
  }, []);

  const deleteTextBox = useCallback((id: string) => {
    pushHistory();
    setTextBoxes((prev) => prev.filter((t) => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  }, [selectedTextId, pushHistory]);

  const updateTextProp = useCallback((prop: keyof TextBox, value: string | number) => {
    if (prop === 'fontFamily') setTextFont(value as string);
    if (prop === 'fontSize') setTextSize(value as number);
    if (prop === 'color') setTextColor(value as string);
    if (selectedTextId) {
      setTextBoxes((prev) => prev.map((t) => (t.id === selectedTextId ? { ...t, [prop]: value } : t)));
    }
  }, [selectedTextId]);

  const selectedText = selectedTextId ? textBoxes.find((t) => t.id === selectedTextId) : null;
  const showTextPanel = editing && (tool === 'text' || (tool === 'select' && selectedTextId !== null));

  // Resolved edit-mode data
  const resolved = slots.map((s) => ({
    ...s,
    measured: measurements[s.id] ?? { w: 200, h: 260 },
    pos: positions[s.id] ?? { x: s.x ?? 0, y: s.y ?? 0 },
    photoScale: scales[s.id] ?? s.photoScale ?? 1,
  }));

  // Masonry distribution
  const masonryCols: PosterSlot[][] = [[], [], []];
  const colHeights = [0, 0, 0];
  for (const slot of slots) {
    const shortest = colHeights.indexOf(Math.min(...colHeights));
    masonryCols[shortest].push(slot);
    const h = slot.size === 'small' ? 260 : slot.size === 'medium' ? 420 : 620;
    colHeights[shortest] += h + 40;
  }

  const cursorStyle = !editing ? 'default'
    : tool === 'draw' || tool === 'shape' ? 'crosshair'
    : tool === 'sticker' ? 'copy'
    : tool === 'text' ? 'text'
    : 'default';

  return (
    <div className="min-h-screen bg-bg-page flex">
      {/* Left Toolbar */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ x: -48, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -48, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed left-0 top-14 bottom-0 z-50 w-12 bg-bg-surface/90 backdrop-blur-md border-r border-border-light flex flex-col items-center pt-4 gap-1"
          >
            <ToolBtn icon={<MousePointer2 size={16} />} active={tool === 'select'} onClick={() => setTool('select')} tip="选择" />
            <ToolBtn icon={<Pen size={16} />} active={tool === 'draw'} onClick={() => setTool('draw')} tip="画笔" />
            <ToolBtn icon={<Square size={16} />} active={tool === 'shape'} onClick={() => setTool('shape')} tip="色块" />
            <ToolBtn icon={<Music size={16} />} active={tool === 'sticker'} onClick={() => setTool('sticker')} tip="贴纸" />
            <ToolBtn icon={<Type size={16} />} active={tool === 'text'} onClick={() => setTool('text')} tip="文字" />

            {tool === 'draw' && (
              <div className="mt-4 flex flex-col items-center gap-2">
                {INK_COLORS.map((c) => (
                  <button key={c} onClick={() => setInkColor(c)}
                    className={`w-5 h-5 rounded-full border-2 ${inkColor === c ? 'border-text-heading scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
                <input type="range" min={0.5} max={5} step={0.5} value={inkWidth}
                  onChange={(e) => setInkWidth(Number(e.target.value))}
                  className="w-8 rotate-90 mt-6 accent-accent-muted" />
              </div>
            )}

            {tool === 'shape' && (
              <div className="mt-4 flex flex-col items-center gap-2">
                {SHAPE_COLORS.map((c) => (
                  <button key={c} onClick={() => setShapeColor(c)}
                    className={`w-5 h-5 rounded-sm border-2 ${shapeColor === c ? 'border-text-heading scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            )}

            {tool === 'sticker' && (
              <div className="mt-4 flex flex-col items-center gap-1.5">
                {STICKER_SET.map((s) => (
                  <button key={s} onClick={() => setPlacingSticker(s)}
                    className={`w-7 h-7 flex items-center justify-center text-base ${placingSticker === s ? 'bg-bg-hover' : 'hover:bg-bg-hover'} rounded transition-colors`}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {showTextPanel && (
              <div className="mt-4 flex flex-col items-center gap-2 w-10">
                {FONT_OPTIONS.map((f) => (
                  <button key={f.value} onClick={() => updateTextProp('fontFamily', f.value)}
                    className={`text-[8px] px-1 py-0.5 rounded w-full truncate
                      ${(selectedText ? selectedText.fontFamily : textFont) === f.value ? 'bg-bg-hover text-text-heading' : 'text-text-secondary hover:bg-bg-hover'}`}
                    style={{ fontFamily: f.value }}>
                    {f.label}
                  </button>
                ))}
                <input type="range" min={10} max={48} step={1}
                  value={selectedText ? selectedText.fontSize : textSize}
                  onChange={(e) => updateTextProp('fontSize', Number(e.target.value))}
                  className="w-8 rotate-90 mt-4 accent-accent-muted" />
                <div className="flex flex-col gap-1.5 mt-6">
                  {INK_COLORS.map((c) => (
                    <button key={c} onClick={() => updateTextProp('color', c)}
                      className={`w-4 h-4 rounded-full border-2 ${(selectedText ? selectedText.color : textColor) === c ? 'border-text-heading scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto mb-4 flex flex-col items-center gap-2">
              <div className="w-6 h-px bg-border-light" />
              <button onClick={undo} disabled={historyLen === 0}
                className={`w-10 h-10 flex items-center justify-center rounded transition-colors
                  ${historyLen === 0 ? 'text-text-faint' : 'text-text-faint hover:text-text-body hover:bg-bg-hover'}`}
                title="撤销 (Ctrl+Z)">
                <Undo2 size={16} />
              </button>
              <button onClick={() => { pushHistory(); setStrokes([]); setBlocks([]); setStickers([]); setTextBoxes([]); }}
                className="text-[7px] text-text-faint hover:text-text-body tracking-wider uppercase">清除</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className={`flex-1 flex flex-col min-h-screen ${editing ? 'ml-12' : ''}`}>
        {/* Top bar */}
        <div className="sticky top-14 z-40 bg-bg-page/90 backdrop-blur-md border-b border-border-light/30">
          <div className="px-6 h-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-[9px] tracking-[0.5em] uppercase text-text-secondary">情绪日记</span>
              <div className="w-px h-3 bg-border/30" />
              <span className="text-[8px] text-text-faint">
                {editing ? '编辑模式' : `${slots.filter((s) => s.photoUrl).length} / ${slots.length}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <button onClick={handleSave}
                    className="px-3 h-7 flex items-center gap-1.5 text-[9px] tracking-[0.1em] uppercase bg-text-heading text-bg-primary hover:bg-text-heading/90 transition-colors">
                    <Lock size={10} /> 保存
                  </button>
                  <button onClick={() => setEditing(false)}
                    className="px-3 h-7 text-[9px] tracking-[0.1em] uppercase text-text-secondary hover:text-text-heading transition-colors">
                    取消
                  </button>
                </>
              ) : (
                <button onClick={enterEdit}
                  className="px-3 h-7 flex items-center gap-1.5 text-[9px] tracking-[0.1em] uppercase border border-border/50 text-text-body hover:border-border hover:text-text-heading transition-colors">
                  <Pencil size={10} /> 编辑
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div ref={canvasRef} className="flex-1">
          {editing ? (
            <div
              ref={editRef}
              data-masonry-wrap
              className="max-w-[1400px] mx-auto px-6 py-8 relative"
              style={{ minHeight: 2000 }}
              onClick={() => { if (tool === 'select') setSelectedTextId(null); }}
            >
              {/* Layer 1: Color blocks (below photos) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                {blocks.map((b) => (
                  <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} opacity={b.opacity} />
                ))}
                {previewShape && (
                  <rect x={previewShape.x} y={previewShape.y} width={previewShape.w} height={previewShape.h}
                    fill={previewShape.color} opacity={0.15} stroke={previewShape.color} strokeWidth="1" strokeDasharray="4 4" />
                )}
              </svg>

              {/* Layer 2: Photos */}
              {resolved.map((slot, idx) => (
                <EditPhotoItem
                  key={slot.id}
                  slot={slot}
                  measured={slot.measured}
                  pos={slot.pos}
                  zIndex={zMap[slot.id] || 20 + idx}
                  scale={slot.photoScale}
                  canDrag={tool === 'select'}
                  onEdit={onEdit}
                  onView={onView}
                  onCrop={onCrop}
                  onBringToFront={bringToFront}
                  onDragEnd={handleDragEnd}
                  onScale={handleScale}
                />
              ))}

              {/* Layer 3: Text boxes */}
              {textBoxes.map((box) => (
                <TextBoxItem
                  key={box.id}
                  box={box}
                  selected={selectedTextId === box.id}
                  onSelect={() => setSelectedTextId(box.id)}
                  onUpdate={updateTextBox}
                  onDelete={() => deleteTextBox(box.id)}
                />
              ))}

              {/* Layer 4: Drawing */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 300 }}>
                {strokes.map((s) => (
                  <polyline key={s.id} points={s.points.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none" stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" />
                ))}
                {currentStroke.current && currentStroke.current.points.length > 1 && (
                  <polyline
                    points={currentStroke.current.points.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none" stroke={inkColor} strokeWidth={inkWidth}
                    strokeLinecap="round" strokeLinejoin="round" opacity={0.6}
                  />
                )}
              </svg>

              {/* Layer 5: Stickers */}
              <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 400 }}>
                {stickers.map((s) => (
                  <div key={s.id} className="absolute select-none"
                    style={{ left: s.x, top: s.y, fontSize: 20 * s.scale, opacity: 0.7 }}>{s.symbol}</div>
                ))}
              </div>

              {/* Tool overlay (blocks item interaction when using tools) */}
              {tool !== 'select' && (
                <div
                  className="absolute inset-0"
                  style={{ zIndex: 500, cursor: cursorStyle }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              )}
            </div>
          ) : (
            <div data-masonry-wrap className="max-w-[1400px] mx-auto px-6 py-8 relative">
              <div className="flex gap-[2.5%]">
                {masonryCols.map((col, colIdx) => (
                  <div key={colIdx} className="flex flex-col" style={{ width: `${COL_PCTS[colIdx] * 100}%` }}>
                    {col.map((slot, idx) => (
                      <div key={slot.id} data-masonry-card={slot.id}>
                        <MasonryCard slot={slot} index={colIdx * 10 + idx} onEdit={onEdit} onView={onView} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Saved creative layers (view mode, non-interactive) */}
              {(savedCanvas.blocks.length > 0 || savedCanvas.strokes.length > 0) && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                  {savedCanvas.blocks.map((b) => (
                    <rect key={b.id} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} opacity={b.opacity} />
                  ))}
                  {savedCanvas.strokes.map((s) => (
                    <polyline key={s.id} points={s.points.map((p) => `${p.x},${p.y}`).join(' ')}
                      fill="none" stroke={s.color} strokeWidth={s.width} strokeLinecap="round" strokeLinejoin="round" />
                  ))}
                </svg>
              )}
              {savedCanvas.stickers.length > 0 && (
                <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 400 }}>
                  {savedCanvas.stickers.map((s) => (
                    <div key={s.id} className="absolute select-none"
                      style={{ left: s.x, top: s.y, fontSize: 20 * s.scale, opacity: 0.7 }}>{s.symbol}</div>
                  ))}
                </div>
              )}
              {savedCanvas.textBoxes.length > 0 && (
                <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 150 }}>
                  {savedCanvas.textBoxes.map((box) => (
                    <div key={box.id} className="absolute p-1 whitespace-pre-wrap leading-snug select-none"
                      style={{ left: box.x, top: box.y, fontSize: box.fontSize, fontFamily: box.fontFamily, color: box.color }}>
                      {box.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-16 mb-12 flex justify-between items-center">
                <span className="text-[8px] tracking-[0.4em] uppercase text-text-faint select-none">slices of life</span>
                <div className="w-6 h-[0.5px] bg-border" />
              </div>
            </div>
          )}
        </div>

        {/* Edit mode hint */}
        {editing && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-text-heading/80 backdrop-blur-sm text-bg-primary text-[9px] tracking-[0.15em] uppercase whitespace-nowrap">
            {tool === 'select' && '选择 — 拖拽移动 · 边框缩放'}
            {tool === 'draw' && '画笔 — 按住绘制 · 左侧换色'}
            {tool === 'shape' && '色块 — 拖拽创建 · 左侧换色'}
            {tool === 'sticker' && '贴纸 — 选符号 · 点画布放置'}
            {tool === 'text' && '文字 — 点击放置 · 双击编辑 · 左侧换字体'}
          </div>
        )}
      </div>
    </div>
  );
}

export default MayPosterGallery;
