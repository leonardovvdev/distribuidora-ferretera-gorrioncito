import { Outlet, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import NavBar from "../components/layout/NavBar/NavBar";
import BarraInferior from "../components/layout/BarraInferior/BarraInferior";
import CartSidebar from "../components/layout/cart-sidebar/cart-sidebar";
import styles from "./SeeProductLayout.module.css";

export default function SeeProductLayout() {
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const { pathname } = useLocation();

  const abrirCarrito = useCallback(() => setCarritoAbierto(true), []);
  const cerrarCarrito = useCallback(() => setCarritoAbierto(false), []);

  /* Abre el sidebar cuando cualquier componente dispara "openCart"
     (por ejemplo, el botón de carrito de los productos) */
  useEffect(() => {
    window.addEventListener("openCart", abrirCarrito);
    return () => window.removeEventListener("openCart", abrirCarrito);
  }, [abrirCarrito]);

  /* Cierra el sidebar al cambiar de página */
  useEffect(() => {
    setCarritoAbierto(false);
  }, [pathname]);

  return (
    <div className={styles.layout}>
      <NavBar onAbrirCarrito={abrirCarrito} />

      <main className={styles.mainContent}>
        <Outlet />
      </main>

      <BarraInferior />

      {/* Carrito lateral derecho */}
      <CartSidebar abierto={carritoAbierto} onCerrar={cerrarCarrito} />
    </div>
  );
}