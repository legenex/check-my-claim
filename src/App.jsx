import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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
import ExperimentsPage from './pages/admin/Experiments';
import ExperimentEditor from './pages/admin/ExperimentEditor';
import ExperimentPage from './pages/ExperimentPage';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import QuizBuilderList from './pages/admin/QuizBuilderList';
import QuizBuilderEditor from './pages/admin/QuizBuilderEditor';
import QuizRuntime from './pages/QuizRuntime';
import LandingPages from './pages/admin/LandingPages';
import LandingPageEditor from './pages/admin/LandingPageEditor';
import LandingPagePublic from './pages/LandingPagePublic';
import ThemesList from './pages/admin/ThemesList';
import ThemeEditor from './pages/admin/ThemeEditor';
import SurveyBuilder from './pages/admin/SurveyBuilder.jsx';
import SurveyBuilderEditor from './pages/admin/SurveyBuilderEditor.jsx';
import SurveyPage from './pages/SurveyPage.jsx';

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
      <Route path="/Survey" element={<SurveyPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/admin" element={<AdminRouteGuard><AdminDashboard /></AdminRouteGuard>} />
      <Route path="/admin/pages" element={<AdminRouteGuard><AdminPages /></AdminRouteGuard>} />
      <Route path="/admin/blog" element={<AdminRouteGuard><AdminBlog /></AdminRouteGuard>} />
      <Route path="/admin/seo" element={<AdminRouteGuard><AdminSEO /></AdminRouteGuard>} />
      <Route path="/admin/analytics" element={<AdminRouteGuard><AdminAnalytics /></AdminRouteGuard>} />
      <Route path="/admin/integrations" element={<AdminRouteGuard><AdminIntegrations /></AdminRouteGuard>} />
      <Route path="/admin/users" element={<AdminRouteGuard><AdminUserManagement /></AdminRouteGuard>} />
      <Route path="/admin/settings" element={<AdminRouteGuard><AdminSettings /></AdminRouteGuard>} />
      <Route path="/admin/signals" element={<AdminRouteGuard><Signals /></AdminRouteGuard>} />
      <Route path="/admin/signals/:id" element={<AdminRouteGuard><SignalDetail /></AdminRouteGuard>} />
      <Route path="/admin/signals/sources" element={<AdminRouteGuard><SignalSources /></AdminRouteGuard>} />
      <Route path="/admin/signals/settings" element={<AdminRouteGuard><SignalSettings /></AdminRouteGuard>} />
      <Route path="/admin/advertorials" element={<AdminRouteGuard><Advertorials /></AdminRouteGuard>} />
      <Route path="/admin/advertorials/new" element={<AdminRouteGuard><AdvertorialEditor /></AdminRouteGuard>} />
      <Route path="/admin/advertorials/:id/edit" element={<AdminRouteGuard><AdvertorialEditor /></AdminRouteGuard>} />
      <Route path="/admin/claimbot" element={<AdminRouteGuard><ClaimBotAdminPage /></AdminRouteGuard>} />
      <Route path="/admin/experiments" element={<AdminRouteGuard><ExperimentsPage /></AdminRouteGuard>} />
      <Route path="/admin/experiments/new" element={<AdminRouteGuard><ExperimentEditor /></AdminRouteGuard>} />
      <Route path="/admin/experiments/:id/edit" element={<AdminRouteGuard><ExperimentEditor /></AdminRouteGuard>} />
      <Route path="/advertorial/:slug" element={<AdvertorialPage />} />
      <Route path="/tools/*" element={<ExperimentPage />} />
      <Route path="/community/*" element={<ExperimentPage />} />
      {/* Survey Builder - main admin route */}
      <Route path="/admin/QuizBuilder" element={<AdminRouteGuard><SurveyBuilder /></AdminRouteGuard>} />
      <Route path="/admin/QuizBuilder/:id" element={<AdminRouteGuard><SurveyBuilderEditor /></AdminRouteGuard>} />
      {/* Legacy quiz builder routes - preserved for old quiz data */}
      <Route path="/admin/QuizBuilderLegacy" element={<AdminRouteGuard><QuizBuilderList /></AdminRouteGuard>} />
      <Route path="/admin/QuizBuilderLegacy/:id" element={<AdminRouteGuard><QuizBuilderEditor /></AdminRouteGuard>} />
      {/* Redirects */}
      <Route path="/admin/SurveyBuilder" element={<Navigate to="/admin/QuizBuilder" replace />} />
      <Route path="/admin/SurveyBuilder/:id" element={<AdminRouteGuard><SurveyBuilderEditor /></AdminRouteGuard>} />
      <Route path="/admin/Surveys" element={<Navigate to="/admin/QuizBuilder" replace />} />
      <Route path="/admin/DecisionTrees" element={<Navigate to="/admin/QuizBuilder" replace />} />
      <Route path="/admin/DecisionTrees/:id/builder" element={<Navigate to="/admin/QuizBuilder" replace />} />
      <Route path="/q/:slug" element={<QuizRuntime />} />
      <Route path="/admin/Themes" element={<AdminRouteGuard><ThemesList /></AdminRouteGuard>} />
      <Route path="/admin/Themes/:id" element={<AdminRouteGuard><ThemeEditor /></AdminRouteGuard>} />
      <Route path="/admin/LandingPages" element={<AdminRouteGuard><LandingPages /></AdminRouteGuard>} />
      <Route path="/admin/LandingPages/:id/edit" element={<LandingPageEditor />} />
      <Route path="/lp/:slug" element={<LandingPagePublic />} />
      <Route path="/admin/SurveyBuilder" element={<AdminRouteGuard><SurveyBuilder /></AdminRouteGuard>} />
      <Route path="/admin/SurveyBuilder/:id" element={<AdminRouteGuard><SurveyBuilderEditor /></AdminRouteGuard>} />
      <Route path="/s/:slug" element={<SurveyPage />} />
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