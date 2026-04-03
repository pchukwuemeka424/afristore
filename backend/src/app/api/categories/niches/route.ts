import { json } from '@/lib/http';

const NICHES = [
  { id: 'fashion', label: 'Fashion & apparel', icon: 'shirt' },
  { id: 'electronics', label: 'Electronics & gadgets', icon: 'cpu' },
  { id: 'food', label: 'Food & groceries', icon: 'utensils' },
  { id: 'crafts', label: 'Crafts & handmade', icon: 'sparkles' },
  { id: 'beauty', label: 'Beauty & personal care', icon: 'heart' },
  { id: 'home', label: 'Home & living', icon: 'home' },
  { id: 'kids', label: 'Kids & baby', icon: 'baby' },
  { id: 'services', label: 'Services & bookings', icon: 'calendar' },
  { id: 'digital', label: 'Digital products', icon: 'download' },
  { id: 'general', label: 'General retail', icon: 'store' },
];

export function GET() {
  return json({ items: NICHES });
}
