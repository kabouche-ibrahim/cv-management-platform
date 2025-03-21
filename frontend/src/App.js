import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import UserDashboard from './components/dashboard/UserDashboard';
import HRDashboard from './components/dashboard/HRDashboard';
import TestBuilder from './components/test/TestBuilder';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TestsList from './components/test/TestsList';
import TestView from './components/test/TestView';
import AdminDashboard from './components/dashboard/AdminDashboard';
import TakeTest from './components/test/TakeTest';
import CvList from './components/cv/CvList';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/take-test/:uuid/:cvId?" element={<TakeTest />} />
          <Route path="/cv-list" element={<CvList />} />
          <Route path="/job-offer/:offerId/cvs" element={<CvList />} />

          {/* Protected Routes */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/hr" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <HRDashboard />
            </ProtectedRoute>
          } />

          {/* HR Routes */}
          <Route path="/tests" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <TestsList />
            </ProtectedRoute>
          } />

          <Route path="/tests/:id" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <TestView />
            </ProtectedRoute>
          } />

          <Route path="/test-builder" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <TestBuilder />
            </ProtectedRoute>
          } />

     

          

          <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;