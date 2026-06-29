import confetti from 'canvas-confetti';

export const triggerFireworksVisual = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    
    // minimal colors that match the vibe (zinc, indigo, emerald)
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#71717a', '#fb923c', '#22d3ee'];
    
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      colors,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
    }));
    confetti(Object.assign({}, defaults, { 
      particleCount, 
      colors,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
    }));
  }, 250);
};

export const playFireworkSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  
  const ctx = new AudioContext();
  
  const playNote = (frequency: number, startTime: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // A sine wave is very soft and pleasant
    osc.type = 'sine';
    osc.frequency.value = frequency;
    
    // Envelope to make it sound like a soft bell/chime
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // quick fade in
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8); // smooth fade out
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + 0.8);
  };

  const now = ctx.currentTime;
  // A beautiful, uplifting major chord arpeggio (C5, E5, G5, C6)
  playNote(523.25, now + 0.0);
  playNote(659.25, now + 0.1);
  playNote(783.99, now + 0.2);
  playNote(1046.50, now + 0.35); // Slight pause before the final note for emphasis
};

export const celebrate = () => {
  triggerFireworksVisual();
  playFireworkSound();
};
