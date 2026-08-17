import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import DashboardLayout from './components/layout/DashboardLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Personnes from './pages/Personnes'
import PersonneDetail from './pages/PersonneDetail'
import Mobiliers from './pages/Mobiliers'
import Consommables from './pages/Consommables'
import ConsommableDetail from './pages/ConsommableDetail'
import Mouvements from './pages/Mouvements'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/personnes" element={<Personnes />} />
          <Route path="/personnes/:id" element={<PersonneDetail />} />
          <Route path="/mobiliers" element={<Mobiliers />} />
          <Route path="/consommables" element={<Consommables />} />
          <Route path="/consommables/:refC" element={<ConsommableDetail />} />
          <Route path="/mouvements" element={<Mouvements />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
