import type { Metadata } from 'next';
import './globals.css';
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from '@/context/cart-context';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Playfair_Display, Raleway } from 'next/font/google';

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-headline',
});

const raleway = Raleway({
  subsets: ['latin'],
  variable: '--font-body',
});


export const metadata: Metadata = {
  title: 'MrShopiy',
  description: 'The best accessories for your mobile devices.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-body antialiased", playfairDisplay.variable, raleway.variable)}>
        <FirebaseClientProvider>
          <CartProvider>
            <div className="relative flex min-h-dvh flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
