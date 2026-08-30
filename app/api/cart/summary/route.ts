import { getCartItems } from "@/lib/actions/cart"
import { NextResponse } from "next/server"

export async function GET() {
  const items = await getCartItems()
  const count = items.reduce((sum, i) => sum + i.cartItem.quantity, 0)
  return NextResponse.json({ count })
}
