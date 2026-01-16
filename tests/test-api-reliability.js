// API Reliability Testing Script
// Tests the API endpoints and measures success rate
// Run: node tests/test-api-reliability.js

const fetch = require('node-fetch');

const API_BASE = 'http://127.0.0.1:5001/finance-tracker-526d4/us-central1/api';
// Note: You'll need a valid Firebase auth token to run this test
// Get one from your browser's localStorage or use Firebase SDK

async function testAPIEndpoints() {
  console.log('\nAPI Reliability Test\n');
  
  const tests = [
    { name: 'Health Check', method: 'GET', url: `${API_BASE}/health`, needsAuth: false },
    { name: 'Transactions GET', method: 'GET', url: `${API_BASE}/api/transactions`, needsAuth: true },
    { name: 'Budget Insights POST', method: 'POST', url: `${API_BASE}/api/budget-insights`, needsAuth: true }
  ];
  
  let passed = 0;
  let failed = 0;
  const errors = [];
  
  for (const test of tests) {
    try {
      const options = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      };
      
      if (test.needsAuth) {
        // This test requires authentication
        // In real scenario, you'd include a valid token
        console.log(`Skipping ${test.name} (requires authentication token)`);
        continue;
      }
      
      const response = await fetch(test.url, options);
      const status = response.status;
      
      if (status === 200 || status === 401) { // 401 is expected for protected routes
        console.log(`${test.name}: ${status} OK`);
        passed++;
      } else {
        console.log(`${test.name}: ${status} ERROR`);
        failed++;
        errors.push({ test: test.name, status, url: test.url });
      }
    } catch (error) {
      console.log(`${test.name}: ${error.message}`);
      failed++;
      errors.push({ test: test.name, error: error.message, url: test.url });
    }
  }
  
  console.log('\nTest Results:');
  console.log('   Passed:', passed);
  console.log('   Failed:', failed);
  console.log('   Success Rate:', Math.round((passed / (passed + failed)) * 100) + '%');
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`   - ${e.test}: ${e.error || e.status}`));
  }
  
  console.log('\nNote: To test authenticated endpoints, you need a valid Firebase ID token.');
  console.log('   Get one from browser console: firebase.auth().currentUser.getIdToken()\n');
}

testAPIEndpoints();

