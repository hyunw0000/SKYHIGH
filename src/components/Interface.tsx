import { useGameStore } from '../stores/useGameStore';
import { Play, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Interface() {
  const { phase, score, highScore, start, restart, togglePause, checkpointPosition, incrementScore, setCurrentLevel, teleportPlayer } = useGameStore();
  const [notification, setNotification] = useState<string | null>(null);

  // DEBUG: Temporary teleportation keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const teleport = (y: number) => {
        teleportPlayer([0, y, 0]);
        window.dispatchEvent(new CustomEvent('debug-teleport', { detail: { y } }));
      };
      if (e.key === '1') teleport(300);
      if (e.key === '2') teleport(600);
      if (e.key === '3') teleport(900);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [teleportPlayer]);

  useEffect(() => {
    const checkMilestone = (m: number, msg: string) => {
      if (score >= m && score < m + 2) { // Brief window for trigger
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000); // Display for 3 seconds
      }
    };

    checkMilestone(300, "NEW PLATFORMS DETECTED: MOVING PLATFORMS ACTIVE");
    checkMilestone(600, "WARNING: DESTRUCTIBLE PLATFORMS AHEAD");
    checkMilestone(900, "WARNING: PLATFORM SIZE REDUCED");
  }, [score]);

  return (
    <div className="interface">
      {/* Milestone Notification */}
      {notification && (
        <div className="milestone-notification">
          <p>{notification}</p>
        </div>
      )}

      {/* Score Dashboard */}
      <div className="score-board">
        <div className="current-score">
          <span className="label">ALTITUDE</span>
          <span className="value">{score.toFixed(1)}m</span>
        </div>
        <div className="high-score">
          <span className="label">BEST</span>
          <span className="value">{highScore.toFixed(1)}m</span>
        </div>
      </div>
      
      {/* ... rest of existing code ... */}
      {/* Ready Screen */}
      {phase === 'READY' && (
        <div className="overlay">
          <div className="content">
            <h1 className="title">SKY HIGH</h1>
            <div className="neon-line"></div>
            <p className="subtitle">NEON SPHERE CHALLENGE</p>
            <button className="btn-neon" onClick={start}>
              <Play size={24} fill="currentColor" /> START MISSION
            </button>
            <div className="controls-hint">
              <div className="control-item"><span>WASD</span> MOVE</div>
              <div className="control-item"><span>SPACE</span> JUMP</div>
              <div className="control-item"><span>R</span> RESPAWN</div>
              <div className="control-item"><span>MOUSE</span> VIEW</div>
              <div className="control-item"><span>ESC</span> PAUSE</div>
              <div className="control-item"><span style={{ color: '#ffd700' }}>GOLD</span> CHECKPOINT (TURNS <span style={{ color: '#00ff00' }}>GREEN</span>)</div>
            </div>
            {checkpointPosition && (
              <p className="checkpoint-msg">CHECKPOINT ACTIVE: {checkpointPosition[1].toFixed(0)}m</p>
            )}
          </div>
        </div>
      )}

      {/* Pause Screen */}
      {phase === 'PAUSED' && (
        <div className="overlay pause-overlay">
          <div className="content">
            <h2 className="title">PAUSED</h2>
            <div className="neon-line"></div>
            <button className="btn-neon" onClick={togglePause}>
              <Play size={24} fill="currentColor" /> RESUME
            </button>
            <div className="controls-hint">
              <div className="control-item"><span>ESC</span> RESUME</div>
              <div className="control-item"><span style={{ color: '#ffd700' }}>GOLD PLATFORM</span> SAVES PROGRESS (TURNS <span style={{ color: '#00ff00' }}>GREEN</span>)</div>
            </div>
          </div>
        </div>
      )}

      {/* Win Screen */}
      {phase === 'WON' && (
        <div className="overlay win-overlay">
          <div className="content">
            <Sparkles className="icon-gold" size={80} />
            <h1 className="title-win">MISSION ACCOMPLISHED</h1>
            <div className="neon-line"></div>
            <p className="subtitle">YOU REACHED THE SUMMIT!</p>
            <div className="final-score-neon">
              <Trophy className="icon-gold" size={40} />
              <div className="score-details">
                <span className="score-value">{score.toFixed(1)}m</span>
                <span className="score-label">FINAL ALTITUDE</span>
              </div>
            </div>
            <button className="btn-neon" onClick={() => window.location.reload()}>
              <RotateCcw size={24} /> NEW JOURNEY
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {phase === 'GAME_OVER' && (
        <div className="overlay">
          <div className="content">
            <h2 className="title-gameover">MISSION FAILED</h2>
            <div className="final-score-neon">
              <Trophy className="icon-gold" size={40} />
              <div className="score-details">
                <span className="score-value">{score.toFixed(1)}m</span>
                <span className="score-label">FINAL ALTITUDE</span>
              </div>
            </div>
            <button className="btn-neon btn-restart" onClick={() => { restart(); }}>
              <RotateCcw size={24} /> {useGameStore.getState().checkpointPosition ? 'RESPAWN AT CHECKPOINT' : 'RE-INITIALIZE'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
