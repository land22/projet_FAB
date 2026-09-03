import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Rations from './pages/Rations';
import Approvisionnement from './pages/Approvisionnement';
import ApprovisionnementDetail from './pages/ApprovisionnementDetail';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requireSuperuserOrResponsable>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
          path="/employees"
          element={
            <ProtectedRoute requireRole="chef_du_personnel">
              <Employees />
            </ProtectedRoute>
          }
        />
         <Route
        path="/employees/:id"
        element={
          <ProtectedRoute requireRole="chef_du_personnel">
            <EmployeeDetail />
          </ProtectedRoute>
        }
      />
        <Route
          path="/clients"
          element={
            <ProtectedRoute requireRole="gerant">
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/:id"
          element={
            <ProtectedRoute requireRole="gerant">
              <ClientDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rations"
          element={
            <ProtectedRoute requireRole="chef_du_personnel">
              <Rations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvisionnement"
          element={
            <ProtectedRoute requireRole="gerant">
              <Approvisionnement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approvisionnement/:id"
          element={
            <ProtectedRoute requireRole="gerant">
              <ApprovisionnementDetail />
            </ProtectedRoute>
          }
        />
        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
