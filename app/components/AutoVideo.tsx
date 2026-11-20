import {useEffect, useRef, useState} from 'react';
import type {VideoMediaFragment} from 'storefrontapi.generated';
import {useT} from '~/lib/i18n';

/**
 * Silent, looping, decorative video (no sound, no native controls).
 * - Pauses when scrolled out of view (saves battery/data).
 * - prefers-reduced-motion: shows the still preview instead of playing.
 * - WCAG 2.2.2 (Pause, Stop, Hide): a discreet pause/play button appears on
 *   hover and keyboard focus; it's the only visible control.
 */
export function AutoVideo({
  video,
  className = '',
  maxHeight = 720,
  eager = false,
}: {
  video: VideoMediaFragment;
  className?: string;
  maxHeight?: number;
  eager?: boolean;
}) {
  const t = useT();
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const userPaused = useRef(false);

  const mp4s = video.sources
    .filter((s) => s.mimeType === 'video/mp4')
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0));
  const source = mp4s.find((s) => (s.height ?? 0) <= maxHeight) ?? mp4s[mp4s.length - 1];

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.pause();
      setPaused(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userPaused.current) {
          el.play().then(() => setPaused(false)).catch(() => setPaused(true));
        } else {
          el.pause();
        }
      },
      {threshold: 0.15},
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  function toggle() {
    const el = ref.current;
    if (!el) return;
    if (el.paused) {
      userPaused.current = false;
      el.play().then(() => setPaused(false)).catch(() => {});
    } else {
      userPaused.current = true;
      el.pause();
      setPaused(true);
    }
  }

  if (!source) return null;

  return (
    <div className={`autovideo ${className}`}>
      <video
        ref={ref}
        className="autovideo__media"
        muted
        loop
        playsInline
        preload={eager ? 'auto' : 'metadata'}
        poster={video.previewImage?.url}
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
      >
        <source src={source.url} type="video/mp4" />
      </video>
      <button
        type="button"
        className="autovideo__toggle glass"
        onClick={toggle}
        aria-pressed={paused}
        aria-label={paused ? t('video.play') : t('video.pause')}
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" width="12" height="12">
          {paused ? <path d="M4 2l10 6-10 6z" fill="currentColor" /> : <path d="M4 2h3v12H4zM9 2h3v12H9z" fill="currentColor" />}
        </svg>
      </button>
    </div>
  );
}
