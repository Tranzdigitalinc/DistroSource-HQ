export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading RedeemCove"
      className="flex min-h-screen items-center justify-center bg-background px-6"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex size-32 items-center justify-center sm:size-40">
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-accent/20 border-t-accent" aria-hidden="true" />
          <img
            src="/loading-icon.png"
            alt="RedeemCove"
            width={144}
            height={144}
            className="size-24 rounded-full object-cover sm:size-32"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="font-display text-lg font-semibold text-foreground">RedeemCove</p>
          <p className="text-sm text-muted-foreground">Preparing your digital experience…</p>
        </div>
      </div>
    </main>
  )
}
