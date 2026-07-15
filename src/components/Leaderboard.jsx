import { useState, useEffect } from 'react';
import { BlockMath } from 'react-katex';
import MathText from './MathText';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function Leaderboard({ score, stats = { maxStreak: 0, questionsAnswered: 0 }, viewOnly, onPlayAgain, mode = 'timeAttack', history = [] }) {
  const [username, setUsername] = useState('');
  const [submitted, setSubmitted] = useState(viewOnly);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(mode);
  const [showRecap, setShowRecap] = useState(false);

  const getRankTitle = (pts, st, m) => {
    if (pts >= 3000) return { title: "God of Calculus", color: "text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]" };
    if (m === 'tartarus' && st.questionsAnswered >= 25) return { title: "Survivor of Tartarus", color: "text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.8)]" };
    if (pts >= 1000) return { title: "Oracle of Delphi", color: "text-purple-300 drop-shadow-[0_0_10px_rgba(216,180,254,0.8)]" };
    if (st.maxStreak >= 10) return { title: "Combo Master", color: "text-blue-300 drop-shadow-[0_0_10px_rgba(147,197,253,0.8)]" };
    if (pts >= 500) return { title: "Greek Scholar", color: "text-green-300" };
    return { title: "Mortal", color: "text-zigguratStone/70" };
  };

  const rank = getRankTitle(score, stats, mode);

  useEffect(() => {
    // Don't fetch if we just submitted and are viewing the same mode we submitted for, 
    // because handleSubmit already populated playerRank.
    if (viewOnly || (submitted && viewMode !== mode)) {
      setLoading(true);
      fetch(`${API_URL}/leaderboard?mode=${viewMode}`)
        .then(res => res.json())
        .then(data => {
          setLeaderboardData(data);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch leaderboard');
          setLoading(false);
        });
    }
  }, [viewOnly, submitted, viewMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.length < 1) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.toUpperCase(), score, mode })
      });
      const data = await res.json();
      
      if (data.success) {
        setLeaderboardData(data);
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to submit score');
      }
    } catch (err) {
      setError('Server connection error. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md stone-panel p-6 sm:p-8 font-sans">
      <h2 className="text-3xl sm:text-4xl font-black text-center mb-2 ziggurat-title">{viewOnly ? 'HALL OF FAME' : 'TRIAL COMPLETE'}</h2>
      
      {!viewOnly && (
        <div className="text-center text-lg sm:text-xl mb-8 text-zigguratStone">
          Mode: <span className="text-white font-bold">{mode === 'tartarus' ? 'Tartarus' : 'Time Attack'}</span><br/>
          Final Score: <span className="text-zigguratGold font-bold text-3xl sm:text-4xl block mt-2">{score}</span>
        </div>
      )}

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col items-center">
          <label className="text-zigguratStone/70 mb-4 text-sm font-bold uppercase tracking-wider text-center">Inscribe Your Name<br/>(Max 12 Characters)</label>
          <input 
            type="text" 
            maxLength={12}
            value={username}
            onChange={(e) => setUsername(e.target.value.toUpperCase())}
            className="w-48 sm:w-64 text-center text-3xl sm:text-4xl bg-[#1a1510] border-b-4 border-zigguratGold text-white p-2 mb-8 focus:outline-none focus:border-zigguratTerracotta uppercase font-mono shadow-inner rounded-t"
            required
            autoFocus
          />
          {error && <p className="text-zigguratTerracotta mb-4 font-bold">{error}</p>}
          <button 
            type="submit" 
            disabled={username.length < 1 || loading}
            className="ziggurat-btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'INSCRIBING...' : 'CARVE SCORE'}
          </button>
        </form>
      ) : (
        <div className="animate-fade-in">
          {loading && viewOnly ? (
             <div className="text-center text-zigguratGold mb-8">Loading...</div>
          ) : (
            <>
              {leaderboardData?.playerRank && !viewOnly && (
                <div className="bg-[#1a1510] rounded p-4 mb-8 text-center border-t border-b border-zigguratGold/30">
                  <h3 className="text-zigguratStone/50 font-bold mb-1 text-sm uppercase">Your Rank</h3>
                  <div className="text-lg sm:text-xl">
                    <span className="text-zigguratStone/60">#{leaderboardData.playerRank.rank}</span>{' '}
                    <span className="font-bold text-white mx-2">{leaderboardData.playerRank.username}</span>{' '}
                    <span className="text-zigguratGold font-bold">{leaderboardData.playerRank.score}</span>
                  </div>
                </div>
              )}

              {!viewOnly && (
                <div className="text-center mb-6 sm:mb-8">
                  <h2 className="text-zigguratStone/60 text-sm sm:text-lg tracking-widest mb-2">YOUR SCORE</h2>
                  <div className="text-5xl sm:text-7xl font-black text-zigguratGold drop-shadow-lg mb-2">
                    {score}
                  </div>
                  <div className={`text-xl sm:text-2xl font-black italic uppercase ${rank.color}`}>
                    Rank: {rank.title}
                  </div>
                </div>
              )}

              {leaderboardData?.top5 && (
                <>
                  <div className="flex justify-center mb-6 gap-2">
                    <button 
                      onClick={() => setViewMode('timeAttack')}
                      className={`px-4 py-2 text-sm font-bold uppercase rounded-l border-2 ${viewMode === 'timeAttack' ? 'bg-zigguratGold text-black border-zigguratGold' : 'bg-transparent text-zigguratGold border-zigguratGold hover:bg-zigguratGold/20'}`}
                    >
                      TIME ATTACK
                    </button>
                    <button 
                      onClick={() => setViewMode('tartarus')}
                      className={`px-4 py-2 text-sm font-bold uppercase rounded-r border-2 ${viewMode === 'tartarus' ? 'bg-[#ffccbc] text-[#3e2723] border-[#ffccbc]' : 'bg-transparent text-[#ffccbc] border-[#ffccbc] hover:bg-[#ffccbc]/20'}`}
                    >
                      TARTARUS
                    </button>
                  </div>
                  
                  <h3 className="text-center font-bold text-zigguratStone/60 mb-4 uppercase tracking-widest text-sm">Top 5 ({viewMode === 'tartarus' ? 'Tartarus' : 'Time Attack'})</h3>
                  <div className="space-y-2 mb-8">
                    {leaderboardData.top5.map((entry, idx) => (
                      <div key={entry.id} className="flex justify-between items-center bg-black/40 p-3 sm:p-4 rounded border border-zigguratStone/10">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <span className={`font-bold ${idx === 0 ? 'text-zigguratGold text-xl' : (idx === 1 ? 'text-gray-400' : (idx === 2 ? 'text-amber-700' : 'text-zigguratStone/50'))}`}>
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-white tracking-widest text-lg">{entry.username}</span>
                        </div>
                        <span className="text-zigguratGold font-bold">{entry.score}</span>
                      </div>
                    ))}
                    {leaderboardData.top5.length === 0 && (
                      <div className="text-center text-zigguratStone/40 italic py-4">No entries yet. Be the first!</div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {!viewOnly && history && history.length > 0 && (
            <button onClick={() => setShowRecap(true)} className="w-full bg-[#1e3a5f] hover:bg-[#2a4d7a] text-blue-100 border-b-4 border-[#0a1931] active:translate-y-1 active:border-b-0 py-3 rounded font-black tracking-widest uppercase transition-all mb-4 mt-4">
              VIEW RECAP (วิเคราะห์ผล)
            </button>
          )}

          <button onClick={onPlayAgain} className="ziggurat-btn w-full">
            {viewOnly ? 'BACK TO MENU' : 'PLAY AGAIN'}
          </button>
        </div>
      )}

      {showRecap && (
        <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-start p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-2xl stone-panel p-4 sm:p-6 relative mt-4 sm:mt-10 mb-10">
            <button 
              onClick={() => setShowRecap(false)}
              className="absolute top-2 right-4 text-3xl text-zigguratTerracotta font-bold hover:scale-110"
            >
              &times;
            </button>
            <h2 className="text-2xl sm:text-3xl font-black text-zigguratGold mb-6 text-center border-b border-zigguratGold/30 pb-4">POST-GAME RECAP</h2>
            
            <div className="space-y-6">
              {history.map((item, idx) => (
                <div key={idx} className={`p-4 rounded border-l-4 bg-black/40 ${item.isCorrect ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-zigguratStone/70 uppercase">Question {idx + 1}</span>
                    <span className={`font-black ${item.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {item.isCorrect ? '✅ CORRECT' : '❌ WRONG'}
                    </span>
                  </div>
                  <div className="text-white bg-[#1a1510] p-2 rounded mb-4 overflow-hidden border border-zigguratStone/20">
                    <BlockMath math={item.math} />
                  </div>
                  
                  {!item.isCorrect && (
                    <div className="text-sm mb-4">
                      <div className="text-red-300">
                        <span className="font-bold">Your Answer:</span>
                        <div className="bg-red-900/30 p-2 mt-1 rounded"><BlockMath math={item.options[item.selectedAnswerIndex]} /></div>
                      </div>
                      <div className="text-green-300 mt-2">
                        <span className="font-bold">Correct Answer:</span>
                        <div className="bg-green-900/30 p-2 mt-1 rounded"><BlockMath math={item.options[item.correctAnswerIndex]} /></div>
                      </div>
                    </div>
                  )}

                  {item.explanation && (
                    <div className="text-sm text-[#e6e6fa] bg-[#4b0082]/30 p-3 rounded mt-2 border border-[#8a2be2]/30 leading-relaxed">
                      <strong>💡 คำอธิบาย:</strong> <MathText text={item.explanation} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
