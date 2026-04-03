import { dbConnect } from './db';
import { HttpError } from './http';
import { oid } from './ids';
import { Store, Template } from '@/models';

function slugOk(s: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
}

export type CreateTemplateBody = {
  slug: string;
  name: string;
  niche: string;
  description: string;
  previewUrl?: string | null;
  defaultAccent?: string;
  demoTagline?: string | null;
  sortOrder?: number;
};

export type UpdateTemplateBody = Partial<CreateTemplateBody>;

export async function createTemplate(body: CreateTemplateBody) {
  await dbConnect();
  const slug = body.slug.trim().toLowerCase();
  if (!slugOk(slug)) {
    throw new HttpError(400, 'Slug must be lowercase letters, numbers, and hyphens only');
  }
  const taken = await Template.findOne({ slug });
  if (taken) throw new HttpError(409, 'Slug already exists');

  const doc = await Template.create({
    slug,
    name: body.name.trim(),
    niche: body.niche.trim(),
    description: body.description.trim(),
    previewUrl: body.previewUrl ?? null,
    defaultAccent: body.defaultAccent?.trim() || '#0d9488',
    demoTagline: body.demoTagline?.trim() ? body.demoTagline.trim() : null,
    sortOrder: typeof body.sortOrder === 'number' && Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
  });
  return doc.toJSON();
}

export async function updateTemplate(templateId: string, body: UpdateTemplateBody) {
  await dbConnect();
  const t = await Template.findById(oid(templateId));
  if (!t) throw new HttpError(404, 'Template not found');

  const $set: Record<string, unknown> = {};

  if (body.slug !== undefined) {
    const slug = body.slug.trim().toLowerCase();
    if (!slugOk(slug)) {
      throw new HttpError(400, 'Slug must be lowercase letters, numbers, and hyphens only');
    }
    if (slug !== t.slug) {
      const taken = await Template.findOne({ slug, _id: { $ne: t._id } });
      if (taken) throw new HttpError(409, 'Slug already exists');
    }
    $set.slug = slug;
  }
  if (body.name !== undefined) $set.name = body.name.trim();
  if (body.niche !== undefined) $set.niche = body.niche.trim();
  if (body.description !== undefined) $set.description = body.description.trim();
  if (body.previewUrl !== undefined) $set.previewUrl = body.previewUrl;
  if (body.defaultAccent !== undefined) $set.defaultAccent = body.defaultAccent.trim() || '#0d9488';
  if (body.demoTagline !== undefined) {
    $set.demoTagline = body.demoTagline?.trim() ? body.demoTagline.trim() : null;
  }
  if (body.sortOrder !== undefined) {
    if (typeof body.sortOrder !== 'number' || !Number.isFinite(body.sortOrder)) {
      throw new HttpError(400, 'sortOrder must be a number');
    }
    $set.sortOrder = body.sortOrder;
  }

  if (Object.keys($set).length === 0) {
    return t.toJSON();
  }

  const updated = await Template.findByIdAndUpdate(t._id, { $set }, { new: true });
  if (!updated) throw new HttpError(404, 'Template not found');
  return updated.toJSON();
}

export async function deleteTemplate(templateId: string) {
  await dbConnect();
  const t = await Template.findById(oid(templateId));
  if (!t) throw new HttpError(404, 'Template not found');
  const n = await Store.countDocuments({ templateId: t._id });
  if (n > 0) {
    throw new HttpError(400, `Cannot delete: ${n} store(s) use this template`);
  }
  await Template.deleteOne({ _id: t._id });
  return { ok: true };
}
