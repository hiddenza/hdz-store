'use client';

import { motion } from 'motion/react';
import { ShieldCheck, Truck, Globe, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-32 pb-32 pt-20">
       {/* Hero */}
       <section className="relative h-[60vh] bg-stone-950 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-40 bg-grid-stone" />
          <div className="relative z-10 text-center space-y-6 px-4">
             <span className="text-accent text-xs font-black uppercase tracking-[0.4em]">Our Mission</span>
             <h1 className="text-5xl md:text-7xl font-light text-white luxury-serif tracking-tight uppercase">Engineering the Future.</h1>
             <p className="text-stone-400 max-w-lg mx-auto text-sm font-medium tracking-wide">A dedicated laboratory for high-ticket electronics and cutting-edge hardware since 2026.</p>
          </div>
       </section>

       {/* Values */}
       <section className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
             <div className="space-y-8">
                <h2 className="text-4xl font-light luxury-serif tracking-tight">Technical innovation, delivered without compromise.</h2>
                <p className="text-stone-500 leading-relaxed font-medium">
                   HDZ-STORE was founded on the belief that premium hardware should be accessible globally. We bridge the gap between innovation centers and tech enthusiasts with elite logistics.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6">
                   <div className="space-y-3">
                      <Award className="h-6 w-6 text-accent" />
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-black">Electronic Precision</h3>
                      <p className="text-xs text-stone-400 leading-relaxed">Every device undergoes a 12-point technical validation before curation.</p>
                   </div>
                   <div className="space-y-3">
                      <Truck className="h-6 w-6 text-accent" />
                       <h3 className="text-[11px] font-black uppercase tracking-widest text-black">Secure In-Transit</h3>
                       <p className="text-xs text-stone-400 leading-relaxed">Padded, climate-controlled logistics for sensitive high-end electronics.</p>
                    </div>
                 </div>
              </div>
              <div className="aspect-square bg-stone-100 relative overflow-hidden">
                 <img 
                   src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80" 
                   alt="Tech lab" 
                   className="w-full h-full object-cover grayscale brightness-90"
                 />
              </div>
           </div>
        </section>

        {/* Process */}
        <section className="bg-stone-50 py-32 border-y border-stone-100">
           <div className="container mx-auto px-4 md:px-8">
              <div className="text-center space-y-4 mb-20">
                 <span className="text-accent text-xs font-black uppercase tracking-[0.3em]">The Workflow</span>
                 <h2 className="text-4xl font-light luxury-serif uppercase">Our Methodology.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                 {[
                   { step: '01', title: 'Source', desc: 'We identify the next generation of hardware directly from Tier-1 suppliers.' },
                   { step: '02', title: 'Test', desc: 'Direct technical inspections at the source ensure high-ticket reliability.' },
                   { step: '03', title: 'Ship', desc: 'Advanced logistics ensure your tech arrives in factory-perfect condition.' }
                 ].map((item) => (
                   <div key={item.step} className="space-y-6 text-center">
                      <span className="text-4xl font-light luxury-serif text-accent/30">{item.step}</span>
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-black">{item.title}</h3>
                      <p className="text-sm text-stone-500 font-medium leading-relaxed">{item.desc}</p>
                   </div>
                 ))}
              </div>
           </div>
        </section>
    </div>
  );
}
