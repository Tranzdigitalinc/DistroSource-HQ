import { checkout } from "@/lib/actions/checkout"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.json()
  try {
    const result = await checkout(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 400 })
  }
}
