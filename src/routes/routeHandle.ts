// Información que una ruta le puede dar a su layout
export interface RouteHandle {
  fullWidth?: boolean          // La página ocupa todo el ancho de la pantalla
  hideHeaderOnScroll?: boolean // El header se esconde al bajar y aparece al subir
}