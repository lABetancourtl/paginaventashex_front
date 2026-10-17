import { useState } from 'react'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react'
import { Check, ChevronDown } from 'lucide-react'
import { inputClass } from './formStyles'
import { normalizeText } from '../utils/text'

interface SearchableSelectProps<T> {
  id: string
  options: T[]
  value: T | null
  onChange: (value: T | null) => void
  getLabel: (option: T) => string
  getKey: (option: T) => string | number
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
}

function SearchableSelect<T>({
  id,
  options,
  value,
  onChange,
  getLabel,
  getKey,
  placeholder,
  emptyText = 'No hay resultados',
  disabled = false,
  invalid = false,
  describedBy,
}: SearchableSelectProps<T>) {
  // Lo que el usuario está escribiendo para buscar
  const [query, setQuery] = useState('')

  // Estado derivado: las opciones que coinciden con la búsqueda
  const normalizedQuery = normalizeText(query)
  const filteredOptions =
    normalizedQuery === ''
      ? options
      : options.filter((option) => normalizeText(getLabel(option)).includes(normalizedQuery))

  return (
    <Combobox
      value={value}
      onChange={onChange}
      onClose={() => setQuery('')}
      disabled={disabled}
      immediate
      // Compara por código, no por referencia del objeto
      by={(a, b) => (a && b ? getKey(a) === getKey(b) : a === b)}
    >
      <div className="relative">
        <ComboboxInput
          id={id}
          displayValue={(option: T | null) => (option ? getLabel(option) : '')}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          aria-invalid={invalid ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} pr-10`}
        />
        <ComboboxButton className="group absolute inset-y-0 right-0 flex items-center px-3 text-ink-muted disabled:opacity-60">
          <ChevronDown
            size={18}
            strokeWidth={1.5}
            aria-hidden="true"
            className="transition-transform group-data-open:rotate-180"
          />
        </ComboboxButton>
      </div>

      <ComboboxOptions
        anchor="bottom start"
        className="z-50 max-h-60 w-(--input-width) overflow-y-auto border border-line bg-surface py-1 shadow-lg [--anchor-gap:4px] empty:invisible"
      >
        {filteredOptions.length === 0 ? (
          <div className="px-4 py-3 text-sm text-ink-muted">{emptyText}</div>
        ) : (
          filteredOptions.map((option) => (
            <ComboboxOption
              key={getKey(option)}
              value={option}
              className="group flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 data-focus:bg-canvas data-selected:font-semibold"
            >
              <span>{getLabel(option)}</span>
              <Check
                size={16}
                strokeWidth={2}
                aria-hidden="true"
                className="invisible shrink-0 group-data-selected:visible"
              />
            </ComboboxOption>
          ))
        )}
      </ComboboxOptions>
    </Combobox>
  )
}

export default SearchableSelect