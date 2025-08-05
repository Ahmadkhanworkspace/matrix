import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
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
import BonusSystemManager from './pages/Financial/BonusSystemManager';
import FastStartBonusManager from './pages/Financial/FastStartBonusManager';

// Matrix Pages
import MatrixOverview from './pages/Matrix/MatrixOverview';
import MatrixPositions from './pages/Matrix/MatrixPositions';
import MatrixLevels from './pages/Matrix/MatrixLevels';
import MatrixPositionManager from './pages/Matrix/MatrixPositionManager';

// Communication Pages
import NotificationManager from './pages/Communication/NotificationManager';
import MessagingSystem from './pages/Communication/MessagingSystem';
import AnnouncementManager from './pages/Communication/AnnouncementManager';

// Content Pages
import PromotionalContentManager from './pages/Content/PromotionalContentManager';
import EmailTemplateManager from './pages/Content/EmailTemplateManager';
import BannerManager from './pages/Content/BannerManager';

// Analytics Pages
import ReportingSystem from './pages/Analytics/ReportingSystem';

// Tools Pages
import DatabaseBackup from './pages/Settings/DatabaseBackup';
import FileManager from './pages/Settings/FileManager';

// Modules Pages
import ModulesManager from './pages/Modules/ModulesManager';

// Other Pages
import Users from './pages/Users';
import PaymentGateways from './pages/PaymentGateways';
import Currencies from './pages/Currencies';
import Matrix from './pages/Matrix';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
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
                  <Route path="/financial/bonus-system" element={<BonusSystemManager />} />
                  <Route path="/financial/fast-start-bonus" element={<FastStartBonusManager />} />
                  
                  {/* Matrix */}
                  <Route path="/matrix/overview" element={<MatrixOverview />} />
                  <Route path="/matrix/positions" element={<MatrixPositions />} />
                  <Route path="/matrix/levels" element={<MatrixLevels />} />
                  <Route path="/matrix/position-manager" element={<MatrixPositionManager />} />
                  
                  {/* Communication */}
                  <Route path="/communication/notification-manager" element={<NotificationManager />} />
                  <Route path="/communication/messaging-system" element={<MessagingSystem />} />
                  <Route path="/communication/announcement-manager" element={<AnnouncementManager />} />
                  
                  {/* Content */}
                  <Route path="/content/promotional-content" element={<PromotionalContentManager />} />
                  <Route path="/content/email-templates" element={<EmailTemplateManager />} />
                  <Route path="/content/banner-manager" element={<BannerManager />} />
                  
                  {/* Analytics */}
                  <Route path="/analytics/reporting" element={<ReportingSystem />} />
                  
                  {/* Modules */}
                  <Route path="/modules/manager" element={<ModulesManager />} />
                  
                  {/* Tools */}
                  <Route path="/tools/database-backup" element={<DatabaseBackup />} />
                  <Route path="/tools/file-manager" element={<FileManager />} />
                  
                  {/* Other Pages */}
                  <Route path="/users" element={<Users />} />
                  <Route path="/payment-gateways" element={<PaymentGateways />} />
                  <Route path="/currencies" element={<Currencies />} />
                  <Route path="/matrix" element={<Matrix />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App; 