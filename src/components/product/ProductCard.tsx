'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  key?: string | number;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const favorited = isInWishlist(product.id);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="product-card-luxury group relative flex flex-col h-full"
    >
      {/* Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        {product.isNew && <span className="badge-luxury">New In</span>}
        {product.isTrending && <span className="badge-premium">Premium</span>}
        {product.isFlashSale && <span className="badge-luxury bg-red-600">Sale</span>}
      </div>

      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="block aspect-[4/5] overflow-hidden bg-stone-50 relative">
        <motion.img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110"
        />
        {product.images[1] && (
          <img 
            src={product.images[1]} 
            alt={`${product.name} alternate`} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        
        {/* Quick Add Button */}
        <div className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-500 translate-y-full group-hover:translate-y-0 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
           <Button 
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="w-full h-12 bg-white text-black hover:bg-black hover:text-white border border-stone-200 transition-all font-bold uppercase tracking-widest text-[10px] shadow-xl rounded-none"
           >
             Quick Add
           </Button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-8 space-y-6 flex-grow flex flex-col justify-between">
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <span className="text-[9px] text-stone-400 font-black uppercase tracking-[0.3em]">{product.category}</span>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(product);
                }}
                className={cn(
                  "transition-all duration-300 transform active:scale-125",
                  favorited ? "text-accent" : "text-stone-300 hover:text-accent"
                )}
              >
                <Heart className={cn("h-4 w-4", favorited && "fill-current")} />
              </button>
           </div>
           <Link href={`/products/${product.id}`} className="block group/title">
              <h3 className="text-lg font-light luxury-serif tracking-tight text-black group-hover/title:text-accent transition-colors leading-snug">{product.name}</h3>
           </Link>
        </div>
        
        <div className="flex items-center justify-between border-t border-stone-100 pt-6">
           <div className="flex items-baseline gap-3">
              <span className="text-lg font-black tracking-tighter text-black">${product.price.toFixed(2)}</span>
              {product.originalPrice && (
                 <span className="text-xs text-stone-300 line-through font-medium tracking-tight">${product.originalPrice.toFixed(2)}</span>
              )}
           </div>
           
           <Link href={`/products/${product.id}`} className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5">
              Details
           </Link>
        </div>
      </div>
    </motion.div>
  );
}
