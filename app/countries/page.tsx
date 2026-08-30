import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { getCountries } from "@/lib/queries/catalog"

export default async function CountriesPage() {
  const countries = await getCountries()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
          <h1 className="font-display text-3xl font-bold tracking-tight">Shop by country</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Products tailored to your region&apos;s currency and stores
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {countries.map((country) => (
              <Link
                key={country.code}
                href={`/countries/${country.code}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <span className="text-2xl">{country.flagEmoji}</span>
                <span className="text-sm font-medium">{country.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
