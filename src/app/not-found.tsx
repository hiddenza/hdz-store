import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 text-center">
      <div className="space-y-6">
        <h1 className="text-9xl font-black italic tracking-tighter text-stone-100">404</h1>
        <div className="space-y-2">
          <h2 className="text-3xl font-black italic tracking-tighter">Lost in the vault.</h2>
          <p className="text-stone-400 max-w-xs mx-auto">The page you are looking for does not exist or has been moved.</p>
        </div>
        <Link 
          href="/" 
          className="inline-flex items-center justify-center rounded-full h-16 px-10 font-black text-lg bg-black text-white hover:bg-black/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-black/10"
        >
          Return Base
        </Link>
      </div>
    </div>
  );
}
