'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Search, Heart, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { itemsCount } = useCart();
  const { wishlistCount } = useWishlist();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const auth = supabase?.auth;
    if (auth) {
      auth.getUser().then(({ data: { user: u } }) => setUser(u));
      
      const { data: { subscription } } = auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        subscription.unsubscribe();
      };
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { title: 'Home', href: '/' },
    { title: 'About', href: '/about' },
    { title: 'Contact', href: '/contact' },
    { title: 'Store', href: '/store' },
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <div className="announcement-bar hidden md:block">
        Exclusive Launch: Free Global Express Shipping on Your First 3 Orders
      </div>
      <nav className={cn(
        "transition-all duration-500",
        isScrolled 
          ? "bg-white/95 backdrop-blur-md border-b border-stone-200 py-2 shadow-sm" 
          : "bg-white border-b border-stone-100 py-4"
      )}>
        <div className="container mx-auto px-4 md:px-8 flex items-center h-16 relative">
          {/* Mobile Menu Trigger (Left on mobile) */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 p-0 hover:bg-stone-50">
                  <Menu className="h-6 w-6 text-black" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-0 bg-white">
                <div className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Access home, about, contact, and store pages.</SheetDescription>
                </div>
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <div className="logo text-xl font-black tracking-tighter text-black uppercase">
                      HDZ<span className="text-accent underline decoration-accent/30 underline-offset-4 decoration-2">-STORE</span>
                    </div>
                  </div>
                  
                  <nav className="flex flex-col p-8 gap-8">
                    {navLinks.map((link) => (
                      <SheetClose key={link.href} asChild>
                        <Link 
                          href={link.href} 
                          className={cn(
                            "text-[11px] font-black uppercase tracking-[0.4em] hover:text-accent transition-all",
                            pathname === link.href ? "text-accent" : "text-stone-500"
                          )}
                        >
                          {link.title}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>
                  
                  <div className="mt-auto p-8 border-t border-stone-100 bg-stone-50/50 space-y-6">
                    <SheetClose asChild>
                      <Link href="/wishlist" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-900 transition-colors hover:text-accent">
                        <Heart className="h-4 w-4" /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                      </Link>
                    </SheetClose>
                    {user ? (
                      <SheetClose asChild>
                        <Link href="/dashboard" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-stone-900 transition-colors hover:text-accent">
                          <User className="h-4 w-4" /> Account
                        </Link>
                      </SheetClose>
                    ) : (
                      <SheetClose asChild>
                        <Link href="/auth" className="text-[10px] font-black uppercase tracking-widest text-stone-900 transition-colors hover:text-accent">
                          Login / Register
                        </Link>
                      </SheetClose>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Left section: Nav Links (Desktop) */}
          <div className="hidden lg:flex flex-1 items-center gap-10">
            {navLinks.slice(0, 2).map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={cn(
                  "group relative text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-accent",
                  pathname === link.href ? "text-accent" : "text-stone-500"
                )}
              >
                {link.title}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-500" />
              </Link>
            ))}
          </div>

          {/* Center Logo */}
          <div className="flex-shrink-0 flex-1 lg:flex-none flex justify-center lg:justify-start">
            <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter text-black uppercase hover:italic transition-all">
              HDZ<span className="text-accent underline decoration-accent/30 underline-offset-8 decoration-2">.STORE</span>
            </Link>
          </div>

          {/* Right section: Links + Actions */}
          <div className="flex-1 flex items-center justify-end gap-3 md:gap-8">
            <div className="hidden lg:flex items-center gap-10">
              {navLinks.slice(2).map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={cn(
                    "group relative text-[10px] font-black uppercase tracking-[0.3em] transition-all hover:text-accent",
                    pathname === link.href ? "text-accent" : "text-stone-500"
                  )}
                >
                  {link.title}
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-500" />
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <Link href="/wishlist" className="relative group p-2">
                <Heart className={cn("h-5 w-5 text-stone-900 group-hover:text-accent transition-colors", wishlistCount > 0 && "text-accent")} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 h-3.5 w-3.5 flex items-center justify-center bg-accent text-white text-[7px] font-bold rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="relative group p-2">
                <ShoppingCart className="h-5 w-5 text-stone-900 group-hover:text-accent transition-colors" />
                {itemsCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center bg-black text-white text-[8px] font-bold">
                    {itemsCount}
                  </span>
                )}
              </Link>
              
              <div className="hidden lg:block">
                {user ? (
                  <Link href="/dashboard" className="p-2">
                    <User className="h-5 w-5 text-stone-900 hover:text-accent transition-colors" />
                  </Link>
                ) : (
                  <Link href="/auth" className="text-[10px] font-bold uppercase tracking-widest text-black border-b border-stone-200 hover:border-black transition-all">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
