import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { UpdatePrompt } from './components/UpdatePrompt'
import { Login } from './components/Auth/Login'
import { Onboarding } from './components/Onboarding'
import { Dashboard } from './components/Dashboard'
import { Settings } from './components/Settings'

function App() {
  return (
    <Router>
      <AuthProvider>
        <UpdatePrompt />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
