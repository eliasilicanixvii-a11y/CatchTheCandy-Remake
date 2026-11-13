/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { LEVELS } from './game/levels';
import { GamePhysics, createGameWorld, shootTongue, releaseTongue, stepPhysics } from './game/physics';
import { GameRenderer } from './game/renderer';
import { calculateStars, isCandyReached } from './game/logic';
import { sound } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { VictoryModal } from './components/VictoryModal';
import { DefeatModal } from './components/DefeatModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { SkinSelectModal } from './components/SkinSelectModal';
import { PauseModal } from './components/PauseModal';
import { CreditsModal } from './components/CreditsModal';

type GameState = 'title' | 'playing' | 'paused' | 'victory' | 'gameover';

const STORAGE_KEY = 'catch_the_candy_save';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [clicksCount, setClicksCount] = useState<number>(0);
  const [currentLives, setCurrentLives] = useState<number>(3);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showSkinSelect, setShowSkinSelect] = useState<boolean>(false);
  const [showCredits, setShowCredits] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(false);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);
  const [selectedSkin, setSelectedSkin] = useState<string>('purple');
  const [completedLevels, setCompletedLevels] = useState<Record<number, { stars: number; bestClicks: number }>>({});

  // End of run victory snapshot
  const [victoryStats, setVictoryStats] = useState<{
    clicks: number;
    stars: number;
    bestClicks: number;
  }>({ clicks: 0, stars: 0, bestClicks: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mutable refs for high-frequency 60fps loop
  const physicsRef = useRef<GamePhysics | null>(null);
  const rendererRef = useRef<GameRenderer>(new GameRenderer());
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 500, y: 300 });
  const isPointerDownRef = useRef<boolean>(false);
  const currentLevelIdRef = useRef<number>(currentLevelId);
  const gameStateRef = useRef<GameState>(gameState);
  const clicksCountRef = useRef<number>(0);
  const currentLivesRef = useRef<number>(3);
  const selectedSkinRef = useRef<string>(selectedSkin);
  const lastTimeRef = useRef<number>(performance.now());
  const reqAnimFrameIdRef = useRef<number | null>(null);

  // Keep refs in sync
  useEffect(() => {
    currentLevelIdRef.current = currentLevelId;
  }, [currentLevelId]);

  useEffect(() => {
    gameStateRef.current = gameState;
    // Reflect state onto document.body for inspection & CSS
    const stateAttr = gameState === 'victory' ? 'gameover' : gameState;
    document.body.dataset.state = stateAttr;
    sound.setPaused(gameState === 'paused');
  }, [gameState]);

  useEffect(() => {
    selectedSkinRef.current = selectedSkin;
  }, [selectedSkin]);

  // Load saved progress from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.completedLevels) setCompletedLevels(parsed.completedLevels);
        if (parsed.selectedSkin) setSelectedSkin(parsed.selectedSkin);
      }
    } catch {
      // Ignore storage errors
    }

    // Check ?autostart=1
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setGameState('playing');
    }
  }, []);

  // Save progress
  const saveProgress = useCallback((updated: Record<number, { stars: number; bestClicks: number }>) => {
    setCompletedLevels(updated);
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          completedLevels: updated,
          selectedSkin: selectedSkinRef.current,
        })
      );
    } catch {
      // Ignore
    }
  }, []);

  // Convert canvas pointer coordinates to virtual 1000x600 space
  const screenToWorld = useCallback((clientX: number, clientY: number): { x: number; y: number } => {
    if (!canvasRef.current) return { x: 500, y: 300 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 600 / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    return {
      x: Math.max(0, Math.min(1000, x)),
      y: Math.max(0, Math.min(600, y)),
    };
  }, []);

  // Initialize or reset physics world for a level
  const initLevel = useCallback((lvlId: number) => {
    const levelConfig = LEVELS.find((l) => l.id === lvlId) || LEVELS[0];
    physicsRef.current = createGameWorld(levelConfig);
    clicksCountRef.current = 0;
    setClicksCount(0);
    currentLivesRef.current = 3;
    setCurrentLives(3);
    isPointerDownRef.current = false;
  }, []);

  // Handle Level Start/Change
  useEffect(() => {
    initLevel(currentLevelId);
  }, [currentLevelId, initLevel]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDt, 0.05);

      const canvas = canvasRef.current;
      const physics = physicsRef.current;
      const renderer = rendererRef.current;
      const currentLevel = LEVELS.find((l) => l.id === currentLevelIdRef.current) || LEVELS[0];

      if (canvas && physics) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // If in playing or victory, tick physics & animations
          if (gameStateRef.current === 'playing' || gameStateRef.current === 'title') {
            stepPhysics(physics, dt);
          }

          renderer.updateParticles(dt);

          // Keep React lives in sync with physics
          if (physics.lives !== currentLivesRef.current) {
            currentLivesRef.current = physics.lives;
            setCurrentLives(physics.lives);
          }

          // Check death condition during playing state
          if (gameStateRef.current === 'playing' && physics.isDead) {
            if (physics.deathTimer > 1.8) {
              setGameState('gameover');
            }
          }

          // Check win condition during playing state
          if (gameStateRef.current === 'playing' && !physics.isDead) {
            const playerPos = physics.playerBody.position;
            const candyPos = physics.candyBody.position;

            if (isCandyReached(playerPos, candyPos)) {
              // Victory reached!
              sound.playCandyEat();
              sound.playVictory();
              renderer.addConfettiBurst(candyPos.x, candyPos.y, 60);

              const clicks = clicksCountRef.current;
              const stars = calculateStars(clicks, currentLevel.starsClicks[0], currentLevel.starsClicks[1]);
              const prevBest = completedLevels[currentLevel.id]?.bestClicks || 0;
              const newBest = prevBest > 0 ? Math.min(prevBest, clicks) : clicks;

              setVictoryStats({
                clicks,
                stars,
                bestClicks: newBest,
              });

              // Save progress
              const updated = {
                ...completedLevels,
                [currentLevel.id]: {
                  stars: Math.max(completedLevels[currentLevel.id]?.stars || 0, stars),
                  bestClicks: newBest,
                },
              };
              saveProgress(updated);
              releaseTongue(physics);
              setGameState('victory');
            }
          }

          // Render canvas scene
          renderer.render(
            ctx,
            physics,
            currentLevel,
            mousePosRef.current,
            selectedSkinRef.current,
            gameStateRef.current === 'victory',
            dt
          );
        }
      }

      animId = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animId = requestAnimationFrame(loop);
    reqAnimFrameIdRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [completedLevels, saveProgress]);

  // Pointer event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    sound.unlockAndStartMusic();
    const pos = screenToWorld(e.clientX, e.clientY);
    mousePosRef.current = pos;
    isPointerDownRef.current = true;

    if (physicsRef.current) {
      clicksCountRef.current += 1;
      setClicksCount(clicksCountRef.current);

      shootTongue(
        physicsRef.current,
        pos.x,
        pos.y,
        (hitX, hitY) => {
          rendererRef.current.addIceSlipBurst(hitX, hitY);
        },
        (hitX, hitY) => {
          rendererRef.current.addLatchPuff(hitX, hitY);
        }
      );
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const pos = screenToWorld(e.clientX, e.clientY);
    mousePosRef.current = pos;
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    if (physicsRef.current) {
      releaseTongue(physicsRef.current);
    }
  };

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear stuck keys or handle shortcuts
      if (e.key === 'r' || e.key === 'R') {
        if (gameStateRef.current === 'playing' || gameStateRef.current === 'victory' || gameStateRef.current === 'gameover') {
          initLevel(currentLevelIdRef.current);
          setGameState('playing');
        }
      } else if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (gameStateRef.current === 'playing') {
          setGameState('paused');
        } else if (gameStateRef.current === 'paused') {
          setGameState('playing');
        }
      } else if (e.key === 'm' || e.key === 'M') {
        setSoundMuted((prev) => {
          const next = !prev;
          sound.setMuted(next);
          return next;
        });
      } else if (e.key === ' ' || e.key === 'Enter') {
        sound.unlockAndStartMusic();
        if (gameStateRef.current === 'title') {
          setGameState('playing');
        } else if (gameStateRef.current === 'gameover') {
          initLevel(currentLevelIdRef.current);
          setGameState('playing');
        } else if (gameStateRef.current === 'victory') {
          // Advance to next level if available
          const nextLvl = currentLevelIdRef.current + 1;
          if (nextLvl <= LEVELS.length) {
            setCurrentLevelId(nextLvl);
            setGameState('playing');
          } else {
            setGameState('title');
          }
        }
      }
    };

    const handleWindowBlur = () => {
      isPointerDownRef.current = false;
      if (physicsRef.current) {
        releaseTongue(physicsRef.current);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [initLevel]);

  // Audio toggles
  const handleToggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sound.setMuted(next);
  };

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    sound.setMusicEnabled(next);
  };

  // Current level details
  const currentLevelConfig = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];
  const hasNextLevel = currentLevelId < LEVELS.length;
  const totalStars = Object.values(completedLevels).reduce((acc, curr) => acc + curr.stars, 0);

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center select-none"
    >
      {/* 1000x600 Scaled Interactive Canvas Surface */}
      <div className="relative w-full h-full max-w-[1400px] max-h-[840px] flex items-center justify-center p-2 sm:p-4">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          data-testid="game-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] cursor-crosshair border border-purple-500/20"
        />

        {/* Title Screen Overlay */}
        {gameState === 'title' && (
          <TitleScreen
            onStartGame={() => {
              sound.unlockAndStartMusic();
              setGameState('playing');
            }}
            onOpenLevels={() => {
              sound.unlockAndStartMusic();
              setShowLevelSelect(true);
            }}
            onOpenSkins={() => {
              sound.unlockAndStartMusic();
              setShowSkinSelect(true);
            }}
            onOpenCredits={() => {
              sound.unlockAndStartMusic();
              setShowCredits(true);
            }}
            soundMuted={soundMuted}
            musicEnabled={musicEnabled}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
            totalStars={totalStars}
          />
        )}

        {/* In-Game HUD (>85% clear playfield) */}
        {gameState === 'playing' && (
          <HUD
            levelNumber={currentLevelConfig.id}
            levelName={currentLevelConfig.name}
            clicksCount={clicksCount}
            starsThresholds={currentLevelConfig.starsClicks}
            lives={currentLives}
            maxLives={3}
            soundMuted={soundMuted}
            musicEnabled={musicEnabled}
            hint={currentLevelConfig.hint}
            onRestart={() => initLevel(currentLevelId)}
            onPause={() => setGameState('paused')}
            onOpenLevels={() => setShowLevelSelect(true)}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
          />
        )}

        {/* Victory Modal */}
        {gameState === 'victory' && (
          <VictoryModal
            levelNumber={currentLevelConfig.id}
            levelName={currentLevelConfig.name}
            clicksTaken={victoryStats.clicks}
            starsEarned={victoryStats.stars}
            bestClicks={victoryStats.bestClicks}
            hasNextLevel={hasNextLevel}
            onNextLevel={() => {
              if (hasNextLevel) {
                setCurrentLevelId((prev) => prev + 1);
                setGameState('playing');
              }
            }}
            onRestart={() => {
              initLevel(currentLevelId);
              setGameState('playing');
            }}
            onOpenLevels={() => setShowLevelSelect(true)}
          />
        )}

        {/* Defeat Modal */}
        {gameState === 'gameover' && (
          <DefeatModal
            levelNumber={currentLevelConfig.id}
            levelName={currentLevelConfig.name}
            onRestart={() => {
              initLevel(currentLevelId);
              setGameState('playing');
            }}
            onOpenLevels={() => setShowLevelSelect(true)}
          />
        )}

        {/* Pause Modal */}
        {gameState === 'paused' && (
          <PauseModal
            levelNumber={currentLevelConfig.id}
            levelName={currentLevelConfig.name}
            soundMuted={soundMuted}
            onResume={() => setGameState('playing')}
            onRestart={() => {
              initLevel(currentLevelId);
              setGameState('playing');
            }}
            onOpenLevels={() => setShowLevelSelect(true)}
            onGoToTitle={() => setGameState('title')}
            onToggleSound={handleToggleSound}
          />
        )}

        {/* Level Select Modal */}
        {showLevelSelect && (
          <LevelSelectModal
            currentLevel={currentLevelId}
            completedLevels={completedLevels}
            onSelectLevel={(lvlId) => {
              setCurrentLevelId(lvlId);
              setShowLevelSelect(false);
              setGameState('playing');
            }}
            onClose={() => setShowLevelSelect(false)}
          />
        )}

        {/* Skin Select Modal */}
        {showSkinSelect && (
          <SkinSelectModal
            currentSkin={selectedSkin}
            onSelectSkin={(skinId) => {
              setSelectedSkin(skinId);
              try {
                localStorage.setItem(
                  STORAGE_KEY,
                  JSON.stringify({
                    completedLevels,
                    selectedSkin: skinId,
                  })
                );
              } catch {
                // Ignore
              }
            }}
            onClose={() => setShowSkinSelect(false)}
          />
        )}

        {/* Credits Modal */}
        {showCredits && (
          <CreditsModal onClose={() => setShowCredits(false)} />
        )}
      </div>
    </div>
  );
}
