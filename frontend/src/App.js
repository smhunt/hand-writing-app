import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ComposePage from './pages/ComposePage';
import DrawPage from './pages/DrawPage';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // On initial mount, check session status
    // For simplicity, not doing an auto-login check here
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigate('/profile');
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
    navigate('/login');
  };

  return (
    <Routes>
      {/* Public routes - no navbar */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage onLogin={handleLoginSuccess} />} />
      <Route path="/register" element={<RegisterPage onRegister={handleLoginSuccess} />} />

      {/* Protected routes - with navbar */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <nav className="bg-gradient-to-r from-primary-700 to-primary-900 text-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <Link to={user ? "/profile" : "/"} className="text-2xl font-bold font-handwriting hover:opacity-80 transition-opacity">
                    ✍️ Handwritten Notes
                  </Link>
                  <ul className="flex gap-6 items-center">
                    {user ? (
                      <>
                        <li><Link to="/profile" className="hover:text-primary-200 transition-colors">Profile</Link></li>
                        <li><Link to="/compose" className="hover:text-primary-200 transition-colors">Compose Note</Link></li>
                        <li><Link to="/draw" className="hover:text-primary-200 transition-colors">Draw Characters</Link></li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="bg-white text-primary-700 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                          >
                            Logout ({user.username})
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li><Link to="/login" className="hover:text-primary-200 transition-colors">Login</Link></li>
                        <li><Link to="/register" className="btn-primary">Get Started</Link></li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </nav>

            <main className="flex-1 page-container">
              <Routes>
                <Route path="/profile" element={<ProfilePage user={user} />} />
                <Route path="/compose" element={<ComposePage user={user} />} />
                <Route path="/draw" element={<DrawPage user={user} />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
