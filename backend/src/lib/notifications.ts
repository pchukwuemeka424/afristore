export type StoreNotify = { name: string; slug: string };

export async function notifyStoreCreated(store: StoreNotify) {
  console.log(`[email/whatsapp stub] Store created: ${store.name} (${store.slug})`);
}

export async function notifyNewOrder(storeId: string, orderId: string, customerEmail: string) {
  console.log(`[stub] New order ${orderId} for store ${storeId} from ${customerEmail}`);
}

export async function notifyLowInventory(storeId: string, productTitle: string, stock: number) {
  console.warn(`[stub] Low stock: ${productTitle} (${stock}) in ${storeId}`);
}

export async function notifyPaymentConfirmed(storeId: string, reference: string) {
  console.log(`[stub] Payment confirmed ${reference} for ${storeId}`);
}
