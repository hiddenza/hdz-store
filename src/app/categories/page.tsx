'use client';
import Link from 'next/link';
import { CATEGORIES } from '@/constants';
import { motion } from 'motion/react';

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-20 pb-40">
       <div className="space-y-4 mb-20 max-w-2xl">
          <span className="text-accent text-xs font-black uppercase tracking-[0.3em]">Directory</span>
          <h1 className="text-5xl md:text-6xl font-light luxury-serif tracking-tight uppercase">Product Collections.</h1>
          <p className="text-stone-500 font-medium">Browse our expert curation by category. Every item is hand-selected for quality and aesthetic alignment.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.id}`} className="group space-y-6">
               <div className="aspect-[3/4] overflow-hidden bg-stone-100 border border-stone-200 shadow-sm transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-black/5">
                  <img 
                    src={cat.image} 
                    alt={cat.name} 
                    className="w-full h-full object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000 group-hover:scale-105"
                  />
               </div>
               <div className="space-y-2">
                  <div className="flex justify-between items-end">
                     <h2 className="text-xl font-light luxury-serif tracking-tight text-black group-hover:text-accent transition-colors uppercase">{cat.name}</h2>
                     <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{cat.count} items</span>
                  </div>
                  <div className="w-full h-px bg-stone-100 group-hover:bg-accent transition-colors duration-700 origin-left scale-x-50 group-hover:scale-x-100" />
               </div>
            </Link>
          ))}
       </div>
    </div>
  );
}
