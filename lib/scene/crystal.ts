// The readiness crystal. The five-sided readiness shape as a cut stone: each girdle vertex
// sits at a distance set by one score, so the facets extrude by strategy, data, culture,
// technology and governance. On the landing page it carries the illustrative shape; on the
// results page it is built from the visitor's own five numbers. The shape is the result.
import { mount, THREE, type SceneDef } from './kit';

const EMERALD = new THREE.Color('#0b7a5c'), CHAMPAGNE = new THREE.Color('#FEF3C7'), COPPER = new THREE.Color('#B45309'), INK = new THREE.Color('#0B0F1C');
const ORDER = ['strategy', 'data', 'culture', 'tech', 'governance'];

// Girdle radius from a 0..1 score. A flat 0 still has a body so the stone never vanishes.
const radius = (v: number) => 0.42 + Math.max(0.04, Math.min(1, v)) * 1.05;

function buildGeometry(scores: number[], out?: THREE.BufferGeometry) {
  const top = new THREE.Vector3(0, 1.25, 0), bottom = new THREE.Vector3(0, -1.05, 0);
  const upper: THREE.Vector3[] = [], lower: THREE.Vector3[] = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5, r = radius(scores[i]);
    upper.push(new THREE.Vector3(Math.cos(a) * r, 0.22, Math.sin(a) * r));
    lower.push(new THREE.Vector3(Math.cos(a) * r * 0.96, -0.2, Math.sin(a) * r * 0.96));
  }
  const tri: number[] = [];
  const push = (...p: THREE.Vector3[]) => p.forEach((v) => tri.push(v.x, v.y, v.z));
  for (let i = 0; i < 5; i++) {
    const j = (i + 1) % 5;
    push(top, upper[j], upper[i]);                    // crown facet
    push(upper[i], upper[j], lower[j]); push(upper[i], lower[j], lower[i]); // girdle band
    push(bottom, lower[i], lower[j]);                 // pavilion facet
  }
  const g = out ?? new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(tri, 3));
  g.computeVertexNormals();
  return g;
}

export default function crystal(host: HTMLElement) {
  const raw = host.dataset.scores ? (JSON.parse(host.dataset.scores) as Record<string, number> | number[]) : null;
  const target = Array.isArray(raw) ? raw : raw ? ORDER.map((k) => (raw[k] ?? 50) / 100) : [0.78, 0.46, 0.64, 0.58, 0.36];
  const def: SceneDef = {
    fov: 30, exposure: 1.0, stillTime: 7,
    build({ scene, camera, env }) {
      scene.background = INK.clone();
      scene.environment = env({ key: 0xfff0cc, fill: 0x1f7a5a, floor: 0x0b0f1c, strength: 1.1 });

      // The stone. Transmission gives it depth; a champagne edge wire draws the cut.
      const current = target.map(() => 0.5);
      const geo = buildGeometry(current);
      const stoneMat = new THREE.MeshPhysicalMaterial({ color: EMERALD, roughness: 0.06, metalness: 0, transmission: 0.82, thickness: 1.4, ior: 1.62, clearcoat: 1, clearcoatRoughness: 0.05, attenuationColor: new THREE.Color('#065F46'), attenuationDistance: 1.6, flatShading: true, envMapIntensity: 1.4 });
      const stone = new THREE.Mesh(geo, stoneMat);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 1), new THREE.LineBasicMaterial({ color: CHAMPAGNE, transparent: true, opacity: 0.45 }));
      const gem = new THREE.Group(); gem.add(stone, edges); gem.position.y = 0.1; scene.add(gem);

      // Five copper pins mark the dimensions where the facets meet; a thin ring marks 100.
      const pinGeo = new THREE.SphereGeometry(0.045, 12, 10), pinMat = new THREE.MeshStandardMaterial({ color: COPPER, emissive: COPPER, emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.8 });
      const pins = Array.from({ length: 5 }, () => { const m = new THREE.Mesh(pinGeo, pinMat); gem.add(m); return m; });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius(1), 0.006, 6, 96), new THREE.MeshBasicMaterial({ color: CHAMPAGNE, transparent: true, opacity: 0.22 }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.22; gem.add(ring);
      const spokes = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: CHAMPAGNE, transparent: true, opacity: 0.16 }));
      gem.add(spokes);

      // Table: a dark polished disc with a copper pool of light under the stone.
      const table = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.MeshStandardMaterial({ color: 0x0c1324, roughness: 0.25, metalness: 0.5 }));
      table.rotation.x = -Math.PI / 2; table.position.y = -1.05; scene.add(table);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(1.6, 48), new THREE.MeshBasicMaterial({ color: COPPER, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false }));
      pool.rotation.x = -Math.PI / 2; pool.position.y = -1.04; scene.add(pool);

      const key = new THREE.SpotLight(0xfff1d8, 40, 12, 0.5, 0.5, 1.5); key.position.set(3, 5, 3); scene.add(key, key.target);
      const copperLight = new THREE.PointLight(COPPER, 6, 6, 1.8); copperLight.position.set(-1.6, -0.4, 1.4); scene.add(copperLight);
      scene.add(new THREE.AmbientLight(0x10261f, 1));

      const base = new THREE.Vector3(2.6, 1.4, 5.6), look = new THREE.Vector3(-1.7, 0.05, 0);
      camera.position.copy(base);

      const updateShape = () => {
        buildGeometry(current, geo); geo.attributes.position.needsUpdate = true;
        edges.geometry.dispose(); edges.geometry = new THREE.EdgesGeometry(geo, 1);
        const sp: number[] = [];
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5, r = radius(current[i]);
          pins[i].position.set(Math.cos(a) * r, 0.22, Math.sin(a) * r);
          sp.push(0, 0.22, 0, Math.cos(a) * radius(1), 0.22, Math.sin(a) * radius(1));
        }
        spokes.geometry.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
      };
      updateShape();

      let grown = 0;
      return {
        lod(level) { if (level >= 1) { stoneMat.transmission = 0; stoneMat.opacity = 0.92; stoneMat.transparent = true; stoneMat.needsUpdate = true; } },
        update(dt, t, s) {
          // The facets grow out to their scores over the first two seconds, then hold.
          const g = Math.min(1, t / 2.2), e = 1 - Math.pow(1 - g, 3);
          if (e !== grown) { grown = e; for (let i = 0; i < 5; i++) current[i] = 0.5 + (target[i] - 0.5) * e; updateShape(); }
          gem.rotation.y = t * 0.22 + s.pointer.x * 0.35;
          gem.rotation.x = Math.sin(t * 0.3) * 0.05 - s.pointer.y * 0.12;
          gem.position.y = 0.1 + Math.sin(t * 0.8) * 0.04;
          camera.position.x += ((base.x + s.pointer.x * 0.3) - camera.position.x) * 0.05;
          camera.position.y += ((base.y + s.pointer.y * 0.2) - camera.position.y) * 0.05;
          camera.lookAt(look);
        },
      };
    },
  };
  return mount(host, def);
}
