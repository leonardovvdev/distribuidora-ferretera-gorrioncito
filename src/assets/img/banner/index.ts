import banner1 from "./banner2.webp";
import banner2 from "./images.jpg";

export type BannerLocal = {
  src: string;
  link: string;
  nombre: string;
};

export const banner: BannerLocal[] = [
  { src: banner1, link: "/", nombre: "Banner 1" },
  { src: banner2, link: "/product", nombre: "Banner 2" },
];