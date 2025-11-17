import React, { useState } from 'react';

function RegisterPage({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onRegister({ id: data.user.id, username: data.user.username });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto animate-fade-in">
      <div className="card">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">Create Account</h2>
        <p className="text-gray-600 text-center mb-6">Start creating personalized handwritten notes</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Choose Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="input"
              placeholder="Pick a unique username"
            />
          </div>
          <div>
            <label className="label">Choose Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength="6"
              className="input"
              placeholder="At least 6 characters"
            />
          </div>
          <button type="submit" className="btn btn-primary w-full">Sign Up</button>
          {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}
        </form>
        <p className="mt-4 text-center text-gray-600 text-sm">
          Already have an account? <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">Log in</a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
