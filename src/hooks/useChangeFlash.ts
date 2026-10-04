import { useEffect, useRef, useState } from 'react';

const FLASH_DURATION_MS = 1_200;

/** Fica `true` por um instante sempre que o valor muda (não dispara na primeira renderização). */
export function useChangeFlash(value: unknown): boolean {
  const [isFlashing, setIsFlashing] = useState(false);
  const previousValue = useRef(value);

  useEffect(() => {
    if (Object.is(previousValue.current, value)) {
      return;
    }
    previousValue.current = value;
    setIsFlashing(true);
    const timer = window.setTimeout(() => setIsFlashing(false), FLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [value]);

  return isFlashing;
}
