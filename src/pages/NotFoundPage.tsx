import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <section>
      <h2>Página no encontrada</h2>
      <p>La dirección que buscas no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </section>
  )
}

export default NotFoundPage