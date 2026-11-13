import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import styles from "./seccion_1.module.css";
import { useImagenCacheada } from "../../../../core/services/cache";
import type { MarcaUI } from "../../services/ProductService";

type Props = {
  marcas: MarcaUI[];
  onMarcaSeleccionada?: (marca: string) => void;
};

/** Logo de una marca: usa la imagen guardada en el caché del navegador. */
function LogoMarca({ marca }: { marca: MarcaUI }) {
  const src = useImagenCacheada(marca.claveImagen, marca.imagen);

  return src ? (
    <img src={src} alt={marca.titulo} className={styles.logo} loading="lazy" />
  ) : (
    <div className={styles.logoPlaceholder}>{marca.titulo}</div>
  );
}

export default function Seccion_1({ marcas, onMarcaSeleccionada }: Props) {
  const [pausado, setPausado] = useState(false);
  const [direccion, setDireccion] = useState<"normal" | "reverse">("normal");
  const pistaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pista = pistaRef.current;
    if (!pista) return;
    pista.style.animation = "none";
    void pista.offsetHeight;
    pista.style.animation = "";
    pista.style.animationDirection = direccion;
  }, [direccion]);

  const marcasLoop = useMemo(
    () => (marcas.length === 0 ? [] : [...marcas, ...marcas]),
    [marcas]
  );

  // ~6s por marca: la velocidad se mantiene constante sin importar cuántas haya
  const duracion = `${Math.max(marcas.length * 6, 20)}s`;

  return (
    <section
      className={styles.seccion}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      <button
        type="button"
        className={styles.flecha}
        onClick={() => setDireccion("reverse")}
        aria-label="Anterior"
      >
        ‹
      </button>

      <div className={styles.carrusel}>
        {marcasLoop.length > 0 ? (
          <div
            ref={pistaRef}
            className={`${styles.pista} ${pausado ? styles.pistaPausada : ""}`}
            style={
              {
                animationDirection: direccion,
                "--duracion": duracion,
              } as CSSProperties
            }
          >
            {marcasLoop.map((marca, index) => (
              <article
                key={`${marca.id}-${index}`}
                className={styles.logoCard}
                onClick={() => onMarcaSeleccionada?.(marca.titulo)}
                onKeyDown={(e) =>
                  e.key === "Enter" && onMarcaSeleccionada?.(marca.titulo)
                }
                role="button"
                tabIndex={0}
                aria-hidden={index >= marcas.length}
              >
                <LogoMarca marca={marca} />
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.vacio}>No hay marcas disponibles.</div>
        )}
      </div>

      <button
        type="button"
        className={styles.flecha}
        onClick={() => setDireccion("normal")}
        aria-label="Siguiente"
      >
        ›
      </button>
    </section>
  );
}