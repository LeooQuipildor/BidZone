import { IMAGEN_SUBASTA_POR_DEFECTO } from '../../nucleo/utilidades/formatos';

// Galería complementaria específica para los lotes demo iniciales (IDs 101 a 105).
const FOTOS_POR_SUBASTA = {
  101: [
    'https://images.unsplash.com/photo-1559085715-23704349e326?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1541696823511-1f19e15774ff?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=900&q=80',
  ],
  102: [
    'https://images.unsplash.com/photo-1644571580646-7048372c491a?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=900&q=80',
  ],
  103: [
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1755436613093-10e44e9e86a4?auto=format&fit=crop&w=900&q=80',
  ],
  104: [
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1646153114001-495dfb56506d?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1548204085-a1d64c921d5e?auto=format&fit=crop&w=900&q=80',
  ],
  105: [
    'https://images.unsplash.com/photo-1616353071588-708dcff912e2?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1547043884-975a4f9ea025?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
  ],
};

// Devuelve exclusivamente las fotos de la subasta ingresadas por el usuario, sin generar imágenes aleatorias
export function obtenerFotosSubasta(subasta) {
  if (!subasta) return [IMAGEN_SUBASTA_POR_DEFECTO];

  // 1. Extraer todas las URLs de imágenes provistas por el usuario
  let fotosUsuario = [];
  if (Array.isArray(subasta.imagenes) && subasta.imagenes.length > 0) {
    fotosUsuario = subasta.imagenes.filter(
      (url) => typeof url === 'string' && url.trim().length > 0
    );
  } else if (typeof subasta.urlImagen === 'string' && subasta.urlImagen.trim().length > 0) {
    // Si contiene varias URLs separadas por coma o saltos de línea
    fotosUsuario = subasta.urlImagen
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  }

  // 2. Si es una de las subastas iniciales de demo (101 a 105) y no tiene fotos extras personalizadas, usamos las del demo
  const extrasDemo = FOTOS_POR_SUBASTA[Number(subasta.id)] || [];
  if (fotosUsuario.length <= 1 && extrasDemo.length > 0) {
    const principal = fotosUsuario[0] || subasta.urlImagen || IMAGEN_SUBASTA_POR_DEFECTO;
    const galeriaDemo = [principal];
    for (const extra of extrasDemo) {
      if (!galeriaDemo.includes(extra)) galeriaDemo.push(extra);
    }
    return galeriaDemo;
  }

  // 3. Para cualquier otra subasta: retornar EXCLUSIVAMENTE las imágenes provistas por el usuario
  if (fotosUsuario.length > 0) {
    return Array.from(new Set(fotosUsuario));
  }

  return [IMAGEN_SUBASTA_POR_DEFECTO];
}

