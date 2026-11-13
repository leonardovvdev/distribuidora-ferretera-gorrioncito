import { useMemo, useState } from "react";
import styles from "./seccion_2.module.css";
import { icon } from "../../../../core/icons";
import type { CategoriaUI, MarcaUI } from "../../services/ProductService";

type Props = {
  categorias: CategoriaUI[];
  marcas: MarcaUI[];
  categoriasSeleccionadas: string[];
  marcasSeleccionadas: string[];
  onCategoriaSeleccionada: (categoria: string) => void;
  onMarcaSeleccionada: (marca: string) => void;
  enDrawer?: boolean;
};

type Tab = "categorias" | "marcas";

export default function Seccion_2({
  categorias,
  marcas,
  categoriasSeleccionadas,
  marcasSeleccionadas,
  onCategoriaSeleccionada,
  onMarcaSeleccionada,
  enDrawer = false,
}: Props) {
  const [tabActiva, setTabActiva] = useState<Tab>("categorias");
  const [busqueda, setBusqueda] = useState("");

  const esCategorias = tabActiva === "categorias";
    const items: { id: number; titulo: string }[] = esCategorias ? categorias : marcas;
  const seleccionados = esCategorias ? categoriasSeleccionadas : marcasSeleccionadas;
  const onSeleccionar = esCategorias ? onCategoriaSeleccionada : onMarcaSeleccionada;

  const handleCambiarTab = (tab: Tab) => {
    setTabActiva(tab);
    setBusqueda("");
  };

  const itemsFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return items.filter((item) => item.titulo.toLowerCase().includes(q));
  }, [busqueda, items]);

  return (
    <aside className={`${styles.seccion} ${enDrawer ? styles.seccionDrawer : ""}`}>
      {/* ── Tabs ── */}
      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={esCategorias}
          className={`${styles.tab} ${esCategorias ? styles.tabActiva : ""}`}
          onClick={() => handleCambiarTab("categorias")}
        >
          Categorías
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!esCategorias}
          className={`${styles.tab} ${!esCategorias ? styles.tabActiva : ""}`}
          onClick={() => handleCambiarTab("marcas")}
        >
          Marcas
        </button>
      </div>

      {/* ── Buscador ── */}
      <div className={styles.searchBox}>
        {icon.iconLupa({ className: styles.lupaIcon })}
        <input
          type="text"
          placeholder={esCategorias ? "Buscar en Categorías" : "Buscar en Marcas"}
          className={styles.searchInput}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* ── Lista con checkboxes ── */}
      <div className={styles.lista}>
        {itemsFiltrados.length === 0 ? (
          <p className={styles.sinResultados}>Sin resultados para "{busqueda}"</p>
        ) : (
          itemsFiltrados.map((item) => (
            <label key={item.id} className={styles.item}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={seleccionados.includes(item.titulo)}
                onChange={() => onSeleccionar(item.titulo)}
              />
              <span className={styles.itemTexto}>{item.titulo}</span>
            </label>
          ))
        )}
      </div>
    </aside>
  );
}