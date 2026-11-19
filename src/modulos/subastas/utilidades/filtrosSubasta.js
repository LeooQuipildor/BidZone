import {
  buscarPorId,
  coincideConBusqueda,
  mismoId,
} from '../../nucleo/utilidades/ayudas';

function coincideEstadoSubasta(subasta, estadoFiltro, ahoraMs) {
  if (estadoFiltro === 'todas') return subasta.estado !== 'cancelada';
  if (estadoFiltro === 'finalizada') return subasta.estado === 'finalizada';

  const fechaFinMs = new Date(subasta.fechaFin).getTime();
  const estaActiva =
    subasta.estado === 'activa' && !Number.isNaN(fechaFinMs) && fechaFinMs > ahoraMs;
  if (!estaActiva) return false;
  if (estadoFiltro === 'activa') return true;

  const ahora = new Date(ahoraMs);
  const finHoyMs = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1).getTime();
  if (estadoFiltro === 'terminaHoy') return fechaFinMs < finHoyMs;

  if (estadoFiltro === 'terminaManana') {
    const finMananaMs = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 2).getTime();
    return fechaFinMs >= finHoyMs && fechaFinMs < finMananaMs;
  }

  return subasta.estado === estadoFiltro;
}

export function filtrarYOrdenarSubastas(
  subastas,
  textoBusqueda,
  categoria,
  estadoFiltro,
  ordenarPor,
  ahoraMs = Date.now()
) {
  // 1. Filtrado multidimensional
  const filtradas = subastas.filter((subasta) => {
    const coincideTexto = coincideConBusqueda(
      [subasta.titulo, subasta.descripcion, subasta.categoria],
      textoBusqueda
    );
    const coincideCategoria = categoria === 'Todas' || subasta.categoria === categoria;
    const coincideEstado = coincideEstadoSubasta(subasta, estadoFiltro, ahoraMs);
    return coincideTexto && coincideCategoria && coincideEstado;
  });

  // 2. Ordenamiento según el criterio elegido
  return filtradas.sort((subastaA, subastaB) => {
    if (ordenarPor === 'menorPrecio') {
      return Number(subastaA.precioActual) - Number(subastaB.precioActual);
    }
    if (ordenarPor === 'mayorPrecio') {
      return Number(subastaB.precioActual) - Number(subastaA.precioActual);
    }
    // Por defecto: próximas a cerrar (las de menor fecha de fin van primero)
    return new Date(subastaA.fechaFin).getTime() - new Date(subastaB.fechaFin).getTime();
  });
}

export function prepararDatosDetalleSubasta({
  subasta,
  detalleEncontrado,
  pujas,
  usuarios,
  usuarioActual,
  ahoraMs = Date.now(),
}) {
  // 1. Obtenemos las pujas de la subasta (priorizando las del detalle devuelto por la API)
  const pujasBase = Array.isArray(detalleEncontrado?.pujas)
    ? detalleEncontrado.pujas
    : pujas.filter((puja) => mismoId(puja.subastaId, subasta.id));

  // 2. Ordenamos las pujas de forma descendente (la mayor oferta queda en la posición 0)
  const pujasSubasta = [...pujasBase].sort(
    (pujaA, pujaB) => Number(pujaB.monto) - Number(pujaA.monto)
  );

  // 3. Identificamos los datos del vendedor
  const vendedor = detalleEncontrado?.vendedor ||
    buscarPorId(usuarios, subasta.vendedorId) || {
      id: subasta.vendedorId,
      nombre: subasta.nombreVendedor || 'Vendedor',
      reputacion: subasta.reputacionVendedor || 5.0,
      telefono: subasta.telefonoVendedor,
      correo: subasta.correoVendedor,
      ciudad: subasta.ciudadVendedor,
    };

  const fechaFinMs = new Date(subasta.fechaFin).getTime();
  const tiempoExpirado = !Number.isNaN(fechaFinMs) && fechaFinMs <= ahoraMs;
  const esFinalizada = subasta.estado === 'finalizada' || tiempoExpirado;

  // 4. Identificamos al ganador (si la subasta ya concluyó y fue adjudicada)
  let ganador = detalleEncontrado?.ganador || null;
  if (!ganador && subasta.ganadorId) {
    ganador = buscarPorId(usuarios, subasta.ganadorId) || {
      id: subasta.ganadorId,
      nombre: subasta.nombreGanador || 'Ganador',
      telefono: subasta.telefonoGanador,
      correo: subasta.correoGanador,
      ciudad: subasta.ciudadGanador,
    };
  }

  // Si la subasta finalizó (por estado o por tiempo) y tiene pujas, el ganador es el líder de la oferta más alta
  if (!ganador && esFinalizada && pujasSubasta.length > 0) {
    const mejorPuja = pujasSubasta[0];
    ganador = buscarPorId(usuarios, mejorPuja.postorId) || {
      id: mejorPuja.postorId,
      nombre: mejorPuja.nombrePostor || 'Ganador',
    };
  }

  // 5. Calculamos roles de autorización del usuario actual
  const esVendedor = Boolean(usuarioActual && mismoId(usuarioActual.id, subasta.vendedorId));
  const esAdmin = usuarioActual?.rol === 'admin';
  const esGanador = Boolean(usuarioActual && ganador && mismoId(usuarioActual.id, ganador.id));

  // 6. Aplicamos la regla RN05 de liberación condicional de contacto
  const puedeVerContactoDesbloqueado =
    detalleEncontrado?.contactoLiberado !== undefined
      ? Boolean(detalleEncontrado.contactoLiberado)
      : Boolean(esFinalizada && ganador && (esVendedor || esAdmin || esGanador));

  return {
    pujasSubasta,
    vendedor,
    ganador,
    esVendedor,
    esAdmin,
    esGanador,
    esFinalizada,
    puedeVerContactoDesbloqueado,
  };
}

