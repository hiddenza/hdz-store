export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  variants?: {
    name: string;
    options: string[];
  }[];
  isFeatured?: boolean;
  isTrending?: boolean;
  isFlashSale?: boolean;
  isNew?: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: { [key: string]: string };
}

export interface Order {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  address: string;
}

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}
