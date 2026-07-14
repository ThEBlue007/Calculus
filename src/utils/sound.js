let ctx;
try {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  ctx = new AudioContext();
} catch (e) {
  ctx = null;
}

export let sfxEnabled = localStorage.getItem('sfxEnabled') !== 'false';
export let bgmEnabled = localStorage.getItem('bgmEnabled') !== 'false';

export function setSfxEnabled(val) {
  sfxEnabled = val;
  localStorage.setItem('sfxEnabled', val);
}

export function setBgmEnabled(val) {
  bgmEnabled = val;
  localStorage.setItem('bgmEnabled', val);
  if (!val) stopBackgroundMusic();
}

export function playSound(type) {
  if (!ctx || !sfxEnabled) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'correct') {
    // "Ting!"
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // A6
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'wrong') {
    // "Buzzer"
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } else if (type === 'powerup') {
    // Chime
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
    osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.1); // E6
    osc.frequency.setValueAtTime(1567.98, ctx.currentTime + 0.2); // G6
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
  } else if (type === 'boss') {
    // Deep Gong/Horn
    osc.type = 'square';
    osc.frequency.setValueAtTime(80, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 1.0);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.0);
  }
}

// BGM and Heartbeat State
let bgmGain = null;
let bgmInterval = null;
let isHeartbeatFast = false;

export function startBackgroundMusic() {
  if (!ctx || !bgmEnabled) return;
  stopBackgroundMusic(); // ensure no duplicates

  bgmGain = ctx.createGain();
  bgmGain.connect(ctx.destination);
  bgmGain.gain.value = 0.05; // very quiet background beat

  let step = 0;
  bgmInterval = setInterval(() => {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.connect(bgmGain);
    
    // Ancient drum pattern: Kick - rest - Kick Kick - rest
    if (step % 4 === 0 || step % 4 === 2 || step % 4 === 3) {
      osc.frequency.setValueAtTime(55, ctx.currentTime); // low bass
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    }
    step++;
  }, 500); // 120 BPM
}

export function stopBackgroundMusic() {
  if (bgmInterval) clearInterval(bgmInterval);
  if (bgmGain) {
    bgmGain.disconnect();
    bgmGain = null;
  }
}

export function playHeartbeat(fast = false) {
  if (!ctx || !sfxEnabled) return;
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.type = 'sine';
  osc.frequency.setValueAtTime(40, ctx.currentTime); // Sub-bass thump
  osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
  
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(fast ? 0.4 : 0.2, ctx.currentTime + 0.05); // louder if fast
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
};
