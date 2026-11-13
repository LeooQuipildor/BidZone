/**
 * ==============================================================================
 * ARCHIVO: src/modulos/subastas/componentes/VistaDetalleSubasta.jsx
 * ==============================================================================
 *
 * ¿QUÉ ES ESTE ARCHIVO?
 * Es el componente principal de la página de detalle de una subasta específica (ruta `/subastas/:id`).
 * Es el núcleo operativo donde los usuarios visualizan el lote, pujan en vivo y coordinan el cierre.
 *
 * ¿QUÉ HACE ESTE COMPONENTE?
 * 1. Obtiene el parámetro `id` de la URL mediante `useParams()`.
 * 2. Llama a `obtenerSubastaPorId(id)` en la tienda Zustand para traer la información más fresca del backend.
 * 3. Activa un temporizador condicional con `useRelojSegundo` solo mientras el lote se encuentre activo.
 * 4. Procesa y estructura la información del lote mediante la función de negocio `prepararDatosDetalleSubasta`:
 *    - Filtra las pujas correspondientes a este lote.
 *    - Asocia los perfiles del vendedor y del ganador.
 *    - Determina si el usuario logueado es el vendedor o un administrador.
 *    - Evalúa la Regla RN05: Si la subasta concluyó, verifica si corresponde desbloquear los datos de contacto.
 * 5. Distribuye la interfaz en dos columnas responsivas:
 *    - Columna Izquierda: Ficha técnica y galería (`FichaProductoSubasta`) y Sala de Contacto Privado (`PanelContactoSubasta`).
 *    - Columna Derecha: Consola interactiva de ofertas e historial de postores (`PanelPujasSubasta`).
 * 6. Provee barra de herramientas superior para volver al catálogo, editar (si es el vendedor) o moderar (si es admin).
 *
 * CONCEPTOS DIDÁCTICOS EXPLICADOS:
 * - Temporizador Condicional para Ahorro de Recursos:
 *   `useRelojSegundo(Boolean(subasta?.endTime && subasta?.status === 'activa'))`
 *   Si la subasta ya está finalizada, el hook detiene el intervalo `setInterval`, evitando consumo
 *   innecesario de CPU y batería en el dispositivo del cliente.
 * - Desestructuración de Objetos con Roles y Reglas de Negocio:
 *   Toda la lógica de permisos (¿es vendedor?, ¿es admin?, ¿puede ver el teléfono?) está centralizada
 *   en `prepararDatosDetalleSubasta` para mantener la vista limpia y declarativa.
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { usarTiendaSubastas } from '../estado/tiendaSubastas';
import { usarTiendaPujas } from '../../pujas/estado/tiendaPujas';
import { usarTiendaAutenticacion } from '../../autenticacion/estado/tiendaAutenticacion';
import { prepararDatosDetalleSubasta } from '../utilidades/filtrosSubasta';
import { FichaProductoSubasta } from './FichaProductoSubasta';
import { PanelContactoSubasta } from './PanelContactoSubasta';
import { PanelPujasSubasta } from './PanelPujasSubasta';
import { PanelSolicitudCorreccion } from './PanelSolicitudCorreccion';
import { Button } from '../../nucleo/diseno/ui';
import { Alert, Loading, ErrorCard } from '../../nucleo/diseno/uiFeedback';
import { buscarPorId, mismoId, useRelojSegundo } from '../../nucleo/utilidades/ayudas';

export function VistaDetalleSubasta() {
  /**
   * Hook `useParams`:
   * Lee el ID del lote desde la ruta del navegador.
   */
  const { id } = useParams();
  const navegar = useNavigate();

  /**
   * Suscripciones a la tienda Zustand de subastas:
   */
  const subastas = usarTiendaSubastas((estado) => estado.subastas);
  const detalleSubastaActual = usarTiendaSubastas((estado) => estado.detalleSubastaActual);
  const cargandoDetalle = usarTiendaSubastas((estado) => estado.cargandoDetalle);
  const errorTienda = usarTiendaSubastas((estado) => estado.error);
  const obtenerSubastaPorId = usarTiendaSubastas((estado) => estado.obtenerSubastaPorId);
  const eliminarSubasta = usarTiendaSubastas((estado) => estado.eliminarSubasta);

  /**
   * Suscripciones a tiendas de pujas y autenticación:
   */
  const pujas = usarTiendaPujas((estado) => estado.pujas);
  const crearPuja = usarTiendaPujas((estado) => estado.crearPuja);
  const usuarioActual = usarTiendaAutenticacion((estado) => estado.usuarioActual);
  const usuarios = usarTiendaAutenticacion((estado) => estado.usuarios);

  // Estados locales para mensajes y modal de moderación
  const [mensajeError, setMensajeError] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');
  const [solicitandoEdicion, setSolicitandoEdicion] = useState(false);

  /**
   * Hook `useEffect`:
   * Solicita al backend el detalle de la subasta cada vez que cambia el ID de la URL
   * o el usuario autenticado.
   */
  useEffect(() => {
    obtenerSubastaPorId(id);
  }, [id, usuarioActual?.id, obtenerSubastaPorId]);

  // Resolución de la subasta a partir del caché o del detalle cargado
  const detalleEncontrado =
    detalleSubastaActual && mismoId(detalleSubastaActual.id, id) ? detalleSubastaActual : null;
  const subasta = detalleEncontrado || buscarPorId(subastas, id);

  /**
   * Custom hook de tiempo: Solo corre mientras la subasta esté abierta y en vivo
   */
  const ahoraMs = useRelojSegundo(Boolean(subasta?.endTime && subasta?.status === 'activa'));

  // Estado de carga inicial
  if (cargandoDetalle && !subasta) return <Loading text="Cargando subasta..." />;

  // Estado de error si el ID no corresponde a ninguna subasta existente
  if (!subasta) {
    return (
      <ErrorCard
        title="Subasta no encontrada"
        message={errorTienda || 'El artículo que buscas no existe o fue eliminado.'}
        backLabel="Volver al catálogo"
        onBack={() => navegar('/subastas')}
      />
    );
  }

  /**
   * Función utilitaria de dominio:
   * Calcula datos enriquecidos, identifica al ganador y evalúa el permiso de contacto (RN05).
   */
  const { pujasSubasta, vendedor, ganador, esVendedor, esAdmin, puedeVerContactoDesbloqueado } =
    prepararDatosDetalleSubasta({
      subasta,
      detalleEncontrado,
      pujas,
      usuarios,
      usuarioActual,
    });

  /**
   * Manejador de cancelación o eliminación de la subasta por parte de un Administrador.
   */
  async function manejarEliminacionAdmin() {
    if (!window.confirm(`¿Confirmas cancelar y eliminar la subasta "${subasta.title}"?`)) {
      return;
    }
    setMensajeError('');
    try {
      await eliminarSubasta(subasta.id);
      navegar('/subastas');
    } catch (error) {
      setMensajeError(error.message);
    }
  }

  return (
    <div className="space-y-8">
      {/* Barra superior de navegación y acciones rápidas según el rol */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
        <Button variant="outline" size="sm" onClick={() => navegar('/subastas')}>
          <ArrowLeft className="w-4 h-4" />
          Volver al Catálogo
        </Button>

        {/* Acciones de Propietario o Administrador */}
        {(esVendedor || esAdmin) && (
          <div className="flex items-center gap-2">
            {esVendedor ? (
              <Link to={`/subastas/${subasta.id}/editar`}>
                <Button variant="outline" size="sm">Editar Subasta</Button>
              </Link>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => setSolicitandoEdicion(true)}>
                  <AlertTriangle className="w-4 h-4" />
                  Solicitar revisión
                </Button>
                <Button variant="danger" size="sm" onClick={manejarEliminacionAdmin}>
                  <Trash2 className="w-4 h-4" />
                  Cancelar subasta
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de moderación disciplinaria si el administrador solicita revisión */}
      <PanelSolicitudCorreccion
        enModal
        subasta={solicitandoEdicion ? subasta : null}
        alExito={(texto) => {
          setMensajeExito(texto);
          setSolicitandoEdicion(false);
        }}
        alCancelar={() => setSolicitandoEdicion(false)}
      />

      {/* Alertas de error o éxito en pantalla */}
      {mensajeError && (
        <Alert type="error" onClose={() => setMensajeError('')}>{mensajeError}</Alert>
      )}
      {mensajeExito && (
        <Alert type="success" onClose={() => setMensajeExito('')}>{mensajeExito}</Alert>
      )}

      {/* Cuadrícula de 12 columnas: 7 para producto/contacto y 5 para pujas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Columna Izquierda: Ficha del Producto y Panel de Contacto Directo RN05 */}
        <div className="lg:col-span-7 space-y-6">
          <FichaProductoSubasta key={subasta.id} subasta={subasta} vendedor={vendedor} />
          <PanelContactoSubasta
            subasta={subasta}
            vendedor={vendedor}
            ganador={ganador}
            puedeVerContactoDesbloqueado={puedeVerContactoDesbloqueado}
            esVendedor={esVendedor}
          />
        </div>

        {/* Columna Derecha: Consola de Ofertas e Historial Auditable de Pujas */}
        <PanelPujasSubasta
          key={subasta.id}
          subasta={subasta}
          pujasSubasta={pujasSubasta}
          usuarios={usuarios}
          usuarioActual={usuarioActual}
          ahoraMs={ahoraMs}
          esVendedor={esVendedor}
          alCrearPuja={crearPuja}
          alExito={setMensajeExito}
          alError={setMensajeError}
        />
      </div>
    </div>
  );
}
