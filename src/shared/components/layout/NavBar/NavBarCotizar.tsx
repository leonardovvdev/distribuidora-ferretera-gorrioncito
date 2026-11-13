import { type ChangeEvent, useEffect, useState } from "react";
import style from "./NavBarCotizar.module.css";
import { supabase } from "../../../../lib/supabase";
import { icon } from "../../../../core/icons";
/* ── Constantes ──────────────────────────────────────── */

const WHATSAPP_NUMBER = "51942055324";
const TELEFONO_VISIBLE = "+51 942 055 324";
const BUCKET = "cotizaciones";
const PESO_MAXIMO = 10 * 1024 * 1024; // 10 MB

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const soloNumeros = (valor: string, max: number) =>
  valor.replace(/\D/g, "").slice(0, max);

/* ── Subida de archivo ───────────────────────────────── */

async function subirArchivo(file: File): Promise<string | null> {
  const extension = file.name.split(".").pop() ?? "bin";
  const nombre = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(nombre, file, { cacheControl: "3600", upsert: false });

  if (error) {
    console.error("Error al subir archivo:", error.message);
    return null;
  }

  return supabase.storage.from(BUCKET).getPublicUrl(nombre).data.publicUrl;
}

/* ── Íconos ──────────────────────────────────────────── */

const IconoCerrar = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M6 6l12 12M18 6 6 18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

const IconoSubir = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      d="M12 15V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ── Componente ──────────────────────────────────────── */

export function NavBarCotizar() {
  const [abierto, setAbierto] = useState(false);

  const [documento, setDocumento] = useState("");
  const [celular, setCelular] = useState("");
  const [materiales, setMateriales] = useState("");

  const [archivoNombre, setArchivoNombre] = useState("");
  const [archivoUrl, setArchivoUrl] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);

  const [error, setError] = useState("");

  /* Escape cierra y se bloquea el scroll de fondo */
  useEffect(() => {
    if (!abierto) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    const overflowPrevio = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [abierto]);

  const resetArchivo = () => {
    setArchivoNombre("");
    setArchivoUrl(null);
    setSubiendo(false);
  };

  const abrir = () => {
    setError("");
    resetArchivo();
    setAbierto(true);
  };

  const cerrar = () => {
    setAbierto(false);
    setError("");
    setDocumento("");
    setCelular("");
    setMateriales("");
    resetArchivo();
  };

  /* Archivo */
  const handleArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo
    if (!file) return;

    resetArchivo();

    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setError("Solo se permiten imágenes, PDF, Excel o .txt");
      return;
    }
    if (file.size > PESO_MAXIMO) {
      setError("El archivo no puede superar los 10 MB");
      return;
    }

    setError("");
    setArchivoNombre(file.name);
    setSubiendo(true);

    const url = await subirArchivo(file);
    setSubiendo(false);

    if (!url) {
      setArchivoNombre("");
      setError("Error al subir el archivo. Intenta de nuevo.");
      return;
    }
    setArchivoUrl(url);
  };

  /* WhatsApp */
  const cotizar = () => {
    if (!documento) return setError("Ingresa tu DNI o RUC.");
    if (documento.length !== 8 && documento.length !== 11)
      return setError("El DNI debe tener 8 dígitos y el RUC 11.");
    if (celular.length !== 9) return setError("El celular debe tener 9 dígitos.");
    if (subiendo) return setError("Espera a que termine de subir el archivo.");
    if (!materiales.trim() && !archivoUrl)
      return setError("Escribe tu lista de materiales o adjunta un archivo.");

    setError("");

    const mensaje = [
      `DNI/RUC: ${documento}`,
      `CELULAR: ${celular}`,
      `MATERIALES: ${materiales.trim() || "-"}`,
      archivoUrl ? `ARCHIVO ADJUNTO: ${archivoUrl}` : "ARCHIVO ADJUNTO: No adjuntó archivo",
    ].join("\n\n");

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <>
      <button type="button" className={style.quoteButton} onClick={abrir}>
        Cotizar
      </button>

      {abierto && (
        <div className={style.overlay} onClick={cerrar}>
          <div
            className={style.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cotizar-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={style.cerrar}
              onClick={cerrar}
              aria-label="Cerrar cotización"
            >
              <IconoCerrar className={style.cerrarIcono} />
            </button>

            <div className={style.contenido}>
              <h2 id="cotizar-titulo" className={style.banner}>
                <span className={style.bannerTitulo}>Gorrioncito</span>
                <span className={style.bannerSub}>DISTRIBUIDORA FERRETERA</span>
              </h2>

              <p className={style.intro}>Atención exclusiva a obras en ejecución</p>

              <input
                type="text"
                className={style.campo}
                placeholder="RUC/DNI"
                inputMode="numeric"
                maxLength={11}
                value={documento}
                onChange={(e) => setDocumento(soloNumeros(e.target.value, 11))}
              />

              <input
                type="tel"
                className={style.campo}
                placeholder="Celular (9 dígitos)"
                inputMode="numeric"
                maxLength={9}
                value={celular}
                onChange={(e) => setCelular(soloNumeros(e.target.value, 9))}
              />

              <textarea
                className={style.textarea}
                placeholder={
                  "Escribe aquí lista de materiales detallando producto, cantidad, marca, entre otros...\n\nEjemplo:\nCables Celsa LSOH Negro 1000 metros\nTubería PVC Desagüe 500 Und"
                }
                value={materiales}
                onChange={(e) => setMateriales(e.target.value)}
              />

             <label className={`${style.adjuntar} ${subiendo ? style.adjuntarOcupado : ""}`}>
              <input
                type="file"
                className={style.fileInput}
                accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.xls,.xlsx,.txt"
                onChange={handleArchivo}
                disabled={subiendo}
              />
              <IconoSubir className={style.adjuntarIcono} />
              {subiendo ? (
                "Subiendo archivo..."
              ) : (
                <>
                  Adjuntar lista <span className={style.opcional}>(Opcional)</span>
                </>
              )}
            </label>

              {archivoNombre && (
                <p className={style.archivoNombre}>
                  {subiendo ? "⏳" : "✓"} {archivoNombre}
                </p>
              )}

              {error && (
                <p className={style.error} role="alert">
                  {error}
                </p>
              )}

              <button
                type="button"
                className={style.submit}
                onClick={cotizar}
                disabled={subiendo}
              >
                {icon.iconWhatsApp({ className: style.submitIcono })}
                Cotizar
              </button>

              <p className={style.telefono}>o comunícate al {TELEFONO_VISIBLE}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}