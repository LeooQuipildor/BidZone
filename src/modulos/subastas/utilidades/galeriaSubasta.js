import { IMAGEN_SUBASTA_POR_DEFECTO } from '../../nucleo/utilidades/formatos';

// Galería adicional por ID para las subastas iniciales de demostración
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

// Galería adicional según categoría para cualquier subasta publicada
const FOTOS_POR_CATEGORIA = {
  Tecnología: FOTOS_POR_SUBASTA[101],
  Gaming: FOTOS_POR_SUBASTA[102],
  'Hogar y Oficina': FOTOS_POR_SUBASTA[103],
  Deportes: FOTOS_POR_SUBASTA[104],
  Fotografía: FOTOS_POR_SUBASTA[105],
  Vehículos: [
    'https://images.unsplash.com/photo-1656252117732-2efa62265105?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1548204085-a1d64c921d5e?auto=format&fit=crop&w=900&q=80',
  ],
};

const FOTOS_RESPALDO = [
  IMAGEN_SUBASTA_POR_DEFECTO,
  'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1585811514872-ca76aea3bf79?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80',
];

// Devuelve exactamente 4 URLs únicas para mostrar la foto principal y sus vistas adicionales
export function obtenerFotosSubasta(subasta) {
  const fotoPrincipal = subasta?.imageUrl || IMAGEN_SUBASTA_POR_DEFECTO;
  const extrasEspecificas = FOTOS_POR_SUBASTA[Number(subasta?.id)] || [];
  const extrasCategoria = FOTOS_POR_CATEGORIA[subasta?.category] || [];
  const candidatas = [fotoPrincipal, ...extrasEspecificas, ...extrasCategoria, ...FOTOS_RESPALDO];

  const galeria = [];
  for (const url of candidatas) {
    if (url && !galeria.includes(url)) {
      galeria.push(url);
    }
    if (galeria.length === 4) break;
  }
  return galeria;
}

