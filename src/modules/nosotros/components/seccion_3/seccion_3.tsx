import styles from "./seccion_3.module.css";

export default function Seccion_3() {
  return (
    <section className={styles.seccion}>
      <div className={styles.contenido}>
        <article className={styles.bloque}>
          <h2 className={styles.titulo}>Misión</h2>
          <p className={styles.texto}>
            Brindar seguridad a nuestros potenciales clientes y sus colaboradores
            a través de la amplia gama de marcas y productos de calidad que
            comercializamos para su uso y protección, para el buen desempeño
            laboral.
          </p>
        </article>

        <article className={styles.bloque}>
          <h2 className={styles.titulo}>Visión</h2>
          <p className={styles.texto}>
            Ser una empresa reconocida y líder en el mercado en la distribución y
            comercio de las mejores marcas de productos de seguridad personal y
            ferretería, brindando al cliente el asesoramiento y la capacitación
            para el debido y adecuado uso de los productos que adquiere en
            nuestra empresa.
          </p>
        </article>
      </div>
    </section>
  );
}