export function LoadingDots({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span>{text}</span>
      <span className="inline-flex gap-0.5">
        <span className="loading-dot inline-block h-1 w-1 rounded-full bg-current" />
        <span className="loading-dot inline-block h-1 w-1 rounded-full bg-current" />
        <span className="loading-dot inline-block h-1 w-1 rounded-full bg-current" />
      </span>
    </span>
  )
}
