'use client';

import { motion } from 'motion/react';
import { PRODUCTS } from '@/constants';
import { ProductCard } from '@/components/product/ProductCard';
import { Badge } from '@/components/ui/badge';

export default function StorePage() {
  const hotSales = PRODUCTS.filter(p => p.isFlashSale || p.originalPrice);
  const allProducts = PRODUCTS;

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 md:px-8">
      <div className="mb-20 space-y-4">
        <h1 className="text-5xl font-light luxury-serif">Our Store</h1>
        <p className="text-stone-500 max-w-xl">
          Discover our curated selection of premium products. 
          The best of global design, delivered to your door.
        </p>
      </div>

      {/* Hot Sales Section */}
      <section className="mb-24">
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-2xl font-light luxury-serif">Hot Sales</h2>
          <Badge className="bg-red-600 uppercase text-[9px] tracking-widest font-black rounded-none px-3 border-none">On Sale</Badge>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {hotSales.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {hotSales.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-stone-100 italic text-stone-400">
              No active flash sales right now. Check back soon.
            </div>
          )}
        </div>
      </section>

      {/* AliExpress Integration Placeholder */}
      <section className="mb-24 bg-stone-50 p-12 lg:p-20 border border-stone-100">
        <div className="max-w-3xl space-y-6">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Coming Soon</span>
          <h2 className="text-4xl font-light luxury-serif">AliExpress Curations</h2>
          <p className="text-stone-600 leading-relaxed font-medium">
            We are currently integrating with DSers to bring you a hand-picked selection of top-performing items directly from international suppliers. 
          </p>
          <div className="flex gap-4">
            <div className="h-2 w-2 rounded-full bg-stone-300 animate-pulse" />
            <div className="h-2 w-2 rounded-full bg-stone-300 animate-pulse delay-75" />
            <div className="h-2 w-2 rounded-full bg-stone-300 animate-pulse delay-150" />
          </div>
        </div>
      </section>

      {/* All Products */}
      <section>
        <div className="mb-10">
          <h2 className="text-2xl font-light luxury-serif">All Items</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
