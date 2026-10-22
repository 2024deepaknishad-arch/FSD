const http = require('http');

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
  console.log('    CYBERAUDIT 360 - EXPERIMENT 7: DOCKER CONTAINER VERIFICATION SUITE');
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
    // 1. Backend /api health endpoint
    console.log('--- 1. BACKEND DOCKER HEALTH ENDPOINT (PORT 5000) ---');
    const apiRes = await request('http://127.0.0.1:5000/api');
    assert(
      apiRes.status === 200 && apiRes.data.message === 'Backend is running inside Docker!',
      'GET /api returns "Backend is running inside Docker!"',
      `status: ${apiRes.status}, message: "${apiRes.data?.message}"`
    );

    // 2. Backend root endpoint
    console.log('\n--- 2. BACKEND ROOT ENDPOINT ---');
    const rootRes = await request('http://127.0.0.1:5000/');
    assert(
      rootRes.status === 200 && rootRes.data.message?.includes('CyberAudit 360'),
      'GET / returns CyberAudit 360 API running message',
      `status: ${rootRes.status}`
    );

    // 3. Security Headers (Helmet)
    console.log('\n--- 3. SECURITY HEADERS & CORS (EXPERIMENT 5 PRESERVED) ---');
    const hasHelmet = !!(
      apiRes.headers['x-content-type-options'] ||
      apiRes.headers['x-frame-options'] ||
      apiRes.headers['x-dns-prefetch-control']
    );
    assert(hasHelmet, 'Helmet security headers are active on responses');

    // 4. Admin Login & JWT Authentication (Experiment 6 Preserved)
    console.log('\n--- 4. JWT AUTHENTICATION & ATLAS PERSISTENCE (EXPERIMENT 6 PRESERVED) ---');
    const loginRes = await request('http://127.0.0.1:5000/api/users/login', { method: 'POST' }, {
      email: 'admin@cyberaudit.com',
      password: 'Admin@12345',
    });
    assert(
      loginRes.status === 200 && !!loginRes.data.token,
      'POST /api/users/login authenticates default admin in MongoDB Atlas',
      `status: ${loginRes.status}, role: ${loginRes.data?.role}`
    );
    const token = loginRes.data?.token;

    // 5. Protected Profile Access
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

    // 6. AuditLog CRUD APIs (Experiment 4 Preserved)
    console.log('\n--- 5. AUDITLOG CRUD OPERATIONS (EXPERIMENT 4 PRESERVED) ---');
    const uniqueAction = `Docker Container Verification Test - ${Date.now()}`;
    const createLogRes = await request('http://127.0.0.1:5000/api/auditlogs', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }, {
      action: uniqueAction,
      user: 'admin@cyberaudit.com',
      resource: 'DockerVerificationSuite',
      details: 'Automated test of containerized Express + MongoDB Atlas persistence',
      status: 'Success',
    });
    assert(
      createLogRes.status === 201 && !!createLogRes.data._id,
      'POST /api/auditlogs successfully inserts audit log into MongoDB Atlas',
      `status: ${createLogRes.status}, id: ${createLogRes.data?._id}`
    );
    const createdId = createLogRes.data?._id;

    // Read logs
    const getLogsRes = await request('http://127.0.0.1:5000/api/auditlogs');
    assert(
      getLogsRes.status === 200 && Array.isArray(getLogsRes.data) && getLogsRes.data.length > 0,
      'GET /api/auditlogs retrieves audit logs array from MongoDB Atlas',
      `status: ${getLogsRes.status}, count: ${getLogsRes.data?.length}`
    );

    // Update log
    if (createdId) {
      const updateRes = await request(`http://127.0.0.1:5000/api/auditlogs/${createdId}`, {
        method: 'PUT',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }, {
        status: 'Failed',
        details: 'Audit log updated successfully in Docker container test',
      });
      assert(
        updateRes.status === 200,
        `PUT /api/auditlogs/${createdId} updates record in Atlas`,
        `status: ${updateRes.status}`
      );

      // Delete log
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

    // 7. Frontend Nginx Server (PORT 3000)
    console.log('\n--- 6. FRONTEND NGINX CONTAINER (PORT 3000) ---');
    const feRes = await request('http://127.0.0.1:3000/');
    assert(
      feRes.status === 200 && typeof feRes.data === 'string' && feRes.data.includes('<div id="root"></div>'),
      'GET http://localhost:3000/ serves React production build with root container',
      `status: ${feRes.status}, server: ${feRes.headers['server'] || 'nginx'}`
    );

    // 8. Direct SPA Client Routing (try_files /index.html)
    const spaRes = await request('http://127.0.0.1:3000/docker');
    assert(
      spaRes.status === 200 && typeof spaRes.data === 'string' && spaRes.data.includes('<div id="root"></div>'),
      'GET http://localhost:3000/docker correctly returns index.html for React Router SPA',
      `status: ${spaRes.status}`
    );

    // 9. Nginx Reverse Proxy to Container Backend
    console.log('\n--- 7. NGINX REVERSE PROXY TO BACKEND CONTAINER ---');
    const proxyApiRes = await request('http://127.0.0.1:3000/api');
    assert(
      proxyApiRes.status === 200 && proxyApiRes.data.message === 'Backend is running inside Docker!',
      'GET http://localhost:3000/api proxies cleanly through Nginx to backend container',
      `status: ${proxyApiRes.status}, message: "${proxyApiRes.data?.message}"`
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
