// @schemaforge/react — StarRating atom.
//
// Read-only star rating (@widget("rating")). Generic: value + max. The stars are
// aria-hidden; the accessible name carries "<n> of <max>".

export type StarRatingProps = {
  value: number
  /** Number of stars (defaults to 5). */
  max?: number
}

export function StarRating({ value, max = 5 }: StarRatingProps) {
  const filled = Math.max(0, Math.min(max, Math.round(value)))
  return (
    <span className="sf-stars" role="img" aria-label={`${filled} of ${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} aria-hidden="true" className={i < filled ? "sf-star sf-star--on" : "sf-star"}>
          ★
        </span>
      ))}
    </span>
  )
}
