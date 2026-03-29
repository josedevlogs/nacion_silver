import { Navigate } from 'react-router-dom';

/** @deprecated Usar `/admin/comunidad/nuevo` */
export function AdminFeedPostPage() {
  return <Navigate to="/admin/comunidad/nuevo" replace />;
}
