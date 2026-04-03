import { StorefrontCartProvider } from '@/lib/storefront-cart';

export default async function StorefrontSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <StorefrontCartProvider storeSlug={slug}>{children}</StorefrontCartProvider>;
}
