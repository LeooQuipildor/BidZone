const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const STORAGE_KEY = 'bidzone_db_v1';

const now = Date.now();
const hour = 3600 * 1000;

export const INITIAL_SEED_DATA = {
  users: [
    {
      id: 1,
      name: 'Leandro Quipildor',
      email: 'admin@bidzone.com',
      password: 'admin123',
      role: 'admin',
      phone: '+54 9 381 555-0101',
      city: 'San Miguel de Tucumán',
      status: 'active',
      reputation: 4.9,
      createdAt: '2026-10-01T10:00:00Z',
    },
    {
      id: 2,
      name: 'Mario Matías Moussa',
      email: 'mario@bidzone.com',
      password: 'user123',
      role: 'user',
      phone: '+54 9 381 555-0202',
      city: 'Yerba Buena, Tucumán',
      status: 'active',
      reputation: 4.8,
      createdAt: '2026-10-03T14:30:00Z',
    },
    {
      id: 3,
      name: 'Luciano Medina',
      email: 'luciano@bidzone.com',
      password: 'user123',
      role: 'user',
      phone: '+54 9 381 555-0303',
      city: 'San Miguel de Tucumán',
      status: 'active',
      reputation: 4.7,
      createdAt: '2026-10-05T09:15:00Z',
    },
    {
      id: 4,
      name: 'Valentina Torres',
      email: 'valentina@correo.com',
      password: 'user123',
      role: 'user',
      phone: '+54 9 11 4444-8899',
      city: 'Córdoba Capital',
      status: 'suspended',
      reputation: 2.1,
      createdAt: '2026-10-10T18:00:00Z',
    },
  ],
  auctions: [
    {
      id: 101,
      title: 'MacBook Pro M3 Pro 14" 18GB RAM 512GB SSD',
      description:
        'Equipo en estado impecable con caja original, cargador MagSafe de 70W y solo 18 ciclos de batería. Ideal para desarrollo de software y diseño.',
      category: 'Tecnología',
      imageUrl:
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
      basePrice: 1200000,
      currentPrice: 1450000,
      minIncrement: 50000,
      sellerId: 2,
      winnerId: null,
      status: 'activa',
      endTime: new Date(now + 18 * hour).toISOString(),
      createdAt: new Date(now - 24 * hour).toISOString(),
    },
    {
      id: 102,
      title: 'Consola PlayStation 5 Slim Digital + 2 Joysticks DualSense',
      description:
        'Consola PS5 edición Slim de 1TB con dos controles originales blancos sin drift y base de carga original.',
      category: 'Gaming',
      imageUrl:
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80',
      basePrice: 650000,
      currentPrice: 740000,
      minIncrement: 25000,
      sellerId: 3,
      winnerId: null,
      status: 'activa',
      endTime: new Date(now + 5 * hour).toISOString(),
      createdAt: new Date(now - 12 * hour).toISOString(),
    },
    {
      id: 103,
      title: 'Silla Ergonómica Herman Miller Aeron Talle B',
      description:
        'Silla de oficina premium con soporte lumbar PostureFit SL, apoyabrazos 3D y malla Pellicle transpirable.',
      category: 'Hogar y Oficina',
      imageUrl:
        'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=900&q=80',
      basePrice: 800000,
      currentPrice: 920000,
      minIncrement: 30000,
      sellerId: 2,
      winnerId: 3,
      status: 'finalizada',
      endTime: new Date(now - 6 * hour).toISOString(),
      createdAt: new Date(now - 72 * hour).toISOString(),
    },
    {
      id: 104,
      title: 'Bicicleta Mountain Bike Trek Marlin 7 Rodado 29',
      description:
        'Transmisión Shimano Deore 1x10, frenos a disco hidráulicos y horquilla RockShox Judy. Lista para rodar.',
      category: 'Deportes',
      imageUrl:
        'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=900&q=80',
      basePrice: 700000,
      currentPrice: 700000,
      minIncrement: 20000,
      sellerId: 1,
      winnerId: null,
      status: 'activa',
      endTime: new Date(now + 36 * hour).toISOString(),
      createdAt: new Date(now - 4 * hour).toISOString(),
    },
    {
      id: 105,
      title: 'Cámara Mirrorless Sony Alpha a7 III + Lente 28-70mm',
      description:
        'Sensor Full Frame de 24.2MP, grabación 4K HDR, estabilización de 5 ejes. Incluye bolso de transporte y tarjeta SD 128GB.',
      category: 'Fotografía',
      imageUrl:
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80',
      basePrice: 1100000,
      currentPrice: 1250000,
      minIncrement: 50000,
      sellerId: 3,
      winnerId: 2,
      status: 'finalizada',
      endTime: new Date(now - 20 * hour).toISOString(),
      createdAt: new Date(now - 96 * hour).toISOString(),
    },
  ],
  bids: [
    {
      id: 501,
      auctionId: 101,
      bidderId: 3,
      amount: 1350000,
      note: 'Retiro inmediato por el centro.',
      commitmentAccepted: true,
      createdAt: new Date(now - 10 * hour).toISOString(),
    },
    {
      id: 502,
      auctionId: 101,
      bidderId: 1,
      amount: 1450000,
      note: 'Pago por transferencia inmediata al cerrar.',
      commitmentAccepted: true,
      createdAt: new Date(now - 2 * hour).toISOString(),
    },
    {
      id: 503,
      auctionId: 102,
      bidderId: 2,
      amount: 740000,
      note: 'Coordino retiro en el día.',
      commitmentAccepted: true,
      createdAt: new Date(now - 3 * hour).toISOString(),
    },
    {
      id: 504,
      auctionId: 103,
      bidderId: 3,
      amount: 920000,
      note: 'Oferta final ganadora.',
      commitmentAccepted: true,
      createdAt: new Date(now - 8 * hour).toISOString(),
    },
    {
      id: 505,
      auctionId: 105,
      bidderId: 2,
      amount: 1250000,
      note: 'Excelente estado, coordino por WhatsApp.',
      commitmentAccepted: true,
      createdAt: new Date(now - 25 * hour).toISOString(),
    },
  ],
  reports: [
    {
      id: 801,
      auctionId: 103,
      reporterId: 2,
      reportedUserId: 4,
      reason: 'Incumplimiento de pago en plazo acordado',
      description:
        'El usuario ganó una subasta anterior y no respondió los mensajes de WhatsApp ni llamadas tras 48 horas de liberados los datos de contacto.',
      evidenceUrl: 'https://evidencia.bidzone.com/captura-chat-801',
      status: 'resuelto_sancion',
      sanctionApplied: 'Suspensión de cuenta e inhabilitación para pujar',
      createdAt: new Date(now - 48 * hour).toISOString(),
    },
    {
      id: 802,
      auctionId: 105,
      reporterId: 3,
      reportedUserId: 2,
      reason: 'Demora en coordinación de entrega',
      description:
        'Se solicitó reprogramar el horario de entrega para el día siguiente. Situación en vía de resolución amistosa.',
      evidenceUrl: '',
      status: 'en_revision',
      sanctionApplied: 'Sin sanción (en mediación)',
      createdAt: new Date(now - 12 * hour).toISOString(),
    },
  ],
  reviews: [
    {
      id: 901,
      auctionId: 103,
      reviewerId: 3,
      targetUserId: 2,
      rating: 5,
      comment:
        'Excelente vendedor. Apenas finalizó la subasta nos pusimos en contacto por teléfono y retiré la silla tal cual la descripción.',
      roleContext: 'comprador_a_vendedor',
      createdAt: new Date(now - 4 * hour).toISOString(),
    },
    {
      id: 902,
      auctionId: 105,
      reviewerId: 2,
      targetUserId: 3,
      rating: 5,
      comment:
        'La cámara Sony estaba impecable. Coordinamos transferencia y entrega en un café céntrico sin ningún inconveniente.',
      roleContext: 'comprador_a_vendedor',
      createdAt: new Date(now - 15 * hour).toISOString(),
    },
  ],
  notifications: [
    {
      id: 1001,
      userId: 3,
      title: '¡Oferta superada!',
      message:
        'Tu oferta en "MacBook Pro M3 Pro 14"" fue superada con una puja de $1.450.000.',
      type: 'outbid',
      read: false,
      createdAt: new Date(now - 2 * hour).toISOString(),
    },
    {
      id: 1002,
      userId: 3,
      title: '¡Ganaste la subasta! Datos de contacto liberados',
      message:
        'Te adjudicaste "Silla Ergonómica Herman Miller Aeron". Ya puedes ver el teléfono y correo del vendedor para coordinar el pago.',
      type: 'won',
      read: false,
      createdAt: new Date(now - 6 * hour).toISOString(),
    },
    {
      id: 1003,
      userId: 2,
      title: 'Subasta finalizada con ganador',
      message:
        'Tu subasta "Silla Ergonómica Herman Miller Aeron" cerró en $920.000. Revisa los datos de contacto del comprador.',
      type: 'closed',
      read: true,
      createdAt: new Date(now - 6 * hour).toISOString(),
    },
  ],
};

export function loadLocalDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_DATA));
      return structuredClone(INITIAL_SEED_DATA);
    }
    return JSON.parse(raw);
  } catch {
    return structuredClone(INITIAL_SEED_DATA);
  }
}

export function saveLocalDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Error guardando estado local:', err);
  }
}

export async function httpRequest(endpoint, options = {}) {
  const token = localStorage.getItem('bidzone_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Error HTTP ${response.status}`);
  }

  return response.json();
}

