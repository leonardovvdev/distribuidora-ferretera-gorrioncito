import { DEFAULT_CUSTOMER_ID } from "../../../core/config/customer";

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backend-chameleonb2b`;

/** Categoría tal como la devuelve GET /categories */
export interface CategoriaApi {
  ctgry_id: number;
  cust_id: number;
  ctgry_name: string;
  ctgry_name_img_link: string | null;
  ctgry_important: boolean;
  img_url: string | null;
}

/** Producto tal como lo devuelve GET /products */
export interface ProductoApi {
  prdct_id: number;
  ctgry_id: number | null;
  brnd_id: number | null;
  cust_id: number;
  prdct_name: string;
  prdct_name_img_link: string | null;
  prdct_important: boolean;
  prdct_price: number;
  brnd_name: string | null;
  ctgry_name: string | null;
  img_url: string | null;
}


/** Categorías de la tienda (cliente por defecto) */
export const obtenerCategorias = (custId: number = DEFAULT_CUSTOMER_ID) =>
  obtenerItems<CategoriaApi>("categories", custId);

/** GET genérico a la Edge Function: devuelve data.items o lanza Error con el mensaje del backend */
const obtenerItems = async <T>(
  ruta: string,
  custId: number,
  params: Record<string, string | number | undefined> = {},
): Promise<T[]> => {
  const query = new URLSearchParams({ cust_id: String(custId) });
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined) query.set(clave, String(valor));
  }

  const res = await fetch(`${API_URL}/${ruta}?${query}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Error ${res.status}`);
  }

  const data = (await res.json()) as { items: T[] };
  return data.items;
};

export interface OpcionesProductos {
  categoriaId?: number | null; // null o undefined = todas las categorías
  limite?: number;             // máximo de productos
}

/** Productos de la tienda (cliente por defecto), con filtro y límite opcionales */
export const obtenerProductos = (
  custId: number = DEFAULT_CUSTOMER_ID,
  { categoriaId, limite }: OpcionesProductos = {},
) =>
  obtenerItems<ProductoApi>("products", custId, {
    ctgry_id: categoriaId ?? undefined,
    limit: limite,
  });