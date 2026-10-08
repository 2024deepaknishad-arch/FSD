const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const app = require('./server');
const User = require('./models/User');
const AuditLog = require('./models/AuditLog');

const PORT = 5055;
let server;

function request({ method = 'GET', path = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            json = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: json,
          });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('===============================================================');
  console.log('   CYBERAUDIT 360 - EXPERIMENT 5 SECURITY & CRUD VERIFICATION');
  console.log('===============================================================\n');

  // Connect to DB and start test server
  const mongoUri = 'mongodb://127.0.0.1:27017/cyberaudit360';
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log('✓ MongoDB Connected for testing');

  server = app.listen(PORT);
  console.log(`✓ Test server running on port ${PORT}\n`);

  // Clean up any test users
  await User.deleteMany({ email: /test.*@example\.com/ });

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition, name, details = '') {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Case ${totalTests}: ${name}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] Case ${totalTests}: ${name} - ${details}`);
    }
  }

  try {
    // CASE 11: Helmet & Security Headers
    const rootRes = await request({ method: 'GET', path: '/' });
    assert(
      rootRes.status === 200 && rootRes.headers['x-content-type-options'] === 'nosniff',
      'CASE 11 - Helmet Security Headers Present',
      `Headers: ${JSON.stringify(rootRes.headers)}`
    );

    // CASE 5: Invalid registration input
    const valRes = await request({
      method: 'POST',
      path: '/api/users/register',
      body: { name: '', email: 'notanemail', password: '123' },
    });
    assert(
      valRes.status === 400 && valRes.data.errors && valRes.data.errors.length >= 3,
      'CASE 5 - Invalid Registration Input -> 400 Bad Request',
      JSON.stringify(valRes.data)
    );

    // User Registration (Valid)
    const regRes = await request({
      method: 'POST',
      path: '/api/users/register',
      body: {
        name: 'Regular Auditor',
        email: 'testuser@example.com',
        password: 'UserSecret123',
        role: 'user',
      },
    });
    assert(
      regRes.status === 201 && regRes.data.userId && !regRes.data.password,
      'Valid User Registration -> 201 Created',
      JSON.stringify(regRes.data)
    );

    // Register Admin user for RBAC tests
    const regAdminRes = await request({
      method: 'POST',
      path: '/api/users/register',
      body: {
        name: 'SecAdmin',
        email: 'testadmin@example.com',
        password: 'AdminSecret123',
        role: 'admin',
      },
    });
    assert(
      regAdminRes.status === 201 && regAdminRes.data.userId,
      'Admin Registration -> 201 Created',
      JSON.stringify(regAdminRes.data)
    );

    // CASE 9: Password Security (bcrypt hash in MongoDB)
    const dbUser = await User.findOne({ email: 'testuser@example.com' });
    const isHashed =
      dbUser &&
      dbUser.password.startsWith('$2') &&
      dbUser.password !== 'UserSecret123';
    assert(
      isHashed,
      'CASE 9 - Password Security (bcrypt hash stored, never plaintext)',
      `Stored hash: ${dbUser ? dbUser.password : 'none'}`
    );

    // CASE 6: Duplicate email registration
    const dupRes = await request({
      method: 'POST',
      path: '/api/users/register',
      body: {
        name: 'Regular Auditor',
        email: 'testuser@example.com',
        password: 'UserSecret123',
      },
    });
    assert(
      dupRes.status === 409,
      'CASE 6 - Duplicate Email -> 409 Conflict',
      JSON.stringify(dupRes.data)
    );

    // CASE 1: Login with Wrong Password
    const wrongPassRes = await request({
      method: 'POST',
      path: '/api/users/login',
      body: {
        email: 'testuser@example.com',
        password: 'WrongPassword999',
      },
    });
    assert(
      wrongPassRes.status === 401,
      'CASE 1 - Wrong Password -> 401 Unauthorized',
      JSON.stringify(wrongPassRes.data)
    );

    // Successful Login & JWT issuance
    const loginRes = await request({
      method: 'POST',
      path: '/api/users/login',
      body: {
        email: 'testuser@example.com',
        password: 'UserSecret123',
      },
    });
    const userToken = loginRes.data && loginRes.data.token;
    assert(
      loginRes.status === 200 && !!userToken,
      'Successful Login -> 200 OK & JWT Issued',
      JSON.stringify(loginRes.data)
    );

    // Login Admin
    const loginAdminRes = await request({
      method: 'POST',
      path: '/api/users/login',
      body: {
        email: 'testadmin@example.com',
        password: 'AdminSecret123',
      },
    });
    const adminToken = loginAdminRes.data && loginAdminRes.data.token;
    assert(
      loginAdminRes.status === 200 && !!adminToken,
      'Successful Admin Login -> 200 OK & JWT Issued',
      JSON.stringify(loginAdminRes.data)
    );

    // CASE 2: Protected profile with No Token
    const noTokenRes = await request({
      method: 'GET',
      path: '/api/users/profile',
    });
    assert(
      noTokenRes.status === 401,
      'CASE 2 - Protected Profile with No Token -> 401 Unauthorized',
      JSON.stringify(noTokenRes.data)
    );

    // CASE 3: Protected profile with Invalid Token
    const invalidTokenRes = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: { Authorization: 'Bearer totally.invalid.token' },
    });
    assert(
      invalidTokenRes.status === 401,
      'CASE 3 - Protected Profile with Invalid Token -> 401 Unauthorized',
      JSON.stringify(invalidTokenRes.data)
    );

    // CASE 4: Protected profile with Expired Token
    const expiredToken = jwt.sign(
      { id: dbUser._id, role: dbUser.role },
      process.env.JWT_SECRET || 'cyberaudit360_super_secret_jwt_key_2026',
      { expiresIn: '-10s' }
    );
    const expiredRes = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert(
      expiredRes.status === 401,
      'CASE 4 - Protected Profile with Expired Token -> 401 Unauthorized',
      JSON.stringify(expiredRes.data)
    );

    // CASE 10: Profile Security (Password NOT returned)
    const profileRes = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const profileData = profileRes.data;
    assert(
      profileRes.status === 200 &&
        profileData.email === 'testuser@example.com' &&
        profileData.password === undefined,
      'CASE 10 - Profile Security (Valid Token & Password Excluded)',
      JSON.stringify(profileData)
    );

    // CASE 7: Unauthorized Role (User accessing Admin-only endpoint)
    const userAccessAdminRes = await request({
      method: 'GET',
      path: '/api/users/admin',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(
      userAccessAdminRes.status === 403,
      'CASE 7 - Unauthorized Role -> 403 Forbidden',
      JSON.stringify(userAccessAdminRes.data)
    );

    // Authorized Role (Admin accessing Admin-only endpoint)
    const adminAccessAdminRes = await request({
      method: 'GET',
      path: '/api/users/admin',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminAccessAdminRes.status === 200,
      'Role Authorization -> Admin Access 200 OK',
      JSON.stringify(adminAccessAdminRes.data)
    );

    // Experiment 4 Preservation: AuditLog CRUD
    console.log('\n--- Verifying Experiment 4 AuditLog CRUD Preservation ---');
    // POST
    const createLogRes = await request({
      method: 'POST',
      path: '/api/auditlogs',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        user: 'testuser@example.com',
        action: 'EXP5_SECURITY_CHECK',
        resource: 'AUTH_CONTROLLER',
        status: 'Success',
        ipAddress: '127.0.0.1',
        details: 'Security test log entry verified',
      },
    });
    const logId = createLogRes.data._id;
    assert(
      createLogRes.status === 201 && !!logId,
      'Exp 4 CRUD: Create Audit Log (POST /api/auditlogs)',
      JSON.stringify(createLogRes.data)
    );

    // GET all
    const readAllRes = await request({ method: 'GET', path: '/api/auditlogs' });
    assert(
      readAllRes.status === 200 && Array.isArray(readAllRes.data) && readAllRes.data.length > 0,
      'Exp 4 CRUD: Read All Audit Logs (GET /api/auditlogs)'
    );

    // GET by ID
    const readOneRes = await request({ method: 'GET', path: `/api/auditlogs/${logId}` });
    assert(
      readOneRes.status === 200 && readOneRes.data._id === logId,
      'Exp 4 CRUD: Read One Audit Log (GET /api/auditlogs/:id)'
    );

    // PUT
    const updateRes = await request({
      method: 'PUT',
      path: `/api/auditlogs/${logId}`,
      body: { details: 'Updated via Experiment 5 PUT operation' },
    });
    assert(
      updateRes.status === 200 &&
        updateRes.data.details === 'Updated via Experiment 5 PUT operation',
      'Exp 4 CRUD: Update Audit Log (PUT /api/auditlogs/:id)'
    );

    // DELETE
    const deleteRes = await request({
      method: 'DELETE',
      path: `/api/auditlogs/${logId}`,
    });
    assert(
      deleteRes.status === 200,
      'Exp 4 CRUD: Delete Audit Log (DELETE /api/auditlogs/:id)'
    );

    // CASE 8: Multiple Rapid Requests -> 429 Too Many Requests
    console.log('\n--- Verifying Rate Limiting (CASE 8) ---');
    let hit429 = false;
    for (let i = 0; i < 115; i++) {
      const r = await request({ method: 'GET', path: '/' });
      if (r.status === 429) {
        hit429 = true;
        break;
      }
    }
    assert(
      hit429,
      'CASE 8 - Rate Limiting -> 429 Too Many Requests after excessive requests',
      `hit429: ${hit429}`
    );

    console.log(`\n===============================================================`);
    console.log(`Summary: ${testsPassed} / ${totalTests} test cases PASSED.`);
    console.log(`===============================================================`);
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
