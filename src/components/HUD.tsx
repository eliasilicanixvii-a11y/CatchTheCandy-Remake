import React from 'react';
import { RotateCcw, Pause, Grid, Volume2, VolumeX, Star, Music, HelpCircle, Heart } from 'lucide-react';
import { sound } from '../game/audio';

interface HUDProps {
  levelNumber: number;
  levelName: string;
  clicksCount: number;
  starsThresholds: [number, number];
  lives: number;
  maxLives: number;
  soundMuted: boolean;
  musicEnabled: boolean;
  hint?: string;
  onRestart: () => void;
  onPause: () => void;
  onOpenLevels: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  levelNumber,
  levelName,
  clicksCount,
  starsThresholds,
  lives,
  maxLives,
  soundMuted,
  musicEnabled,
  hint,
  onRestart,
  onPause,
  onOpenLevels,
  onToggleSound,
  onToggleMusic,
}) => {
  // Compute star preview based on current clicks
  const starsEarned = clicksCount <= starsThresholds[0] ? 3 : clicksCount <= starsThresholds[1] ? 2 : 1;

  return (
    <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between z-10">
      {/* Top Bar: Perimeter Clusters */}
      <div className="flex items-center justify-between w-full gap-2">
        {/* Top-Left Cluster: Level Info & Clicks Counter */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-950/90 to-slate-900/90 border border-purple-500/40 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-2xl shadow-xl">
          <div className="flex flex-col">
            <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-300">
              Lvl {levelNumber}
            </span>
            <span className="text-xs sm:text-base font-extrabold text-white leading-tight max-w-[90px] sm:max-w-none truncate">
              {levelName}
            </span>
          </div>

          <div className="h-6 sm:h-8 w-px bg-purple-500/30 mx-0.5 sm:mx-1" />

          {/* Clicks readout */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] sm:text-[10px] font-bold uppercase text-slate-300">Lanci</span>
            <span className="text-sm sm:text-lg font-black text-amber-300 tabular-nums leading-tight">
              {clicksCount}
            </span>
          </div>

          <div className="h-6 sm:h-8 w-px bg-purple-500/30 mx-0.5 sm:mx-1" />

          {/* Lives (Vite) */}
          <div className="flex items-center gap-1" title={`Vite rimanenti: ${lives} / ${maxLives}`}>
            {[1, 2, 3].map((heartIdx) => (
              <Heart
                key={heartIdx}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${
                  lives >= heartIdx
                    ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.7)] scale-105'
                    : 'text-slate-700 fill-slate-900/60 scale-90 opacity-40'
                }`}
              />
            ))}
          </div>

          <div className="h-6 sm:h-8 w-px bg-purple-500/30 mx-0.5 sm:mx-1" />

          {/* Star rating preview pips */}
          <div className="flex items-center gap-0.5 sm:gap-1" title={`3 Stelle: <= ${starsThresholds[0]} lanci | 2 Stelle: <= ${starsThresholds[1]} lanci`}>
            {[1, 2, 3].map((starNum) => (
              <Star
                key={starNum}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                  starsEarned >= starNum
                    ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]'
                    : 'text-slate-600 fill-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Top-Right Cluster: Action buttons */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Restart Button [R] */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            tabIndex={-1}
            className="p-1.5 sm:p-2.5 rounded-xl bg-gradient-to-b from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg border border-amber-300/40 transition-all hover:scale-105 active:scale-95 group"
            title="Riavvia Livello [R]"
            aria-label="Restart Level"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-rotate-45 transition-transform" />
          </button>

          {/* Sound Toggle [M] */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            tabIndex={-1}
            className="p-1.5 sm:p-2.5 rounded-xl bg-slate-800/85 hover:bg-slate-700/85 text-slate-200 border border-slate-700/60 shadow-lg transition-all hover:scale-105 active:scale-95"
            title={soundMuted ? 'Attiva Suoni [M]' : 'Disattiva Suoni [M]'}
            aria-label="Toggle Sound"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
          </button>

          {/* Music Toggle */}
          <button
            onClick={() => {
              onToggleMusic();
            }}
            tabIndex={-1}
            className={`p-1.5 sm:p-2.5 rounded-xl border shadow-lg transition-all hover:scale-105 active:scale-95 ${
              musicEnabled
                ? 'bg-purple-900/80 border-purple-400/50 text-purple-200'
                : 'bg-slate-800/85 border-slate-700/60 text-slate-400'
            }`}
            title={musicEnabled ? `Musica: ${sound.getCurrentTrackTitle()} (Attiva)` : 'Attiva Musica'}
            aria-label="Toggle Music"
          >
            <Music className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Levels Menu */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenLevels();
            }}
            tabIndex={-1}
            className="p-1.5 sm:p-2.5 rounded-xl bg-slate-800/85 hover:bg-slate-700/85 text-purple-300 border border-purple-500/40 shadow-lg transition-all hover:scale-105 active:scale-95"
            title="Seleziona Livello"
            aria-label="Level Select"
          >
            <Grid className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Pause Button [P / Esc] */}
          <button
            onClick={() => {
              sound.playClick();
              onPause();
            }}
            tabIndex={-1}
            className="p-1.5 sm:p-2.5 rounded-xl bg-slate-800/85 hover:bg-slate-700/85 text-slate-200 border border-slate-700/60 shadow-lg transition-all hover:scale-105 active:scale-95"
            title="Pausa [P / Esc]"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Hint Strip */}
      {hint && (
        <div className="self-center pointer-events-auto bg-gradient-to-r from-slate-900/90 via-purple-950/90 to-slate-900/90 border border-purple-500/30 px-5 py-2 rounded-2xl shadow-xl text-center text-xs sm:text-sm text-purple-200 font-medium max-w-lg mb-1 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-pink-400 shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
};
