import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import ComposePage from './pages/ComposePage';
import DrawPage from './pages/DrawPage';

function App() {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes - no navbar */}
      <Route path="/" element={<LandingPage />} />

      {/* Protected routes - with navbar */}
      <Route
        path="/*"
        element={
          <div className="min-h-screen flex flex-col bg-gray-50">
            <nav className="bg-gradient-to-r from-primary-700 to-primary-900 text-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <Link to={isAuthenticated ? "/profile" : "/"} className="text-2xl font-bold font-handwriting hover:opacity-80 transition-opacity">
                    ✍️ Handwritten Notes
                  </Link>
                  <ul className="flex gap-6 items-center">
                    {isAuthenticated ? (
                      <>
                        <li><Link to="/profile" className="hover:text-primary-200 transition-colors">Profile</Link></li>
                        <li><Link to="/compose" className="hover:text-primary-200 transition-colors">Compose Note</Link></li>
                        <li><Link to="/draw" className="hover:text-primary-200 transition-colors">Draw Characters</Link></li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="bg-white text-primary-700 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                          >
                            Logout ({user?.email || user?.name})
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <button
                            onClick={() => loginWithRedirect()}
                            className="hover:text-primary-200 transition-colors"
                          >
                            Login
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
                            className="btn-primary"
                          >
                            Get Started
                          </button>
                        </li>
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
