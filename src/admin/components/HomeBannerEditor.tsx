import { useId, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Link2, Trash2 } from 'lucide-react'
import AdminConfirmDialog from './AdminConfirmDialog'
import HomeCategorySelect from './HomeCategorySelect'
import { ApiRequestError } from '../../api/client'
import { cloudinaryUrl } from '../../utils/cloudinary'
import {
  useDeleteHomeItem,
  useReorderHomeItem,
  useUpdateHomeItemLink,
  useUploadHomeItem,
} from '../../features/home/hooks/useHomeAdmin'
import type { AdminCategoryNode } from '../../features/catalog/types'
import type { HomeItemAdmin } from '../../features/home/types'
import { useAdminToast } from '../toast/toastContext'
import {
  BANNER_IMAGE_TYPES,
  isCategoryUsable,
  BANNER_VIDEO_TYPES,
  MAX_BANNER_IMAGE_MB,
  MAX_BANNER_ITEMS,
  MAX_BANNER_VIDEO_MB,
  uploadErrorMessage,
  validateBannerFile,
} from '../homeSections'
import { adminIconButtonClass } from '../adminStyles'

interface UploadProgress {
  current: number
  total: number
  fileName: string
  percent: number
}

// ─── Un medio del banner ────────────────────────────────────
interface BannerTileProps {
  item: HomeItemAdmin
  index: number
  total: number
  tree: AdminCategoryNode[]
  isBusy: boolean
  isSavingLink: boolean
  onMove: (direction: -1 | 1) => void
  onLinkChange: (categoryId: number | null) => void
  onDelete: () => void
}

function BannerTile({ item, index, total, tree, isBusy, isSavingLink, onMove, onLinkChange, onDelete }: BannerTileProps) {
  const selectId = useId()
  const linkInactive = item.categoryId !== null && !isCategoryUsable(tree, item.categoryId)
  const kind = item.mediaType === 'Video' ? 'Video' : 'Imagen'

  return (
    <li className="flex gap-2.5 rounded-lg border border-admin-line bg-white p-2">
      <div className="w-16 shrink-0 overflow-hidden rounded-[5px] bg-admin-bg">
        {item.mediaType === 'Video' ? (
          <video src={item.url} autoPlay muted loop playsInline preload="metadata" className="size-full object-cover" />
        ) : (
          <img src={cloudinaryUrl(item.url, 200)} alt={`Medio ${index + 1}`} loading="lazy" className="size-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-[13px] font-medium">
          <span className="font-mono text-xs text-ink-muted">{index + 1}</span> · {kind}
        </p>
        <label htmlFor={selectId} className="flex items-center gap-1 text-[11px] font-medium text-ink-muted">
          <Link2 size={12} strokeWidth={2} aria-hidden="true" />
          {isSavingLink ? 'Guardando enlace…' : 'Lleva a'}
        </label>
        <HomeCategorySelect
          id={selectId}
          value={item.categoryId}
          onChange={onLinkChange}
          tree={tree}
          emptyLabel="Sin enlace (solo imagen)"
          disabled={isBusy || isSavingLink}
          className="py-1.5 text-xs"
        />
        {linkInactive && (
          <p className="text-[11px] text-amber-700">La categoría está inactiva: en la tienda no será un enlace.</p>
        )}
      </div>

      {/* En la tienda van de izquierda a derecha: "antes" es más a la izquierda */}
      <div className="-mr-0.5 flex shrink-0 flex-col items-center">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={isBusy}
          aria-label={`Mover el medio ${index + 1} antes`}
          title="Mover antes (más a la izquierda)"
          className={`${adminIconButtonClass} size-7 ${index === 0 ? 'invisible' : ''}`}
        >
          <ArrowUp size={15} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={isBusy}
          aria-label={`Mover el medio ${index + 1} después`}
          title="Mover después (más a la derecha)"
          className={`${adminIconButtonClass} size-7 ${index === total - 1 ? 'invisible' : ''}`}
        >
          <ArrowDown size={15} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isBusy}
          aria-label={`Quitar el medio ${index + 1}`}
          title="Quitar"
          className={`${adminIconButtonClass} mt-auto size-7 hover:bg-red-50 hover:text-danger`}
        >
          <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </li>
  )
}

// ─── El editor ──────────────────────────────────────────────
interface HomeBannerEditorProps {
  sectionId: number
  items: HomeItemAdmin[]
  tree: AdminCategoryNode[]
}

function HomeBannerEditor({ sectionId, items, tree }: HomeBannerEditorProps) {
  const inputId = useId()
  const newLinkId = useId()
  const toast = useAdminToast()

  const upload = useUploadHomeItem(sectionId)
  const updateLink = useUpdateHomeItemLink(sectionId)
  const reorder = useReorderHomeItem(sectionId)
  const remove = useDeleteHomeItem(sectionId)

  const [newLink, setNewLink] = useState<number | null>(null)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [problems, setProblems] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [toDelete, setToDelete] = useState<HomeItemAdmin | null>(null)

  const remaining = MAX_BANNER_ITEMS - items.length
  const isUploading = progress !== null
  const isBusy = isUploading || reorder.isPending || remove.isPending

  // ─── Subir uno por uno (un video puede tardar) ────────────
  const uploadFiles = async (files: File[]) => {
    const found: string[] = []

    let valid = files.filter((file) => {
      const error = validateBannerFile(file)
      if (error) found.push(`${file.name}: ${error}`)
      return error === null
    })

    if (valid.length > remaining) {
      found.push(
        remaining === 0
          ? `El banner ya tiene ${MAX_BANNER_ITEMS} medios. Quita alguno para agregar otro.`
          : `Solo caben ${remaining} más: se subirán los primeros ${remaining}.`,
      )
      valid = valid.slice(0, remaining)
    }
    setProblems([...found])

    let uploaded = 0
    for (const [index, file] of valid.entries()) {
      setProgress({ current: index + 1, total: valid.length, fileName: file.name, percent: 0 })
      try {
        await upload.mutateAsync({
          file,
          categoryId: newLink,
          onProgress: (percent) => setProgress((prev) => (prev ? { ...prev, percent } : prev)),
        })
        uploaded++
      } catch (err) {
        found.push(`${file.name}: ${uploadErrorMessage(err)}`)
        setProblems([...found])
        if (err instanceof ApiRequestError && err.code === 'HOME_ITEM_LIMIT') break
      }
    }

    setProgress(null)
    if (uploaded > 0) toast({ message: uploaded === 1 ? 'Medio agregado al banner.' : `${uploaded} medios agregados.` })
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = '' // Permite volver a elegir el mismo archivo
    if (files.length > 0) uploadFiles(files)
  }

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    if (!isBusy) setIsDragging(true)
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (!isBusy) uploadFiles(Array.from(e.dataTransfer.files))
  }

  // ─── Enlace, orden y borrado ──────────────────────────────
  const changeLink = (item: HomeItemAdmin, categoryId: number | null) => {
    // El PUT reemplaza el enlace: null deja el medio sin enlace
    updateLink.mutate(
      { itemId: item.id, categoryId },
      {
        onSuccess: () => toast({ message: categoryId === null ? 'El medio ya no es un enlace.' : 'Enlace guardado.' }),
        onError: (err) => toast({ tone: 'error', message: err.message }),
      },
    )
  }

  const move = (index: number, direction: -1 | 1) => {
    const item = items[index]
    const target = items[index + direction]
    if (!item || !target) return
    reorder.mutate(
      { itemId: item.id, newDisplayOrder: target.displayOrder },
      { onError: (err) => toast({ tone: 'error', message: err.message }) },
    )
  }

  const confirmDelete = () => {
    if (!toDelete) return
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        setToDelete(null)
        toast({ message: 'Medio quitado del banner.' })
      },
    })
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.map((item, index) => (
          <BannerTile
            key={item.id}
            item={item}
            index={index}
            total={items.length}
            tree={tree}
            isBusy={isBusy}
            isSavingLink={updateLink.isPending && updateLink.variables?.itemId === item.id}
            onMove={(direction) => move(index, direction)}
            onLinkChange={(categoryId) => changeLink(item, categoryId)}
            onDelete={() => {
              remove.reset()
              setToDelete(item)
            }}
          />
        ))}
      </ul>

      {remaining > 0 && (
        <div className="space-y-2">
          <label
            htmlFor={inputId}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-center text-[13px] transition-colors ${
              isDragging
                ? 'border-admin-accent bg-admin-accent/5 text-admin-accent'
                : 'border-ink/20 bg-admin-bg/50 text-ink/80 hover:border-admin-accent/50 hover:bg-admin-accent/5'
            } ${isBusy ? 'pointer-events-none opacity-50' : ''}`}
          >
            <ImagePlus size={16} strokeWidth={1.6} aria-hidden="true" className={isUploading ? 'animate-pulse' : ''} />
            {isUploading ? 'Subiendo…' : `Subir imagen o video · quedan ${remaining}`}
          </label>
          <input
            id={inputId}
            type="file"
            accept={[...BANNER_IMAGE_TYPES, ...BANNER_VIDEO_TYPES].join(',')}
            multiple={remaining > 1}
            onChange={handleInputChange}
            disabled={isBusy}
            className="sr-only"
          />

          <div>
            <label htmlFor={newLinkId} className="mb-1 flex items-center gap-1 text-[11px] font-medium text-ink-muted">
              <Link2 size={12} strokeWidth={2} aria-hidden="true" />
              El nuevo medio lleva a
            </label>
            <HomeCategorySelect
              id={newLinkId}
              value={newLink}
              onChange={setNewLink}
              tree={tree}
              emptyLabel="Sin enlace (solo imagen)"
              disabled={isBusy}
              className="py-1.5 text-xs"
            />
          </div>
        </div>
      )}

      <p className="text-[11px] leading-relaxed text-ink-muted">
        De 1 a {MAX_BANNER_ITEMS}, uno al lado del otro y en este orden; uno solo ocupa todo el ancho. Imágenes JPG,
        PNG, WebP o GIF hasta {MAX_BANNER_IMAGE_MB} MB. Videos MP4, WebM o MOV hasta {MAX_BANNER_VIDEO_MB} MB (sin
        sonido y en bucle). Si la imagen lleva texto, debe ir dentro de la imagen. También puedes arrastrar los
        archivos.
      </p>

      {progress && (
        <div role="status" className="space-y-1.5">
          <p className="text-xs text-ink-muted">
            Subiendo {progress.total > 1 ? `${progress.current} de ${progress.total}: ` : ''}
            {progress.fileName} ({progress.percent}%)
            {progress.percent === 100 && ' · procesando…'}
          </p>
          <div
            role="progressbar"
            aria-label="Progreso de la subida"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            className="h-1.5 overflow-hidden rounded-full bg-admin-bg"
          >
            <div className="h-full rounded-full bg-admin-accent transition-[width]" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}

      {problems.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-danger">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}

      <AdminConfirmDialog
        isOpen={toDelete !== null}
        title={toDelete?.mediaType === 'Video' ? '¿Quitar el video?' : '¿Quitar esta imagen?'}
        message="Se borrará de forma permanente, también de Cloudinary, y los siguientes se correrán un puesto."
        confirmLabel="Quitar"
        loadingLabel="Quitando..."
        isLoading={remove.isPending}
        error={remove.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

export default HomeBannerEditor
