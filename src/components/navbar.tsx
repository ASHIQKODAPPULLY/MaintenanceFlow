import Link from "next/link";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Button } from "./ui/button";
import { User, UserCircle, Menu, X } from "lucide-react";
import UserProfile from "./user-profile";
import ThemeSwitcher from "./theme-switcher";

export default async function Navbar() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="w-full py-3 fixed top-0 z-50 transition-all duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link
          href="/"
          prefetch
          className="text-lg sm:text-xl font-bold text-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <span className="hidden sm:inline">MaintenanceHub</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          <nav className="flex gap-6">
            <Link
              href="/#features"
              className="text-sm font-medium text-white dark:text-white hover:text-primary transition-colors duration-200"
            >
              Features
            </Link>
            <Link
              href="/#pricing"
              className="text-sm font-medium text-white dark:text-white hover:text-primary transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium text-white dark:text-white hover:text-primary transition-colors duration-200"
            >
              About
            </Link>
          </nav>

          <div className="flex gap-3 items-center">
            <ThemeSwitcher />
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0 px-4 py-2 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                    Dashboard
                  </Button>
                </Link>
                <UserProfile />
              </>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    className="text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-4 py-2 text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden gap-2 items-center">
          <ThemeSwitcher />
          {user ? (
            <>
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-0 px-3 py-1.5 text-xs font-medium"
                >
                  Dashboard
                </Button>
              </Link>
              <UserProfile />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="hidden xs:block">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-medium px-3 py-1.5"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-3 py-1.5 text-xs font-medium"
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
