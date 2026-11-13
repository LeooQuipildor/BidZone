// ============================================================================
// ARCHIVO: src/modulos/nucleo/utilidades/ayudas.js
// RESPONSABILIDAD: Funciones auxiliares puras y custom hooks reutilizables.
// ============================================================================
//
// ¿POR QUÉ EXISTEN ESTAS FUNCIONES?
// En JavaScript y React es una buena práctica aislar la lógica matemática, de
// comparación y de manipulación de listas en funciones "puras" (funciones que
// reciben datos por parámetro y devuelven un resultado sin alterar nada externo).
//
// BENEFICIOS:
// 1. Reutilización: La misma función sirve para subastas, pujas, usuarios y reportes.
// 2. Facilidad de lectura: El código de los componentes queda limpio y legible.
// 3. Facilidad de pruebas: Se pueden testear sin montar componentes gráficos.
// ============================================================================

import { useEffect, useState } from 'react';
import { formatearMoneda } from './formatos';

/**
 * Custom Hook: useRelojSegundo
 * 
 * ¿QUÉ HACE?
 * Mantiene un estado reactivo con la marca de tiempo actual (en milisegundos)
 * y lo actualiza exactamente una vez cada segundo (1000 ms).
 * 
 * ¿DÓNDE Y PARA QUÉ SE UTILIZA?
 * En componentes con temporizadores en vivo (ej: 'VistaDetalleSubasta', 'TarjetaSubasta',
 * 'PanelPujasSubasta'). Al actualizarse cada segundo, provoca que el componente se
 * re-renderice suavemente recalculando el tiempo restante ("02h 45m 12s").
 * 
 * CONCEPTOS CLAVE:
 * - 'setInterval': Temporizador nativo del navegador que ejecuta un callback periódicamente.
 * - 'clearInterval': Función de limpieza fundamental para evitar "fugas de memoria".
 *   Si el usuario cambia de página y el componente se desmonta, el temporizador se detiene.
 * 
 * @param {boolean} activo - Si es 'false', desactiva el temporizador (ahorra recursos).
 * @returns {number} - Timestamp actual devuelto por Date.now().
 */
export function useRelojSegundo(activo = true) {
  // Inicializamos el estado con la marca de tiempo actual
  const [ahoraMs, setAhoraMs] = useState(() => Date.now());

  useEffect(() => {
    // Si no está activo (por ejemplo, si la subasta ya finalizó), no creamos intervalo
    if (!activo) return undefined;

    // Creamos el intervalo que actualiza el estado cada 1000 milisegundos
    const intervalo = setInterval(() => setAhoraMs(Date.now()), 1000);

    // FUNCIÓN DE LIMPIEZA (Cleanup): React la ejecuta al desmontar el componente
    return () => clearInterval(intervalo);
  }, [activo]);

  return ahoraMs;
}

/**
 * Compara dos identificadores (IDs) asegurando equivalencia numérica.
 * 
 * ¿POR QUÉ ES NECESARIA?
 * En JavaScript, el operador estricto '1 === "1"' da 'false' porque uno es tipo 'number'
 * y el otro es 'string'. En aplicaciones web, los IDs que vienen de URLs ('useParams')
 * o de elementos <select> son texto ("42"), mientras que en la base de datos son números (42).
 * Esta función los convierte a número antes de comparar, evitando errores invisibles.
 * 
 * @param {string|number} idA - Primer identificador.
 * @param {string|number} idB - Segundo identificador.
 * @returns {boolean} - 'true' si ambos representan el mismo número.
 */
export function mismoId(idA, idB) {
  if (idA === null || idA === undefined || idA === '') return false;
  if (idB === null || idB === undefined || idB === '') return false;
  return Number(idA) === Number(idB);
}

/**
 * Busca un elemento dentro de un array comparando su propiedad '.id'.
 * Utiliza el método estándar 'Array.prototype.find'.
 * 
 * @param {Array} lista - Array de objetos con propiedad 'id'.
 * @param {string|number} id - Identificador buscado.
 * @returns {object|null} - El objeto encontrado o 'null' si no existe.
 */
export function buscarPorId(lista, id) {
  if (!Array.isArray(lista)) return null;
  return lista.find((elemento) => mismoId(elemento.id, id)) || null;
}

/**
 * Reemplaza de forma INMUTABLE un elemento dentro de una lista.
 * 
 * CONCEPTO DE INMUTABILIDAD EN REACT:
 * En React NUNCA debemos mutar directamente un array del estado (ej: 'lista[i] = nuevo').
 * Debemos crear una copia nueva del array. 'Array.prototype.map' recorre el array y
 * devuelve uno completamente nuevo con el elemento sustituido.
 * 
 * @param {Array} lista - Array original.
 * @param {string|number} id - ID del elemento a reemplazar.
 * @param {object} elementoNuevo - Objeto con los datos actualizados.
 * @returns {Array} - Nuevo array con el reemplazo efectuado.
 */
export function reemplazarPorId(lista, id, elementoNuevo) {
  return lista.map((elemento) => (mismoId(elemento.id, id) ? elementoNuevo : elemento));
}

/**
 * Elimina de forma inmutable un elemento de una lista mediante 'Array.prototype.filter'.
 * 
 * @param {Array} lista - Array original.
 * @param {string|number} id - ID del elemento a quitar.
 * @returns {Array} - Nuevo array sin el elemento indicado.
 */
export function eliminarPorId(lista, id) {
  return lista.filter((elemento) => !mismoId(elemento.id, id));
}

/**
 * Agrega un elemento al inicio de la lista o lo actualiza si ya existía (Upsert).
 * Usa el operador Spread ('[elemento, ...lista]') para crear un nuevo array sin mutar.
 * 
 * @param {Array} lista - Array actual.
 * @param {object} elemento - Elemento a insertar o actualizar.
 * @returns {Array} - Nuevo array con el elemento ubicado al frente.
 */
export function agregarOActualizarPorId(lista, elemento) {
  if (buscarPorId(lista, elemento.id)) {
    return reemplazarPorId(lista, elemento.id, elemento);
  }
  return [elemento, ...lista];
}

/**
 * Elige un ID válido dentro de una lista de opciones para elementos <Select>.
 * Garantiza que el formulario nunca quede con un valor huérfano que no figure en las opciones.
 * Prioridad: 1° ID preferido -> 2° ID alternativo -> 3° Primer elemento de la lista.
 * 
 * @param {Array} lista - Opciones disponibles.
 * @param {string|number} idPreferido - Opción deseada inicialmente.
 * @param {string|number} idAlternativo - Opción secundaria de respaldo.
 * @returns {string} - ID en formato string listo para el input <select>.
 */
export function elegirIdValido(lista, idPreferido, idAlternativo = '') {
  if (!Array.isArray(lista) || lista.length === 0) return '';
  if (buscarPorId(lista, idPreferido)) return String(idPreferido);
  if (buscarPorId(lista, idAlternativo)) return String(idAlternativo);
  return String(lista[0].id);
}

/**
 * Comprueba si alguno de los textos provistos contiene el término de búsqueda.
 * Es insensible a mayúsculas/minúsculas ('toLowerCase') y elimina espacios ('trim').
 * 
 * @param {Array<string>} campos - Lista de textos a evaluar (ej: [título, vendedor, descripción]).
 * @param {string} textoBuscado - Lo que escribió el usuario en el buscador.
 * @returns {boolean} - 'true' si hay coincidencia o si la búsqueda está en blanco.
 */
export function coincideConBusqueda(campos, textoBuscado) {
  if (!textoBuscado || !textoBuscado.trim()) return true;
  const filtro = textoBuscado.trim().toLowerCase();
  return campos.some((campo) => String(campo || '').toLowerCase().includes(filtro));
}

/**
 * Calcula el importe mínimo sugerido para una nueva puja según la Regla de Negocio RN01.
 * RN01: Toda nueva puja debe superar la líder actual por al menos el incremento mínimo ('minIncrement').
 * 
 * @param {object} subasta - Datos de la subasta con 'currentPrice' y 'minIncrement'.
 * @returns {string} - Número en formato texto para inicializar el input del formulario.
 */
export function obtenerMontoPujaSugerido(subasta) {
  if (!subasta) return '';
  const minimo = Number(subasta.currentPrice) + Number(subasta.minIncrement);
  return String(minimo);
}

/**
 * Calcula el tope máximo de oferta permitido (10 veces el precio inicial de la subasta).
 * Protege contra errores tipográficos graves (ej: tipear $100.000.000 en vez de $100.000).
 * 
 * @param {object} subasta - Datos de la subasta.
 * @returns {number|undefined} - Límite superior numérico.
 */
export function obtenerMontoPujaMaximo(subasta) {
  if (!subasta) return undefined;
  const precioInicial = Number(subasta.basePrice || subasta.currentPrice);
  return precioInicial * 10;
}

/**
 * Validador síncrono del lado del cliente para ofertas de subasta.
 * Se ejecuta antes de abrir la ventana de confirmación o enviar la llamada a la API.
 * 
 * COMPROBACIONES:
 * 1. Verifica que la subasta exista.
 * 2. Verifica que el monto sea un número positivo mayor que cero.
 * 3. Aplica RN01: monto >= currentPrice + minIncrement.
 * 4. Aplica límite de seguridad de 10 veces el precio base.
 * 5. Aplica RN04: exige confirmación explícita del compromiso vinculante.
 * 
 * @returns {string} - Mensaje de error legible para el usuario o cadena vacía '' si es válida.
 */
export function validarDatosPuja({
  subasta,
  monto,
  compromisoAceptado,
  validarMaximo = true,
}) {
  if (!subasta) return 'Debes seleccionar una subasta activa.';

  const montoNumerico = Number(monto);
  if (!monto || Number.isNaN(montoNumerico) || montoNumerico <= 0) {
    return 'Por favor ingresa un monto numérico válido para ofertar.';
  }

  const minimoPermitido = Number(subasta.currentPrice) + Number(subasta.minIncrement);
  if (montoNumerico < minimoPermitido) {
    return `RN01: La oferta debe ser de al menos ${formatearMoneda(minimoPermitido)} (Precio actual + incremento mínimo).`;
  }

  if (validarMaximo) {
    const maximoPermitido = obtenerMontoPujaMaximo(subasta);
    if (maximoPermitido && montoNumerico > maximoPermitido) {
      return `La oferta no puede superar 10 veces el precio inicial de la subasta (${formatearMoneda(maximoPermitido)}).`;
    }
  }

  if (!compromisoAceptado) {
    return 'Debes aceptar el compromiso vinculante (RN04) antes de enviar tu oferta.';
  }

  return '';
}

/**
 * Divide cualquier lista de elementos en páginas numéricas.
 * 
 * MATEMÁTICA DE LA PAGINACIÓN:
 * 1. 'totalPaginas = Math.ceil(totalElementos / porPagina)': Redondea hacia arriba para incluir sobrantes.
 * 2. 'paginaSegura = Math.min(Math.max(1, solicitada), totalPaginas)': Evita páginas negativas o superiores al total.
 * 3. 'inicio = (paginaActual - 1) * porPagina': Posición inicial en el array para 'slice()'.
 * 
 * @param {Array} elementos - Listado completo de elementos a paginar.
 * @param {number} paginaSolicitada - Número de página deseado (1, 2, 3...).
 * @param {number} porPagina - Cantidad máxima de elementos por pantalla.
 * @returns {{ elementosPagina: Array, paginaActual: number, totalPaginas: number }}
 */
export function paginarLista(elementos, paginaSolicitada, porPagina) {
  const totalPaginas = Math.max(1, Math.ceil(elementos.length / porPagina));
  const paginaActual = Math.min(Math.max(1, paginaSolicitada), totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;

  return {
    elementosPagina: elementos.slice(inicio, inicio + porPagina),
    paginaActual,
    totalPaginas,
  };
}

