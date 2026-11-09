import { create } from 'zustand';
import { loadLocalDb, saveLocalDb, httpRequest } from '../../core/lib/apiClient';

export const useAuctionStore = create((set) => ({
  auctions: loadLocalDb().auctions,
  loading: false,
  error: null,
  filters: {
    search: '',
    category: 'Todas',
    status: 'todas',
    sortBy: 'endingSoon',
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  fetchAuctions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/auctions');
      set({ auctions: data, loading: false });
      return data;
    } catch {
      const db = loadLocalDb();
      const now = Date.now();
      let changed = false;

      // Auto-close expired auctions and assign winner if bids exist
      db.auctions = db.auctions.map((auction) => {
        if (
          auction.status === 'activa' &&
          new Date(auction.endTime).getTime() <= now
        ) {
          changed = true;
          const auctionBids = db.bids
            .filter((b) => Number(b.auctionId) === Number(auction.id))
            .sort((a, b) => Number(b.amount) - Number(a.amount));
          const topBid = auctionBids[0];
          return {
            ...auction,
            status: 'finalizada',
            winnerId: topBid ? topBid.bidderId : null,
          };
        }
        return auction;
      });

      if (changed) saveLocalDb(db);
      set({ auctions: db.auctions, loading: false });
      return db.auctions;
    }
  },

  createAuction: async (payload) => {
    const db = loadLocalDb();
    const basePrice = Number(payload.basePrice);
    const minIncrement = Number(payload.minIncrement);

    if (!payload.title?.trim()) throw new Error('El título es obligatorio.');
    if (basePrice <= 0) throw new Error('El precio base debe ser mayor a $0.');
    if (minIncrement <= 0)
      throw new Error('El incremento mínimo debe ser mayor a $0.');

    const newAuction = {
      id: Date.now(),
      title: payload.title.trim(),
      description: payload.description?.trim() || '',
      category: payload.category || 'Tecnología',
      imageUrl:
        payload.imageUrl?.trim() ||
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
      basePrice,
      currentPrice: basePrice,
      minIncrement,
      sellerId: Number(payload.sellerId),
      winnerId: null,
      status: payload.status || 'activa',
      endTime: new Date(payload.endTime).toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.auctions.unshift(newAuction);
    saveLocalDb(db);
    set({ auctions: db.auctions });
    return newAuction;
  },

  updateAuction: async (id, updates, isAdmin = false) => {
    const db = loadLocalDb();
    const idx = db.auctions.findIndex((a) => Number(a.id) === Number(id));
    if (idx === -1) throw new Error('Subasta no encontrada.');

    const existing = db.auctions[idx];
    const hasBids = db.bids.some((b) => Number(b.auctionId) === Number(id));

    // RN08: Inmutabilidad por oferta en precio base y cierre si ya tiene ofertas (salvo admin)
    if (hasBids && !isAdmin) {
      if (
        updates.basePrice !== undefined &&
        Number(updates.basePrice) !== Number(existing.basePrice)
      ) {
        throw new Error(
          'RN08: No se puede modificar el precio base porque la subasta ya cuenta con ofertas registradas.'
        );
      }
    }

    db.auctions[idx] = {
      ...existing,
      ...updates,
      basePrice:
        updates.basePrice !== undefined
          ? Number(updates.basePrice)
          : existing.basePrice,
      minIncrement:
        updates.minIncrement !== undefined
          ? Number(updates.minIncrement)
          : existing.minIncrement,
      id: existing.id,
    };

    saveLocalDb(db);
    set({ auctions: db.auctions });
    return db.auctions[idx];
  },

  closeAuctionNow: async (id) => {
    const db = loadLocalDb();
    const idx = db.auctions.findIndex((a) => Number(a.id) === Number(id));
    if (idx === -1) throw new Error('Subasta no encontrada.');

    const auctionBids = db.bids
      .filter((b) => Number(b.auctionId) === Number(id))
      .sort((a, b) => Number(b.amount) - Number(a.amount));
    const topBid = auctionBids[0];

    db.auctions[idx] = {
      ...db.auctions[idx],
      status: 'finalizada',
      winnerId: topBid ? topBid.bidderId : null,
      endTime: new Date().toISOString(),
    };

    if (topBid) {
      db.notifications.unshift({
        id: Date.now(),
        userId: topBid.bidderId,
        title: '¡Subasta ganada! Datos de contacto liberados',
        message: `Resultaste ganador de "${db.auctions[idx].title}". Ingresa al detalle para coordinar pago y entrega con el vendedor.`,
        type: 'won',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveLocalDb(db);
    set({ auctions: db.auctions });
    return db.auctions[idx];
  },

  deleteAuction: async (id) => {
    const db = loadLocalDb();
    db.auctions = db.auctions.filter((a) => Number(a.id) !== Number(id));
    db.bids = db.bids.filter((b) => Number(b.auctionId) !== Number(id));
    saveLocalDb(db);
    set({ auctions: db.auctions });
  },
}));

