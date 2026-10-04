import { useEffect, useRef, useState } from 'react';

const ANIMATION_DURATION_MS = 700;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Faz o número "correr" até o novo valor em vez de pular. */
export function useAnimatedNumber(target: number): number {
  const [displayValue, setDisplayValue] = useState(target);
  const latestValue = useRef(target);

  useEffect(() => {
    const startValue = latestValue.current;
    if (startValue === target || prefersReducedMotion()) {
      latestValue.current = target;
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now();
    let frameId = 0;

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / ANIMATION_DURATION_MS, 1);
      const eased = 1 - (1 - progress) ** 3;
      const value = startValue + (target - startValue) * eased;
      latestValue.current = value;
      setDisplayValue(value);
      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [target]);

  return displayValue;
}
