'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { PosterSlot } from './may-poster-gallery';

interface PosterViewModalProps {
  slot: PosterSlot;
  onClose: () => void;
}

export function PosterViewModal({ slot, onClose }: PosterViewModalProps) {
  if (!slot.photoUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center
          bg-bg-overlay/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-5xl mx-6 h-[80vh] flex overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Left: Image */}
          <div className="w-[55%] h-full flex items-center justify-center bg-bg-subtle p-8 lg:p-12">
            <div className="relative w-full h-full">
              <img
                src={slot.photoUrl}
                alt={slot.title || ''}
                className="w-full h-full object-contain transition-all duration-700"
              />
              {/* Corner brackets */}
              <div className="absolute -top-2 -left-2 w-5 h-5 border-t border-l border-black/15 pointer-events-none" />
              <div className="absolute -bottom-2 -right-2 w-5 h-5 border-b border-r border-black/15 pointer-events-none" />
            </div>
          </div>

          {/* Right: Text */}
          <div className="w-[45%] h-full flex flex-col p-8 lg:p-12 relative overflow-y-auto">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-7 h-7 flex items-center justify-center
                text-text-faint hover:text-text-body transition-colors"
            >
              <X size={16} />
            </button>

            {/* Date */}
            <span className="text-[9px] tracking-[0.3em] font-mono italic text-text-faint uppercase mb-6">
              {slot.date || '—'}
            </span>

            {/* Fine line */}
            <div className="w-8 h-[0.5px] bg-text-heading mb-8" />

            {/* Title */}
            <h2 className="text-2xl lg:text-3xl font-extralight text-text-heading tracking-tight leading-snug mb-6">
              {slot.title || 'Untitled'}
            </h2>

            {/* Content */}
            {slot.content && (
              <p className="text-sm text-text-body leading-relaxed whitespace-pre-wrap">
                {slot.content}
              </p>
            )}

            {/* Bottom decoration */}
            <div className="mt-auto pt-8">
              <div className="w-4 h-[0.5px] bg-border-light mb-3" />
              <span className="text-[8px] tracking-[0.3em] text-text-faint uppercase">
                The Soul Storage
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
