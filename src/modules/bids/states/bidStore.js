import { create } from 'zustand';
import { loadLocalDb, saveLocalDb, httpRequest } from '../../core/lib/apiClient';
import { useAuctionStore } from '../../auctions/states/auctionStore';

export const useBidStore = create((set) => ({
  bids: loadLocalDb().bids,
  loading: false,
  error: null,

  fetchBids: async () => {
    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/bids');
      set({ bids: data, loading: false });
      return data;
    } catch {
      const db = loadLocalDb();
      set({ bids: db.bids, loading: false });
      return db.bids;
    }
  },

  createBid: async ({ auctionId, bidderId, amount, note, commitmentAccepted }) => {
    const db = loadLocalDb();
    const auctionIdx = db.auctions.findIndex(
      (a) => Number(a.id) === Number(auctionId)
    );
    if (auctionIdx === -1) throw new Error('La subasta seleccionada no existe.');

    const auction = db.auctions[auctionIdx];
    const numericAmount = Number(amount);

    // RN02: Prohibición de auto-puja
    if (Number(auction.sellerId) === Number(bidderId)) {
      throw new Error(
        'RN02: No puedes realizar ofertas sobre una subasta publicada por ti mismo.'
      );
    }

    // RN03: Vigencia temporal
    if (
      auction.status !== 'activa' ||
      new Date(auction.endTime).getTime() <= Date.now()
    ) {
      throw new Error(
        'RN03: La subasta ya no se encuentra activa o su tiempo ha expirado.'
      );
    }

    // RN01: Incremento mínimo
    const minAllowed = Number(auction.currentPrice) + Number(auction.minIncrement);
    if (numericAmount < minAllowed) {
      throw new Error(
        `RN01: La oferta debe ser de al menos $${minAllowed.toLocaleString('es-AR')} (Precio actual + incremento mínimo).`
      );
    }

    // Límite máximo: No mayor a 10 veces el precio inicial fijado por el vendedor
    const initialPrice = Number(auction.basePrice ?? auction.currentPrice);
    const maxAllowed = initialPrice * 10;
    if (numericAmount > maxAllowed) {
      throw new Error(
        `La oferta no puede superar 10 veces el precio inicial de la subasta ($${maxAllowed.toLocaleString('es-AR')}).`
      );
    }

    // RN04: Irrevocabilidad y compromiso
    if (!commitmentAccepted) {
      throw new Error(
        'RN04: Debes aceptar el compromiso vinculante de compra para registrar la puja.'
      );
    }

    // Check previous leader to notify outbid
    const previousBids = db.bids
      .filter((b) => Number(b.auctionId) === Number(auctionId))
      .sort((a, b) => Number(b.amount) - Number(a.amount));
    const previousLeader = previousBids[0];

    const newBid = {
      id: Date.now(),
      auctionId: Number(auctionId),
      bidderId: Number(bidderId),
      amount: numericAmount,
      note: note?.trim() || 'Compromiso de pago y retiro acordado.',
      commitmentAccepted: true,
      createdAt: new Date().toISOString(),
    };

    db.bids.unshift(newBid);
    db.auctions[auctionIdx].currentPrice = numericAmount;

    if (
      previousLeader &&
      Number(previousLeader.bidderId) !== Number(bidderId)
    ) {
      db.notifications.unshift({
        id: Date.now() + 1,
        userId: previousLeader.bidderId,
        title: '¡Oferta superada!',
        message: `Tu oferta en "${auction.title}" fue superada con una puja de $${numericAmount.toLocaleString('es-AR')}.`,
        type: 'outbid',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    saveLocalDb(db);
    set({ bids: db.bids });
    useAuctionStore.getState().fetchAuctions();
    return newBid;
  },

  updateBid: async (id, updates) => {
    const db = loadLocalDb();
    const idx = db.bids.findIndex((b) => Number(b.id) === Number(id));
    if (idx === -1) throw new Error('Puja no encontrada.');

    const existing = db.bids[idx];
    const updatedAmount =
      updates.amount !== undefined ? Number(updates.amount) : existing.amount;

    db.bids[idx] = {
      ...existing,
      ...updates,
      amount: updatedAmount,
      id: existing.id,
    };

    // Recalculate auction currentPrice if amount was updated by admin
    const auctionIdx = db.auctions.findIndex(
      (a) => Number(a.id) === Number(existing.auctionId)
    );
    if (auctionIdx !== -1) {
      if (updates.amount !== undefined) {
        const initialPrice = Number(
          db.auctions[auctionIdx].basePrice ?? db.auctions[auctionIdx].currentPrice
        );
        const maxAllowed = initialPrice * 10;
        if (updatedAmount > maxAllowed) {
          throw new Error(
            `La oferta no puede superar 10 veces el precio inicial de la subasta ($${maxAllowed.toLocaleString('es-AR')}).`
          );
        }
      }

      const auctionBids = db.bids.filter(
        (b) => Number(b.auctionId) === Number(existing.auctionId)
      );
      const maxBid = auctionBids.reduce(
        (max, b) => (Number(b.amount) > max ? Number(b.amount) : max),
        Number(db.auctions[auctionIdx].basePrice)
      );
      db.auctions[auctionIdx].currentPrice = maxBid;
    }

    saveLocalDb(db);
    set({ bids: db.bids });
    useAuctionStore.getState().fetchAuctions();
    return db.bids[idx];
  },

  deleteBid: async (id) => {
    const db = loadLocalDb();
    const target = db.bids.find((b) => Number(b.id) === Number(id));
    db.bids = db.bids.filter((b) => Number(b.id) !== Number(id));

    if (target) {
      const auctionIdx = db.auctions.findIndex(
        (a) => Number(a.id) === Number(target.auctionId)
      );
      if (auctionIdx !== -1) {
        const remaining = db.bids.filter(
          (b) => Number(b.auctionId) === Number(target.auctionId)
        );
        const maxBid = remaining.reduce(
          (max, b) => (Number(b.amount) > max ? Number(b.amount) : max),
          Number(db.auctions[auctionIdx].basePrice)
        );
        db.auctions[auctionIdx].currentPrice = maxBid;
      }
    }

    saveLocalDb(db);
    set({ bids: db.bids });
    useAuctionStore.getState().fetchAuctions();
  },
}));

