import { dbConnect } from './db';
import { HttpError } from './http';
import { oid } from './ids';
import { Product, Store } from '@/models';
import * as notifications from './notifications';

export type CreateProductBody = {
  title: string;
  description?: string;
  price: number;
  currency: string;
  sku?: string;
  stock: number;
  images?: string[];
  published?: boolean;
};

export type UpdateProductBody = Partial<CreateProductBody> & { sku?: string | null };

async function assertStoreOwner(userId: string, storeId: string) {
  await dbConnect();
  const store = await Store.findOne({ _id: oid(storeId), userId: oid(userId) });
  if (!store) throw new HttpError(404, 'Store not found');
  return store;
}

export async function listPublicBySlug(slug: string) {
  await dbConnect();
  const store = await Store.findOne({ slug });
  if (!store) throw new HttpError(404, 'Store not found');
  const rows = await Product.find({ storeId: store._id, published: true }).sort({ createdAt: -1 });
  return rows.map((p) => p.toJSON());
}

export async function getPublishedProductBySlug(slug: string, productId: string) {
  await dbConnect();
  const store = await Store.findOne({ slug });
  if (!store) throw new HttpError(404, 'Store not found');
  const product = await Product.findOne({
    _id: oid(productId),
    storeId: store._id,
    published: true,
  });
  if (!product) throw new HttpError(404, 'Product not found');
  return product.toJSON();
}

export async function listForDashboard(userId: string, storeId: string) {
  await assertStoreOwner(userId, storeId);
  const rows = await Product.find({ storeId: oid(storeId) }).sort({ updatedAt: -1 });
  return rows.map((p) => p.toJSON());
}

export async function createProduct(userId: string, storeId: string, dto: CreateProductBody) {
  await assertStoreOwner(userId, storeId);
  const product = await Product.create({
    storeId: oid(storeId),
    title: dto.title,
    description: dto.description ?? '',
    price: dto.price,
    currency: dto.currency,
    sku: dto.sku ?? null,
    stock: dto.stock,
    images: dto.images ?? [],
    published: dto.published ?? false,
  });
  const j = product.toJSON() as { title: string; stock: number };
  if (j.stock <= 2) {
    await notifications.notifyLowInventory(storeId, j.title, j.stock);
  }
  return product.toJSON();
}

export async function updateProduct(
  userId: string,
  storeId: string,
  productId: string,
  dto: UpdateProductBody,
) {
  await assertStoreOwner(userId, storeId);
  const existing = await Product.findOne({ _id: oid(productId), storeId: oid(storeId) });
  if (!existing) throw new HttpError(404, 'Product not found');

  const product = await Product.findOneAndUpdate(
    { _id: oid(productId), storeId: oid(storeId) },
    {
      $set: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.sku !== undefined && { sku: dto.sku }),
        ...(dto.stock !== undefined && { stock: dto.stock }),
        ...(dto.images !== undefined && { images: dto.images }),
        ...(dto.published !== undefined && { published: dto.published }),
      },
    },
    { new: true },
  );
  if (!product) throw new HttpError(404, 'Product not found');
  const j = product.toJSON() as { title: string; stock: number };
  if (j.stock <= 2) {
    await notifications.notifyLowInventory(storeId, j.title, j.stock);
  }
  return product.toJSON();
}

export async function deleteProduct(userId: string, storeId: string, productId: string) {
  await assertStoreOwner(userId, storeId);
  const existing = await Product.findOne({ _id: oid(productId), storeId: oid(storeId) });
  if (!existing) throw new HttpError(404, 'Product not found');
  await Product.deleteOne({ _id: oid(productId) });
  return { ok: true };
}
