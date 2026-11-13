import React from 'react';
import { Play, RotateCcw, Grid, Home, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../game/audio';

interface PauseModalProps {
  levelNumber: number;
  levelName: string;
  soundMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onOpenLevels: () => void;
  onGoToTitle: () => void;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  levelNumber,
  levelName,
  soundMuted,
  onResume,
  onRestart,
  onOpenLevels,
  onGoToTitle,
  onToggleSound,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 pointer-events-auto bg-slate-950/70">
      <div className="w-full max-w-sm bg-gradient-to-b from-purple-950/95 via-indigo-950/95 to-slate-950/95 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-center flex flex-col items-center">
        <span className="text-xs font-bold uppercase tracking-widest text-purple-300">
          Livello {levelNumber} - {levelName}
        </span>
        <h2 className="text-2xl font-black text-white mt-1 mb-6">Pausa</h2>

        <div className="flex flex-col w-full gap-3">
          {/* Resume */}
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-extrabold text-base shadow-lg border border-pink-300/40 flex items-center justify-center gap-3 transition-transform hover:scale-102 active:scale-98"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>RIPRENDI</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30 font-bold flex items-center justify-center gap-2.5 transition-all hover:scale-102 active:scale-98"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Riavvia Livello</span>
          </button>

          {/* Level Map */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenLevels();
            }}
            className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30 font-bold flex items-center justify-center gap-2.5 transition-all hover:scale-102 active:scale-98"
          >
            <Grid className="w-4 h-4" />
            <span>Seleziona Livello</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
            }}
            className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-200 border border-purple-500/30 font-bold flex items-center justify-center gap-2.5 transition-all hover:scale-102 active:scale-98"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{soundMuted ? 'Attiva Audio' : 'Disattiva Audio'}</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              sound.playClick();
              onGoToTitle();
            }}
            className="w-full py-3 px-6 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 font-bold flex items-center justify-center gap-2.5 transition-all mt-2"
          >
            <Home className="w-4 h-4" />
            <span>Menu Principale</span>
          </button>
        </div>
      </div>
    </div>
  );
};
