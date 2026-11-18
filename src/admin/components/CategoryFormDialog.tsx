import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { AlertTriangle, Check, Copy, FolderPlus, Link2, Pencil, RefreshCw, Undo2 } from 'lucide-react'
import { slugify } from '../../utils/text'
import type { AdminCategoryNode } from '../../features/catalog/types'
import AdminDialog, { AdminDialogBody, AdminDialogFooter } from './AdminDialog'
import AdminField, { AdminInputGroup } from './AdminField'
import { adminInputClass, adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'

// Qué abrió el formulario: crear (con o sin padre) o editar
export type CategoryDialogState =
  | { mode: 'create'; parent: AdminCategoryNode | null; resetKey?: number } // resetKey: deja el formulario en blanco
  | { mode: 'edit'; category: AdminCategoryNode }

export interface CategoryFormValues {
  name: string
  slug: string
  parentId: number | null
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const SLUG_PREFIX = '/categoria/'

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
  onSubmit: (values: CategoryFormValues, options: { another: boolean }) => void
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
  const suggested = suggestSlug(name, parentSlugOf(parentId))

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
    setSlug(value.toLowerCase().replace(/\s+/g, '-'))
  }

  // Vuelve a generar el slug desde el nombre y lo deja automático otra vez
  const resetSlug = () => {
    setSlug(suggested)
    setSlugTouched(false)
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

    // ¿Qué botón lo envió? El de "crear otra" lleva value="another"
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    onSubmit({ name: name.trim(), slug, parentId }, { another: submitter?.value === 'another' })
  }

  // Copiar la dirección completa de la categoría
  const [copied, setCopied] = useState(false)
  const fullUrl = `${window.location.origin}${SLUG_PREFIX}${slug}`
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setCopied(true)
    } catch {
      // Sin permiso para el portapapeles: no se hace nada
    }
  }
  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1500)
    return () => window.clearTimeout(timer)
  }, [copied])

  const slugChanged = isEdit && slug !== state.category.slug

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <AdminDialogBody>
        <AdminField id={`${baseId}-name`} label="Nombre" required error={errors.name} aside={`${name.length}/100`}>
          <input
            id={`${baseId}-name`}
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            maxLength={100}
            autoFocus
            placeholder="Ej: Pijamas"
            disabled={isSaving}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? `${baseId}-name-error` : undefined}
            className={adminInputClass}
          />
        </AdminField>

        <AdminField
          id={`${baseId}-parent`}
          label="Categoría principal"
          hint={
            isEdit
              ? 'Por ahora no se puede cambiar.'
              : parentId === null
                ? 'Será una categoría principal y aparecerá en el menú de la tienda.'
                : 'Será una subcategoría dentro de la principal elegida.'
          }
        >
          <select
            id={`${baseId}-parent`}
            value={parentId ?? ''}
            onChange={(e) => handleParentChange(e.target.value)}
            disabled={isSaving || isEdit}
            className={adminInputClass}
          >
            <option value="">Ninguna (es una categoría principal)</option>
            {roots.map((root) => (
              <option key={root.id} value={root.id}>
                {root.name}
              </option>
            ))}
          </select>
        </AdminField>

        <AdminField
          id={`${baseId}-slug`}
          label="Slug"
          required
          error={errors.slug}
          aside={
            slugTouched && slug !== suggested && suggested !== '' ? (
              <button
                type="button"
                onClick={resetSlug}
                disabled={isSaving}
                className="inline-flex items-center gap-1 font-medium text-admin-accent hover:underline"
              >
                <RefreshCw size={12} strokeWidth={2} aria-hidden="true" />
                Generar desde el nombre
              </button>
            ) : undefined
          }
          hint="Se genera solo a partir del nombre. Solo minúsculas, números y guiones."
        >
          <AdminInputGroup prefix={<span className="font-mono text-xs">{SLUG_PREFIX}</span>}>
            <input
              id={`${baseId}-slug`}
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              maxLength={100}
              disabled={isSaving}
              aria-invalid={errors.slug ? true : undefined}
              aria-describedby={errors.slug ? `${baseId}-slug-error` : `${baseId}-slug-hint`}
              className={`${adminInputClass} pl-[92px] font-mono`}
            />
          </AdminInputGroup>
        </AdminField>

        {/* Vista previa de la dirección */}
        <div className="flex items-center gap-2 rounded-xl border border-admin-line bg-admin-bg/60 px-3 py-2.5">
          <Link2 size={14} strokeWidth={1.75} aria-hidden="true" className="shrink-0 text-ink-muted" />
          <p className="min-w-0 flex-1 truncate font-mono text-xs text-ink-muted">
            {window.location.host}
            {SLUG_PREFIX}
            <span className="text-ink">{slug || 'slug'}</span>
          </p>
          <button
            type="button"
            onClick={copyUrl}
            disabled={!slug}
            aria-label="Copiar dirección"
            title="Copiar dirección"
            className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium text-ink-muted transition-colors hover:bg-white hover:text-ink disabled:opacity-40"
          >
            {copied ? (
              <Check size={13} strokeWidth={2} aria-hidden="true" className="text-green-600" />
            ) : (
              <Copy size={13} strokeWidth={1.75} aria-hidden="true" />
            )}
            {copied ? 'Copiada' : 'Copiar'}
          </button>
        </div>

        {slugChanged && (
          <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
            <AlertTriangle size={15} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
            <div className="flex-1">
              <p>
                Cambiar el slug cambia la URL de la categoría. Los enlaces que ya se hayan compartido dejarán de
                funcionar.
              </p>
              <button
                type="button"
                onClick={() => setSlug(state.category.slug)}
                disabled={isSaving}
                className="mt-1.5 inline-flex items-center gap-1 font-semibold underline-offset-2 hover:underline"
              >
                <Undo2 size={12} strokeWidth={2} aria-hidden="true" />
                Restaurar “{state.category.slug}”
              </button>
            </div>
          </div>
        )}

        {serverError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-danger">
            {serverError}
          </p>
        )}
      </AdminDialogBody>

      <AdminDialogFooter>
        <button type="button" onClick={onCancel} disabled={isSaving} className={adminSecondaryButtonClass}>
          Cancelar
        </button>
        {!isEdit && (
          <button type="submit" value="another" disabled={isSaving} className={adminSecondaryButtonClass}>
            Crear y agregar otra
          </button>
        )}
        <button type="submit" disabled={isSaving} className={adminPrimaryButtonClass}>
          {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </AdminDialogFooter>
    </form>
  )
}

// ─── El modal ───────────────────────────────────────────────
interface CategoryFormDialogProps {
  state: CategoryDialogState | null
  roots: AdminCategoryNode[]
  isSaving: boolean
  serverError: string | null
  onSubmit: (values: CategoryFormValues, options: { another: boolean }) => void
  onClose: () => void
}

function CategoryFormDialog({ state, roots, isSaving, serverError, onSubmit, onClose }: CategoryFormDialogProps) {
  let title = 'Nueva categoría'
  let description = 'Agrégala al menú de la tienda o dentro de otra categoría.'
  if (state?.mode === 'edit') {
    title = 'Editar categoría'
    description = state.category.name
  } else if (state?.parent) {
    title = 'Nueva subcategoría'
    description = `Dentro de ${state.parent.name}`
  }

  return (
    <AdminDialog
      open={state !== null}
      onClose={isSaving ? () => {} : onClose}
      title={title}
      description={description}
      icon={state?.mode === 'edit' ? Pencil : FolderPlus}
    >
      {state && (
        <CategoryForm
          key={state.mode === 'create' ? (state.resetKey ?? 0) : state.category.id}
          state={state}
          roots={roots}
          isSaving={isSaving}
          serverError={serverError}
          onSubmit={onSubmit}
          onCancel={onClose}
        />
      )}
    </AdminDialog>
  )
}

export default CategoryFormDialog
