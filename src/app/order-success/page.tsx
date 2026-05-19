'use client';

import { useEffect, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Package, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

import { Suspense } from 'react';

function OrderSuccessContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center space-y-10">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 10 }}
        className="w-32 h-32 bg-green-50 rounded-full flex items-center justify-center"
      >
         <CheckCircle2 className="h-16 w-16 text-green-500" />
      </motion.div>

      <div className="space-y-4 max-w-2xl">
         <h1 className="text-5xl font-black italic tracking-tighter">Your Order is Confirmed!</h1>
         <p className="text-stone-500 text-lg">Thank you for shopping with HDZ-Store. Your payment was successful and your international shipment is being processed.</p>
         <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Order Ref: {sessionId?.slice(-10) || 'HDZ-GLOBAL-99'}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6">
         <Link href="/dashboard/orders">
            <Button className="h-14 px-10 bg-black text-white hover:bg-black/90 rounded-full font-black text-lg shadow-xl shadow-black/10">
              Track My Order <Package className="ml-2 h-5 w-5" />
            </Button>
         </Link>
         <Button variant="outline" className="h-14 px-10 rounded-full border-2 border-stone-100 hover:border-black font-bold">
            Download Invoice <Download className="ml-2 h-5 w-5" />
         </Button>
      </div>

      <div className="pt-10">
         <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-black transition-colors underline underline-offset-8">
            Continue Your Journey
         </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
