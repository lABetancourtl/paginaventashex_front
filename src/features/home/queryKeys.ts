export const homeKeys = {
  all: ['home'] as const,
  page: ['home', 'page'] as const,
  sections: ['home', 'sections'] as const,
  items: (sectionId: number) => ['home', 'sections', sectionId, 'items'] as const,
  products: (sectionId: number) => ['home', 'sections', sectionId, 'products'] as const,
}
