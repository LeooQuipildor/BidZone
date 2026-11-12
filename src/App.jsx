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
          {/* Páginas públicas (no requieren iniciar sesión) */}
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<VistaIniciarSesion />} />
          <Route path="/register" element={<VistaRegistro />} />
          <Route path="/auctions" element={<VistaListaSubastas />} />
          <Route path="/auctions/:id" element={<VistaDetalleSubasta />} />
          <Route path="/rules" element={<VistaReglamentos />} />
          <Route path="/reglamentos" element={<Navigate to="/rules" replace />} />
          <Route path="/faq" element={<VistaPreguntasFrecuentes />} />
          <Route path="/preguntas-frecuentes" element={<Navigate to="/faq" replace />} />

          {/* Panel principal dinámico */}
          <Route
            path="/dashboard"
            element={
              <RutaProtegida>
                <VistaPanelControl />
              </RutaProtegida>
            }
          />

          {/* Subastas: crear y editar */}
          <Route
            path="/auctions/new"
            element={
              <RutaProtegida>
                <VistaCrearSubasta />
              </RutaProtegida>
            }
          />
          <Route
            path="/auctions/:id/edit"
            element={
              <RutaProtegida>
                <VistaEditarSubasta />
              </RutaProtegida>
            }
          />

          {/* Pujas: pestaña del panel + formularios directos */}
          <Route
            path="/bids"
            element={
              <RutaProtegida>
                <VistaPanelControl seccionInicial="pujas" />
              </RutaProtegida>
            }
          />
          <Route
            path="/bids/new"
            element={
              <RutaProtegida>
                <VistaCrearPuja />
              </RutaProtegida>
            }
          />
          <Route
            path="/bids/:id/edit"
            element={
              <RutaProtegida>
                <VistaEditarPuja />
              </RutaProtegida>
            }
          />

          {/* Reportes e infracciones (RN06) */}
          <Route
            path="/reports"
            element={
              <RutaProtegida>
                <VistaPanelControl seccionInicial="reportes" />
              </RutaProtegida>
            }
          />
          <Route
            path="/reports/new"
            element={
              <RutaProtegida>
                <VistaCrearReporte />
              </RutaProtegida>
            }
          />
          <Route
            path="/reports/:id/edit"
            element={
              <RutaProtegida>
                <VistaEditarReporte />
              </RutaProtegida>
            }
          />

          {/* Calificaciones y reputación (RN07) */}
          <Route
            path="/reviews"
            element={
              <RutaProtegida>
                <VistaPanelControl seccionInicial="resenas" />
              </RutaProtegida>
            }
          />
          <Route
            path="/reviews/new"
            element={
              <RutaProtegida>
                <VistaCrearResena />
              </RutaProtegida>
            }
          />
          <Route
            path="/reviews/:id/edit"
            element={
              <RutaProtegida>
                <VistaEditarResena />
              </RutaProtegida>
            }
          />

          {/* Usuarios y roles (solo administrador) */}
          <Route
            path="/users"
            element={
              <RutaProtegida rolesPermitidos={['admin']}>
                <VistaPanelControl seccionInicial="usuarios" />
              </RutaProtegida>
            }
          />
          <Route
            path="/users/new"
            element={
              <RutaProtegida rolesPermitidos={['admin']}>
                <VistaCrearUsuario />
              </RutaProtegida>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <RutaProtegida>
                <VistaEditarUsuario />
              </RutaProtegida>
            }
          />

          {/* Centro de notificaciones */}
          <Route
            path="/notifications"
            element={
              <RutaProtegida>
                <VistaPanelControl seccionInicial="notificaciones" />
              </RutaProtegida>
            }
          />

          {/* Ruta explícita y captura de enlaces inexistentes o no desarrollados */}
          <Route path="/404" element={<VistaError404 />} />
          <Route path="*" element={<VistaError404 />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
