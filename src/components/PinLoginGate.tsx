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
    <div className="fixed inset-0 z-50 bg-[#090d16] flex flex-col items-center justify-center p-4">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 w-96 h-96 bg-[#013695]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 w-72 h-72 bg-[#FC661B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xs relative z-10 flex flex-col items-center text-center space-y-6">
        
        {/* Brand Icon & Heading */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#013695] to-[#024ec4] border border-[#024ec4] shadow-2xl shadow-[#013695]/50 flex items-center justify-center mx-auto ring-4 ring-white/5">
            <Sparkles className="w-8 h-8 text-[#FC661B]" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              POOR DECISIONS
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#FC661B]" />
              <span>Unesi PIN za prijavu</span>
            </p>
          </div>
        </div>

        {/* 4 PIN Dots */}
        <div className={`flex items-center justify-center gap-4 py-2 transition-transform ${shake ? 'animate-bounce' : ''}`}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  isFilled
                    ? 'bg-[#FC661B] border-[#FC661B] scale-110 shadow-lg shadow-[#FC661B]/50'
                    : 'bg-[#151f33] border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Error message if invalid PIN */}
        {error ? (
          <div className="flex items-center gap-1.5 text-xs text-red-400 font-bold bg-red-950/40 px-3 py-1.5 rounded-xl border border-red-500/30 animate-fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="h-7" /> /* Spacer to prevent layout shift */
        )}

        {/* Numeric Touch Keypad */}
        <div className="w-full grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              disabled={isVerifying}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-[#151f33] hover:bg-[#1f2c47] active:bg-[#013695] border border-[#1e293b] text-white font-extrabold text-xl flex items-center justify-center transition-all active:scale-95 shadow-md shadow-black/40"
            >
              {digit}
            </button>
          ))}

          {/* Spacer / Clear button */}
          <button
            type="button"
            disabled={pin.length === 0 || isVerifying}
            onClick={() => setPin('')}
            className="h-14 rounded-2xl bg-[#101726] hover:bg-[#151f33] disabled:opacity-30 border border-[#1e293b] text-slate-400 font-bold text-xs flex items-center justify-center transition-all active:scale-95"
          >
            Obriši
          </button>

          {/* Digit 0 */}
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-[#151f33] hover:bg-[#1f2c47] active:bg-[#013695] border border-[#1e293b] text-white font-extrabold text-xl flex items-center justify-center transition-all active:scale-95 shadow-md shadow-black/40"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            disabled={pin.length === 0 || isVerifying}
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-[#101726] hover:bg-[#151f33] disabled:opacity-30 border border-[#1e293b] text-slate-300 flex items-center justify-center transition-all active:scale-95"
          >
            <Delete className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Subtle Hint */}
        <p className="text-[11px] text-slate-500 font-mono">
          Zadani PIN: <span className="text-slate-400 font-bold">1234</span>
        </p>

      </div>
    </div>
  );
}
