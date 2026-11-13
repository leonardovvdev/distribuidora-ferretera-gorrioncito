import { useEffect, useMemo, useState } from "react";
import styles from "./cart-sidebar.module.css";
// ⚠ Ajusta estas dos rutas a donde viven tus archivos
import { useDatosCacheados, useImagenCacheada } from "../../../../core/services/cache";
import { obtenerProductos, type ProductoApi } from "../../../../modules/home/services/home.service";

const STORAGE_KEY = "cartItems";
const WHATSAPP_NUMBER = "51942055324";
const UN_DIA_MS = 24 * 60 * 60 * 1000;

/* Mismo tipo que usa seccion_1.tsx */
export interface CartItem {
  id: string;
  titulo: string;
  categoria: string;
  marca: string;
  imagen: string; // URL guardada al agregar: puede estar vencida (enlace firmado o blob:)
  cantidad: number;
  precio?: number; // opcional: si existe se muestra precio y subtotal
}

interface CartSidebarProps {
  abierto?: boolean;
  onCerrar?: () => void;
}

const leerCarrito = (): CartItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const armarMensaje = (lista: CartItem[]) =>
  [
    "Hola, quiero cotizar los siguientes productos:",
    "",
    ...lista.map(
      (item) =>
        `• ${item.titulo} (${item.categoria}) — cantidad: ${item.cantidad}`
    ),
  ].join("\n");

const formatoSoles = (n: number) => `S/ ${n.toFixed(2)}`;

/* ---------------------------------------------------------
   Imagen de un ítem del carrito.
   La URL que se guardó en localStorage al agregar el producto es un enlace
   firmado que vence (o un blob: que muere al cerrar la pestaña), por eso al
   día siguiente aparecía rota. Aquí se usa el producto actual (enlace firmado
   nuevo + nombre de archivo) y la imagen sale del Cache Storage si ya se
   descargó. La URL guardada solo queda como último recurso.
--------------------------------------------------------- */
function ImagenItem({ item, producto }: { item: CartItem; producto?: ProductoApi }) {
  const archivo = producto?.prdct_name_img_link ?? null;
  const cacheada = useImagenCacheada(
    archivo ? `producto:${archivo}` : null,
    producto?.img_url ?? null
  );
  const [fallo, setFallo] = useState(false);

  const fuente = cacheada || (producto ? "" : item.imagen);

  // Si llega una URL nueva (p. ej. el enlace firmado recién renovado), reintenta
  useEffect(() => setFallo(false), [fuente]);

  if (!fuente || fallo) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          placeItems: "center",
          fontSize: 12,
          color: "#94a3b8",
          textAlign: "center",
        }}
      >
        Sin imagen
      </div>
    );
  }

  return <img src={fuente} alt={item.titulo} onError={() => setFallo(true)} />;
}

export default function CartSidebar({
  abierto = false,
  onCerrar,
}: CartSidebarProps) {
  const [items, setItems] = useState<CartItem[]>(leerCarrito);

  /* Productos actuales (con caché): sirven para renovar las imágenes del carrito */
  const { datos: productos } = useDatosCacheados<ProductoApi[]>(
    "carrito-productos",
    obtenerProductos,
    UN_DIA_MS
  );
  const productoPorId = useMemo(
    () => new Map((productos ?? []).map((p) => [String(p.prdct_id), p])),
    [productos]
  );

  /* Mantener sincronizado con el carrito (NavBar, /cart, botón "añadir") */
  useEffect(() => {
    const actualizar = () => setItems(leerCarrito());
    window.addEventListener("cartUpdated", actualizar);
    window.addEventListener("storage", actualizar);
    return () => {
      window.removeEventListener("cartUpdated", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, []);

  /* Escape para cerrar + bloquear scroll de la página mientras está abierto */
  useEffect(() => {
    if (!abierto) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar?.();
    };
    const overflowPrevio = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto, onCerrar]);

  /* Guarda y avisa al NavBar y a la página /cart */
  const guardar = (nuevos: CartItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos));
    setItems(nuevos);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const cambiarCantidad = (id: string, delta: number) =>
    guardar(
      items.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(1, item.cantidad + delta) }
          : item
      )
    );

  const eliminar = (id: string) =>
    guardar(items.filter((item) => item.id !== id));

  const totalUnidades = useMemo(
    () => items.reduce((acc, i) => acc + i.cantidad, 0),
    [items]
  );

  const hayPrecios = useMemo(
    () => items.some((i) => typeof i.precio === "number"),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + (i.precio ?? 0) * i.cantidad, 0),
    [items]
  );

  /* Abre WhatsApp con todos los productos del carrito */
  const cotizarPorWhatsApp = () => {
    if (items.length === 0) return;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(armarMensaje(items))}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      {abierto && <div className={styles.overlay} onClick={onCerrar} />}

      <aside
        className={`${styles.sidebar} ${abierto ? styles.abierto : ""}`}
        aria-hidden={!abierto}
        aria-label="Carrito"
      >
        {/* ---------- Cabecera ---------- */}
        <header className={styles.header}>
          <div className={styles.headerTitulo}>
            <h3>Tu carrito</h3>
            <span className={styles.contador}>
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </span>
          </div>
          <button
            type="button"
            className={styles.btnX}
            onClick={onCerrar}
            aria-label="Cerrar carrito"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </header>

        {/* ---------- Lista ---------- */}
        <div className={styles.lista}>
          {items.length === 0 && (
            <div className={styles.vacio}>
              <svg viewBox="0 0 24 24" width="48" height="48" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM1 2v2h2l3.6 7.6-1.4 2.4A2 2 0 0 0 7 17h12v-2H7.4l1.1-2h7.5a2 2 0 0 0 1.7-1l3.6-6.5A1 1 0 0 0 20.4 4H5.2l-.9-2H1Z"
                />
              </svg>
              <p>Tu carrito está vacío</p>
              <span>Agrega productos para solicitar tu cotización</span>
            </div>
          )}

          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.fila}>
                <div className={styles.imagenBox}>
                  <ImagenItem item={item} producto={productoPorId.get(item.id)} />
                </div>

                <div className={styles.info}>
                  <h4 className={styles.nombre}>{item.titulo}</h4>

                  <div className={styles.badges}>
                    {item.categoria && (
                      <span className={styles.badgeCategoria}>
                        {item.categoria}
                      </span>
                    )}
                    {item.marca && (
                      <span className={styles.badgeMarca}>{item.marca}</span>
                    )}
                  </div>

                  {typeof item.precio === "number" && (
                    <div className={styles.precioBox}>
                      <span className={styles.precioLabel}>Precio unidad</span>
                      <span className={styles.precio}>
                        {formatoSoles(item.precio)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.acciones}>
                <div className={styles.cantidad}>
                  <button
                    type="button"
                    className={styles.btnCantidad}
                    onClick={() => cambiarCantidad(item.id, -1)}
                    disabled={item.cantidad <= 1}
                    aria-label="Disminuir cantidad"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    value={item.cantidad}
                    readOnly
                    aria-label="Cantidad"
                  />
                  <button
                    type="button"
                    className={styles.btnCantidad}
                    onClick={() => cambiarCantidad(item.id, 1)}
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className={styles.btnEliminar}
                  onClick={() => eliminar(item.id)}
                  aria-label={`Eliminar ${item.titulo}`}
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M9 3h6l1 2h4v2H4V5h4l1-2Zm-3 6h12l-1 12H7L6 9Zm4 2v8h2v-8h-2Zm4 0v8h2v-8h-2Z"
                    />
                  </svg>
                  <span>Quitar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ---------- Footer ---------- */}
        <div className={styles.footer}>
          <div className={styles.resumen}>
            <div className={styles.resumenFila}>
              <span>Unidades totales</span>
              <strong>{totalUnidades}</strong>
            </div>
            {hayPrecios && (
              <div className={`${styles.resumenFila} ${styles.subtotal}`}>
                <span>Subtotal</span>
                <strong>{formatoSoles(subtotal)}</strong>
              </div>
            )}
          </div>

          <div className={styles.botones}>
            <button type="button" className={styles.btnCerrar} onClick={onCerrar}>
              Cerrar
            </button>
            <button
              type="button"
              className={styles.btnContinuar}
              onClick={cotizarPorWhatsApp}
              disabled={items.length === 0}
            >
              Continuar
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M13 6l6 6-6 6"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}