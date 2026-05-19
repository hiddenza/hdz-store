'use client';

import Link from 'next/link';
import { ArrowRight, Mail, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { toast } from 'sonner';

const SOCIAL_LINKS = [
  { 
    name: 'Instagram', 
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
      </svg>
    ), 
    handle: '@hdz_store', 
    desc: 'Visual culture & technical artifacts',
    color: 'hover:text-pink-500'
  },
  { 
    name: 'TikTok', 
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.27 1.80-.34 1.15.17 2.45 1.17 3.12.72.5 1.63.66 2.48.51 1.33-.21 2.44-1.35 2.52-2.69.04-1.19.02-2.38.02-3.57V0L12.525.02z" />
      </svg>
    ), 
    handle: '@hdz.global', 
    desc: 'Laboratory sequences in motion',
    color: 'hover:text-cyan-400'
  },
  { 
    name: 'Facebook', 
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
      </svg>
    ), 
    handle: 'hdz.store.official', 
    desc: 'International community group',
    color: 'hover:text-blue-600'
  }
];

const FOOTER_COLLECTIONS = [
  { name: 'New Arrivals', href: '/products', tag: 'Limited' },
  { name: 'Best Sellers', href: '/products', tag: 'Core' },
  { name: 'Tech Edit', href: '/products', tag: 'Laboratory' },
  { name: 'Home Essentials', href: '/products', tag: 'Living' },
  { name: 'Flash Sales', href: '/products', tag: 'Express' }
];

const FOOTER_COMPANY = [
  { name: 'Our Story', href: '/about', info: 'Manifesto & Vision' },
  { name: 'Store', href: '/store', info: 'Global Locations' },
  { name: 'Wishlist', href: '/wishlist', info: 'Personal Curation' },
  { name: 'Contact Us', href: '/contact', info: 'Concierge Service' }
];

export function Footer() {
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  return (
    <footer className="bg-white border-t border-stone-100 selection:bg-black selection:text-white">
      
      {/* TRUST BAR */}
      <div className="border-b border-stone-100 py-6 bg-stone-50/50">
        <div className="container mx-auto px-4 md:px-10 flex flex-wrap justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Global Priority Logistics
          </div>

          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            Encrypted Financial Tunnel
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="container mx-auto px-4 md:px-10 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* BRAND */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="text-3xl font-black uppercase">
              HDZ<span className="text-accent">.STORE</span>
            </Link>

            <p className="text-sm text-stone-500">
              Curated objects for refined living.
            </p>

            {/* SOCIAL */}
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((social) => (
                <div key={social.name}>
                  <div className="w-10 h-10 border flex items-center justify-center">
                    <social.icon />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* COLLECTIONS */}
          <div className="lg:col-span-2">
            <h3 className="font-bold mb-4">Inventory</h3>
            <ul className="space-y-3">
              {FOOTER_COLLECTIONS.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COMPANY */}
          <div className="lg:col-span-2">
            <h3 className="font-bold mb-4">Structure</h3>
            <ul className="space-y-3">
              {FOOTER_COMPANY.map((item) => (
                <li key={item.name}>
                  <Link href={item.href}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="lg:col-span-4">
            <div className="bg-stone-50 p-6 space-y-4">
              <h3 className="font-bold">Technical Access</h3>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const email = (e.target as any).email.value;

                  await fetch("/api/subscribe", {
                    method: "POST",
                    body: JSON.stringify({ email }),
                  });

                  toast.success("Subscribed");
                }}
              >
                <input
                  name="email"
                  type="email"
                  className="w-full border p-2 mb-2"
                  placeholder="email"
                />
                <button className="w-full bg-black text-white p-2">
                  Subscribe
                </button>
              </form>

              <div className="flex items-center gap-2 text-xs">
                <Globe className="h-3 w-3" />
                Global Node Active
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}