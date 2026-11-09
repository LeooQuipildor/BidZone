import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/states/authStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useBidStore } from '../../bids/states/bidStore';
import { useReportStore } from '../../reports/states/reportStore';
import { useReviewStore } from '../../reviews/states/reviewStore';
import { Card, Button, Badge, PageHeader } from '../design-system/ui';
import { formatCurrency } from '../utils/formatters';
import {
  Gavel,
  TrendingUp,
  AlertOctagon,
  Star,
  Users,
  Phone,
  Mail,
  MapPin,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function DashboardView() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((s) => s.currentUser);
  const users = useAuthStore((s) => s.users);
  const auctions = useAuctionStore((s) => s.auctions);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const bids = useBidStore((s) => s.bids);
  const reports = useReportStore((s) => s.reports);
  const reviews = useReviewStore((s) => s.reviews);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  const isAdmin = currentUser?.role === 'admin';

  const myPublishedAuctions = auctions.filter(
    (a) => Number(a.sellerId) === Number(currentUser?.id)
  );
  const myBids = bids.filter(
    (b) => Number(b.bidderId) === Number(currentUser?.id)
  );
  const closedDealsInvolved = auctions.filter(
    (a) =>
      a.status === 'finalizada' &&
      a.winnerId &&
      (Number(a.winnerId) === Number(currentUser?.id) ||
        Number(a.sellerId) === Number(currentUser?.id) ||
        isAdmin)
  );

  const openReports = reports.filter((r) => r.status === 'en_revision');

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Panel Principal — Hola, ${currentUser?.name}`}
        subtitle={
          isAdmin
            ? 'Vista de Administración General: Supervisión de subastas, usuarios, pujas, reportes de incumplimiento y calificaciones.'
            : 'Gestiona tus subastas publicadas, ofertas activas, datos de contacto liberados y reputación.'
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/auctions/new')}>
              <PlusCircle className="w-4 h-4" />
              Publicar Subasta
            </Button>
            <Button variant="secondary" onClick={() => navigate('/reports/new')}>
              <AlertOctagon className="w-4 h-4" />
              Reportar Incumplimiento
            </Button>
          </div>
        }
      />

      {/* Métricas de las 5 Entidades Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#EAFFD0]/65">
              Subastas Totales
            </span>
            <Gavel className="w-5 h-5 text-[#B0E454]" />
          </div>
          <div className="my-3">
            <p className="text-3xl font-black text-[#EAFFD0]">
              {auctions.length}
            </p>
            <p className="text-xs text-[#B0E454]">
              {myPublishedAuctions.length} publicadas por ti
            </p>
          </div>
          <Link
            to="/auctions"
            className="text-xs font-semibold text-[#EAFFD0]/80 hover:text-[#B0E454]"
          >
            Gestionar subastas →
          </Link>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#EAFFD0]/65">
              Pujas Registradas
            </span>
            <TrendingUp className="w-5 h-5 text-[#B0E454]" />
          </div>
          <div className="my-3">
            <p className="text-3xl font-black text-[#EAFFD0]">{bids.length}</p>
            <p className="text-xs text-[#B0E454]">
              {myBids.length} ofertas tuyas
            </p>
          </div>
          <Link
            to="/bids"
            className="text-xs font-semibold text-[#EAFFD0]/80 hover:text-[#B0E454]"
          >
            Ver historial de pujas →
          </Link>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#EAFFD0]/65">
              Reportes e Infracciones
            </span>
            <AlertOctagon className="w-5 h-5 text-amber-400" />
          </div>
          <div className="my-3">
            <p className="text-3xl font-black text-[#EAFFD0]">
              {reports.length}
            </p>
            <p className="text-xs text-amber-300">
              {openReports.length} en revisión
            </p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-[#EAFFD0]/80 hover:text-[#B0E454]"
          >
            Centro de mediación →
          </Link>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#EAFFD0]/65">
              Calificaciones
            </span>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <div className="my-3">
            <p className="text-3xl font-black text-[#EAFFD0]">
              {reviews.length}
            </p>
            <p className="text-xs text-[#B0E454]">
              Tu reputación: {currentUser?.reputation || '5.0'} ★
            </p>
          </div>
          <Link
            to="/reviews"
            className="text-xs font-semibold text-[#EAFFD0]/80 hover:text-[#B0E454]"
          >
            Ver reseñas →
          </Link>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#EAFFD0]/65">
              Usuarios Activos
            </span>
            <Users className="w-5 h-5 text-[#B0E454]" />
          </div>
          <div className="my-3">
            <p className="text-3xl font-black text-[#EAFFD0]">{users.length}</p>
            <p className="text-xs text-[#B0E454]">
              Rol: {currentUser?.role.toUpperCase()}
            </p>
          </div>
          <Link
            to="/users"
            className="text-xs font-semibold text-[#EAFFD0]/80 hover:text-[#B0E454]"
          >
            Directorio de usuarios →
          </Link>
        </Card>
      </div>

      {/* Sección Central: Subastas Adjudicadas y Datos de Contacto Liberados */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-[#EAFFD0] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#B0E454]" />
              Subastas Adjudicadas — Datos de Contacto Liberados (RN05)
            </h2>
            <p className="text-xs text-[#EAFFD0]/65">
              Cuando una subasta finaliza con ganador, ambas partes acceden a los datos para coordinar pago y entrega por su cuenta. Si alguien incumple, se reporta para sanción o cierre de cuenta.
            </p>
          </div>
        </div>

        {closedDealsInvolved.length === 0 ? (
          <Card className="text-center py-8 text-sm text-[#EAFFD0]/60">
            Aún no tienes subastas finalizadas con adjudicación.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {closedDealsInvolved.map((deal) => {
              const seller = users.find(
                (u) => Number(u.id) === Number(deal.sellerId)
              );
              const winner = users.find(
                (u) => Number(u.id) === Number(deal.winnerId)
              );
              const isWinner = Number(currentUser?.id) === Number(deal.winnerId);

              return (
                <Card
                  key={deal.id}
                  className="border-[#B0E454]/40 bg-gradient-to-br from-[#141A12] to-[#224F10]/20 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="lime" className="mb-1.5">
                        {isWinner
                          ? 'GANASTE ESTA SUBASTA'
                          : Number(currentUser?.id) === Number(deal.sellerId)
                            ? 'VENDISTE ESTE ARTÍCULO'
                            : 'AUDITORÍA ADMIN'}
                      </Badge>
                      <h3 className="font-bold text-base text-[#EAFFD0]">
                        {deal.title}
                      </h3>
                      <p className="text-xs text-[#EAFFD0]/70 mt-0.5">
                        Monto final adjudicado:{' '}
                        <strong className="text-[#B0E454] text-sm">
                          {formatCurrency(deal.currentPrice)}
                        </strong>
                      </p>
                    </div>
                    <Link to={`/auctions/${deal.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Subasta
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0D0D0D]/80 p-3.5 rounded-xl border border-[#224F10]">
                    <div className="space-y-1">
                      <p className="font-bold text-[#B0E454] uppercase tracking-wider text-[10px]">
                        Datos del Vendedor (Dueño)
                      </p>
                      <p className="font-semibold text-[#EAFFD0]">
                        {seller?.name || 'Vendedor'}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#EAFFD0]/80">
                        <Phone className="w-3.5 h-3.5 text-[#B0E454]" />
                        {seller?.phone}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#EAFFD0]/80">
                        <Mail className="w-3.5 h-3.5 text-[#B0E454]" />
                        {seller?.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#EAFFD0]/80">
                        <MapPin className="w-3.5 h-3.5 text-[#B0E454]" />
                        {seller?.city}
                      </p>
                    </div>

                    <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-[#224F10]/60 pt-2 sm:pt-0 sm:pl-3">
                      <p className="font-bold text-[#B0E454] uppercase tracking-wider text-[10px]">
                        Datos del Ganador (Comprador)
                      </p>
                      <p className="font-semibold text-[#EAFFD0]">
                        {winner?.name || 'Comprador'}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#EAFFD0]/80">
                        <Phone className="w-3.5 h-3.5 text-[#B0E454]" />
                        {winner?.phone}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#EAFFD0]/80">
                        <Mail className="w-3.5 h-3.5 text-[#B0E454]" />
                        {winner?.email}
                      </p>
                      <p className="flex items-center gap-1.5 text-[#EAFFD0]/80">
                        <MapPin className="w-3.5 h-3.5 text-[#B0E454]" />
                        {winner?.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                    <Link to={`/reviews/new?auctionId=${deal.id}`}>
                      <Button variant="secondary" size="sm">
                        <Star className="w-3.5 h-3.5" />
                        Calificar Contraparte
                      </Button>
                    </Link>
                    <Link to={`/reports/new?auctionId=${deal.id}`}>
                      <Button variant="danger" size="sm">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        Informar Incumplimiento
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Accesos Rápidos a los 5 Módulos CRUD */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[#EAFFD0] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#B0E454]" />
          Gestión de Datos (Operaciones CRUD por Entidad)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="space-y-3">
            <h3 className="font-bold text-sm text-[#B0E454]">1. Subastas</h3>
            <div className="flex flex-col gap-2">
              <Link to="/auctions">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Listado de Subastas
                </Button>
              </Link>
              <Link to="/auctions/new">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  + Crear Subasta
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="font-bold text-sm text-[#B0E454]">2. Pujas</h3>
            <div className="flex flex-col gap-2">
              <Link to="/bids">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Listado de Pujas
                </Button>
              </Link>
              <Link to="/bids/new">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  + Registrar Puja
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="font-bold text-sm text-[#B0E454]">3. Reportes</h3>
            <div className="flex flex-col gap-2">
              <Link to="/reports">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Listado de Reportes
                </Button>
              </Link>
              <Link to="/reports/new">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  + Nuevo Reporte
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="font-bold text-sm text-[#B0E454]">4. Calificaciones</h3>
            <div className="flex flex-col gap-2">
              <Link to="/reviews">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Listado de Reseñas
                </Button>
              </Link>
              <Link to="/reviews/new">
                <Button variant="secondary" size="sm" className="w-full justify-start">
                  + Calificar Usuario
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="space-y-3">
            <h3 className="font-bold text-sm text-[#B0E454]">5. Usuarios</h3>
            <div className="flex flex-col gap-2">
              <Link to="/users">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  Listado de Usuarios
                </Button>
              </Link>
              {isAdmin ? (
                <Link to="/users/new">
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    + Alta de Usuario
                  </Button>
                </Link>
              ) : (
                <Link to={`/users/${currentUser?.id}/edit`}>
                  <Button variant="secondary" size="sm" className="w-full justify-start">
                    Editar mi Perfil
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

