'use client';

import React, { useState } from 'react';
import { X, Upload, Download, FileText, CheckCircle2, AlertCircle, Link2, Sparkles } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (params: { url?: string; csvText?: string; mode: 'append' | 'replace' }) => Promise<{ count: number; replaced: boolean }>;
}

export function CsvImportModal({
  isOpen,
  onClose,
  onImport,
}: CsvImportModalProps) {
  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'paste'>('url');
  const [url, setUrl] = useState('https://docs.google.com/spreadsheets/d/1ly1Okwx_HDb41s4PGGBd6ZQfs10pyw8lab9rDMxCbI8/edit');
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text || '');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      if (activeTab === 'url') {
        if (!url.trim()) {
          throw new Error('Unesite link na Google tablicu ili CSV datoteku.');
        }
        const res = await onImport({ url: url.trim(), mode });
        setSuccessMsg(`Uspješno uvezeno ${res.count} gostiju direktno s linka!`);
      } else {
        if (!csvText.trim()) {
          throw new Error('Odaberite datoteku ili zalijepite CSV tekst.');
        }
        const res = await onImport({ csvText, mode });
        setSuccessMsg(`Uspješno uvezeno ${res.count} gostiju!`);
      }

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Greška pri uvozu podataka.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl rounded-t-3xl sm:rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Mobile Pull Handle Indicator */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden mb-1" />

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#013695]/10 border border-[#013695]/20 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 text-[#013695]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-none">Uvoz popisa gostiju</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Direktan uvoz iz Google Sheetsa ili CSV-a</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors"
            aria-label="Zatvori"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Tab Selector - 48px height touch target */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs sm:text-sm h-12">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`h-full rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              activeTab === 'url'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-4 h-4 text-[#FC661B]" />
            <span className="truncate">Google Sheets</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`h-full rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              activeTab === 'file'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-[#013695]" />
            <span className="truncate">CSV Datoteka</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`h-full rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
              activeTab === 'paste'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="truncate">Zalijepi</span>
          </button>
        </div>

        {/* Tab 1: Google Sheets URL */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link na Google tablicu:
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1ly1Okwx_HDb41s4PGGBd6ZQfs10pyw8lab9rDMxCbI8/edit"
                className="w-full h-12 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-[#FC661B] focus:bg-white transition-all shadow-xs"
              />
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                💡 <strong>Savjet:</strong> Tablica mora imati uključeno <em>"Anyone with the link can view"</em>. Aplikacija sama automatski preuzima CSV export i stupce.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUrl('https://docs.google.com/spreadsheets/d/1ly1Okwx_HDb41s4PGGBd6ZQfs10pyw8lab9rDMxCbI8/edit')}
              className="h-10 px-3 rounded-xl bg-blue-50 border border-blue-200/80 text-xs font-bold text-[#013695] hover:bg-blue-100 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FC661B]" />
              <span>Postavi zadanu tablicu (POOR DECISIONS guest lista)</span>
            </button>
          </div>
        )}

        {/* Tab 2: File upload */}
        {activeTab === 'file' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-slate-800">Preuzmi predložak:</p>
                <p className="text-[11px] text-slate-500">CSV sa stupcima za ime, kategoriju i stol.</p>
              </div>
              <a
                href="/api/export/template"
                download
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#013695] border border-slate-200 font-bold shrink-0 transition-colors shadow-xs active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Predložak</span>
              </a>
            </div>

            <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100/70 transition-colors active:scale-[0.99]">
              <FileText className="w-8 h-8 text-slate-400" />
              <span className="text-xs sm:text-sm font-bold text-slate-700 text-center">
                {fileName ? fileName : 'Klikni ovdje za odabir .csv datoteke'}
              </span>
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Tab 3: Paste text */}
        {activeTab === 'paste' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Zalijepi CSV sadržaj iz Excela ili Notepada:
            </label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={4}
              placeholder="Ime i prezime,Rezervacija preko,Ulaznica,Stol,Napomena&#10;Pero Perić,Ela,Plaća,Stol 1,&#10;Maja Majić,Dupli,Gratis,Stol 2,VIP"
              className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 resize-none"
            />
          </div>
        )}

        {/* Import Mode: Append vs Replace */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Način uvoza:
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMode('append')}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-98 ${
                mode === 'append'
                  ? 'bg-blue-50 text-blue-900 border-blue-300 shadow-xs ring-1 ring-blue-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold text-[#013695]">Dodaj nove (Preporučeno)</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Dodaje nove ljude bez brisanja postojećih.</div>
            </button>
            <button
              type="button"
              onClick={() => setMode('replace')}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-98 ${
                mode === 'replace'
                  ? 'bg-red-50 text-red-900 border-red-300 shadow-xs ring-1 ring-red-500/20'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="font-bold text-red-600">Zamijeni sve</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Briše dosadašnji popis i kreće ispočetka.</div>
            </button>
          </div>
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="h-12 px-5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs sm:text-sm font-bold transition-all active:scale-95"
          >
            Odustani
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmImport}
            className="h-12 px-6 rounded-xl bg-[#FC661B] hover:bg-[#e5530b] disabled:opacity-50 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#FC661B]/25 transition-all flex items-center gap-2 active:scale-95"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            <span>
              {isSubmitting
                ? 'Učitavam s linka...'
                : activeTab === 'url'
                ? 'UČITAJ S LINKA'
                : 'UVEZI PODATKE'}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
