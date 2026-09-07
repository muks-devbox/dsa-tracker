import confetti from 'canvas-confetti';

const BRAND_COLORS = ['#4f46e5', '#059669', '#d97706', '#e0e7ff'];

// Fires a confetti burst originating from the clicked element (falls back to
// screen center if no event is passed). Used for the "Mark as Revised" action.
export function celebrateRevision(event) {
  let origin = { x: 0.5, y: 0.5 };

  if (event?.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    origin = {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    };
  }

  confetti({
    particleCount: 70,
    spread: 65,
    startVelocity: 32,
    gravity: 1,
    ticks: 150,
    origin,
    colors: BRAND_COLORS,
    zIndex: 9999,
    disableForReducedMotion: true,
  });
}
