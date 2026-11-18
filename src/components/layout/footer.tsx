import React from 'react';
import Link from 'next/link';
import { Pizza, Heart, ShieldCheck, Mail, MapPin, Phone } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-muted/20 text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-4 lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pizza-red text-white shadow-md shadow-pizza-red/20">
                <Pizza className="h-6 w-6" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                Pizza<span className="text-pizza-red">Hub</span>
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              The premier artisanal multi-vendor marketplace connecting passionate pizza lovers
              with independent wood-fired pizzerias and master pizzaiolos worldwide.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              <span className="text-xs text-muted-foreground font-medium">Switch Theme</span>
            </div>

            {/* Social Icons including Modern X */}
            <div className="flex items-center gap-3 pt-2">
              {/* Modern X (formerly Twitter) Icon */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:border-pizza-red hover:text-pizza-red transition-colors"
                aria-label="Follow us on X"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:border-pizza-red hover:text-pizza-red transition-colors"
                aria-label="Follow us on Instagram"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:border-pizza-red hover:text-pizza-red transition-colors"
                aria-label="Follow us on Facebook"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.594 0 9 1.583 9 4.615V8z" />
                </svg>
              </a>

              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground hover:border-pizza-red hover:text-pizza-red transition-colors"
                aria-label="View source code on GitHub"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links: Explore */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Explore Menu
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/menu" className="hover:text-pizza-red transition-colors">
                  All Artisanal Pizzas
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Classic+Pizzas" className="hover:text-pizza-red transition-colors">
                  Classic Pizzas
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Vegetarian+Pizzas" className="hover:text-pizza-red transition-colors">
                  Vegetarian & Vegan
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Meat+Lovers" className="hover:text-pizza-red transition-colors">
                  Meat Lovers
                </Link>
              </li>
              <li>
                <Link href="/menu?category=Specialty+%2F+Gourmet+Pizzas" className="hover:text-pizza-red transition-colors">
                  Specialty & Gourmet
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: For Vendors */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              For Vendors
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sign-up" className="hover:text-pizza-red transition-colors">
                  Join as Pizzeria Vendor
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vendor" className="hover:text-pizza-red transition-colors">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/vendor/subscription" className="hover:text-pizza-red transition-colors">
                  Premium Tier ($99/yr)
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-pizza-red transition-colors">
                  Community Standards
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">
              Contact & Support
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-pizza-red mt-0.5 shrink-0" />
                <span>742 Evergreen Terrace, Little Italy, NY 10013</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-pizza-red shrink-0" />
                <span>+1 (800) 555-PIZZA</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-pizza-red shrink-0" />
                <span>support@pizzahub.com</span>
              </li>
              <li className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground font-medium">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>Stripe 256-bit Encrypted Checkout</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row text-xs text-muted-foreground">
          <p>© {currentYear} PizzaHub, Inc. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Handcrafted with</span>
            <Heart className="h-3.5 w-3.5 text-pizza-red fill-pizza-red" />
            <span>for artisanal pizza lovers worldwide.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
