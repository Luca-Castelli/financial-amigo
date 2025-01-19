import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Header } from '@/components/Header'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <div className="relative px-6 lg:px-8">
          <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
            <div>
              <div className="hidden sm:mb-8 sm:flex sm:justify-center">
                <div className="relative overflow-hidden rounded-full py-1.5 px-4 text-sm leading-6 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
                  <span className="text-gray-600">
                    Announcing our next round of funding.{' '}
                    <a href="#" className="font-semibold text-indigo-600">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Read more <span aria-hidden="true">&rarr;</span>
                    </a>
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-center sm:text-6xl">
                  Track your investments with ease
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-center">
                  FinancialAmigo helps you manage your portfolio, track your net worth, and make informed investment decisions.
                </p>
                <div className="mt-8 flex gap-x-4 sm:justify-center">
                  <Button asChild>
                    <Link href="/register">
                      Get started
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/login">
                      Log in
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

