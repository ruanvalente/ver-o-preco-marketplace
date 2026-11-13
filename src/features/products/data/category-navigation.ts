/**
 * Navegação de categorias.
 *
 * Mantida separada do conteúdo visual para que o Client Component da barra de
 * categorias não carregue ícones, mocks de produtos e demais dados de
 * apresentação no bundle do navegador.
 */

export type CategoryNavigationItem = {
  id: string
  label: string
  href: string
}

export const categoryNavigationItems: CategoryNavigationItem[] = [
  { id: "todas", label: "Todas as categorias", href: "/" },
  {
    id: "celulares",
    label: "Celulares & Telefonia",
    href: "/products?category=celulares",
  },
  {
    id: "eletronicos",
    label: "Eletrônicos",
    href: "/products?category=eletronicos",
  },
  {
    id: "informatica",
    label: "Informática",
    href: "/products?category=informatica",
  },
  {
    id: "casa-moveis",
    label: "Casa & Móveis",
    href: "/products?category=casa-moveis",
  },
  { id: "veiculos", label: "Veículos", href: "/products?category=veiculos" },
  {
    id: "moda",
    label: "Moda & Beleza",
    href: "/products?category=moda",
  },
  {
    id: "esportes",
    label: "Esportes & Lazer",
    href: "/products?category=esportes",
  },
]

export const myListingsNavigationItem: CategoryNavigationItem = {
  id: "meus-anuncios",
  label: "Meus anúncios",
  href: "/dashboard",
}
