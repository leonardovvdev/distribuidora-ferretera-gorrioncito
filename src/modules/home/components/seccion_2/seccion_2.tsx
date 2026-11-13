import { useRef, useState } from "react";
import style from "./seccion_2.module.css";
import { useCategoriasController } from "../../controllers/home.controllers";

// Cuánto se desplaza la barra al tocar una flecha (px)
const PASO_SCROLL = 240;

type Props = {
  /** Avisa al padre qué categoría quedó marcada (null = "Todas") */
  onSeleccionar?: (categoriaId: number | null) => void;
};

const Seccion_2 = ({ onSeleccionar }: Props) => {
  const { categorias, cargando, error } = useCategoriasController();
  const [activa, setActiva] = useState<number | "todas">("todas");
  const listaRef = useRef<HTMLDivElement | null>(null);

  const seleccionar = (id: number | "todas") => {
    setActiva(id);
    onSeleccionar?.(id === "todas" ? null : id);
  };

  const mover = (direccion: 1 | -1) => {
    listaRef.current?.scrollBy({ left: direccion * PASO_SCROLL, behavior: "smooth" });
  };

  return (
    <section className={style.seccion}>
      <h2 className={style.tituloPrincipal}>Categorías</h2>

      <nav className={style.barra} aria-label="Categorías de productos">
        <button
          type="button"
          className={`${style.flecha} ${style.flechaIzq}`}
          onClick={() => mover(-1)}
          aria-label="Ver categorías anteriores"
        >
          &#8249;
        </button>

        <div className={style.lista} ref={listaRef}>
          <button
            type="button"
            className={`${style.item} ${activa === "todas" ? style.itemActivo : ""}`}
            aria-pressed={activa === "todas"}
            onClick={() => seleccionar("todas")}
          >
            Todas
          </button>

          {cargando && <span className={style.item}>Cargando…</span>}
          {error && <span className={style.item}>No se pudieron cargar las categorías</span>}

          {categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`${style.item} ${activa === cat.id ? style.itemActivo : ""}`}
              aria-pressed={activa === cat.id}
              onClick={() => seleccionar(cat.id)}
            >
              {cat.titulo}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${style.flecha} ${style.flechaDer}`}
          onClick={() => mover(1)}
          aria-label="Ver más categorías"
        >
          &#8250;
        </button>
      </nav>
    </section>
  );
};

export default Seccion_2;