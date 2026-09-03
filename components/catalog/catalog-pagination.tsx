import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

function buildHref(params: Record<string, string | undefined>, page: number) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && key !== "page") query.set(key, value)
  }
  if (page > 1) query.set("page", String(page))
  const qs = query.toString()
  return qs ? `?${qs}` : "?"
}

export function CatalogPagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number
  totalPages: number
  params: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1])
  const sortedPages = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)

  const items: (number | "ellipsis")[] = []
  let prev = 0
  for (const page of sortedPages) {
    if (prev && page - prev > 1) items.push("ellipsis")
    items.push(page)
    prev = page
  }

  return (
    <Pagination className="mt-8">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={currentPage > 1 ? buildHref(params, currentPage - 1) : undefined}
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {items.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink href={buildHref(params, item)} isActive={item === currentPage}>
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}
        <PaginationItem>
          <PaginationNext
            href={currentPage < totalPages ? buildHref(params, currentPage + 1) : undefined}
            aria-disabled={currentPage >= totalPages}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
