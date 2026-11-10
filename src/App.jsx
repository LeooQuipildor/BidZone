import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './modules/core/components/Layout';
import { Home } from './modules/core/components/Home';
import { DashboardView } from './modules/core/components/DashboardView';
import { ProtectedRoute } from './modules/core/components/ProtectedRoute';

import { LoginView } from './modules/auth/components/LoginView';
import { RegisterView } from './modules/auth/components/RegisterView';
import { UserCreateView } from './modules/auth/components/UserCreateView';
import { UserEditView } from './modules/auth/components/UserEditView';

import { AuctionsListView } from './modules/auctions/components/AuctionsListView';
import { AuctionCreateView } from './modules/auctions/components/AuctionCreateView';
import { AuctionEditView } from './modules/auctions/components/AuctionEditView';
import { AuctionDetailView } from './modules/auctions/components/AuctionDetailView';

import { BidCreateView } from './modules/bids/components/BidCreateView';
import { BidEditView } from './modules/bids/components/BidEditView';

import { ReportCreateView } from './modules/reports/components/ReportCreateView';
import { ReportEditView } from './modules/reports/components/ReportEditView';

import { ReviewCreateView } from './modules/reviews/components/ReviewCreateView';
import { ReviewEditView } from './modules/reviews/components/ReviewEditView';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
          <Route path="/auctions" element={<AuctionsListView />} />
          <Route path="/auctions/:id" element={<AuctionDetailView />} />

          {/* Panel Principal / Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardView />
              </ProtectedRoute>
            }
          />

          {/* Entidad 1: Subastas (Alta y Edición Protegidas) */}
          <Route
            path="/auctions/new"
            element={
              <ProtectedRoute>
                <AuctionCreateView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/auctions/:id/edit"
            element={
              <ProtectedRoute>
                <AuctionEditView />
              </ProtectedRoute>
            }
          />

          {/* Entidad 2: Pujas (Integrado al Dashboard + Alta/Edición directa) */}
          <Route
            path="/bids"
            element={
              <ProtectedRoute>
                <DashboardView initialSection="bids" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bids/new"
            element={
              <ProtectedRoute>
                <BidCreateView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bids/:id/edit"
            element={
              <ProtectedRoute>
                <BidEditView />
              </ProtectedRoute>
            }
          />

          {/* Entidad 3: Reportes e Infracciones */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <DashboardView initialSection="reports" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/new"
            element={
              <ProtectedRoute>
                <ReportCreateView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/:id/edit"
            element={
              <ProtectedRoute>
                <ReportEditView />
              </ProtectedRoute>
            }
          />

          {/* Entidad 4: Calificaciones y Reputación */}
          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <DashboardView initialSection="reviews" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews/new"
            element={
              <ProtectedRoute>
                <ReviewCreateView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews/:id/edit"
            element={
              <ProtectedRoute>
                <ReviewEditView />
              </ProtectedRoute>
            }
          />

          {/* Entidad 5: Usuarios */}
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <DashboardView initialSection="users" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserCreateView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <ProtectedRoute>
                <UserEditView />
              </ProtectedRoute>
            }
          />

          {/* Centro de Notificaciones */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <DashboardView initialSection="notifications" />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
