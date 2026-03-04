export default function Loading() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-foreground/10 rounded animate-pulse"></div>
        <div className="h-10 w-28 bg-foreground/10 rounded-full animate-pulse"></div>
      </div>

      <div className="bg-card rounded-2xl border border-border/70 overflow-hidden">
        <div className="border-b border-border/60 bg-foreground/[0.04] px-6 py-3">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-4 bg-foreground/10 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border/60">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-foreground/10 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/4 bg-foreground/10 rounded animate-pulse"></div>
                  <div className="h-3 w-1/3 bg-foreground/10 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
