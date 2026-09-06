import { asc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { gamingCategories, gamingProducts } from "@/lib/db/schema"

export async function getPublishedGamingCatalog() {
  const [products, categories] = await Promise.all([
    db.select().from(gamingProducts).where(eq(gamingProducts.status, "published")).orderBy(asc(gamingProducts.createdAt)),
    db.select().from(gamingCategories).orderBy(asc(gamingCategories.sortOrder)),
  ])

  return { products, categories }
}
