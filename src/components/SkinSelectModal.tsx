import React from 'react';
import { X, Check } from 'lucide-react';
import { SKINS } from '../game/logic';
import { sound } from '../game/audio';

interface SkinSelectModalProps {
  currentSkin: string;
  onSelectSkin: (skinId: string) => void;
  onClose: () => void;
}

export const SkinSelectModal: React.FC<SkinSelectModalProps> = ({
  currentSkin,
  onSelectSkin,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 z-30 pointer-events-auto bg-slate-950/75">
      <div className="w-full max-w-lg bg-gradient-to-b from-purple-950/95 via-slate-900/95 to-slate-950/95 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/30">
          <div>
            <h2 className="text-2xl font-black text-white">Personalizza la Palla Pelosa</h2>
            <p className="text-xs text-purple-300 font-medium">Scegli il tuo stile preferito</p>
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

        {/* Skins List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-6">
          {Object.values(SKINS).map((skin) => {
            const isSelected = skin.id === currentSkin;
            return (
              <button
                key={skin.id}
                onClick={() => {
                  sound.playClick();
                  onSelectSkin(skin.id);
                }}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? 'bg-purple-800/60 border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)] scale-102'
                    : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 hover:border-purple-400 hover:scale-101'
                }`}
              >
                {/* Visual skin orb preview */}
                <div
                  className="w-12 h-12 rounded-full border-2 border-white/60 shadow-md flex items-center justify-center relative shrink-0"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${skin.highlightColor}, ${skin.bodyGradient[0]}, ${skin.bodyGradient[1]}, ${skin.bodyGradient[2]})`,
                  }}
                >
                  {/* Two cute eyes */}
                  <div className="flex gap-1.5 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skin.eyeColor }} />
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: skin.eyeColor }} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-white text-sm truncate">{skin.name}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className="w-4 h-2 rounded-full"
                      style={{
                        background: `linear-gradient(to right, ${skin.tongueGradient[0]}, ${skin.tongueGradient[1]})`,
                      }}
                    />
                    <span className="text-[10px] text-slate-400">Lingua</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-purple-500/30 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
};
