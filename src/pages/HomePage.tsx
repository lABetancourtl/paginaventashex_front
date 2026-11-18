import { SITE_NAME } from '../config/site'
import { useHomePage } from '../features/home/hooks/useHomePage'
import HomeSections from '../features/home/components/HomeSections'

// Esqueleto mientras llega GET /api/home: es lo primero que ve cada visitante
function HomeSkeleton() {
  return (
    <div aria-label="Cargando" aria-busy="true" className="flex animate-pulse flex-col gap-12 md:gap-14">
      <div className="px-4 md:px-10">
        <div className="aspect-[4/5] w-full rounded-2xl bg-ink/5 sm:aspect-[16/7]" />
      </div>
      <div className="px-4 md:px-10">
        <div className="mb-4 h-4 w-32 bg-ink/5" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={index >= 2 ? 'hidden md:block' : ''}>
              <div className="aspect-square rounded-xl bg-ink/5" />
              <div className="mt-3 h-3 w-3/4 bg-ink/5" />
              <div className="mt-2 h-3 w-1/3 bg-ink/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HomeMessage({ title, text }: { title: string; text: string }) {
  return (
    <section className="px-4 py-24 text-center">
      <h2 className="text-2xl font-extrabold uppercase tracking-wide">{title}</h2>
      <p className="mt-3 text-ink-muted">{text}</p>
    </section>
  )
}

function HomePage() {
  const { data, isPending, error } = useHomePage()

  let content
  if (isPending) {
    content = <HomeSkeleton />
  } else if (error) {
    content = <HomeMessage title={SITE_NAME} text="No pudimos cargar el inicio. Elige una categoría en el menú." />
  } else if (data.sections.length === 0) {
    // La página aún no está configurada desde el panel
    content = <HomeMessage title={SITE_NAME} text="Elige una categoría en el menú para ver los productos." />
  } else {
    content = <HomeSections sections={data.sections} />
  }

  return (
    <>
      <title>{SITE_NAME}</title>
      <h1 className="sr-only">{SITE_NAME}</h1>
      <div className="pb-14 pt-2 md:pt-6">{content}</div>
    </>
  )
}

export default HomePage
