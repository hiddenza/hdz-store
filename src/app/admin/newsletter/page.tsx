'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, Users, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [secret, setSecret] = useState(''); // Simple auth for the demo

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);

    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, message, secret })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: data.message });
        setSubject('');
        setMessage('');
      } else {
        setStatus({ type: 'error', message: data.error || 'Failed to send broadcast' });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An unexpected error occurred' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="pt-40 pb-20 container mx-auto px-4 md:px-8 max-w-6xl">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* Left: Broadcast Form */}
        <div className="flex-1 space-y-12">
          <div className="space-y-4">
            <span className="text-accent text-[10px] font-black uppercase tracking-[0.5em]">Admin Portal</span>
            <h1 className="text-5xl font-light luxury-serif tracking-tight">Newsletter.</h1>
            <p className="text-stone-500 font-medium tracking-tight">
              Broadcast technical updates and marketing artifacts to your global network.
            </p>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-8 bg-stone-50 p-8 border border-stone-100">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Campaign Subject</label>
               <Input 
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Next Gen Hardware Drop..." 
                className="bg-white rounded-none h-14 border-stone-200"
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Auth Secret (Last 10 chars of Service Role)</label>
               <Input 
                type="password"
                required
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                placeholder="********" 
                className="bg-white rounded-none h-14 border-stone-200"
               />
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Message Content</label>
               <Textarea 
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Compose your technical update here..."
                className="bg-white rounded-none min-h-[300px] border-stone-200 resize-none py-6"
               />
            </div>

            <Button 
              disabled={sending}
              className="w-full h-16 bg-black text-white hover:bg-accent rounded-none font-black uppercase tracking-widest text-[11px] flex gap-3"
            >
              {sending ? (
                <> <Loader2 className="h-4 w-4 animate-spin" /> Transmitting...</>
              ) : (
                <> <Send className="h-4 w-4" /> Broadcast Update</>
              )}
            </Button>

            {status && (
              <div className={`p-4 text-center text-[10px] font-black uppercase tracking-widest rounded-none border ${
                status.type === 'success' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
              }`}>
                {status.message}
              </div>
            )}
          </form>
        </div>

        {/* Right: Subscribers List */}
        <div className="lg:w-80 space-y-8">
           <div className="bg-black p-8 text-white">
              <div className="flex items-center gap-4 mb-2">
                 <Users className="h-5 w-5 text-accent" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Network Scale</span>
              </div>
              <div className="text-4xl font-light luxury-serif">{subscribers.length}</div>
              <p className="text-white/40 text-[10px] font-medium tracking-widest uppercase mt-2">Verified Connections</p>
           </div>

           <div className="border border-stone-100 p-6 space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest">Recent Activity</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {loading ? (
                   <div className="flex justify-center py-10 text-stone-300">
                      <Loader2 className="h-6 w-6 animate-spin" />
                   </div>
                ) : subscribers.length > 0 ? (
                  subscribers.map((s, i) => (
                    <div key={i} className="flex flex-col gap-1 pb-4 border-b border-stone-50 last:border-0">
                       <span className="text-xs font-bold text-stone-900 truncate">{s.email}</span>
                       <span className="text-[9px] font-medium text-stone-400 uppercase tracking-tight">
                         {new Date(s.subscribed_at).toLocaleDateString()}
                       </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-stone-400 italic">No subscribers yet.</p>
                )}
              </div>
           </div>

           <div className="bg-amber-50 border border-amber-100 p-6 flex gap-4">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="space-y-1">
                 <h4 className="text-[10px] font-black uppercase text-amber-900 tracking-wider">Privacy Protocol</h4>
                 <p className="text-[10px] leading-relaxed text-amber-800/70 font-medium">Broadcasts are sent using BCC. Subscriber emails are never exposed to each other.</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
