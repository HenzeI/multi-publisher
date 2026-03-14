import type { PortalKey } from "./listing";

export interface InternalSubcategory {
  key: string;
  label: string;
}

export interface InternalCategory {
  key: string;
  label: string;
  subcategories: InternalSubcategory[];
}

export interface PortalCategoryMapping {
  portal: PortalKey;
  categoryKey: string;
  subcategoryKey: string;
  portalPath: string[];
}

export const internalCategories: InternalCategory[] = [
  {
    key: "motor",
    label: "Motor",
    subcategories: [
      { key: "coches", label: "Coches" },
      { key: "motos", label: "Motos" },
      { key: "accesorios", label: "Accesorios" },
      { key: "recambios", label: "Recambios" },
    ],
  },
  {
    key: "informatica",
    label: "Informática",
    subcategories: [
      { key: "ordenadores", label: "Ordenadores" },
      { key: "componentes", label: "Componentes" },
      { key: "accesorios", label: "Accesorios" },
    ],
  },
  {
    key: "telefonia",
    label: "Telefonía",
    subcategories: [
      { key: "smartphones", label: "Smartphones" },
      { key: "accesorios", label: "Accesorios" },
      { key: "smartwatch", label: "Smartwatch" },
    ],
  },
  {
    key: "juegos",
    label: "Juegos",
    subcategories: [
      { key: "consolas", label: "Consolas" },
      { key: "videojuegos", label: "Videojuegos" },
      { key: "accesorios", label: "Accesorios" },
    ],
  },
  {
    key: "imagen-sonido",
    label: "Imagen y sonido",
    subcategories: [
      { key: "televisores", label: "Televisores" },
      { key: "altavoces", label: "Altavoces" },
      { key: "auriculares", label: "Auriculares" },
      { key: "camaras", label: "Cámaras" },
    ],
  },
  {
    key: "casa-jardin",
    label: "Casa y jardín",
    subcategories: [
      { key: "muebles", label: "Muebles" },
      { key: "sofas", label: "Sofás" },
      { key: "decoracion", label: "Decoración" },
      { key: "electrodomesticos", label: "Electrodomésticos" },
    ],
  },
  {
    key: "moda",
    label: "Moda y complementos",
    subcategories: [
      { key: "ropa", label: "Ropa" },
      { key: "calzado", label: "Calzado" },
      { key: "bolsos", label: "Bolsos" },
      { key: "accesorios", label: "Accesorios" },
    ],
  },
];

export const portalCategoryMappings: PortalCategoryMapping[] = [
  {
    portal: "milanuncios",
    categoryKey: "motor",
    subcategoryKey: "accesorios",
    portalPath: ["Motor", "Accesorios moto"],
  },
  {
    portal: "wallapop",
    categoryKey: "motor",
    subcategoryKey: "accesorios",
    portalPath: ["Motor", "Accesorios"],
  },
  {
    portal: "milanuncios",
    categoryKey: "juegos",
    subcategoryKey: "consolas",
    portalPath: ["Juegos", "Consolas"],
  },
  {
    portal: "wallapop",
    categoryKey: "juegos",
    subcategoryKey: "consolas",
    portalPath: ["Consolas y videojuegos", "Consolas"],
  },
  {
    portal: "milanuncios",
    categoryKey: "telefonia",
    subcategoryKey: "smartphones",
    portalPath: ["Telefonía", "Móviles y smartphones"],
  },
  {
    portal: "wallapop",
    categoryKey: "telefonia",
    subcategoryKey: "smartphones",
    portalPath: ["Electrónica", "Móviles"],
  },
];

export function getSubcategoriesByCategory(categoryKey?: string) {
  if (!categoryKey) {
    return [];
  }

  const category = internalCategories.find((item) => item.key === categoryKey);
  return category?.subcategories ?? [];
}

export function getPortalCategoryPath(
  portal: PortalKey,
  categoryKey?: string,
  subcategoryKey?: string
): string[] | null {
  if (!categoryKey || !subcategoryKey) {
    return null;
  }

  const mapping = portalCategoryMappings.find(
    (item) =>
      item.portal === portal &&
      item.categoryKey === categoryKey &&
      item.subcategoryKey === subcategoryKey
  );

  return mapping?.portalPath ?? null;
}