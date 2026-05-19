'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Minus, 
  Plus, 
  ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PRODUCTS } from '@/constants';
import { useCart } from '@/hooks/useCart';
import { ProductCard } from '@/components/product/ProductCard';

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToCart } = useCart();
  const product = PRODUCTS.find((p) => p.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>({});

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-3xl font-light luxury-serif uppercase tracking-widest">Product not found</h1>
        <Link href="/products">
          <Button className="btn-luxury mt-4">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const relatedProducts = PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container mx-auto px-4 md:px-10 pb-40">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-16 mt-32 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <Link href="/" className="hover:text-black transition-colors">Home</Link>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <Link href="/products" className="hover:text-black transition-colors">Products</Link>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <Link href={`/products?category=${product.category}`} className="hover:text-black transition-colors">{product.category}</Link>
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <span className="text-black">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
        {/* Gallery */}
        <div className="space-y-8">
          <motion.div 
            className="aspect-[4/5] overflow-hidden bg-stone-50 border border-stone-100 relative group"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                src={product.images[selectedImage]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
          </motion.div>
          
          <div className="grid grid-cols-5 gap-4">
            {product.images.map((img, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`aspect-[4/5] overflow-hidden border-2 transition-all duration-500 ${selectedImage === idx ? 'border-black opacity-100' : 'border-transparent opacity-40 hover:opacity-100'}`}
              >
                <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-12">
          <div className="space-y-6">
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-accent font-bold text-[10px] uppercase tracking-[0.3em]">Curated Item</span>
                  {product.isNew && <span className="badge-luxury">New In</span>}
                  {product.isTrending && <span className="badge-premium">Premium</span>}
                </div>
                <h1 className="text-4xl md:text-5xl font-light text-black luxury-serif tracking-tight leading-[1.1] uppercase">{product.name}</h1>
             </div>

             <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                   <div className="flex gap-1">
                     {[...Array(5)].map((_, i) => (
                       <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-stone-200'}`} />
                     ))}
                   </div>
                   <span className="text-[11px] font-bold text-slate-400 mt-0.5">{product.rating} Global Score</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                   <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Available Globally</span>
                </div>
             </div>

             <div className="flex items-baseline gap-4">
                <span className="text-4xl font-black tracking-tighter text-black">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-slate-300 line-through font-light">${product.originalPrice.toFixed(2)}</span>
                )}
             </div>
          </div>

          <p className="text-slate-500 text-sm leading-relaxed max-w-md font-medium">
            {product.description} Sourced directly from international artisans and verified manufacturers.
          </p>

          <div className="space-y-10">
            {/* Variants */}
            {product.variants && product.variants.map((variant) => (
              <div key={variant.name} className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block border-l-2 border-accent pl-3">
                   {variant.name}: <span className="text-black ml-1">{selectedVariant[variant.name] || 'Select Option'}</span>
                 </label>
                 <div className="flex flex-wrap gap-3">
                   {variant.options.map((opt) => (
                     <button 
                      key={opt}
                      onClick={() => setSelectedVariant({ ...selectedVariant, [variant.name]: opt })}
                      className={`px-8 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border ${selectedVariant[variant.name] === opt ? 'bg-black text-white border-black' : 'bg-transparent border-stone-200 hover:border-black text-slate-500'}`}
                     >
                       {opt}
                     </button>
                   ))}
                 </div>
              </div>
            ))}

            {/* Quantity & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
               <div className="flex items-center border border-stone-200 h-14">
                  <button 
                    className="w-14 h-full flex items-center justify-center hover:bg-stone-50 transition-colors"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input 
                    type="number" 
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-12 text-center font-bold text-sm bg-transparent border-none outline-none focus:ring-0"
                  />
                  <button 
                    className="w-14 h-full flex items-center justify-center hover:bg-stone-50 transition-colors"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
               </div>
               
               <Button 
                className="btn-luxury h-14 flex-grow px-12 text-base font-black tracking-[0.1em]"
                onClick={() => addToCart(product, quantity, selectedVariant)}
               >
                  Place In Collection / ${ (product.price * quantity).toFixed(2) }
               </Button>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 pt-12 border-t border-stone-100">
             <div className="flex items-start gap-4">
                <Truck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                   <p className="text-[11px] font-bold uppercase tracking-widest text-black">Express Logistics</p>
                   <p className="text-[11px] text-slate-500 leading-tight">Global shipping within 7-12 days via premium couriers.</p>
                </div>
             </div>
             <div className="flex items-start gap-4">
                <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                   <p className="text-[11px] font-bold uppercase tracking-widest text-black">Quality Assurance</p>
                   <p className="text-[11px] text-slate-500 leading-tight">2-year worldwide warranty on all electronic essentials.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-40">
         <Tabs defaultValue="description" className="w-full">
            <div className="border-b border-stone-100">
              <TabsList className="bg-transparent w-full justify-start gap-16 h-14 rounded-none p-0 overflow-x-auto scrollbar-hide">
                <TabsTrigger value="description" className="data-[state=active]:border-black border-b-2 border-transparent px-0 rounded-none h-full bg-transparent font-black tracking-[0.2em] text-[10px] uppercase text-stone-400 data-[state=active]:text-black">Product Story</TabsTrigger>
                <TabsTrigger value="details" className="data-[state=active]:border-black border-b-2 border-transparent px-0 rounded-none h-full bg-transparent font-black tracking-[0.2em] text-[10px] uppercase text-stone-400 data-[state=active]:text-black">Architecture</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:border-black border-b-2 border-transparent px-0 rounded-none h-full bg-transparent font-black tracking-[0.2em] text-[10px] uppercase text-stone-400 data-[state=active]:text-black">Worldwide Feedback</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="description" className="py-20 space-y-10 max-w-4xl">
               <div className="space-y-6">
                  <h3 className="text-3xl font-light luxury-serif uppercase tracking-tight text-black">Architectural Excellence.</h3>
                  <p className="text-slate-600 leading-offset text-lg font-medium">
                    {product.description} HDZ-Store brings you international high-quality products directly from verified manufacturers. Every item undergoes a strict 5-point quality check to ensure it meets our premium standards before reaching your doorstep.
                  </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <div className="w-12 h-1 text-accent" />
                     <h4 className="text-xs font-black uppercase tracking-widest text-black">Global Sourcing</h4>
                     <p className="text-sm text-slate-500 leading-relaxed font-medium">Selected for its exceptional durability and aesthetic alignment with modern minimalist living.</p>
                  </div>
                  <div className="space-y-4">
                     <div className="w-12 h-1 text-accent" />
                     <h4 className="text-xs font-black uppercase tracking-widest text-black">Curated Quality</h4>
                     <p className="text-sm text-slate-500 leading-relaxed font-medium">Handled with extreme care through our climate-controlled global fulfillment network.</p>
                  </div>
               </div>
            </TabsContent>
            
            <TabsContent value="details" className="py-20">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-8 max-w-5xl">
                  {['Material', 'Authenticity', 'Compatibility', 'Weight', 'Dimensions', 'Warranty'].map((spec) => (
                    <div key={spec} className="flex justify-between border-b border-stone-100 pb-4">
                       <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{spec}</span>
                       <span className="text-[11px] font-black uppercase tracking-widest text-black">Refined Standard</span>
                    </div>
                  ))}
               </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="py-20">
               <div className="bg-stone-50 border border-stone-100 p-20 text-center space-y-10">
                  <div className="space-y-6">
                     <div className="flex justify-center gap-1.5">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 text-accent fill-accent" />)}
                     </div>
                     <h3 className="text-2xl font-light luxury-serif uppercase text-black tracking-widest">Global Concierge Rating</h3>
                     <p className="text-slate-500 text-sm font-medium tracking-wide max-w-sm mx-auto">
                        98.4% of our global clientele recommends this specific curation for its uncompromising quality.
                     </p>
                  </div>
                  <Button variant="outline" className="border-black text-black px-12 h-12 rounded-none font-bold uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-all">Request Full Report</Button>
               </div>
            </TabsContent>
         </Tabs>
      </div>

      {/* Related Products */}
      <div className="mt-40 space-y-16">
         <div className="flex flex-col md:flex-row justify-between items-baseline gap-6 border-b border-stone-100 pb-10">
            <div className="space-y-2">
               <span className="text-accent text-[10px] font-bold uppercase tracking-[0.4em]">Extended Selection</span>
               <h2 className="text-3xl font-light luxury-serif uppercase text-black">Aesthetic Pairings.</h2>
            </div>
            <Link href="/products" className="text-[11px] font-black uppercase tracking-[0.2em] border-b-2 border-black pb-1 hover:text-accent hover:border-accent transition-all">View All Curations</Link>
         </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
         </div>
      </div>
    </div>
  );
}
