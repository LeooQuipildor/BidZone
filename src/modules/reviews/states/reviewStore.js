import { create } from 'zustand';
import { loadLocalDb, saveLocalDb, httpRequest } from '../../core/lib/apiClient';
import { useAuthStore } from '../../auth/states/authStore';

function recalculateUserReputation(db, userId) {
  const userReviews = db.reviews.filter(
    (rv) => Number(rv.targetUserId) === Number(userId)
  );
  if (userReviews.length === 0) return;
  const avg =
    userReviews.reduce((acc, rv) => acc + Number(rv.rating), 0) /
    userReviews.length;
  const userIdx = db.users.findIndex((u) => Number(u.id) === Number(userId));
  if (userIdx !== -1) {
    db.users[userIdx].reputation = Number(avg.toFixed(1));
  }
}

export const useReviewStore = create((set) => ({
  reviews: loadLocalDb().reviews,
  loading: false,
  error: null,

  fetchReviews: async () => {
    set({ loading: true, error: null });
    try {
      const data = await httpRequest('/reviews');
      set({ reviews: data, loading: false });
      return data;
    } catch {
      const db = loadLocalDb();
      set({ reviews: db.reviews, loading: false });
      return db.reviews;
    }
  },

  createReview: async (payload) => {
    const db = loadLocalDb();
    const auction = db.auctions.find(
      (a) => Number(a.id) === Number(payload.auctionId)
    );
    if (!auction) throw new Error('Subasta no encontrada.');

    // RN07: Calificación única tras cierre formal
    if (auction.status !== 'finalizada') {
      throw new Error(
        'RN07: Solo se pueden calificar subastas que hayan finalizado formalmente.'
      );
    }

    const alreadyReviewed = db.reviews.some(
      (rv) =>
        Number(rv.auctionId) === Number(payload.auctionId) &&
        Number(rv.reviewerId) === Number(payload.reviewerId)
    );
    if (alreadyReviewed) {
      throw new Error(
        'RN07: Ya has emitido una calificación para esta operación.'
      );
    }

    const ratingNum = Number(payload.rating);
    if (ratingNum < 1 || ratingNum > 5) {
      throw new Error('La calificación debe ser de 1 a 5 estrellas.');
    }

    const newReview = {
      id: Date.now(),
      auctionId: Number(payload.auctionId),
      reviewerId: Number(payload.reviewerId),
      targetUserId: Number(payload.targetUserId),
      rating: ratingNum,
      comment: payload.comment?.trim() || '',
      roleContext: payload.roleContext || 'comprador_a_vendedor',
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);
    recalculateUserReputation(db, newReview.targetUserId);

    saveLocalDb(db);
    set({ reviews: db.reviews });
    useAuthStore.getState().fetchUsers();
    return newReview;
  },

  updateReview: async (id, updates) => {
    const db = loadLocalDb();
    const idx = db.reviews.findIndex((rv) => Number(rv.id) === Number(id));
    if (idx === -1) throw new Error('Calificación no encontrada.');

    db.reviews[idx] = {
      ...db.reviews[idx],
      ...updates,
      rating:
        updates.rating !== undefined
          ? Number(updates.rating)
          : db.reviews[idx].rating,
      id: db.reviews[idx].id,
    };

    recalculateUserReputation(db, db.reviews[idx].targetUserId);
    saveLocalDb(db);
    set({ reviews: db.reviews });
    useAuthStore.getState().fetchUsers();
    return db.reviews[idx];
  },

  deleteReview: async (id) => {
    const db = loadLocalDb();
    const target = db.reviews.find((rv) => Number(rv.id) === Number(id));
    db.reviews = db.reviews.filter((rv) => Number(rv.id) !== Number(id));
    if (target) {
      recalculateUserReputation(db, target.targetUserId);
    }
    saveLocalDb(db);
    set({ reviews: db.reviews });
    useAuthStore.getState().fetchUsers();
  },
}));

