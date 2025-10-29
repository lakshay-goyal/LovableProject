// Test script to verify project creation API and duplicate prevention
const testProjectCreation = async () => {
  try {
    console.log('Testing project creation API...');
    
    const testQuery = 'Create a simple React component with a button';
    const testTitle = 'React Button Component';
    
    // First request - should create a new project
    console.log('\n🔄 First request - should create new project...');
    const response1 = await fetch('http://localhost:3002/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery,
        title: testTitle,
        visibility: 'PUBLIC'
      }),
    });

    if (!response1.ok) {
      throw new Error(`HTTP error! status: ${response1.status}`);
    }

    const data1 = await response1.json();
    console.log('✅ First request result:');
    console.log(`   - Is New Project: ${data1.isNewProject}`);
    console.log(`   - Project ID: ${data1.project.id}`);
    console.log(`   - Project Title: ${data1.project.title}`);
    
    // Second request with same query - should return existing project
    console.log('\n🔄 Second request - should return existing project...');
    const response2 = await fetch('http://localhost:3002/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: testQuery,
        title: testTitle,
        visibility: 'PUBLIC'
      }),
    });

    if (!response2.ok) {
      throw new Error(`HTTP error! status: ${response2.status}`);
    }

    const data2 = await response2.json();
    console.log('✅ Second request result:');
    console.log(`   - Is New Project: ${data2.isNewProject}`);
    console.log(`   - Project ID: ${data2.project.id}`);
    console.log(`   - Project Title: ${data2.project.title}`);
    
    // Verify both requests returned the same project ID
    if (data1.project.id === data2.project.id) {
      console.log('✅ SUCCESS: Duplicate prevention working correctly!');
      console.log('   Both requests returned the same project ID, no duplicate was created.');
    } else {
      console.log('❌ FAILURE: Duplicate prevention not working!');
      console.log('   Different project IDs returned, duplicate was created.');
    }
    
  } catch (error) {
    console.error('❌ Error testing project creation:', error.message);
  }
};

// Run the test
testProjectCreation();
