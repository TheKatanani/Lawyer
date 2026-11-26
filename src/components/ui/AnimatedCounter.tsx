'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  target,
  duration = 1800,
  prefix = '',
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  const finalLabel = `${prefix}${target.toLocaleString()}${suffix}`;

  useEffect(() => {
    // Check prefers-reduced-motion
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setCount(target);
        return;
      }
    }

    const currentEl = elementRef.current;
    if (!currentEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            animateCount();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(currentEl);

    function animateCount() {
      const startTime = performance.now();

      function update(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutExpo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const currentCount = Math.floor(ease * target);

        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          setCount(target);
        }
      }

      requestAnimationFrame(update);
    }

    return () => {
      if (currentEl) observer.unobserve(currentEl);
    };
  }, [target, duration]);

  const isPercentSuffix = suffix.trim() === '%';

  return (
    <span ref={elementRef} className={className} aria-label={finalLabel}>
      <span className="sr-only">{finalLabel}</span>
      <span aria-hidden="true" className="inline-flex items-baseline gap-1.5">
        <span dir="ltr" className="font-mono tracking-tight tabular-nums">
          {prefix}
          {count.toLocaleString()}
          {isPercentSuffix ? suffix : ''}
        </span>
        {suffix && !isPercentSuffix && (
          <span className="font-heading-ar font-bold text-xl sm:text-2xl lg:text-3xl tracking-normal">
            {suffix.trim()}
          </span>
        )}
      </span>
    </span>
  );
}
