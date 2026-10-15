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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-[#111827] border border-[#1e293b] p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#013695]/30 border border-[#013695] flex items-center justify-center">
              <Upload className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Uvoz popisa gostiju</h3>
              <p className="text-[11px] text-slate-400">Direktan uvoz iz Google Sheetsa ili CSV-a</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Tab Selector */}
        <div className="flex p-1 rounded-xl bg-[#0c1220] border border-[#1e293b] text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'url'
                ? 'bg-[#013695] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Link2 className="w-3.5 h-3.5 text-[#FC661B]" />
            <span>Google Sheets link</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'file'
                ? 'bg-[#013695] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>CSV Datoteka</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'paste'
                ? 'bg-[#013695] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Zalijepi tekst</span>
          </button>
        </div>

        {/* Tab 1: Google Sheets URL */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link na Google tablicu:
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/1ly1Okwx_HDb41s4PGGBd6ZQfs10pyw8lab9rDMxCbI8/edit"
                className="w-full h-11 px-3.5 rounded-xl bg-[#151f33] border border-[#1e293b] text-xs text-white placeholder-slate-500 outline-none focus:border-[#FC661B]"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                💡 <strong>Savjet:</strong> Tablica mora imati uključeno <em>"Anyone with the link can view"</em>. Aplikacija sama automatski preuzima CSV export i stupce.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUrl('https://docs.google.com/spreadsheets/d/1ly1Okwx_HDb41s4PGGBd6ZQfs10pyw8lab9rDMxCbI8/edit')}
              className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-[#FC661B]" />
              Postavi tvoju tablicu (POOR DECISIONS guest lista)
            </button>
          </div>
        )}

        {/* Tab 2: File upload */}
        {activeTab === 'file' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-[#151f33] border border-[#1e293b] flex items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-slate-200">Preuzmi predložak:</p>
                <p className="text-[11px] text-slate-400">CSV sa stupcima za ime, kategoriju i stol.</p>
              </div>
              <a
                href="/api/export/template"
                download
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c2842] hover:bg-[#25334d] text-blue-400 border border-blue-500/30 font-semibold shrink-0 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Predložak
              </a>
            </div>

            <label className="border-2 border-dashed border-[#1e293b] hover:border-slate-600 rounded-xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-[#151f33]/40 hover:bg-[#151f33] transition-colors">
              <FileText className="w-8 h-8 text-slate-500" />
              <span className="text-xs font-semibold text-slate-300">
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Zalijepi CSV sadržaj iz Excela ili Notepada:
            </label>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              rows={4}
              placeholder="Ime i prezime,Rezervacija preko,Ulaznica,Stol,Napomena&#10;Pero Perić,Ela,Plaća,Stol 1,&#10;Maja Majić,Dupli,Gratis,Stol 2,VIP"
              className="w-full p-2.5 rounded-xl bg-[#151f33] border border-[#1e293b] font-mono text-[11px] text-white placeholder-slate-500 outline-none focus:border-blue-500 resize-none"
            />
          </div>
        )}

        {/* Import Mode: Append vs Replace */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Način uvoza:
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setMode('append')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                mode === 'append'
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                  : 'bg-[#151f33] text-slate-400 border-[#1e293b]'
              }`}
            >
              <div className="font-bold">Dodaj nove (Preporučeno)</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Dodaje nove ljude bez brisanja postojećih.</div>
            </button>
            <button
              type="button"
              onClick={() => setMode('replace')}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                mode === 'replace'
                  ? 'bg-red-600/20 text-red-300 border-red-500/50'
                  : 'bg-[#151f33] text-slate-400 border-[#1e293b]'
              }`}
            >
              <div className="font-bold text-red-400">Zamijeni sve</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Briše dosadašnji popis i kreće ispočetka.</div>
            </button>
          </div>
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 border-t border-[#1e293b] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#1c2842] text-slate-300 hover:text-white text-xs font-semibold"
          >
            Odustani
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirmImport}
            className="px-5 py-2.5 rounded-xl bg-[#FC661B] hover:bg-[#e5530b] disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-[#FC661B]/30 transition-all flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
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
