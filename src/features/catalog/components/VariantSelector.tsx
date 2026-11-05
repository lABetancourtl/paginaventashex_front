import { useId } from 'react'
import { isAvailable } from '../variants'
import type { ColorOption, SizeOption } from '../variants'
import type { ProductVariant } from '../types'

const legendClass = 'mb-3 text-xs font-bold uppercase tracking-wide'
// El contorno del teclado se dibuja en la etiqueta cuando el radio oculto tiene el foco
const focusClass = 'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary'

// ─── Colores ────────────────────────────────────────────────
interface ColorPickerProps {
  colors: ColorOption[]
  variants: ProductVariant[]
  selectedId: number | null
  onChange: (id: number) => void
}

export function ColorPicker({ colors, variants, selectedId, onChange }: ColorPickerProps) {
  const baseId = useId()
  const selected = colors.find((color) => color.id === selectedId)

  return (
    <fieldset>
      <legend className={legendClass}>
        Color
        {selected && <span className="ml-2 font-normal normal-case text-ink-muted">{selected.name}</span>}
      </legend>

      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const available = isAvailable(variants, { colorId: color.id })
          const inputId = `${baseId}-${color.id}`

          return (
            <div key={color.id}>
              <input
                type="radio"
                id={inputId}
                name={`${baseId}-color`}
                checked={color.id === selectedId}
                onChange={() => onChange(color.id)}
                disabled={!available}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                title={available ? color.name : `${color.name} (agotado)`}
                className={[
                  'flex cursor-pointer items-center justify-center rounded-full ring-1 ring-line',
                  'peer-checked:ring-2 peer-checked:ring-ink peer-checked:ring-offset-2 peer-checked:ring-offset-canvas',
                  'peer-disabled:cursor-not-allowed peer-disabled:opacity-35',
                  focusClass,
                  color.hex ? 'size-8' : 'px-3 py-1.5 text-xs font-medium',
                ].join(' ')}
              >
                {color.hex ? (
                  <>
                    <span className="size-full rounded-full" style={{ backgroundColor: color.hex }} />
                    <span className="sr-only">
                      {color.name}
                      {!available && ', agotado'}
                    </span>
                  </>
                ) : (
                  <>
                    {color.name}
                    {!available && <span className="sr-only">, agotado</span>}
                  </>
                )}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}

// ─── Tallas ─────────────────────────────────────────────────
interface SizePickerProps {
  sizes: SizeOption[]
  variants: ProductVariant[]
  colorId: number | null // Las tallas disponibles dependen del color elegido
  selectedId: number | null
  onChange: (id: number) => void
}

// Línea diagonal de esquina a esquina para las tallas agotadas
const crossedOut =
  'peer-disabled:bg-[linear-gradient(to_top_left,transparent_calc(50%-0.5px),var(--color-line)_50%,transparent_calc(50%+0.5px))]'

export function SizePicker({ sizes, variants, colorId, selectedId, onChange }: SizePickerProps) {
  const baseId = useId()

  return (
    <fieldset>
      <legend className={legendClass}>Talla</legend>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const available = isAvailable(variants, { sizeId: size.id, colorId })
          const inputId = `${baseId}-${size.id}`

          return (
            <div key={size.id}>
              <input
                type="radio"
                id={inputId}
                name={`${baseId}-size`}
                checked={size.id === selectedId}
                onChange={() => onChange(size.id)}
                disabled={!available}
                className="peer sr-only"
              />
              <label
                htmlFor={inputId}
                className={[
                  'flex h-10 min-w-12 cursor-pointer items-center justify-center border border-line px-3 text-xs font-semibold',
                  'hover:border-ink',
                  'peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white',
                  'peer-disabled:cursor-not-allowed peer-disabled:text-ink-muted/60 peer-disabled:hover:border-line',
                  crossedOut,
                  focusClass,
                ].join(' ')}
              >
                {size.name}
                {!available && <span className="sr-only">, agotada</span>}
              </label>
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}