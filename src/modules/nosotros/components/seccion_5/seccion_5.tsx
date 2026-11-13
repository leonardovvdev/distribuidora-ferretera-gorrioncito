import styles from "./seccion_5.module.css";
import { images } from "../../../../assets/img/index";
import historia from "../../../../assets/pdf/HISTORIA.pdf";
import { useEffect, useRef, useState } from "react";

const hitos = [
  {
    anio: "2015",
    titulo: "El inicio",
    texto:
      "Gorrioncito nació con la venta de ladrillos. Visitábamos pequeñas obras y ofrecíamos los distintos tipos de ladrillo, entregados directamente en obra. Con la confianza de cada cliente fuimos sumando más materiales a la venta.",
  },
  {
    anio: "2016",
    titulo: "La primera ferretería",
    texto:
      "Abrimos una pequeña ferretería, todavía como persona natural, y empezamos a distribuir materiales a más obras.",
  },
  {
    anio: "2018",
    titulo: "Constitución como empresa",
    texto:
      "La empresa creció, pasó a ser persona jurídica y comenzó a trabajar con más entidades.",
  },
  {
    anio: "2020",
    titulo: "La pandemia y el programa Reactiva",
    fecha: "6 de marzo de 2020",
    texto:
      "El inicio de la pandemia no frenó el crecimiento de la ferretería. El programa Reactiva fue un impulso importante: nos dio más oportunidades y mejores condiciones para seguir creciendo como empresa nueva.",
    imagen: true,
  },
  {
    anio: "2020",
    titulo: "El primer almacén",
    texto:
      "Ese mismo año abrimos el primer almacén. Las ventas subieron y, poco después, compramos una movilidad propia para entregar los pedidos.",
  },
  {
    anio: "Hoy",
    titulo: "Gorrioncito en la actualidad",
    texto:
      "Contamos con una tienda principal y 2 almacenes. Ofrecemos materiales de construcción, agregados, alquiler de maquinaria y más. Somos una empresa sólida, al servicio de todos nuestros clientes.",
  },
];

export default function Seccion_5() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    function handleEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <section className={styles.seccion}>
      <header className={styles.cabecera}>
        <div>
          <h2 className={styles.titulo}>La historia de un emprendimiento</h2>
          <p className={styles.autor}>Por David Alfonso</p>
        </div>

        <div className={styles.opciones} ref={menuRef}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setOpen(!open)}
            aria-label="Más opciones"
            aria-haspopup="true"
            aria-expanded={open}
          >
            ⋮
          </button>

          {open && (
            <div className={styles.menu}>
              <a href={historia} download>
                Descargar PDF
              </a>
            </div>
          )}
        </div>
      </header>

      <ol className={styles.linea}>
        {hitos.map((hito) => (
          <li className={styles.hito} key={`${hito.anio}-${hito.titulo}`}>
            <span className={styles.anio}>{hito.anio}</span>

            <div className={styles.contenido}>
              <h3>{hito.titulo}</h3>
              {hito.fecha && <p className={styles.fecha}>{hito.fecha}</p>}
              <p>{hito.texto}</p>

              {hito.imagen && (
                <img
                  className={styles.imagen}
                  src={images.historiaGorrioncito}
                  alt="Ferretería Gorrioncito durante sus primeros años"
                />
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}