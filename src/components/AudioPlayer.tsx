import { useEffect, useRef } from 'react';
import { useGameStore } from '../stores/useGameStore';

export default function AudioPlayer() {
  const { phase, isMusicMuted } = useGameStore();
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!bgmRef.current) {
      bgmRef.current = new Audio('/sounds/bgm.mp3');
      bgmRef.current.loop = true;
      bgmRef.current.volume = 0.2;
    }

    if (phase === 'PLAYING' && !isMusicMuted) {
      bgmRef.current.play().catch(() => {});
    } else {
      bgmRef.current.pause();
    }
    
    return () => {
      bgmRef.current?.pause();
    };
  }, [phase, isMusicMuted]);

  return null;
}
