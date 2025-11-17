const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'data/db.json');

// Lazy load or initialize DB
let db = { users: [] };
if (fs.existsSync(DB_PATH)) {
  try {
    const content = fs.readFileSync(DB_PATH, 'utf8');
    db = JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse db.json, starting with empty DB.');
  }
}

// Utility to save DB to disk
function saveDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

// Get user by username
function getUserByUsername(username) {
  return db.users.find(u => u.username === username) || null;
}

// Get user by ID
function getUserById(id) {
  return db.users.find(u => u.id === id) || null;
}

// Create a new user and return it
function createUser(username, passwordHash) {
  const newUser = {
    id: uuidv4(),
    username,
    passwordHash,
    profile: {
      letters: {} // letters will be a map of char -> {type, fileName or strokes}
    }
  };
  db.users.push(newUser);
  saveDB();
  return newUser;
}

// Save character image path to user's profile
function saveCharacterImage(userId, char, imgTempPath) {
  const user = getUserById(userId);
  if (!user) return;

  const userDir = path.join(__dirname, 'data/uploads', String(userId));
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  // Determine a filename for this character image
  const ext = path.extname(imgTempPath) || '.png';
  const filename = `${char}${ext}`;
  const destPath = path.join(userDir, filename);

  try {
    fs.renameSync(imgTempPath, destPath);
  } catch (err) {
    fs.copyFileSync(imgTempPath, destPath);
    fs.unlinkSync(imgTempPath);
  }

  // Store reference in profile
  user.profile.letters[char] = { type: 'image', fileName: filename };
  saveDB();
}

// Save character strokes (vector) to user's profile
function saveCharacterStrokes(userId, char, strokes) {
  const user = getUserById(userId);
  if (!user) return;

  user.profile.letters[char] = { type: 'vector', strokes: strokes };
  saveDB();
}

module.exports = {
  getUserByUsername,
  getUserById,
  createUser,
  saveCharacterImage,
  saveCharacterStrokes
};
