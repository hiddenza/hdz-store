'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Trash2, 
  Loader2, 
  Shield, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    }).catch((err) => {
      console.warn('Settings page: failed to get user details.', err);
    });
  }, []);

  const handleDeleteAccount = async () => {
    if (!supabase || !user) return;
    
    if (confirmEmail.trim().toLowerCase() !== user.email?.toLowerCase()) {
      toast.error('Email confirmation does not match your active account email.');
      return;
    }

    try {
      setDeleting(true);
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        toast.error('Authentication session was lost. Please sign in again.');
        setDeleting(false);
        return;
      }

      console.log('[Settings Delete] Triggering deletion request...');
      const response = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const resJSON = await response.json();

      if (response.ok && resJSON.success) {
        toast.success('Your HDZ-Store account was deleted successfully.');
        
        // Clear local supabase session
        await supabase.auth.signOut();
        
        // Redirect to homepage
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      } else {
        console.error('[Settings Delete] Deletion failed:', resJSON);
        toast.error(resJSON.details || resJSON.error || 'Failed to delete your account. Please contact support.');
        setDeleting(false);
      }
    } catch (err: any) {
      console.error('[Settings Delete] Exception:', err);
      toast.error(err.message || 'An unexpected error occurred during account deletion.');
      setDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  const creationDate = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown Date';

  const userFullName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || 
                       'Valued Customer';

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500 max-w-4xl">
      <div className="space-y-2">
         <h1 className="text-4xl font-black italic tracking-tighter">Account Settings.</h1>
         <p className="text-stone-400 font-bold text-sm">Manage your premium profile credentials and platform options.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Card */}
        <Card className="rounded-[40px] border-stone-200/60 shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-stone-600" />
                </div>
                <CardTitle className="text-base font-black uppercase tracking-widest text-stone-800">Profile Specifications</CardTitle>
             </div>
             <CardDescription className="text-stone-400 font-bold text-xs pl-11">Verify your currently active credentials.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-11">
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Full Name</p>
                   <p className="text-sm font-bold text-stone-900">{userFullName}</p>
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Email Address</p>
                   <p className="text-sm font-bold text-stone-900">{user.email}</p>
                </div>
                <div className="space-y-1.5 col-span-2">
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Secure User Identifier</p>
                   <p className="text-xs font-mono bg-stone-50 p-2.5 rounded-2xl text-stone-500 border border-stone-100">{user.id}</p>
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Account Role</p>
                   <p className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                     <Shield className="h-4 w-4 text-accent fill-accent/10" />
                     {user.email === 'musaab.asa@gmail.com' ? 'Administrator' : 'Verified Customer'}
                   </p>
                </div>
                <div className="space-y-1.5">
                   <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Joined On</p>
                   <p className="text-sm font-bold text-stone-900">{creationDate}</p>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="rounded-[40px] border-red-100 bg-red-50/10 shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-4">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-100/60 flex items-center justify-center">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </div>
                <CardTitle className="text-base font-black uppercase tracking-widest text-red-800">Critical Access (Danger Zone)</CardTitle>
             </div>
             <CardDescription className="text-red-400/80 font-bold text-xs pl-11">Irreversible administrative actions regarding your profile.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4 pl-19 space-y-6">
             <div className="max-w-2xl pl-11 space-y-6">
                <p className="text-xs text-stone-500 font-bold leading-relaxed">
                   Deleting your account is permanent. Doing so will immediately and irrevocably destroy all user profiles, order histories, and verified credentials across our databases. This action cannot be undone.
                </p>

                {user.email === 'musaab.asa@gmail.com' ? (
                  <div className="bg-red-50 border border-red-100 p-4 rounded-3xl text-xs text-red-700 font-bold">
                    Notice: The master administrator account cannot be deleted from the client console.
                  </div>
                ) : !showConfirm ? (
                  <Button 
                    variant="destructive"
                    onClick={() => setShowConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full px-8 py-4 font-black text-xs uppercase tracking-widest transition-all h-auto"
                  >
                    Delete Account
                  </Button>
                ) : (
                  <div className="p-6 bg-red-50/50 border border-red-100 rounded-[32px] space-y-4">
                     <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                           <h4 className="text-xs font-black uppercase text-red-800 tracking-wider">Are you absolutely sure?</h4>
                           <p className="text-[11px] text-red-700 font-bold">Please type your current email address <span className="font-mono bg-white/80 px-1.5 py-0.5 rounded border border-red-100">{user.email}</span> to authorize deletion.</p>
                        </div>
                     </div>
                     
                     <div className="space-y-3">
                        <Input 
                          type="email"
                          placeholder={user.email}
                          value={confirmEmail}
                          onChange={(e) => setConfirmEmail(e.target.value)}
                          className="bg-white rounded-2xl border-stone-200 font-medium text-xs py-5 max-w-md h-auto focus-visible:ring-red-200"
                        />
                        
                        <div className="flex gap-2">
                           <Button 
                             onClick={handleDeleteAccount}
                             disabled={deleting}
                             className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6 py-3 font-black text-xs uppercase tracking-widest h-auto"
                           >
                             {deleting ? (
                               <>
                                 <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                 Deleting...
                               </>
                             ) : (
                               'Confirm Permanent Deletion'
                             )}
                           </Button>
                           <Button 
                             variant="outline"
                             onClick={() => {
                               setShowConfirm(false);
                               setConfirmEmail('');
                             }}
                             className="rounded-full px-6 py-3 font-black text-xs uppercase tracking-widest border-stone-200 hover:bg-stone-50 h-auto"
                           >
                             Cancel
                           </Button>
                        </div>
                     </div>
                  </div>
                )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
