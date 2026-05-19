'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function DashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const isAdmin = user?.email === 'musaab.asa@gmail.com';

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
       {isAdmin && (
         <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-1000" />
            <div className="relative z-10 space-y-6">
               <div className="space-y-2">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Owner Access Verified</span>
                  </div>
                  <h2 className="text-4xl font-black italic tracking-tighter">Welcome back, Chief.</h2>
                  <p className="text-stone-400 font-bold text-sm max-w-md">Your store is currently live and processing global requests. Access the command center to manage inventory and view revenue.</p>
               </div>
               <div className="flex gap-4">
                  <a href="/admin" className="bg-white text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-stone-100 transition-all text-center">Open Command Center</a>
                  <a href="/admin?tab=dropshipping" className="border border-white/20 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all text-center">Sync Suppliers</a>
               </div>
            </div>
         </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="rounded-[40px] border-stone-100 shadow-sm bg-stone-50/50">
             <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-stone-400">{isAdmin ? 'Personal Spend' : 'Total Spent'}</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-4xl font-black italic tracking-tighter">{isAdmin ? '$0.00' : '$1,240.50'}</p>
                {!isAdmin && (
                  <p className="text-[10px] text-green-500 font-bold mt-2 flex items-center gap-1">
                     <TrendingUp className="h-3 w-3" /> +12% from last month
                  </p>
                )}
             </CardContent>
          </Card>
          <Card className="rounded-[40px] border-stone-100 shadow-sm">
             <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-stone-400">Pending Orders</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-4xl font-black italic tracking-tighter">{isAdmin ? '00' : '02'}</p>
                {!isAdmin && (
                  <p className="text-[10px] text-stone-400 font-bold mt-2 flex items-center gap-1">
                     <Clock className="h-3 w-3" /> Estimated delivery in 3 days
                  </p>
                )}
             </CardContent>
          </Card>
          <Card className="rounded-[40px] border-stone-100 shadow-sm">
             <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-stone-400">Reward Points</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-4xl font-black italic tracking-tighter">{isAdmin ? 'MAX' : '450'}</p>
                <p className="text-[10px] text-black font-bold mt-2 flex items-center gap-1">
                   {isAdmin ? 'Store Owner Status' : 'Gold Member Tier'}
                </p>
             </CardContent>
          </Card>
       </div>

       {!isAdmin && (
         <div className="space-y-6">
            <h2 className="text-2xl font-black italic tracking-tighter">My Recent Orders.</h2>
            <div className="space-y-4">
               {[1, 2].map(id => (
                 <div key={id} className="flex flex-col sm:flex-row items-center justify-between p-6 bg-white border border-stone-100 rounded-[32px] gap-6 hover:shadow-lg hover:shadow-black/5 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center shrink-0">
                          <Package className="h-8 w-8 text-stone-200" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-bold">Order #H-ZA92{id}X</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Placed Jan 12, 2026</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black">$299.00</p>
                       <div className="flex items-center gap-2 text-stone-400">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Delivered</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
       )}
    </div>
  );
}
