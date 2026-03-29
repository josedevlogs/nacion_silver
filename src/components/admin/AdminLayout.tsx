import { Outlet } from 'react-router-dom';
import { Layout } from '../Layout';
import { AdminSubnav } from './AdminSubnav';

export function AdminLayout() {
  return (
    <Layout>
      <AdminSubnav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>
    </Layout>
  );
}
