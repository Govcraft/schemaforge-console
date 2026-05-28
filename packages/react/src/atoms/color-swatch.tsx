// @schemaforge/react — ColorSwatch atom.
//
// A color chip + its value (@widget("color")). Accepts any CSS color string.

export type ColorSwatchProps = {
  value: string
}

export function ColorSwatch({ value }: ColorSwatchProps) {
  return (
    <span className="sf-swatch-wrap">
      <span className="sf-swatch" style={{ background: value }} aria-hidden="true" />
      <code className="sf-mono">{value}</code>
    </span>
  )
}
