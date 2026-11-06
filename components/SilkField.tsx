'use client';

import { useEffect, useRef } from 'react';

// The Collective's signature field, the same "boardroom silk" the division site uses:
// emerald folds with copper light along the crests. Reduced resolution, pauses in hidden
// tabs, one still frame under reduced motion. The page never depends on it.
const FS = `precision mediump float;
uniform float t; uniform vec2 r; uniform vec2 m; uniform float k;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*r)/r.y;
  p+=m*.04;
  float w=0.; for(int i=0;i<4;i++){float fi=float(i); w+=sin(p.x*(1.6+fi*.9)+t*.18*(1.+fi*.35)+fbm(p*1.3+fi+t*.03)*3.2)*.5/(1.+fi);}
  float band=abs(fract(w*.9+p.y*1.2)-.5)*2.;
  vec3 c=mix(vec3(.02,.22,.16),vec3(.03,.05,.10),smoothstep(.0,.85,band));
  c+=vec3(.85,.48,.17)*pow(1.-band,9.)*.42;
  c+=vec3(.99,.95,.78)*pow(1.-band,30.)*.12;
  c*=.8*k;
  c=mix(vec3(.043,.059,.11),c,smoothstep(1.7,.2,length(p*vec2(.7,1.))));
  gl_FragColor=vec4(c,1.);
}`;

export default function SilkField({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}');
    const f = sh(gl.FRAGMENT_SHADER, FS);
    if (!v || !f) return;
    const pr = gl.createProgram()!; gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uT = gl.getUniformLocation(pr, 't'), uR = gl.getUniformLocation(pr, 'r'), uM = gl.getUniformLocation(pr, 'm'), uK = gl.getUniformLocation(pr, 'k');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.55;
    let w = 1, hgt = 1, mx = 0, my = 0, tmx = 0, tmy = 0, raf = 0;
    const size = () => { w = Math.max(1, Math.round(innerWidth * dpr)); hgt = Math.max(1, Math.round(innerHeight * dpr)); canvas.width = w; canvas.height = hgt; gl.viewport(0, 0, w, hgt); };
    const onMove = (e: PointerEvent) => { tmx = (e.clientX / innerWidth - 0.5) * 2; tmy = -(e.clientY / innerHeight - 0.5) * 2; };
    size();
    addEventListener('resize', size); addEventListener('pointermove', onMove, { passive: true });
    const t0 = performance.now();
    const draw = (now: number) => {
      mx += (tmx - mx) * 0.04; my += (tmy - my) * 0.04;
      gl.uniform1f(uT, (now - t0) / 1000); gl.uniform2f(uR, w, hgt); gl.uniform2f(uM, mx, my); gl.uniform1f(uK, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = !reduced && !document.hidden ? requestAnimationFrame(draw) : 0;
    };
    const onVis = () => { if (!document.hidden && !raf && !reduced) raf = requestAnimationFrame(draw); };
    document.addEventListener('visibilitychange', onVis);
    raf = requestAnimationFrame((n) => { draw(n); canvas.classList.add('on'); });
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size); removeEventListener('pointermove', onMove); document.removeEventListener('visibilitychange', onVis); };
  }, [intensity]);
  return (
    <>
      <div className="silk-fallback" aria-hidden="true" />
      <canvas ref={ref} className="silk" aria-hidden="true" />
    </>
  );
}
