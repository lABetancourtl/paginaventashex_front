import type { IconType } from 'react-icons'
import {
  FaFacebook,
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaWhatsapp,
  FaYoutube,
} from 'react-icons/fa6'

// ─── Datos generales de la tienda ────────────────────────────
// PROVISIONAL: reemplazar por los datos reales
export const SITE_NAME = 'Tisoro'

// ─── Redes sociales ──────────────────────────────────────────
export interface SocialLink {
  label: string
  href: string
  icon: IconType
}

export const socialLinks: SocialLink[] = [
  { label: 'WhatsApp', href: 'https://wa.me/573000000000', icon: FaWhatsapp },
  { label: 'Facebook', href: 'https://www.facebook.com/', icon: FaFacebook },
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: FaInstagram },
  { label: 'Spotify', href: 'https://open.spotify.com/', icon: FaSpotify },
  { label: 'TikTok', href: 'https://www.tiktok.com/', icon: FaTiktok },
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: FaYoutube },
]

// ─── Enlaces del footer ──────────────────────────────────────
export interface FooterLink {
  label: string
  to: string
}

export const aboutLinks: FooterLink[] = [
  { label: 'Sobre nosotros', to: '/sobre-nosotros' },
  { label: 'Nuestra historia', to: '/nuestra-historia' },
  { label: 'Trabaja con nosotros', to: '/trabaja-con-nosotros' },
]

export const helpLinks: FooterLink[] = [
  { label: 'Cambios y devoluciones', to: '/ayuda/cambios-y-devoluciones' },
  { label: 'Términos y condiciones', to: '/ayuda/terminos-y-condiciones' },
  { label: 'Política de envíos', to: '/ayuda/politica-de-envios' },
  { label: 'Preguntas frecuentes', to: '/ayuda/preguntas-frecuentes' },
]

export const legalLinks: FooterLink[] = [
  { label: 'Política de privacidad', to: '/politica-de-privacidad' },
  { label: 'Tratamiento de datos', to: '/tratamiento-de-datos' },
]

// ─── Contacto ────────────────────────────────────────────────
export const contactInfo = {
  companyName: 'Tisoro S.A.S.',
  nit: '000.000.000-0',
  whatsappDisplay: '300 000 0000',
  whatsappHref: 'https://wa.me/573000000000',
  address: 'Armenia, Quindío, Colombia',
  email: 'contacto@tisoro.com',
}