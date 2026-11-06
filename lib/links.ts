// Where the rest of Collective AI lives. Change these if a site moves to a new address.
export const SITE = {
  main: 'https://collectiveai.info',
  hub: 'https://collective-ai-start.vercel.app/',
  divisions: 'https://collective-ai-divisions-brown.vercel.app',
};

export const divisionUrl = (slug: string) => `${SITE.divisions}/${slug}/`;

type Dimension = 'strategy' | 'data' | 'culture' | 'tech' | 'governance';

export type DivisionPick = { slug: string; name: string; why: string };

// Which division helps most with each readiness dimension.
const BY_GAP: Record<Dimension, DivisionPick[]> = {
  strategy: [
    { slug: 'the-collective', name: 'The Collective', why: 'Turns a fuzzy AI idea into a scoped roadmap with clear first use cases.' },
  ],
  data: [
    { slug: 'binary-loom', name: 'Binary Loom', why: 'Builds the pipelines and tools that get your data into a shape AI can use.' },
    { slug: 'the-collective', name: 'The Collective', why: 'Audits what data you have and what it would take to put it to work.' },
  ],
  culture: [
    { slug: 'hybrid-living', name: 'Hybrid Living', why: 'Teaches your team to work with AI so adoption doesn’t stall at the pilot.' },
  ],
  tech: [
    { slug: 'zenflow', name: 'ZenFlow', why: 'Deploys and runs AI agents inside the tools you already use.' },
    { slug: 'binary-loom', name: 'Binary Loom', why: 'Builds the software and integrations your stack is missing.' },
  ],
  governance: [
    { slug: 'juris-guard', name: 'Juris Guard', why: 'Sets up AI policies, compliance checks and audit trails.' },
    { slug: 'obsidian-arc', name: 'Obsidian Arc', why: 'Covers the security side: access, monitoring and data protection.' },
  ],
};

export function pickDivisions(scores: Record<Dimension, number>): { gap: Dimension; picks: DivisionPick[] } {
  const gap = (Object.keys(scores) as Dimension[]).reduce((low, k) => (scores[k] < scores[low] ? k : low), 'strategy' as Dimension);
  return { gap, picks: BY_GAP[gap] };
}
