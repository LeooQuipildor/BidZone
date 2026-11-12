import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { usarTiendaNotificaciones } from '../../notificaciones/estado/tiendaNotificaciones';
import { mismoId } from '../utilidades/ayudas';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

const RUTAS_PANEL = ['/dashboard', '/bids', '/reports', '/reviews', '/users', '/notifications'];

// Estructura general que envuelve todas las páginas con Navbar, contenido y Footer
export function Layout({ children }) {
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const rutaAnteriorRef = useRef(ubicacion.pathname);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const verificarSesion = usarTiendaAutenticacion((estado) => estado.verificarSesion);
  const cerrarSesion = usarTiendaAutenticacion((estado) => estado.cerrarSesion);
  const notificaciones = usarTiendaNotificaciones((estado) => estado.notificaciones);
  const obtenerNotificaciones = usarTiendaNotificaciones((estado) => estado.obtenerNotificaciones);

  // Al cambiar de página vamos arriba al instante; si se toca el enlace actual, subimos suave
  useEffect(() => {
    const cambioDePagina = rutaAnteriorRef.current !== ubicacion.pathname;
    rutaAnteriorRef.current = ubicacion.pathname;

    if (cambioDePagina) {
      window.scrollTo(0, 0);
    } else if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [ubicacion.pathname, ubicacion.search, ubicacion.key]);

  // Al iniciar la app, validamos el token guardado si existe
  useEffect(() => {
    if (localStorage.getItem('bidzone_token')) verificarSesion();
  }, [verificarSesion]);

  // Cuando la persona inicia sesión, cargamos sus notificaciones
  useEffect(() => {
    if (usuarioActual?.id) obtenerNotificaciones();
  }, [usuarioActual?.id, obtenerNotificaciones]);

  const esInicio = ubicacion.pathname === '/';
  const esPanel = RUTAS_PANEL.includes(ubicacion.pathname);
  const cantidadSinLeer = usuarioActual
    ? notificaciones.filter((item) => mismoId(item.userId, usuarioActual.id) && !item.read).length
    : 0;

  let claseContenido = 'flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-5 pb-12';
  if (esInicio) claseContenido = 'flex-1 w-full';
  else if (esPanel) claseContenido = 'flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-6 pt-5 pb-12';

  function manejarCierreSesion() {
    cerrarSesion();
    navegar('/');
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#EAFFD0] text-[#0D0D0D]">
      <Navbar
        esInicio={esInicio}
        usuarioActual={usuarioActual}
        cantidadSinLeer={cantidadSinLeer}
        alCerrarSesion={manejarCierreSesion}
      />
      <main className={claseContenido}>{children}</main>
      <Footer />
    </div>
  );
}

