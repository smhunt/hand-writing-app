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
    <div className="page RegisterPage">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div>
          <label>Choose Username:</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Choose Password:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default RegisterPage;
