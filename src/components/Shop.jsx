import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

export default function Shop({ onBack }) {
  const { drachmas, upgrades, relics = [], equippedRelics = [], buyUpgrade, toggleEquipRelic } = useContext(GameContext);

  const [errorMsg, setErrorMsg] = useState(null);

  const handleBuy = async (skill, cost, isRelic = false) => {
    setErrorMsg(null);
    if (isRelic) {
      if (drachmas >= cost && !relics.includes(skill)) await buyUpgrade(skill);
    } else {
      if (drachmas >= 500 && (upgrades[skill] || 1) < 2) await buyUpgrade(skill);
    }
  };

  const handleToggleEquip = async (relicId) => {
    setErrorMsg(null);
    const res = await toggleEquipRelic(relicId);
    if (!res.success) {
      setErrorMsg(res.error);
    }
  };

  const skills = [
    {
      id: 'athena',
      name: 'Athena\'s Wisdom',
      descLv1: 'Disables 2 wrong choices.',
      descLv2: 'Can be used TWICE per game.',
      img: '/athena.jpg'
    },
    {
      id: 'chronos',
      name: 'Chronos\' Time',
      descLv1: 'Adds 10 seconds to the clock.',
      descLv2: 'Adds 15 seconds to the clock.',
      img: '/chronos.jpg'
    },
    {
      id: 'hermes',
      name: 'Hermes\' Speed',
      descLv1: 'Multiplies next score by 3.',
      descLv2: 'Multiplies next score by 5.',
      img: '/hermes.jpg'
    },
    {
      id: 'lhopital',
      name: 'L\'Hôpital\'s Secret',
      descLv1: 'Skips question (0 pts). 1 charge.',
      descLv2: 'Skips question. 2 charges.',
      img: '/lhopital.jpg'
    }
  ];

  const relicsList = [
    {
      id: 'midas',
      name: 'Midas\' Coin',
      desc: '+20% Drachmas from games.',
      cost: 300,
      icon: '🪙'
    },
    {
      id: 'aegis',
      name: 'Aegis Shield',
      desc: 'Tartarus starts with 4 Hearts.',
      cost: 500,
      icon: '🛡️'
    },
    {
      id: 'sandals',
      name: 'Hermes\' Sandals',
      desc: 'Penalty time -1s (Time Attack).',
      cost: 300,
      icon: '🪽'
    }
  ];

  return (
    <div className="absolute inset-0 bg-zigguratDark text-center p-4 sm:p-8 overflow-y-auto w-full h-full pb-20">
      <div className="max-w-2xl mx-auto flex flex-col items-center">
        <h2 className="text-3xl sm:text-5xl font-black mb-2 text-zigguratGold tracking-widest ziggurat-title drop-shadow-md">SHOP</h2>
        <div className="text-xl sm:text-2xl text-yellow-300 font-bold mb-6 flex items-center justify-center bg-black/40 px-6 py-2 rounded-full border border-yellow-500/30">
          YOUR DRACHMAS: <span className="ml-3 text-3xl">{drachmas} 🪙</span>
        </div>
        
        {errorMsg && (
          <div className="text-red-400 bg-red-900/40 px-4 py-2 rounded border border-red-500/50 mb-4 animate-shake">
            {errorMsg}
          </div>
        )}
      </div>
      
      <p className="text-zigguratStone/80 mb-8 italic">
        "Offer your hard-earned Drachmas to the gods for greater power."
      </p>

      <h3 className="text-left text-xl font-bold ziggurat-title text-zigguratGold mb-4 border-b border-zigguratStone/20 pb-2">ACTIVE BLESSINGS</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {skills.map((skill) => (
          <div key={skill.id} className="bg-[#1a1510] border border-zigguratStone/20 rounded p-4 flex flex-col items-center">
            <img src={skill.img} alt={skill.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-full shadow-lg border-2 border-zigguratGold/50 mb-3" />
            <h3 className="font-bold text-white tracking-wider mb-2 text-sm">{skill.name}</h3>
            
            <div className="text-xs text-zigguratStone/60 mb-2 min-h-[40px]">
              <span className="font-bold text-zigguratStone/80">Lv.1:</span> {skill.descLv1}
            </div>
            
            <div className={`text-xs mb-4 min-h-[40px] ${upgrades[skill.id] === 2 ? 'text-zigguratGold font-bold' : 'text-zigguratStone/40'}`}>
              <span className="font-bold">Lv.2:</span> {skill.descLv2}
            </div>
            
            <div className="mt-auto w-full">
              {upgrades[skill.id] === 2 ? (
                <div className="text-green-500 font-bold uppercase tracking-widest text-sm bg-green-900/20 py-2 rounded border border-green-500/30">MAX LEVEL</div>
              ) : (
                <button 
                  onClick={() => handleBuy(skill.id, 500, false)}
                  disabled={drachmas < 500}
                  className={`w-full py-2 rounded font-bold uppercase tracking-wider text-sm transition-all ${drachmas >= 500 ? 'bg-zigguratGold text-black hover:bg-yellow-500' : 'bg-black/50 text-white/20 cursor-not-allowed'}`}
                >
                  Buy (500 🪙)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <h3 className="text-left text-xl font-bold ziggurat-title text-zigguratGold mb-4 border-b border-zigguratStone/20 pb-2 mt-8">PASSIVE RELICS</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {relicsList.map((relic) => (
          <div key={relic.id} className="bg-[#1a1510] border border-zigguratStone/20 rounded p-4 flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/50 rounded-full shadow-lg border border-zigguratGold/30 flex items-center justify-center text-4xl mb-3">
              {relic.icon}
            </div>
            <h3 className="font-bold text-white tracking-wider mb-2 text-sm">{relic.name}</h3>
            
            <div className="text-xs text-zigguratStone/60 mb-4 min-h-[40px] italic">
              {relic.desc}
            </div>
            
            <div className="mt-auto w-full">
              {relics.includes(relic.id) ? (
                equippedRelics.includes(relic.id) ? (
                  <button 
                    onClick={() => handleToggleEquip(relic.id)}
                    className="w-full py-2 rounded font-bold uppercase tracking-wider text-sm transition-all bg-yellow-500 text-yellow-900 hover:bg-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)] border border-yellow-300"
                  >
                    UNEQUIP
                  </button>
                ) : (
                  <button 
                    onClick={() => handleToggleEquip(relic.id)}
                    className="w-full py-2 rounded font-bold uppercase tracking-wider text-sm transition-all bg-[#2a221b] text-zigguratStone hover:bg-[#3a3026] border border-zigguratStone/40"
                  >
                    EQUIP
                  </button>
                )
              ) : (
                <button 
                  onClick={() => handleBuy(relic.id, relic.cost, true)}
                  disabled={drachmas < relic.cost}
                  className={`w-full py-2 rounded font-bold uppercase tracking-wider text-sm transition-all ${drachmas >= relic.cost ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-black/50 text-white/20 cursor-not-allowed'}`}
                >
                  Buy ({relic.cost} 🪙)
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={onBack} className="ziggurat-btn w-full max-w-xs mx-auto text-sm">
        BACK TO MENU
      </button>
    </div>
  );
}
