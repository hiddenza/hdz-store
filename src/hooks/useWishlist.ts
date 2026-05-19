'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (error) {
        console.error('Failed to parse wishlist:', error);
      }
    }
  }, []);

  const toggleWishlist = (product: Product) => {
    const isItemInWishlist = wishlist.some((item) => item.id === product.id);
    let updatedWishlist;

    if (isItemInWishlist) {
      updatedWishlist = wishlist.filter((item) => item.id !== product.id);
    } else {
      updatedWishlist = [...wishlist, product];
    }

    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const wishlistCount = wishlist.length;

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    wishlistCount,
  };
}
