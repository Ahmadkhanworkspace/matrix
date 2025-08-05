import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Wallet from './pages/Wallet';
import Withdrawal from './pages/Withdrawal';
import PurchasePosition from './pages/PurchasePosition';
import ManagePositions from './pages/ManagePositions';
import PromoTools from './pages/PromoTools';
import TransferFunds from './pages/TransferFunds';
import GlobalPIF from './pages/GlobalPIF';
import Support from './pages/Support';
import Stats from './pages/Stats';
import NextToCycle from './pages/NextToCycle';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/wallet" element={
              <PrivateRoute>
                <Layout>
                  <Wallet />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/withdrawal" element={
              <PrivateRoute>
                <Layout>
                  <Withdrawal />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/purchase-position" element={
              <PrivateRoute>
                <Layout>
                  <PurchasePosition />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/manage-positions" element={
              <PrivateRoute>
                <Layout>
                  <ManagePositions />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/promo-tools" element={
              <PrivateRoute>
                <Layout>
                  <PromoTools />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/transfer-funds" element={
              <PrivateRoute>
                <Layout>
                  <TransferFunds />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/global-pif" element={
              <PrivateRoute>
                <Layout>
                  <GlobalPIF />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/support" element={
              <PrivateRoute>
                <Layout>
                  <Support />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/stats" element={
              <PrivateRoute>
                <Layout>
                  <Stats />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/next-to-cycle" element={
              <PrivateRoute>
                <Layout>
                  <NextToCycle />
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
};

export default App; 