import {useEffect, useRef, useState} from 'react';

/**
 * Fades/slides content in when it scrolls into view. Content is visible
 * without JavaScript, and the motion is disabled for prefers-reduced-motion
 * (handled in CSS).
 */
export function Reveal({
  as: Tag = 'div',
  className = '',
  delay = 0,
  children,
  ...rest
}: {
  as?: React.ElementType;
  className?: string;
  delay?: number;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'pending' | 'in'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    setState('pending');
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState('in');
          io.disconnect();
        }
      },
      {rootMargin: '0px 0px -8% 0px', threshold: 0.05},
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-reveal={state}
      style={delay ? {transitionDelay: `${delay}ms`} : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
