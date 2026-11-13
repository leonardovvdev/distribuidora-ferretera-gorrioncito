import { DEFAULT_CUSTOMER_ID } from "../config/customer";

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backend-chameleonb2b`;

export type ResultadoBusqueda =
  | { tipo: "marca";         valor: string }
  | { tipo: "categoria";     valor: string }
  | { tipo: "producto";      valor: string }
  | { tipo: "sin_resultado"; valor: string };

/** Forma mínima de lo que devuelven GET /brands y GET /categories */
interface MarcaApi {
  brnd_name: string;
}

interface CategoriaApi {
  ctgry_name: string;
}

/** GET público a la Edge Function: devuelve data.items o lanza Error con el mensaje del backend */
const obtenerItems = async <T>(ruta: string): Promise<T[]> => {
  const res = await fetch(`${API_URL}/${ruta}?cust_id=${DEFAULT_CUSTOMER_ID}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Error ${res.status}`);
  }

  const data = (await res.json()) as { items: T[] };
  return data.items;
};

const normalizar = (texto: string | null | undefined) =>
  (texto ?? "").trim().toLowerCase();

export const clasificarBusquedaCatalogo = async (
  texto: string,
): Promise<ResultadoBusqueda> => {
  const textoBuscado = normalizar(texto);

  const [marcas, categorias] = await Promise.all([
    obtenerItems<MarcaApi>("brands"),
    obtenerItems<CategoriaApi>("categories"),
  ]);

  const marcaEncontrada = marcas.find(
    (m) => normalizar(m.brnd_name) === textoBuscado,
  );
  if (marcaEncontrada) {
    return { tipo: "marca", valor: marcaEncontrada.brnd_name };
  }

  const categoriaEncontrada = categorias.find(
    (c) => normalizar(c.ctgry_name) === textoBuscado,
  );
  if (categoriaEncontrada) {
    return { tipo: "categoria", valor: categoriaEncontrada.ctgry_name };
  }

  // Todo lo demás → búsqueda general por nombre de producto
  return { tipo: "producto", valor: textoBuscado };
};