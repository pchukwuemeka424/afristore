/** Shared types used by API and web (import via workspace or copy patterns). */

export type Niche =
  | 'fashion'
  | 'electronics'
  | 'food'
  | 'crafts'
  | 'beauty'
  | 'home'
  | 'kids'
  | 'services'
  | 'digital'
  | 'general';

export interface TemplateMeta {
  id: string;
  slug: string;
  name: string;
  niche: Niche;
  description: string;
  previewImage?: string;
  defaultAccent: string;
  demoTagline: string;
}
