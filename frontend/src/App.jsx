import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChatPage from './pages/ChatPage';
import About from './pages/About';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';

// Styles
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/about" element={<About />} />
              <Route path="/books" element={<Marketplace />} />
              <Route path="/profile/:id" element={<Profile />} />
              
              <Route path="/seller-dashboard" element={
                <ProtectedRoute roles={['seller']}>
                  <SellerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/buyer-dashboard" element={
                <ProtectedRoute roles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin-dashboard" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/chat" element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
