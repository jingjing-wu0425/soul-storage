'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCw, FlipHorizontal } from 'lucide-react';
import type { PosterSlot } from './may-poster-gallery';

interface PosterCropModalProps {
  slot: PosterSlot;
  onCrop: (id: string, croppedUrl: string) => void;
  onClose: () => void;
}

export function PosterCropModal({ slot, onCrop, onClose }: PosterCropModalProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });

  // Crop rect in image coordinates
  const [crop, setCrop] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'nw' | 'ne' | 'sw' | 'se'>('move');
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0, cw: 0, ch: 0 });
  const [flipH, setFlipH] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Scale factor: image coords → display coords
  const [displayScale, setDisplayScale] = useState(1);

  useEffect(() => {
    if (!imgRef.current || !imgLoaded) return;
    const img = imgRef.current;
    const container = containerRef.current;
    if (!container) return;

    const maxW = container.clientWidth;
    const maxH = container.clientHeight;
    const scale = Math.min(maxW / naturalSize.w, maxH / naturalSize.h, 1);
    setDisplayScale(scale);

    // Initialize crop to full image
    setCrop({ x: 0, y: 0, w: naturalSize.w, h: naturalSize.h });
  }, [imgLoaded, naturalSize]);

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    setImgLoaded(true);
  }, []);

  // Convert mouse position to image coordinates
  const toImgCoords = useCallback((clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return { x: 0, y: 0 };
    const rect = img.getBoundingClientRect();
    const scale = displayScale;
    return {
      x: Math.max(0, Math.min(naturalSize.w, (clientX - rect.left) / scale)),
      y: Math.max(0, Math.min(naturalSize.h, (clientY - rect.top) / scale)),
    };
  }, [displayScale, naturalSize]);

  const handlePointerDown = useCallback((e: React.PointerEvent, type: 'move' | 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    setDragType(type);
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y, cw: crop.w, ch: crop.h };
  }, [crop]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const dx = (e.clientX - dragStart.current.mx) / displayScale;
    const dy = (e.clientY - dragStart.current.my) / displayScale;
    const s = dragStart.current;
    const minSize = 40;

    if (dragType === 'move') {
      const nx = Math.max(0, Math.min(naturalSize.w - s.cw, s.cx + dx));
      const ny = Math.max(0, Math.min(naturalSize.h - s.ch, s.cy + dy));
      setCrop((prev) => ({ ...prev, x: nx, y: ny }));
    } else {
      let nx = s.cx, ny = s.cy, nw = s.cw, nh = s.ch;

      if (dragType === 'se') {
        nw = Math.max(minSize, s.cw + dx);
        nh = Math.max(minSize, s.ch + dy);
      } else if (dragType === 'sw') {
        nx = s.cx + dx;
        nw = Math.max(minSize, s.cw - dx);
        nh = Math.max(minSize, s.ch + dy);
      } else if (dragType === 'ne') {
        nw = Math.max(minSize, s.cw + dx);
        ny = s.cy + dy;
        nh = Math.max(minSize, s.ch - dy);
      } else if (dragType === 'nw') {
        nx = s.cx + dx;
        nw = Math.max(minSize, s.cw - dx);
        ny = s.cy + dy;
        nh = Math.max(minSize, s.ch - dy);
      }

      // Clamp
      nx = Math.max(0, nx);
      ny = Math.max(0, ny);
      nw = Math.min(nw, naturalSize.w - nx);
      nh = Math.min(nh, naturalSize.h - ny);

      setCrop({ x: nx, y: ny, w: nw, h: nh });
    }
  }, [dragging, dragType, displayScale, naturalSize]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Apply crop and generate new image
  const handleCrop = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = crop.w;
    canvas.height = crop.h;

    // Apply transforms
    ctx.save();
    if (flipH) {
      ctx.translate(crop.w, 0);
      ctx.scale(-1, 1);
    }
    if (rotation) {
      ctx.translate(crop.w / 2, crop.h / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-crop.w / 2, -crop.h / 2);
    }

    // Load image into canvas
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
      ctx.restore();

      // For local paths, use directly
      if (slot.photoUrl?.startsWith('/uploads/')) {
        onCrop(slot.id, slot.photoUrl);
        return;
      }

      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            onCrop(slot.id, url);
          } else {
            onCrop(slot.id, slot.photoUrl || '');
          }
        }, 'image/jpeg', 0.92);
      } catch {
        // Cross-origin fallback: just close
        onCrop(slot.id, slot.photoUrl || '');
      }
    };
    img.src = slot.photoUrl || '';
  }, [crop, flipH, rotation, slot, onCrop]);

  // Display coords
  const dc = {
    x: crop.x * displayScale,
    y: crop.y * displayScale,
    w: crop.w * displayScale,
    h: crop.h * displayScale,
  };

  const handleSize = 10;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-bg-overlay w-full max-w-3xl mx-4 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
            <span className="text-[10px] tracking-[0.3em] uppercase text-text-faint">裁剪</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setRotation((r) => (r + 90) % 360)}
                className="w-7 h-7 flex items-center justify-center text-text-faint hover:text-text-body transition-colors">
                <RotateCw size={14} />
              </button>
              <button onClick={() => setFlipH((f) => !f)}
                className="w-7 h-7 flex items-center justify-center text-text-faint hover:text-text-body transition-colors">
                <FlipHorizontal size={14} />
              </button>
              <div className="w-px h-4 bg-border-light mx-1" />
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center text-text-faint hover:text-text-body transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Image area */}
          <div ref={containerRef}
            className="relative bg-bg-muted h-[500px] flex items-center justify-center overflow-hidden select-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={slot.photoUrl}
              alt=""
              onLoad={handleImageLoad}
              className="max-w-full max-h-full object-contain pointer-events-none"
              style={{
                transform: `scaleX(${flipH ? -1 : 1}) rotate(${rotation}deg)`,
              }}
              crossOrigin="anonymous"
            />

            {/* Crop overlay */}
            {imgLoaded && (
              <>
                {/* Dark overlay outside crop */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    boxShadow: `0 0 0 9999px rgba(0,0,0,0.5)`,
                    clipPath: `inset(${dc.y}px ${9999 - dc.x - dc.w}px ${9999 - dc.y - dc.h}px ${dc.x}px)`,
                  }}
                />

                {/* Crop border */}
                <div className="absolute border border-white/80 pointer-events-none"
                  style={{ left: dc.x, top: dc.y, width: dc.w, height: dc.h }}>
                  {/* Grid lines (rule of thirds) */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/30" />
                    <div className="absolute left-2/3 top-0 bottom-0 w-px bg-white/30" />
                    <div className="absolute top-1/3 left-0 right-0 h-px bg-white/30" />
                    <div className="absolute top-2/3 left-0 right-0 h-px bg-white/30" />
                  </div>
                </div>

                {/* Drag handles */}
                {/* Move area */}
                <div className="absolute cursor-move"
                  style={{ left: dc.x + 10, top: dc.y + 10, width: dc.w - 20, height: dc.h - 20 }}
                  onPointerDown={(e) => handlePointerDown(e, 'move')}
                />

                {/* Corner handles */}
                {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => {
                  const hx = corner.includes('w') ? dc.x : dc.x + dc.w;
                  const hy = corner.includes('n') ? dc.y : dc.y + dc.h;
                  const cursor = corner === 'nw' || corner === 'se' ? 'nwse-resize' : 'nesw-resize';
                  return (
                    <div key={corner}
                      className={`absolute bg-bg-overlay border border-border ${dragging ? 'pointer-events-none' : ''}`}
                      style={{
                        left: hx - handleSize / 2,
                        top: hy - handleSize / 2,
                        width: handleSize,
                        height: handleSize,
                        cursor,
                      }}
                      onPointerDown={(e) => handlePointerDown(e, corner)}
                    />
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between">
            <span className="text-[8px] text-text-faint font-mono">
              {Math.round(crop.w)} × {Math.round(crop.h)}
            </span>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="px-4 py-1.5 text-[9px] tracking-[0.15em] uppercase text-text-faint hover:text-text-body transition-colors">
                取消
              </button>
              <button onClick={handleCrop}
                className="px-4 py-1.5 text-[9px] tracking-[0.15em] uppercase text-text-body
                  border border-border hover:bg-bg-hover transition-colors
                  flex items-center gap-1.5">
                <Check size={12} />
                应用
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
