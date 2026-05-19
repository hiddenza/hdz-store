'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Package, 
  Heart, 
  Settings, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isAdmin = user?.email === 'musaab.asa@gmail.com';

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (!u) {
        router.push('/auth');
      } else {
        setUser(u);
      }
    }).catch((err) => {
      console.error('Error fetching user:', err);
      router.push('/auth');
    });
  }, [router]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    toast.info('Logged out from HDZ-Store');
    router.push('/');
  };

  const navItems = [
    { label: 'Overview', icon: TrendingUp, href: '/dashboard' },
    { label: 'My Orders', icon: Package, href: '/dashboard/orders' },
    { label: 'Wishlist', icon: Heart, href: '/dashboard/wishlist' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ];

  if (isAdmin) {
    navItems.unshift({ label: 'Admin Center', icon: ShieldAlert, href: '/admin' });
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 pb-40 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-16 mt-10">
        <aside className="lg:w-80 space-y-12">
          <div className="flex items-center gap-4 p-2">
            <Avatar className="h-16 w-16 border-2 border-stone-100 p-1">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.email || 'User avatar'} />
              <AvatarFallback>{user.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
               <h3 className="font-black italic tracking-tighter text-xl">Hello, {user.user_metadata?.full_name?.split(' ')[0] || 'User'}.</h3>
               <p className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-3xl transition-all font-bold text-sm ${pathname === item.href ? 'bg-black text-white shadow-xl shadow-black/10 scale-105' : 'text-stone-500 hover:bg-stone-50'}`}
              >
                <div className="flex items-center gap-4">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </div>
                {pathname === item.href && <ChevronRight className="h-4 w-4" />}
              </Link>
            ))}
            <Separator className="my-6 bg-stone-100" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-4 w-full p-4 rounded-3xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </nav>
        </aside>

        <main className="flex-grow space-y-12">
          {children}
        </main>
      </div>
    </div>
  );
}
