import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type GamePhase = 'READY' | 'PLAYING' | 'GAME_OVER';

interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  currentLevel: number;
  start: () => void;
  restart: () => void;
  setGameOver: () => void;
  incrementScore: (newScore: number) => void;
  setCurrentLevel: (level: number) => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: 'READY',
    score: 0,
    highScore: Number(localStorage.getItem('sky-high-high-score')) || 0,
    currentLevel: 0,

    start: () => set({ phase: 'PLAYING', score: 0, currentLevel: 0 }),
    
    restart: () => {
      set({ phase: 'READY', score: 0, currentLevel: 0 });
    },
    
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
      const flooredScore = Math.floor(newScore);
      if (flooredScore > state.score) {
        return { score: flooredScore };
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
