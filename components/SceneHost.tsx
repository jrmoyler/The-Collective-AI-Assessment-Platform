'use client';

import { useEffect, useRef } from 'react';
import type { SceneApi } from '@/lib/scene/kit';

// Hosts one procedural Three.js scene. The poster is the same scene rendered headlessly, so
// the figure is complete before the module loads and stays complete without WebGL. The
// scene loads lazily (in view, then idle), is aria-hidden, and nothing on the page depends on it.
const SCENES: Record<string, () => Promise<{ default: (host: HTMLElement) => SceneApi | null }>> = {
  crystal: () => import('@/lib/scene/crystal'),
};

type Props = { scene: keyof typeof SCENES; still: string; scores?: Record<string, number> | number[]; className?: string; alt?: string };

export default function SceneHost({ scene, still, scores, className = '', alt = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scoresKey = scores ? JSON.stringify(scores) : '';
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let api: SceneApi | null = null, cancelled = false, io: IntersectionObserver | null = null;
    const go = () => { if (cancelled) return; SCENES[scene]().then((m) => { if (!cancelled) api = m.default(host); }).catch((e) => console.warn('scene', e)); };
    if (/scene-still/.test(location.search + location.hash)) go();
    else {
      io = new IntersectionObserver((en) => {
        if (!en[0].isIntersecting) return;
        io?.disconnect();
        const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void };
        if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1200 }); else setTimeout(go, 120);
      });
      io.observe(host);
    }
    return () => { cancelled = true; io?.disconnect(); api?.dispose(); };
  }, [scene, scoresKey]);
  return (
    <div ref={ref} className={`scene-host ${className}`} data-scene={scene} data-scores={scoresKey || undefined} aria-hidden={alt ? undefined : 'true'}>
      <picture>
        <source media="(max-width: 700px)" srcSet={`${still}-800.webp`} />
        <img className="scene-still" src={`${still}-1600.webp`} width={1600} height={900} alt={alt} decoding="async" fetchPriority="high" />
      </picture>
    </div>
  );
}
