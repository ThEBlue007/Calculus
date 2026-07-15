import { useState, useEffect, useRef, useContext } from 'react';
import { BlockMath } from 'react-katex';
import { playSound, playHeartbeat, startBackgroundMusic, stopBackgroundMusic, sfxEnabled, bgmEnabled, setSfxEnabled, setBgmEnabled } from '../utils/sound';
import { GameContext } from '../context/GameContext';
import Minigame from './Minigame';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const MAX_TIME = 60;

export default function GameBoard({ onGameOver, onQuit, mode = 'timeAttack' }) {
  const { drachmas, upgrades, relics, rewardUser } = useContext(GameContext);

  const [timeLeft, setTimeLeft] = useState(MAX_TIME);
  const [hearts, setHearts] = useState((mode === 'tartarus' && relics?.aegis) ? 4 : 3);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [question, setQuestion] = useState(null);
  const [nextQuestionCache, setNextQuestionCache] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMinigame, setShowMinigame] = useState(false);
  
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isSuccessFlashing, setIsSuccessFlashing] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [floatingPoints, setFloatingPoints] = useState({ text: null, id: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [sfx, setSfx] = useState(sfxEnabled);
  const [bgm, setBgm] = useState(bgmEnabled);
  
  // Power-up States
  const [athenaCharges, setAthenaCharges] = useState(upgrades.athena === 2 ? 2 : 1);
  const [lhopitalCharges, setLhopitalCharges] = useState(upgrades.lhopital === 2 ? 2 : 1);
  const [hasChronos, setHasChronos] = useState(true);
  const [hasHermes, setHasHermes] = useState(true);
  
  const [activeGod, setActiveGod] = useState(null); // 'athena' | 'chronos' | 'hermes' | 'lhopital'
  
  const [disabledOptions, setDisabledOptions] = useState([]);
  const [hermesCharges, setHermesCharges] = useState(0); 

  // Divine Events
  const [activeEvent, setActiveEvent] = useState(null); // 'hades' | 'apollo' | 'zeus' | null
  const [eventAnnouncement, setEventAnnouncement] = useState(null);
  const [apolloReveal, setApolloReveal] = useState(false);
  const [apolloTargetIndex, setApolloTargetIndex] = useState(null);

  const timerRef = useRef(null);
  const heartbeatRef = useRef(null);
  const isZeusActiveRef = useRef(false);
  const isAnsweringRef = useRef(false);

  useEffect(() => {
    startBackgroundMusic();
    fetchNextQuestion(0);
    return () => stopBackgroundMusic();
  }, []);

  const prefetchQuestion = async (currentCount, currentScore) => {
    try {
      let difficulty = 'easy';
      if (currentScore > 1500 || currentCount > 20) difficulty = 'hard';
      else if (currentScore > 500 || currentCount > 10) difficulty = 'medium';

      const nextCount = currentCount + 1;
      const res = await fetch(`${API_URL}/question?difficulty=${difficulty}&count=${nextCount}&mode=${mode}`);
      const data = await res.json();
      setNextQuestionCache(data);
    } catch (err) {
      console.error('Prefetch error:', err);
    }
  };

  useEffect(() => {
    // Pause timer if paused by user, or if an event/god animation is playing!
    if (isPaused || activeGod || eventAnnouncement || showMinigame) return;
    
    if (mode === 'timeAttack') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          // If Zeus is active, time goes twice as fast (-2 instead of -1)
          const drop = isZeusActiveRef.current ? 2 : 1;
          return Math.max(0, prev - drop);
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeGod, eventAnnouncement, mode, showMinigame]);

  // Sync ref for zeus event to be used in setInterval
  useEffect(() => {
    isZeusActiveRef.current = activeEvent === 'zeus';
  }, [activeEvent]);

  // Heartbeat Effect
  useEffect(() => {
    if (isPaused || showMinigame) {
       if (heartbeatRef.current) {
         clearInterval(heartbeatRef.current);
         heartbeatRef.current = null;
       }
       return;
    }
    
    if (mode === 'timeAttack' && timeLeft <= 10 && timeLeft > 0) {
      if (!heartbeatRef.current) {
        heartbeatRef.current = setInterval(() => {
          playHeartbeat(timeLeft <= 5);
        }, timeLeft <= 5 ? 400 : 800);
      }
    } else {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    }
  }, [timeLeft, mode, isPaused, showMinigame]);

  useEffect(() => {
    if (mode === 'timeAttack' && timeLeft <= 0) {
      onGameOver(score, { maxStreak, questionsAnswered: questionCount - 1 }, history);
    }
  }, [timeLeft, score, maxStreak, questionCount, onGameOver, mode, history]);

  useEffect(() => {
    if (mode === 'tartarus' && hearts <= 0) {
      onGameOver(score, { maxStreak, questionsAnswered: questionCount - 1 }, history);
    }
  }, [hearts, score, maxStreak, questionCount, onGameOver, mode, history]);

  // Clear floating points automatically after animation
  useEffect(() => {
    if (floatingPoints.text) {
      const timer = setTimeout(() => {
        setFloatingPoints(prev => ({ ...prev, text: null }));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [floatingPoints.id, floatingPoints.text]);

  const toggleBgm = () => {
    const newVal = !bgm;
    setBgm(newVal);
    setBgmEnabled(newVal);
    if (newVal) startBackgroundMusic();
  };

  const toggleSfx = () => {
    const newVal = !sfx;
    setSfx(newVal);
    setSfxEnabled(newVal);
  };

  const triggerRandomEvent = () => {
    const events = ['hades', 'apollo', 'zeus'];
    const ev = events[Math.floor(Math.random() * events.length)];
    setActiveEvent(ev);
    
    if (ev === 'hades') setEventAnnouncement("CURSE OF HADES! (Blindness)");
    if (ev === 'apollo') setEventAnnouncement("BLESSING OF APOLLO! (Truth Revealed)");
    if (ev === 'zeus') setEventAnnouncement("WRATH OF ZEUS! (Double Risk, Double Reward)");

    playSound('boss');
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 800);

    setTimeout(() => {
      setEventAnnouncement(null);
    }, 1200);
    return ev;
  };

  const fetchNextQuestion = async (currentCount) => {
    setLoading(true);
    setSelectedAnswer(null);
    setFeedback(null);
    setDisabledOptions([]);
    
    if (activeEvent) {
      setActiveEvent(null);
    }
    
    try {
      const nextCount = currentCount + 1;
      let data = nextQuestionCache;
      
      if (!data) {
        let difficulty = 'easy';
        if (score > 1500 || currentCount > 20) difficulty = 'hard';
        else if (score > 500 || currentCount > 10) difficulty = 'medium';

        const res = await fetch(`${API_URL}/question?difficulty=${difficulty}&count=${nextCount}&mode=${mode}`);
        data = await res.json();
      }
      
      // Clear cache once used
      setNextQuestionCache(null);
      
      let currentEvent = activeEvent;
      if (nextCount > 1 && nextCount % 10 === 4) {
        currentEvent = triggerRandomEvent();
      }

      if (nextCount > 1 && nextCount % 10 === 8) {
        setShowMinigame(true);
      }

      if (data.type === 'twin_boss') {
        playSound('boss');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 800);
        setEventAnnouncement("DOUBLE TROUBLE!");
        setTimeout(() => setEventAnnouncement(null), 1200);
        
        if (mode === 'timeAttack') {
          setTimeLeft(prev => prev + 15);
          setFloatingPoints(prev => ({ text: '+15s', id: prev.id + 1 }));
        } else {
          setHearts(prev => Math.min(relics?.aegis ? 4 : 3, prev + 1));
          setFloatingPoints(prev => ({ text: '+1 ❤️', id: prev.id + 1 }));
        }
      } else if (data.type === 'boss') {
        playSound('boss');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 800);
      }
      
      setQuestionCount(nextCount);
      setQuestion(data);
      
      // Handle Apollo Reveal
      if (currentEvent === 'apollo') {
         try {
           const apolloRes = await fetch(`${API_URL}/apollo`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ id: data.id })
           });
           const apolloData = await apolloRes.json();
           setApolloTargetIndex(apolloData.correctIndex);
           setApolloReveal(true);
           setTimeout(() => {
             setApolloReveal(false);
             setApolloTargetIndex(null);
           }, 1500);
         } catch(e) {}
      }
      
      // Trigger prefetch for the next next question!
      prefetchQuestion(nextCount, score);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (index) => {
    if (isPaused || selectedAnswer !== null || !question || isAnsweringRef.current) return;
    if (disabledOptions.includes(index)) return;
    
    isAnsweringRef.current = true;
    setSelectedAnswer(index);
    
    try {
      const res = await fetch(`${API_URL}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: question.id, answerIndex: index, isTwin: question.isTwinPhase2 })
      });
      const data = await res.json();
      
      const historyEntry = {
        math: question.math,
        options: question.options,
        selectedAnswerIndex: index,
        correctAnswerIndex: data.correctAnswerIndex,
        explanation: data.explanation,
        isCorrect: data.correct
      };
      setHistory(prev => [...prev, historyEntry]);

      if (data.correct) {
        playSound('correct');
        setFeedback('correct');
        
        const newStreak = streak + 1;
        setStreak(newStreak);
        setMaxStreak(prev => Math.max(prev, newStreak));
        
        // Calculate points
        let basePoints = question.isBoss ? (question.type === 'twin_boss' ? 750 : 500) : 100;
        let streakMult = newStreak >= 3 ? 2 : 1;
        const hermesMultVal = upgrades.hermes === 2 ? 5 : 3;
        let hermesMult = hermesCharges > 0 ? hermesMultVal : 1;
        let zeusMult = activeEvent === 'zeus' ? 2 : 1;
        
        const pointsEarned = basePoints * streakMult * hermesMult * zeusMult;
        setScore(prev => prev + pointsEarned);
        
        if (hermesCharges > 0) setHermesCharges(prev => prev - 1);
        
        setFloatingPoints(prev => ({ text: `+${pointsEarned}`, id: prev.id + 1 }));
        setIsSuccessFlashing(true);
        setTimeout(() => setIsSuccessFlashing(false), 400);

        if (question.twin) {
          setTimeout(() => {
            setQuestion({ ...question.twin, type: 'boss', isBoss: true, isTwinPhase2: true });
            setSelectedAnswer(null);
            setFeedback(null);
            setDisabledOptions([]);
            setEventAnnouncement("PHASE 2!");
            setTimeout(() => setEventAnnouncement(null), 1200);
            isAnsweringRef.current = false;
          }, 600);
        } else {
          setTimeout(() => {
            isAnsweringRef.current = false;
            fetchNextQuestion(questionCount);
          }, 1500);
        }
      } else {
        playSound('wrong');
        setFeedback('wrong');
        setStreak(0);
        
        if (hermesCharges > 0) setHermesCharges(prev => prev - 1);

        if (mode === 'tartarus') {
           const damage = activeEvent === 'zeus' || question.isBoss ? 2 : 1;
           const newHearts = Math.max(0, hearts - damage);
           setHearts(newHearts);
           setFloatingPoints(prev => ({ text: `-${damage} ❤️`, id: prev.id + 1 }));
           
           setIsShaking(true);
           setIsFlashing(true);
           setTimeout(() => setIsShaking(false), 400);
           setTimeout(() => setIsFlashing(false), 500);

           if (newHearts === 0) {
             setTimeout(() => onGameOver(score, { maxStreak, questionsAnswered: questionCount - 1 }, history), 600);
           } else {
             if (question.twin) {
               setTimeout(() => {
                 setQuestion({ ...question.twin, type: 'boss', isBoss: true, isTwinPhase2: true });
                 setSelectedAnswer(null);
                 setFeedback(null);
                 setDisabledOptions([]);
                 isAnsweringRef.current = false;
               }, 600);
             } else {
               setTimeout(() => {
                 isAnsweringRef.current = false;
                 fetchNextQuestion(questionCount);
               }, 1500);
             }
           }
        } else {
           const penaltyBase = question.isBoss ? 6 : 3;
           const zeusPenaltyMult = activeEvent === 'zeus' ? 2 : 1;
           const penalty = (penaltyBase * zeusPenaltyMult) - (relics?.sandals ? 1 : 0);
           
           setFloatingPoints(prev => ({ text: `-${penalty}s`, id: prev.id + 1 }));
           setIsShaking(true);
           setIsFlashing(true);
           setTimeout(() => setIsShaking(false), 400);
           setTimeout(() => setIsFlashing(false), 500);

           setTimeLeft(prev => {
             const newTime = Math.max(0, prev - penalty);
             if (newTime === 0) {
               setTimeout(() => onGameOver(score, { maxStreak, questionsAnswered: questionCount - 1 }, history), 600);
             } else {
               if (question.twin) {
                 setTimeout(() => {
                   setQuestion({ ...question.twin, type: 'boss', isBoss: true, isTwinPhase2: true });
                   setSelectedAnswer(null);
                   setFeedback(null);
                   setDisabledOptions([]);
                   isAnsweringRef.current = false;
                 }, 600);
               } else {
                 setTimeout(() => {
                   isAnsweringRef.current = false;
                   fetchNextQuestion(questionCount);
                 }, 1500);
               }
             }
             return newTime;
           });
        }
      }
    } catch (err) {
      console.error(err);
      isAnsweringRef.current = false;
      setSelectedAnswer(null);
    }
  };

  const useAthena = () => {
    if (athenaCharges <= 0 || !question) return;
    playSound('powerup');
    setAthenaCharges(prev => prev - 1);
    
    fetch(`${API_URL}/athena`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: question.id, isTwin: question.isTwinPhase2 })
    })
    .then(res => res.json())
    .then(data => {
        if (data.disabled) {
          setDisabledOptions(data.disabled);
          setActiveGod('athena');
          setTimeout(() => setActiveGod(null), 1500);
        }
    })
    .catch(console.error);
  };

  const useLhopital = async () => {
    if (lhopitalCharges <= 0 || !question) return;
    playSound('powerup');
    setLhopitalCharges(prev => prev - 1);
    
    try {
      const res = await fetch(`${API_URL}/lhopital`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: question.id, isTwin: question.isTwinPhase2 })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setActiveGod('lhopital');
      setTimeout(() => setActiveGod(null), 1500);

      // Auto-solve but 0 points
      setSelectedAnswer(data.correctIndex);
      playSound('correct');
      setFeedback('correct');
      setStreak(0); // Break streak
      if (hermesCharges > 0) setHermesCharges(prev => prev - 1);

      const historyEntry = {
        math: question.math,
        options: question.options,
        selectedAnswerIndex: data.correctIndex,
        correctAnswerIndex: data.correctIndex,
        explanation: "ใช้ L'Hôpital's Secret ข้ามข้อนี้",
        isCorrect: true
      };
      setHistory(prev => [...prev, historyEntry]);

      setFloatingPoints(prev => ({ text: 'SKIPPED!', id: prev.id + 1 }));
      setIsSuccessFlashing(true);
      setTimeout(() => setIsSuccessFlashing(false), 400);

      if (question.twin) {
        setTimeout(() => {
          setQuestion({ ...question.twin, type: 'boss', isBoss: true, isTwinPhase2: true });
          setSelectedAnswer(null);
          setFeedback(null);
          setDisabledOptions([]);
          setEventAnnouncement("PHASE 2!");
          setTimeout(() => setEventAnnouncement(null), 1200);
        }, 600);
      } else {
        setTimeout(() => fetchNextQuestion(questionCount), 600); 
      }
    } catch(err) {
      console.error(err);
    }
  };

  const useChronos = () => {
    if (!hasChronos) return;
    playSound('powerup');
    setHasChronos(false);
    
    const timeAdd = upgrades.chronos === 2 ? 15 : 10;
    
    if (mode === 'tartarus') {
       // Chronos restores 1 heart in Tartarus
       setHearts(prev => Math.min(3, prev + 1));
       setFloatingPoints(prev => ({ text: '+1 ❤️', id: prev.id + 1 }));
    } else {
       setTimeLeft(prev => prev + timeAdd);
       setFloatingPoints(prev => ({ text: `+${timeAdd}s`, id: prev.id + 1 }));
    }
    
    setActiveGod('chronos');
    setTimeout(() => setActiveGod(null), 1500);
    
    setIsSuccessFlashing(true);
    setTimeout(() => setIsSuccessFlashing(false), 400);
  };

  const useHermes = () => {
    if (!hasHermes) return;
    playSound('powerup');
    setHasHermes(false);
    setHermesCharges(3);
    
    setActiveGod('hermes');
    setTimeout(() => setActiveGod(null), 1500);
    
    const mult = upgrades.hermes === 2 ? 5 : 3;
    setFloatingPoints(prev => ({ text: `${mult}x SCORE!`, id: prev.id + 1 }));
    setIsSuccessFlashing(true);
    setTimeout(() => setIsSuccessFlashing(false), 400);
  };

  const getContainerClass = () => {
    let classes = "w-full max-w-lg stone-panel p-3 sm:p-6 transition-all overflow-hidden font-sans relative ";
    if (isShaking) classes += "animate-shake border-zigguratTerracotta ";
    else if (isSuccessFlashing) classes += "animate-flash-green border-zigguratGold ";
    else if (activeEvent === 'zeus') classes += "border-[#1e90ff] shadow-[0_0_50px_rgba(30,144,255,0.5)] ";
    else if (question?.isBoss) classes += "border-zigguratTerracotta shadow-[0_0_50px_rgba(226,114,91,0.5)] ";
    else if (streak >= 3) classes += "shadow-[0_0_40px_rgba(212,175,55,0.4)] border-zigguratGold ";
    return classes;
  };

  const getMathSizeClass = () => {
    if (!question) return "text-3xl sm:text-5xl";
    if (question.math.length > 25) return "text-xl sm:text-3xl";
    if (question.math.length > 15) return "text-2xl sm:text-4xl";
    return "text-3xl sm:text-5xl";
  };

  const timePct = (timeLeft / MAX_TIME) * 100;
  let barColor = "bg-zigguratGold";
  if (timePct < 20) barColor = "bg-zigguratTerracotta animate-pulse-fast";
  else if (timePct < 50) barColor = "bg-yellow-600";

  return (
    <div className="w-full flex justify-center px-2 relative min-h-[80vh]">
      {mode === 'timeAttack' && timeLeft <= 10 && (
         <div className="fixed inset-0 pointer-events-none z-0 animate-pulse-fast bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(226,114,91,0.3)_100%)]" />
      )}
      {activeEvent === 'zeus' && (
         <div className="fixed inset-0 pointer-events-none z-0 animate-pulse bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(30,144,255,0.15)_100%)] border-[8px] border-[#1e90ff]/30 box-border" />
      )}
      {activeEvent === 'hades' && (
         <div className="fixed inset-0 pointer-events-none z-30 bg-black/60 backdrop-blur-[2px] transition-all duration-1000" />
      )}
      
      <div className={`z-10 ${getContainerClass()} flex flex-col justify-between relative`}>
        
        {/* Settings / Pause Button */}
        <button 
          onClick={() => setIsPaused(true)}
          className="absolute top-2 sm:top-4 right-2 sm:right-4 z-40 bg-black/50 border border-zigguratStone/30 rounded px-2 py-1 text-white/50 hover:text-white transition-colors"
        >
          ⚙️
        </button>

        {isPaused && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded">
            <h2 className="text-4xl font-black text-zigguratGold mb-8 animate-pulse">PAUSED</h2>
            <div className="flex flex-col gap-4 w-full max-w-xs mb-8">
               <button onClick={toggleBgm} className={`ziggurat-btn text-sm ${bgm ? 'bg-zigguratGold text-black' : 'bg-black text-white/50 border-white/20'}`}>
                 BGM: {bgm ? 'ON' : 'OFF'}
               </button>
               <button onClick={toggleSfx} className={`ziggurat-btn text-sm ${sfx ? 'bg-zigguratGold text-black' : 'bg-black text-white/50 border-white/20'}`}>
                 SFX: {sfx ? 'ON' : 'OFF'}
               </button>
            </div>
            <button onClick={() => setIsPaused(false)} className="ziggurat-btn w-full max-w-xs text-sm mb-4">
              RESUME
            </button>
            <button onClick={onQuit} className="w-full max-w-xs bg-red-900/50 hover:bg-red-900 text-white border border-red-500 py-3 rounded font-bold uppercase transition-colors text-sm shadow-[0_0_10px_rgba(255,0,0,0.3)]">
              QUIT TO MENU
            </button>
          </div>
        )}

        {eventAnnouncement && (
          <div className="absolute inset-0 pointer-events-none z-40 flex flex-col items-center justify-center">
             <div className={`text-4xl sm:text-6xl font-black text-white px-8 py-6 border-y-8 animate-pop drop-shadow-2xl text-center leading-tight
               ${activeEvent === 'hades' ? 'border-purple-600 shadow-[0_0_50px_rgba(147,51,234,0.8)]' : ''}
               ${activeEvent === 'apollo' ? 'border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.8)]' : ''}
               ${activeEvent === 'zeus' ? 'border-[#1e90ff] shadow-[0_0_50px_rgba(30,144,255,0.8)]' : ''}
             `}>
               {eventAnnouncement}
             </div>
          </div>
        )}

        {activeGod && (
          <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
            <div className="animate-slide-up-fade flex items-center gap-4 bg-black/80 p-4 rounded-2xl border-2 border-zigguratGold shadow-2xl">
              <img 
                src={`/${activeGod}.jpg`} 
                alt={activeGod} 
                className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg shadow-md border border-white/20"
              />
              <div className="text-xl sm:text-2xl font-black text-zigguratGold uppercase drop-shadow-md text-left leading-tight pr-4">
                {activeGod === 'athena' && "Athena's Wisdom!"}
                {activeGod === 'lhopital' && "L'Hôpital's Secret!"}
                {activeGod === 'chronos' && (mode === 'tartarus' ? "Life Restored!" : "Time Rewound!")}
                {activeGod === 'hermes' && "Godspeed!"}
              </div>
            </div>
          </div>
        )}

        <div>
          {mode === 'timeAttack' ? (
            <div className="absolute top-0 left-0 w-full h-2 sm:h-3 bg-black/50 border-b border-zigguratStone/20">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${barColor}`} 
                style={{ width: `${timePct}%` }}
              />
            </div>
          ) : (
            <div className="absolute top-0 left-0 w-full flex justify-center mt-2 space-x-2">
               {[...Array(relics?.aegis ? 4 : 3)].map((_, idx) => {
                 const i = idx + 1;
                 return (
                   <span key={i} className={`text-2xl transition-all ${i <= hearts ? 'text-red-500 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)] scale-110 animate-pulse' : 'text-gray-700 opacity-50 scale-90'}`}>
                     ❤️
                   </span>
                 );
               })}
            </div>
          )}

          {floatingPoints.text && (
            <div key={floatingPoints.id} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
               <span className={`text-5xl sm:text-7xl font-black animate-float-up drop-shadow-2xl ${floatingPoints.text.includes('-') ? 'text-zigguratTerracotta' : 'text-zigguratGold'}`} style={{ textShadow: '2px 2px 4px #000' }}>
                  {floatingPoints.text}
               </span>
            </div>
          )}

          {showMinigame && (
            <Minigame 
              onComplete={() => setShowMinigame(false)} 
              onEarn={(amt) => {
                 rewardUser(null, null, amt); // Just to add Drachmas directly
                 setFloatingPoints(prev => ({ text: `+${amt} 🪙`, id: prev.id + 1 }));
              }}
            />
          )}

          <div className={`flex justify-between items-end mb-4 ${mode === 'tartarus' ? 'mt-8' : 'mt-4'}`}>
            <div className="text-xs sm:text-sm font-bold text-zigguratStone/60 uppercase tracking-widest">
              {mode === 'timeAttack' ? 'Time Left' : 'Survived'}
              <div className={`text-3xl sm:text-4xl font-black leading-none mt-1 ${mode === 'timeAttack' && timeLeft <= 10 ? 'text-zigguratTerracotta animate-pulse' : 'text-zigguratStone'}`}>
                {mode === 'timeAttack' ? timeLeft : questionCount - 1}
              </div>
            </div>
            
            <div className="text-right text-xs sm:text-sm font-bold text-zigguratStone/60 uppercase tracking-widest">
              Score
              <div className="text-3xl sm:text-4xl font-black text-zigguratGold leading-none mt-1">
                {score}
              </div>
            </div>
          </div>

          <div className="h-8 sm:h-12 mb-2 sm:mb-4 flex justify-between items-center px-2">
            <div className="flex gap-2">
              {question?.isBoss && (
                <div className="text-lg sm:text-xl font-black italic animate-pulse text-zigguratTerracotta drop-shadow-[0_0_10px_rgba(226,114,91,0.8)] border border-zigguratTerracotta px-2 rounded bg-black/50">
                  BOSS STAGE!
                </div>
              )}
              {activeEvent === 'zeus' && !question?.isBoss && (
                <div className="flex items-center gap-2 font-black italic animate-pulse text-[#1e90ff] drop-shadow-[0_0_10px_rgba(30,144,255,0.8)] border border-[#1e90ff] px-2 rounded bg-black/50">
                  <span className="text-xl">🌩️</span> ZEUS (2x SCORE, 2x {mode === 'timeAttack' ? 'SPEED' : 'DAMAGE'})
                </div>
              )}
              {activeEvent === 'hades' && !question?.isBoss && (
                <div className="flex items-center gap-2 font-black italic animate-pulse text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] border border-purple-500 px-2 rounded bg-black/50">
                  <span className="text-xl">☁️</span> HADES CURSE
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end">
              {streak > 0 && (
                <div key={streak} className={`text-xl sm:text-2xl font-black italic transform -skew-x-6 animate-pop ${streak >= 3 ? 'text-zigguratTerracotta scale-125' : 'text-zigguratGold'}`} style={{ textShadow: '1px 1px 2px #000' }}>
                  {streak} COMBO! {streak >= 3 && 'x2'}
                </div>
              )}
              {hermesCharges > 0 && (
                <div className="text-sm sm:text-base font-bold text-[#87CEEB] animate-pulse">
                  Hermes {upgrades.hermes === 2 ? '5x' : '3x'}: {hermesCharges} left
                </div>
              )}
            </div>
          </div>

          {/* Hades Blur Effect */}
          <div className={`min-h-[100px] sm:min-h-[140px] flex items-center justify-center rounded border-2 mb-4 sm:mb-6 p-2 sm:p-4 shadow-inner relative w-full overflow-hidden ${question?.isBoss ? 'bg-[#2a0808] border-zigguratTerracotta/50' : 'bg-[#1a1510] border-zigguratStone/20'} ${activeEvent === 'hades' ? 'blur-[2px] animate-shake' : ''}`}>
            {loading || !question ? (
              <span className="text-zigguratStone/50 animate-pulse font-serif italic text-xl">Inscribing tablet...</span>
            ) : isPaused ? (
              <span className="text-zigguratStone/50 font-black tracking-widest text-xl">HIDDEN</span>
            ) : (
              <div className={`drop-shadow-md text-white max-w-full overflow-hidden flex justify-center items-center ${getMathSizeClass()}`}>
                <BlockMath math={question.math} />
              </div>
            )}
          </div>

          <div className={`grid ${question?.isBoss ? 'grid-cols-1' : 'grid-cols-2'} gap-2 sm:gap-4 mb-8 ${activeEvent === 'hades' ? 'animate-pulse' : ''}`}>
            {question?.options.map((opt, i) => {
              const isDisabled = disabledOptions.includes(i);
              const isApolloTarget = apolloReveal && apolloTargetIndex === i;
              
              let btnClass = "relative p-2 sm:p-4 rounded border-b-4 font-bold transition-all ";
              
              if (question?.isBoss) {
                btnClass += "text-sm sm:text-xl ";
              } else {
                btnClass += "text-base sm:text-2xl ";
              }

              if (isDisabled) {
                btnClass += "border-black/20 bg-black/40 text-white/10 opacity-30 cursor-not-allowed ";
              } else if (selectedAnswer === null) {
                if (activeEvent === 'hades') btnClass += "animate-shake blur-[1px] ";
                
                if (isApolloTarget) {
                  btnClass += "border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-[0_0_30px_rgba(250,204,21,0.6)] ";
                } else {
                  btnClass += "border-[#5c4a3d] bg-[#3d3128] text-white hover:bg-[#4a3b30] active:translate-y-1 active:border-b-0 ";
                }
              } else {
                if (selectedAnswer === i) {
                  btnClass += feedback === 'correct' 
                    ? "border-yellow-700 bg-zigguratGold text-zigguratDark " 
                    : "border-red-900 bg-zigguratTerracotta text-white ";
                } else {
                  btnClass += "border-black/20 bg-black/40 text-white/30 ";
                }
              }

              return (
                <button 
                  key={i} 
                  onClick={() => handleAnswer(i)}
                  disabled={selectedAnswer !== null || loading || isDisabled || isPaused}
                  className={btnClass}
                  style={{ minHeight: question?.isBoss ? '60px' : '80px' }}
                >
                  <div className="flex items-center justify-center overflow-x-auto scrollbar-hide py-1">
                    {isPaused ? <span className="text-white/20">?</span> : <BlockMath math={opt} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* POWER UPS AREA */}
        <div className="flex justify-center gap-3 sm:gap-6 pt-4 border-t border-zigguratStone/10">
          <div className="flex flex-col items-center">
            <button 
              onClick={useAthena}
              disabled={athenaCharges <= 0 || loading || !question || question.options.length <= 2}
              className={`flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all ${athenaCharges > 0 ? 'bg-[#2c3e50] border-[#34495e] hover:scale-110 shadow-[0_0_15px_rgba(44,62,80,0.6)] text-white' : 'bg-black/50 border-black/30 text-white/20'}`}
              title="Athena's Wisdom"
            >
              <span className="text-xl sm:text-2xl">🦉</span>
            </button>
            <span className={`text-xs sm:text-sm font-bold mt-2 uppercase tracking-wider ${athenaCharges > 0 ? 'text-[#87CEFA]' : 'text-zigguratStone/30'}`}>
              50/50 {upgrades.athena === 2 && `(${athenaCharges})`}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <button 
              onClick={useLhopital}
              disabled={lhopitalCharges <= 0 || loading || !question}
              className={`flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all ${lhopitalCharges > 0 ? 'bg-[#4b0082] border-[#8a2be2] hover:scale-110 shadow-[0_0_15px_rgba(138,43,226,0.6)] text-white' : 'bg-black/50 border-black/30 text-white/20'}`}
              title="L'Hôpital's Secret"
            >
              <span className="text-xl sm:text-2xl">📜</span>
            </button>
            <span className={`text-[10px] sm:text-sm font-bold mt-2 uppercase tracking-wider ${lhopitalCharges > 0 ? 'text-[#e6e6fa]' : 'text-zigguratStone/30'}`}>
              Skip {upgrades.lhopital === 2 && `(${lhopitalCharges})`}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <button 
              onClick={useChronos}
              disabled={!hasChronos || loading}
              className={`flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all ${hasChronos ? 'bg-[#8b4513] border-[#a0522d] hover:scale-110 shadow-[0_0_15px_rgba(139,69,19,0.6)] text-white' : 'bg-black/50 border-black/30 text-white/20'}`}
              title="Chronos' Hourglass"
            >
              <span className="text-xl sm:text-2xl">⏳</span>
            </button>
            <span className={`text-xs sm:text-sm font-bold mt-2 uppercase tracking-wider ${hasChronos ? 'text-green-400' : 'text-zigguratStone/30'}`}>
              {mode === 'tartarus' ? '+1 ❤️' : (upgrades.chronos === 2 ? '+15s' : '+10s')}
            </span>
          </div>
          
          <div className="flex flex-col items-center">
            <button 
              onClick={useHermes}
              disabled={!hasHermes || loading}
              className={`flex flex-col items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 transition-all ${hasHermes ? 'bg-[#006400] border-[#228b22] hover:scale-110 shadow-[0_0_15px_rgba(0,100,0,0.6)] text-white' : 'bg-black/50 border-black/30 text-white/20'}`}
              title="Hermes' Swiftness"
            >
              <span className="text-xl sm:text-2xl">⚡</span>
            </button>
            <span className={`text-xs sm:text-sm font-bold mt-2 uppercase tracking-wider ${hasHermes ? 'text-yellow-400' : 'text-zigguratStone/30'}`}>
              {upgrades.hermes === 2 ? '5x Score' : '3x Score'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
