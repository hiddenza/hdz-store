import { Product, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'audio', name: 'High-Fidelity Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', count: 42 },
  { id: 'computing', name: 'Elite Computing', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', count: 28 },
  { id: 'smart-home', name: 'Intelligent Living', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80', count: 35 },
  { id: 'wearables', name: 'Wearable Tech', image: 'https://images.unsplash.com/photo-1510766327425-99fce814628a?w=800&q=80', count: 19 },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Spatial One Headphones',
    description: 'Bespoke noise-cancelling headphones with vacuum-tube warmth and carbon-fiber construction. The pinnacle of personal audio.',
    price: 1299.00,
    originalPrice: 1599.00,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80'
    ],
    category: 'audio',
    tags: ['spatial', 'audio', 'luxury'],
    rating: 4.9,
    reviewsCount: 128,
    inStock: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p2',
    name: 'Nano-Glass Workstation',
    description: 'A liquid-cooled mini-PC housed in a single block of aerospace-grade aluminum. Performance meets sculptural art.',
    price: 2450.00,
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80'
    ],
    category: 'computing',
    tags: ['workstation', 'pro', 'minimalist'],
    rating: 5.0,
    reviewsCount: 42,
    inStock: true,
    isTrending: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Holographic Smart Hub',
    description: 'A smart home controller that uses light refraction to display your calendar and metrics in mid-air.',
    price: 899.00,
    originalPrice: 1100.00,
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80'
    ],
    category: 'smart-home',
    tags: ['hologram', 'future', 'smart'],
    rating: 4.7,
    reviewsCount: 215,
    inStock: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'p4',
    name: 'Titanium X-Watch',
    description: 'A 21-day battery life wearable crafted from grade 5 titanium and sapphire crystal. Built for the elite.',
    price: 650.00,
    images: [
      'https://images.unsplash.com/photo-1544117518-30df578096a4?w=800&q=80'
    ],
    category: 'wearables',
    tags: ['titanium', 'fitness', 'luxury'],
    rating: 4.8,
    reviewsCount: 89,
    inStock: true,
    isTrending: true,
    createdAt: new Date().toISOString(),
  },
];
