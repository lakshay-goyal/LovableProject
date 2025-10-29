// Test script for structured response format
const fetch = require('node-fetch');

async function testStructuredResponse() {
  try {
    console.log('🧪 Testing Structured Response Format...\n');

    // Test with a specific prompt that should trigger structured response
    const testPrompts = [
      "Create a simple counter component with increment and decrement buttons",
      "Build a weather app with a search input and weather display card",
      "Make a todo list with add, edit, and delete functionality"
    ];

    for (let i = 0; i < testPrompts.length; i++) {
      const prompt = testPrompts[i];
      console.log(`\n${i + 1}. Testing prompt: "${prompt}"`);
      console.log('─'.repeat(60));

      const response = await fetch('http://localhost:3000/api/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Request successful');
        console.log('📦 Response structure:');
        console.log(`   - Success: ${data.success}`);
        console.log(`   - Has Response: ${!!data.response}`);
        console.log(`   - Has Sandbox URL: ${!!data.sandboxUrl}`);
        console.log(`   - Sandbox URL: ${data.sandboxUrl}`);
        
        if (data.response) {
          console.log('\n📝 Response Content Preview:');
          const preview = data.response.substring(0, 200) + '...';
          console.log(preview);
          
          // Check for structured format indicators
          const hasProjectAnalysis = data.response.includes('## 📋 PROJECT ANALYSIS');
          const hasImplementation = data.response.includes('## 🚀 IMPLEMENTATION');
          const hasCompletion = data.response.includes('## ✅ COMPLETION SUMMARY');
          
          console.log('\n🔍 Structured Format Check:');
          console.log(`   - Has Project Analysis: ${hasProjectAnalysis ? '✅' : '❌'}`);
          console.log(`   - Has Implementation: ${hasImplementation ? '✅' : '❌'}`);
          console.log(`   - Has Completion Summary: ${hasCompletion ? '✅' : '❌'}`);
        }
      } else {
        console.log('❌ Request failed:', response.status, await response.text());
      }

      // Add delay between requests
      if (i < testPrompts.length - 1) {
        console.log('\n⏳ Waiting 2 seconds before next test...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 Structured Response Format test completed!');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testStructuredResponse();
