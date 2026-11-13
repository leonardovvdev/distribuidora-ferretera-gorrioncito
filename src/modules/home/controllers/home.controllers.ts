import { useMemo } from "react";
import { DEFAULT_CUSTOMER_ID } from "../../../core/config/customer";
import { useDatosCacheados } from "../../../core/services/cache";
import { obtenerCategorias, obtenerProductos } from "../services/home.service";

/** Forma que usan los componentes del home (misma que CategoriaUI de data.ts) */
export interface CategoriaUI {
  id: number;
  titulo: string;
  imagen: string; // enlace firmado ("" => sin imagen)
  imagenClave: string | null; // identifica la imagen en el caché (cambia si se actualiza)
}

/** Forma que usa la sección de productos (misma que ProductoUI de data.ts) */
export interface ProductoUI {
  id: number;
  titulo: string;
  categoria: string;
  categoriaId: number | null;
  marca: string;
  importante: boolean;
  imagen: string; // enlace firmado ("" => sin imagen); es el que se guarda en el carrito
  imagenClave: string | null; // identifica la imagen en el caché (cambia si se actualiza)
}

/** {cust_id}/{carpeta}/{archivo}: el archivo cambia cada vez que se sube otra imagen */
const claveImagen = (carpeta: string, archivo: string | null) =>
  archivo ? `${DEFAULT_CUSTOMER_ID}/${carpeta}/${archivo}` : null;

export const useCategoriasController = () => {
  const { datos, cargando, error } = useDatosCacheados(
    `categorias:${DEFAULT_CUSTOMER_ID}`,
    () => obtenerCategorias(),
  );

  const categorias = useMemo<CategoriaUI[]>(
    () =>
      (datos ?? []).map((c) => ({
        id: c.ctgry_id,
        titulo: c.ctgry_name,
        imagen: c.img_url ?? "",
        imagenClave: claveImagen("categorias", c.ctgry_name_img_link),
      })),
    [datos],
  );

  return { categorias, cargando, error };
};

export const useProductosController = (
  categoriaId: number | null = null,
  limite?: number,
) => {
  const { datos, cargando, error } = useDatosCacheados(
    `productos:${DEFAULT_CUSTOMER_ID}:${categoriaId ?? "todas"}:${limite ?? "todos"}`,
    () => obtenerProductos(undefined, { categoriaId, limite }),
  );

  const productos = useMemo<ProductoUI[]>(
    () =>
      (datos ?? []).map((p) => ({
        id: p.prdct_id,
        titulo: p.prdct_name,
        categoria: p.ctgry_name ?? "",
        categoriaId: p.ctgry_id,
        marca: p.brnd_name ?? "",
        importante: p.prdct_important,
        imagen: p.img_url ?? "",
        imagenClave: claveImagen("productos", p.prdct_name_img_link),
      })),
    [datos],
  );

  return { productos, cargando, error };
};