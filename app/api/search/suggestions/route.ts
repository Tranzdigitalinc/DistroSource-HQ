import { NextResponse, type NextRequest } from "next/server"
import { getSearchSuggestions } from "@/lib/queries/catalog"
import { searchGamingProducts } from "@/lib/gaming/queries"
import { PLATFORM_LABEL } from "@/lib/gaming/types"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? ""
  const suggestions = await getSearchSuggestions(query)

  // Gaming products live in code rather than the catalogue tables, so they
  // are matched separately and merged here. They are returned under their own
  // key so the UI can badge them as Gaming rather than mixing them silently
  // into the main product results.
  const gaming = searchGamingProducts(query).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.title,
    platform: PLATFORM_LABEL[p.platform],
    price: p.price,
  }))

  return NextResponse.json({ ...suggestions, gaming })
}
