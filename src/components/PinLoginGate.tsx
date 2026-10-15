'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Delete, Lock, AlertCircle, ArrowRight } from 'lucide-react';

interface PinLoginGateProps {
  onAuthenticated: () => void;
}

export function PinLoginGate({ onAuthenticated }: PinLoginGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);

  const handleVerify = useCallback(async (pinToVerify: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinToVerify }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('event_auth_pin', 'verified');
        onAuthenticated();
      } else {
        setError(data.error || 'Pogrešan PIN');
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin('');
      }
    } catch {
      setError('Greška pri provjeri PIN-a');
      setPin('');
    } finally {
      setIsVerifying(false);
    }
  }, [onAuthenticated]);

  // Handle digit press
  const handleDigit = useCallback((digit: string) => {
    if (isVerifying) return;
    setError(null);
    setPin((prev) => {
      if (prev.length >= 4) return prev;
      const next = prev + digit;
      if (next.length === 4) {
        // Auto-verify when 4 digits reached
        setTimeout(() => handleVerify(next), 50);
      }
      return next;
    });
  }, [isVerifying, handleVerify]);

  // Handle delete
  const handleDelete = useCallback(() => {
    if (isVerifying) return;
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  }, [isVerifying]);

  // Listen for physical keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDelete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center p-4 overflow-y-auto">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 w-96 h-96 bg-[#013695]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 w-72 h-72 bg-[#FC661B]/5 rounded-full blur-3xl pointer-events-none" />
      {/* 1. FURT Logo */}
      <div className="flex items-center justify-center w-full px-2">
        <img
          src="/FURT.png"
          alt="FURT - Day Drinking Society Presents"
          className="h-24 sm:h-28 w-auto object-contain max-w-[410px]"
        />
      </div>

      {/* 2. POOR DECISIONS Image */}
      <div className="flex items-center justify-center w-full px-2">
        <img
          src="/poor_decisions.png"
          alt="POOR DECISIONS"
          className="h-20 w-auto object-contain max-w-[240px]"
        />
      </div>

      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-300/50 p-6 sm:p-7 relative z-10 flex flex-col items-center text-center space-y-5 my-8">

        {/* Brand Logos: FURT -> POOR DECISIONS -> Prompt */}

        {/* Error message if invalid PIN */}
        {error ? (
          <div className="flex items-center gap-1.5 text-xs text-red-700 font-bold bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="space-y-3 flex flex-col items-center w-full">
            <p className="text-xs text-slate-500 pt-0.5 flex items-center justify-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#FC661B]" />
              <span>Unesi PIN za prijavu</span>
            </p>
          </div>

        )}

        {/* 4 PIN Dots */}
        <div className={`flex items-center justify-center gap-3.5 py-1 transition-transform ${shake ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${isFilled
                  ? 'bg-[#FC661B] border-[#FC661B] scale-110 shadow-md shadow-[#FC661B]/40'
                  : 'bg-slate-100 border-slate-300'
                  }`}
              />
            );
          })}
        </div>

        {/* Numeric Touch Keypad */}
        <div className="w-full grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isVerifying}
              onClick={() => handleDigit(digit)}
              className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-blue-50 border border-slate-200 text-slate-900 font-extrabold text-xl flex items-center justify-center transition-all active:scale-95 shadow-xs hover:border-slate-300 active:border-[#013695]"
            >
              {digit}
            </button>
          ))}

          {/* Spacer / Clear button */}
          <button
            type="button"
            disabled={pin.length === 0 || isVerifying}
            onClick={() => setPin('')}
            className="h-13 rounded-2xl bg-slate-100/70 hover:bg-slate-200/70 disabled:opacity-30 border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center transition-all active:scale-95"
          >
            Obriši
          </button>

          {/* Digit 0 */}
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => handleDigit('0')}
            className="h-13 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-blue-50 border border-slate-200 text-slate-900 font-extrabold text-xl flex items-center justify-center transition-all active:scale-95 shadow-xs hover:border-slate-300 active:border-[#013695]"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            disabled={pin.length === 0 || isVerifying}
            onClick={handleDelete}
            className="h-13 rounded-2xl bg-slate-100/70 hover:bg-slate-200/70 disabled:opacity-30 border border-slate-200 text-slate-600 flex items-center justify-center transition-all active:scale-95"
          >
            <Delete className="w-5 h-5 text-slate-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
