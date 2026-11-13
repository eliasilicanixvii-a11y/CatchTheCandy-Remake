import React, { useEffect, useRef, useState } from 'react';
import { X, Music, Volume2, Cpu, ShieldAlert, Sparkles, Pause, Play, Heart, ScrollText } from 'lucide-react';
import { sound } from '../game/audio';

interface CreditsModalProps {
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ onClose }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  // Smooth auto-scroll effect that pauses on hover or manual interaction
  useEffect(() => {
    if (!autoScroll || isHovering) return;

    let animId: number;
    let lastTime = performance.now();
    let carry = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const el = scrollRef.current;
      if (el) {
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (maxScroll > 0 && el.scrollTop < maxScroll) {
          carry += dt * 28; // gentle 28px/s cinema roll
          if (carry >= 1) {
            const step = Math.floor(carry);
            el.scrollTop += step;
            carry -= step;
          }
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [autoScroll, isHovering]);

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 isolate pointer-events-auto bg-slate-950/90">
      <div
        data-testid="credits-modal-card"
        className="relative z-10 isolate w-full max-w-xl bg-slate-950 bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg border border-pink-300/40">
              <ScrollText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white leading-tight">Crediti</h2>
              <p className="text-xs text-purple-300 font-medium">Catch the Candy · Edizione Fan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                setAutoScroll((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                autoScroll
                  ? 'bg-purple-800/80 border-purple-400/50 text-purple-100'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
              title={autoScroll ? 'Metti in pausa lo scorrimento' : 'Avvia scorrimento automatico'}
              aria-label="Toggle Auto Scroll"
            >
              {autoScroll ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{autoScroll ? 'Scorrimento' : 'Manuale'}</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Chiudi Crediti"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Credits Container */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onWheel={() => setAutoScroll(false)}
          onTouchStart={() => setAutoScroll(false)}
          tabIndex={0}
          data-testid="credits-scroll-area"
          className="flex-1 overflow-y-auto py-6 pr-2 space-y-5 text-center"
        >
          {/* Intro Title */}
          <div className="py-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-pink-400">
              Physics Puzzle Adventure
            </span>
            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-amber-200 mt-1">
              CATCH THE CANDY
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Scorri verso il basso per leggere tutti i crediti e il disclaimer
            </p>
          </div>

          {/* Music Credit */}
          <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border border-purple-500/40 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300">
              <Music className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Colonna Sonora
            </span>
            <p className="text-base sm:text-lg font-extrabold text-white">
              Musica creata con OnlineSequencer.
            </p>
            <span className="text-xs text-slate-300">
              Brano: Catch the Candy Remastered Music
            </span>
          </div>

          {/* SFX Credit */}
          <div className="bg-gradient-to-r from-pink-950 via-slate-900 to-pink-950 border border-pink-500/40 rounded-2xl p-5 flex flex-col items-center gap-2 shadow-inner">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
              <Volume2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-pink-300">
              Effetti Sonori
            </span>
            <p className="text-base sm:text-lg font-extrabold text-white">
              Suoni sintetizzati con Online Audio API.
            </p>
            <span className="text-xs text-slate-300">
              Sintesi procedurale in tempo reale per lingua, ventosa, ghiaccio e vittoria
            </span>
          </div>

          {/* Engine & Gameplay Credit */}
          <div className="bg-slate-900 border border-slate-700/70 rounded-2xl p-5 flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <Cpu className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">
              Motore Fisico & Grafica
            </span>
            <p className="text-sm sm:text-base font-bold text-white">
              Matter.js Physics Engine · HTML5 Canvas 2D
            </p>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              8 livelli puzzle con superfici normali, ghiacciate, casse mobili, trampolini elastici e sprite originali di Fluffy.
            </p>
          </div>

          {/* Fan Project Disclaimer */}
          <div className="bg-gradient-to-b from-amber-950 to-rose-950 border-2 border-amber-400/60 rounded-2xl p-5 flex flex-col items-center gap-2.5 shadow-lg">
            <div className="flex items-center gap-2 text-amber-300">
              <ShieldAlert className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">
                Disclaimer
              </span>
            </div>
            <p className="text-sm font-semibold text-amber-100 leading-relaxed">
              Questa versione di Catch The Candy è un progetto di fan indipendente e non è affiliata con Yohogames o HeroCraft. Questo progetto è puramente a scopo di intrattenimento.
            </p>
          </div>

          {/* Final Thank You */}
          <div className="pt-2 pb-4 flex flex-col items-center gap-2 text-purple-300">
            <div className="flex items-center gap-1.5 text-pink-400">
              <Sparkles className="w-4 h-4" />
              <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white">Grazie per aver giocato!</span>
            <span className="text-xs text-slate-400">Buon divertimento con Fluffy e le sue caramelle</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-purple-500/30 flex justify-end shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all shadow-md"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
