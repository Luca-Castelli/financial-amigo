import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { ModeToggle } from "./mode-toggle"

export function Header() {
  return (
    <header className="bg-background border-b">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-indigo-500 py-6 lg:border-none">
          <div className="flex items-center">
            <Link href="/">
              <span className="sr-only">FinancialAmigo</span>
              <img
                className="h-10 w-auto"
                src="/logo.svg"
                alt="FinancialAmigo"
              />
            </Link>
            <div className="ml-10 hidden space-x-8 lg:block">
              <Link href="/dashboard" className="text-base font-medium text-foreground hover:text-foreground/80">
                Dashboard
              </Link>
              <Link href="/transactions" className="text-base font-medium text-foreground hover:text-foreground/80">
                Transactions
              </Link>
              <Link href="/settings" className="text-base font-medium text-foreground hover:text-foreground/80">
                Settings
              </Link>
            </div>
          </div>
          <div className="ml-10 space-x-4 flex items-center">
            <ModeToggle />
            <Button variant="outline" asChild>
              <Link href="/login">
                Sign in
              </Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Sign up
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap justify-center space-x-6 py-4 lg:hidden">
          <Link href="/dashboard" className="text-base font-medium text-foreground hover:text-foreground/80">
            Dashboard
          </Link>
          <Link href="/transactions" className="text-base font-medium text-foreground hover:text-foreground/80">
            Transactions
          </Link>
          <Link href="/settings" className="text-base font-medium text-foreground hover:text-foreground/80">
            Settings
          </Link>
        </div>
      </nav>
    </header>
  )
}

