// Test script for E2B integration
const fetch = require('node-fetch');

async function testE2BIntegration() {
  try {
    console.log('🧪 Testing E2B Integration...\n');

    // Test GET endpoint (with hardcoded TODO app message)
    console.log('1. Testing GET endpoint...');
    const getResponse = await fetch('http://localhost:3000/api/prompt', {
      method: 'GET',
    });
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET request successful');
      console.log('📦 Response:', {
        success: getData.success,
        hasResponse: !!getData.response,
        hasSandboxUrl: !!getData.sandboxUrl,
        sandboxUrl: getData.sandboxUrl
      });
    } else {
      console.log('❌ GET request failed:', getResponse.status, await getResponse.text());
    }

    console.log('\n2. Testing POST endpoint...');
    // Test POST endpoint with custom message
    const postResponse = await fetch('http://localhost:3000/api/prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Create a simple counter component with increment and decrement buttons'
      }),
    });
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ POST request successful');
      console.log('📦 Response:', {
        success: postData.success,
        hasResponse: !!postData.response,
        hasSandboxUrl: !!postData.sandboxUrl,
        sandboxUrl: postData.sandboxUrl
      });
    } else {
      console.log('❌ POST request failed:', postResponse.status, await postResponse.text());
    }

    console.log('\n3. Testing DELETE endpoint (cleanup)...');
    // Test DELETE endpoint for cleanup
    const deleteResponse = await fetch('http://localhost:3000/api/prompt', {
      method: 'DELETE',
    });
    
    if (deleteResponse.ok) {
      const deleteData = await deleteResponse.json();
      console.log('✅ DELETE request successful');
      console.log('📦 Response:', deleteData);
    } else {
      console.log('❌ DELETE request failed:', deleteResponse.status, await deleteResponse.text());
    }

    console.log('\n🎉 E2B Integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testE2BIntegration();
