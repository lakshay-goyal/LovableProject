#!/usr/bin/env node

/**
 * Test script for the LangChain TODO Application Generator API
 * Run with: node test-api.js
 */

const API_BASE_URL = 'http://localhost:3002';

async function testAPI() {
  console.log('🧪 Testing LangChain TODO Application Generator API\n');

  try {
    // Test GET endpoint
    console.log('1. Testing GET /api/prompt...');
    const getResponse = await fetch(`${API_BASE_URL}/api/prompt`);
    const getData = await getResponse.json();
    
    if (getResponse.ok) {
      console.log('✅ GET request successful');
      console.log(`   Status: ${getData.status}`);
      console.log(`   Available Tools: ${getData.availableTools.length}`);
      console.log(`   System Prompt: ${getData.systemPrompt.substring(0, 100)}...\n`);
    } else {
      console.log('❌ GET request failed:', getData.error);
    }

    // Test POST endpoint
    console.log('2. Testing POST /api/prompt...');
    const testMessage = "Create a beautiful TODO application with add, edit, delete functionality";
    
    const postResponse = await fetch(`${API_BASE_URL}/api/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: testMessage }),
    });
    
    const postData = await postResponse.json();
    
    if (postResponse.ok) {
      console.log('✅ POST request successful');
      console.log(`   Response: ${postData.response.substring(0, 200)}...\n`);
    } else {
      console.log('❌ POST request failed');
      console.log(`   Error: ${postData.error}`);
      console.log(`   Message: ${postData.message}`);
      
      if (postData.mockResponse) {
        console.log('\n📝 Mock Response (when OpenAI API key is not configured):');
        console.log(postData.mockResponse);
      }
    }

    // Test with different message
    console.log('\n3. Testing with different message...');
    const customMessage = "Build a modern task manager with dark mode and drag-and-drop";
    
    const customResponse = await fetch(`${API_BASE_URL}/api/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: customMessage }),
    });
    
    const customData = await customResponse.json();
    
    if (customResponse.ok) {
      console.log('✅ Custom message successful');
      console.log(`   Response: ${customData.response.substring(0, 200)}...`);
    } else {
      console.log('❌ Custom message failed');
      console.log(`   Error: ${customData.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the Next.js development server is running on port 3002');
    console.log('   Run: npm run dev');
  }
}

// Run the test
testAPI();
