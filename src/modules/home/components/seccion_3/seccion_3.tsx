import type { CSSProperties } from "react";
import style from "./seccion_3.module.css";
import { icon } from "../../../../core/icons";
import { Link } from "react-router-dom";
import { useImagenCacheada } from "../../../../core/services/cache";
import {
  useProductosController,
  type ProductoUI,
} from "../../controllers/home.controllers";

type CartItem = {
  id: string;
  titulo: string;
  categoria: string;
  marca: string;
  imagen: string;
  cantidad: number;
};

const STORAGE_KEY = "cartItems";

const FILAS = 3;
const COLUMNAS = 5;
const TOTAL_VISIBLES = FILAS * COLUMNAS; // 15 productos máximo

const leerCarrito = (): CartItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/* Tarjeta de producto: la imagen sale del caché (instantánea al recargar)
   y si se actualiza en el panel, solo esta imagen se vuelve a descargar */
const TarjetaProducto = ({
  producto,
  onAgregar,
}: {
  producto: ProductoUI;
  onAgregar: (producto: ProductoUI) => void;
}) => {
  const src = useImagenCacheada(producto.imagenClave, producto.imagen || null);

  return (
    <article className={style.card}>
      {/* Parte superior: imagen */}
      <div className={style.imagenWrap}>
        {!producto.imagenClave ? (
          <div className={style.placeholder}>Sin imagen</div>
        ) : src ? (
          <img
            src={src}
            alt={producto.titulo}
            className={style.imagen}
            loading="lazy"
          />
        ) : (
          <div className={style.placeholder} aria-hidden="true" />
        )}
      </div>

      {/* Parte inferior: marca, nombre y botón de carrito */}
      <div className={style.cardBody}>
        <p className={style.cardMarca}>{producto.marca}</p>
        <h3 className={style.cardTitulo}>{producto.titulo}</h3>

        <div className={style.cardFooter}>
          <button
            className={style.botonCarrito}
            type="button"
            aria-label={`Añadir ${producto.titulo} al carrito`}
            onClick={() => onAgregar(producto)}
          >
            {icon.iconCarrito({ className: style.icon })}
          </button>
        </div>
      </div>
    </article>
  );
};

type Props = {
  /** Categoría marcada en la sección 2 (null = "Todas") */
  categoriaId?: number | null;
};

const Seccion_3 = ({ categoriaId = null }: Props) => {
  // El backend ya filtra por categoría, ordena (importantes primero) y limita a 15
  const { productos, cargando, error } = useProductosController(categoriaId, TOTAL_VISIBLES);

  /* Agrega el producto al carrito y abre el sidebar directamente */
  const agregarAlCarrito = (producto: ProductoUI) => {
    const { titulo, categoria, marca, imagen } = producto;
    const id = String(producto.id);
    const items = leerCarrito();
    const existe = items.some((i) => i.id === id);

    const nextItems: CartItem[] = existe
      ? items.map((i) => (i.id === id ? { ...i, cantidad: i.cantidad + 1 } : i))
      : [...items, { id, titulo, categoria, marca, imagen, cantidad: 1 }];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
    window.dispatchEvent(new Event("cartUpdated")); // contador + lista del sidebar
    window.dispatchEvent(new Event("openCart"));    // abre el cart-sidebar
  };

  return (
    <section className={style.seccion}>
      <div
        className={style.tarjetas}
        style={{ "--columnas": COLUMNAS } as CSSProperties}
      >
        {cargando ? (
          <div className={style.vacio}>Cargando productos…</div>
        ) : error ? (
          <div className={style.vacio}>No se pudieron cargar los productos.</div>
        ) : productos.length > 0 ? (
          productos.map((producto) => (
            <TarjetaProducto
              key={producto.id}
              producto={producto}
              onAgregar={agregarAlCarrito}
            />
          ))
        ) : (
          <div className={style.vacio}>No hay productos disponibles.</div>
        )}
      </div>
      <Link
        to="/product"
        className={style.more}
        onClick={() => window.scrollTo(0, 0)}
      >
        Ver más productos
      </Link>
    </section>
  );
};

export default Seccion_3;