import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { returnsInfo, shippingInfo } from '../../../config/storeInfo'

const TABS = [
  { id: 'about', label: 'Sobre el producto' },
  { id: 'shipping', label: 'Envíos' },
  { id: 'returns', label: 'Devoluciones y garantías' },
] as const

type TabId = (typeof TABS)[number]['id']

interface ProductInfoTabsProps {
  description: string | null
}

// Opciones en una fila arriba y, debajo, el contenido de la elegida.
// Empieza en "Sobre el producto"
function ProductInfoTabs({ description }: ProductInfoTabsProps) {
  const baseId = useId()
  const [active, setActive] = useState<TabId>('about')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Flechas izquierda/derecha para moverse entre opciones con el teclado
  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length
    setActive(TABS[next].id)
    tabRefs.current[next]?.focus()
  }

  return (
    <div>
      <div role="tablist" aria-label="Información del producto" className="flex flex-wrap gap-x-5 gap-y-2 border-b border-line-soft">
        {TABS.map((tab, index) => {
          const selected = tab.id === active
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[index] = el
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              // La elegida en negro con una línea debajo; las demás en gris
              className={`-mb-px border-b-2 pb-2.5 text-xs font-bold uppercase tracking-wide transition-colors ${
                selected ? 'border-ink text-ink' : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${active}`}
        className="mt-3.5 text-xs leading-relaxed text-ink/85"
      >
        {active === 'about' &&
          (description ? (
            <p className="whitespace-pre-line">{description}</p>
          ) : (
            <p>Pronto agregaremos más información sobre este producto.</p>
          ))}

        {active === 'shipping' && (
          <ul className="list-disc space-y-1.5 pl-5">
            {shippingInfo.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        )}

        {active === 'returns' && (
          <div className="space-y-3">
            {returnsInfo.map((item) => (
              <p key={item.label}>
                <strong className="font-semibold text-ink">{item.label}:</strong> {item.text}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductInfoTabs
