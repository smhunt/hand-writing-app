const express = require('express');
const bcrypt = require('bcrypt');
const { getUserByUsername, createUser } = require('./storage');

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (getUserByUsername(username)) {
    return res.status(409).json({ error: 'Username already exists' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const newUser = createUser(username, hash);

    // Auto-login after registration
    req.session.userId = newUser.id;
    req.session.username = newUser.username;

    res.json({ message: 'User registered', user: { id: newUser.id, username: newUser.username } });
  } catch (err) {
    console.error('Error registering user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login an existing user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = getUserByUsername(username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Set session and respond
  req.session.userId = user.id;
  req.session.username = user.username;

  res.json({ message: 'Login successful', user: { id: user.id, username: user.username } });
});

// Logout (if using session-based auth)
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
