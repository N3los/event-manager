'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useDrag } from '@use-gesture/react';

interface BottomSheetWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

export function BottomSheetWrapper({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  className = '',
}: BottomSheetWrapperProps) {
  const y = useMotionValue(0);

  // Dynamic backdrop opacity tied to sheet pull down distance
  const backdropOpacity = useTransform(y, [0, 250], [0.5, 0.05]);

  // Reset y when opened
  useEffect(() => {
    if (isOpen) {
      y.set(0);
    }
  }, [isOpen, y]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Bind drag gesture to notch & header
  const bindDrag = useDrag(
    ({ down, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
      // Disallow dragging upwards past the top
      if (my < 0) {
        y.set(0);
        return;
      }

      if (down) {
        y.set(my);
      } else {
        // If dragged down past 90px or fast downward flick
        if (my > 90 || (vy > 0.45 && dy > 0)) {
          // Subtle haptic tick on dismissal
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(20);
            } catch {}
          }

          animate(y, 600, {
            duration: 0.2,
            ease: 'easeOut',
            onComplete: () => {
              onClose();
              y.set(0);
            },
          });
        } else {
          // Spring bounce back to 0
          animate(y, 0, {
            type: 'spring',
            stiffness: 450,
            damping: 32,
          });
        }
      }
    },
    {
      axis: 'y',
      bounds: { top: 0 },
      rubberband: true,
      filterTaps: true,
    }
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden"
      style={{
        overscrollBehavior: 'contain',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Dimmed Backdrop */}
      <motion.div
        className="fixed inset-0 bg-slate-900 backdrop-blur-xs"
        style={{ opacity: backdropOpacity }}
        onClick={onClose}
      />

      {/* Floating Modal / Bottom Sheet */}
      <motion.div
        style={{ y }}
        className={`w-full ${maxWidth} rounded-t-3xl sm:rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 modal-bottom-safe shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto z-10 relative ${className}`}
      >
        {/* Generous Drag Notch Zone (touch-action: none prevents Android pull-to-refresh) */}
        <div
          {...bindDrag()}
          role="button"
          tabIndex={0}
          aria-label="Povuci dolje ili klikni za zatvaranje"
          onClick={onClose}
          className="w-full pt-2 pb-3.5 flex justify-center items-center cursor-grab active:cursor-grabbing select-none sm:hidden -mt-2 group touch-none"
          style={{ touchAction: 'none' }}
        >
          <div className="w-12 h-1.5 bg-slate-300 group-hover:bg-slate-400 group-active:bg-slate-500 rounded-full transition-colors" />
        </div>

        {/* Content */}
        {children}
      </motion.div>
    </div>
  );
}
