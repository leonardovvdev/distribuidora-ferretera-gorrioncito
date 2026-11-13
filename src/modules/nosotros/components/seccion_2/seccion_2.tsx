import { useEffect, useState } from "react";
import styles from "./seccion_2.module.css";
import { supabase } from "../../../../lib/supabase";

type MarcaItem = {
  id: number;
  nombre: string;
  imagen: string;
};

function getStorageUrl(bucketName: string | null, fileName: string | null) {
  if (!bucketName || !fileName) return "";

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  return data?.publicUrl ?? "";
}

export default function Seccion_2() {
  const [marcas, setMarcas] = useState<MarcaItem[]>([]);

  useEffect(() => {
    const cargarMarcas = async () => {
      try {
        const { data, error } = await supabase
          .from("marca")
          .select("*")
          .eq("marcaimportante", true)
          .limit(12);

        if (error) throw error;

        const marcasMapeadas = ((data ?? []) as Record<string, unknown>[])
          .map((row, index) => {
            const id = (row["marcaid"] as number) ?? index + 1;
            const nombre = (row["marcanombre"] as string) ?? null;
            const archivoNombre = (row["marcaimgnombrebucket"] as string) ?? null;

            // El archivo está en el bucket "imagenes", carpeta "marca/"
            const imagen = archivoNombre
              ? getStorageUrl("imagenes", `marca/${archivoNombre}`)
              : "";

            return {
              id: Number(id),
              nombre: nombre ?? `Marca ${id}`,
              imagen,
            };
          })
          .filter((item) => item.nombre);

        setMarcas(marcasMapeadas);
      } catch (error) {
        console.error("No se pudieron cargar las marcas:", error);
        setMarcas([]);
      }
    };

    cargarMarcas();
  }, []);

  return (
    <section className={styles.seccion}>
      <div className={styles.contenido}>
        <header className={styles.cabecera}>
          <h2 className={styles.titulo}>Marcas reconocidas en nuestro portafolio</h2>
          <p className={styles.descripcion}>
            Trabajamos con fabricantes y líneas comerciales con presencia constante
            en seguridad industrial, ferretería y suministros para obra.
          </p>
        </header>

        <div className={styles.grid}>
          {marcas.length > 0 ? (
            marcas.map((marca) => (
              <div key={marca.id} className={styles.marca}>
                {marca.imagen ? (
                  <img
                    src={marca.imagen}
                    alt={marca.nombre}
                    className={styles.marcaImg}
                    loading="lazy"
                  />
                ) : (
                  <span className={styles.placeholder}>{marca.nombre}</span>
                )}
              </div>
            ))
          ) : (
            <p className={styles.vacio}>No hay marcas disponibles.</p>
          )}
        </div>
      </div>
    </section>
  );
}