import { useMemo } from "react";
import { Link } from "react-router-dom";
import style from "./BarraInferior.module.css";
import { images } from "../../../../assets/img";
import { icon } from "../../../../../src/core/icons";

import { CATEGORIAS_MOCK } from "../../../../modules/home/data";

/* ── Datos del negocio ───────────────────────────────── */
const WHATSAPP_NUMBER = "51915144663";
const WHATSAPP_MESSAGE = "Hola, quiero solicitar una cotizacion.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
const FACEBOOK_URL = "https://www.facebook.com/Distribuidoraferregorrioncito/";
const TIKTOK_URL = "https://www.tiktok.com/@ferreteriagorrioncito0";
const MESSENGER_URL = "https://www.facebook.com/Distribuidoraferregorrioncito/";

const TELEFONOS = "942055324 - 901985491";
const CORREO = "distribuidoraferrorgorrioncito@gmail.com";
const DIRECCION =
  "Av. Primero de Noviembre Mza. a Lote. 06 Snc, Quinta Aurora (Frente al Aeropuerto de Mazamari)";

const CANTIDAD_CATEGORIAS = 5;

/* ── Redes sociales ──────────────────────────────────── */
// Para usar Instagram como en el diseño, reemplaza Messenger por:
// { nombre: "Instagram", href: INSTAGRAM_URL, imagen: images.instagram }
const REDES = [
  { nombre: "Facebook", href: FACEBOOK_URL, imagen: images.facebook },
  { nombre: "TikTok", href: TIKTOK_URL, imagen: images.tiktok },
  { nombre: "Messenger", href: MESSENGER_URL, imagen: images.messenger },
  { nombre: "WhatsApp", href: WHATSAPP_URL, imagen: images.whatsapp },
];

const BarraInferior = () => {
  // Solo las primeras categorías
  const categorias = useMemo(
    () => CATEGORIAS_MOCK.slice(0, CANTIDAD_CATEGORIAS),
    []
  );

  const subirAlInicio = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className={style.footer}>
      <div className={style.superior}>
        {/* Marca */}
        <div className={style.columna}>
          <div className={style.marca}>
            <img
              src={images.logoGorrion}
              alt="Logo Gorrioncito"
              className={style.logo}
            />
            <div>
              <p className={style.marcaNombre}>GORRIONCITO</p>
              <p className={style.marcaSub}>DISTRIBUIDORA Y FERRETERÍA</p>
            </div>
          </div>

          <p className={style.slogan}>
            Tu aliado en soluciones ferreteras.
            <br />
            Calidad y compromiso en cada producto.
          </p>

          <div className={style.redes}>
            {REDES.map(({ nombre, href, imagen }) => (
              <a
                key={nombre}
                href={href}
                target="_blank"
                rel="noreferrer"
                className={style.red}
                aria-label={`Visitar ${nombre}`}
              >
                <img src={imagen} alt="" className={style.redImg} />
              </a>
            ))}
          </div>
        </div>

        {/* Productos */}
        <div className={`${style.columna} ${style.conDivisor}`}>
          <h3 className={style.titulo}>PRODUCTOS</h3>
          <ul className={style.lista}>
            {categorias.map((cat) => (
              <li key={cat.id}>
                <Link
                  to={`/product?categoria=${encodeURIComponent(cat.titulo)}`}
                  className={style.itemProducto}
                  onClick={subirAlInicio}
                >
                  {cat.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className={`${style.columna} ${style.conDivisor}`}>
          <h3 className={style.titulo}>LEGAL</h3>
          <Link to="/libroReclamaciones" className={style.itemLegal}>
            {icon.iconHojaPaper({ className: style.icono })}
            <span>Libro de Reclamaciones</span>
          </Link>
        </div>

        {/* Contacto */}
        <div className={`${style.columna} ${style.conDivisor}`}>
          <h3 className={style.titulo}>CONTACTO</h3>
          <ul className={style.contactos}>
            <li>
              {icon.iconTelefono({ className: style.icono })}
              <span>{TELEFONOS}</span>
            </li>
            <li>
              {icon.iconCorreo({ className: style.icono })}
              <span>{CORREO}</span>
            </li>
            <li>
              {icon.iconUbicacion({ className: style.icono })}
              <span>{DIRECCION}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={style.inferior}>
        <p>&copy; 2026 Gorrioncito. Todos los derechos reservados.</p>
        <p>RUC 20613860321</p>
        <p>Empresa Individual de Responsabilidad Limitada</p>
      </div>
    </footer>
  );
};

export default BarraInferior;