# Assets


Space Grotesk and JetBrains Mono variable WOFF2 files are the same local fonts supplied by the parent repository. They replace runtime build fetching from Google and are loaded through Next's local font integration.

## Signature scene (November 2026)

The landing hero and the results page carry the readiness crystal, `lib/scene/crystal.ts`: the five-sided readiness shape cut as a stone whose facets extend by score. The landing page uses the illustrative shape and says so; the results page builds the stone from the visitor's five real scores. `lib/scene/kit.ts` is the shared runtime, `components/SceneHost.tsx` the lazy loader. three 0.182.0 from npm. `public/img/readiness-crystal-*.webp` are frames of the scene rendered headlessly: the poster under the canvas and the fallback without WebGL. The generated atrium image is no longer used here.
