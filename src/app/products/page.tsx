'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { PRODUCTS, CATEGORIES } from '@/constants';
import { ProductCard } from '@/components/product/ProductCard';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const filteredProducts = PRODUCTS
    .filter(p => categoryFilter === 'all' || p.category === categoryFilter)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'price-low') return a.price - b.price;
      if (sortOrder === 'price-high') return b.price - a.price;
      if (sortOrder === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="container mx-auto px-4 md:px-10 pb-40">
      <div className="space-y-16 mt-32">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 border-b border-stone-100 pb-12">
          <div className="space-y-4">
             <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-accent">Worldwide Curation</span>
             <h1 className="text-4xl md:text-5xl font-light tracking-tight text-black luxury-serif uppercase">Complete <br />Collection.</h1>
             <p className="text-slate-400 text-sm font-medium tracking-wide">Showing all {filteredProducts.length} premium essentials.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
             <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 transition-colors group-focus-within:text-black" />
                <Input 
                  placeholder="Filter by keyword..." 
                  className="pl-12 h-14 border-stone-200 rounded-none bg-stone-50 focus:bg-white transition-all text-sm font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
             
             <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[220px] h-14 rounded-none border-stone-200 bg-stone-50 focus:bg-white text-[12px] font-bold uppercase tracking-widest px-6">
                  <SelectValue placeholder="Sort Results" />
                </SelectTrigger>
                <SelectContent className="rounded-none border-stone-200">
                  <SelectItem value="newest" className="text-[11px] font-bold uppercase tracking-widest">Newest First</SelectItem>
                  <SelectItem value="price-low" className="text-[11px] font-bold uppercase tracking-widest">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="text-[11px] font-bold uppercase tracking-widest">Price: High to Low</SelectItem>
                  <SelectItem value="rating" className="text-[11px] font-bold uppercase tracking-widest">Top Rated</SelectItem>
                </SelectContent>
             </Select>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 border-b border-stone-50 pb-8 overflow-x-auto scrollbar-hide">
           <button 
             onClick={() => setCategoryFilter('all')}
             className={`px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${categoryFilter === 'all' ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-600'}`}
           >
             All Collections
           </button>
           {CATEGORIES.map(cat => (
             <button 
               key={cat.id}
               onClick={() => setCategoryFilter(cat.id)}
               className={`px-6 py-2 text-[11px] font-bold uppercase tracking-widest transition-all ${categoryFilter === cat.id ? 'text-black border-b-2 border-black' : 'text-slate-400 hover:text-slate-600'}`}
             >
               {cat.name}
             </button>
           ))}
        </div>

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-40 border border-dashed border-stone-200 bg-stone-50/50">
             <div className="w-24 h-24 bg-white border border-stone-100 rounded-full flex items-center justify-center mb-8 shadow-sm">
                <Search className="h-8 w-8 text-stone-200" />
             </div>
             <h3 className="text-2xl font-light luxury-serif text-black uppercase tracking-widest mb-2">Zero Matches.</h3>
             <p className="text-slate-400 text-sm font-medium tracking-wide mb-8">Refine your criteria and try searching again.</p>
             <button 
                className="text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:text-accent hover:border-accent transition-all"
                onClick={() => {setSearch(''); setCategoryFilter('all');}}
              >
                Clear All Filters
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
