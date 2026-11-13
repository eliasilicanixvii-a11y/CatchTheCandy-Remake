import React from 'react';
import { RotateCcw, Grid, HeartCrack } from 'lucide-react';
import { sound } from '../game/audio';

interface DefeatModalProps {
  levelNumber: number;
  levelName: string;
  onRestart: () => void;
  onOpenLevels: () => void;
}

export const DefeatModal: React.FC<DefeatModalProps> = ({
  levelNumber,
  levelName,
  onRestart,
  onOpenLevels,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 pointer-events-auto bg-slate-950/75">
      <div className="w-full max-w-sm bg-gradient-to-b from-rose-950/95 via-purple-950/95 to-slate-950/95 border-2 border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Heart crack icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-700 to-red-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.5)] border-2 border-rose-300 mb-3">
          <HeartCrack className="w-9 h-9 text-white" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-rose-300">
          Livello {levelNumber} - {levelName}
        </span>
        <h2 className="text-2xl font-black text-white mt-1 mb-2">
          Vite Esaurite!
        </h2>
        <p className="text-sm text-purple-200/80 mb-6 font-medium">
          Fluffy è volato in cielo con le sue ali d&apos;angelo. Riprova il livello!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-3">
          <button
            data-start="true"
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-extrabold text-base shadow-[0_8px_25px_rgba(244,63,94,0.4)] border border-rose-300/40 flex items-center justify-center gap-2.5 transition-transform hover:scale-102 active:scale-98"
          >
            <RotateCcw className="w-5 h-5" />
            <span>RIPROVA LIVELLO</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenLevels();
            }}
            className="w-full py-3 px-6 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-purple-200 border border-slate-700 font-bold flex items-center justify-center gap-2.5 transition-all hover:scale-102 active:scale-98"
          >
            <Grid className="w-4 h-4" />
            <span>Scegli Livello</span>
          </button>
        </div>
      </div>
    </div>
  );
};
