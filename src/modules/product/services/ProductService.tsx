import { DEFAULT_CUSTOMER_ID } from "../../../core/config/customer";

/* ───────────────────────── Tipos de la tienda ───────────────────────── */

export interface MarcaUI {
  id: number;
  titulo: string;
  imagen: string | null; // enlace firmado (caduca)
  claveImagen: string | null; // nombre del archivo: clave estable para el caché
}

export interface CategoriaUI {
  id: number;
  titulo: string;
}

export interface ProductoUI {
  id: number;
  titulo: string;
  categoria: string;
  marca: string;
  precio: number;
  imagen: string | null;
  claveImagen: string | null;
}

/* ───────────────────────── Configuración ───────────────────────── */

// Misma configuración que el home: VITE_SUPABASE_URL y DEFAULT_CUSTOMER_ID.
const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backend-chameleonb2b`;
export const CUST_ID = DEFAULT_CUSTOMER_ID;

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}?cust_id=${CUST_ID}`);
  const data = await res.json().catch(() => null);

  if (!res.ok) throw new Error((data && data.error) || `Error ${res.status}`);
  return data as T;
}

/* ───────────────────────── Servicios (públicos) ───────────────────────── */

interface ProductoApi {
  prdct_id: number;
  prdct_name: string;
  prdct_name_img_link: string | null;
  prdct_price: number;
  ctgry_name: string | null;
  brnd_name: string | null;
  img_url: string | null;
}

interface CategoriaApi {
  ctgry_id: number;
  ctgry_name: string;
}

interface MarcaApi {
  brnd_id: number;
  brnd_name: string;
  brnd_name_img_link: string | null;
  img_url: string | null;
}

export async function listarProductos(): Promise<ProductoUI[]> {
  const { items } = await get<{ items: ProductoApi[] }>("/products");
  return items.map((p) => ({
    id: p.prdct_id,
    titulo: p.prdct_name,
    categoria: p.ctgry_name ?? "",
    marca: p.brnd_name ?? "",
    precio: Number(p.prdct_price),
    imagen: p.img_url,
    claveImagen: p.prdct_name_img_link
      ? `${CUST_ID}/productos/${p.prdct_name_img_link}`
      : null,
  }));
}

export async function listarCategorias(): Promise<CategoriaUI[]> {
  const { items } = await get<{ items: CategoriaApi[] }>("/categories");
  return items.map((c) => ({ id: c.ctgry_id, titulo: c.ctgry_name }));
}

export async function listarMarcas(): Promise<MarcaUI[]> {
  const { items } = await get<{ items: MarcaApi[] }>("/brands");
  return items.map((b) => ({
    id: b.brnd_id,
    titulo: b.brnd_name,
    imagen: b.img_url,
    claveImagen: b.brnd_name_img_link
      ? `${CUST_ID}/marcas/${b.brnd_name_img_link}`
      : null,
  }));
}