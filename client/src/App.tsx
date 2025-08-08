// src/App.tsx - Updated with PremadeWorkouts route
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/sections/HeroSection';
import FeaturesSection from './components/sections/FeaturesSection';
import ServicesSection from './components/sections/ServicesSection';
import CTASection from './components/sections/CTASection';
import Register from './pages/Register';
import Login from './pages/Login';
import OTPVerification from './pages/OTPVerification';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import UserPreferences from './pages/UserPreferences';
import PremadeWorkouts from './pages/PremadeWorkouts'; // New import
import { isAuthenticated } from './utils/api';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return !isAuthenticated() ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public authentication routes */}
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/verify-otp" element={
          <PublicRoute>
            <OTPVerification />
          </PublicRoute>
        } />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        <Route path="/preferences" element={
          <ProtectedRoute>
            <UserPreferences />
          </ProtectedRoute>
        } />

        {/* Updated Pre-Made Workouts Route */}
        <Route path="/workout-plans" element={
          <ProtectedRoute>
            <PremadeWorkouts />
          </ProtectedRoute>
        } />

        {/* Future workout plan detail route */}
        <Route path="/workout-plan/:id" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold mb-4">🔍 Workout Plan Details</h1>
                <p className="text-purple-200 mb-8">Coming Soon! View detailed workout plan information and exercises.</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Other placeholder routes */}
        <Route path="/ai-recommender" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold mb-4">🧠 AI Workout Recommender</h1>
                <p className="text-purple-200 mb-8">Coming Soon! Our AI will create personalized workouts just for you.</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/workouts" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold mb-4">💪 My Workouts</h1>
                <p className="text-purple-200 mb-8">Coming Soon! View and manage all your workout sessions.</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/progress" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold mb-4">📈 Progress Tracking</h1>
                <p className="text-purple-200 mb-8">Coming Soon! Track your fitness progress with detailed analytics.</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-3xl font-bold mb-4">⚙️ Settings</h1>
                <p className="text-purple-200 mb-8">Coming Soon! Customize your app preferences and account settings.</p>
                <button 
                  onClick={() => window.history.back()}
                  className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </ProtectedRoute>
        } />

        {/* Home route - with navbar/footer */}
        <Route path="/" element={
          <PublicRoute>
            <>
              <Navbar />
              <HeroSection />
              <FeaturesSection />
              <ServicesSection />
              <CTASection />
              <Footer />
            </>
          </PublicRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-purple-200 mb-8">Page not found</p>
              <button 
                onClick={() => window.location.href = isAuthenticated() ? '/dashboard' : '/'}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-colors"
              >
                {isAuthenticated() ? 'Go to Dashboard' : 'Go Home'}
              </button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;