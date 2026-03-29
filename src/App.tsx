import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CompleteProfilePage } from './pages/CompleteProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ChallengeDetailPage } from './pages/ChallengeDetailPage';
import { BenefitsPage } from './pages/BenefitsPage';
import { SilverClubPage } from './pages/SilverClubPage';
import { ProfilePage } from './pages/ProfilePage';
import { LandingPage } from './pages/LandingPage';
import { ContentsListPage } from './pages/ContentsListPage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { CommunityFeedPage } from './pages/CommunityFeedPage';
import { FeedPostDetailPage } from './pages/FeedPostDetailPage';
import { GroupsListPage } from './pages/GroupsListPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { AdminHomePage } from './pages/admin/AdminHomePage';
import { AdminClubSilverPage } from './pages/admin/AdminClubSilverPage';
import { AdminFeedPostPage } from './pages/admin/AdminFeedPostPage';
import { AdminGroupCreatePage } from './pages/admin/AdminGroupCreatePage';
import { AdminChallengesListPage } from './pages/admin/AdminChallengesListPage';
import { AdminChallengeFormPage } from './pages/admin/AdminChallengeFormPage';
import { AdminContentsListPage } from './pages/admin/AdminContentsListPage';
import { AdminContentFormPage } from './pages/admin/AdminContentFormPage';
import { AdminFeedPostsListPage } from './pages/admin/AdminFeedPostsListPage';
import { AdminFeedPostFormPage } from './pages/admin/AdminFeedPostFormPage';
import { AdminGroupsListPage } from './pages/admin/AdminGroupsListPage';
import { AdminGroupFormPage } from './pages/admin/AdminGroupFormPage';
import { AdminUsersListPage } from './pages/admin/AdminUsersListPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import { AdminBenefitsListPage } from './pages/admin/AdminBenefitsListPage';
import { AdminBenefitFormPage } from './pages/admin/AdminBenefitFormPage';
import { AdminLayout } from './components/admin/AdminLayout';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/novedades" element={<ContentsListPage />} />
          <Route path="/novedades/:id" element={<ContentDetailPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          <Route
            path="/completar-perfil"
            element={
              <ProtectedRoute>
                <CompleteProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireProfile>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/retos"
            element={
              <ProtectedRoute requireProfile>
                <ChallengesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/retos/:id"
            element={
              <ProtectedRoute requireProfile>
                <ChallengeDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/beneficios"
            element={
              <ProtectedRoute requireProfile>
                <BenefitsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/silver-club"
            element={
              <ProtectedRoute requireProfile>
                <SilverClubPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute requireProfile>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/comunidad"
            element={
              <ProtectedRoute requireProfile>
                <CommunityFeedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/comunidad/:id"
            element={
              <ProtectedRoute requireProfile>
                <FeedPostDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grupos"
            element={
              <ProtectedRoute requireProfile>
                <GroupsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grupos/:id"
            element={
              <ProtectedRoute requireProfile>
                <GroupDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requireProfile requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHomePage />} />
            <Route path="club-silver" element={<AdminClubSilverPage />} />
            <Route path="feed/nuevo" element={<AdminFeedPostPage />} />
            <Route path="grupos/nuevo" element={<AdminGroupCreatePage />} />
            <Route path="retos" element={<AdminChallengesListPage />} />
            <Route path="retos/nuevo" element={<AdminChallengeFormPage />} />
            <Route path="retos/:id" element={<AdminChallengeFormPage />} />
            <Route path="novedades" element={<AdminContentsListPage />} />
            <Route path="novedades/nuevo" element={<AdminContentFormPage />} />
            <Route path="novedades/:id" element={<AdminContentFormPage />} />
            <Route path="comunidad" element={<AdminFeedPostsListPage />} />
            <Route path="comunidad/nuevo" element={<AdminFeedPostFormPage />} />
            <Route path="comunidad/:id" element={<AdminFeedPostFormPage />} />
            <Route path="grupos" element={<AdminGroupsListPage />} />
            <Route path="grupos/:id" element={<AdminGroupFormPage />} />
            <Route path="beneficios" element={<AdminBenefitsListPage />} />
            <Route path="beneficios/nuevo" element={<AdminBenefitFormPage />} />
            <Route path="beneficios/:id" element={<AdminBenefitFormPage />} />
            <Route path="usuarios" element={<AdminUsersListPage />} />
            <Route path="usuarios/:id" element={<AdminUserDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
