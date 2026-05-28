// @schemaforge/react — Thumbnail atom.
//
// A small fixed-size image (@widget("image")) or round avatar (@widget("avatar")).
// `alt` defaults to empty (decorative); pass a description when the image conveys
// meaning on its own.

export type ThumbnailProps = {
  src: string
  /** Render as a circle (avatar) instead of a rounded square. */
  round?: boolean
  alt?: string
}

export function Thumbnail({ src, round = false, alt = "" }: ThumbnailProps) {
  return (
    <img className={round ? "sf-thumb sf-thumb--round" : "sf-thumb"} src={src} alt={alt} loading="lazy" />
  )
}
