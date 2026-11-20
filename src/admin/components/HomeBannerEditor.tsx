import { useId, useState } from 'react'
import type { ChangeEvent, DragEvent } from 'react'
import { ArrowDown, ArrowUp, ImagePlus, Link2, Smartphone, Trash2 } from 'lucide-react'
import AdminConfirmDialog from './AdminConfirmDialog'
import HomeCategorySelect from './HomeCategorySelect'
import { ApiRequestError } from '../../api/client'
import { cloudinaryUrl } from '../../utils/cloudinary'
import {
  useDeleteHomeItem,
  useRemoveHomeItemMobile,
  useReorderHomeItem,
  useSetHomeItemMobile,
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
  validateBannerMobileFile,
} from '../homeSections'
import { cloudinaryResizeAfter } from '../../utils/cloudinary'
const tileButtonClass =
  'inline-flex size-8 items-center justify-center rounded-lg text-[#6b6a65] transition-colors hover:bg-admin-hover hover:text-admin-ink disabled:cursor-not-allowed disabled:opacity-40'

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
  // Versión para celular: solo cuando el banner tiene un único medio
  canHaveMobile: boolean
  mobileStatus: string | null // "Subiendo… 40%" o "Quitando…"; null = sin tarea en curso
  onMobileFile: (file: File) => void
  onMobileRemove: () => void
}

const mobileButtonClass =
  'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[#dcdbd6] bg-white px-2.5 text-xs font-medium text-admin-ink transition-colors hover:bg-admin-bg'

function BannerTile({
  item,
  index,
  total,
  tree,
  isBusy,
  isSavingLink,
  onMove,
  onLinkChange,
  onDelete,
  canHaveMobile,
  mobileStatus,
  onMobileFile,
  onMobileRemove,
}: BannerTileProps) {
  const selectId = useId()
  const mobileInputId = useId()
  const mobileBusy = isBusy || mobileStatus !== null
  const handleMobileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // Permite volver a elegir el mismo archivo
    if (file) onMobileFile(file)
  }
  const linkInactive = item.categoryId !== null && !isCategoryUsable(tree, item.categoryId)
  const kind = item.mediaType === 'Video' ? 'Video' : 'Imagen'

  return (
    <li className="flex gap-3 rounded-[10px] border border-admin-line bg-white p-2.5">
      <div className="w-16 shrink-0 overflow-hidden rounded-lg bg-admin-active">
        {item.mediaType === 'Video' ? (
          <video src={item.url} autoPlay muted loop playsInline preload="metadata" className="size-full object-cover" />
        ) : (
          <img src={cloudinaryUrl(item.url, 200)} alt={`Medio ${index + 1}`} loading="lazy" className="size-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-[13px] font-medium">
          <span className="font-mono text-xs text-[#9a9993]">{String(index + 1).padStart(2, '0')}</span> · {kind}
        </p>
        <label htmlFor={selectId} className="flex items-center gap-1 text-[11px] font-medium text-[#8b8a84]">
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
          className="h-9 text-xs"
        />
        {linkInactive && (
          <p className="text-[11px] font-medium text-[#8a5a00]">La categoría está inactiva: en la tienda no será un enlace.</p>
        )}

        {/* Versión para celular (4:5): reemplaza a la principal en pantallas chicas */}
        {canHaveMobile && (
          <div className="pt-1.5">
            <p className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-[#8b8a84]">
              <Smartphone size={12} strokeWidth={2} aria-hidden="true" />
              {mobileStatus ?? 'Versión celular (4:5)'}
            </p>
            <input
              id={mobileInputId}
              type="file"
              accept={BANNER_IMAGE_TYPES.join(',')}
              onChange={handleMobileInput}
              disabled={mobileBusy}
              className="sr-only"
            />
            {item.mobileUrl ? (
              <div className="flex items-center gap-2.5">
                <img
                  src={cloudinaryResizeAfter(item.mobileUrl, 160)}
                  alt="Versión para celular"
                  className="aspect-[4/5] w-12 shrink-0 rounded-md bg-admin-active object-cover"
                />
                <div className="flex flex-wrap gap-1.5">
                  <label
                    htmlFor={mobileInputId}
                    className={`${mobileButtonClass} ${mobileBusy ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    Reemplazar
                  </label>
                  <button
                    type="button"
                    onClick={onMobileRemove}
                    disabled={mobileBusy}
                    className="inline-flex h-8 items-center rounded-lg px-2.5 text-xs font-medium text-[#b42318] transition-colors hover:bg-[#fdecea] disabled:opacity-50"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ) : (
              <label
                htmlFor={mobileInputId}
                className={`${mobileButtonClass} border-dashed ${mobileBusy ? 'pointer-events-none opacity-50' : ''}`}
              >
                <ImagePlus size={13} strokeWidth={1.75} aria-hidden="true" />
                Agregar versión celular (4:5)
              </label>
            )}
          </div>
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
          className={`${tileButtonClass} ${index === 0 ? 'invisible' : ''}`}
        >
          <ArrowUp size={15} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={isBusy}
          aria-label={`Mover el medio ${index + 1} después`}
          title="Mover después (más a la derecha)"
          className={`${tileButtonClass} ${index === total - 1 ? 'invisible' : ''}`}
        >
          <ArrowDown size={15} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={isBusy}
          aria-label={`Quitar el medio ${index + 1}`}
          title="Quitar"
          className={`${tileButtonClass} mt-auto hover:bg-[#fdecea]! hover:text-[#b42318]!`}
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
  const toast = useAdminToast()

  const upload = useUploadHomeItem(sectionId)
  const updateLink = useUpdateHomeItemLink(sectionId)
  const reorder = useReorderHomeItem(sectionId)
  const remove = useDeleteHomeItem(sectionId)
  const setMobile = useSetHomeItemMobile(sectionId)
  const removeMobile = useRemoveHomeItemMobile(sectionId)

  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [problems, setProblems] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [toDelete, setToDelete] = useState<HomeItemAdmin | null>(null)
  const [mobileToRemove, setMobileToRemove] = useState<HomeItemAdmin | null>(null)
  const [mobileProgress, setMobileProgress] = useState<{ itemId: number; percent: number } | null>(null)

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
          categoryId: null, // El enlace se elige después en cada medio
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

  // ─── Versión para celular ─────────────────────────────────
  const uploadMobile = (item: HomeItemAdmin, file: File) => {
    const problem = validateBannerMobileFile(file)
    if (problem) {
      toast({ tone: 'error', message: problem })
      return
    }
    const hadMobile = item.mobileUrl !== null
    setMobileProgress({ itemId: item.id, percent: 0 })
    setMobile.mutate(
      {
        itemId: item.id,
        file,
        onProgress: (percent) => setMobileProgress({ itemId: item.id, percent }),
      },
      {
        onSuccess: () => toast({ message: hadMobile ? 'Versión celular reemplazada.' : 'Versión celular agregada.' }),
        onError: (err) => toast({ tone: 'error', message: uploadErrorMessage(err) }),
        onSettled: () => setMobileProgress(null),
      },
    )
  }

  const confirmRemoveMobile = () => {
    if (!mobileToRemove) return
    removeMobile.mutate(mobileToRemove.id, {
      onSuccess: () => {
        setMobileToRemove(null)
        toast({ message: 'Versión celular quitada: en celular se usará la imagen principal.' })
      },
    })
  }

  const mobileStatusOf = (item: HomeItemAdmin) => {
    if (mobileProgress?.itemId === item.id) {
      return mobileProgress.percent < 100 ? `Subiendo versión celular… ${mobileProgress.percent}%` : 'Procesando…'
    }
    if (removeMobile.isPending && removeMobile.variables === item.id) return 'Quitando versión celular…'
    return null
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
            canHaveMobile={items.length === 1}
            mobileStatus={mobileStatusOf(item)}
            onMobileFile={(file) => uploadMobile(item, file)}
            onMobileRemove={() => {
              removeMobile.reset()
              setMobileToRemove(item)
            }}
          />
        ))}
      </ul>

      {items.length > 1 && items.some((item) => item.mobileUrl) && (
        <p className="flex items-start gap-1.5 rounded-[10px] bg-admin-bg px-3 py-2 text-[11px] text-[#6b6a65]">
          <Smartphone size={13} strokeWidth={1.75} aria-hidden="true" className="mt-px shrink-0" />
          La versión celular solo se usa cuando el banner tiene una foto. Se conserva por si vuelves a dejar una sola.
        </p>
      )}

      {remaining > 0 && (
        <div>
          <label
            htmlFor={inputId}
            onDragOver={handleDragOver}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-[10px] border-[1.5px] border-dashed px-3 py-2 text-center text-[13px] font-medium transition-colors md:min-h-10 ${
              isDragging
                ? 'border-admin-accent bg-admin-accent/5 text-admin-accent'
                : 'border-[#d0cfc9] bg-white text-[#4a4945] hover:border-admin-accent hover:text-admin-accent'
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

        </div>
      )}

      <p className="text-[11px] leading-relaxed text-[#8b8a84]">
        De 1 a {MAX_BANNER_ITEMS}, uno al lado del otro y en este orden; uno solo ocupa todo el ancho. Imágenes JPG,
        PNG, WebP o GIF hasta {MAX_BANNER_IMAGE_MB} MB. Videos MP4, WebM o MOV hasta {MAX_BANNER_VIDEO_MB} MB (sin
        sonido y en bucle). Si la imagen lleva texto, debe ir dentro de la imagen. También puedes arrastrar los
        archivos.
      </p>

      {progress && (
        <div role="status" className="space-y-1.5">
          <p className="text-xs text-[#6b6a65]">
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
            className="h-1 overflow-hidden rounded-full bg-admin-active"
          >
            <div className="h-full rounded-full bg-admin-accent transition-[width]" style={{ width: `${progress.percent}%` }} />
          </div>
        </div>
      )}

      {problems.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-danger">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}

      <AdminConfirmDialog
        isOpen={mobileToRemove !== null}
        title="¿Quitar la versión celular?"
        message="Se borrará de forma permanente. En celular se mostrará la imagen principal recortada."
        confirmLabel="Quitar"
        loadingLabel="Quitando..."
        isLoading={removeMobile.isPending}
        error={removeMobile.error?.message ?? null}
        onConfirm={confirmRemoveMobile}
        onCancel={() => setMobileToRemove(null)}
      />

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
