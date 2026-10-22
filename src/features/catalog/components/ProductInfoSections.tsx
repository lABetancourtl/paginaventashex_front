import AccordionItem from '../../../components/AccordionItem'
import { returnsInfo, shippingInfo } from '../../../config/storeInfo'

interface ProductInfoSectionsProps {
  description: string | null
  sku: string
}

function ProductInfoSections({ description, sku }: ProductInfoSectionsProps) {
  return (
    <div className="-mt-4 [&>details:last-child]:border-b-0">
      <AccordionItem title="Sobre el producto" defaultOpen>
        {description ? (
          <p className="whitespace-pre-line">{description}</p>
        ) : (
          <p>Pronto agregaremos más información sobre este producto.</p>
        )}
        <p className="mt-4 text-xs">Ref. {sku}</p>
      </AccordionItem>

      <AccordionItem title="Envíos">
        <ul className="list-disc space-y-1.5 pl-5">
          {shippingInfo.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </AccordionItem>

      <AccordionItem title="Devoluciones y garantías">
        <div className="space-y-3">
          {returnsInfo.map((item) => (
            <p key={item.label}>
              <strong className="font-semibold text-ink">{item.label}:</strong> {item.text}
            </p>
          ))}
        </div>
      </AccordionItem>
    </div>
  )
}

export default ProductInfoSections