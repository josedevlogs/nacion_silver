import { useNavigate } from 'react-router-dom';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { GroupForm } from './GroupForm';

export function AdminGroupCreatePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <AdminPageHeader title="Nuevo grupo" backTo="/admin/grupos" />
      <GroupForm
        mode="create"
        onSuccess={(id) => navigate(`/grupos/${id}`)}
        onCancel={() => navigate('/admin/grupos')}
      />
    </div>
  );
}
