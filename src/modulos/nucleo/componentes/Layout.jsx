// ============================================================================
// ARCHIVO: src/modulos/nucleo/componentes/Layout.jsx
// RESPONSABILIDAD: Marco estructural de la aplicación (Shell / Master Layout).
// ============================================================================
//
// ¿QUÉ HACE ESTE COMPONENTE?
// Envuelve a todas las páginas de la aplicación dentro de <App />:
// 1. Dibuja la barra de navegación superior ('Navbar') y el pie de página ('Footer').
// 2. Gestiona el "Scroll Restoration": al cambiar de página, devuelve el scroll al tope (y=0).
// 3. Valida la sesión guardada en localStorage al montar la aplicación ('verificarSesion').
// 4. Si hay usuario conectado, dispara la descarga de sus notificaciones no leídas.
// 5. Ajusta el ancho del contenedor '<main>' según la página (ancho completo en Inicio,
//    contenedor amplio en Panel, contenedor estándar centrado en el resto).
// ============================================================================

import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { usarTiendaNotificaciones } from '../../notificaciones/estado/tiendaNotificaciones';
import { hayTokenSesion } from '../servicios/clienteApi';
import { mismoId } from '../utilidades/ayudas';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

// Lista de rutas que corresponden a secciones del Panel de Control
const RUTAS_PANEL = [
  '/panel',
  '/dashboard',
  '/pujas',
  '/bids',
  '/reportes',
  '/reports',
  '/resenas',
  '/reviews',
  '/usuarios',
  '/users',
  '/notificaciones',
  '/notifications',
];

export function Layout({ children }) {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const rutaAnteriorRef = useRef(ubicacion.pathname);

  // ESTADO GLOBAL (Zustand)
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const verificarSesion = usarTiendaAutenticacion((estado) => estado.verificarSesion);
  const cerrarSesion = usarTiendaAutenticacion((estado) => estado.cerrarSesion);
  const notificaciones = usarTiendaNotificaciones((estado) => estado.notificaciones);
  const obtenerNotificaciones = usarTiendaNotificaciones((estado) => estado.obtenerNotificaciones);

  /**
   * EFECTO 1: Restauración de Scroll.
   * Se ejecuta cada vez que cambia la URL ('ubicacion.pathname').
   * Si la persona navegó a una página nueva, resetea el scroll arriba instantáneamente.
   */
  useEffect(() => {
    const cambioDePagina = rutaAnteriorRef.current !== ubicacion.pathname;
    rutaAnteriorRef.current = ubicacion.pathname;

    if (cambioDePagina) {
      window.scrollTo(0, 0);
    } else if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [ubicacion.pathname, ubicacion.search, ubicacion.key]);

  /**
   * EFECTO 2: Verificación de sesión al arrancar.
   * Si existe un token JWT en localStorage, le consulta al backend si sigue vigente.
   */
  useEffect(() => {
    if (hayTokenSesion()) verificarSesion();
  }, [verificarSesion]);

  /**
   * EFECTO 3: Carga de notificaciones del usuario logueado.
   * Si el usuario se conecta, descarga sus notificaciones para mostrar el globito numérico.
   */
  useEffect(() => {
    if (usuarioActual?.id) obtenerNotificaciones();
  }, [usuarioActual?.id, obtenerNotificaciones]);

  const esInicio = ubicacion.pathname === '/';
  const esPanel = RUTAS_PANEL.includes(ubicacion.pathname);

  // Calcula cuántas notificaciones pertenecen al usuario conectado y están sin leer
  const cantidadSinLeer = usuarioActual
    ? notificaciones.filter((item) => mismoId(item.userId, usuarioActual.id) && !item.read).length
    : 0;

  // Ajuste de anchura del contenedor principal según la vista
  let claseContenido = 'flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-5 pb-12';
  if (esInicio) claseContenido = 'flex-1 w-full';
  else if (esPanel) claseContenido = 'flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-6 pt-5 pb-12';

  /**
   * Manejador para cerrar sesión: limpia el estado en Zustand y redirige al inicio ('/').
   */
  function manejarCierreSesion() {
    cerrarSesion();
    navegar('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EAFFD0] text-[#0D0D0D]">
      {/* Barra de navegación superior */}
      <Navbar
        esInicio={esInicio}
        usuarioActual={usuarioActual}
        cantidadSinLeer={cantidadSinLeer}
        alCerrarSesion={manejarCierreSesion}
      />

      {/* Contenido dinámico inyectado por las rutas hijas de React Router */}
      <main className={claseContenido}>{children}</main>

      {/* Pie de página común */}
      <Footer />
    </div>
  );
}

