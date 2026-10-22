import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { Minus, Plus } from 'lucide-react'
import {
  SITE_NAME,
  aboutLinks,
  contactInfo,
  helpLinks,
  legalLinks,
  socialLinks,
} from '../config/site'
import type { FooterLink } from '../config/site'

const linkClass =
  'block py-1 text-xs font-bold uppercase tracking-wide text-white/80 hover:text-white focus-visible:outline-white'

// ─── Una sección: desplegable en celular, siempre abierta en computador ───
interface FooterSectionProps {
  id: string
  title: string
  children: ReactNode
}

function FooterSection({ id, title, children }: FooterSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className="border-b border-white/15 md:border-0">
      {/* Celular: el título es un botón que despliega la sección */}
      <h3 className="md:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls={id}
          className="flex w-full items-center justify-between py-4 text-sm font-extrabold uppercase tracking-wider focus-visible:outline-white"
        >
          {title}
          {isOpen ? (
            <Minus size={18} strokeWidth={1.5} aria-hidden="true" />
          ) : (
            <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
          )}
        </button>
      </h3>

      {/* Computador: un título normal */}
      <h3 className="mb-3 hidden text-base font-extrabold uppercase tracking-wider md:block">
        {title}
      </h3>

      <div id={id} className={isOpen ? 'pb-4' : 'hidden md:block'}>
        {children}
      </div>
    </section>
  )
}

function FooterLinkList({ links }: { links: FooterLink[] }) {
  return (
    <ul>
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className={linkClass}>
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

// ─── El footer completo ─────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-footer text-white">
      <div className="mx-auto max-w-5xl px-6 pb-8 pt-12 md:pt-16">
        <p className="text-center text-lg font-extrabold uppercase tracking-widest">{SITE_NAME}</p>

        <ul aria-label="Redes sociales" className="mt-6 flex justify-center gap-5">
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${SITE_NAME} en ${label}`}
                className="block p-1 text-white/85 hover:text-white focus-visible:outline-white"
              >
                <Icon size={20} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-10 md:grid md:grid-cols-3 md:gap-10">
          <FooterSection id="footer-about" title="Sobre la marca">
            <FooterLinkList links={aboutLinks} />
          </FooterSection>

          <FooterSection id="footer-help" title="Ayuda">
            <FooterLinkList links={helpLinks} />
          </FooterSection>

          <FooterSection id="footer-contact" title="Contacto">
            <address className="space-y-1 text-xs font-bold uppercase not-italic tracking-wide text-white/80">
              <p>{contactInfo.companyName}</p>
              <p>NIT: {contactInfo.nit}</p>
              <p>
                WhatsApp:{' '}
                <a
                  href={contactInfo.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white focus-visible:outline-white"
                >
                  {contactInfo.whatsappDisplay}
                </a>
              </p>
              <p>{contactInfo.address}</p>
              <p>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="normal-case hover:text-white focus-visible:outline-white"
                >
                  {contactInfo.email}
                </a>
              </p>
            </address>
          </FooterSection>
        </div>
      </div>

      {/* Franja inferior: derechos y enlaces legales */}
      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-5 text-[11px] uppercase tracking-wide text-white/80 md:flex-row md:justify-between">
          <p>
            © {year} {SITE_NAME}. Todos los derechos reservados.
          </p>
          <ul className="flex gap-6">
            {legalLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-white focus-visible:outline-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}

export default Footer