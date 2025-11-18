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
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('[STORAGE] Failed to save database:', err);
    throw err; // Re-throw so caller knows save failed
  }
}

// Get user by username
function getUserByUsername(username) {
  return db.users.find(u => u.username === username) || null;
}

// Get user by ID (supports both UUID and Auth0 IDs like "auth0|12345")
function getUserById(id) {
  return db.users.find(u => u.id === id) || null;
}

// Get or create user by Auth0 ID (auto-provision on first login)
function getOrCreateAuth0User(auth0User) {
  const userId = auth0User.sub; // Auth0 user ID like "auth0|12345"
  let user = getUserById(userId);

  if (!user) {
    // Auto-provision user on first Auth0 login
    user = {
      id: userId,
      username: auth0User.email || auth0User.name,
      email: auth0User.email,
      name: auth0User.name,
      picture: auth0User.picture,
      auth0Id: userId,
      createdAt: new Date().toISOString(),
      profile: {
        letters: {}, // Legacy: main character set
        fonts: {
          default: {
            id: 'default',
            name: 'My Handwriting',
            letters: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        },
        currentFontId: 'default'
      }
    };
    db.users.push(user);
    saveDB();
    console.log(`[STORAGE] Auto-provisioned new Auth0 user: ${userId}`);
  }

  // Migrate legacy users to font library system
  if (!user.profile.fonts) {
    user.profile.fonts = {
      default: {
        id: 'default',
        name: 'My Handwriting',
        letters: user.profile.letters || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };
    user.profile.currentFontId = 'default';
    saveDB();
  }

  return user;
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

// Get or create a dev/mock user (for development without Auth0)
function getOrCreateDevUser(userId) {
  let user = getUserById(userId);

  if (!user) {
    // Auto-provision dev user
    user = {
      id: userId,
      username: 'Developer',
      email: 'dev@example.com',
      createdAt: new Date().toISOString(),
      profile: {
        letters: {},
        fonts: {
          default: {
            id: 'default',
            name: 'My Handwriting',
            letters: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        },
        currentFontId: 'default'
      }
    };
    db.users.push(user);
    saveDB();
    console.log(`[STORAGE] Auto-provisioned dev user: ${userId}`);
  }

  return user;
}

// Save character strokes (vector) to user's profile
function saveCharacterStrokes(userId, char, strokes) {
  // Auto-provision user if they don't exist (for dev mode)
  const user = getOrCreateDevUser(userId);

  if (!user) {
    console.error('[STORAGE] User not found:', userId);
    return false;
  }

  // Ensure profile and letters exist
  if (!user.profile) {
    user.profile = {};
  }
  if (!user.profile.letters) {
    user.profile.letters = {};
  }

  user.profile.letters[char] = { type: 'vector', strokes: strokes };

  try {
    saveDB();
    return true;
  } catch (err) {
    console.error('[STORAGE] Failed to save character:', char, err);
    return false;
  }
}

// Font library management functions
function createFont(userId, fontName) {
  const user = getUserById(userId);
  if (!user) return null;

  if (!user.profile.fonts) {
    user.profile.fonts = {};
  }

  const fontId = uuidv4();
  user.profile.fonts[fontId] = {
    id: fontId,
    name: fontName,
    letters: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveDB();
  return user.profile.fonts[fontId];
}

function listUserFonts(userId) {
  const user = getUserById(userId);
  if (!user || !user.profile.fonts) return [];

  return Object.values(user.profile.fonts);
}

function deleteFont(userId, fontId) {
  const user = getUserById(userId);
  if (!user || !user.profile.fonts || !user.profile.fonts[fontId]) return false;

  // Can't delete default font
  if (fontId === 'default') return false;

  delete user.profile.fonts[fontId];

  // If current font was deleted, switch to default
  if (user.profile.currentFontId === fontId) {
    user.profile.currentFontId = 'default';
  }

  saveDB();
  return true;
}

function setCurrentFont(userId, fontId) {
  const user = getUserById(userId);
  if (!user || !user.profile.fonts || !user.profile.fonts[fontId]) return false;

  user.profile.currentFontId = fontId;
  saveDB();
  return true;
}

function saveCharacterToFont(userId, fontId, char, strokes) {
  const user = getUserById(userId);
  if (!user || !user.profile.fonts || !user.profile.fonts[fontId]) return false;

  user.profile.fonts[fontId].letters[char] = { type: 'vector', strokes };
  user.profile.fonts[fontId].updatedAt = new Date().toISOString();

  // Also save to legacy letters for backward compatibility
  user.profile.letters[char] = { type: 'vector', strokes };

  saveDB();
  return true;
}

module.exports = {
  getUserByUsername,
  getUserById,
  getOrCreateAuth0User,
  getOrCreateDevUser,
  createUser,
  saveCharacterImage,
  saveCharacterStrokes,
  createFont,
  listUserFonts,
  deleteFont,
  setCurrentFont,
  saveCharacterToFont,
};
