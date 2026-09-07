import confetti from 'canvas-confetti';

/**
 * Trigger celebratory wedding fireworks animation using canvas-confetti
 */
export function triggerCelebrationFireworks() {
  const duration = 4.5 * 1000;
  const animationEnd = Date.now() + duration;

  // Romantic wedding celebratory color palette: white, platinum, silver, chrome, pearl
  const colors = ['#ffffff', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#f8fafc'];

  // Left & right continuous bursts
  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 45 * (timeLeft / duration);

    // Left cannon
    confetti({
      particleCount: Math.floor(particleCount),
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: colors,
      zIndex: 2000,
    });

    // Right cannon
    confetti({
      particleCount: Math.floor(particleCount),
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: colors,
      zIndex: 2000,
    });
  }, 250);

  // Center grand starbursts
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.5 },
      colors: colors,
      shapes: ['star', 'circle'],
      zIndex: 2000,
    });
  }, 400);

  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { y: 0.4 },
      colors: colors,
      shapes: ['star', 'circle'],
      zIndex: 2000,
    });
  }, 1200);
}

export default triggerCelebrationFireworks;
