import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./seccion_4.module.css";
import { supabase } from "../../../../lib/supabase";
import { getField } from "../../../../shared/utils/catalogImage";

type CategoriaRelacionada = {
  id: number;
  nombre: string;
  total: number;
};

type BloqueCatalogo = {
  titulo: string;
  descripcion: string;
  keywords: string[];
};

type CategoriaBucket = BloqueCatalogo & {
  items: CategoriaRelacionada[];
};

const bloquesBase: BloqueCatalogo[] = [
  {
    titulo: "Líneas operativas",
    descripcion: "Categorías de uso frecuente para abastecimiento continuo.",
    keywords: ["embols", "accesor", "gasfiter", "griferi", "sanitari", "valvula", "bronce"],
  },
  {
    titulo: "Seguridad personal",
    descripcion: "Equipos de protección para trabajar con seguridad.",
    keywords: [
      "proteccion",
      "guante",
      "respira",
      "altura",
      "cabeza",
      "facial",
      "audit",
      "corporal",
      "calzado",
      "epp",
      "seguridad",
    ],
  },
  {
    titulo: "Infraestructura técnica",
    descripcion: "Materiales para obra, redes e instalaciones.",
    keywords: [
      "emergencia",
      "absorb",
      "bloqueo",
      "etiquetado",
      "vial",
      "senal",
      "tuber",
      "conexion",
      "rotoplas",
      "fusion",
      "llave",
    ],
  },
  {
    titulo: "Herramientas y soporte",
    descripcion: "Herramientas para montaje, mantenimiento y trabajo en campo.",
    keywords: ["herramienta", "manual", "electric", "neumatic", "taladro", "disco"],
  },
];

function buildDisplayName(rawName: string | null, fileName: string | null, fallback: string) {
  const source = rawName || fileName;
  if (!source) return fallback;

  const baseName = source.replace(/\.[^.]+$/, "");
  const normalized = baseName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  if (!normalized) return fallback;

  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Seccion_4() {
  const [categorias, setCategorias] = useState<CategoriaRelacionada[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarCategoriasRelacionadas = async () => {
      setCargando(true);

      try {
        const [categoriasResult, productosResult] = await Promise.all([
          supabase.from("categoria").select("*"),
          supabase.from("producto").select("ctgraid"),
        ]);

        if (categoriasResult.error) {
          throw categoriasResult.error;
        }

        if (productosResult.error) {
          throw productosResult.error;
        }

        const conteo = new Map<number, number>();
        for (const row of (productosResult.data ?? []) as Record<string, unknown>[]) {
          const categoriaId = getField<number>(row, "ctgraid", "ctgraId");
          if (categoriaId === null || categoriaId === undefined) continue;

          conteo.set(Number(categoriaId), (conteo.get(Number(categoriaId)) ?? 0) + 1);
        }

        const categoriasMapeadas = ((categoriasResult.data ?? []) as Record<string, unknown>[])
          .map((row, index) => {
            const id = getField<number>(row, "ctgraId", "ctgraid", "id") ?? index + 1;
            const nombre = getField<string>(
              row,
              "ctgraNombre",
              "ctgranombre",
              "categoriaNombre",
              "categorianombre",
              "nombre"
            );
            const imagenNombre = getField<string>(row, "ctgraImgNombre", "ctgraimgnombre");

            return {
              id: Number(id),
              nombre: buildDisplayName(nombre, imagenNombre, `Categoría ${id}`),
              total: conteo.get(Number(id)) ?? 0,
            };
          })
          .filter((item) => item.nombre);

        setCategorias(
          categoriasMapeadas.sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre))
        );
      } catch (error) {
        console.error("No se pudieron cargar las categorias relacionadas:", error);
        setCategorias([]);
      } finally {
        setCargando(false);
      }
    };

    cargarCategoriasRelacionadas();
  }, []);

  const bloques = useMemo<CategoriaBucket[]>(() => {
    const usados = new Set<number>();

    const agrupados = bloquesBase.map((bloque) => {
      const items = categorias
        .filter((categoria) => {
          const nombreNormalizado = normalizeText(categoria.nombre);
          return bloque.keywords.some((keyword) => nombreNormalizado.includes(keyword));
        })
        .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre))
        .slice(0, 8);

      for (const item of items) {
        usados.add(item.id);
      }

      return {
        ...bloque,
        items,
      };
    });

    const restantes = categorias
      .filter((categoria) => !usados.has(categoria.id))
      .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre));

    for (const bloque of agrupados) {
      while (bloque.items.length < 6 && restantes.length > 0) {
        const siguiente = restantes.shift();
        if (!siguiente) break;
        bloque.items.push(siguiente);
      }
    }

    return agrupados;
  }, [categorias]);

  return (
    <section className={styles.seccion}>
      <div className={styles.contenido}>
        <header className={styles.cabecera}>
          <h2 className={styles.titulo}>
            Todo lo necesario para que tu proyecto avance
          </h2>
          <p className={styles.descripcion}>
            Explora el catálogo por tipo de trabajo. Cada categoría te lleva directo a sus
            productos.
          </p>
        </header>

        <div className={styles.grid}>
          {bloques.map((bloque) => (
            <article key={bloque.titulo} className={styles.bloque}>
              <h3>{bloque.titulo}</h3>
              <p className={styles.bloqueDescripcion}>{bloque.descripcion}</p>

              {bloque.items.length > 0 ? (
                <ul className={styles.lista}>
                  {bloque.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/product?categoria=${encodeURIComponent(item.nombre)}`}
                        className={styles.itemLink}
                      >
                        <span className={styles.itemNombre}>{item.nombre}</span>
                        {item.total > 0 && (
                          <span className={styles.itemTotal}>{item.total}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.vacio}>
                  {cargando ? "Cargando categorías…" : "No hay categorías relacionadas."}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}