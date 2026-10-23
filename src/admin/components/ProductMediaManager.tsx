import { useId, useState } from 'react'
import type { ChangeEvent, DragEvent, ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2, Video } from 'lucide-react'
import ConfirmDialog from '../../components/ConfirmDialog'
import { ApiRequestError } from '../../api/client'
import { cloudinaryUrl } from '../../utils/cloudinary'
import {
  useDeleteProductMedia,
  useReorderProductMedia,
  useUploadProductMedia,
} from '../../features/catalog/hooks/useProductMediaMutations'
import type { MediaKind } from '../../features/catalog/services/productMediaService'
import type { ProductMedia } from '../../features/catalog/types'
import { adminSecondaryButtonClass } from '../adminStyles'

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
  children: ReactNode
}

function TileButton({ label, onClick, disabled = false, hidden = false, children }: TileButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || hidden}
      aria-label={label}
      title={label}
      className={`rounded-md p-1.5 text-ink-muted hover:bg-canvas hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 ${
        hidden ? 'invisible' : ''
      }`}
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
    <div className="space-y-4">
      <p className="text-xs text-ink-muted">
        La primera imagen es la <strong className="text-ink">principal</strong> del catálogo, y la
        segunda aparece al pasar el mouse. Formatos JPG, PNG o WebP, hasta {MAX_IMAGE_MB} MB.
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {images.map((item, index) => (
          <li key={item.id} className="overflow-hidden rounded-lg border border-line bg-card">
            <div className="relative aspect-square bg-canvas">
              <img
                src={cloudinaryUrl(item.url, 400)}
                alt={`Imagen ${index + 1}`}
                loading="lazy"
                className="size-full object-contain"
              />
              {index < 2 && (
                <span className="absolute left-2 top-2 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  {index === 0 ? 'Principal' : 'Hover'}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line px-1 py-1">
              <div className="flex">
                <TileButton
                  label="Mover a la izquierda"
                  onClick={() => moveTo(item, images[index - 1])}
                  hidden={index === 0}
                  disabled={isBusy}
                >
                  <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
                </TileButton>
                <TileButton
                  label="Mover a la derecha"
                  onClick={() => moveTo(item, images[index + 1])}
                  hidden={index === images.length - 1}
                  disabled={isBusy}
                >
                  <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
                </TileButton>
              </div>
              <div className="flex">
                <TileButton
                  label="Hacer principal"
                  onClick={() => moveTo(item, images[0])}
                  hidden={index === 0}
                  disabled={isBusy}
                >
                  <Star size={16} strokeWidth={1.5} aria-hidden="true" />
                </TileButton>
                <TileButton
                  label="Eliminar imagen"
                  onClick={() => {
                    remove.reset()
                    setToDelete(item)
                  }}
                  disabled={isBusy}
                >
                  <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
                </TileButton>
              </div>
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
              className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 text-center text-xs transition-colors ${
                isDragging ? 'border-primary bg-primary/5 text-primary' : 'border-line text-ink-muted hover:border-ink/40'
              } ${isBusy ? 'pointer-events-none opacity-50' : ''}`}
            >
              <ImagePlus size={24} strokeWidth={1.25} aria-hidden="true" />
              <span>
                <strong className="text-ink">Elige imágenes</strong> o arrástralas aquí
              </span>
              <span>Quedan {remaining}</span>
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
          <p className="text-xs text-ink-muted">
            Subiendo {progress.current} de {progress.total}: {progress.fileName} ({progress.percent}%)
          </p>
          <div
            role="progressbar"
            aria-label="Progreso de la subida"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress.percent}
            className="h-1.5 overflow-hidden rounded-full bg-line"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Problemas con los archivos o con la subida */}
      {problems.length > 0 && (
        <ul role="alert" className="space-y-1 rounded-lg bg-danger/5 px-3 py-2 text-xs text-danger">
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

      {/* El video */}
      <div className="border-t border-line pt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide">Video (opcional)</p>
        {video ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <video
              src={video.url}
              controls
              muted
              playsInline
              preload="metadata"
              className="aspect-video w-full rounded-lg bg-ink sm:w-72"
            />
            <button
              type="button"
              onClick={() => {
                remove.reset()
                setToDelete(video)
              }}
              disabled={isBusy}
              className={adminSecondaryButtonClass}
            >
              <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
              Eliminar video
            </button>
          </div>
        ) : (
          <>
            <label
              htmlFor={videoInputId}
              className={`${adminSecondaryButtonClass} cursor-pointer ${isBusy ? 'pointer-events-none opacity-50' : ''}`}
            >
              <Video size={14} strokeWidth={1.5} aria-hidden="true" />
              Subir video
            </label>
            <input
              id={videoInputId}
              type="file"
              accept={VIDEO_TYPES.join(',')}
              onChange={(e) => handleInputChange(e, 'video')}
              disabled={isBusy}
              className="sr-only"
            />
            <p className="mt-2 text-xs text-ink-muted">MP4, WebM o MOV, hasta {MAX_VIDEO_MB} MB.</p>
          </>
        )}
      </div>

      <ConfirmDialog
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