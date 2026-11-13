import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import styles from "./seccion_1.module.css";
import { banner as slides } from "../../../../assets/img/banner";
import type { BannerLocal } from "../../../../assets/img/banner";

const SLIDE_INTERVAL_MS = 5000;

const esLinkExterno = (link: string) => /^https?:\/\//i.test(link);

const renderImagen = (slide: BannerLocal) => (
  <img src={slide.src} alt={slide.nombre} className={styles.imagen} />
);

const renderBanner = (slide: BannerLocal) => {
  // Sin link válido: solo se muestra la imagen (evita <Link to={undefined}>).
  if (!slide.link) return renderImagen(slide);

  return esLinkExterno(slide.link) ? (
    <a href={slide.link} target="_blank" rel="noopener noreferrer">
      {renderImagen(slide)}
    </a>
  ) : (
    <Link to={slide.link}>{renderImagen(slide)}</Link>
  );
};

const Seccion_1 = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pausado, setPausado] = useState(false);

  const total = slides.length;
  const multipleSlides = total > 1;

  const nextSlide = useCallback(
    () => setCurrentIndex((prev) => (prev + 1) % total),
    [total],
  );
  const prevSlide = useCallback(
    () => setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1)),
    [total],
  );

  // Avance automático. Depende de currentIndex: al pulsar una flecha o un punto
  // el temporizador se reinicia (antes podía saltar de slide justo después del clic).
  // Se detiene con el mouse/foco encima y si el usuario pidió menos animación.
  useEffect(() => {
    if (!multipleSlides || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timeout = setTimeout(nextSlide, SLIDE_INTERVAL_MS);
    return () => clearTimeout(timeout);
  }, [currentIndex, multipleSlides, pausado, nextSlide]);

  const slideActivo = slides[currentIndex];

  if (!slideActivo) {
    return (
      <section className={styles.seccion}>
        <div className={styles.estado}>No hay banners disponibles.</div>
      </section>
    );
  }

  return (
    <section
      className={styles.seccion}
      aria-roledescription="carrusel"
      aria-label="Banners"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      {multipleSlides && (
        <button
          type="button"
          className={styles.arrowLeft}
          onClick={prevSlide}
          aria-label="Banner anterior"
        >
          ❮
        </button>
      )}

      {renderBanner(slideActivo)}

      {multipleSlides && (
        <button
          type="button"
          className={styles.arrowRight}
          onClick={nextSlide}
          aria-label="Banner siguiente"
        >
          ❯
        </button>
      )}

      {multipleSlides && (
        <div className={styles.indicators}>
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.nombre ?? index}
              className={`${styles.dot} ${index === currentIndex ? styles.active : ""}`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Ir al banner ${index + 1}`}
              aria-current={index === currentIndex}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Seccion_1;