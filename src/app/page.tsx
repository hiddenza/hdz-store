'use client';

import { motion } from 'motion/react';
import { ArrowRight, Zap, TrendingUp, ShieldCheck, Globe } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PRODUCTS, CATEGORIES } from '@/constants';
import { ProductCard } from '@/components/product/ProductCard';

export default function Home() {
  const featuredProducts = PRODUCTS.filter(p => p.isFeatured);
  const trendingProducts = PRODUCTS.filter(p => p.isTrending);

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] bg-stone-950 flex items-center overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
           <img 
            src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1920&q=80" 
            className="w-full h-full object-cover opacity-60 scale-105" 
            alt="Advanced Hardware" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-12 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-4">
                <span className="h-px w-12 bg-accent/50" />
                <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em]">Future Hardware Lab 2026</span>
              </div>
              <h1 className="text-7xl md:text-9xl font-light luxury-serif leading-[0.9] text-white tracking-tighter uppercase">
                Elite <br /> 
                <span className="italic-serif text-accent lowercase">Hardware.</span>
              </h1>
            </div>
            
            <p className="text-stone-400 text-lg md:text-xl leading-relaxed max-w-xl font-medium tracking-tight">
              A curated laboratory for high-ticket electronics and cutting-edge hardware. Scientifically validated, globally sourced.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 pt-6">
              <Link href="/store">
                <Button className="h-20 px-16 bg-white text-black hover:bg-accent hover:text-white border-none transition-all font-black uppercase tracking-[0.3em] text-[11px] rounded-none shadow-2xl">
                  Access Hardware
                </Button>
              </Link>
              <Link href="/about" className="flex items-center gap-4 group">
                <span className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all">
                  <ArrowRight className="h-4 w-4 text-white group-hover:text-black transition-colors" />
                </span>
                <span className="text-white text-[10px] font-black uppercase tracking-[0.3em]">The Tech Lab</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
           <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] rotate-90 translate-y-8">Scroll</span>
           <div className="h-16 w-px bg-gradient-to-t from-white/40 to-transparent" />
        </div>
      </section>

       <section className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-y border-stone-100 py-16">
           <div className="space-y-4">
              <div className="h-12 w-12 bg-stone-50 flex items-center justify-center border border-stone-100">
                <Globe className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-widest">Innovation</h3>
              <p className="text-stone-400 text-xs font-medium leading-relaxed">Direct sourcing from the world&apos;s leading R&D laboratories.</p>
           </div>
           <div className="space-y-4">
              <div className="h-12 w-12 bg-stone-50 flex items-center justify-center border border-stone-100">
                <ShieldCheck className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-widest">Precision</h3>
              <p className="text-stone-400 text-xs font-medium leading-relaxed">Every device undergoes a multi-point technical validation.</p>
           </div>
           <div className="space-y-4">
              <div className="h-12 w-12 bg-stone-50 flex items-center justify-center border border-stone-100">
                <Zap className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-widest">Speed</h3>
              <p className="text-stone-400 text-xs font-medium leading-relaxed">Tier-1 logistics network for high-value hardware transit.</p>
           </div>
           <div className="space-y-4">
              <div className="h-12 w-12 bg-stone-50 flex items-center justify-center border border-stone-100">
                <TrendingUp className="h-6 w-6 text-black" />
              </div>
              <h3 className="text-[12px] font-black uppercase tracking-widest">Authority</h3>
              <p className="text-stone-400 text-xs font-medium leading-relaxed">Curated hardware that defines the future of consumer tech.</p>
           </div>
        </div>
      </section>

      {/* Featured Collections - Better Visuals */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
           <div className="space-y-4">
              <span className="text-accent text-xs font-black uppercase tracking-[0.3em]">Curation 01</span>
              <h2 className="text-4xl md:text-5xl font-light luxury-serif tracking-tight">Shop the Edit.</h2>
           </div>
           <Link href="/categories" className="group flex items-center gap-3 text-[11px] font-black uppercase tracking-widest">
              Explore All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
           </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {CATEGORIES.slice(0, 3).map((cat, idx) => (
            <Link 
              key={cat.id} 
              href={`/products?category=${cat.id}`} 
              className={`group relative overflow-hidden bg-stone-100 aspect-[4/5] ${idx === 1 ? 'lg:translate-y-12' : ''}`}
            >
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110 grayscale group-hover:grayscale-0"
              />
              <div className="absolute inset-x-0 bottom-0 p-8 pt-20 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end translate-y-4 group-hover:translate-y-0 transition-transform duration-700">
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{cat.count} Items</span>
                <h3 className="text-2xl font-light text-white luxury-serif mb-6">{cat.name}</h3>
                <div className="w-12 h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Collections Index - Technical Grid Style (Recipe 1) */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-[1px] flex-1 bg-stone-100" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-stone-400">Inventory Index / Collections</h2>
          <div className="h-[1px] flex-1 bg-stone-100" />
        </div>
        
        <div className="border border-stone-100">
          {[
            { id: '01', name: 'New Arrivals', status: 'In Transit', desc: 'Latest technical artifacts from global labs.' },
            { id: '02', name: 'Best Sellers', status: 'Priority', desc: 'Peer-validated hardware choices.' },
            { id: '03', name: 'Tech Edit', status: 'Certified', desc: 'Elite laboratory-grade electronics.' },
            { id: '04', name: 'Home Essentials', status: 'Stocked', desc: 'Refined objects for modern living spaces.' },
            { id: '05', name: 'Flash Sales', status: 'Express', desc: 'High-speed window of opportunity.' }
          ].map((item) => (
            <Link 
              key={item.id} 
              href="/products" 
              className="group grid grid-cols-1 md:grid-cols-12 items-center p-8 border-b last:border-b-0 border-stone-100 hover:bg-black transition-all duration-500"
            >
              <div className="md:col-span-1 text-[10px] font-black text-stone-300 group-hover:text-stone-700 transition-colors uppercase tracking-widest">{item.id}</div>
              <div className="md:col-span-4 text-2xl font-light luxury-serif text-black group-hover:text-white transition-colors">{item.name}</div>
              <div className="md:col-span-1 hidden md:block">
                <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              </div>
              <div className="md:col-span-4 text-xs text-stone-400 group-hover:text-stone-500 transition-colors font-medium">{item.desc}</div>
              <div className="md:col-span-2 hidden md:flex justify-end">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] border border-stone-200 group-hover:border-stone-800 text-stone-500 group-hover:text-stone-700 px-3 py-1 transition-all">
                  {item.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Global Network Section - Brutalist / Creative (Recipe 5) */}
      <section className="bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-0.5 bg-black" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Global Network Status: Active</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] italic">
                  Digital <br /> Artifacts.
                </h2>
                <p className="max-w-md text-stone-500 text-sm font-medium leading-relaxed">
                  Our presence translates technical prowess into visual culture. Join the network for unfiltered access to the laboratory.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { name: 'Instagram', label: 'CULTURE', desc: 'Visual archives @hdz_store', color: 'bg-pink-50' },
                  { name: 'TikTok', label: 'MOTION', desc: 'Hardware in flow @hdz.global', color: 'bg-cyan-50' },
                  { name: 'Facebook', label: 'COMMUNITY', desc: 'Private group access', color: 'bg-blue-50' }
                ].map((p) => (
                  <motion.div 
                    key={p.name}
                    whileHover={{ scale: 1.02 }}
                    className={`p-10 border border-stone-100 group cursor-pointer transition-all hover:border-black ${p.color}`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 group-hover:text-black mb-4 block">/ {p.label}</span>
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{p.name}</h3>
                    <p className="text-[11px] text-stone-500 font-medium">{p.desc}</p>
                    <div className="mt-8 h-8 w-8 rounded-full border border-stone-900 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="relative group perspective-1000 hidden lg:block">
              <div className="relative aspect-square bg-stone-950 overflow-hidden transform group-hover:rotate-1 transition-transform duration-[2000ms]">
                <img 
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80" 
                  className="w-full h-full object-cover opacity-50 transition-transform duration-[3000ms] group-hover:scale-110" 
                  alt="Network Terminal"
                />
                <div className="absolute inset-0 p-12 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Node: HDZ-001 <br /> Location: Global</div>
                    <div className="text-[10px] font-black text-accent uppercase tracking-[0.4em]">Status: Syncing...</div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-6xl font-light luxury-serif text-white leading-none">The <br /> Future <br /> Laboratory</h3>
                    <div className="h-px w-full bg-white/20" />
                    <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">
                      <span>© 2024 HDZ-STORE</span>
                      <span>Verified Hardware Only</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-4 border border-stone-100 -z-10 group-hover:scale-110 transition-transform duration-1000" />
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="bg-stone-50 py-32 border-y border-stone-100">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-20">
             <span className="text-accent text-xs font-black uppercase tracking-[0.3em]">Trending Now</span>
             <h2 className="text-4xl md:text-5xl font-light luxury-serif">Scientific Excellence.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-20 text-center">
             <Link href="/products">
                <Button className="btn-luxury h-16 bg-white text-black border-stone-200">
                  Shop Entire Store
                </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Full Width Impact Section */}
      <section className="container mx-auto px-4 md:px-8">
        <div className="relative h-[600px] flex items-center justify-center overflow-hidden bg-black group">
           <img 
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-[3000ms] group-hover:scale-110" 
              alt="Global Innovation Network"
           />
           <div className="relative z-10 text-center space-y-10 px-6">
              <span className="text-accent text-[11px] font-black uppercase tracking-[0.4em]">Elite Sourcing</span>
              <h2 className="text-5xl md:text-7xl font-light text-white luxury-serif tracking-widest leading-none uppercase">
                Hardware <br className="md:hidden" /> Evolution.
              </h2>
              <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed tracking-wide font-medium">
                Our logistics network bridges the gap between high-tech R&D centers and your personal collection. Authentic, verified, and secured.
              </p>
              <Link href="/store">
                <Button className="h-16 px-12 bg-white text-black rounded-none font-black uppercase tracking-widest text-[11px] hover:bg-accent hover:text-white transition-all shadow-2xl">
                  Access Collection
                </Button>
              </Link>
           </div>
        </div>
      </section>
    </div>
  );
}
