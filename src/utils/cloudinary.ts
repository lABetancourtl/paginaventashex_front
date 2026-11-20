const UPLOAD_SEGMENT = '/image/upload/'

// Agrega transformaciones a una URL de Cloudinary:
// f_auto = el formato más liviano que soporte el navegador (WebP, AVIF...)
// q_auto = calidad automática, casi sin pérdida visible
// c_limit,w_N = reduce el ancho a N píxeles, sin agrandar imágenes pequeñas
export function cloudinaryUrl(url: string, width: number): string {
  if (!url.includes(UPLOAD_SEGMENT)) return url
  return url.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}f_auto,q_auto,c_limit,w_${width}/`)
}

// Varias versiones de la misma imagen, para que el navegador elija
export function cloudinarySrcSet(url: string, widths: number[]): string {
  return widths.map((width) => `${cloudinaryUrl(url, width)} ${width}w`).join(', ')
}
// Versión recortada a una proporción fija (ej: '4:5'), centrada: c_fill rellena el
// recuadro recortando lo que sobra. Sirve para mostrar una foto horizontal en vertical
export function cloudinaryCropUrl(url: string, width: number, aspect: string): string {
  if (!url.includes(UPLOAD_SEGMENT)) return url
  return url.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}f_auto,q_auto,c_fill,g_center,ar_${aspect},w_${width}/`)
}

// Para URLs que ya traen transformaciones (ej: la versión para celular, recortada a 4:5):
// el ajuste de tamaño y formato va después de ellas, justo antes de la versión (/v123/)
export function cloudinaryResizeAfter(url: string, width: number): string {
  if (!url.includes(UPLOAD_SEGMENT)) return url
  const withVersion = url.replace(/\/(v\d+\/)/, `/f_auto,q_auto,c_limit,w_${width}/$1`)
  return withVersion !== url ? withVersion : cloudinaryUrl(url, width)
}

export function cloudinaryResizeAfterSrcSet(url: string, widths: number[]): string {
  return widths.map((width) => `${cloudinaryResizeAfter(url, width)} ${width}w`).join(', ')
}

export function cloudinaryCropSrcSet(url: string, widths: number[], aspect: string): string {
  return widths.map((width) => `${cloudinaryCropUrl(url, width, aspect)} ${width}w`).join(', ')
}
