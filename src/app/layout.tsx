import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/auth-context';
import { FavoritesProvider } from '@/context/favorites-context';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'PizzaHub — Artisanal Multi-Vendor Pizza Marketplace',
  description:
    'Discover, customize, and order authentic wood-fired pizzas from top local artisanal pizzerias and independent chefs.',
  keywords: ['pizza', 'marketplace', 'food delivery', 'artisanal pizza', 'pizzahub'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-pizza-red selection:text-white">
        <AuthProvider>
          <FavoritesProvider>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </FavoritesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
