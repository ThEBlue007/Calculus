import { useState, useEffect, useRef } from 'react';
import { playSound } from '../utils/sound';

export default function Minigame({ onComplete, onEarn }) {
  const [timeLeft, setTimeLeft] = useState(5);
  const [coins, setCoins] = useState([]);
  const [earned, setEarned] = useState(0);
  const earnedRef = useRef(0);
  
  useEffect(() => {
    // Generate an initial coin
    spawnCoin();
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onEarn(earnedRef.current);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const spawnCoin = () => {
    const newCoin = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10, // 10% to 90%
      y: Math.random() * 80 + 10,
    };
    setCoins(prev => [...prev.slice(-4), newCoin]); // Max 5 coins on screen
  };

  const handleCatch = (id) => {
    playSound('powerup');
    earnedRef.current += 5;
    setEarned(earnedRef.current);
    setCoins(prev => prev.filter(c => c.id !== id));
    // Spawn 2 new coins when caught to increase chaos!
    spawnCoin();
    if (Math.random() > 0.5) spawnCoin();
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center p-8 border-4 border-zigguratGold animate-fade-in overflow-hidden rounded">
      <h2 className="text-3xl sm:text-5xl font-black text-zigguratGold ziggurat-title animate-pop mt-4">
        BONUS STAGE!
      </h2>
      <p className="text-white/80 font-bold tracking-widest uppercase mt-2">
        Catch the Golden Drachmas!
      </p>
      
      <div className="text-2xl font-bold text-zigguratGold mt-4">
        Collected: {earned} 🪙
      </div>

      <div className="text-6xl font-black text-white mt-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
        {timeLeft}s
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {coins.map(coin => (
          <button
            key={coin.id}
            onClick={() => handleCatch(coin.id)}
            className="absolute text-5xl sm:text-6xl cursor-pointer hover:scale-110 active:scale-95 transition-transform pointer-events-auto"
            style={{ 
              left: `${coin.x}%`, 
              top: `${coin.y}%`,
              animation: 'pop 0.3s ease-out' 
            }}
          >
            <span className="drop-shadow-[0_0_15px_rgba(212,175,55,1)]">🪙</span>
          </button>
        ))}
      </div>
    </div>
  );
}
