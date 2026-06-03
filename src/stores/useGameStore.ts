import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type GamePhase = 'READY' | 'PLAYING' | 'GAME_OVER';

interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  start: () => void;
  restart: () => void;
  setGameOver: () => void;
  incrementScore: (newScore: number) => void;
}

export const useGameStore = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: 'READY',
    score: 0,
    highScore: Number(localStorage.getItem('sky-high-high-score')) || 0,

    start: () => set({ phase: 'PLAYING', score: 0 }),
    
    restart: () => {
      set({ phase: 'READY', score: 0 });
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

    incrementScore: (newScore: number) => set((state) => ({
      score: Math.max(state.score, Math.floor(newScore))
    })),
  }))
);
