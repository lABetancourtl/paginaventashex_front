import { Link } from 'react-router'
import { useScrolledPast } from '../hooks/useScrolledPast'

const SCROLL_THRESHOLD_PX = 30 // Píxeles de scroll para cambiar del nombre a la ballena

// Marca del header: el nombre arriba de la página; la ballena al hacer scroll
function BrandLogo({ className = '' }: { className?: string }) {
  const showLogo = useScrolledPast(SCROLL_THRESHOLD_PX)

  return (
    <Link
      to="/"
      aria-label="Tisoro, inicio"
      data-logo={showLogo ? 'true' : undefined}
      className={`brand-logo focus-visible:outline-white ${className}`}
    >
      <span className="brand-logo-word text-sm font-extrabold uppercase tracking-wider md:text-base">
        Tisoro
      </span>

      <svg className="brand-logo-mark" viewBox="0 0 120 120" aria-hidden="true">
        {/* SVG interno: recorta la ballena a la línea del agua mientras está "sumergida" */}
        <svg x="-20" y="-40" width="160" height="136" viewBox="-20 -40 160 136">
          <g className="brand-logo-whale">
            {/* Grupo aparte para el nado del hover, sin pisar la subida del scroll */}
            <g className="brand-logo-swim">
              <path d="M16 70 C16 50 36 42 56 44 C78 46 90 60 96 66 L104 52 C107 47 113 50 111 56 L106 70 L112 78 C114 83 108 85 104 82 L96 76 C84 90 60 94 42 90 C26 86 16 80 16 70 Z" />
              <g className="brand-logo-spout">
                <path d="M44 38 C44 28 38 24 32 25" />
                <path d="M44 38 C44 28 50 24 56 25" />
              </g>
              <circle className="brand-logo-eye" cx="34" cy="62" r="4.5" />
            </g>
          </g>
        </svg>
        <g className="brand-logo-wave-move">
          <path
            className="brand-logo-wave"
            pathLength="1"
            d="M10 104 C20 96 30 112 40 104 C50 96 60 112 70 104 C80 96 90 112 100 104 C106 99 110 102 112 104"
          />
        </g>
      </svg>
    </Link>
  )
}

export default BrandLogo
