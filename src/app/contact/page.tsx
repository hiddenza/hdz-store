'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Globe, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const response = await fetch("https://formspree.io/f/mkoegboy", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        setStatus('success');
        form.reset();
        setTimeout(() => setStatus('idle'), 5000);
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 5000);
      }
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };
  return (
    <div className="pt-40 pb-32 container mx-auto px-4 md:px-8">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-light luxury-serif tracking-tighter leading-none uppercase">
                Get in <br />
                <span className="italic-serif text-accent lowercase">Touch.</span>
              </h1>
              <p className="text-stone-500 text-lg leading-relaxed max-w-md font-medium tracking-tight">
                Whether you have a question about our curation or need assistance with an order, our global team is here to help.
              </p>
            </div>

              <div className="space-y-8">
              <div className="flex items-start gap-6">
                 <div className="h-12 w-12 bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-stone-900" />
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-1">Email Us</h3>
                    <p className="text-stone-500 font-medium tracking-tight">musaab.asa@gmail.com</p>
                 </div>
              </div>
              
              <div className="flex items-start gap-6">
                 <div className="h-12 w-12 bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-stone-900" />
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-1">Service Area</h3>
                    <p className="text-stone-500 font-medium tracking-tight">Global Online Dropshipper</p>
                 </div>
              </div>

              <div className="flex items-start gap-6">
                 <div className="h-12 w-12 bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-stone-900" />
                 </div>
                 <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest mb-1">Presence</h3>
                    <p className="text-stone-500 font-medium tracking-tight leading-relaxed">
                      Cloud-First Enterprise<br />
                      Decentralized Operations
                    </p>
                 </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-stone-50 p-8 md:p-12 border border-stone-100 relative overflow-hidden"
          >
            <AnimatePresence>
              {status === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm text-center p-8 space-y-6"
                >
                  <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-light luxury-serif">Message Sent Successfully</h3>
                    <p className="text-stone-500 font-medium tracking-tight">Our concierge team will review your inquiry and respond shortly.</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setStatus('idle')}
                    className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-black"
                  >
                    Send Another Message
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-8" onSubmit={handleSubmit}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Full Name</label>
                     <Input name="name" required placeholder="John Doe" className="bg-white border-stone-200 h-14 rounded-none px-4 text-sm font-medium tracking-tight focus-visible:ring-accent" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Email Address</label>
                     <Input name="email" required type="email" placeholder="john@example.com" className="bg-white border-stone-200 h-14 rounded-none px-4 text-sm font-medium tracking-tight focus-visible:ring-accent" />
                  </div>
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Subject</label>
                  <Input name="_subject" placeholder="Order Inquiry" className="bg-white border-stone-200 h-14 rounded-none px-4 text-sm font-medium tracking-tight focus-visible:ring-accent" />
               </div>
               
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-1">Message</label>
                  <Textarea name="message" required placeholder="Tell us how we can help..." className="bg-white border-stone-200 min-h-[200px] rounded-none px-4 py-4 text-sm font-medium tracking-tight focus-visible:ring-accent resize-none" />
               </div>

               <Button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full h-16 bg-black text-white hover:bg-accent disabled:bg-stone-200 transition-all font-black uppercase tracking-[0.3em] text-[11px] rounded-none flex items-center justify-center gap-3"
               >
                  {status === 'loading' ? 'Encrypting & Sending...' : 'Send Message'} 
                  <Send className="h-4 w-4" />
               </Button>
               
               {status === 'error' && (
                 <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest">
                   Failed to send. Please try again or email directly.
                 </p>
               )}
            </form>
          </motion.div>
       </div>
    </div>
  );
}
