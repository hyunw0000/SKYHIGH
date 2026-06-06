import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type GamePhase = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'WON';

interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  currentLevel: number;
  checkpointPosition: [number, number, number] | null;
  start: () => void;
  restart: () => void;
  setGameOver: () => void;
  setWin: () => void;
  incrementScore: (newScore: number) => void;
  setCurrentLevel: (level: number) => void;
  togglePause: () => void;
  teleportPlayer: (pos: [number, number, number]) => void;
  }

  export const useGameStore = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: 'PLAYING', // Changed default to PLAYING to allow immediate move
    score: 0,
    highScore: Number(localStorage.getItem('sky-high-high-score')) || 0,
    currentLevel: 0,
    checkpointPosition: null,

    teleportPlayer: (pos) => set({ score: pos[1], currentLevel: Math.floor(pos[1] / 4) }),

    start: () => set({ phase: 'PLAYING', score: 0, currentLevel: 0 }),

    
    restart: () => {
      set((state) => ({ 
        phase: 'READY', 
        score: state.checkpointPosition ? state.checkpointPosition[1] : 0,
        currentLevel: state.checkpointPosition ? Math.floor(state.checkpointPosition[1] / 4) : 0
      }));
    },

    setCheckpoint: (pos) => set({ checkpointPosition: pos }),

    setWin: () => set({ phase: 'WON' }),

    togglePause: () => set((state) => {
      if (state.phase === 'PLAYING') return { phase: 'PAUSED' };
      if (state.phase === 'PAUSED') return { phase: 'PLAYING' };
      return state;
    }),
    
    setGameOver: () => set((state) => {
      if (state.phase === 'PLAYING') {
        const newHighScore = Math.max(state.score, state.highScore);
        if (newHighScore > state.highScore) {
          localStorage.setItem('sky-high-high-score', newHighScore.toString());
        }
        return { phase: 'GAME_OVER', highScore: newHighScore };
      }
      return state;
    }),

    incrementScore: (newScore: number) => set((state) => {
      if (newScore > state.score) {
        return { score: newScore };
      }
      return state;
    }),

    setCurrentLevel: (level: number) => set((state) => {
      if (state.currentLevel !== level) {
        return { currentLevel: level };
      }
      return state;
    }),
  }))
);
