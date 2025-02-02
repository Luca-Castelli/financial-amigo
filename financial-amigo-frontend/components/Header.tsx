"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { clearAuth } from "@/lib/auth-client";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Accounts", href: "/accounts" },
  { name: "Holdings", href: "/holdings" },
  { name: "Transactions", href: "/transactions" },
  { name: "Settings", href: "/settings" },
];

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  // Don't show header on login page
  if (pathname === "/login") return null;

  return (
    <header className="bg-background border-b">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              FinancialAmigo
            </Link>
            {user && (
              <div className="ml-10 hidden space-x-8 md:flex">
                {navigation.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === link.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Log out
                </Button>
              </>
            ) : (
              <Button asChild variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
