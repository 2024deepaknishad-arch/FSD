const http = require('http');
const { io: ioClient } = require('socket.io-client');

function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    let payload = null;
    if (body) {
      payload = typeof body === 'string' ? body : JSON.stringify(body);
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(reqOptions, (res) => {
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
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('========================================================================');
  console.log('   CYBERAUDIT 360 - EXPERIMENT 9: DOCKER COMPOSE VERIFICATION SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extra = '') {
    if (condition) {
      console.log(`[PASS] ${testName} ${extra ? `(${extra})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${extra ? `(${extra})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Backend Health Check (GET http://localhost:5000/api)
    console.log('--- 1. BACKEND DOCKER HEALTH ENDPOINT (PORT 5000) ---');
    const apiRes = await request('http://127.0.0.1:5000/api');
    assert(
      apiRes.status === 200 && apiRes.data.message === 'Backend is running inside Docker!',
      'GET /api returns "Backend is running inside Docker!"',
      `status: ${apiRes.status}, message: "${apiRes.data?.message}"`
    );

    // 2. Backend Root Endpoint (GET http://localhost:5000/)
    console.log('\n--- 2. BACKEND ROOT ENDPOINT ---');
    const rootRes = await request('http://127.0.0.1:5000/');
    assert(
      rootRes.status === 200 && rootRes.data.message?.includes('CyberAudit 360'),
      'GET / returns CyberAudit 360 API running message',
      `status: ${rootRes.status}`
    );

    // 3. Helmet & CORS Security Checks (Exp 5)
    console.log('\n--- 3. SECURITY HEADERS & CORS (EXPERIMENT 5 PRESERVED) ---');
    const hasHelmet = !!(
      apiRes.headers['x-content-type-options'] ||
      apiRes.headers['x-frame-options'] ||
      apiRes.headers['x-dns-prefetch-control']
    );
    assert(hasHelmet, 'Helmet security headers are active on responses');

    // 4. JWT Authentication & MongoDB Atlas (Exp 6)
    console.log('\n--- 4. JWT AUTHENTICATION & ATLAS PERSISTENCE (EXPERIMENT 6 PRESERVED) ---');
    const loginRes = await request('http://127.0.0.1:5000/api/users/login', { method: 'POST' }, {
      email: 'admin@cyberaudit.com',
      password: 'Admin@12345',
    });
    assert(
      loginRes.status === 200 && !!loginRes.data.token,
      'POST /api/users/login authenticates administrator in MongoDB Atlas',
      `status: ${loginRes.status}`
    );
    const token = loginRes.data?.token;

    if (token) {
      const profileRes = await request('http://127.0.0.1:5000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert(
        profileRes.status === 200 && profileRes.data.email === 'admin@cyberaudit.com',
        'GET /api/users/profile returns protected user profile with JWT',
        `status: ${profileRes.status}, email: ${profileRes.data?.email}`
      );
    }

    // 5. AuditLog CRUD APIs (Exp 4)
    console.log('\n--- 5. AUDITLOG CRUD OPERATIONS (EXPERIMENT 4 PRESERVED) ---');
    const uniqueAction = `DockerComposeExp9_Verification_${Date.now()}`;
    const createLogRes = await request('http://127.0.0.1:5000/api/auditlogs', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }, {
      action: uniqueAction,
      user: 'admin@cyberaudit.com',
      resource: 'DockerComposeVerification',
      details: 'Automated test of containerized Express + MongoDB Atlas persistence in Exp 9',
      status: 'Success',
    });
    assert(
      createLogRes.status === 201 && !!createLogRes.data._id,
      'POST /api/auditlogs creates audit log record in MongoDB Atlas',
      `status: ${createLogRes.status}, id: ${createLogRes.data?._id}`
    );
    const createdId = createLogRes.data?._id;

    const getLogsRes = await request('http://127.0.0.1:5000/api/auditlogs');
    assert(
      getLogsRes.status === 200 && Array.isArray(getLogsRes.data) && getLogsRes.data.length > 0,
      'GET /api/auditlogs retrieves audit logs array from MongoDB Atlas',
      `status: ${getLogsRes.status}, count: ${getLogsRes.data?.length}`
    );

    if (createdId) {
      const updateRes = await request(`http://127.0.0.1:5000/api/auditlogs/${createdId}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }, {
        status: 'Failed',
        details: 'Audit log updated successfully in Docker Compose test',
      });
      assert(
        updateRes.status === 200,
        `PUT /api/auditlogs/${createdId} updates record in Atlas`,
        `status: ${updateRes.status}`
      );

      const deleteRes = await request(`http://127.0.0.1:5000/api/auditlogs/${createdId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      assert(
        deleteRes.status === 200,
        `DELETE /api/auditlogs/${createdId} removes test record from Atlas`,
        `status: ${deleteRes.status}`
      );
    }

    // 6. Socket.IO Real-Time Chat Between Two Clients (Exp 8)
    console.log('\n--- 6. SOCKET.IO REAL-TIME CHAT & BROADCAST (EXPERIMENT 8 PRESERVED) ---');
    const socket1 = ioClient('http://127.0.0.1:5000', {
      transports: ['websocket', 'polling'],
      reconnection: false,
    });
    const socket2 = ioClient('http://127.0.0.1:5000', {
      transports: ['websocket', 'polling'],
      reconnection: false,
    });

    await Promise.all([
      new Promise((res, rej) => {
        socket1.on('connect', res);
        socket1.on('connect_error', rej);
        setTimeout(() => rej(new Error('Socket1 connect timeout')), 4000);
      }),
      new Promise((res, rej) => {
        socket2.on('connect', res);
        socket2.on('connect_error', rej);
        setTimeout(() => rej(new Error('Socket2 connect timeout')), 4000);
      }),
    ]);
    assert(socket1.connected && socket2.connected, 'Two independent Socket.IO clients connected to port 5000 container');

    const testChatMessage = `Exp9 Docker Compose Verification Message: ${Date.now()}`;
    const messageReceivedPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for chatMessage')), 4000);
      socket2.on('chatMessage', (data) => {
        if (data.message === testChatMessage) {
          clearTimeout(timeout);
          resolve(data);
        }
      });
    });

    socket1.emit('chatMessage', {
      username: 'Student 1',
      message: testChatMessage,
    });

    const receivedMessage = await messageReceivedPromise;
    assert(
      receivedMessage && receivedMessage.username === 'Student 1' && receivedMessage.message === testChatMessage,
      'Socket.IO broadcasted chat message successfully from Client 1 to Client 2 inside Docker',
      `received: "${receivedMessage?.message}"`
    );

    socket1.disconnect();
    socket2.disconnect();

    // 7. Frontend Vite Development Server (PORT 5173)
    console.log('\n--- 7. FRONTEND VITE DEV CONTAINER (PORT 5173) ---');
    const feRes = await request('http://127.0.0.1:5173/');
    assert(
      feRes.status === 200 && typeof feRes.data === 'string' && feRes.data.includes('<div id="root"></div>'),
      'GET http://localhost:5173/ serves Vite React frontend with root container',
      `status: ${feRes.status}`
    );

    // 8. Frontend SPA Navigation /docker and /chat
    const feDockerRes = await request('http://127.0.0.1:5173/docker');
    assert(
      feDockerRes.status === 200 && typeof feDockerRes.data === 'string' && feDockerRes.data.includes('<div id="root"></div>'),
      'GET http://localhost:5173/docker serves React Router SPA route',
      `status: ${feDockerRes.status}`
    );

    const feChatRes = await request('http://127.0.0.1:5173/chat');
    assert(
      feChatRes.status === 200 && typeof feChatRes.data === 'string' && feChatRes.data.includes('<div id="root"></div>'),
      'GET http://localhost:5173/chat serves Real-Time Chat SPA route',
      `status: ${feChatRes.status}`
    );

  } catch (err) {
    console.error('[TEST ERROR]', err.message);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================');
  process.exit(failed === 0 ? 0 : 1);
}

runTests();
