import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { GalleryHorizontal, LayoutGrid, LayoutTemplate, Pencil } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import AdminDialog, { AdminDialogBody, AdminDialogFooter } from './AdminDialog'
import AdminField from './AdminField'
import HomeCategorySelect from './HomeCategorySelect'
import type { AdminCategoryNode } from '../../features/catalog/types'
import type { HomeSectionAdmin, HomeSectionType } from '../../features/home/types'
import { MAX_SECTION_TITLE } from '../homeSections'
import { adminInputClass, adminPrimaryButtonClass, adminSecondaryButtonClass } from '../adminStyles'

export type HomeSectionDialogState = { mode: 'create' } | { mode: 'edit'; section: HomeSectionAdmin }

export interface HomeSectionFormValues {
  type: HomeSectionType
  title: string | null
  categoryId: number | null
}

interface TypeOption {
  value: HomeSectionType
  label: string
  description: string
  icon: LucideIcon
}

const typeOptions: TypeOption[] = [
  {
    value: 'Banner',
    label: 'Banner',
    description: 'De 1 a 4 imágenes o videos. Cada uno puede llevar a una categoría.',
    icon: GalleryHorizontal,
  },
  {
    value: 'Products',
    label: 'Estante de productos',
    description: 'Un título, un botón “Ver todo” y hasta 4 productos.',
    icon: LayoutGrid,
  },
]

interface HomeSectionFormDialogProps {
  state: HomeSectionDialogState | null
  tree: AdminCategoryNode[]
  isSaving: boolean
  serverError: string | null
  onSubmit: (values: HomeSectionFormValues) => void
  onClose: () => void
}

function HomeSectionFormDialog({ state, tree, isSaving, serverError, onSubmit, onClose }: HomeSectionFormDialogProps) {
  const isEdit = state?.mode === 'edit'
  return (
    <AdminDialog
      open={state !== null}
      onClose={isSaving ? () => {} : onClose}
      title={isEdit ? 'Editar estante' : 'Agregar bloque'}
      description={isEdit ? undefined : 'Nace inactivo y al final de la página. Actívalo cuando esté listo.'}
      icon={isEdit ? Pencil : LayoutTemplate}
    >
      {/* Se monta cada vez que se abre: arranca con los datos de la sección (o en blanco) */}
      {state && (
        <SectionForm
          section={state.mode === 'edit' ? state.section : null}
          tree={tree}
          isSaving={isSaving}
          serverError={serverError}
          onSubmit={onSubmit}
          onClose={onClose}
        />
      )}
    </AdminDialog>
  )
}

interface SectionFormProps extends Omit<HomeSectionFormDialogProps, 'state'> {
  section: HomeSectionAdmin | null
}

function SectionForm({ section, tree, isSaving, serverError, onSubmit, onClose }: SectionFormProps) {
  const titleId = useId()
  const categoryId = useId()

  const [type, setType] = useState<HomeSectionType>(section?.type ?? 'Banner')
  const [title, setTitle] = useState(section?.title ?? '')
  const [category, setCategory] = useState<number | null>(section?.categoryId ?? null)

  const isEdit = section !== null
  const isShelf = type === 'Products'
  const trimmed = title.trim()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Un banner no lleva título ni categoría (el backend responde 400)
    onSubmit({
      type,
      title: isShelf && trimmed ? trimmed : null,
      categoryId: isShelf ? category : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <AdminDialogBody>
        {!isEdit && (
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium text-ink">Tipo de bloque</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {typeOptions.map(({ value, label, description, icon: Icon }) => (
                <label
                  key={value}
                  className="flex cursor-pointer flex-col gap-2 rounded-xl border border-admin-line p-4 transition-colors hover:border-ink/20 has-checked:border-admin-accent has-checked:bg-admin-accent/5 has-checked:ring-4 has-checked:ring-admin-accent/10 has-focus-visible:outline-2 has-focus-visible:outline-admin-accent"
                >
                  <input
                    type="radio"
                    name="home-section-type"
                    value={value}
                    checked={type === value}
                    onChange={() => setType(value)}
                    className="sr-only"
                  />
                  <span className="flex size-9 items-center justify-center rounded-lg bg-admin-bg text-admin-accent">
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold">{label}</span>
                  <span className="text-xs text-ink-muted">{description}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {isShelf && (
          <>
            <AdminField
              id={titleId}
              label="Título"
              hint="Opcional. Va arriba a la izquierda del estante, ej: HOMBRE."
              aside={`${title.length}/${MAX_SECTION_TITLE}`}
            >
              <input
                id={titleId}
                type="text"
                value={title}
                maxLength={MAX_SECTION_TITLE}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sin título"
                aria-describedby={`${titleId}-hint`}
                className={adminInputClass}
              />
            </AdminField>

            <AdminField
              id={categoryId}
              label="Botón “Ver todo”"
              hint="Opcional. Lleva al catálogo de esa categoría o subcategoría."
            >
              <HomeCategorySelect
                id={categoryId}
                value={category}
                onChange={setCategory}
                tree={tree}
                emptyLabel="Sin botón “Ver todo”"
                describedBy={`${categoryId}-hint`}
              />
            </AdminField>
          </>
        )}

        {serverError && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-danger">
            {serverError}
          </p>
        )}
      </AdminDialogBody>

      <AdminDialogFooter>
        <button type="button" onClick={onClose} disabled={isSaving} className={adminSecondaryButtonClass}>
          Cancelar
        </button>
        <button type="submit" disabled={isSaving} className={adminPrimaryButtonClass}>
          {isSaving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar bloque'}
        </button>
      </AdminDialogFooter>
    </form>
  )
}

export default HomeSectionFormDialog
