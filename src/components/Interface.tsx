import { useGameStore } from '../stores/useGameStore';
import { Play, RotateCcw, Trophy } from 'lucide-react';

export default function Interface() {
  const { phase, score, highScore, start, restart } = useGameStore();

  return (
    <div className="interface">
      {/* Score Dashboard */}
      <div className="score-board">
        <div className="current-score">
          <span className="label">ALTITUDE</span>
          <span className="value">{score}m</span>
        </div>
        <div className="high-score">
          <span className="label">BEST</span>
          <span className="value">{highScore}m</span>
        </div>
      </div>

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
              <div className="control-item"><span>MOUSE</span> VIEW</div>
            </div>
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
                <span className="score-value">{score}m</span>
                <span className="score-label">FINAL ALTITUDE</span>
              </div>
            </div>
            <button className="btn-neon btn-restart" onClick={() => { restart(); start(); }}>
              <RotateCcw size={24} /> RE-INITIALIZE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
