import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useReportStore } from '../states/reportStore';
import { useAuctionStore } from '../../auctions/states/auctionStore';
import { useAuthStore } from '../../auth/states/authStore';
import { sameId } from '../../core/utils/formatters';
import { ReportForm } from './ReportForm';
import { Button, Card, PageHeader } from '../../core/design-system/ui';
import { ArrowLeft } from 'lucide-react';

export function ReportCreateView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAuctionId = searchParams.get('auctionId') || '';
  const initialReportedUserId = searchParams.get('reportedUserId') || '';

  const createReport = useReportStore((s) => s.createReport);
  const auctions = useAuctionStore((s) => s.auctions);
  const fetchAuctions = useAuctionStore((s) => s.fetchAuctions);
  const users = useAuthStore((s) => s.users);
  const fetchUsers = useAuthStore((s) => s.fetchUsers);
  const currentUser = useAuthStore((s) => s.currentUser);

  useEffect(() => {
    fetchAuctions();
    fetchUsers();
  }, [fetchAuctions, fetchUsers]);

  const otherUsers = users.filter((u) => !sameId(u.id, currentUser?.id));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Informar Incumplimiento de Operación"
        subtitle="Si liberados los datos de contacto la contraparte no abona el artículo o no lo entrega, radica la denuncia para evaluar sanción."
        action={
          <Button variant="outline" onClick={() => navigate('/reports')}>
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      <Card className="p-6">
        <ReportForm
          auctions={auctions}
          otherUsers={otherUsers}
          initialAuctionId={initialAuctionId}
          initialReportedUserId={initialReportedUserId}
          onCreateReport={createReport}
          onSaved={() => navigate('/reports')}
          onCancel={() => navigate('/reports')}
        />
      </Card>
    </div>
  );
}
