import { loadEnvConfig } from '@next/env';
import { dbConnect } from '../src/lib/db';
import { Template } from '../src/models';

// Ensure scripts run with backend/.env without relying on repo-root env files.
loadEnvConfig(process.cwd());

const NICHES = [
  'fashion',
  'electronics',
  'food',
  'crafts',
  'beauty',
  'home',
  'kids',
  'services',
  'digital',
  'general',
] as const;

const TAGLINES: Record<string, string[]> = {
  fashion: ['Bold African streetwear', 'Heritage meets runway', 'Sustainable slow fashion'],
  electronics: ['Trusted tech for Africa', 'Gadgets delivered fast', 'Smart home, smart price'],
  food: ['Farm to table freshness', 'Spice-forward flavors', 'Pan-African pantry'],
  crafts: ['Handmade with heart', 'Artisan stories', 'Heritage textiles'],
  beauty: ['Glow for every tone', 'Clean beauty essentials', 'Salon-grade at home'],
  home: ['Warm modern living', 'Curated decor', 'Functional minimalism'],
  kids: ['Playful & safe', 'Growing with grace', 'Bright learning toys'],
  services: ['Book trusted pros', 'Local expertise', 'On-demand excellence'],
  digital: ['Templates & tools', 'Creator economy', 'Instant downloads'],
  general: ['Your store, your rules', 'Sell anything online', 'Commerce made simple'],
};

function buildTemplates() {
  const out: {
    slug: string;
    name: string;
    niche: string;
    description: string;
    defaultAccent: string;
    demoTagline: string;
    sortOrder: number;
  }[] = [];
  const accents = ['#0d9488', '#2563eb', '#c026d3', '#ea580c', '#16a34a'];
  let order = 0;
  for (const niche of NICHES) {
    const lines = TAGLINES[niche] ?? ['Built for entrepreneurs'];
    for (let i = 0; i < 5; i++) {
      const variant = i + 1;
      const slug = `${niche}-studio-${variant}`;
      out.push({
        slug,
        name: `${niche.charAt(0).toUpperCase() + niche.slice(1)} Studio ${variant}`,
        niche,
        description: `Mobile-first storefront for ${niche} sellers — variant ${variant} with demo content and easy customization.`,
        defaultAccent: accents[i % accents.length],
        demoTagline: lines[i % lines.length],
        sortOrder: order++,
      });
    }
  }
  return out;
}

async function main() {
  await dbConnect();
  const templates = buildTemplates();
  if (templates.length !== 50) {
    throw new Error(`Expected 50 templates, got ${templates.length}`);
  }

  for (const t of templates) {
    await Template.findOneAndUpdate(
      { slug: t.slug },
      {
        $set: {
          name: t.name,
          niche: t.niche,
          description: t.description,
          defaultAccent: t.defaultAccent,
          demoTagline: t.demoTagline,
          sortOrder: t.sortOrder,
        },
      },
      { upsert: true },
    );
  }

  console.log(`Seeded ${templates.length} templates.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
