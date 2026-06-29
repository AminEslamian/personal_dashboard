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
  if (typeof window !== 'undefined') {
    const audio = new Audio('/celebration.mp3');
    // Ensure the volume is appropriate, adjust if necessary
    audio.volume = 0.8;
    audio.play().catch(e => console.error("Couldn't play celebration sound:", e));
  }
};

export const celebrate = () => {
  triggerFireworksVisual();
  playFireworkSound();
};
