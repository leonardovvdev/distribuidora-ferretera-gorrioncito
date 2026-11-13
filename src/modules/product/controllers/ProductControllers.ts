import { useDatosCacheados } from "../../../core/services/cache";
import {
  CUST_ID,
  listarCategorias,
  listarMarcas,
  listarProductos,
  type CategoriaUI,
  type MarcaUI,
  type ProductoUI,
} from "../services/ProductService";

const SIN_PRODUCTOS: ProductoUI[] = [];
const SIN_CATEGORIAS: CategoriaUI[] = [];
const SIN_MARCAS: MarcaUI[] = [];

/** Productos, categorías y marcas de la tienda, con caché (se pintan al instante y se revalidan). */
export function useTienda() {
  // Prefijo "tienda:" para no chocar con las claves del home (otra forma de datos).
  const productos = useDatosCacheados<ProductoUI[]>(`tienda:productos:${CUST_ID}`, listarProductos);
  const categorias = useDatosCacheados<CategoriaUI[]>(`tienda:categorias:${CUST_ID}`, listarCategorias);
  const marcas = useDatosCacheados<MarcaUI[]>(`tienda:marcas:${CUST_ID}`, listarMarcas);

  return {
    productos: productos.datos ?? SIN_PRODUCTOS,
    categorias: categorias.datos ?? SIN_CATEGORIAS,
    marcas: marcas.datos ?? SIN_MARCAS,
    cargando: productos.cargando,
    error: productos.error,
  };
}