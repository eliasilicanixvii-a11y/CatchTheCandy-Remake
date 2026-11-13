import React from 'react';
import { X, Star, Lock, Play } from 'lucide-react';
import { LEVELS } from '../game/levels';
import { sound } from '../game/audio';

interface LevelSelectModalProps {
  currentLevel: number;
  completedLevels: Record<number, { stars: number; bestClicks: number }>;
  onSelectLevel: (lvlId: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevel,
  completedLevels,
  onSelectLevel,
  onClose,
}) => {
  const [unlockAll, setUnlockAll] = React.useState(true);
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 pointer-events-auto bg-slate-950/75">
      <div className="w-full max-w-2xl bg-gradient-to-b from-purple-950/95 via-slate-900/95 to-slate-950/95 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/30">
          <div>
            <h2 className="text-2xl font-black text-white">Seleziona Livello</h2>
            <p className="text-xs text-purple-300 font-medium">Scegli una sfida da affrontare</p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-6 overflow-y-auto">
          {LEVELS.map((lvl) => {
            const progress = completedLevels[lvl.id];
            const isUnlocked = unlockAll || lvl.id === 1 || Boolean(completedLevels[lvl.id - 1]) || Boolean(progress);
            const isCurrent = lvl.id === currentLevel;
            const stars = progress?.stars || 0;

            return (
              <button
                key={lvl.id}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playClick();
                    onSelectLevel(lvl.id);
                  }
                }}
                className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border-2 transition-all text-left ${
                  !isUnlocked
                    ? 'bg-slate-900/60 border-slate-800 opacity-50 cursor-not-allowed'
                    : isCurrent
                    ? 'bg-gradient-to-b from-purple-700/80 to-indigo-900/80 border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)] scale-102'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-purple-500/30 hover:border-purple-400 hover:scale-102 active:scale-98'
                }`}
              >
                {/* Number & Lock */}
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xl font-black text-white tabular-nums">#{lvl.id}</span>
                  {!isUnlocked ? (
                    <Lock className="w-4 h-4 text-slate-500" />
                  ) : isCurrent ? (
                    <Play className="w-4 h-4 text-pink-400 fill-pink-400" />
                  ) : null}
                </div>

                {/* Level Title */}
                <span className="text-sm font-bold text-purple-200 line-clamp-1 w-full text-center mb-3">
                  {lvl.name}
                </span>

                {/* Stars container */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        stars >= s
                          ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]'
                          : 'text-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-purple-500/30 flex items-center justify-between">
          <button
            onClick={() => setUnlockAll(!unlockAll)}
            className="text-xs font-semibold text-purple-300 hover:text-pink-300 transition-colors"
          >
            {unlockAll ? 'Modalità: Tutti Sbloccati' : 'Modalità: Progressione Classica'}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all"
          >
            Torna al Gioco
          </button>
        </div>
      </div>
    </div>
  );
};
