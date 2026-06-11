import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import ParkingForm from './components/admin/ParkingForm';
import SlotDrawer from './components/admin/SlotDrawer';
import BookingHistory from './components/admin/BookingHistory';
import SlotManager from './components/admin/SlotManager';
import UserDashboard from './components/user/UserDashboard';
import ParkingView from './components/user/ParkingView';
import MyBookings from './components/user/MyBookings';
import Loader from './components/common/Loader';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Loading SmartPark..." />;
  }

  return (
    <>
      <Navbar />
      <div className="app-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/parking/new" element={<ProtectedRoute role="admin"><ParkingForm /></ProtectedRoute>} />
          <Route path="/admin/parking/:id/edit" element={<ProtectedRoute role="admin"><ParkingForm /></ProtectedRoute>} />
          <Route path="/admin/parking/:id/slots" element={<ProtectedRoute role="admin"><SlotDrawer /></ProtectedRoute>} />
          <Route path="/admin/parking/:id/bookings" element={<ProtectedRoute role="admin"><BookingHistory /></ProtectedRoute>} />
          <Route path="/admin/parking/:id/manage" element={<ProtectedRoute role="admin"><SlotManager /></ProtectedRoute>} />

          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/parking/:id" element={<ProtectedRoute role="user"><ParkingView /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute role="user"><MyBookings /></ProtectedRoute>} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
