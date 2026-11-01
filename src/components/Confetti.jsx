import { useEffect, useMemo, useRef } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

// Adapted from the Motion "Confetti" example on 21st.dev: particles follow a
// simple physics sim baked into keyframes. Fires once when mounted.

const COLORS = ['#4FD18E', '#8DD9AC', '#2FB36C', '#E89968', '#F2B98C', '#6EB6E8', '#EFEDE5'];
const SHAPES = ['circle', 'rect', 'rect', 'strip', 'strip'];
const KEYFRAMES = 40;
const POP = 0.08;

function buildKeyframes({ angle, velocity, decay, gravity, wobbleSpeed, wobbleOffset, ticks, tiltTurns, rotation }) {
  const transform = [];
  const opacity = [];
  let v = velocity;
  let x = 0;
  let y = 0;
  let wobble = wobbleOffset;
  let tick = 0;

  for (let i = 0; i <= KEYFRAMES; i++) {
    const t = i / KEYFRAMES;
    if (i > 0) {
      const target = Math.round((i * ticks) / KEYFRAMES);
      while (tick < target) {
        x += Math.cos(angle) * v;
        y += Math.sin(angle) * v + gravity * 3;
        v *= decay;
        wobble += wobbleSpeed;
        tick++;
      }
    }
    const tx = i === 0 ? 0 : x + Math.cos(wobble) * 15;
    const scale =
      t < POP * 0.6 ? (t / (POP * 0.6)) * 1.15
      : t < POP ? 1.15 - ((t - POP * 0.6) / (POP * 0.4)) * 0.15
      : 1;
    transform.push(
      `translate(${tx}px, ${y}px) scale(${scale}) rotateY(${tiltTurns * 360 * t}deg) rotate(${rotation}deg)`,
    );
    opacity.push(t <= 0.5 ? 1 : t <= 0.8 ? 1 - ((t - 0.5) / 0.3) * 0.5 : 0.5 - ((t - 0.8) / 0.2) * 0.5);
  }
  return { transform, opacity };
}

function makeParticles({ count, velocity, spread, decay, gravity, duration }) {
  const ticks = Math.round(duration * 60);
  const spreadRad = (spread * Math.PI) / 180;
  return Array.from({ length: count }, () => {
    const size = 6 + Math.random() * 6;
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    return {
      keyframes: buildKeyframes({
        angle: -Math.PI / 2 + (0.5 * spreadRad - Math.random() * spreadRad),
        velocity: velocity * 0.5 + Math.random() * velocity,
        decay,
        gravity,
        wobbleSpeed: Math.min(0.11, Math.random() * 0.1 + 0.05),
        wobbleOffset: Math.random() * 10,
        ticks,
        tiltTurns: 2 + Math.random() * 4,
        rotation: Math.random() * 360,
      }),
      width: shape === 'strip' ? size * 0.3 : shape === 'rect' ? size * 0.7 : size,
      height: shape === 'strip' ? size * 2 : size,
      radius: shape === 'circle' ? '50%' : shape === 'strip' ? size * 0.12 : 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
  });
}

const Particle = ({ particle, duration }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const playback = animate(ref.current, particle.keyframes, { duration, ease: 'linear' });
    return () => playback.cancel();
  }, [particle, duration]);

  return (
    <span
      ref={ref}
      className="confetti-particle"
      style={{
        width: particle.width,
        height: particle.height,
        borderRadius: particle.radius,
        backgroundColor: particle.color,
      }}
    />
  );
};

const Confetti = ({ count = 70, velocity = 26, spread = 110, decay = 0.91, gravity = 1, duration = 2.6 }) => {
  const reduced = useReducedMotion();
  const particles = useMemo(
    () => makeParticles({ count, velocity, spread, decay, gravity, duration }),
    [count, velocity, spread, decay, gravity, duration],
  );

  if (reduced) return null;

  return (
    <div className="confetti-burst" aria-hidden="true">
      {particles.map((p, i) => (
        <Particle key={i} particle={p} duration={duration} />
      ))}
    </div>
  );
};

export default Confetti;
