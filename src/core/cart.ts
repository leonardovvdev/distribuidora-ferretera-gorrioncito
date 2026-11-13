const STORAGE_KEY = "cartItems";

export interface CartItem {
  id: string;
  titulo: string;
  categoria: string;
  marca: string;
  imagen: string;
  cantidad: number;
}

const leer = (): CartItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const items = data ? JSON.parse(data) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
};

export function agregarAlCarrito(
  producto: Omit<CartItem, "cantidad">,
  cantidad = 1
) {
  const items = leer();
  const existente = items.find((i) => i.id === producto.id);

  const nuevos = existente
    ? items.map((i) =>
        i.id === producto.id ? { ...i, cantidad: i.cantidad + cantidad } : i
      )
    : [...items, { ...producto, cantidad }];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos));
  window.dispatchEvent(new Event("cartUpdated")); // contador + lista
  window.dispatchEvent(new Event("openCart"));    // abre el sidebar
}