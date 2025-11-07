/**
 * Main App Component
 * 
 * Application entry point with routing and auth provider
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

// Main App Router
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
