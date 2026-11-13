import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./anuncio.module.css";
import { icon } from "../../.././../core/icons";
import { DEFAULT_CUSTOMER_ID } from "../../../../core/config/customer";

const VIDEO_SRC = "/anuncio.mp4"; // public/anuncio.mp4
const STORAGE_PREFIX = "anuncioFechaVista"; // + _{custId}: guarda la fecha (YYYY-MM-DD) en que se vio
const REVISIT_DELAY_MS = 3000;

// ⚠️ Ajusta esto a como ya llamas a tu backend (variable de entorno / helper de API).
const API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/backend-chameleonb2b`;

/** Fecha de hoy en Lima (YYYY-MM-DD), igual que la que usa la base de datos. */
const fechaHoy = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima" }).format(new Date());

const storageKey = (custId: number) => `${STORAGE_PREFIX}_${custId}`;

const yaVistoHoy = (custId: number) => {
  try {
    return localStorage.getItem(storageKey(custId)) === fechaHoy();
  } catch {
    return false;
  }
};

const guardarVistoHoy = (custId: number) => {
  try {
    localStorage.setItem(storageKey(custId), fechaHoy());
  } catch {
    /* sin storage: no pasa nada */
  }
};

/** Contador anónimo: si falla, no debe molestar al usuario. */
const registrar = (endpoint: "advertisement-views" | "advertisement-revisits", custId: number) => {
  fetch(`${API_BASE}/${endpoint}?cust_id=${custId}`, { method: "POST", keepalive: true }).catch(() => {});
};

interface AnuncioProps {
  custId?: number; // tienda a la que pertenece el anuncio (por defecto DEFAULT_CUSTOMER_ID)
}

const Anuncio = ({ custId = DEFAULT_CUSTOMER_ID }: AnuncioProps) => {
  const navigate = useNavigate();

  // Se abre solo si en el caché NO está la fecha de hoy
  const [abrirAlInicio] = useState(() => !yaVistoHoy(custId));
  const [modalAbierto, setModalAbierto] = useState(abrirAlInicio);

  const botonCerrarRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const vistaRegistradaRef = useRef(false);
  const esRevisitaRef = useRef(false); // true cuando se abrió con el botón "Ver video"

  // 1) Primera vista del día: suma 1 en advertisement_views y guarda la fecha en caché
  useEffect(() => {
    if (!abrirAlInicio || vistaRegistradaRef.current) return;
    vistaRegistradaRef.current = true; // evita doble conteo (StrictMode)
    registrar("advertisement-views", custId);
    guardarVistoHoy(custId);
  }, [abrirAlInicio, custId]);

  // 2) Revisita: si lo abrió con el botón y sigue abierto a los 3 s, suma 1 en advertisement_revisits.
  //    Si cierra antes de los 3 s, el cleanup cancela el conteo. Al cerrar después, no pasa nada.
  useEffect(() => {
    if (!modalAbierto || !esRevisitaRef.current) return;
    const timer = setTimeout(
      () => registrar("advertisement-revisits", custId),
      REVISIT_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [modalAbierto, custId]);

  // Reproduce con sonido. Si el navegador lo bloquea (apertura automática sin clic previo),
  // reintenta en silencio para que el video al menos se vea; el usuario puede activar el sonido en los controles.
  useEffect(() => {
    if (!modalAbierto) return;
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }, [modalAbierto]);

  const abrirRevisita = useCallback(() => {
    esRevisitaRef.current = true;
    setModalAbierto(true);
  }, []);

  const cerrarModal = useCallback(() => {
    esRevisitaRef.current = false;
    setModalAbierto(false);
  }, []);

  const verProductos = useCallback(() => {
    cerrarModal();
    navigate("/product");
    window.scrollTo({ top: 0 });
  }, [cerrarModal, navigate]);

  // Cerrar con Esc, bloquear scroll del fondo y enfocar el botón cerrar
  useEffect(() => {
    if (!modalAbierto) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrarModal();
    };
    const overflowAnterior = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    botonCerrarRef.current?.focus();

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [modalAbierto, cerrarModal]);

  return (
    <>
      {/* Botón flotante para volver a abrir el video */}
      {!modalAbierto && (
        <button type="button" className={styles.botonVideo} onClick={abrirRevisita}>
          <icon.iconVideo className={styles.iconvideo} />
          Ver video
        </button>
      )}

      {modalAbierto &&
        createPortal(
          <div className={styles.modalOverlay} onClick={cerrarModal} role="presentation">
            <div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby="titulo-video-anuncio"
              onClick={(e) => e.stopPropagation()}
            >
              <header className={styles.modalHeader}>
                <div>
                  <span className={styles.modalEtiqueta}>Mensaje especial</span>
                  <h2 id="titulo-video-anuncio" className={styles.modalTitulo}>
                    Gorrioncito · Distribuidora Ferretera
                  </h2>
                </div>

                <button
                  ref={botonCerrarRef}
                  type="button"
                  className={styles.modalCerrar}
                  onClick={cerrarModal}
                  aria-label="Cerrar video"
                >
                  ✕
                </button>
              </header>

              <div className={styles.videoWrapper}>
                <video
                  ref={videoRef}
                  className={styles.video}
                  src={VIDEO_SRC}
                  controls
                  playsInline
                  preload="metadata"
                >
                  Tu navegador no soporta la reproducción de video.
                </video>
              </div>

              <footer className={styles.modalFooter}>
                <button type="button" className={styles.modalBoton} onClick={verProductos}>
                  Ver productos
                </button>
              </footer>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Anuncio;