import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { RealtimeProvider } from './contexts/RealtimeContext';
import RealtimeWrapper from './components/RealtimeWrapper';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Settings Pages
import AdminSettings from './pages/Settings/AdminSettings';
import MatrixSettings from './pages/Settings/MatrixSettings';
import EmailSettings from './pages/Settings/EmailSettings';
import AppearanceSettings from './pages/Settings/AppearanceSettings';
import TemplateSettings from './pages/Settings/TemplateSettings';
import FrontPageSettings from './pages/Settings/FrontPageSettings';
import PaymentGatewaySettings from './pages/Settings/PaymentGatewaySettings';

// Members Pages
import MembersList from './pages/Members/MembersList';
import FreeMembers from './pages/Members/FreeMembers';
import ProMembers from './pages/Members/ProMembers';
import SearchMembers from './pages/Members/SearchMembers';
import TopSponsors from './pages/Members/TopSponsors';
import ReferralTracker from './pages/Members/ReferralTracker';
import KYCVerification from './pages/Members/KYCVerification';
import LeadershipRankManager from './pages/Members/LeadershipRankManager';
import PendingEmailVerification from './pages/Members/PendingEmailVerification';

// Positions Pages
import AddMemberPosition from './pages/Positions/AddMemberPosition';
import PendingTransactions from './pages/Positions/PendingTransactions';

// Financial Pages
import WithdrawalsList from './pages/Transactions/WithdrawalsList';
import DepositsList from './pages/Transactions/DepositsList';
import Deposits from './pages/Financial/Deposits';
import Withdrawals from './pages/Financial/Withdrawals';
import EWalletTransactions from './pages/Financial/EWalletTransactions';
import AddEWalletTransaction from './pages/Financial/AddEWalletTransaction';
import BonusSystemManager from './pages/Financial/BonusSystemManager';
import FastStartBonusManager from './pages/Financial/FastStartBonusManager';
import CommissionCalculator from './pages/Financial/CommissionCalculator';

// Matrix Pages
import MatrixOverview from './pages/Matrix/MatrixOverview';
import MatrixPositions from './pages/Matrix/MatrixPositions';
import MatrixLevels from './pages/Matrix/MatrixLevels';
import MatrixPositionManager from './pages/Matrix/MatrixPositionManager';
import MatrixCycles from './pages/Matrix/MatrixCycles';
import MatrixCycleManager from './pages/Matrix/MatrixCycleManager';
import SpilloverManager from './pages/Matrix/SpilloverManager';

// Communication Pages
import NotificationManager from './pages/Communication/NotificationManager';
import MessagingSystem from './pages/Communication/MessagingSystem';
import AnnouncementManager from './pages/Communication/AnnouncementManager';
import EmailUsers from './pages/Members/EmailUsers';
import GlobalPIFLogs from './pages/Members/GlobalPIFLogs';
import MessageHistory from './pages/Members/MessageHistory';

// Content Pages
import PromotionalContentManager from './pages/Content/PromotionalContentManager';
import EmailTemplateManager from './pages/Content/EmailTemplateManager';
import BannerManager from './pages/Content/BannerManager';

// Banner Ads Pages
import AddBanner from './pages/BannerAds/AddBanner';
import ApprovedBanners from './pages/BannerAds/ApprovedBanners';
import PendingBanners from './pages/BannerAds/PendingBanners';
import AddTextAd from './pages/BannerAds/AddTextAd';
import ApprovedTextAds from './pages/BannerAds/ApprovedTextAds';
import PendingTextAds from './pages/BannerAds/PendingTextAds';

// Analytics Pages
import ReportingSystem from './pages/Analytics/ReportingSystem';
import AnalyticsDashboard from './pages/Analytics/AnalyticsDashboard';
import DataVisualization from './pages/Analytics/DataVisualization';

// Tools Pages
import DatabaseBackup from './pages/Settings/DatabaseBackup';
import FileManager from './pages/Settings/FileManager';
import SystemTools from './pages/Tools/SystemTools';
import MarketingTools from './pages/Tools/MarketingTools';
import ContestsManager from './pages/Tools/ContestsManager';
import Contests from './pages/Tools/Contests';
import DigitalProducts from './pages/Tools/DigitalProducts';
import EmailValidation from './pages/Tools/EmailValidation';
import FeedbackSurveys from './pages/Tools/FeedbackSurveys';
import ListManagement from './pages/Tools/ListManagement';
import MobileApp from './pages/Tools/MobileApp';
import PushNotifications from './pages/Tools/PushNotifications';
import PromotionalBanners from './pages/Settings/PromotionalBanners';
import PromotionalLeadPages from './pages/Settings/PromotionalLeadPages';
import PromotionalSoloAds from './pages/Settings/PromotionalSoloAds';
import PromotionalSplashPages from './pages/Settings/PromotionalSplashPages';
import SystemUpdate from './pages/Settings/SystemUpdate';
import TestimonialsApproved from './pages/Settings/TestimonialsApproved';
import TestimonialsPending from './pages/Settings/TestimonialsPending';
import ResetCronTasks from './pages/ResetCronTasks';
import Instructions from './pages/Instructions';
import ProgressiveWebApp from './pages/ProgressiveWebApp';
import TrainingVideo from './pages/TrainingVideo';

// Modules Pages
import ModulesManager from './pages/Modules/ModulesManager';
import ModuleStore from './pages/Modules/ModuleStore';

// Other Pages
import Users from './pages/Users';
import PaymentGateways from './pages/PaymentGateways';
import Currencies from './pages/Currencies';
import Matrix from './pages/Matrix';
import Payments from './pages/Payments';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <RealtimeProvider>
          <RealtimeWrapper>
            <Router>
            <Routes>
            {/* Landing Page Route */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Login Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Register Route */}
            <Route path="/register" element={<Register />} />
            
            {/* Admin Panel Routes */}
            <Route path="/admin/*" element={
              <Layout>
                <Routes>
                  {/* Dashboard */}
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Settings */}
                  <Route path="/settings/admin" element={<AdminSettings />} />
                  <Route path="/settings/matrices" element={<MatrixSettings />} />
                  <Route path="/settings/emails" element={<EmailSettings />} />
                  <Route path="/settings/appearance" element={<AppearanceSettings />} />
                  <Route path="/settings/templates" element={<TemplateSettings />} />
                  <Route path="/settings/frontpage" element={<FrontPageSettings />} />
                  <Route path="/settings/payment-gateways" element={<PaymentGatewaySettings />} />
                  
                  {/* Members */}
                  <Route path="/members/list" element={<MembersList />} />
                  <Route path="/members/free" element={<FreeMembers />} />
                  <Route path="/members/pro" element={<ProMembers />} />
                  <Route path="/members/search" element={<SearchMembers />} />
                  <Route path="/members/top-sponsors" element={<TopSponsors />} />
                  <Route path="/members/referral-tracker" element={<ReferralTracker />} />
                  <Route path="/members/kyc" element={<KYCVerification />} />
                  <Route path="/members/leadership-ranks" element={<LeadershipRankManager />} />
                  <Route path="/members/pending-email-verification" element={<PendingEmailVerification />} />
                  
                  {/* Positions */}
                  <Route path="/positions/add-member" element={<AddMemberPosition />} />
                  <Route path="/positions/pending-transactions" element={<PendingTransactions />} />
                  
                  {/* Financial */}
                  <Route path="/financial/withdrawals" element={<WithdrawalsList />} />
                  <Route path="/financial/deposits" element={<DepositsList />} />
                  <Route path="/financial/payments" element={<Payments />} />
                  <Route path="/financial/pending-transactions" element={<PendingTransactions />} />
                  <Route path="/financial/add-ewallet-transaction" element={<AddEWalletTransaction />} />
                  <Route path="/financial/ewallet-transactions" element={<EWalletTransactions />} />
                  <Route path="/financial/commission-calculator" element={<CommissionCalculator />} />
                  <Route path="/financial/bonus-system" element={<BonusSystemManager />} />
                  <Route path="/financial/fast-start-bonus" element={<FastStartBonusManager />} />
                  
                  {/* Matrix */}
                  <Route path="/matrix/overview" element={<MatrixOverview />} />
                  <Route path="/matrix/positions" element={<MatrixPositions />} />
                  <Route path="/matrix/levels" element={<MatrixLevels />} />
                  <Route path="/matrix/cycles" element={<MatrixCycles />} />
                  <Route path="/matrix/spillover" element={<SpilloverManager />} />
                  <Route path="/matrix/position-manager" element={<MatrixPositionManager />} />
                  <Route path="/matrix/cycle-manager" element={<MatrixCycleManager />} />
                  
                  {/* Communication */}
                  <Route path="/communication/email-users" element={<EmailUsers />} />
                  <Route path="/communication/global-pif-logs" element={<GlobalPIFLogs />} />
                  <Route path="/communication/message-history" element={<MessageHistory />} />
                  <Route path="/communication/notification-manager" element={<NotificationManager />} />
                  <Route path="/communication/messaging-system" element={<MessagingSystem />} />
                  <Route path="/communication/announcement-manager" element={<AnnouncementManager />} />
                  
                  {/* Content */}
                  <Route path="/content/promotional-content" element={<PromotionalContentManager />} />
                  <Route path="/content/email-templates" element={<EmailTemplateManager />} />
                  <Route path="/content/banner-manager" element={<BannerManager />} />
                  
                  {/* Banner Ads */}
                  <Route path="/banner-ads/add-banner" element={<AddBanner />} />
                  <Route path="/banner-ads/approved-banners" element={<ApprovedBanners />} />
                  <Route path="/banner-ads/pending-banners" element={<PendingBanners />} />
                  <Route path="/banner-ads/add-text-ad" element={<AddTextAd />} />
                  <Route path="/banner-ads/approved-text-ads" element={<ApprovedTextAds />} />
                  <Route path="/banner-ads/pending-text-ads" element={<PendingTextAds />} />
                  
                  {/* Analytics */}
                  <Route path="/analytics/dashboard" element={<AnalyticsDashboard />} />
                  <Route path="/analytics/reporting" element={<ReportingSystem />} />
                  <Route path="/analytics/visualization" element={<DataVisualization />} />
                  
                  {/* Modules */}
                  <Route path="/modules/manager" element={<ModulesManager />} />
                  <Route path="/modules/store" element={<ModuleStore />} />
                  
                  {/* Tools */}
                  <Route path="/tools/database-backup" element={<DatabaseBackup />} />
                  <Route path="/tools/file-manager" element={<FileManager />} />
                  <Route path="/tools/system-tools" element={<SystemTools />} />
                  <Route path="/tools/marketing-tools" element={<MarketingTools />} />
                  <Route path="/tools/contests" element={<Contests />} />
                  <Route path="/tools/digital-products" element={<DigitalProducts />} />
                  <Route path="/tools/email-validation" element={<EmailValidation />} />
                  <Route path="/tools/feedback-surveys" element={<FeedbackSurveys />} />
                  <Route path="/tools/list-management" element={<ListManagement />} />
                  <Route path="/tools/mobile-app" element={<MobileApp />} />
                  <Route path="/tools/push-notifications" element={<PushNotifications />} />
                  <Route path="/tools/promotional-banners" element={<PromotionalBanners />} />
                  <Route path="/tools/promotional-lead-pages" element={<PromotionalLeadPages />} />
                  <Route path="/tools/promotional-solo-ads" element={<PromotionalSoloAds />} />
                  <Route path="/tools/promotional-splash-pages" element={<PromotionalSplashPages />} />
                  <Route path="/tools/system-update" element={<SystemUpdate />} />
                  <Route path="/tools/testimonials-approved" element={<TestimonialsApproved />} />
                  <Route path="/tools/testimonials-pending" element={<TestimonialsPending />} />
                  <Route path="/tools/instructions" element={<Instructions />} />
                  <Route path="/tools/progressive-web-app" element={<ProgressiveWebApp />} />
                  <Route path="/tools/reset-cron-tasks" element={<ResetCronTasks />} />
                  <Route path="/tools/training-video" element={<TrainingVideo />} />
                  
                  {/* Other Pages */}
                  <Route path="/users" element={<Users />} />
                  <Route path="/payment-gateways" element={<PaymentGateways />} />
                  <Route path="/currencies" element={<Currencies />} />
                  <Route path="/matrix" element={<Matrix />} />
                  
                  {/* Email Campaigns */}
                  <Route path="/email-campaigns" element={<EmailCampaigns />} />
                  
                  {/* White-Label */}
                  <Route path="/white-label" element={<WhiteLabel />} />
                  
                  {/* Ranks Management */}
                  <Route path="/ranks/manage" element={<ManageRanks />} />
                  
                  {/* Email Campaign Analytics */}
                  <Route path="/email-campaigns/:id/stats" element={<CampaignAnalytics />} />
                  
                  {/* Gamification Management */}
                  <Route path="/gamification/manage" element={<ManageGamification />} />
                </Routes>
              </Layout>
            } />
            </Routes>
          </Router>
          </RealtimeWrapper>
        </RealtimeProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App; 