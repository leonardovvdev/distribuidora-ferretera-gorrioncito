// Datos de prueba para maquetar las secciones (sin backend).
import imgCategoria from "./imgCategoria.png";
import imgProducto from "./imgProducto.png";
import imgMarca from "./imgMarca.png";

// ─── Categorías ───────────────────────────────────────────────────────────────

export type CategoriaUI = {
  id: number;
  titulo: string;
  imagen: string; // "" => se muestra el placeholder "Sin imagen"
};

export const CATEGORIAS_MOCK: CategoriaUI[] = [
  { id: 1,  titulo: "Herramientas Manuales",   imagen: imgCategoria },
  { id: 2,  titulo: "Herramientas Eléctricas", imagen: imgCategoria },
  { id: 3,  titulo: "Tornillos Y Fijaciones",  imagen: imgCategoria },
  { id: 4,  titulo: "Pinturas Y Acabados",     imagen: imgCategoria },
  { id: 5,  titulo: "Material Eléctrico",      imagen: imgCategoria },
  { id: 6,  titulo: "Gasfitería Y Tuberías",   imagen: imgCategoria },
  { id: 7,  titulo: "Cerraduras Y Candados",   imagen: imgCategoria },
  { id: 8,  titulo: "Seguridad Industrial",    imagen: imgCategoria },
  { id: 9,  titulo: "Cemento Y Construcción",  imagen: imgCategoria },
  { id: 10, titulo: "Jardinería Y Riego",      imagen: imgCategoria },
];

// ─── Productos ────────────────────────────────────────────────────────────────
// "categoria" debe coincidir con el título de una categoría de arriba.

export type ProductoUI = {
  id: number;
  titulo: string;
  categoria: string;
  marca: string;
  imagen: string; // "" => se muestra el placeholder "Sin imagen"
};

export const PRODUCTOS_MOCK: ProductoUI[] = [
  { id: 1,  titulo: "Martillo De Carpintero 16 Oz",   categoria: "Herramientas Manuales",   marca: "Stanley",  imagen: imgProducto },
  { id: 2,  titulo: "Alicate Universal 8 Pulgadas",   categoria: "Herramientas Manuales",   marca: "Truper",   imagen: imgProducto },
  { id: 3,  titulo: "Juego De Destornilladores X6",   categoria: "Herramientas Manuales",   marca: "Truper",   imagen: imgProducto },
  { id: 4,  titulo: "Taladro Percutor 650 W",         categoria: "Herramientas Eléctricas", marca: "Bosch",    imagen: imgProducto },
  { id: 5,  titulo: "Amoladora Angular 4 1/2",        categoria: "Herramientas Eléctricas", marca: "Makita",   imagen: imgProducto },
  { id: 6,  titulo: "Sierra Circular 7 1/4",          categoria: "Herramientas Eléctricas", marca: "Bosch",    imagen: imgProducto },
  { id: 7,  titulo: "Tornillo Autorroscante X100",    categoria: "Tornillos Y Fijaciones",  marca: "Fischer",  imagen: imgProducto },
  { id: 8,  titulo: "Taco Plástico 8 Mm X50",         categoria: "Tornillos Y Fijaciones",  marca: "Fischer",  imagen: imgProducto },
  { id: 9,  titulo: "Perno Hexagonal 3/8 X3",         categoria: "Tornillos Y Fijaciones",  marca: "Truper",   imagen: imgProducto },
  { id: 10, titulo: "Pintura Látex Blanco 1 Galón",   categoria: "Pinturas Y Acabados",     marca: "Tekno",    imagen: imgProducto },
  { id: 11, titulo: "Esmalte Sintético Negro 1/4",    categoria: "Pinturas Y Acabados",     marca: "Tekno",    imagen: imgProducto },
  { id: 12, titulo: "Rodillo De Felpa 9 Pulgadas",    categoria: "Pinturas Y Acabados",     marca: "Truper",   imagen: imgProducto },
  { id: 13, titulo: "Cable Eléctrico 2.5 Mm X100 M",  categoria: "Material Eléctrico",      marca: "Indeco",   imagen: imgProducto },
  { id: 14, titulo: "Interruptor Simple Blanco",      categoria: "Material Eléctrico",      marca: "Bticino",  imagen: imgProducto },
  { id: 15, titulo: "Tubo Pvc 1/2 Pulgada",           categoria: "Gasfitería Y Tuberías",   marca: "Pavco",    imagen: imgProducto },
  { id: 16, titulo: "Llave De Paso 1/2 Pulgada",      categoria: "Gasfitería Y Tuberías",   marca: "Pavco",    imagen: imgProducto },
  { id: 17, titulo: "Candado De Seguridad 50 Mm",     categoria: "Cerraduras Y Candados",   marca: "Yale",     imagen: imgProducto },
  { id: 18, titulo: "Cerradura De Embutir Doble",     categoria: "Cerraduras Y Candados",   marca: "Yale",     imagen: imgProducto },
  { id: 19, titulo: "Casco De Seguridad Amarillo",    categoria: "Seguridad Industrial",    marca: "3M",       imagen: imgProducto },
  { id: 20, titulo: "Guantes De Cuero Reforzados",    categoria: "Seguridad Industrial",    marca: "3M",       imagen: imgProducto },
  { id: 21, titulo: "Cemento Portland Bolsa 42.5 Kg", categoria: "Cemento Y Construcción",  marca: "Sol",      imagen: imgProducto },
  { id: 22, titulo: "Aditivo Impermeabilizante 1 L",  categoria: "Cemento Y Construcción",  marca: "Sika",     imagen: imgProducto },
  { id: 23, titulo: "Manguera De Riego 1/2 X30 M",    categoria: "Jardinería Y Riego",      marca: "Truper",   imagen: imgProducto },
  { id: 24, titulo: "Aspersor Giratorio Para Jardín", categoria: "Jardinería Y Riego",      marca: "Truper",   imagen: imgProducto },
];

// ─── Marcas ───────────────────────────────────────────────────────────────────
// Coinciden con las marcas usadas en PRODUCTOS_MOCK.

export type MarcaUI = {
  id: number;
  titulo: string;
  imagen: string; // "" => se muestra el placeholder con el nombre
};

export const MARCAS_MOCK: MarcaUI[] = [
  { id: 1,  titulo: "Stanley", imagen: imgMarca },
  { id: 2,  titulo: "Truper",  imagen: imgMarca },
  { id: 3,  titulo: "Bosch",   imagen: imgMarca },
  { id: 4,  titulo: "Makita",  imagen: imgMarca },
  { id: 5,  titulo: "Fischer", imagen: imgMarca },
  { id: 6,  titulo: "Tekno",   imagen: imgMarca },
  { id: 7,  titulo: "Indeco",  imagen: imgMarca },
  { id: 8,  titulo: "Bticino", imagen: imgMarca },
  { id: 9,  titulo: "Pavco",   imagen: imgMarca },
  { id: 10, titulo: "Yale",    imagen: imgMarca },
  { id: 11, titulo: "3M",      imagen: imgMarca },
  { id: 12, titulo: "Sol",     imagen: imgMarca },
  { id: 13, titulo: "Sika",    imagen: imgMarca },
];