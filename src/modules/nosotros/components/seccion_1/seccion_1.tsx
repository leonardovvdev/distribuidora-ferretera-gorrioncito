import styles from "./seccion_1.module.css";
import { images } from "../../../../assets/img/index.js";
import { icon } from "../../../../core/icons";

const RESUMEN = [
  {
    titulo: "Atención directa",
    texto: "Respuesta ágil para cotizaciones y consultas comerciales.",
  },
  {
    titulo: "Cobertura amplia",
    texto: "Marcas, herramientas y líneas técnicas para obra e industria.",
  },
];

const CONTACTO = [
  {
    titulo: "Contáctanos",
    valor: "+51 942 055 324",
    href: "tel:+51942055324",
    icono: icon.iconTelefono,
  },
  {
    titulo: "Correo",
    valor: "distribuidoraferrorgorrioncito@gmail.com",
    href: "mailto:distribuidoraferrorgorrioncito@gmail.com",
    icono: icon.iconCorreo,
  },
];

export default function Seccion_1() {
  return (
    <section className={styles.seccion} aria-labelledby="quienes-somos">
      <div className={styles.wrapper}>
        {/* Texto */}
        <div className={styles.texto}>
          
          <h2 id="quienes-somos" className={styles.titulo}>
            Quiénes somos
          </h2>
          <p className={styles.subtitulo}>
            Distribución técnica y comercial con enfoque en industria,
            construcción y seguridad.
          </p>
          <p className={styles.descripcion}>
            Somos una empresa peruana dedicada a la distribución y
            comercialización de productos para los sectores de minería,
            construcción civil, pesquería, agricultura, entre otras
            industrias.
          </p>

          <div className={styles.resumenGrid}>
            {RESUMEN.map(({ titulo, texto }) => (
              <div key={titulo} className={styles.resumenCard}>
                <strong>{titulo}</strong>
                <span>{texto}</span>
              </div>
            ))}
          </div>

          <div className={styles.contactoGrid}>
            {CONTACTO.map(({ titulo, valor, href, icono }) => (
              <a key={titulo} href={href} className={styles.contactoCard}>
                {icono({ className: styles.contactoIcono })}
                <div>
                  <h3>{titulo}</h3>
                  <p>{valor}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Imagen */}
        <div className={styles.visual}>
          <img
            src={images.FLYER2}
            alt="Flyer corporativo de Distribuidora Ferretera Gorrioncito"
            className={styles.imagen}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}