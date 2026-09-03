import { NextResponse, type NextRequest } from "next/server"
import { getSearchSuggestions } from "@/lib/queries/catalog"

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? ""
  const suggestions = await getSearchSuggestions(query)
  return NextResponse.json(suggestions)
}
