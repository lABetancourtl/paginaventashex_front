import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import Modal from '../../components/Modal'
import FormField from '../../components/FormField'
import { inputClass } from '../../components/formStyles'
import { slugify } from '../../utils/text'
import type { AdminCategoryNode } from '../../features/catalog/types'
import { adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'

// Qué abrió el formulario: crear (con o sin padre) o editar
export type CategoryDialogState =
  | { mode: 'create'; parent: AdminCategoryNode | null }
  | { mode: 'edit'; category: AdminCategoryNode }

export interface CategoryFormValues {
  name: string
  slug: string
  parentId: number | null
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const fieldClass = `${inputClass} rounded-lg`

// Slug sugerido: el del padre como prefijo, como en "nino-bodys"
function suggestSlug(name: string, parentSlug: string | undefined): string {
  const base = slugify(name)
  return parentSlug && base ? `${parentSlug}-${base}` : base
}

// ─── El formulario ──────────────────────────────────────────
interface CategoryFormProps {
  state: CategoryDialogState
  roots: AdminCategoryNode[]
  isSaving: boolean
  serverError: string | null
  onSubmit: (values: CategoryFormValues) => void
  onCancel: () => void
}

function CategoryForm({ state, roots, isSaving, serverError, onSubmit, onCancel }: CategoryFormProps) {
  const baseId = useId()
  const isEdit = state.mode === 'edit'

  const [name, setName] = useState(isEdit ? state.category.name : '')
  const [slug, setSlug] = useState(isEdit ? state.category.slug : '')
  const [parentId, setParentId] = useState<number | null>(
    isEdit ? state.category.parentCategoryId : (state.parent?.id ?? null),
  )
  // Al editar, el slug no se cambia solo: cambiarlo rompe los enlaces existentes
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [errors, setErrors] = useState<{ name?: string; slug?: string }>({})

  const parentSlugOf = (id: number | null) => roots.find((root) => root.id === id)?.slug

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slugTouched) setSlug(suggestSlug(value, parentSlugOf(parentId)))
  }

  const handleParentChange = (value: string) => {
    const nextParentId = value === '' ? null : Number(value)
    setParentId(nextParentId)
    if (!slugTouched) setSlug(suggestSlug(name, parentSlugOf(nextParentId)))
  }

  const handleSlugChange = (value: string) => {
    setSlugTouched(true)
    setSlug(value.toLowerCase())
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const nextErrors: { name?: string; slug?: string } = {}
    if (name.trim() === '') nextErrors.name = 'Escribe el nombre de la categoría.'
    if (!SLUG_PATTERN.test(slug)) {
      nextErrors.slug = 'Usa solo minúsculas, números y guiones (ej: nino-bodys).'
    }

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    onSubmit({ name: name.trim(), slug, parentId })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <FormField id={`${baseId}-name`} label="Nombre" required error={errors.name}>
        <input
          id={`${baseId}-name`}
          type="text"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          maxLength={100}
          autoFocus
          disabled={isSaving}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${baseId}-name-error` : undefined}
          className={fieldClass}
        />
      </FormField>

      <FormField
        id={`${baseId}-parent`}
        label="Categoría principal"
        hint={isEdit ? 'Por ahora no se puede cambiar.' : undefined}
      >
        <select
          id={`${baseId}-parent`}
          value={parentId ?? ''}
          onChange={(e) => handleParentChange(e.target.value)}
          disabled={isSaving || isEdit}
          className={fieldClass}
        >
          <option value="">Ninguna (es una categoría principal)</option>
          {roots.map((root) => (
            <option key={root.id} value={root.id}>
              {root.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        id={`${baseId}-slug`}
        label="Slug"
        required
        error={errors.slug}
        hint="Es la parte de la URL: /categoria/slug"
      >
        <input
          id={`${baseId}-slug`}
          type="text"
          value={slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          maxLength={100}
          disabled={isSaving}
          aria-invalid={errors.slug ? true : undefined}
          aria-describedby={errors.slug ? `${baseId}-slug-error` : `${baseId}-slug-hint`}
          className={`${fieldClass} font-mono text-sm`}
        />
      </FormField>

      {isEdit && slug !== state.category.slug && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Cambiar el slug cambia la URL de la categoría. Los enlaces que ya se hayan compartido dejarán
          de funcionar.
        </p>
      )}

      {serverError && (
        <p role="alert" className="text-sm text-danger">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} disabled={isSaving} className={adminSecondaryButtonClass}>
          Cancelar
        </button>
        <button type="submit" disabled={isSaving} className={adminPrimaryButtonClass}>
          {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </div>
    </form>
  )
}

// ─── El modal ───────────────────────────────────────────────
interface CategoryFormDialogProps {
  state: CategoryDialogState | null
  roots: AdminCategoryNode[]
  isSaving: boolean
  serverError: string | null
  onSubmit: (values: CategoryFormValues) => void
  onClose: () => void
}

function CategoryFormDialog({ state, roots, isSaving, serverError, onSubmit, onClose }: CategoryFormDialogProps) {
  let title = 'Nueva categoría'
  if (state?.mode === 'edit') title = 'Editar categoría'
  else if (state?.parent) title = `Nueva subcategoría de ${state.parent.name}`

  return (
    <Modal isOpen={state !== null} onClose={onClose} ariaLabel={title} size="small">
      {state && (
        <div className="pt-4">
          <h2 className="mb-5 pr-8 text-lg font-bold tracking-tight">{title}</h2>
          <CategoryForm
            state={state}
            roots={roots}
            isSaving={isSaving}
            serverError={serverError}
            onSubmit={onSubmit}
            onCancel={onClose}
          />
        </div>
      )}
    </Modal>
  )
}

export default CategoryFormDialog