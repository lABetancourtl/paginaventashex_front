// Información que una ruta le puede dar a su layout
export interface RouteHandle {
  fullWidth?: boolean          // La página ocupa todo el ancho de la pantalla
  flushTop?: boolean           // El contenido empieza justo debajo del header, sin espacio
  hideHeaderOnScroll?: boolean // El header se esconde al bajar y aparece al subir
  adminFullBleed?: boolean     // Panel admin: la página ocupa todo el espacio, sin márgenes (editores de columnas)
}