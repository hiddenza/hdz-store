'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { items, totalPrice } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customerEmail: user?.email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      const { url } = data;
      toast.success('Redirecting to Stripe Secure Checkout...');
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Stripe session URL is missing');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Checkout failed. Please ensure environment variables are set.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  if (items.length === 0) return null;

  return (
    <div className="container mx-auto px-4 py-20 min-h-[70vh] flex items-center justify-center">
      <div className="max-w-xl w-full bg-white p-16 border border-stone-100 shadow-2xl shadow-black/5 space-y-12 text-center">
         <div className="space-y-6">
            <div className="w-20 h-20 bg-stone-50 border border-stone-100 flex items-center justify-center mx-auto">
               <Lock className="h-8 w-8 text-stone-300" />
            </div>
            <h1 className="text-4xl font-light luxury-serif uppercase tracking-tight">Secure Finalization.</h1>
            <p className="text-stone-500 text-sm leading-relaxed font-sans">You&apos;re about to be redirected to our secure payment partner, Stripe, to complete your international acquisition.</p>
         </div>

         <div className="bg-stone-50 border border-stone-200 p-10 space-y-6">
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Total Selection</span>
               <span className="font-bold text-black uppercase tracking-widest">{items.length} Items</span>
            </div>
            <div className="flex justify-between items-center">
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Final Valuation</span>
               <span className="text-3xl font-black text-black tracking-tighter">${totalPrice.toFixed(2)}</span>
            </div>
         </div>

         <div className="space-y-6">
            <Button 
               className="btn-luxury w-full h-20 text-[12px] flex items-center justify-center gap-4 group"
               onClick={handleCheckout}
               disabled={loading}
            >
               {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <><ShieldCheck className="h-5 w-5 group-hover:text-accent transition-colors" /> Transfer to Stripe Secure</>}
            </Button>
            <p className="text-[9px] text-stone-400 font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3">
               <Lock className="h-3 w-3" /> 256-Bit Encrypted Secure Channel
            </p>
         </div>

         <div className="pt-6">
            <Button variant="ghost" className="rounded-none text-stone-400 hover:text-black font-black uppercase tracking-widest text-[10px] border-b border-transparent hover:border-stone-200" onClick={() => router.push('/cart')}>
               Return to Review
            </Button>
         </div>
      </div>
    </div>
  );
}
