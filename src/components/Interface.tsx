import { useGameStore } from '../stores/useGameStore';
import { Play, RotateCcw, Trophy } from 'lucide-react';

export default function Interface() {
  const { phase, score, highScore, start, restart } = useGameStore();

  return (
    <div className="interface">
      {/* Score Dashboard */}
      <div className="score-board">
        <div className="current-score">Score: {score}</div>
        <div className="high-score">High: {highScore}</div>
      </div>

      {/* Ready Screen */}
      {phase === 'READY' && (
        <div className="overlay">
          <div className="content">
            <h1 className="title">SKY HIGH</h1>
            <p className="subtitle">Jump as high as you can!</p>
            <button className="btn-primary" onClick={start}>
              <Play size={24} fill="currentColor" /> START GAME
            </button>
            <div className="controls-hint">
              WASD or Arrow Keys to move
            </div>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {phase === 'GAME_OVER' && (
        <div className="overlay">
          <div className="content">
            <h2 className="title-gameover">GAME OVER</h2>
            <div className="final-score">
              <Trophy className="icon-gold" size={32} />
              <span>Final Score: {score}</span>
            </div>
            <button className="btn-primary" onClick={() => { restart(); start(); }}>
              <RotateCcw size={24} /> RESTART
            </button>
          </div>
        </div>
      )}

      <style>{`
        .interface {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          color: white;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .score-board {
          position: absolute;
          top: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .current-score { font-size: 2rem; font-weight: 800; }
        .high-score { font-size: 1rem; opacity: 0.8; }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .title { font-size: 5rem; font-weight: 900; margin: 0; letter-spacing: -2px; }
        .title-gameover { font-size: 4rem; color: #ff4757; margin: 0; }
        .subtitle { font-size: 1.2rem; opacity: 0.9; margin-top: -10px; }

        .btn-primary {
          background: #3498db;
          border: none;
          padding: 16px 32px;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          border-radius: 50px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
        }

        .btn-primary:hover {
          transform: scale(1.05);
          background: #2980b9;
        }

        .icon-gold { color: #f1c40f; }
        .final-score {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 2rem;
          font-weight: 700;
        }

        .controls-hint {
          margin-top: 20px;
          font-size: 0.9rem;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}
