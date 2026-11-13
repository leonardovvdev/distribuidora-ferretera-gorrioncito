import { useMemo } from "react";
import styles from "./seccion_3.module.css";
import { icon } from "../../../../core/icons";
import { useImagenCacheada } from "../../../../core/services/cache";
import type { ProductoUI } from "../../services/ProductService";

type Props = {
  productos: ProductoUI[];
  cargando?: boolean;
  error?: string | null;
  categoriasSeleccionadas?: string[];
  marcasSeleccionadas?: string[];
  busquedaGeneral?: string;
  onEliminarCategoria?: (categoria: string) => void;
  onEliminarMarca?: (marca: string) => void;
  onLimpiarFiltros?: () => void;
  productosVisibles?: number;
  onCargarMas?: () => void;
  onAbrirFiltros?: () => void;
};

/* Mismo tipo que usa cart-sidebar.tsx (id como string) */
type CartItem = {
  id: string;
  titulo: string;
  categoria: string;
  marca: string;
  imagen: string;
  cantidad: number;
};

type FiltroActivo = {
  tipo: "categoria" | "marca";
  nombre: string;
};

const STORAGE_KEY = "cartItems";

const normalizar = (texto: string) =>
  texto.trim().toLowerCase().replace(/es$/i, "").replace(/s$/i, "");

const leerCarrito = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Imagen del producto: usa el caché del navegador. */
function ImagenProducto({ producto }: { producto: ProductoUI }) {
  const src = useImagenCacheada(producto.claveImagen, producto.imagen);

  return src ? (
    <img src={src} alt={producto.titulo} className={styles.imagen} loading="lazy" />
  ) : (
    <div className={styles.placeholder}>Sin imagen</div>
  );
}

export default function Seccion_3({
  productos,
  cargando = false,
  error = null,
  categoriasSeleccionadas = [],
  marcasSeleccionadas = [],
  busquedaGeneral = "",
  onEliminarCategoria = () => {},
  onEliminarMarca = () => {},
  onLimpiarFiltros,
  productosVisibles = 12,
  onCargarMas = () => {},
  onAbrirFiltros = () => {},
}: Props) {
  /* ── Filtrado local ── */
  const productosFiltrados = useMemo(() => {
    let lista = productos;

    if (categoriasSeleccionadas.length > 0) {
      const cats = categoriasSeleccionadas.map((c) => c.toLowerCase());
      lista = lista.filter((p) => cats.includes(p.categoria.toLowerCase()));
    }

    if (marcasSeleccionadas.length > 0) {
      const marcas = marcasSeleccionadas.map((m) => m.toLowerCase());
      lista = lista.filter((p) => marcas.includes(p.marca.toLowerCase()));
    }

    if (!busquedaGeneral.trim()) return lista;

    const query = normalizar(busquedaGeneral);
    const palabras = query.split(/\s+/).map(normalizar);

    const puntaje = (nombre: string): number => {
      const n = nombre.toLowerCase();
      const nNorm = normalizar(n);

      if (n === query) return 100;
      if (n.startsWith(query)) return 90;
      if (nNorm.startsWith(query)) return 85;
      if (n.includes(query)) return 70;
      if (nNorm.includes(query)) return 65;
      if (palabras.every((p) => nNorm.includes(p))) return 60;

      const coincidencias = palabras.filter((p) => nNorm.includes(p)).length;
      return coincidencias > 0 ? 50 + (coincidencias / palabras.length) * 9 : 0;
    };

    return lista
      .map((producto) => ({ producto, score: puntaje(producto.titulo) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ producto }) => producto);
  }, [productos, categoriasSeleccionadas, marcasSeleccionadas, busquedaGeneral]);

  const productosRenderizados = useMemo(
    () => productosFiltrados.slice(0, productosVisibles),
    [productosFiltrados, productosVisibles]
  );

  /* Categorías y marcas juntas en una sola lista de chips */
  const filtrosActivos: FiltroActivo[] = [
    ...categoriasSeleccionadas.map((nombre) => ({ tipo: "categoria" as const, nombre })),
    ...marcasSeleccionadas.map((nombre) => ({ tipo: "marca" as const, nombre })),
  ];

  const quitarFiltro = ({ tipo, nombre }: FiltroActivo) =>
    tipo === "categoria" ? onEliminarCategoria(nombre) : onEliminarMarca(nombre);

  /* Agrega el producto al carrito y abre el sidebar directamente */
  const agregarAlCarrito = (producto: ProductoUI) => {
    const { titulo, categoria, marca } = producto;
    const imagen = producto.imagen ?? "";
    const id = String(producto.id);
    const items = leerCarrito();
    const existe = items.some((i) => i.id === id);

    const nextItems: CartItem[] = existe
      ? items.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...items, { id, titulo, categoria, marca, imagen, cantidad: 1 }];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cartUpdated"));
    window.dispatchEvent(new Event("openCart"));
  };

  return (
    <section className={styles.seccion}>
      {/* Botón filtrar (solo mobile) */}
      <button type="button" className={styles.botonFiltrar} onClick={onAbrirFiltros}>
        Filtrar
      </button>

      {/* Filtros activos (solo desktop) */}
      {filtrosActivos.length > 0 && (
        <div className={styles.resumen}>
          <div className={styles.resumenCabecera}>
            <p className={styles.resumenTitulo}>
              Filtros activos ({filtrosActivos.length})
            </p>

            {onLimpiarFiltros && (
              <button
                type="button"
                className={styles.limpiarTodo}
                onClick={onLimpiarFiltros}
              >
                Limpiar todo
              </button>
            )}
          </div>

          <div className={styles.chips}>
            {filtrosActivos.map((filtro) => (
              <span key={`${filtro.tipo}-${filtro.nombre}`} className={styles.chip}>
                {filtro.nombre}
                <button
                  type="button"
                  className={styles.chipQuitar}
                  onClick={() => quitarFiltro(filtro)}
                  aria-label={`Quitar filtro ${filtro.nombre}`}
                >
                  <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      d="M2 2l8 8M10 2L2 10"
                    />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grid de productos */}
      <div className={styles.cuerpo}>
        {productosFiltrados.length === 0 ? (
          <div className={styles.vacio}>
            {cargando
              ? "Cargando productos..."
              : error
                ? error
                : busquedaGeneral.trim() && filtrosActivos.length === 0
                  ? `No se encontraron productos para "${busquedaGeneral}".`
                  : "No hay productos disponibles."}
          </div>
        ) : (
          <>
            <div className={styles.gridProductos}>
              {productosRenderizados.map((producto) => (
                <article key={producto.id} className={styles.card}>
                  {/* Parte superior: imagen */}
                  <div className={styles.imagenWrap}>
                    <ImagenProducto producto={producto} />
                  </div>

                  {/* Parte inferior: marca, nombre y botón de carrito */}
                  <div className={styles.cardBody}>
                    <p className={styles.cardMarca}>{producto.marca}</p>
                    <h3 className={styles.cardTitulo}>{producto.titulo}</h3>

                    <div className={styles.cardFooter}>
                      <button
                        className={styles.botonCarrito}
                        type="button"
                        aria-label={`Añadir ${producto.titulo} al carrito`}
                        onClick={() => agregarAlCarrito(producto)}
                      >
                        {icon.iconCarrito({ className: styles.icon })}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {productosFiltrados.length > productosRenderizados.length && (
              <div className={styles.acciones}>
                <button type="button" className={styles.cargarMas} onClick={onCargarMas}>
                  Ver más productos
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}