import { getLowStockVariants, LOW_STOCK_THRESHOLD } from "@/lib/queries/catalog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RestockButton } from "@/components/admin/restock-button"

export async function InventoryAlertsPanel() {
  const variants = await getLowStockVariants()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Low stock alerts</CardTitle>
        <CardDescription>Variants at or below {LOW_STOCK_THRESHOLD} units in stock. Restock is admin-managed.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {variants.length === 0 ? (
          <p className="text-sm text-muted-foreground">No low-stock variants right now.</p>
        ) : (
          variants.map((variant) => (
            <div key={variant.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{variant.brandName} — {variant.productName}</p>
                <p className="text-xs text-muted-foreground">{variant.denominationLabel}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <Badge variant={variant.stockCount === 0 ? "destructive" : "secondary"}>{variant.stockCount} in stock</Badge>
                <RestockButton variantId={variant.id} />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
