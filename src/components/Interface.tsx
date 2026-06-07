import { useGameStore } from '../stores/useGameStore';
import { Play, RotateCcw, Trophy, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Interface() {
  const { phase, score, highScore, start, restart, togglePause, checkpointPosition, isMusicMuted, toggleMusic } = useGameStore();
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const checkMilestone = (m: number, msg: string) => {
      if (score >= m && score < m + 2) { // Brief window for trigger
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000); // Display for 3 seconds
      }
    };

    checkMilestone(200, "NEW PLATFORMS DETECTED: MOVING PLATFORMS ACTIVE");
    checkMilestone(400, "WARNING: DESTRUCTIBLE PLATFORMS AHEAD");
    checkMilestone(600, "EXPERT ZONE: PLATFORM SIZE REDUCED");
    checkMilestone(750, "FINAL ASCENT: SUMMIT NEARBY");
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
              <Play size={24} fill="currentColor" /> 미션 시작
            </button>
            <div className="controls-hint">
              <div className="control-item"><span>WASD</span> 이동</div>
              <div className="control-item"><span>SPACE</span> 점프</div>
              <div className="control-item"><span>R</span> 리스폰</div>
              <div className="control-item"><span>MOUSE</span> 시점</div>
              <div className="control-item"><span>ESC</span> 일시정지</div>
              <div className="control-item"><span style={{ color: '#ffd700' }}>깃발이 있는 발판</span> 체크포인트</div>
            </div>
            {checkpointPosition && (
              <p className="checkpoint-msg">체크포인트 활성화: {checkpointPosition[1].toFixed(0)}m</p>
            )}
          </div>
        </div>
      )}

      {/* Pause Screen */}
      {phase === 'PAUSED' && (
        <div className="overlay pause-overlay">
          <div className="content">
            <h2 className="title">일시정지</h2>
            <div className="neon-line"></div>
            <button className="btn-neon" onClick={togglePause}>
              <Play size={24} fill="currentColor" /> 계속하기
            </button>
            <button className="btn-neon" onClick={toggleMusic} style={{ marginTop: '10px', background: '#333' }}>
              {isMusicMuted ? '음악 켜기' : '음악 끄기'}
            </button>
            <div className="controls-hint">
              <div className="control-item"><span>ESC</span> 계속하기</div>
              <div className="control-item"><span style={{ color: '#ffd700' }}>깃발이 있는 발판</span> 체크포인트로 진행 상황 저장</div>
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
