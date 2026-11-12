import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './modulos/nucleo/componentes/Layout';
import { Inicio } from './modulos/nucleo/componentes/Inicio';
import { VistaReglamentos } from './modulos/nucleo/componentes/VistaReglamentos';
import { VistaPreguntasFrecuentes } from './modulos/nucleo/componentes/VistaPreguntasFrecuentes';
import { VistaError404 } from './modulos/nucleo/componentes/VistaError404';
import { VistaPanelControl } from './modulos/nucleo/componentes/VistaPanelControl';
import { RutaProtegida } from './modulos/nucleo/componentes/RutaProtegida';

import { VistaIniciarSesion } from './modulos/autenticacion/componentes/VistaIniciarSesion';
import { VistaRegistro } from './modulos/autenticacion/componentes/VistaRegistro';
import { VistaCrearUsuario } from './modulos/autenticacion/componentes/VistaCrearUsuario';
import { VistaEditarUsuario } from './modulos/autenticacion/componentes/VistaEditarUsuario';

import { VistaListaSubastas } from './modulos/subastas/componentes/VistaListaSubastas';
import { VistaCrearSubasta } from './modulos/subastas/componentes/VistaCrearSubasta';
import { VistaEditarSubasta } from './modulos/subastas/componentes/VistaEditarSubasta';
import { VistaDetalleSubasta } from './modulos/subastas/componentes/VistaDetalleSubasta';

import { VistaCrearPuja } from './modulos/pujas/componentes/VistaCrearPuja';
import { VistaEditarPuja } from './modulos/pujas/componentes/VistaEditarPuja';

import { VistaCrearReporte } from './modulos/reportes/componentes/VistaCrearReporte';
import { VistaEditarReporte } from './modulos/reportes/componentes/VistaEditarReporte';

import { VistaCrearResena } from './modulos/resenas/componentes/VistaCrearResena';
import { VistaEditarResena } from './modulos/resenas/componentes/VistaEditarResena';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Páginas públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/iniciar-sesion" element={<VistaIniciarSesion />} />
          <Route path="/login" element={<Navigate to="/iniciar-sesion" replace />} />
          <Route path="/registro" element={<VistaRegistro />} />
          <Route path="/register" element={<Navigate to="/registro" replace />} />

          <Route path="/subastas" element={<VistaListaSubastas />} />
          <Route path="/auctions" element={<Navigate to="/subastas" replace />} />
          <Route path="/subastas/:id" element={<VistaDetalleSubasta />} />
          <Route path="/auctions/:id" element={<VistaDetalleSubasta />} />

          <Route path="/reglamentos" element={<VistaReglamentos />} />
          <Route path="/rules" element={<Navigate to="/reglamentos" replace />} />
          <Route path="/preguntas-frecuentes" element={<VistaPreguntasFrecuentes />} />
          <Route path="/faq" element={<Navigate to="/preguntas-frecuentes" replace />} />

          {/* Panel de control dinámico */}
          <Route path="/panel" element={<RutaProtegida><VistaPanelControl /></RutaProtegida>} />
          <Route path="/dashboard" element={<Navigate to="/panel" replace />} />

          {/* Subastas: crear y editar */}
          <Route path="/subastas/nueva" element={<RutaProtegida><VistaCrearSubasta /></RutaProtegida>} />
          <Route path="/auctions/new" element={<Navigate to="/subastas/nueva" replace />} />
          <Route path="/subastas/:id/editar" element={<RutaProtegida><VistaEditarSubasta /></RutaProtegida>} />
          <Route path="/auctions/:id/edit" element={<Navigate to="/subastas/:id/editar" replace />} />

          {/* Pujas: pestaña del panel + formularios directos */}
          <Route path="/pujas" element={<RutaProtegida><VistaPanelControl seccionInicial="pujas" /></RutaProtegida>} />
          <Route path="/bids" element={<Navigate to="/pujas" replace />} />
          <Route path="/pujas/nueva" element={<RutaProtegida><VistaCrearPuja /></RutaProtegida>} />
          <Route path="/bids/new" element={<Navigate to="/pujas/nueva" replace />} />
          <Route path="/pujas/:id/editar" element={<RutaProtegida><VistaEditarPuja /></RutaProtegida>} />
          <Route path="/bids/:id/edit" element={<Navigate to="/pujas/:id/editar" replace />} />

          {/* Reportes e infracciones (RN06) */}
          <Route path="/reportes" element={<RutaProtegida><VistaPanelControl seccionInicial="reportes" /></RutaProtegida>} />
          <Route path="/reports" element={<Navigate to="/reportes" replace />} />
          <Route path="/reportes/nuevo" element={<RutaProtegida><VistaCrearReporte /></RutaProtegida>} />
          <Route path="/reports/new" element={<Navigate to="/reportes/nuevo" replace />} />
          <Route path="/reportes/:id/editar" element={<RutaProtegida><VistaEditarReporte /></RutaProtegida>} />
          <Route path="/reports/:id/edit" element={<Navigate to="/reportes/:id/editar" replace />} />

          {/* Calificaciones y reputación (RN07) */}
          <Route path="/resenas" element={<RutaProtegida><VistaPanelControl seccionInicial="resenas" /></RutaProtegida>} />
          <Route path="/reviews" element={<Navigate to="/resenas" replace />} />
          <Route path="/resenas/nueva" element={<RutaProtegida><VistaCrearResena /></RutaProtegida>} />
          <Route path="/reviews/new" element={<Navigate to="/resenas/nueva" replace />} />
          <Route path="/resenas/:id/editar" element={<RutaProtegida><VistaEditarResena /></RutaProtegida>} />
          <Route path="/reviews/:id/edit" element={<Navigate to="/resenas/:id/editar" replace />} />

          {/* Usuarios y roles (solo administrador para crear y listar) */}
          <Route path="/usuarios" element={<RutaProtegida rolesPermitidos={['admin']}><VistaPanelControl seccionInicial="usuarios" /></RutaProtegida>} />
          <Route path="/users" element={<Navigate to="/usuarios" replace />} />
          <Route path="/usuarios/nuevo" element={<RutaProtegida rolesPermitidos={['admin']}><VistaCrearUsuario /></RutaProtegida>} />
          <Route path="/users/new" element={<Navigate to="/usuarios/nuevo" replace />} />
          <Route path="/usuarios/:id/editar" element={<RutaProtegida><VistaEditarUsuario /></RutaProtegida>} />
          <Route path="/users/:id/edit" element={<Navigate to="/usuarios/:id/editar" replace />} />

          {/* Centro de notificaciones */}
          <Route path="/notificaciones" element={<RutaProtegida><VistaPanelControl seccionInicial="notificaciones" /></RutaProtegida>} />
          <Route path="/notifications" element={<Navigate to="/notificaciones" replace />} />

          {/* 404 */}
          <Route path="/404" element={<VistaError404 />} />
          <Route path="*" element={<VistaError404 />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
