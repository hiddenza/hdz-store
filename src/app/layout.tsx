import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import '@/index.css';
import Navbar from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/hooks/useCart';
import GlobalAuthDetector from '@/components/common/GlobalAuthDetector';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'HDZ Store | Premium International E-commerce',
  description: 'Luxury dropshipping experience powered by Next.js, Stripe, and Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body className="flex flex-col min-h-screen bg-white font-sans antialiased">
        <CartProvider>
          <GlobalAuthDetector />
          <Navbar />
          <main className="flex-grow pt-24">
            {children}
          </main>
          <Footer />
          <Toaster position="top-center" />
        </CartProvider>
      </body>
    </html>
  );
}
