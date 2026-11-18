import { useId } from 'react'
import { isAvailable } from '../variants'
import type { ColorOption, SizeOption } from '../variants'
import type { ProductVariant } from '../types'

const legendClass = 'mb-3 text-[0.6875rem] font-bold uppercase tracking-wide'
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
                  // Círculos; el elegido con un aro oscuro separado del color
                  'flex cursor-pointer items-center justify-center rounded-full border-2 border-transparent',
                  'peer-checked:border-ink',
                  'peer-disabled:cursor-not-allowed peer-disabled:opacity-35',
                  focusClass,
                  color.hex ? 'size-[2.125rem] p-[3px]' : 'h-[2.125rem] px-3.5 text-xs font-medium ring-1 ring-line-soft ring-inset',
                ].join(' ')}
              >
                {color.hex ? (
                  <>
                    <span
                      className="size-full rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)]"
                      style={{ backgroundColor: color.hex }}
                    />
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

export function SizePicker({ sizes, variants, colorId, selectedId, onChange }: SizePickerProps) {
  const baseId = useId()
  const selected = sizes.find((size) => size.id === selectedId)

  return (
    <fieldset className="relative">
      <legend className={legendClass}>
        Talla
        {selected && <span className="ml-2 font-normal normal-case text-ink-muted">{selected.name}</span>}
      </legend>

      {/* PROVISIONAL: la guía de tallas todavía no existe; aquí se abrirá cuando se cree */}
      <button
        type="button"
        className="absolute top-0 right-0 text-[0.625rem] font-semibold uppercase tracking-wide underline underline-offset-2 hover:text-ink-muted"
      >
        Guía de tallas
      </button>

      <div className="grid grid-cols-6 gap-2">
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
                  'flex h-[2.625rem] cursor-pointer items-center justify-center rounded-lg border border-line-soft bg-white px-1 text-xs font-semibold',
                  'hover:border-ink',
                  'peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white',
                  // Agotada: fondo crema, texto apagado y tachado
                  'peer-disabled:cursor-not-allowed peer-disabled:bg-surface-soft peer-disabled:text-[#a9a095] peer-disabled:line-through peer-disabled:hover:border-line-soft',
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