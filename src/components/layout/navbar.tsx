'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Pizza,
  Menu as MenuIcon,
  User as UserIcon,
  LogOut,
  Sparkles,
  ShoppingBag,
  Store,
  ShieldCheck,
  PlusCircle,
  CreditCard,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Browse Menu', href: '/menu' },
  ];

  const getDashboardHref = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'vendor') return '/dashboard/vendor';
    return '/dashboard/customer';
  };

  const getDashboardLabel = () => {
    if (!user) return '';
    if (user.role === 'admin') return 'Admin Center';
    if (user.role === 'vendor') return 'Vendor Dashboard';
    return 'My Orders';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pizza-red text-white shadow-md shadow-pizza-red/20">
            <Pizza className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            Pizza<span className="text-pizza-red">Hub</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors hover:text-pizza-red ${
                pathname === link.href ? 'text-pizza-red font-semibold' : 'text-muted-foreground'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link
              href={getDashboardHref()}
              className={`transition-colors hover:text-pizza-red ${
                pathname.startsWith('/dashboard')
                  ? 'text-pizza-red font-semibold'
                  : 'text-muted-foreground'
              }`}
            >
              {getDashboardLabel()}
            </Link>
          )}
        </nav>

        {/* Right Action Section (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Premium Badge for vendors */}
              {user.role === 'vendor' && user.subscriptionPlan === 'premium' && (
                <Badge variant="premium" className="gap-1 px-2.5 py-1 text-xs">
                  <Sparkles className="h-3 w-3" />
                  Premium
                </Badge>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-border p-1.5 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-pizza-red">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pizza-red/10 text-xs font-bold text-pizza-red">
                      {getInitials(user.name)}
                    </div>
                    <span className="max-w-[120px] truncate text-sm font-medium pr-1">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                      <div className="pt-1">
                        <Badge
                          variant={
                            user.role === 'admin'
                              ? 'destructive'
                              : user.role === 'vendor'
                              ? 'secondary'
                              : 'default'
                          }
                          className="capitalize text-[10px] px-2 py-0.5"
                        >
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => router.push(getDashboardHref())}>
                    {user.role === 'admin' ? (
                      <ShieldCheck className="mr-2 h-4 w-4 text-destructive" />
                    ) : user.role === 'vendor' ? (
                      <Store className="mr-2 h-4 w-4 text-pizza-crust" />
                    ) : (
                      <ShoppingBag className="mr-2 h-4 w-4 text-pizza-red" />
                    )}
                    <span>{getDashboardLabel()}</span>
                  </DropdownMenuItem>

                  {user.role === 'vendor' && (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/dashboard/vendor/menu/new')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Add New Pizza</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/dashboard/vendor/subscription')}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        <span>Subscription Tier</span>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button variant="pizza" size="sm" asChild>
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Navigation Trigger */}
        <div className="flex items-center md:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open mobile menu">
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[85vw] max-w-sm sm:max-w-md">
              <SheetHeader className="border-b pb-4 text-left">
                <SheetTitle className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pizza-red text-white">
                    <Pizza className="h-5 w-5" />
                  </div>
                  <span>PizzaHub</span>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col space-y-4 py-6">
                {isAuthenticated && user && (
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-xs">
                        {user.role}
                      </Badge>
                      {user.role === 'vendor' && user.subscriptionPlan === 'premium' && (
                        <Badge variant="premium" className="text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                        pathname === link.href
                          ? 'bg-pizza-red/10 text-pizza-red font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {isAuthenticated && (
                    <Link
                      href={getDashboardHref()}
                      onClick={() => setMobileOpen(false)}
                      className={`rounded-lg px-3 py-2 text-base font-medium transition-colors ${
                        pathname.startsWith('/dashboard')
                          ? 'bg-pizza-red/10 text-pizza-red font-semibold'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {getDashboardLabel()}
                    </Link>
                  )}
                </div>

                <div className="pt-4 border-t border-border">
                  {isAuthenticated ? (
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setMobileOpen(false)}
                        asChild
                      >
                        <Link href="/sign-in">Sign In</Link>
                      </Button>
                      <Button
                        variant="pizza"
                        className="w-full"
                        onClick={() => setMobileOpen(false)}
                        asChild
                      >
                        <Link href="/sign-up">Sign Up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
