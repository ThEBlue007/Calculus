import { useState, useContext, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Leaderboard from './components/Leaderboard';
import Shop from './components/Shop';
import { GameContext } from './context/GameContext';

export default function App() {
  const [gameState, setGameState] = useState('menu'); // menu, timeAttack, tartarus, leaderboard, rules, shop
  const [finalScore, setFinalScore] = useState(0);
  const [finalStats, setFinalStats] = useState({ maxStreak: 0, questionsAnswered: 0 });
  const [gameHistory, setGameHistory] = useState([]);
  const [lastMode, setLastMode] = useState('timeAttack');
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const { drachmas, rewardUser } = useContext(GameContext);

  const startGame = (mode) => {
    setGameState(mode);
    setShowCountdown(true);
    setCountdown(3);
  };

  useEffect(() => {
    let timer;
    if (showCountdown) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setShowCountdown(false);
      }
    }
    return () => clearTimeout(timer);
  }, [showCountdown, countdown]);

  const handleGameOver = async (score, stats = { maxStreak: 0, questionsAnswered: 0 }, history = []) => {
    setFinalScore(score);
    setFinalStats(stats);
    setGameHistory(history);
    const modeStr = gameState === 'tartarus' ? 'tartarus' : 'timeAttack';
    setLastMode(modeStr);
    await rewardUser(score, modeStr);
    setGameState('leaderboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {gameState === 'menu' && !showCountdown && (
        <div className="w-full max-w-md stone-panel p-6 sm:p-8 text-center font-sans z-10 animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-zigguratStone to-zigguratGold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-2 ziggurat-title">
            DERIVATIVE CHALLENGE
          </h1>
          <h2 className="text-lg sm:text-xl text-zigguratTerracotta font-bold tracking-[0.2em] mb-8 uppercase">
            The Ziggurat Trials
          </h2>
          
          <div className="bg-black/40 rounded p-4 mb-8 text-left border border-zigguratStone/20 shadow-inner">
            <ul className="text-sm text-zigguratStone space-y-3 font-medium">
              <li className="flex items-center gap-3">
                <span className="text-xl">⏳</span> Time Attack: 60 Seconds
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">✅</span> Correct: +100 Points
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">❌</span> Wrong: -3 Seconds
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">🔥</span> Streak: 3 in a row = x2 Score
              </li>
            </ul>
          </div>
          
          <button 
            onClick={() => startGame('timeAttack')}
            className="ziggurat-btn w-full mb-4"
          >
            BEGIN TRIAL (TIME ATTACK)
          </button>

          <button 
            onClick={() => startGame('tartarus')}
            className="w-full bg-[#3e2723] hover:bg-[#4e342e] text-[#ffccbc] border-b-4 border-[#1b0000] active:translate-y-1 active:border-b-0 py-3 sm:py-4 px-6 rounded font-black tracking-widest uppercase transition-all mb-4 text-sm"
          >
            TARTARUS MODE (SURVIVAL)
          </button>

          <button 
            onClick={() => setGameState('shop')}
            className="w-full bg-[#1e3a5f] hover:bg-[#2a4d7a] text-blue-100 border-b-4 border-[#0a1931] active:translate-y-1 active:border-b-0 py-3 sm:py-4 px-6 rounded font-black tracking-widest uppercase transition-all mb-4 text-sm shadow-[0_0_15px_rgba(30,58,95,0.5)]"
          >
            SHOP (🪙 {drachmas})
          </button>

          <button 
            onClick={() => setGameState('leaderboard')}
            className="w-full bg-transparent border-2 border-zigguratGold text-zigguratGold hover:bg-zigguratGold/10 py-3 px-6 rounded font-bold tracking-widest uppercase transition-all mb-4 text-sm"
          >
            HALL OF FAME
          </button>

          <button 
            onClick={() => setShowTutorial(true)}
            className="text-zigguratStone/60 hover:text-zigguratStone text-xs tracking-widest uppercase underline underline-offset-4"
          >
            TUTORIAL & SKILLS
          </button>
        </div>
      )}

      {showTutorial && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="stone-panel p-6 max-w-md w-full relative">
            <button 
              onClick={() => setShowTutorial(false)}
              className="absolute top-2 right-4 text-3xl text-zigguratTerracotta font-bold hover:scale-110"
            >
              &times;
            </button>
            <h2 className="text-2xl font-black text-zigguratGold mb-4 text-center">HOW TO PLAY</h2>
            
            <div className="space-y-4 text-sm text-zigguratStone text-left h-64 overflow-y-auto pr-2 scrollbar-hide">
              <p><strong>Goal:</strong> Solve as many derivative problems as possible before time runs out.</p>
              <p><strong>Tartarus Mode:</strong> Infinite time, but you only have 3 Hearts. Lose a heart for each wrong answer.</p>
              <p><strong>Boss Stage:</strong> Every 10th question is a Boss Stage. It awards 500 base points but penalties are doubled!</p>
              
              <h3 className="text-lg font-black text-white mt-4 border-b border-white/20 pb-1">God Skills (Buy upgrades in Shop!)</h3>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">🦉</span>
                <div>
                  <strong className="text-white">Athena (50/50):</strong>
                  <p>Disables 2 incorrect answers instantly.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">⏳</span>
                <div>
                  <strong className="text-white">Chronos (+10s):</strong>
                  <p>Adds 10 seconds to your timer.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <strong className="text-white">Hermes (3x Score):</strong>
                  <p>Multiplies your score by 3 for the next 3 questions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCountdown && (
        <div className="z-50 animate-pulse">
           <div className="text-9xl font-black text-zigguratGold drop-shadow-[0_0_50px_rgba(212,175,55,1)]">
             {countdown > 0 ? countdown : 'GO!'}
           </div>
        </div>
      )}

      {(gameState === 'timeAttack' || gameState === 'tartarus') && !showCountdown && (
        <div className="w-full flex justify-center z-10 animate-fade-in relative pt-4">
          <GameBoard onGameOver={handleGameOver} onQuit={() => setGameState('menu')} mode={gameState} />
        </div>
      )}

      {gameState === 'leaderboard' && (
        <div className="w-full flex justify-center z-10 animate-fade-in">
          <Leaderboard score={finalScore} stats={finalStats} mode={lastMode} viewOnly={finalScore === 0} onPlayAgain={() => setGameState('menu')} history={gameHistory} />
        </div>
      )}
      
      {gameState === 'shop' && (
        <div className="w-full flex justify-center z-10 animate-fade-in">
          <Shop onBack={() => setGameState('menu')} />
        </div>
      )}
    </div>
  );
}
