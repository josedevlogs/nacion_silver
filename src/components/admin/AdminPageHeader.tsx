import { Link } from 'react-router-dom';

type AdminPageHeaderProps = {
  title: string;
  backTo?: string;
  backLabel?: string;
  children?: React.ReactNode;
};

export function AdminPageHeader({
  title,
  backTo = '/admin',
  backLabel = '← Admin',
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="space-y-2 mb-6">
      <Link to={backTo} className="text-primary-600 font-semibold text-sm hover:underline">
        {backLabel}
      </Link>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
        {children}
      </div>
    </div>
  );
}
