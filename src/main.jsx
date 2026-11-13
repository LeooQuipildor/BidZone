// ============================================================================
// ARCHIVO: src/main.jsx
// RESPONSABILIDAD: Punto de entrada principal (Entry Point) de la aplicación web.
// ============================================================================
//
// ¿CÓMO SE LLEGA AQUÍ?
// 1. El usuario abre el navegador e ingresa a la URL de BidZone.
// 2. El servidor web entrega el archivo 'index.html'.
// 3. Dentro de 'index.html' existe la etiqueta:
//      <div id="root"></div>
//      <script type="module" src="/src/main.jsx"></script>
// 4. El navegador descarga y ejecuta este archivo 'main.jsx'.
//
// CONCEPTOS CLAVE DE JAVASCRIPT Y REACT:
// - 'import { StrictMode }': Modo estricto de React. En desarrollo, ejecuta dos veces
//   ciertos métodos y efectos para ayudarte a detectar fugas de memoria, efectos no
//   limpiados y problemas de concurrencia. No afecta la versión de producción.
// - 'createRoot': Función introducida en React 18/19 que reemplaza al antiguo 'ReactDOM.render'.
//   Inicializa el nuevo motor concurrente de React sobre el nodo HTML indicado.
// - 'document.getElementById("root")': Método estándar del DOM de JavaScript que busca
//   el elemento HTML con el identificador "root" donde vivirá toda nuestra interfaz.
// ============================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Importación de la hoja de estilos global con Tailwind CSS v4.
// Al importarlo aquí, sus clases utilitarias quedan disponibles en toda la aplicación.
import './index.css';

// Importamos el componente raíz <App />, que contiene el enrutador y la estructura visual.
import App from './App.jsx';

// 1. Buscamos el elemento contenedor en el DOM del navegador.
const contenedorHtml = document.getElementById('root');

// 2. Creamos la raíz de React enlazada a ese elemento.
const raizReact = createRoot(contenedorHtml);

// 3. Renderizamos la aplicación envuelta en StrictMode.
raizReact.render(
  <StrictMode>
    <App />
  </StrictMode>
);
