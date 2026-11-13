import { useState } from "react";
import style from "./HomePage.module.css";
import Seccion_1 from "../components/seccion_1/seccion_1";
import Seccion_2 from "../components/seccion_2/seccion_2";
import Seccion_3 from "../components/seccion_3/seccion_3";
import Seccion_4 from "../components/seccion_4/seccion_4";
// import Seccion_5 from "../components/seccion_5/seccion_5";
import Anuncio from "../components/anuncio/anuncio";

export default function HomePage() {
    // Categoría marcada en la sección 2 (null = "Todas"); la usa la sección 3
    const [categoriaId, setCategoriaId] = useState<number | null>(null);

    return (
        <div className={style.contenidoHome}>
            <Seccion_1/>
            <Seccion_2 onSeleccionar={setCategoriaId}/> 
            <Seccion_3 categoriaId={categoriaId}/> 
            <Seccion_4/>
            {/* <Seccion_5/> */}
            <Anuncio/>
            
        </div>
        
    );
}