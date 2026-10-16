'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useDrag } from '@use-gesture/react';
import { Check, Clock, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Guest } from '@/lib/types';

interface GuestSwipeCardProps {
  guest: Guest;
  onSelect: () => void;
  onCheckIn: (id: number) => Promise<void> | void;
}

export function GuestSwipeCard({
  guest,
  onSelect,
  onCheckIn,
}: GuestSwipeCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // Background dynamic green styling as card is pulled right
  // Alpha starts at 0, ramps up cleanly to 1.0 as it reaches 50% threshold
  const bgOpacity = useTransform(x, [0, 40, 160], [0, 0.4, 1]);
  const contentOpacity = useTransform(x, [15, 60, 140], [0, 0.7, 1]);
  const iconScale = useTransform(x, [0, 80, 180], [0.8, 1.1, 1.25]);

  const bind = useDrag(
    ({ down, movement: [mx], velocity: [vx], direction: [dx], cancel, tap }) => {
      // If already checked in or already triggered, ignore drag
      if (guest.is_checked_in || hasTriggered) return;

      // Tap handling: if user simply tapped, don't drag
      if (tap) return;

      const cardWidth = cardRef.current?.offsetWidth || 350;
      const threshold = cardWidth * 0.5;

      if (down) {
        setIsSwiping(true);
        // Only allow pulling to the right (positive mx)
        if (mx > 0) {
          x.set(mx);
        } else {
          x.set(0);
        }
      } else {
        setIsSwiping(false);
        const currentX = x.get();

        // 50% swipe right or high rightward flick velocity
        if (currentX >= threshold || (currentX > 60 && vx > 0.6 && dx > 0)) {
          setHasTriggered(true);

          // Subtle native haptic tick
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            try {
              navigator.vibrate(30);
            } catch {}
          }

          // Animate card fully off to the right
          animate(x, cardWidth + 40, {
            duration: 0.22,
            ease: 'easeOut',
            onComplete: async () => {
              try {
                await onCheckIn(guest.id);
              } finally {
                // Reset position after status updates
                setTimeout(() => {
                  x.set(0);
                  setHasTriggered(false);
                }, 150);
              }
            },
          });
        } else {
          // Bounce back to left (0) with smooth spring physics
          animate(x, 0, {
            type: 'spring',
            stiffness: 450,
            damping: 32,
          });
        }
      }
    },
    {
      axis: 'x',
      filterTaps: true,
      bounds: { left: 0 },
      rubberband: true,
      enabled: !guest.is_checked_in,
    }
  );

  return (
    <div
      ref={cardRef}
      {...(guest.is_checked_in ? {} : bind())}
      className="relative rounded-2xl overflow-hidden select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Background Action Layer (Revealed on Swipe Right) */}
      {!guest.is_checked_in && (
        <motion.div
          className="absolute inset-0 rounded-2xl flex items-center justify-between px-4 sm:px-6 pointer-events-none"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 1)', // emerald-500
            opacity: bgOpacity,
          }}
        >
          {/* Left Action Indicator */}
          <motion.div
            className="flex items-center gap-2 text-white font-extrabold text-xs sm:text-sm tracking-wide drop-shadow-xs"
            style={{ opacity: contentOpacity }}
          >
            <motion.div style={{ scale: iconScale }}>
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
            </motion.div>
            <span>
              {guest.ticket_type === 'gratis'
                ? 'Potvrdi ulaz (Gratis)'
                : 'Potvrdi & Naplati (39 €)'}
            </span>
          </motion.div>

          {/* Right helper cue */}
          <motion.span
            className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider hidden sm:inline"
            style={{ opacity: contentOpacity }}
          >
            Pusti za potvrdu →
          </motion.span>
        </motion.div>
      )}

      {/* Foreground Draggable Card */}
      <motion.div
        style={{ x }}
        onClick={() => {
          // Only open details if we didn't perform a swipe gesture
          if (!isSwiping && x.get() < 5) {
            onSelect();
          }
        }}
        className={`group cursor-pointer rounded-2xl border transition-colors px-3.5 py-3 sm:py-3.5 flex items-center justify-between gap-3 min-h-[58px] relative ${
          guest.is_checked_in
            ? 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/70'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs active:shadow-none'
        }`}
      >
        {/* Left: Status Indicator Dot + Guest Name & Clean Meta line */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Minimal Status Cue */}
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
              guest.is_checked_in
                ? 'bg-emerald-500 ring-4 ring-emerald-100'
                : guest.ticket_type === 'gratis'
                ? 'bg-blue-500 ring-4 ring-blue-50'
                : 'bg-[#FC661B] ring-4 ring-orange-50'
            }`}
          />

          {/* Name & Meta Line */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-sm sm:text-base font-bold truncate leading-tight ${
                  guest.is_checked_in
                    ? 'text-slate-500'
                    : 'text-slate-900 group-hover:text-[#013695]'
                }`}
              >
                {guest.name}
              </span>

              {guest.reservation_status === 'na_cekanju' && (
                <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  na čekanju
                </span>
              )}
            </div>

            {/* Clean meta line */}
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 flex-wrap">
              <span className="font-medium text-slate-600">
                {guest.table_name ? guest.table_name : 'Bez stola'}
              </span>
              <span className="text-slate-300">•</span>
              <span>od {guest.team}</span>
              {guest.note && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-800 font-medium italic truncate max-w-[130px] sm:max-w-xs">
                    💬 {guest.note}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Crisp Ticket Badge / Arrival State */}
        <div className="shrink-0 flex flex-col items-end justify-center min-w-[80px]">
          {guest.is_checked_in ? (
            <>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                <span>U dvorani</span>
              </div>
              {guest.checked_in_at && (
                <span className="text-[11px] font-bold text-slate-500 font-mono mt-1 flex items-center gap-1 tracking-tight">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>
                    {new Date(guest.checked_in_at).toLocaleTimeString('hr-HR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                  guest.ticket_type === 'gratis'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {guest.ticket_type === 'gratis' ? 'Gratis' : '39 €'}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
