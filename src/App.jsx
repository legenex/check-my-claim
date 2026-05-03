import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import AdminDashboard from './pages/admin/Dashboard';
import BlogPage from './pages/Blog';
import BlogPostPage from './pages/BlogPost';
import AdminPages from './pages/admin/Pages';
import AdminBlog from './pages/admin/Blog';
import AdminSEO from './pages/admin/SEO';
import AdminAnalytics from './pages/admin/Analytics';
import AdminIntegrations from './pages/admin/Integrations';
import AdminUserManagement from './pages/admin/UserManagement';
import AdminSettings from './pages/admin/AdminSettings';
import Signals from './pages/admin/Signals.jsx';
import Advertorials from './pages/admin/Advertorials';
import AdvertorialEditor from './pages/admin/AdvertorialEditor';
import AdvertorialPage from './pages/AdvertorialPage';
import SignalDetail from './pages/admin/SignalDetail';
import SignalSources from './pages/admin/SignalSources';
import SignalSettings from './pages/admin/SignalSettings';
import ClaimBotAdminPage from './pages/admin/ClaimBot';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/Blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/pages" element={<AdminPages />} />
      <Route path="/admin/blog" element={<AdminBlog />} />
      <Route path="/admin/seo" element={<AdminSEO />} />
      <Route path="/admin/analytics" element={<AdminAnalytics />} />
      <Route path="/admin/integrations" element={<AdminIntegrations />} />
      <Route path="/admin/users" element={<AdminUserManagement />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/signals" element={<Signals />} />
      <Route path="/admin/signals/:id" element={<SignalDetail />} />
      <Route path="/admin/signals/sources" element={<SignalSources />} />
      <Route path="/admin/signals/settings" element={<SignalSettings />} />
      <Route path="/admin/advertorials" element={<Advertorials />} />
      <Route path="/admin/advertorials/new" element={<AdvertorialEditor />} />
      <Route path="/admin/advertorials/:id/edit" element={<AdvertorialEditor />} />
      <Route path="/admin/claimbot" element={<ClaimBotAdminPage />} />
      <Route path="/advertorial/:slug" element={<AdvertorialPage />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App