'use client';

import { useWishlist } from '@/hooks/useWishlist';
import { ProductCard } from '@/components/product/ProductCard';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  return (
    <div className="pt-40 pb-20 container mx-auto px-4 md:px-8 min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 space-y-4"
      >
        <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em]">Saved Objects</span>
        <h1 className="text-5xl md:text-7xl font-light luxury-serif tracking-tight">Wishlist.</h1>
        <p className="text-stone-500 max-w-xl font-medium tracking-tight">
          Your curated selection of future hardware and elite laboratory instruments.
        </p>
      </motion.div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 space-y-10 border border-stone-100 bg-stone-50/50">
          <div className="p-8 bg-white rounded-full shadow-sm">
            <Heart className="h-12 w-12 text-stone-200" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-light luxury-serif">Your collection is empty.</h2>
            <p className="text-stone-400 font-medium tracking-tight">Browse our curators&apos; selections to add items here.</p>
          </div>
          <Link href="/store">
            <Button className="h-16 px-12 bg-black text-white hover:bg-accent border-none transition-all font-black uppercase tracking-[0.3em] text-[11px] rounded-none">
              Explore Store
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
