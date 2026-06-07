import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type GamePhase = 'READY' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'WON';

interface GameState {
  phase: GamePhase;
  score: number;
  highScore: number;
  currentLevel: number;
  checkpointPosition: [number, number, number] | null;
  setCheckpoint: (pos: [number, number, number]) => void;
  start: () => void;
  restart: () => void;
  setGameOver: () => void;
  setWin: () => void;
  setScore: (newScore: number) => void;
  setCurrentLevel: (level: number) => void;
  togglePause: () => void;
  }

  export const useGameStore = create<GameState>()(
  subscribeWithSelector((set) => ({
    phase: 'READY', 
    score: 0,
    highScore: Number(localStorage.getItem('sky-high-high-score')) || 0,
    currentLevel: 0,
    checkpointPosition: null,

    start: () => set({ phase: 'PLAYING', score: 0, currentLevel: 0 }),

    
    restart: () => {
      set((state) => ({ 
        phase: 'READY', 
        score: state.checkpointPosition ? state.checkpointPosition[1] : 0,
        currentLevel: state.checkpointPosition ? Math.floor(state.checkpointPosition[1] / 4) : 0
      }));
    },

    setCheckpoint: (pos: [number, number, number]) => set({ checkpointPosition: pos }),


    setWin: () => set({ phase: 'WON' }),

    togglePause: () => set((state) => {
      if (state.phase === 'PLAYING') return { phase: 'PAUSED' };
      if (state.phase === 'PAUSED') return { phase: 'PLAYING' };
      return state;
    }),
    
    setGameOver: () => set((state) => {
      if (state.phase === 'PLAYING') {
        return { phase: 'GAME_OVER' };
      }
      return state;
    }),

    setScore: (newScore: number) => set((state) => {
      const updates: any = { score: newScore };
      
      // Update highScore if current score is higher
      if (newScore > state.highScore) {
        updates.highScore = newScore;
        localStorage.setItem('sky-high-high-score', newScore.toString());
      }
      
      return updates;
    }),

    setCurrentLevel: (level: number) => set((state) => {
      if (state.currentLevel !== level) {
        return { currentLevel: level };
      }
      return state;
    }),
  }))
);
