"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, Search, Star } from "@/lib/admin-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { searchEnvatoCatalog, importEnvatoItem } from "@/lib/actions/envato-import"
import { ENVATO_SITES, type EnvatoSearchResult, type EnvatoSite } from "@/lib/envato"

type Category = { id: number; name: string }

const DEFAULT_SITES: EnvatoSite[] = ["themeforest.net", "codecanyon.net", "graphicriver.net"]

export function EnvatoImportPanel({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [term, setTerm] = useState("")
  const [selectedSites, setSelectedSites] = useState<EnvatoSite[]>(DEFAULT_SITES)
  const [results, setResults] = useState<EnvatoSearchResult[]>([])
  const [searched, setSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [importingId, setImportingId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const [categoryId, setCategoryId] = useState(categories[0] ? String(categories[0].id) : "")
  const [price, setPrice] = useState("29.00")
  const [isFeatured, setIsFeatured] = useState(false)

  function toggleSite(site: EnvatoSite) {
    setSelectedSites((prev) => (prev.includes(site) ? prev.filter((s) => s !== site) : [...prev, site]))
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault()
    if (!term.trim()) {
      toast.error("Enter a search term.")
      return
    }
    if (selectedSites.length === 0) {
      toast.error("Select at least one marketplace.")
      return
    }
    setIsSearching(true)
    try {
      const items = await searchEnvatoCatalog(term, selectedSites)
      setResults(items)
      setSearched(true)
      if (items.length === 0) toast.info("No results found for that search.")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Search failed.")
    } finally {
      setIsSearching(false)
    }
  }

  function handleImport(item: EnvatoSearchResult) {
    if (!categoryId) {
      toast.error("Choose a category before importing.")
      return
    }
    if (!price.trim() || Number.isNaN(Number(price))) {
      toast.error("Enter a valid price.")
      return
    }
    setImportingId(item.id)
    startTransition(async () => {
      try {
        const productId = await importEnvatoItem({
          envatoId: item.id,
          categoryId: Number(categoryId),
          basePrice: price,
          isFeatured,
        })
        toast.success(`Imported "${item.name}" as a draft product.`)
        router.push(`/admin/products/${productId}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Import failed.")
      } finally {
        setImportingId(null)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Label htmlFor="envato-term" className="mb-1.5 block text-xs text-muted-foreground">
                  Search term
                </Label>
                <Input
                  id="envato-term"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="e.g. dashboard template, ecommerce script"
                />
              </div>
              <Button type="submit" disabled={isSearching} className="shrink-0">
                {isSearching ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Search className="size-3.5" aria-hidden="true" />}
                Search Envato
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {ENVATO_SITES.map((site) => (
                <label key={site.value} className="flex items-center gap-2 text-sm text-foreground">
                  <Checkbox checked={selectedSites.includes(site.value)} onCheckedChange={() => toggleSite(site.value)} />
                  {site.label}
                </label>
              ))}
            </div>
          </form>

          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5 block text-xs text-muted-foreground">Import into category</Label>
              <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category">
                    {(value: string | null) => categories.find((c) => String(c.id) === value)?.name ?? "Select category"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="envato-price" className="mb-1.5 block text-xs text-muted-foreground">
                Your price (USD)
              </Label>
              <Input id="envato-price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="29.00" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox id="envato-featured" checked={isFeatured} onCheckedChange={(v) => setIsFeatured(Boolean(v))} />
              <Label htmlFor="envato-featured" className="text-sm font-normal text-foreground">
                Mark as featured
              </Label>
            </div>
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            Imported items are created as drafts using your price and category. You must attach a downloadable file
            and preview image before publishing — Envato does not provide the actual file.
          </p>
        </CardContent>
      </Card>

      {searched && results.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No results. Try a different search term.</p>
      ) : null}

      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-video w-full bg-secondary">
                {item.thumbnailUrl ? (
                  <Image src={item.thumbnailUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" unoptimized />
                ) : null}
                <Badge variant="secondary" className="absolute left-2 top-2 text-[10px] capitalize">
                  {item.site.replace(".net", "")}
                </Badge>
              </div>
              <CardContent className="flex flex-col gap-3 p-4">
                <div>
                  <p className="line-clamp-2 text-sm font-medium leading-5 text-foreground">{item.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">by {item.author}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="size-3 fill-current text-accent" aria-hidden="true" />
                    {item.rating?.toFixed(1) ?? "—"}
                  </span>
                  <span>{item.numberOfSales.toLocaleString()} sales</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleImport(item)}
                  disabled={importingId === item.id && isPending}
                  className="w-full"
                >
                  {importingId === item.id && isPending ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                  ) : null}
                  Import as product
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}
