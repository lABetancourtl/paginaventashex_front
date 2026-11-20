import { useId, useState } from 'react'
import type { ChangeEvent, DragEvent, ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2, Video } from 'lucide-react'
import AdminConfirmDialog from './AdminConfirmDialog'
import { ApiRequestError } from '../../api/client'
import { cloudinaryUrl } from '../../utils/cloudinary'
import {
  useDeleteProductMedia,
  useReorderProductMedia,
  useUploadProductMedia,
} from '../../features/catalog/hooks/useProductMediaMutations'
import type { MediaKind } from '../../features/catalog/services/productMediaService'
import type { ProductMedia } from '../../features/catalog/types'
import { adminCountChipClass, adminGhostButtonClass, adminPanelClass } from '../adminStyles'

// ─── Reglas de los archivos (ajústalas a las de tu backend) ──
const MAX_IMAGES = 9
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
const MAX_IMAGE_MB = 10
const MAX_VIDEO_MB = 100

function validateFile(file: File, kind: MediaKind): string | null {
  const types = kind === 'image' ? IMAGE_TYPES : VIDEO_TYPES
  const maxMb = kind === 'image' ? MAX_IMAGE_MB : MAX_VIDEO_MB

  if (!types.includes(file.type)) {
    return `${file.name}: formato no permitido.`
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `${file.name}: pesa más de ${maxMb} MB.`
  }
  return null
}

interface UploadProgress {
  current: number
  total: number
  fileName: string
  percent: number
}

// ─── Botón de ícono de cada imagen ──────────────────────────
interface TileButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
  hidden?: boolean
  danger?: boolean
  children: ReactNode
}

function TileButton({ label, onClick, disabled = false, hidden = false, danger = false, children }: TileButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || hidden}
      aria-label={label}
      title={label}
      className={`inline-flex size-8 items-center justify-center rounded-[7px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger ? 'text-[#8b8a84] hover:bg-[#fdecea] hover:text-[#b42318]' : 'text-[#6b6a65] hover:bg-admin-hover hover:text-admin-ink'
      } ${hidden ? 'invisible' : ''}`}
    >
      {children}
    </button>
  )
}

// ─── El gestor ──────────────────────────────────────────────
interface ProductMediaManagerProps {
  productId: number
  media: ProductMedia[]
}

function ProductMediaManager({ productId, media }: ProductMediaManagerProps) {
  const inputId = useId()
  const videoInputId = useId()

  const upload = useUploadProductMedia()
  const remove = useDeleteProductMedia()
  const reorder = useReorderProductMedia()

  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [problems, setProblems] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [toDelete, setToDelete] = useState<ProductMedia | null>(null)

  // Ordenadas por displayOrder; el video siempre va al final
  const sorted = [...media].sort((a, b) => a.displayOrder - b.displayOrder)
  const images = sorted.filter((item) => item.mediaType === 'Image')
  const video = sorted.find((item) => item.mediaType === 'Video') ?? null

  const remaining = MAX_IMAGES - images.length
  const isUploading = progress !== null
  const isBusy = isUploading || reorder.isPending || remove.isPending

  // ─── Subir uno por uno ────────────────────────────────────
  const uploadFiles = async (files: File[], kind: MediaKind) => {
    const found: string[] = []

    let valid = files.filter((file) => {
      const error = validateFile(file, kind)
      if (error) found.push(error)
      return error === null
    })

    if (kind === 'image' && valid.length > remaining) {
      found.push(
        remaining === 0
          ? 'Ya tienes 9 imágenes. Elimina alguna para agregar otra.'
          : `Solo caben ${remaining} imágenes más: se subirán las primeras ${remaining}.`,
      )
      valid = valid.slice(0, remaining)
    }

    setProblems([...found])

    for (const [index, file] of valid.entries()) {
      setProgress({ current: index + 1, total: valid.length, fileName: file.name, percent: 0 })

      try {
        await upload.mutateAsync({
          productId,
          kind,
          file,
          onProgress: (percent) => setProgress((prev) => (prev ? { ...prev, percent } : prev)),
        })
      } catch (err) {
        found.push(`${file.name}: ${err instanceof Error ? err.message : 'no se pudo subir.'}`)
        setProblems([...found])
        // Si el backend dice que se llegó al límite, no tiene sentido seguir
        if (err instanceof ApiRequestError && err.status === 409) break
      }
    }

    setProgress(null)
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, kind: MediaKind) => {
    const files = Array.from(e.target.files ?? [])
    // Permite volver a elegir el mismo archivo (si no, el input no dispara change)
    e.target.value = ''
    if (files.length > 0) uploadFiles(files, kind)
  }

  // ─── Arrastrar y soltar ───────────────────────────────────
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault() // Sin esto, el navegador abriría el archivo en la pestaña
    if (!isBusy) setIsDragging(true)
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (isBusy) return
    uploadFiles(Array.from(e.dataTransfer.files), 'image')
  }

  // ─── Reordenar y eliminar ─────────────────────────────────
  const moveTo = (item: ProductMedia, target: ProductMedia) => {
    reorder.mutate({ productId, mediaId: item.id, newDisplayOrder: target.displayOrder })
  }

  const confirmDelete = () => {
    if (!toDelete) return
    remove.mutate(
      { productId, mediaId: toDelete.id },
      { onSuccess: () => setToDelete(null) },
    )
  }

  const deleteMessage =
    toDelete?.mediaType === 'Video'
      ? 'El video se eliminará de forma permanente.'
      : toDelete?.id === images[0]?.id && images.length > 1
        ? 'Es la imagen principal: la siguiente pasará a ser la principal del catálogo.'
        : 'Se eliminará de forma permanente, y las siguientes subirán un puesto.'

  return (
    // Imágenes y video en módulos separados, uno debajo del otro
    <div className="flex flex-col gap-3.5 md:gap-5">
      <section id="imagenes" className={`${adminPanelClass} scroll-mt-24`}>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 px-5 pb-3.5 pt-4">
          <div className="min-w-0 flex-[1_1_200px]">
            <h2 className="text-[15px] font-semibold">Imágenes</h2>
            <p className="mt-0.5 text-[13px] text-[#6b6a65]">
              La 1ª es la principal del catálogo; la 2ª aparece al pasar el mouse.
            </p>
          </div>
          <span className={adminCountChipClass}>
            {images.length} de {MAX_IMAGES}
          </span>
        </div>

        <div className="space-y-4 px-5 pb-5">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((item, index) => (
              <li key={item.id} className="flex flex-col gap-1.5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[10px] border border-[#ecebe6] bg-admin-bg">
                  <img
                    src={cloudinaryUrl(item.url, 400)}
                    alt={`Imagen ${index + 1}`}
                    loading="lazy"
                    className="size-full object-contain mix-blend-multiply"
                  />
                  {index < 2 && (
                    <span
                      className={`absolute left-2 top-2 rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.04em] ${
                        index === 0 ? 'bg-admin-ink text-white' : 'bg-white text-[#4a4945] ring-1 ring-admin-line'
                      }`}
                    >
                      {index === 0 ? 'Principal' : 'Hover'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5">
                  <TileButton
                    label="Mover a la izquierda"
                    onClick={() => moveTo(item, images[index - 1])}
                    hidden={index === 0}
                    disabled={isBusy}
                  >
                    <ArrowLeft size={15} strokeWidth={1.75} aria-hidden="true" />
                  </TileButton>
                  <TileButton
                    label="Mover a la derecha"
                    onClick={() => moveTo(item, images[index + 1])}
                    hidden={index === images.length - 1}
                    disabled={isBusy}
                  >
                    <ArrowRight size={15} strokeWidth={1.75} aria-hidden="true" />
                  </TileButton>
                  <div className="flex-1" />
                  <TileButton
                    label="Hacer principal"
                    onClick={() => moveTo(item, images[0])}
                    hidden={index === 0}
                    disabled={isBusy}
                  >
                    <Star size={15} strokeWidth={1.75} aria-hidden="true" />
                  </TileButton>
                  <TileButton
                    label="Eliminar imagen"
                    danger
                    onClick={() => {
                      remove.reset()
                      setToDelete(item)
                    }}
                    disabled={isBusy}
                  >
                    <Trash2 size={15} strokeWidth={1.75} aria-hidden="true" />
                  </TileButton>
                </div>
              </li>
            ))}

            {/* La zona para agregar imágenes, como una casilla más de la grilla */}
            {remaining > 0 && (
              <li>
                <label
                  htmlFor={inputId}
                  onDragOver={handleDragOver}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed p-3 text-center transition-colors ${
                    isDragging
                      ? 'border-admin-accent bg-admin-accent/5 text-admin-accent'
                      : 'border-[#d0cfc9] bg-white text-[#4a4945] hover:border-admin-accent hover:text-admin-accent'
                  } ${isBusy ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <ImagePlus size={22} strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-[13px] font-medium">Subir imágenes</span>
                  <span className="text-[11px] text-[#8b8a84]">
                    JPG, PNG o WebP · {MAX_IMAGE_MB} MB
                  </span>
                </label>
                <input
                  id={inputId}
                  type="file"
                  accept={IMAGE_TYPES.join(',')}
                  multiple
                  onChange={(e) => handleInputChange(e, 'image')}
                  disabled={isBusy}
                  className="sr-only"
                />
              </li>
            )}
          </ul>

          {/* Progreso de la subida */}
          {progress && (
            <div role="status" className="space-y-1.5">
              <p className="text-xs text-[#6b6a65]">
                Subiendo {progress.current} de {progress.total}: {progress.fileName} ({progress.percent}%)
              </p>
              <div
                role="progressbar"
                aria-label="Progreso de la subida"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress.percent}
                className="h-1 overflow-hidden rounded-full bg-admin-active"
              >
                <div
                  className="h-full rounded-full bg-admin-accent transition-[width]"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Problemas con los archivos o con la subida */}
          {problems.length > 0 && (
            <ul role="alert" className="space-y-1 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-xs text-danger">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          )}

          {reorder.error && (
            <p role="alert" className="text-xs text-danger">
              No se pudo cambiar el orden: {reorder.error.message}
            </p>
          )}
        </div>
      </section>

      <section id="video" className={`${adminPanelClass} scroll-mt-24`}>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 px-5 pb-3.5 pt-4">
          <div className="min-w-0 flex-[1_1_200px]">
            <h2 className="text-[15px] font-semibold">Video</h2>
            <p className="mt-0.5 text-[13px] text-[#6b6a65]">
              Opcional. Se muestra después de las imágenes en la ficha del producto.
            </p>
          </div>
          <span className={adminCountChipClass}>{video ? 1 : 0} de 1</span>
        </div>

        <div className="px-5 pb-5">
          {video ? (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <video
                src={video.url}
                controls
                muted
                playsInline
                preload="metadata"
                className="aspect-[4/5] w-[140px] shrink-0 rounded-[10px] border border-[#ecebe6] bg-admin-ink object-cover md:w-[160px]"
              />
              <div className="flex min-w-0 flex-[1_1_200px] flex-col gap-1">
                <span className="truncate font-mono text-xs text-[#4a4945]">{video.url.split('/').pop()}</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      remove.reset()
                      setToDelete(video)
                    }}
                    disabled={isBusy}
                    className={`${adminGhostButtonClass} text-[#b42318]! hover:bg-[#fdecea]!`}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <label
                htmlFor={videoInputId}
                className={`flex min-h-[120px] w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[10px] border-[1.5px] border-dashed border-[#d0cfc9] bg-white p-4 text-center text-[#4a4945] transition-colors hover:border-admin-accent hover:text-admin-accent ${
                  isBusy ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <Video size={22} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-[13px] font-medium">Subir video</span>
                <span className="text-[11px] text-[#8b8a84]">MP4, WebM o MOV · máx. {MAX_VIDEO_MB} MB</span>
              </label>
              <input
                id={videoInputId}
                type="file"
                accept={VIDEO_TYPES.join(',')}
                onChange={(e) => handleInputChange(e, 'video')}
                disabled={isBusy}
                className="sr-only"
              />
            </>
          )}
        </div>
      </section>

      <AdminConfirmDialog
        isOpen={toDelete !== null}
        title={toDelete?.mediaType === 'Video' ? '¿Eliminar el video?' : '¿Eliminar esta imagen?'}
        message={deleteMessage}
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        isLoading={remove.isPending}
        error={remove.error?.message ?? null}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}

export default ProductMediaManager