import OpenAI from 'openai';
import { dbConnect } from './db';
import { HttpError } from './http';
import { oid } from './ids';
import { Order, Store } from '@/models';

function getClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

async function assertAiEnabled(storeId: string, userId: string) {
  await dbConnect();
  const store = await Store.findOne({ _id: oid(storeId) });
  if (!store || store.userId.toString() !== userId) return null;
  if (!store.aiEnabled) return null;
  return store;
}

export async function productDescription(params: {
  storeId: string;
  userId: string;
  title: string;
  niche: string;
  language: string;
}) {
  const store = await assertAiEnabled(params.storeId, params.userId);
  if (!store) {
    return { disabled: true, text: 'AI is disabled for this store or access denied.' };
  }
  const client = getClient();
  if (!client) throw new HttpError(503, 'OPENAI_API_KEY not configured');
  const model = process.env.OPENAI_MODEL ?? process.env.AI_MODEL ?? 'gpt-4o-mini';
  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content:
          'You write concise, compelling e-commerce product descriptions optimized for African online shoppers. Include one SEO sentence.',
      },
      {
        role: 'user',
        content: `Product: ${params.title}. Niche: ${params.niche}. Language: ${params.language}.`,
      },
    ],
    max_tokens: 400,
  });
  const text = completion.choices[0]?.message?.content?.trim() ?? '';
  return { text };
}

export async function marketingCopy(params: {
  storeId: string;
  userId: string;
  campaignName: string;
  channel: string;
}) {
  const store = await assertAiEnabled(params.storeId, params.userId);
  if (!store) {
    return { disabled: true, text: 'AI is disabled for this store or access denied.' };
  }
  const client = getClient();
  if (!client) throw new HttpError(503, 'OPENAI_API_KEY not configured');
  const model = process.env.OPENAI_MODEL ?? process.env.AI_MODEL ?? 'gpt-4o-mini';
  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You write short marketing copy for SMS, email, and WhatsApp for African SMBs.',
      },
      {
        role: 'user',
        content: `Campaign: ${params.campaignName}. Channel: ${params.channel}. Store: ${store.name}.`,
      },
    ],
    max_tokens: 350,
  });
  const text = completion.choices[0]?.message?.content?.trim() ?? '';
  return { text };
}

export async function insights(storeId: string, userId: string) {
  const store = await assertAiEnabled(storeId, userId);
  if (!store) {
    return { disabled: true, bullets: [] as string[] };
  }
  const client = getClient();
  if (!client) throw new HttpError(503, 'OPENAI_API_KEY not configured');
  const recentOrders = await Order.countDocuments({ storeId: oid(storeId) });
  const model = process.env.OPENAI_MODEL ?? process.env.AI_MODEL ?? 'gpt-4o-mini';
  const completion = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'Give 3-5 actionable retail insights as short bullet points. Be specific, no fluff.',
      },
      {
        role: 'user',
        content: `Orders (all time): ${recentOrders}. Niche: ${store.niche}.`,
      },
    ],
    max_tokens: 400,
  });
  const raw = completion.choices[0]?.message?.content ?? '';
  const bullets = raw
    .split('\n')
    .map((l) => l.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
  return { bullets };
}
