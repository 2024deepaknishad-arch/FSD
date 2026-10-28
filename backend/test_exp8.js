const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');
const { io: ioClient } = require('socket.io-client');

dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const app = require('./server');
const User = require('./models/User');
const AuditLog = require('./models/AuditLog');

const PORT = 5058;
let serverInstance;

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

async function runExperiment8Tests() {
  console.log('======================================================================');
  console.log('   CYBERAUDIT 360 - EXPERIMENT 8: WEBSOCKET & REAL-TIME COMMUNICATION');
  console.log('======================================================================\n');

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI is missing from backend/.env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('✓ Connected to MongoDB Atlas');

  // Start HTTP server with Socket.IO attached
  serverInstance = app.server || http.createServer(app);
  await new Promise((resolve) => serverInstance.listen(PORT, '127.0.0.1', resolve));
  console.log(`✓ Test server & Socket.IO running on port ${PORT}\n`);

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

  let client1 = null;
  let client2 = null;

  try {
    const socketUrl = `http://127.0.0.1:${PORT}`;

    // -------------------------------------------------------------------
    // TEST 1 — Socket.IO Server Initialization & HTTP API Health
    // -------------------------------------------------------------------
    console.log('--- TEST SUITE 1: SERVER & SOCKET.IO INITIALIZATION ---');
    const healthRes = await request({ method: 'GET', path: '/' });
    assert(
      healthRes.status === 200 && healthRes.data?.message?.includes('CyberAudit 360'),
      'HTTP API Server is running on test port and returning healthy status'
    );

    const dockerApiRes = await request({ method: 'GET', path: '/api' });
    assert(
      dockerApiRes.status === 200 && dockerApiRes.data?.message === 'Backend is running inside Docker!',
      'Docker endpoint GET /api preserved and functional'
    );

    // -------------------------------------------------------------------
    // TEST 2 & 4 — Connect Two Socket.IO Clients (Student 1 and Student 2)
    // -------------------------------------------------------------------
    console.log('\n--- TEST SUITE 2: MULTI-CLIENT SOCKET.IO HANDSHAKE ---');
    client1 = ioClient(socketUrl, { transports: ['websocket'] });
    client2 = ioClient(socketUrl, { transports: ['websocket'] });

    await new Promise((resolve) => {
      let connectedCount = 0;
      const check = () => {
        connectedCount++;
        if (connectedCount === 2) resolve();
      };
      client1.on('connect', check);
      client2.on('connect', check);
    });

    assert(
      client1.connected && client2.connected && client1.id !== client2.id,
      'Two distinct browser-equivalent clients successfully connected via WebSockets',
      `Client 1 ID: ${client1.id}, Client 2 ID: ${client2.id}`
    );

    // -------------------------------------------------------------------
    // TEST 5 — Real-Time Chat Message Broadcasting Across Clients
    // -------------------------------------------------------------------
    console.log('\n--- TEST SUITE 3: CHAT MESSAGE BROADCASTING (PDF WORKFLOW) ---');
    const msgFromStudent1 = 'Hello from Student 1! Testing real-time WebSocket.';
    const msgPromise = new Promise((resolve) => {
      let receivedCount = 0;
      const results = {};

      client1.on('chatMessage', (msg) => {
        results.client1 = msg;
        receivedCount++;
        if (receivedCount === 2) resolve(results);
      });

      client2.on('chatMessage', (msg) => {
        results.client2 = msg;
        receivedCount++;
        if (receivedCount === 2) resolve(results);
      });

      client1.emit('chatMessage', {
        username: 'Student 1',
        message: msgFromStudent1,
      });
    });

    const broadcastResults = await msgPromise;
    assert(
      broadcastResults.client1?.message === msgFromStudent1 &&
        broadcastResults.client2?.message === msgFromStudent1 &&
        broadcastResults.client1?.username === 'Student 1' &&
        !!broadcastResults.client1?.timestamp,
      'Message sent from Client 1 was immediately broadcast and received by Client 1 & Client 2 without refresh',
      JSON.stringify(broadcastResults.client2)
    );

    // Bidirectional test: Message from Student 2
    const msgFromStudent2 = 'Hi Student 1! Real-time communication verified.';
    const msgPromise2 = new Promise((resolve) => {
      let receivedCount = 0;
      const results = {};

      const handler1 = (msg) => {
        if (msg.username === 'Student 2') {
          results.client1 = msg;
          receivedCount++;
          if (receivedCount === 2) resolve(results);
        }
      };
      const handler2 = (msg) => {
        if (msg.username === 'Student 2') {
          results.client2 = msg;
          receivedCount++;
          if (receivedCount === 2) resolve(results);
        }
      };

      client1.on('chatMessage', handler1);
      client2.on('chatMessage', handler2);

      client2.emit('chatMessage', {
        username: 'Student 2',
        message: msgFromStudent2,
      });
    });

    const broadcastResults2 = await msgPromise2;
    assert(
      broadcastResults2.client1?.message === msgFromStudent2 &&
        broadcastResults2.client2?.message === msgFromStudent2,
      'Bidirectional broadcast verified: Student 2 message received by both clients',
      JSON.stringify(broadcastResults2.client1)
    );

    // -------------------------------------------------------------------
    // TEST 6 — Empty / Whitespace Message Validation
    // -------------------------------------------------------------------
    console.log('\n--- TEST SUITE 4: INPUT VALIDATION & PAYLOAD SANITIZATION ---');
    let emptyMsgReceived = false;
    const emptyMsgHandler = (msg) => {
      if (msg.message === '' || msg.message.trim() === '') {
        emptyMsgReceived = true;
      }
    };
    client2.on('chatMessage', emptyMsgHandler);

    client1.emit('chatMessage', { username: 'Student 1', message: '   ' });
    client1.emit('chatMessage', { username: 'Student 1', message: '' });
    client1.emit('chatMessage', null);

    // Give time to ensure it is not delivered
    await new Promise((r) => setTimeout(r, 400));
    client2.off('chatMessage', emptyMsgHandler);

    assert(
      !emptyMsgReceived,
      'Empty or whitespace-only messages are rejected by backend and not broadcast'
    );

    // -------------------------------------------------------------------
    // TEST 7 — Disconnection Handling
    // -------------------------------------------------------------------
    console.log('\n--- TEST SUITE 5: DISCONNECTION LIFECYCLE ---');
    client2.disconnect();
    await new Promise((r) => setTimeout(r, 200));

    assert(!client2.connected, 'Client 2 disconnected cleanly from Socket.IO server');
    assert(client1.connected, 'Client 1 remains connected and operational after peer disconnect');

    // Reconnect client 2 for security alert testing
    client2 = ioClient(socketUrl, { transports: ['websocket'] });
    await new Promise((resolve) => client2.on('connect', resolve));
    assert(client2.connected, 'Client 2 successfully re-established Socket.IO connection');

    // -------------------------------------------------------------------
    // TEST 8 — Real-Time Security Alert Broadcast
    // -------------------------------------------------------------------
    console.log('\n--- TEST SUITE 6: REAL-TIME SECURITY ALERT BUS ---');
    const alertPromise = new Promise((resolve) => {
      let alertCount = 0;
      const alertsReceived = {};

      client1.on('securityAlert', (alert) => {
        alertsReceived.c1 = alert;
        alertCount++;
        if (alertCount === 2) resolve(alertsReceived);
      });

      client2.on('securityAlert', (alert) => {
        alertsReceived.c2 = alert;
        alertCount++;
        if (alertCount === 2) resolve(alertsReceived);
      });
    });

    // Trigger controlled development/test security alert endpoint
    const simRes = await request({
      method: 'POST',
      path: '/api/alerts/simulate',
      body: {
        title: 'Brute-force Anomaly Detected',
        severity: 'high',
        type: 'Authentication Anomaly',
        message: '5 consecutive failed logins detected from 192.168.1.100 within 60s',
      },
    });

    assert(
      simRes.status === 201 && simRes.data?.alert?.id,
      'POST /api/alerts/simulate generates security alert record in backend',
      JSON.stringify(simRes.data?.alert)
    );

    const alertResults = await alertPromise;
    assert(
      alertResults.c1?.title === 'Brute-force Anomaly Detected' &&
        alertResults.c2?.title === 'Brute-force Anomaly Detected' &&
        alertResults.c1?.severity === 'high',
      'Backend securityAlert event broadcast received by all connected WebSocket clients in real-time',
      JSON.stringify(alertResults.c1)
    );

    // -------------------------------------------------------------------
    // TEST 9 — Security Alert Triggered by Actual Failed Authentication
    // -------------------------------------------------------------------
    console.log('\n--- TEST SUITE 7: REAL SYSTEM EVENT ALERT TRIGGER ---');
    const authAlertPromise = new Promise((resolve) => {
      client1.once('securityAlert', (alert) => resolve(alert));
    });

    // Trigger genuine failed login on backend REST API
    await request({
      method: 'POST',
      path: '/api/users/login',
      body: {
        email: 'unregistered_hacker@domain.com',
        password: 'WrongPassword123',
      },
    });

    const authAlert = await authAlertPromise;
    assert(
      authAlert?.type === 'Authentication Anomaly' &&
        authAlert?.title === 'Failed Login Attempt' &&
        authAlert?.severity === 'high',
      'Actual failed login attempt automatically triggers real-time securityAlert over WebSocket',
      JSON.stringify(authAlert)
    );

    // -------------------------------------------------------------------
    // TEST 10 — Regression Tests: Experiments 4, 5, 6 Preservation
    // -------------------------------------------------------------------
    console.log('\n--- TEST SUITE 8: REGRESSION & PRESERVATION OF EXP 4, 5, 6 ---');
    // Admin login
    const adminLoginRes = await request({
      method: 'POST',
      path: '/api/users/login',
      body: {
        email: 'admin@cyberaudit.com',
        password: 'Admin@12345',
      },
    });
    const adminToken = adminLoginRes.data?.token;
    assert(
      adminLoginRes.status === 200 && !!adminToken,
      'Exp 6: Admin login & JWT generation operational',
      `Status: ${adminLoginRes.status}`
    );

    // Admin protected RBAC route
    const adminDashRes = await request({
      method: 'GET',
      path: '/api/users/admin',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminDashRes.status === 200 && adminDashRes.data?.user?.role === 'admin',
      'Exp 6: RBAC protected admin route verified (/api/users/admin)'
    );

    // Exp 4: AuditLog CRUD
    const createLogRes = await request({
      method: 'POST',
      path: '/api/auditlogs',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        user: 'admin@cyberaudit.com',
        action: 'EXPERIMENT_8_VERIFICATION',
        resource: 'WEBSOCKET_CLUSTER',
        status: 'Success',
        ipAddress: '127.0.0.1',
        details: 'Experiment 8 automated WebSocket verification log',
      },
    });
    const testLogId = createLogRes.data?._id;
    assert(
      createLogRes.status === 201 && !!testLogId,
      'Exp 4: AuditLog creation persisted to MongoDB Atlas'
    );

    // Clean up test log
    if (testLogId) {
      await AuditLog.findByIdAndDelete(testLogId);
    }

    console.log('\n======================================================================');
    console.log(`Summary: ${testsPassed} / ${totalTests} test cases PASSED.`);
    console.log('======================================================================\n');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    if (client1) client1.disconnect();
    if (client2) client2.disconnect();
    if (serverInstance) serverInstance.close();
    await mongoose.disconnect();
    process.exit(testsPassed === totalTests ? 0 : 1);
  }
}

runExperiment8Tests();
