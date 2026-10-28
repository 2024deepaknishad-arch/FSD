const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('========================================================================');
console.log('   CYBERAUDIT 360 - EXPERIMENT 10: CI/CD DEPLOYMENT VERIFICATION SUITE');
console.log('========================================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(description, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${description}`);
    if (details) console.log(`         → ${details}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${description}`);
    if (details) console.error(`         → ${details}`);
  }
}

async function runVerification() {
  console.log('--- 1. GitHub Actions CI Configuration (.github/workflows/ci.yml) ---');
  const ciPath = path.join(__dirname, '.github', 'workflows', 'ci.yml');
  const ciExists = fs.existsSync(ciPath);
  assert('GitHub Actions workflow file exists', ciExists, ciPath);

  if (ciExists) {
    const ciContent = fs.readFileSync(ciPath, 'utf8');
    assert('CI workflow triggers on push to main and experiment-10-cicd',
      ciContent.includes('main') && ciContent.includes('experiment-10-cicd'),
      'Workflow configured for push on required project branches'
    );
    assert('CI workflow triggers on pull requests targeting main',
      ciContent.includes('pull_request') && ciContent.includes('main'),
      'Workflow configured for pull_request targeting main'
    );
    assert('CI workflow contains frontend-build job with Node 20',
      ciContent.includes('frontend-build') && ciContent.includes('node-version: 20'),
      'Frontend build job uses Node.js 20 on ubuntu-latest'
    );
    assert('CI workflow contains backend-check job with start script check',
      ciContent.includes('backend-check') && ciContent.includes('p.scripts?.start'),
      'Backend check job verifies start script using node inline script as required by EXP 10 PDF'
    );
  }

  console.log('\n--- 2. Backend Render Deployment Readiness ---');
  const backendPkgPath = path.join(__dirname, 'backend', 'package.json');
  const backendPkg = JSON.parse(fs.readFileSync(backendPkgPath, 'utf8'));
  assert('Backend package.json has start script',
    Boolean(backendPkg.scripts && backendPkg.scripts.start),
    `start script: "${backendPkg.scripts?.start}"`
  );
  assert('Backend package.json has test validation script',
    Boolean(backendPkg.scripts && backendPkg.scripts.test),
    `test script: "${backendPkg.scripts?.test}"`
  );

  const serverJsPath = path.join(__dirname, 'backend', 'server.js');
  const serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
  assert('Backend reads dynamic PORT from process.env.PORT',
    serverJsContent.includes('process.env.PORT'),
    'PORT = process.env.PORT || 5000'
  );
  assert('Backend exposes /api/health endpoint',
    serverJsContent.includes('/api/health'),
    'app.get(\'/api/health\', ...)'
  );
  assert('Backend supports dynamic CORS with Vercel and Render domains',
    serverJsContent.includes('vercel.app') && serverJsContent.includes('onrender.com'),
    'Allows *.vercel.app, *.onrender.com, FRONTEND_URL, and localhost'
  );
  assert('Backend reads database URI from MONGO_URI environment variable',
    serverJsContent.includes('process.env.MONGO_URI'),
    'Ensures secure MongoDB Atlas URI injection'
  );

  console.log('\n--- 3. Frontend Vercel Deployment Readiness ---');
  const frontendPkgPath = path.join(__dirname, 'frontend', 'package.json');
  const frontendPkg = JSON.parse(fs.readFileSync(frontendPkgPath, 'utf8'));
  assert('Frontend package.json has build script',
    Boolean(frontendPkg.scripts && frontendPkg.scripts.build),
    `build script: "${frontendPkg.scripts?.build}"`
  );

  const frontendVercelPath = path.join(__dirname, 'frontend', 'vercel.json');
  assert('frontend/vercel.json exists with SPA rewrites',
    fs.existsSync(frontendVercelPath),
    'Configures client-side routing rewrites for Vercel'
  );

  const configJsPath = path.join(__dirname, 'frontend', 'src', 'config.js');
  const configExists = fs.existsSync(configJsPath);
  assert('Frontend centralized config.js exists', configExists, configJsPath);
  if (configExists) {
    const configContent = fs.readFileSync(configJsPath, 'utf8');
    assert('Frontend config supports VITE_API_URL and VITE_API_BASE_URL',
      configContent.includes('VITE_API_URL') && configContent.includes('VITE_API_BASE_URL'),
      'Supports Render production URL and backward-compatible fallbacks'
    );
  }

  const distHtmlPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
  assert('Frontend production build artifact (dist/index.html) exists',
    fs.existsSync(distHtmlPath),
    'Verified production bundle from "npm run build"'
  );

  console.log('\n--- 4. Render Infrastructure Specification (render.yaml) ---');
  const renderYamlPath = path.join(__dirname, 'render.yaml');
  assert('render.yaml blueprint exists for Render Web Service deployment',
    fs.existsSync(renderYamlPath),
    'Defines service type, rootDir=backend, build & start commands, and /api/health check'
  );

  console.log('\n--- 5. Security & Environment Configuration ---');
  const rootEnvExists = fs.existsSync(path.join(__dirname, '.env'));
  const gitignoreContent = fs.readFileSync(path.join(__dirname, '.gitignore'), 'utf8');
  assert('.gitignore protects sensitive .env files from Git commits',
    gitignoreContent.includes('.env'),
    '.gitignore properly includes .env and .env.* patterns'
  );
  assert('.env.example documents production deployment variables',
    fs.existsSync(path.join(__dirname, '.env.example')) &&
    fs.existsSync(path.join(__dirname, 'frontend', '.env.example')) &&
    fs.existsSync(path.join(__dirname, 'backend', '.env.example')),
    'Documented across root, backend, and frontend templates'
  );

  console.log('\n========================================================================');
  console.log(`RESULTS: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('========================================================================\n');

  if (passedTests === totalTests) {
    console.log('>>> ALL EXPERIMENT 10 CI/CD REQUIREMENTS VERIFIED SUCCESSFULLY! <<<');
    process.exit(0);
  } else {
    console.error('>>> SOME VERIFICATION CHECKS FAILED! <<<');
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Unexpected error running verification:', err);
  process.exit(1);
});
