import { useMemo, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import style from "./seccion_4.module.css";

import { MARCAS_MOCK, type MarcaUI } from "../../data";

type Props = {
  onMarcaSeleccionada?: (marca: string) => void;
};

// Mínimo de logos por pista antes de duplicar (evita huecos en pantallas anchas)
const MIN_POR_PISTA = 8;
// Segundos que tarda cada logo en recorrer su espacio (controla la velocidad)
const SEGUNDOS_POR_MARCA = 4;

/**
 * Prepara una pista para el loop infinito:
 * repite la lista hasta llenar el mínimo y luego la duplica.
 */
const prepararPista = (lista: MarcaUI[]): MarcaUI[] => {
  if (lista.length === 0) return [];

  let base = lista;
  while (base.length < MIN_POR_PISTA) base = [...base, ...lista];

  return [...base, ...base];
};

const Seccion_4 = ({ onMarcaSeleccionada }: Props) => {
  const navigate = useNavigate();

  const { pistaSuperior, pistaInferior } = useMemo(() => {
    const corte = Math.ceil(MARCAS_MOCK.length / 2);
    return {
      pistaSuperior: prepararPista(MARCAS_MOCK.slice(0, corte)),
      pistaInferior: prepararPista(MARCAS_MOCK.slice(corte)),
    };
  }, []);

  const seleccionarMarca = (titulo: string) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/product?marca=${encodeURIComponent(titulo)}`);
    onMarcaSeleccionada?.(titulo);
  };

  const renderPista = (lista: MarcaUI[], pistaClass: string) => {
    if (lista.length === 0) return null;

    const duracion = `${(lista.length / 2) * SEGUNDOS_POR_MARCA}s`;

    return (
      <div className={style.viewport}>
        <div
          className={`${style.pista} ${pistaClass}`}
          style={{ "--duracion": duracion } as CSSProperties}
        >
          {lista.map((marca, index) => (
            <button
              key={`${marca.id}-${index}`}
              type="button"
              className={style.marca}
              aria-label={`Ver productos de ${marca.titulo}`}
              onClick={() => seleccionarMarca(marca.titulo)}
            >
              {marca.imagen ? (
                <img
                  src={marca.imagen}
                  alt={marca.titulo}
                  className={style.imagen}
                  loading="lazy"
                  draggable={false}
                />
              ) : (
                <span className={style.placeholder}>{marca.titulo}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className={style.seccion}>
      <header className={style.encabezado}>
        <h2 className={style.titulo}>Marcas</h2>
        <p className={style.descripcion}>
          Trabajamos con marcas reconocidas para ofrecer productos confiables en
          cada categoría.
        </p>
      </header>

      {MARCAS_MOCK.length > 0 ? (
        <div className={style.carruseles}>
          {renderPista(pistaSuperior, style.haciaIzquierda)}
          {renderPista(pistaInferior, style.haciaDerecha)}
        </div>
      ) : (
        <div className={style.vacio}>No hay marcas disponibles.</div>
      )}
    </section>
  );
};

export default Seccion_4;