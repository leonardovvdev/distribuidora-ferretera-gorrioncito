import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import style from "./NavBar.module.css";
import { icon } from "../../../../core/icons";
import { images } from "../../../../assets/img";
import { NavBarLogo } from "./NavBarLogo";
import { NavBarSearch } from "./NavBarSearch";
import { NavBarCategoria } from "./NavBarCategoria";
import { NavBarCotizar } from "./NavBarCotizar";

const STORAGE_KEY = "cartItems";

/** Suma las cantidades de los productos guardados en el carrito */
const contarCarrito = (): number => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const items: { cantidad?: number }[] = data ? JSON.parse(data) : [];
    return Array.isArray(items)
      ? items.reduce((total, item) => total + (item.cantidad ?? 0), 0)
      : 0;
  } catch {
    return 0;
  }
};

const scrollTop = () => window.scrollTo({ top: 0 });

/* ── Íconos ──────────────────────────────────────────── */
const IconoInicio = () => (
  <svg viewBox="0 0 24 24" className={style.linkIcono} aria-hidden="true">
    <path fill="currentColor" d="M12 3 2 12h3v8h5v-5h4v5h5v-8h3L12 3Z" />
  </svg>
);

const IconoCaja = () => (
  <svg viewBox="0 0 24 24" className={style.linkIcono} aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.2 6.4 3.5L12 11.2 5.6 7.7 12 4.2ZM5 9.4l6 3.3v7.1l-6-3.3V9.4Zm14 0v7.1l-6 3.3v-7.1l6-3.3Z"
    />
  </svg>
);

const IconoMenu = () => (
  <svg viewBox="0 0 24 24" className={style.hamburgerIcono} aria-hidden="true">
    <path
      d="M4 7h16M4 12h16M4 17h16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const IconoCerrar = () => (
  <svg viewBox="0 0 24 24" className={style.hamburgerIcono} aria-hidden="true">
    <path
      d="M6 6l12 12M18 6 6 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

interface NavBarProps {
  onAbrirCarrito?: () => void;
}

export default function NavBar({ onAbrirCarrito }: NavBarProps) {
  const [totalItems, setTotalItems] = useState(contarCarrito);
  const [menuOpen, setMenuOpen] = useState(false);

  /* Contador del carrito */
  useEffect(() => {
    const actualizar = () => setTotalItems(contarCarrito());
    window.addEventListener("cartUpdated", actualizar);
    window.addEventListener("storage", actualizar);
    return () => {
      window.removeEventListener("cartUpdated", actualizar);
      window.removeEventListener("storage", actualizar);
    };
  }, []);

  /* Drawer: Escape para cerrar y bloqueo del scroll de la página */
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const overflowPrevio = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const closeMenu = () => {
    scrollTop();
    setMenuOpen(false);
  };

  /* Cierra el drawer (si está abierto) y abre el carrito lateral */
  const abrirCarritoDesdeDrawer = () => {
    setMenuOpen(false);
    onAbrirCarrito?.();
  };

  const claseEnlace = ({ isActive }: { isActive: boolean }) =>
    `${style.link} ${isActive ? style.linkActivo : ""}`;

  const etiquetaCarrito =
    totalItems > 0 ? `Carrito, ${totalItems} en total` : "Carrito";

  return (
    <div className={style.wrapper}>
      <header className={style.navbar}>
        <div className={style.logoRow}>
          <NavBarLogo />
        </div>

        <div className={style.searchRow}>
          <NavBarSearch />

          {/* Solo móvil: carrito siempre visible */}
          <button
            type="button"
            className={style.cartMobile}
            aria-label={etiquetaCarrito}
            onClick={onAbrirCarrito}
          >
            <span className={style.cartIconWrap}>
              {icon.iconCarrito({ className: style.carritoIcon })}
              {totalItems > 0 && (
                <span className={style.cartCount}>{totalItems}</span>
              )}
            </span>
          </button>

          <button
            type="button"
            className={style.hamburger}
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <IconoMenu />
          </button>
        </div>

        {/* Escritorio */}
        <nav className={style.menuDesktop} aria-label="Principal">
          <NavLink to="/nosotros" className={claseEnlace} onClick={scrollTop}>
            <IconoInicio />
            Nosotros
          </NavLink>
          <NavLink to="/product" className={claseEnlace} onClick={scrollTop}>
            <IconoCaja />
            Productos
          </NavLink>
          <NavBarCategoria />
        </nav>

        <div className={style.actionsDesktop}>
          <NavBarCotizar />

          <button
            type="button"
            className={style.cartButton}
            aria-label={etiquetaCarrito}
            onClick={onAbrirCarrito}
          >
            <span className={style.cartIconWrap}>
              {icon.iconCarrito({ className: style.carritoIcon })}
              {totalItems > 0 && (
                <span className={style.cartCount}>{totalItems}</span>
              )}
            </span>
          </button>
        </div>

        {/* Drawer móvil */}
        {menuOpen && (
          <>
            <div className={style.overlay} onClick={() => setMenuOpen(false)} />

            <aside
              className={style.drawer}
              role="dialog"
              aria-modal="true"
              aria-label="Menú"
            >
              <button
                type="button"
                className={style.drawerCerrar}
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
              >
                <IconoCerrar />
              </button>

              <div className={style.drawerLogo}>
                <img
                  src={images.logoHamburguesa}
                  alt="Gorrioncito"
                  className={style.drawerLogoImg}
                />
              </div>

              <Link to="/nosotros" className={style.drawerLink} onClick={closeMenu}>
                Nosotros
              </Link>

              <Link to="/product" className={style.drawerLink} onClick={closeMenu}>
                Productos
              </Link>

              <div className={style.drawerCotizar}>
                <NavBarCotizar />
              </div>

              <button
                type="button"
                className={style.cartButtonMobile}
                onClick={abrirCarritoDesdeDrawer}
              >
                {icon.iconCarrito({ className: style.carritoIcon })}
                Carrito ({totalItems})
              </button>
            </aside>
          </>
        )}
      </header>
    </div>
  );
}