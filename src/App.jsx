// ============================================================================
// ARCHIVO: src/App.jsx
// RESPONSABILIDAD: Componente raíz de enrutamiento y arquitectura de vistas.
// ============================================================================
//
// ¿QUÉ HACE ESTE ARCHIVO?
// Configura el enrutador de la aplicación (SPA - Single Page Application) utilizando
// la librería 'react-router-dom'. Aquí se asocia cada URL del navegador con la vista
// o componente que debe mostrarse en pantalla.
//
// CONCEPTOS FUNDAMENTALES DE REACT ROUTER:
// 1. <BrowserRouter>: Utiliza la API History del navegador (HTML5 pushState) para
//    cambiar la URL sin que el navegador tenga que recargar la página entera desde el servidor.
// 2. <Routes>: Contenedor que evalúa la URL actual y elige el primer <Route> que coincida.
// 3. <Route path="..." element={<Componente />}>: Declara la regla: "Cuando la URL sea 'path',
//    muestra este 'element'".
// 4. Parámetros dinámicos (:id): Por ejemplo en '/subastas/:id', el segmento ':id' es variable.
//    El componente hijo puede leerlo usando el hook 'useParams()'.
// 5. Redirecciones con <Navigate to="..." replace />: Redirigen de forma transparente rutas
//    anteriores en inglés (/auctions, /login) hacia sus equivalentes en español.
// 6. <RutaProtegida>: Componente guardián que verifica si hay una sesión activa antes de
//    permitir ver una pantalla privada. Si no la hay, redirige al usuario a '/iniciar-sesion'.
// ============================================================================

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Componentes estructurales transversales (módulo núcleo)
import { Layout } from './modulos/nucleo/componentes/Layout';
import { Inicio } from './modulos/nucleo/componentes/Inicio';
import { VistaReglamentos } from './modulos/nucleo/componentes/VistaReglamentos';
import { VistaPreguntasFrecuentes } from './modulos/nucleo/componentes/VistaPreguntasFrecuentes';
import { VistaError404 } from './modulos/nucleo/componentes/VistaError404';
import { VistaPanelControl } from './modulos/nucleo/componentes/VistaPanelControl';
import { RutaProtegida } from './modulos/nucleo/componentes/RutaProtegida';

// Componentes del módulo de Autenticación y Cuentas
import { VistaIniciarSesion } from './modulos/autenticacion/componentes/VistaIniciarSesion';
import { VistaRegistro } from './modulos/autenticacion/componentes/VistaRegistro';
import { VistaCrearUsuario } from './modulos/autenticacion/componentes/VistaCrearUsuario';
import { VistaEditarUsuario } from './modulos/autenticacion/componentes/VistaEditarUsuario';

// Componentes del módulo de Subastas
import { VistaListaSubastas } from './modulos/subastas/componentes/VistaListaSubastas';
import { VistaCrearSubasta } from './modulos/subastas/componentes/VistaCrearSubasta';
import { VistaEditarSubasta } from './modulos/subastas/componentes/VistaEditarSubasta';
import { VistaDetalleSubasta } from './modulos/subastas/componentes/VistaDetalleSubasta';

// Componentes del módulo de Pujas y Ofertas
import { VistaCrearPuja } from './modulos/pujas/componentes/VistaCrearPuja';
import { VistaEditarPuja } from './modulos/pujas/componentes/VistaEditarPuja';

// Componentes del módulo de Reportes e Infracciones (Mesa de Mediación RN06)
import { VistaCrearReporte } from './modulos/reportes/componentes/VistaCrearReporte';
import { VistaEditarReporte } from './modulos/reportes/componentes/VistaEditarReporte';

// Componentes del módulo de Reseñas y Calificaciones Mutuas (RN07)
import { VistaCrearResena } from './modulos/resenas/componentes/VistaCrearResena';
import { VistaEditarResena } from './modulos/resenas/componentes/VistaEditarResena';

function App() {
  return (
    // <BrowserRouter> provee el contexto de navegación a todos los componentes hijos.
    <BrowserRouter>
      {/* <Layout> envuelve todas las páginas con la barra superior (Navbar) y el pie (Footer) */}
      <Layout>
        <Routes>
          {/* =================================================================
              SECCIÓN 1: PÁGINAS PÚBLICAS
              Cualquier visitante puede verlas sin necesidad de iniciar sesión.
              ================================================================= */}
          
          {/* Portada principal con buscador, hero y subastas destacadas */}
          <Route path="/" element={<Inicio />} />

          {/* Autenticación: Inicio de sesión y Registro de cuenta */}
          <Route path="/iniciar-sesion" element={<VistaIniciarSesion />} />
          <Route path="/login" element={<Navigate to="/iniciar-sesion" replace />} />
          <Route path="/registro" element={<VistaRegistro />} />
          <Route path="/register" element={<Navigate to="/registro" replace />} />

          {/* Catálogo general de subastas y detalle de un artículo específico */}
          <Route path="/subastas" element={<VistaListaSubastas />} />
          <Route path="/auctions" element={<Navigate to="/subastas" replace />} />
          <Route path="/subastas/:id" element={<VistaDetalleSubasta />} />
          <Route path="/auctions/:id" element={<Navigate to="/subastas/:id" replace />} />

          {/* Información institucional, reglamentos y preguntas frecuentes */}
          <Route path="/reglamentos" element={<VistaReglamentos />} />
          <Route path="/rules" element={<Navigate to="/reglamentos" replace />} />
          <Route path="/preguntas-frecuentes" element={<VistaPreguntasFrecuentes />} />
          <Route path="/faq" element={<Navigate to="/preguntas-frecuentes" replace />} />

          {/* =================================================================
              SECCIÓN 2: PANEL DE CONTROL Y VISTAS PRIVADAS
              Protegidas por <RutaProtegida>: si el usuario no inició sesión,
              se lo redirige automáticamente a la pantalla de login.
              ================================================================= */}

          {/* Panel de control unificado con pestañas laterales */}
          <Route path="/panel" element={<RutaProtegida><VistaPanelControl /></RutaProtegida>} />
          <Route path="/dashboard" element={<Navigate to="/panel" replace />} />

          {/* Crear y editar publicaciones de subastas */}
          <Route path="/subastas/nueva" element={<RutaProtegida><VistaCrearSubasta /></RutaProtegida>} />
          <Route path="/auctions/new" element={<Navigate to="/subastas/nueva" replace />} />
          <Route path="/subastas/:id/editar" element={<RutaProtegida><VistaEditarSubasta /></RutaProtegida>} />
          <Route path="/auctions/:id/edit" element={<Navigate to="/subastas/:id/editar" replace />} />

          {/* Ofertas vinculantes (Pujas): acceso al panel y formularios directos */}
          <Route path="/pujas" element={<RutaProtegida><VistaPanelControl seccionInicial="pujas" /></RutaProtegida>} />
          <Route path="/bids" element={<Navigate to="/pujas" replace />} />
          <Route path="/pujas/nueva" element={<RutaProtegida><VistaCrearPuja /></RutaProtegida>} />
          <Route path="/bids/new" element={<Navigate to="/pujas/nueva" replace />} />
          <Route path="/pujas/:id/editar" element={<RutaProtegida><VistaEditarPuja /></RutaProtegida>} />
          <Route path="/bids/:id/edit" element={<Navigate to="/pujas/:id/editar" replace />} />

          {/* Reclamos y mesa de mediación (RN06) */}
          <Route path="/reportes" element={<RutaProtegida><VistaPanelControl seccionInicial="reportes" /></RutaProtegida>} />
          <Route path="/reports" element={<Navigate to="/reportes" replace />} />
          <Route path="/reportes/nuevo" element={<RutaProtegida><VistaCrearReporte /></RutaProtegida>} />
          <Route path="/reports/new" element={<Navigate to="/reportes/nuevo" replace />} />
          <Route path="/reportes/:id/editar" element={<RutaProtegida><VistaEditarReporte /></RutaProtegida>} />
          <Route path="/reports/:id/edit" element={<Navigate to="/reportes/:id/editar" replace />} />

          {/* Calificaciones y reputación de 1 a 5 estrellas (RN07) */}
          <Route path="/resenas" element={<RutaProtegida><VistaPanelControl seccionInicial="resenas" /></RutaProtegida>} />
          <Route path="/reviews" element={<Navigate to="/resenas" replace />} />
          <Route path="/resenas/nueva" element={<RutaProtegida><VistaCrearResena /></RutaProtegida>} />
          <Route path="/reviews/new" element={<Navigate to="/resenas/nueva" replace />} />
          <Route path="/resenas/:id/editar" element={<RutaProtegida><VistaEditarResena /></RutaProtegida>} />
          <Route path="/reviews/:id/edit" element={<Navigate to="/resenas/:id/editar" replace />} />

          {/* Administración de usuarios (solo accesible para usuarios con rol 'admin') */}
          <Route path="/usuarios" element={<RutaProtegida rolesPermitidos={['admin']}><VistaPanelControl seccionInicial="usuarios" /></RutaProtegida>} />
          <Route path="/users" element={<Navigate to="/usuarios" replace />} />
          <Route path="/usuarios/nuevo" element={<RutaProtegida rolesPermitidos={['admin']}><VistaCrearUsuario /></RutaProtegida>} />
          <Route path="/users/new" element={<Navigate to="/usuarios/nuevo" replace />} />
          <Route path="/usuarios/:id/editar" element={<RutaProtegida><VistaEditarUsuario /></RutaProtegida>} />
          <Route path="/users/:id/edit" element={<Navigate to="/usuarios/:id/editar" replace />} />

          {/* Centro de notificaciones */}
          <Route path="/notificaciones" element={<RutaProtegida><VistaPanelControl seccionInicial="notificaciones" /></RutaProtegida>} />
          <Route path="/notifications" element={<Navigate to="/notificaciones" replace />} />

          {/* =================================================================
              SECCIÓN 3: RUTA POR DEFECTO / ERROR 404
              Si el usuario ingresa una URL que no coincide con ninguna anterior,
              se muestra la página de error amigable.
              ================================================================= */}
          <Route path="/404" element={<VistaError404 />} />
          <Route path="*" element={<VistaError404 />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
