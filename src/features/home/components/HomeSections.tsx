import HomeBanner from './HomeBanner'
import HomeShelf from './HomeShelf'
import type { HomeSectionPublic } from '../types'

interface HomeSectionsProps {
  sections: HomeSectionPublic[]
}

// Pinta los bloques en el orden recibido, eligiendo el componente por tipo
function HomeSections({ sections }: HomeSectionsProps) {
  return (
    <div className="flex flex-col gap-12 md:gap-14">
      {sections.map((section, index) =>
        section.type === 'Banner' ? (
          section.items.length > 0 && <HomeBanner key={section.id} items={section.items} isFirst={index === 0} />
        ) : (
          section.products.length > 0 && (
            <HomeShelf
              key={section.id}
              title={section.title}
              viewAllSlug={section.viewAllCategorySlug}
              viewAllName={section.viewAllCategoryName}
              products={section.products}
            />
          )
        ),
      )}
    </div>
  )
}

export default HomeSections
