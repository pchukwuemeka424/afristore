import { dbConnect } from './db';
import { DeploymentStatus } from './enums';
import { HttpError } from './http';
import { oid } from './ids';
import { Store, Template } from '@/models';
import { provisionStore } from './deployment';
import * as notifications from './notifications';

export type CreateStoreBody = {
  name: string;
  slug: string;
  language: string;
  currency: string;
  niche: string;
  templateId: string;
  brandColor?: string;
  sectionTemplate?: string | null;
  templateMenu?: string[];
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  heroAlign?: 'left' | 'center' | 'right';
};

export type UpdateStoreBody = {
  name?: string;
  language?: string;
  currency?: string;
  logoUrl?: string | null;
  brandColor?: string;
  aiEnabled?: boolean;
  onboardingComplete?: boolean;
  /** Digits with country code, no + (e.g. 2348012345678). Omit or null to disable WhatsApp checkout. */
  whatsappPhone?: string | null;
  tagline?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  heroAlign?: 'left' | 'center' | 'right';
  templateMenu?: string[];
  siteDescription?: string | null;
  /** Section-template layout id chosen from the template picker (e.g. ng-ecom-catalog) */
  sectionTemplate?: string | null;
};

function formatStore(doc: { toJSON: () => Record<string, unknown> } | null) {
  if (!doc) return null;
  const j = doc.toJSON() as Record<string, unknown>;
  const tpl = j.templateId;
  if (tpl && typeof tpl === 'object' && tpl !== null && 'slug' in tpl) {
    const t = tpl as { id?: string };
    return { ...j, template: tpl, templateId: t.id ?? j.templateId };
  }
  return j;
}

export async function listStores(userId: string) {
  await dbConnect();
  const userOid = oid(userId);
  const rows = await Store.find({ userId: userOid })
    .populate('templateId')
    .sort({ createdAt: -1 });
  return rows.map((r) => formatStore(r)!);
}

export async function getStore(userId: string, storeId: string) {
  await dbConnect();
  const store = await Store.findOne({ _id: oid(storeId), userId: oid(userId) }).populate('templateId');
  if (!store) throw new HttpError(404, 'Store not found');
  return formatStore(store)!;
}

export async function getStoreBySlugPublic(slug: string) {
  await dbConnect();
  const store = await Store.findOne({ slug }).populate('templateId');
  if (!store) throw new HttpError(404, 'Store not found');
  return formatStore(store)!;
}

export async function createStore(userId: string, dto: CreateStoreBody) {
  await dbConnect();
  const slugTaken = await Store.findOne({ slug: dto.slug });
  if (slugTaken) throw new HttpError(409, 'Subdomain already taken');

  const template = await Template.findById(oid(dto.templateId));
  if (!template) throw new HttpError(400, 'Invalid template');

  const store = await Store.create({
    userId: oid(userId),
    name: dto.name,
    slug: dto.slug,
    language: dto.language,
    currency: dto.currency,
    niche: dto.niche,
    templateId: template._id,
    brandColor: dto.brandColor ?? template.defaultAccent,
    sectionTemplate: dto.sectionTemplate ?? null,
    templateMenu: dto.templateMenu ?? [],
    heroTitle: dto.heroTitle ?? null,
    heroSubtitle: dto.heroSubtitle ?? null,
    heroImageUrl: dto.heroImageUrl ?? null,
    heroAlign: dto.heroAlign ?? 'left',
    onboardingComplete: true,
    deploymentStatus: DeploymentStatus.PENDING,
  });

  const provision = await provisionStore({
    storeId: store.id,
    slug: store.slug,
    name: store.name,
  });

  store.deploymentStatus = provision.ok ? DeploymentStatus.PROVISIONING : DeploymentStatus.FAILED;
  store.coolifyDeploymentId = provision.deploymentId ?? null;
  await store.save();

  const populated = await Store.findById(store._id).populate('templateId');
  const out = formatStore(populated)!;
  await notifications.notifyStoreCreated({ name: String(out.name), slug: String(out.slug) });
  return out;
}

function normalizeWhatsappPhone(input: string | null | undefined): string | null {
  if (input === null || input === undefined) return null;
  const s = String(input).trim();
  if (!s) return null;
  const digits = s.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) {
    throw new HttpError(400, 'WhatsApp number must be 10–15 digits including country code (no + required)');
  }
  return digits;
}

export async function updateStore(userId: string, storeId: string, dto: UpdateStoreBody) {
  await getStore(userId, storeId);
  await dbConnect();
  const { whatsappPhone, sectionTemplate, templateMenu, heroAlign, ...rest } = dto;
  const $set: Record<string, unknown> = { ...rest };
  if (whatsappPhone !== undefined) {
    $set.whatsappPhone = normalizeWhatsappPhone(whatsappPhone);
  }
  if (sectionTemplate !== undefined) {
    $set.sectionTemplate = sectionTemplate;
  }
  if (templateMenu !== undefined) {
    $set.templateMenu = templateMenu
      .map((item) => String(item).trim())
      .filter(Boolean)
      .slice(0, 12);
  }
  if (heroAlign !== undefined) {
    $set.heroAlign = ['left', 'center', 'right'].includes(heroAlign) ? heroAlign : 'left';
  }
  const updated = await Store.findOneAndUpdate(
    { _id: oid(storeId), userId: oid(userId) },
    { $set },
    { new: true, strict: false },
  ).populate('templateId');
  if (!updated) throw new HttpError(404, 'Store not found');
  return formatStore(updated)!;
}
