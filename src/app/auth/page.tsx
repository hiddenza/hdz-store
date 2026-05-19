'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Mail, Lock, User, Code, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      toast.error('Authentication service is currently unavailable.');
      return;
    }
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });
        if (error) throw error;
        toast.success('Welcome back to HDZ-Store!');
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: formData.fullName,
            }
          }
        });
        if (error) throw error;
        toast.success('Account created! Please check your email.');
      }
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (!supabase) {
      toast.error('Authentication service is currently unavailable.');
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
           redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'OAuth failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20 min-h-screen flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 max-w-5xl w-full bg-white rounded-[40px] overflow-hidden border border-stone-100 shadow-2xl shadow-black/5"
      >
        {/* Left Side: Branding/Visual */}
        <div className="hidden lg:block relative p-12 bg-black text-white overflow-hidden">
           <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80" className="w-full h-full object-cover opacity-40" alt="Auth Background" />
              <div className="absolute inset-0 bg-gradient-to-br from-black via-black/80 to-transparent" />
           </div>
           
           <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="space-y-4">
                 <h2 className="text-4xl font-black italic tracking-tighter">HDZ-STORE.</h2>
                 <p className="text-white/60 tracking-widest text-[10px] font-bold uppercase">Join the global movement.</p>
              </div>

              <div className="space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-5xl font-black leading-none tracking-tighter italic">Experience <br /> Modern <br /> Commerce.</h3>
                    <p className="text-white/60 text-sm max-w-xs leading-relaxed">Join thousands of premium shoppers worldwide and get exclusive access to international deals.</p>
                 </div>
                 
                 <div className="flex gap-12 pt-8">
                    <div className="space-y-1">
                       <p className="text-2xl font-black italic">500k+</p>
                       <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Active Users</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-2xl font-black italic">120</p>
                       <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Countries</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-12 lg:p-16 flex flex-col justify-center space-y-10">
           <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-4xl font-black italic tracking-tighter">{isLogin ? 'Welcome Back.' : 'Create Account.'}</h1>
              <p className="text-stone-400 text-sm">Enter your credentials to access your global vault.</p>
           </div>

           <div className="flex gap-4">
              <Button 
                variant="outline" 
                type="button"
                className="flex-grow h-14 rounded-full border-stone-100 hover:bg-stone-50 font-bold"
                onClick={() => handleOAuth('google')}
              >
                 <Globe className="mr-2 h-5 w-5" /> Google
              </Button>
              <Button 
                variant="outline" 
                type="button"
                className="flex-grow h-14 rounded-full border-stone-100 hover:bg-stone-50 font-bold"
                onClick={() => handleOAuth('github')}
              >
                 <Code className="mr-2 h-5 w-5" /> GitHub
              </Button>
           </div>

           <div className="relative flex items-center">
              <Separator />
              <span className="absolute left-1/2 -translate-x-1/2 bg-white px-4 text-[10px] font-black uppercase tracking-widest text-stone-300">Or with Email</span>
           </div>

           <form onSubmit={handleAuth} className="space-y-6">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div 
                    key="full-name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-4">Full Name</Label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                       <Input 
                        placeholder="Jane Doe" 
                        className="h-14 pl-12 rounded-full bg-stone-50 border-stone-100 focus:bg-white"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-4">Email Address</Label>
                <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                   <Input 
                    type="email" 
                    placeholder="name@email.com" 
                    className="h-14 pl-12 rounded-full bg-stone-50 border-stone-100 focus:bg-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 pl-4">Password</Label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                   <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="h-14 pl-12 rounded-full bg-stone-50 border-stone-100 focus:bg-white"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-16 bg-black text-white hover:bg-black/90 rounded-full font-black text-lg tracking-tight active:scale-95 transition-all shadow-xl shadow-black/10"
                disabled={loading}
              >
                 {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
           </form>

           <div className="text-center pt-4">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)} 
                className="text-xs font-bold text-stone-400 hover:text-black transition-colors underline underline-offset-4"
              >
                 {isLogin ? "Don't have an account? Start here." : "Already a member? Sign in."}
              </button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

