export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading DistroSource"
      className="flex min-h-screen items-center justify-center bg-background px-6"
    >
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="relative flex size-32 items-center justify-center sm:size-40">
          <span
            className="absolute inset-0 animate-spin rounded-3xl border-2 border-accent/20 border-t-accent"
            aria-hidden="true"
          />
          <img
            src="/loading-icon.png"
            alt="DistroSource"
            width={160}
            height={160}
            className="size-24 rounded-2xl object-contain sm:size-32"
          />
        </div>
        <p className="text-sm text-muted-foreground">Preparing your digital experience…</p>
      </div>
    </main>
  )
}
