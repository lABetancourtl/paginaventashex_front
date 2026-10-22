import type { ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'

interface AccordionItemProps {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

function AccordionItem({ title, defaultOpen = false, children }: AccordionItemProps) {
  return (
    <details open={defaultOpen} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm font-bold uppercase tracking-wide [&::-webkit-details-marker]:hidden">
        {title}
        {/* El ícono cambia según el estado de <details> */}
        <Plus size={18} strokeWidth={1.5} aria-hidden="true" className="group-open:hidden" />
        <Minus size={18} strokeWidth={1.5} aria-hidden="true" className="hidden group-open:block" />
      </summary>

      <div className="pb-5 text-sm leading-relaxed text-ink-muted">{children}</div>
    </details>
  )
}

export default AccordionItem