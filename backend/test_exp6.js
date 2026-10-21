const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const app = require('./server');
const User = require('./models/User');
const AuditLog = require('./models/AuditLog');

const PORT = 5056;
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

async function runExperiment6Tests() {
  console.log('======================================================================');
  console.log('   CYBERAUDIT 360 - EXPERIMENT 6: JWT AUTHENTICATION & USER ROLES');
  console.log('======================================================================\n');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing from backend/.env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB Atlas');

  server = app.listen(PORT);
  console.log(`✓ Test server running on port ${PORT}\n`);

  let testsPassed = 0;
  let totalTests = 0;

  function assert(condition, name, details = '') {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Case ${totalTests}: ${name}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] Case ${totalTests}: ${name} - Details: ${details}`);
    }
  }

  const testUserEmail = `rahul_exp6_${Date.now()}@cyberaudit.com`;
  const testUserPassword = 'Rahul@12345';
  let userToken = '';
  let adminToken = '';

  try {
    // -------------------------------------------------------------
    // TEST 1 — Register User
    // -------------------------------------------------------------
    const regRes = await request({
      method: 'POST',
      path: '/api/users/register',
      body: {
        name: 'Rahul Sharma',
        email: testUserEmail,
        password: testUserPassword,
      },
    });

    assert(
      regRes.status === 201 && regRes.data.userId && regRes.data.role === 'user',
      'TEST 1 - Register User (POST /api/users/register) -> 201 Created',
      JSON.stringify(regRes.data)
    );

    // Verify User in MongoDB Atlas (Hashed password, role: user)
    const savedUserInAtlas = await User.findOne({ email: testUserEmail });
    assert(
      savedUserInAtlas &&
        savedUserInAtlas.role === 'user' &&
        savedUserInAtlas.password.startsWith('$2') &&
        savedUserInAtlas.password !== testUserPassword,
      'Atlas Verification - User safely stored with bcrypt hash (never plaintext) & role "user"',
      `Role: ${savedUserInAtlas?.role}, Hash: ${savedUserInAtlas?.password}`
    );

    // Verify privilege escalation protection (tampering with role: 'admin' without secret)
    const tamperRes = await request({
      method: 'POST',
      path: '/api/users/register',
      body: {
        name: 'Tamper Tester',
        email: `tamper_${Date.now()}@cyberaudit.com`,
        password: 'Password123',
        role: 'admin', // Attempt unauthorized admin assignment
      },
    });
    assert(
      tamperRes.status === 201 && tamperRes.data.role === 'user',
      'Security - Public registration safely enforces role "user" when "admin" attempted without secret',
      JSON.stringify(tamperRes.data)
    );

    // -------------------------------------------------------------
    // TEST 2 — Login User
    // -------------------------------------------------------------
    const loginRes = await request({
      method: 'POST',
      path: '/api/users/login',
      body: {
        email: testUserEmail,
        password: testUserPassword,
      },
    });
    userToken = loginRes.data?.token;

    // Decode token to verify payload contains ONLY safe identity fields (id, role)
    const decodedUserToken = userToken ? jwt.decode(userToken) : null;
    assert(
      loginRes.status === 200 &&
        !!userToken &&
        decodedUserToken?.role === 'user' &&
        !decodedUserToken?.password,
      'TEST 2 - Login User (POST /api/users/login) -> 200 OK & JWT Issued',
      JSON.stringify(loginRes.data)
    );

    // -------------------------------------------------------------
    // TEST 3 — Access Protected Route With User JWT
    // -------------------------------------------------------------
    const profileUserRes = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(
      profileUserRes.status === 200 &&
        profileUserRes.data.email === testUserEmail &&
        profileUserRes.data.password === undefined,
      'TEST 3 - Protected Route With User JWT (GET /api/users/profile) -> 200 OK',
      JSON.stringify(profileUserRes.data)
    );

    // -------------------------------------------------------------
    // TEST 4 — Access Protected Route Without Token
    // -------------------------------------------------------------
    const noTokenRes = await request({
      method: 'GET',
      path: '/api/users/profile',
    });
    assert(
      noTokenRes.status === 401,
      'TEST 4 - Protected Route Without Token (GET /api/users/profile) -> 401 Unauthorized',
      JSON.stringify(noTokenRes.data)
    );

    // -------------------------------------------------------------
    // TEST 5 — Invalid JWT
    // -------------------------------------------------------------
    const invalidTokenRes = await request({
      method: 'GET',
      path: '/api/users/profile',
      headers: { Authorization: 'Bearer invalid-token' },
    });
    assert(
      invalidTokenRes.status === 401,
      'TEST 5 - Protected Route With Invalid JWT (GET /api/users/profile) -> 401 Unauthorized',
      JSON.stringify(invalidTokenRes.data)
    );

    // -------------------------------------------------------------
    // TEST 6 — Admin Account Login
    // -------------------------------------------------------------
    const adminLoginRes = await request({
      method: 'POST',
      path: '/api/users/login',
      body: {
        email: 'admin@cyberaudit.com',
        password: 'Admin@12345',
      },
    });
    adminToken = adminLoginRes.data?.token;
    const decodedAdminToken = adminToken ? jwt.decode(adminToken) : null;
    assert(
      adminLoginRes.status === 200 &&
        !!adminToken &&
        decodedAdminToken?.role === 'admin',
      'TEST 6 - Admin Login (POST /api/users/login) -> 200 OK & Admin JWT Issued',
      JSON.stringify(adminLoginRes.data)
    );

    // -------------------------------------------------------------
    // TEST 7 — Admin Route With Admin Token
    // -------------------------------------------------------------
    const adminAccessAdminRes = await request({
      method: 'GET',
      path: '/api/users/admin',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminAccessAdminRes.status === 200 &&
        adminAccessAdminRes.data.user?.role === 'admin',
      'TEST 7 - Admin Route With Admin Token (GET /api/users/admin) -> 200 OK',
      JSON.stringify(adminAccessAdminRes.data)
    );

    // -------------------------------------------------------------
    // TEST 8 — Admin Route With Normal User Token
    // -------------------------------------------------------------
    const userAccessAdminRes = await request({
      method: 'GET',
      path: '/api/users/admin',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(
      userAccessAdminRes.status === 403,
      'TEST 8 - Admin Route With Normal User Token (GET /api/users/admin) -> 403 Forbidden',
      JSON.stringify(userAccessAdminRes.data)
    );

    // -------------------------------------------------------------
    // PRESERVATION: Experiment 4 AuditLog CRUD
    // -------------------------------------------------------------
    console.log('\n--- Verifying Experiment 4 AuditLog CRUD Preservation ---');
    const createLog = await request({
      method: 'POST',
      path: '/api/auditlogs',
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        user: testUserEmail,
        action: 'EXPERIMENT_6_TEST',
        resource: 'AUTH_RBAC',
        status: 'Success',
        ipAddress: '127.0.0.1',
        details: 'Experiment 6 automated verification audit log entry',
      },
    });
    const logId = createLog.data?._id;
    assert(
      createLog.status === 201 && !!logId,
      'Exp 4 CRUD: Create Audit Log (POST /api/auditlogs)',
      JSON.stringify(createLog.data)
    );

    const getLogs = await request({ method: 'GET', path: '/api/auditlogs' });
    assert(
      getLogs.status === 200 && Array.isArray(getLogs.data),
      'Exp 4 CRUD: Read All Audit Logs (GET /api/auditlogs)'
    );

    // Clean up created test logs & users
    if (logId) {
      await AuditLog.findByIdAndDelete(logId);
    }
    await User.deleteMany({ email: { $in: [testUserEmail, tamperRes.data.email] } });

    console.log('\n======================================================================');
    console.log(`Summary: ${testsPassed} / ${totalTests} test cases PASSED.`);
    console.log('======================================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runExperiment6Tests();
