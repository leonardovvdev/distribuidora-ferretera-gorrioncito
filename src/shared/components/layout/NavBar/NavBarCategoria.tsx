import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import style from "./NavBarCategoria.module.css";
import { icon } from "../../../../core/icons";

import {
  CATEGORIAS_MOCK,
  PRODUCTOS_MOCK,
  MARCAS_MOCK,
  type ProductoUI,
} from "../../../../modules/home/data";

/* ── Tipos ───────────────────────────────────────────── */

type CartItem = {
  id: string | number;
  titulo: string;
  categoria: string;
  marca: string;
  imagen: string;
  cantidad: number;
};

// "imagen" es opcional: si tu CATEGORIAS_MOCK la trae, se muestra como ícono
type CategoriaUI = { id: string | number; titulo: string };

/* ── Constantes ──────────────────────────────────────── */

const STORAGE_KEY = "cartItems";
const WHATSAPP_NUMBER = "51915144663";

const normalizar = (texto: string) => texto.trim().toLowerCase();

// Categorías ordenadas alfabéticamente
const CATEGORIAS = [...(CATEGORIAS_MOCK as CategoriaUI[])].sort((a, b) =>
  a.titulo.localeCompare(b.titulo)
);

const IMAGEN_POR_MARCA = new Map(MARCAS_MOCK.map((m) => [m.titulo, m.imagen]));

const leerCarrito = (): CartItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* ── Íconos ──────────────────────────────────────────── */

const IconoLista = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="M4 5h4v4H4V5Zm6 1h10v2H10V6ZM4 10h4v4H4v-4Zm6 1h10v2H10v-2ZM4 15h4v4H4v-4Zm6 1h10v2H10v-2Z"
    />
  </svg>
);

const IconoEtiqueta = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M3.5 3.5h8.2a1 1 0 0 1 .7.3l8.1 8.1a1 1 0 0 1 0 1.4l-7.2 7.2a1 1 0 0 1-1.4 0L3.8 12.4a1 1 0 0 1-.3-.7V3.5Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="1.4" fill="currentColor" />
  </svg>
);

const IconoEstrella = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="currentColor"
      d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5-5.9-3.1-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5Z"
    />
  </svg>
);

const IconoCerrar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M6 6l12 12M18 6 6 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Componente ──────────────────────────────────────── */

export const NavBarCategoria = () => {
  const [abierto, setAbierto] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState(
    CATEGORIAS[0]?.titulo ?? ""
  );
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoUI | null>(null);

  /* Productos de la categoría activa */
  const productos = useMemo(
    () =>
      PRODUCTOS_MOCK.filter(
        (p) => normalizar(p.categoria) === normalizar(categoriaActiva)
      ),
    [categoriaActiva]
  );

  /* Marcas presentes en esos productos */
  const marcas = useMemo(() => {
    const nombres = new Set<string>();
    productos.forEach((p) => p.marca && nombres.add(p.marca));
    return Array.from(nombres).map((nombre) => ({
      nombre,
      imagen: IMAGEN_POR_MARCA.get(nombre) ?? "",
    }));
  }, [productos]);

  /* Escape cierra (primero el modal de compra) y se bloquea el scroll de fondo */
  useEffect(() => {
    if (!abierto && !productoSeleccionado) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (productoSeleccionado) setProductoSeleccionado(null);
      else setAbierto(false);
    };
    const overflowPrevio = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto, productoSeleccionado]);

  const cerrar = () => setAbierto(false);

  const irA = () => {
    window.scrollTo({ top: 0 });
    cerrar();
  };

  /* Carrito */
  const anadirAlCarrito = () => {
    if (!productoSeleccionado) return;

    const id = String(productoSeleccionado.id);
    const { titulo, categoria: cat, marca, imagen } = productoSeleccionado;
    const items = leerCarrito();
    const existe = items.some((item) => String(item.id) === id);

    const nextItems: CartItem[] = existe
      ? items.map((item) =>
          String(item.id) === id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
      : [...items, { id, titulo, categoria: cat, marca, imagen, cantidad: 1 }];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cartUpdated"));

    setProductoSeleccionado(null);
    cerrar();
  };

  /* WhatsApp */
  const comprarPorWhatsapp = () => {
    if (!productoSeleccionado) return;

    const { titulo, marca, categoria: cat } = productoSeleccionado;
    const mensaje = [
      "Hola, quiero comprar este producto:",
      titulo,
      `Marca: ${marca}`,
      `Categoria: ${cat}`,
    ].join("\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* ── Panel de categorías ── */
  const panel = (
    <div className={style.overlay} onClick={cerrar}>
      <div
        className={style.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="categorias-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className={style.cerrar}
          onClick={cerrar}
          aria-label="Cerrar categorías"
        >
          <IconoCerrar className={style.cerrarIcono} />
        </button>

        <div className={style.panel}>
          {/* Categorías */}
          <aside className={style.sidebar}>
            <div className={style.sidebarEncabezado}>
              <IconoEtiqueta className={style.sidebarIcono} />
              <h2 id="categorias-titulo" className={style.sidebarTitulo}>
                Categorías
              </h2>
            </div>

            <nav aria-label="Categorías">
              <ul className={style.listaCategorias}>
                {CATEGORIAS.map((cat) => {
                  const activa =
                    normalizar(cat.titulo) === normalizar(categoriaActiva);

                  return (
                    <li key={cat.id}>
                     <button
                        type="button"
                        className={`${style.categoriaItem} ${activa ? style.categoriaActiva : ""}`}
                        aria-current={activa ? "true" : undefined}
                        onClick={() => setCategoriaActiva(cat.titulo)}
                      >
                        <span className={style.categoriaNombre}>{cat.titulo}</span>
                        <span className={style.chevron} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Productos */}
          <section className={style.contenido}>
           <header className={style.contenidoEncabezado}>
            <div className={style.contenidoTitulos}>
              <h3 className={style.contenidoTitulo}>{categoriaActiva}</h3>
              <p className={style.contenidoTexto}>
                Encuentra todo lo que necesitas para tus proyectos.
              </p>
            </div>
            {productos.length > 0 && (
              <Link
                to={`/product?categoria=${encodeURIComponent(categoriaActiva)}`}
                className={style.verTodo}
                onClick={irA}
              >
                Ver todo ({productos.length})
              </Link>
            )}
          </header>

            {productos.length > 0 ? (
              <div className={style.gridProductos}>
                {productos.map((producto) => (
                  <article key={producto.id} className={style.productoCard}>
                    <div className={style.productoImagenWrap}>
                      {producto.imagen ? (
                        <img
                          src={producto.imagen}
                          alt={producto.titulo}
                          className={style.productoImagen}
                          loading="lazy"
                        />
                      ) : (
                        <div className={style.productoPlaceholder}>
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <h4 className={style.productoTitulo}>{producto.titulo}</h4>

                    <button
                      type="button"
                      className={style.loQuieroButton}
                      onClick={() => setProductoSeleccionado(producto)}
                    >
                      {icon.iconCarrito({ className: style.loQuieroIcono })}
                      Lo quiero
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <p className={style.vacio}>
                Aún no hay productos en esta categoría.
              </p>
            )}
          </section>

          {/* Marcas de la categoría */}
          <aside className={style.marcas}>
            <h3 className={style.marcasTitulo}>
              <IconoEstrella className={style.marcasIcono} />
              Marcas
            </h3>
            <p className={style.marcasTexto}>
              Aliados con presencia consolidada en el sector.
            </p>

            {marcas.length > 0 ? (
              <ul className={style.marcasLista}>
                {marcas.map((marca) => (
                  <li key={marca.nombre}>
                    <Link
                      to={`/product?marca=${encodeURIComponent(marca.nombre)}`}
                      className={style.marcaItem}
                      aria-label={`Ver productos de ${marca.nombre}`}
                      onClick={irA}
                    >
                      {marca.imagen ? (
                        <img
                          src={marca.imagen}
                          alt={marca.nombre}
                          className={style.marcaImg}
                        />
                      ) : (
                        <span className={style.marcaTexto}>{marca.nombre}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={style.marcasTexto}>Sin marcas para mostrar.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );

  /* ── Modal de compra ── */
  const modalCompra = productoSeleccionado && (
    <div
      className={style.modalOverlay}
      onClick={() => setProductoSeleccionado(null)}
    >
      <div
        className={style.modalCompra}
        role="dialog"
        aria-modal="true"
        aria-labelledby="compra-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="compra-titulo" className={style.modalTitulo}>
          ¿Cómo deseas continuar?
        </h3>
        <p className={style.modalTexto}>
          Elige una opción para poder completar tu compra
        </p>

        <button
          type="button"
          className={style.modalBotonNaranja}
          onClick={anadirAlCarrito}
        >
          {icon.iconCarrito({ className: style.modalIcono })}
          <span>Añadir al carrito</span>
        </button>

        <button
          type="button"
          className={style.modalBotonVerde}
          onClick={comprarPorWhatsapp}
        >
          {icon.iconWhatsApp({ className: style.modalIcono })}
          <span>Realizar la compra</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className={style.trigger}
        aria-haspopup="dialog"
        aria-expanded={abierto}
        onClick={() => setAbierto(true)}
      >
        <IconoLista className={style.triggerIcono} />
        Categorías
      </button>

      {abierto && createPortal(panel, document.body)}
      {modalCompra && createPortal(modalCompra, document.body)}
    </>
  );
};