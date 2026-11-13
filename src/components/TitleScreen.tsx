import React from 'react';
import { Play, Grid, Palette, Volume2, VolumeX, Music, Sparkles, ScrollText } from 'lucide-react';
import { sound } from '../game/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenLevels: () => void;
  onOpenSkins: () => void;
  onOpenCredits: () => void;
  soundMuted: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  totalStars: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLevels,
  onOpenSkins,
  onOpenCredits,
  soundMuted,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  totalStars,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-between p-6 sm:p-10 z-20 pointer-events-auto bg-gradient-to-b from-slate-950/70 via-purple-950/40 to-slate-950/80">
      {/* Top status bar */}
      <div className="w-full flex items-center justify-between max-w-4xl">
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 px-3.5 py-1.5 rounded-full text-amber-300 font-semibold text-sm backdrop-blur-none shadow-lg">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Stelle Raccolte:</span>
          <span className="font-bold text-amber-200 tabular-nums">{totalStars} / 24</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMusic}
            className={`p-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-md ${
              musicEnabled
                ? 'bg-purple-900/80 hover:bg-purple-800/80 border-purple-400/50 text-purple-200'
                : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700/60 text-slate-400'
            }`}
            title={musicEnabled ? `Disattiva Musica (${sound.getCurrentTrackTitle()})` : 'Attiva Musica'}
            aria-label="Toggle Music"
          >
            <Music className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleSound}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 transition-all hover:scale-105 active:scale-95 shadow-md"
            title={soundMuted ? 'Attiva Audio' : 'Disattiva Audio'}
            aria-label="Toggle Sound"
          >
            {soundMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Hero Showcase Centerpiece */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Bespoke inline SVG Title Lockup */}
        <div className="relative mb-6">
          <svg viewBox="0 0 540 130" className="w-[320px] sm:w-[480px] drop-shadow-[0_10px_25px_rgba(168,85,247,0.45)]">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="40%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <linearGradient id="candyGradTitle" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbcfe8" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#9d174d" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background pill emblem banner */}
            <rect x="20" y="15" width="500" height="100" rx="28" fill="rgba(30, 27, 75, 0.75)" stroke="url(#titleGrad)" strokeWidth="4" />

            {/* Candy emblem on the left */}
            <g transform="translate(68, 65)">
              <circle r="26" fill="url(#candyGradTitle)" stroke="#ffffff" strokeWidth="3" />
              <path d="M-18,0 Q0,-18 18,0 Q0,18 -18,0" fill="#ffffff" opacity="0.85" />
              <circle r="7" fill="#ffffff" />
            </g>

            {/* Catch the Candy Text */}
            <text
              x="290"
              y="58"
              textAnchor="middle"
              fontFamily="Fredoka, cursive"
              fontSize="34"
              fontWeight="800"
              fill="url(#titleGrad)"
              stroke="#1e1b4b"
              strokeWidth="2"
              letterSpacing="2"
            >
              CATCH THE CANDY
            </text>

            <text
              x="290"
              y="90"
              textAnchor="middle"
              fontFamily="Fredoka, cursive"
              fontSize="16"
              fontWeight="600"
              fill="#cbd5e1"
              letterSpacing="1.5"
            >
              PHYSICS PUZZLE ADVENTURE
            </text>
          </svg>
        </div>

        {/* Start Game Primary CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
          <button
            data-start="true"
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-400 hover:via-purple-500 hover:to-indigo-500 text-white font-extrabold text-xl shadow-[0_12px_30px_rgba(236,72,153,0.4)] border border-pink-300/40 transition-all transform hover:-translate-y-1 hover:scale-105 active:translate-y-0.5 active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Play className="w-6 h-6 fill-white" />
            </div>
            <span>INIZIA A GIOCARE</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLevels();
            }}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-purple-200 border border-purple-500/30 font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <Grid className="w-5 h-5 text-purple-400" />
            <span>Livelli</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSkins();
            }}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-pink-200 border border-pink-500/30 font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <Palette className="w-5 h-5 text-pink-400" />
            <span>Aspetto</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenCredits();
            }}
            className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-200 border border-amber-500/30 font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
          >
            <ScrollText className="w-5 h-5 text-amber-400" />
            <span>Crediti</span>
          </button>
        </div>
      </div>

      {/* Flat control hint line */}
      <div className="text-center text-xs sm:text-sm text-slate-400 font-medium tracking-wide border-t border-slate-800/60 pt-4 w-full max-w-2xl">
        Clicca & Trascina per lanciare la lingua · Spazio / Invio per Iniziare · R Riavvia · P Pausa · M Muto
      </div>
    </div>
  );
};
