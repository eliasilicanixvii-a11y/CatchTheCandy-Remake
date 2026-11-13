import React from 'react';
import { Star, Trophy, ArrowRight, RotateCcw, Grid, Sparkles } from 'lucide-react';
import { sound } from '../game/audio';

interface VictoryModalProps {
  levelNumber: number;
  levelName: string;
  clicksTaken: number;
  starsEarned: number;
  bestClicks: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestart: () => void;
  onOpenLevels: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  levelNumber,
  levelName,
  clicksTaken,
  starsEarned,
  bestClicks,
  hasNextLevel,
  onNextLevel,
  onRestart,
  onOpenLevels,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 pointer-events-auto bg-slate-950/70">
      <div className="w-full max-w-md bg-gradient-to-b from-purple-900/95 via-indigo-950/95 to-slate-950/95 border-2 border-purple-400/50 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.8)] text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Crown/Trophy celebration emblem */}
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.6)] border-2 border-yellow-200">
            <Trophy className="w-9 h-9 text-purple-950" />
          </div>
          <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-2 -right-2 animate-bounce" />
        </div>

        <span className="text-xs font-bold uppercase tracking-widest text-purple-300">
          Livello {levelNumber} Completato!
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-200 to-amber-200 mt-1 mb-4">
          Caramella Catturata!
        </h2>

        {/* 3 Animated Stars */}
        <div className="flex items-center justify-center gap-3 my-2">
          {[1, 2, 3].map((starIdx) => {
            const isFilled = starsEarned >= starIdx;
            return (
              <div
                key={starIdx}
                className={`transform transition-all duration-300 ${
                  isFilled ? 'scale-110' : 'scale-90 opacity-40'
                }`}
                style={{
                  animationDelay: `${starIdx * 150}ms`,
                }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                    isFilled
                      ? 'bg-gradient-to-b from-yellow-300 to-amber-500 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.6)]'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      isFilled ? 'text-amber-950 fill-yellow-200' : 'text-slate-600'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stat Tiles */}
        <div className="grid grid-cols-2 gap-3 w-full my-5">
          <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase text-purple-300">Lanci Usati</span>
            <span className="text-2xl font-black text-white tabular-nums">{clicksTaken}</span>
          </div>

          <div className="bg-slate-900/80 border border-purple-500/30 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase text-amber-300">Miglior Risultato</span>
            <span className="text-2xl font-black text-amber-300 tabular-nums">
              {bestClicks > 0 ? bestClicks : clicksTaken}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-3">
          {hasNextLevel ? (
            <button
              data-start="true"
              onClick={() => {
                sound.playClick();
                onNextLevel();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-lg shadow-[0_10px_25px_rgba(16,185,129,0.4)] border border-emerald-300/40 flex items-center justify-center gap-3 transition-transform hover:scale-102 active:scale-98"
            >
              <span>PROSSIMO LIVELLO</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-3 bg-amber-500/20 border border-amber-400/40 rounded-xl text-amber-200 font-bold text-sm">
              Hai completato tutti i livelli! Ottimo lavoro!
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-purple-200 border border-slate-700 font-bold flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Rigioca</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenLevels();
              }}
              className="py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-purple-200 border border-slate-700 font-bold flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98"
            >
              <Grid className="w-4 h-4" />
              <span>Mappa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
