import { productBenefits } from '../../../config/storeInfo'

function ProductBenefits() {
  return (
    <ul className="space-y-4">
      {productBenefits.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex items-start gap-4">
          <Icon
            size={24}
            strokeWidth={1.25}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-ink-muted"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-wide">{title}</p>
            <p className="text-sm text-ink-muted">{text}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ProductBenefits