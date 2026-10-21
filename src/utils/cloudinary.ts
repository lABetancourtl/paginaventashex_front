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