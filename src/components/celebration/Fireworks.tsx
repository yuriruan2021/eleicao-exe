import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const COLORS = ['#ffd166', '#3ddc84', '#4f8cff', '#ffffff', '#ff9f6b', '#f5d76e'] as const;
const GRAVITY = 0.05;
const SPARK_FRICTION = 0.985;
const CONFETTI_COUNT = 160;

type Particle =
  | { kind: 'rocket'; x: number; y: number; vx: number; vy: number; color: string }
  | { kind: 'spark'; x: number; y: number; vx: number; vy: number; color: string; life: number; decay: number }
  | {
      kind: 'confetti';
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      spin: number;
      phase: number;
    };

interface FireworksProps {
  /** "full": tela de comemoração. "light": um foguete de vez em quando sobre o painel. */
  intensity: 'full' | 'light';
  className?: string;
}

function pickColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

/** Fogos de artifício e confete em canvas. Não roda para quem pediu menos animação no sistema. */
export function Fireworks({ intensity, className }: FireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const isFull = intensity === 'full';
    const particles: Particle[] = [];
    let width = 0;
    let height = 0;

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const launchRocket = () => {
      const apexHeight = height * (0.45 + Math.random() * 0.35);
      particles.push({
        kind: 'rocket',
        x: width * (0.12 + Math.random() * 0.76),
        y: height,
        vx: (Math.random() - 0.5) * 1.6,
        vy: -Math.sqrt(2 * GRAVITY * apexHeight),
        color: pickColor(),
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const count = isFull ? 90 : 60;
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.2;
        const speed = 1 + Math.random() * 3.6;
        particles.push({
          kind: 'spark',
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: Math.random() < 0.8 ? color : '#ffffff',
          life: 1,
          decay: 0.011 + Math.random() * 0.012,
        });
      }
    };

    const dropConfetti = () => {
      for (let index = 0; index < CONFETTI_COUNT; index += 1) {
        particles.push({
          kind: 'confetti',
          x: Math.random() * width,
          y: -20 - Math.random() * height * 0.6,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 1.4 + Math.random() * 2.2,
          color: pickColor(),
          size: 6 + Math.random() * 5,
          rotation: Math.random() * Math.PI,
          spin: (Math.random() - 0.5) * 0.25,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);
    if (isFull) {
      dropConfetti();
    }

    let lastFrame = performance.now();
    let nextLaunch = lastFrame + (isFull ? 200 : 1_500);
    let frameId = 0;

    const draw = (now: number) => {
      const step = Math.min((now - lastFrame) / 16.67, 3);
      lastFrame = now;

      if (now >= nextLaunch) {
        launchRocket();
        nextLaunch = now + (isFull ? 280 + Math.random() * 520 : 4_500 + Math.random() * 4_000);
      }

      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        let isDead = false;

        if (particle.kind === 'rocket') {
          particle.x += particle.vx * step;
          particle.y += particle.vy * step;
          particle.vy += GRAVITY * step;
          context.strokeStyle = particle.color;
          context.lineWidth = 2;
          context.beginPath();
          context.moveTo(particle.x, particle.y);
          context.lineTo(particle.x - particle.vx * 4, particle.y - particle.vy * 4);
          context.stroke();
          if (particle.vy >= -0.4) {
            explode(particle.x, particle.y, particle.color);
            isDead = true;
          }
        } else if (particle.kind === 'spark') {
          particle.vx *= SPARK_FRICTION ** step;
          particle.vy = particle.vy * SPARK_FRICTION ** step + GRAVITY * 0.6 * step;
          particle.x += particle.vx * step;
          particle.y += particle.vy * step;
          particle.life -= particle.decay * step;
          context.globalAlpha = Math.max(particle.life, 0);
          context.fillStyle = particle.color;
          context.beginPath();
          context.arc(particle.x, particle.y, 1.8, 0, Math.PI * 2);
          context.fill();
          context.globalAlpha = 1;
          isDead = particle.life <= 0;
        } else {
          particle.phase += 0.05 * step;
          particle.x += (particle.vx + Math.sin(particle.phase) * 0.8) * step;
          particle.y += particle.vy * step;
          particle.rotation += particle.spin * step;
          context.save();
          context.globalCompositeOperation = 'source-over';
          context.translate(particle.x, particle.y);
          context.rotate(particle.rotation);
          context.scale(1, Math.cos(particle.phase * 2));
          context.fillStyle = particle.color;
          context.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
          context.restore();
          isDead = particle.y > height + 20;
        }

        if (isDead) {
          particles.splice(index, 1);
        }
      }

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, [intensity]);

  return <canvas ref={canvasRef} aria-hidden className={cn('pointer-events-none', className)} />;
}
