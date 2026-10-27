import { Blobatar } from '@blobatar/react'
import 'blobatar/motion.css'
import type { ComponentProps } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

// El tipo de la prop "animate" tal como lo define la librería
type AvatarAnimation = ComponentProps<typeof Blobatar>['animate']

interface UserAvatarProps {
  seed: string
  size?: number
  className?: string
  animate?: AvatarAnimation // Sin animación por defecto
}

function UserAvatar({ seed, size = 24, className = '', animate }: UserAvatarProps) {
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      <Blobatar
        name={seed.trim().toLowerCase()}
        size={size}
        // Si el sistema pide reducir el movimiento, el avatar se queda quieto
        animate={prefersReducedMotion ? undefined : animate}
      />
    </span>
  )
}

export default UserAvatar