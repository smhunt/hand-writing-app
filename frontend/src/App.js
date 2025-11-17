import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ComposePage from './pages/ComposePage';
import DrawPage from './pages/DrawPage';
import './App.css';

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
    <div className="App">
      <nav className="navbar">
        <h1>Handwritten Note App</h1>
        <ul className="nav-menu">
          {user ? (
            <>
              <li><Link to="/profile">Profile</Link></li>
              <li><Link to="/compose">Compose Note</Link></li>
              <li><Link to="/draw">Draw Characters</Link></li>
              <li><button onClick={handleLogout} className="logout-btn">Logout ({user.username})</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProfilePage user={user} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLoginSuccess} />} />
          <Route path="/register" element={<RegisterPage onRegister={handleLoginSuccess} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
          <Route path="/compose" element={<ComposePage user={user} />} />
          <Route path="/draw" element={<DrawPage user={user} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
