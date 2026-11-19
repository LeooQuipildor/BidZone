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
