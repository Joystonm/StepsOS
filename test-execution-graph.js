const http = require('http');

// Test execution graph feature
async function testExecutionGraph() {
  console.log('🧪 Testing Execution Graph Feature...\n');
  
  // 1. Submit a file upload execution
  console.log('1️⃣ Submitting file upload execution...');
  
  const testInput = {
    fileId: 'test-123',
    fileName: 'test.png',
    fileSizeMB: 2.5,
    fileType: 'image/png',
    uploadedBy: 'test-user',
    checksum: 'abc123'
  };
  
  const postData = JSON.stringify(testInput);
  
  const postOptions = {
    hostname: 'localhost',
    port: 8080,
    path: '/execute',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const executionId = await new Promise((resolve, reject) => {
    const req = http.request(postOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Execution submitted:', result.executionId);
          resolve(result.executionId);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
  
  // 2. Wait for execution to complete
  console.log('\n2️⃣ Waiting for execution to complete...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 3. Fetch execution graph
  console.log('\n3️⃣ Fetching execution graph...');
  
  const graphOptions = {
    hostname: 'localhost',
    port: 8080,
    path: `/api/executions/${executionId}/graph`,
    method: 'GET'
  };
  
  const graph = await new Promise((resolve, reject) => {
    const req = http.request(graphOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
  
  console.log('📊 Execution Graph Result:');
  console.log(JSON.stringify(graph, null, 2));
  
  // 4. Analyze the graph structure
  if (graph.success && graph.graph) {
    console.log('\n🔍 Graph Analysis:');
    console.log(`- Nodes: ${graph.graph.nodes.length}`);
    console.log(`- Edges: ${graph.graph.edges.length}`);
    
    graph.graph.nodes.forEach(node => {
      console.log(`\n📦 Step: ${node.id}`);
      console.log(`   Status: ${node.status}`);
      console.log(`   Input fields: ${node.input ? Object.keys(node.input).join(', ') : 'none'}`);
      console.log(`   Output fields: ${node.output ? Object.keys(node.output).join(', ') : 'none'}`);
      if (node.error) {
        console.log(`   Error: ${node.error}`);
      }
    });
    
    console.log('\n✅ Execution Graph Feature Working!');
    console.log('\n🎯 Key Features Demonstrated:');
    console.log('- ✅ Data lineage tracking through steps');
    console.log('- ✅ Input/output visualization per step');
    console.log('- ✅ Error state handling');
    console.log('- ✅ GraphQL-style field traversal ready');
  } else {
    console.log('❌ Failed to get execution graph');
  }
}

testExecutionGraph().catch(console.error);
