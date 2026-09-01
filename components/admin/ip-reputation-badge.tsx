import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { IpReputationResult } from "@/lib/actions/visitor-logs"

function scoreVariant(score: number): { label: string; className: string } {
  if (score >= 75) return { label: `${score}% abuse`, className: "bg-destructive/15 text-destructive" }
  if (score >= 25) return { label: `${score}% abuse`, className: "bg-orange-500/15 text-orange-600 dark:text-orange-400" }
  if (score >= 1) return { label: `${score}% abuse`, className: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" }
  return { label: "Clean", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" }
}

export function IpReputationBadge({ reputation }: { reputation: IpReputationResult | null }) {
  if (!reputation) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Checking…
      </Badge>
    )
  }

  if (reputation.isPrivate) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Private
      </Badge>
    )
  }

  if (reputation.abuseConfidenceScore === null) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Unknown
      </Badge>
    )
  }

  const { label, className } = scoreVariant(reputation.abuseConfidenceScore)

  return (
    <Tooltip>
      <TooltipTrigger>
        <Badge className={className}>{label}</Badge>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex flex-col gap-0.5">
          <span>{reputation.totalReports ?? 0} reports on AbuseIPDB</span>
          {reputation.isp && <span>{reputation.isp}</span>}
          {reputation.usageType && <span>{reputation.usageType}</span>}
          {reputation.isWhitelisted && <span>Whitelisted</span>}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
