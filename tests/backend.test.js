const request = require('supertest');
const fs = require('fs');
const path = require('path');

let app;

beforeAll(() => {
  // Import the app
  app = require('../backend/server');
});

afterAll(() => {
  // Clean up test database
  const testDbPath = path.join(__dirname, '../backend/data/db.json');
  if (fs.existsSync(testDbPath)) {
    fs.writeFileSync(testDbPath, JSON.stringify({ users: [] }));
  }
});

describe('API Health Check', () => {
  it('should return OK status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

describe('Authentication API', () => {
  const testUser = { username: 'testuser', password: 'testpass' };

  it('should register a new user', async () => {
    const res = await request(app).post('/api/register').send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/User registered/);
    expect(res.body.user).toHaveProperty('username', testUser.username);
  });

  it('should not allow duplicate registration', async () => {
    const res = await request(app).post('/api/register').send(testUser);
    expect(res.statusCode).toBe(409);
    expect(res.body.error).toMatch(/already exists/);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/login').send(testUser);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Login successful');

    // Check that session cookie is set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.includes('connect.sid'))).toBe(true);
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/login').send({
      username: testUser.username,
      password: 'wrongpassword'
    });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/Invalid/);
  });
});

describe('Profile API', () => {
  let cookie;
  const testUser = { username: 'testuser2', password: 'testpass2' };

  beforeAll(async () => {
    // Register and login to get session cookie
    await request(app).post('/api/register').send(testUser);
    const res = await request(app).post('/api/login').send(testUser);
    cookie = res.headers['set-cookie'];
  });

  it('should return profile info when authenticated', async () => {
    const res = await request(app)
      .get('/api/profile')
      .set('Cookie', cookie);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', testUser.username);
    expect(res.body).toHaveProperty('letters');
  });

  it('should reject unauthenticated profile requests', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.statusCode).toBe(401);
  });
});

describe('PDF Generation API', () => {
  let cookie;
  const testUser = { username: 'pdfuser', password: 'pdfpass' };

  beforeAll(async () => {
    // Register and login
    await request(app).post('/api/register').send(testUser);
    const res = await request(app).post('/api/login').send(testUser);
    cookie = res.headers['set-cookie'];
  });

  it('should generate a PDF for given text', async () => {
    const res = await request(app)
      .post('/api/generate')
      .set('Cookie', cookie)
      .send({ text: 'Hello', paperSize: 'Letter' });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.body).toBeInstanceOf(Buffer);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should reject unauthenticated generation requests', async () => {
    const res = await request(app)
      .post('/api/generate')
      .send({ text: 'Hello', paperSize: 'Letter' });

    expect(res.statusCode).toBe(401);
  });
});
