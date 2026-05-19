'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/useCart';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, itemsCount } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-32 flex flex-col items-center justify-center text-center space-y-12">
        <div className="w-24 h-24 bg-stone-50 border border-stone-100 flex items-center justify-center">
           <ShoppingBag className="h-10 w-10 text-stone-200" />
        </div>
        <div className="space-y-6">
           <h1 className="text-4xl md:text-5xl font-light luxury-serif uppercase tracking-tight">Your Collection is Empty.</h1>
           <p className="text-stone-500 max-w-sm mb-6 font-medium text-sm">Every refined space begins with a single object. Discover our curated essentials.</p>
           <Link href="/products">
              <Button className="btn-luxury h-16 px-12">
                Begin Exploring <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
           </Link>
        </div>
      </div>
    );
  }

  const shipping = totalPrice > 1000 ? 0 : 45; // Luxury shipping logic
  const tax = totalPrice * 0.08;
  const grandTotal = totalPrice + shipping + tax;

  return (
    <div className="container mx-auto px-4 md:px-8 pb-40">
      <div className="flex flex-col gap-20">
        {/* Header */}
        <div className="space-y-4 border-l-4 border-accent pl-8 mt-12">
           <span className="text-accent text-xs font-black uppercase tracking-[0.3em]">Curation Review</span>
           <h1 className="text-5xl md:text-6xl font-light luxury-serif tracking-tight uppercase">Your Selection.</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-24">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-12">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col sm:flex-row gap-10 pb-12 border-b border-stone-100 last:border-0"
                >
                  <div className="w-full sm:w-48 aspect-[4/5] bg-stone-50 border border-stone-100 shrink-0 relative overflow-hidden">
                     <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between py-2">
                    <div className="flex justify-between items-start gap-4">
                       <div className="space-y-2">
                          <p className="text-[10px] uppercase tracking-[0.2em] font-black text-accent">{item.category}</p>
                          <Link href={`/products/${item.id}`} className="hover:text-accent transition-colors">
                            <h3 className="text-2xl font-light luxury-serif uppercase tracking-tight text-black">{item.name}</h3>
                          </Link>
                          
                          {item.selectedVariant && (
                            <div className="flex flex-wrap gap-4 pt-2">
                              {Object.entries(item.selectedVariant).map(([key, val]) => (
                                <span key={key} className="text-[10px] font-bold text-stone-400 uppercase tracking-widest border border-stone-100 px-3 py-1">
                                  {key}: <span className="text-stone-700">{val as string}</span>
                                </span>
                              ))}
                            </div>
                          )}
                       </div>
                       <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-none text-stone-300 hover:text-black hover:bg-stone-50 shrink-0"
                        onClick={() => removeFromCart(item.id)}
                       >
                          <Trash2 className="h-4 w-4" />
                       </Button>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-6 pt-10">
                       <div className="flex items-center border border-stone-200">
                          <button 
                            className="h-10 w-10 flex items-center justify-center hover:bg-stone-50 transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                             <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-12 text-center font-bold text-[13px]">{item.quantity}</span>
                          <button 
                            className="h-10 w-10 flex items-center justify-center hover:bg-stone-50 transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                             <Plus className="h-3 w-3" />
                          </button>
                       </div>
                       
                       <div className="flex flex-col items-end">
                          <span className="text-[10px] font-black tracking-widest text-stone-400 uppercase mb-1">Total Valuation</span>
                          <span className="text-2xl font-black text-black tracking-tighter">${(item.price * item.quantity).toFixed(2)}</span>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
             <div className="bg-stone-100 border border-stone-200 p-12 space-y-10 sticky top-32">
                <h3 className="text-xl font-light luxury-serif uppercase tracking-widest border-b border-stone-200 pb-6">Summary.</h3>
                
                <div className="space-y-6">
                   <div className="flex justify-between items-center">
                      <span className="text-stone-400 font-bold tracking-widest uppercase text-[10px]">Curation Count</span>
                      <span className="font-bold text-stone-700 text-sm">{itemsCount} Items</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-stone-400 font-bold tracking-widest uppercase text-[10px]">Est. Global Logistics</span>
                      <span className="font-bold text-stone-700 text-sm">{shipping === 0 ? 'COMPLIMENTARY' : `$${shipping.toFixed(2)}`}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-stone-400 font-bold tracking-widest uppercase text-[10px]">Currency Exchange Tax</span>
                      <span className="font-bold text-stone-700 text-sm border-b border-stone-200">${tax.toFixed(2)}</span>
                   </div>
                   
                   <div className="flex justify-between items-baseline pt-6">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em]">Final Total</span>
                      <span className="text-4xl font-black tracking-tighter text-black">${grandTotal.toFixed(2)}</span>
                   </div>
                </div>

                <div className="space-y-4 pt-6">
                   <Button 
                    className="btn-luxury w-full h-16 text-[12px]"
                    onClick={() => router.push('/checkout')}
                   >
                     Complete Acquisition
                   </Button>
                   <Link href="/products" className="block text-center text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-black transition-colors pt-4">
                     Refine Selection
                   </Link>
                </div>

                {/* Trust and Help */}
                <div className="space-y-4 pt-8">
                   <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-stone-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Secured with 256-bit SSL Encryption</p>
                   </div>
                   <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-stone-400" />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Premium International Shipping Included</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
