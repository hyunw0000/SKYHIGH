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

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');

        .interface {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          font-family: 'Orbitron', sans-serif;
          color: white;
        }

        .score-board {
          position: absolute;
          top: 30px;
          left: 30px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          pointer-events: auto;
        }

        .current-score, .high-score {
          display: flex;
          flex-direction: column;
        }

        .label {
          font-size: 0.7rem;
          letter-spacing: 2px;
          opacity: 0.6;
          margin-bottom: 2px;
        }

        .current-score .value {
          font-size: 2.5rem;
          font-weight: 900;
          color: #00f2ff;
          text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
        }

        .high-score .value {
          font-size: 1.2rem;
          font-weight: 700;
          color: #ff00ff;
          text-shadow: 0 0 8px rgba(255, 0, 255, 0.5);
        }

        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: auto;
          animation: fadeIn 0.4s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; background: rgba(0,0,0,0); }
          to { opacity: 1; background: rgba(0,0,0,0.7); }
        }

        .content {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 25px;
          max-width: 600px;
          padding: 40px;
        }

        .title { 
          font-size: 5rem; 
          font-weight: 900; 
          margin: 0; 
          letter-spacing: 10px;
          color: #00f2ff;
          text-shadow: 0 0 20px rgba(0, 242, 255, 0.8), 0 0 40px rgba(0, 242, 255, 0.4);
        }

        .neon-line {
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ff00ff, transparent);
          box-shadow: 0 0 15px #ff00ff;
        }

        .title-gameover { 
          font-size: 4rem; 
          color: #ff4757; 
          margin: 0; 
          letter-spacing: 5px;
          text-shadow: 0 0 20px rgba(255, 71, 87, 0.6);
        }

        .subtitle { 
          font-size: 1rem; 
          letter-spacing: 5px;
          opacity: 0.8; 
          margin: 0;
          color: #ff00ff;
        }

        .btn-neon {
          background: transparent;
          border: 2px solid #00f2ff;
          padding: 18px 40px;
          color: #00f2ff;
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 3px;
          box-shadow: inset 0 0 10px rgba(0, 242, 255, 0.2), 0 0 15px rgba(0, 242, 255, 0.2);
        }

        .btn-neon:hover {
          background: #00f2ff;
          color: black;
          box-shadow: 0 0 30px rgba(0, 242, 255, 0.6);
          transform: translateY(-3px);
        }

        .btn-restart {
          border-color: #ff00ff;
          color: #ff00ff;
          box-shadow: inset 0 0 10px rgba(255, 0, 255, 0.2), 0 0 15px rgba(255, 0, 255, 0.2);
        }

        .btn-restart:hover {
          background: #ff00ff;
          color: white;
          box-shadow: 0 0 30px rgba(255, 0, 255, 0.6);
        }

        .final-score-neon {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 40px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .score-details {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .score-value {
          font-size: 3rem;
          font-weight: 900;
          color: #00f2ff;
        }

        .score-label {
          font-size: 0.8rem;
          letter-spacing: 2px;
          opacity: 0.6;
        }

        .controls-hint {
          margin-top: 30px;
          display: flex;
          gap: 30px;
          opacity: 0.6;
        }

        .control-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 0.7rem;
          letter-spacing: 2px;
        }

        .control-item span {
          color: #ff00ff;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .icon-gold { color: #f1c40f; filter: drop-shadow(0 0 10px rgba(241, 196, 15, 0.5)); }
      `}</style>
    </div>
  );
}
