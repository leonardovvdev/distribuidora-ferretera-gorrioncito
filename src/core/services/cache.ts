import { useEffect, useRef, useState } from "react";

/* =========================================================
   cache.ts — caché de la tienda
   · Listas (categorías, productos): localStorage, se pintan al instante
     y se revalidan en segundo plano (stale-while-revalidate).
   · Imágenes: Cache Storage del navegador, guardadas por nombre de archivo.
     El backend sube cada imagen con un nombre aleatorio nuevo (upsert:false),
     así que una imagen guardada nunca queda desactualizada: si se cambia,
     llega con otro nombre y solo esa se descarga.
========================================================= */

/* ─── Listas (localStorage) ─────────────────────────────── */

const PREFIJO_LISTAS = "tienda:";

/** Cada cuánto se revisa si hubo cambios mientras la pestaña está visible */
export const INTERVALO_REFRESCO_MS = 60_000;

export const leerCache = <T>(clave: string): T | null => {
  try {
    const guardado = localStorage.getItem(PREFIJO_LISTAS + clave);
    return guardado ? (JSON.parse(guardado) as T) : null;
  } catch {
    return null;
  }
};

export const guardarCache = (clave: string, valor: unknown): void => {
  try {
    localStorage.setItem(PREFIJO_LISTAS + clave, JSON.stringify(valor));
  } catch {
    /* cuota llena o modo privado: la tienda sigue funcionando sin caché */
  }
};

/** Campos que cambian en cada petición (enlaces firmados): no cuentan como "cambio" */
const CAMPOS_VOLATILES = new Set(["img_url"]);

const firma = (valor: unknown): string =>
  JSON.stringify(valor, (clave, v) => (CAMPOS_VOLATILES.has(clave) ? undefined : v));

/**
 * Datos con caché: devuelve al instante lo guardado la última vez y luego
 * revalida (al montar, al volver a la pestaña y cada INTERVALO_REFRESCO_MS).
 * Solo vuelve a renderizar si los datos realmente cambiaron.
 */
export const useDatosCacheados = <T>(
  clave: string,
  cargar: () => Promise<T>,
  intervaloMs: number = INTERVALO_REFRESCO_MS,
) => {
  const [estado, setEstado] = useState<{ clave: string; datos: T | null }>(() => ({
    clave,
    datos: leerCache<T>(clave),
  }));
  const [error, setError] = useState<string | null>(null);
  const cargarRef = useRef(cargar);

  useEffect(() => {
    cargarRef.current = cargar;
  });

  // Cambió la clave (otra categoría, por ejemplo): arranca con lo guardado de esa clave
  if (estado.clave !== clave) {
    setEstado({ clave, datos: leerCache<T>(clave) });
  }
  const datos = estado.clave === clave ? estado.datos : leerCache<T>(clave);

  useEffect(() => {
    let activo = true;
    let primera = true; // la primera respuesta siempre reemplaza (trae enlaces firmados nuevos)
    let enCurso = false;
    setError(null);

    const refrescar = async () => {
      if (enCurso) return;
      enCurso = true;
      try {
        const nuevos = await cargarRef.current();
        if (!activo) return;
        guardarCache(clave, nuevos);
        const esPrimera = primera;
        primera = false;
        setError(null);
        setEstado((previo) =>
          !esPrimera && previo.clave === clave && firma(previo.datos) === firma(nuevos)
            ? previo
            : { clave, datos: nuevos },
        );
      } catch (e) {
        if (activo) setError(e instanceof Error ? e.message : "Error desconocido");
      } finally {
        enCurso = false;
      }
    };

    const siEstaVisible = () => {
      if (!document.hidden) void refrescar();
    };

    void refrescar();
    const temporizador = window.setInterval(siEstaVisible, intervaloMs);
    document.addEventListener("visibilitychange", siEstaVisible);

    return () => {
      activo = false;
      window.clearInterval(temporizador);
      document.removeEventListener("visibilitychange", siEstaVisible);
    };
  }, [clave, intervaloMs]);

  return {
    datos,
    // Con datos guardados no se muestra error ni "cargando": el usuario ya ve contenido
    cargando: datos === null && error === null,
    error: datos === null ? error : null,
  };
};

/* ─── Imágenes (Cache Storage) ──────────────────────────── */

const NOMBRE_CACHE_IMAGENES = "tienda-imagenes-v1";
const EDAD_MAXIMA_MS = 30 * 24 * 60 * 60 * 1000; // 30 días sin volver a descargarse

/** clave → blob URL ya lista (vive mientras la pestaña esté abierta) */
const enMemoria = new Map<string, string>();
const enCurso = new Map<string, Promise<string | null>>();
let podaProgramada = false;

const peticionDe = (clave: string) =>
  new Request(`${window.location.origin}/__imagenes/${clave}`);

/** Borra del caché las imágenes que llevan más de EDAD_MAXIMA_MS guardadas (una vez por sesión) */
const programarPoda = () => {
  if (podaProgramada || !("caches" in window)) return;
  podaProgramada = true;

  window.setTimeout(async () => {
    try {
      const almacen = await caches.open(NOMBRE_CACHE_IMAGENES);
      for (const peticion of await almacen.keys()) {
        const respuesta = await almacen.match(peticion);
        const guardada = Number(respuesta?.headers.get("x-guardada") ?? 0);
        if (Date.now() - guardada > EDAD_MAXIMA_MS) await almacen.delete(peticion);
      }
    } catch {
      /* la poda es opcional */
    }
  }, 5_000);
};

/**
 * Devuelve una URL lista para <img>: del caché si ya se descargó, o la descarga
 * una sola vez y la guarda. Si el caché no está disponible usa la URL remota.
 */
export const resolverImagen = (clave: string, urlRemota: string | null): Promise<string | null> => {
  const lista = enMemoria.get(clave);
  if (lista) return Promise.resolve(lista);

  const pendiente = enCurso.get(clave);
  if (pendiente) return pendiente;

  const trabajo = (async () => {
    if (!("caches" in window)) return urlRemota;
    programarPoda();

    try {
      const almacen = await caches.open(NOMBRE_CACHE_IMAGENES);
      const peticion = peticionDe(clave);
      const guardada = await almacen.match(peticion);

      let blob: Blob;
      if (guardada) {
        blob = await guardada.blob();
      } else {
        if (!urlRemota) return null;
        const descarga = await fetch(urlRemota);
        if (!descarga.ok) return urlRemota;
        blob = await descarga.blob();
        await almacen.put(
          peticion,
          new Response(blob, {
            headers: { "content-type": blob.type, "x-guardada": String(Date.now()) },
          }),
        );
      }

      const url = URL.createObjectURL(blob);
      enMemoria.set(clave, url);
      return url;
    } catch {
      return urlRemota; // sin caché la imagen igual se ve
    }
  })().finally(() => enCurso.delete(clave));

  enCurso.set(clave, trabajo);
  return trabajo;
};

/**
 * src para <img> con caché. `clave` identifica la imagen (incluye el nombre del
 * archivo, que cambia cuando la imagen se actualiza). Mientras no esté lista
 * devuelve "" y, si la imagen cambia, conserva la anterior hasta tener la nueva.
 */
export const useImagenCacheada = (clave: string | null, urlRemota: string | null): string => {
  const [src, setSrc] = useState<string>(() => (clave ? enMemoria.get(clave) ?? "" : ""));

  useEffect(() => {
    if (!clave) {
      setSrc("");
      return;
    }

    const lista = enMemoria.get(clave);
    if (lista) {
      setSrc(lista);
      return;
    }

    let activo = true;
    void resolverImagen(clave, urlRemota).then((url) => {
      if (activo && url) setSrc(url);
    });
    return () => {
      activo = false;
    };
  }, [clave, urlRemota]);

  return src;
};