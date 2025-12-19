import React, { useState } from 'react';

const Docs: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    padding: '0'
  };

  const headerStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '60px 0',
    textAlign: 'center' as const,
    marginBottom: '0'
  };

  const contentStyle = {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    background: 'white',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    marginTop: '-30px',
    position: 'relative' as const,
    zIndex: 1
  };

  const headingStyle = {
    color: '#2d3748',
    marginTop: '3rem',
    marginBottom: '1rem',
    fontWeight: '600',
    borderBottom: '2px solid #667eea',
    paddingBottom: '0.5rem'
  };

  const subHeadingStyle = {
    color: '#4a5568',
    marginTop: '2rem',
    marginBottom: '1rem',
    fontWeight: '600'
  };

  const textStyle = {
    color: '#2d3748',
    lineHeight: '1.7',
    marginBottom: '1rem',
    fontSize: '1rem'
  };

  const codeBlockStyle = {
    background: '#1a202c',
    color: '#e2e8f0',
    border: '1px solid #2d3748',
    borderRadius: '8px',
    padding: '1.5rem',
    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
    fontSize: '0.9rem',
    overflow: 'auto',
    margin: '1.5rem 0',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const sectionStyle = {
    marginBottom: '3rem',
    padding: '2rem',
    background: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  };

  const listStyle = {
    color: '#2d3748',
    paddingLeft: '1.5rem',
    lineHeight: '1.7'
  };

  const strongStyle = {
    color: '#667eea',
    fontWeight: '600'
  };

  const badgeStyle = {
    background: '#667eea',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500',
    display: 'inline-block',
    margin: '0 8px 8px 0'
  };

  const copyButtonStyle = {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    background: '#4a5568',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const copyButtonHoverStyle = {
    ...copyButtonStyle,
    background: '#667eea'
  };

  const CodeBlock: React.FC<{ code: string; index: number }> = ({ code, index }) => (
    <div style={{ position: 'relative' }}>
      <pre style={codeBlockStyle}>
        {code}
      </pre>
      <button
        style={copiedIndex === index ? { ...copyButtonStyle, background: '#48bb78' } : copyButtonStyle}
        onClick={() => copyToClipboard(code.trim(), index)}
        onMouseEnter={(e) => {
          if (copiedIndex !== index) {
            (e.target as HTMLButtonElement).style.background = '#667eea';
          }
        }}
        onMouseLeave={(e) => {
          if (copiedIndex !== index) {
            (e.target as HTMLButtonElement).style.background = '#4a5568';
          }
        }}
      >
        {copiedIndex === index ? '✓ Copied!' : '📋 Copy'}
      </button>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={{ fontSize: '3rem', fontWeight: '700', margin: '0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
          StepsOS Documentation
        </h1>
        <p style={{ fontSize: '1.2rem', margin: '1rem 0 0 0', opacity: 0.9 }}>
          Complete guide to step-based execution with real-time visualization
        </p>
      </div>
      
      <div style={contentStyle}>
        <section style={sectionStyle}>
          <h2 style={headingStyle}>🚀 Introduction</h2>
          <p style={textStyle}>
            StepsOS is a step-based execution system with real-time visualization and AI-powered insights 
            for workflow debugging and observability. It transforms complex workflow execution into an 
            intuitive visual experience where every step is transparent, traceable, and analyzable.
          </p>
          <p style={textStyle}>
            <span style={strongStyle}>Problem it solves:</span> Traditional workflow systems are black boxes. When something 
            fails, you're left digging through logs. StepsOS makes every step visible in real-time, 
            showing exactly what data flows through each stage and where issues occur.
          </p>
          <p style={textStyle}>
            <span style={strongStyle}>Core philosophy:</span> Step-based execution with complete observability. Every workflow 
            becomes a visual graph where you can inspect inputs, outputs, and transformations at each step.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>🔧 Core Concepts</h2>
          
          <h3 style={subHeadingStyle}>Workflow</h3>
          <p style={textStyle}>A complete execution flow that processes input data through multiple sequential steps.</p>
          
          <h3 style={subHeadingStyle}>Step</h3>
          <p style={textStyle}>An individual processing unit with three phases: Entry → Validate → Process. Each step transforms data and can succeed or fail independently.</p>
          
          <h3 style={subHeadingStyle}>Execution</h3>
          <p style={textStyle}>A single run of a workflow with specific input data. Each execution gets a unique ID and real-time tracking.</p>
          
          <h3 style={subHeadingStyle}>Input Payload</h3>
          <p style={textStyle}>The JSON data that initiates workflow execution. Contains all necessary information for processing.</p>
          
          <h3 style={subHeadingStyle}>Validation</h3>
          <p style={textStyle}>Strict input checking that ensures data integrity before processing. Validation failures stop execution immediately.</p>
          
          <h3 style={subHeadingStyle}>Processing</h3>
          <p style={textStyle}>The core business logic that transforms validated input into meaningful output.</p>
          
          <h3 style={subHeadingStyle}>Visualization Graph</h3>
          <p style={textStyle}>Real-time visual representation showing step status, data flow, and execution progress.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>🏗️ Architecture Overview</h2>
          <p style={textStyle}>
            StepsOS follows a simple but powerful execution model:
          </p>
          <ol style={listStyle}>
            <li><span style={strongStyle}>Entry:</span> Input data enters the system and gets normalized</li>
            <li><span style={strongStyle}>Validate:</span> Strict validation ensures data meets requirements</li>
            <li><span style={strongStyle}>Process:</span> Business logic transforms the validated data</li>
          </ol>
          <p style={textStyle}>
            Steps execute sequentially, with each step's output becoming available to subsequent steps. 
            The visualization graph updates in real-time via WebSocket connections, showing live status 
            changes as execution progresses.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>📝 Basic Workflow Example</h2>
          <p style={textStyle}>Here's a simple file upload workflow input:</p>
          <CodeBlock 
            index={0}
            code={`{
  "executionId": "exec_001",
  "workflowId": "file_upload_flow",
  "input": {
    "fileId": "file_001",
    "fileName": "diagram.png",
    "fileSizeMB": 5.2,
    "fileType": "image/png",
    "uploadedBy": "user_42",
    "checksum": "abc123xyz"
  }
}`}
          />
          
          <h3 style={subHeadingStyle}>Field Explanations</h3>
          <ul style={listStyle}>
            <li><span style={strongStyle}>executionId:</span> Unique identifier for this execution run</li>
            <li><span style={strongStyle}>workflowId:</span> Identifies which workflow template to use</li>
            <li><span style={strongStyle}>fileId:</span> Unique file identifier in the system</li>
            <li><span style={strongStyle}>fileName:</span> Original filename for display and processing</li>
            <li><span style={strongStyle}>fileSizeMB:</span> File size used for validation and resource planning</li>
            <li><span style={strongStyle}>fileType:</span> MIME type for format validation</li>
            <li><span style={strongStyle}>uploadedBy:</span> User identifier for audit trails</li>
            <li><span style={strongStyle}>checksum:</span> File integrity verification hash</li>
          </ul>
          
          <p style={textStyle}>
            Each field becomes a node in the visualization graph, showing how data flows through 
            validation and processing steps.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>✅ Validation Example</h2>
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <span style={{ ...badgeStyle, background: '#48bb78' }}>✅ Valid Input</span>
          </div>
          <CodeBlock 
            index={1}
            code={`{
  "executionId": "exec_002",
  "workflowId": "file_upload_flow",
  "input": {
    "fileId": "file_002",
    "fileName": "report.pdf",
    "fileSizeMB": 2.1,
    "fileType": "application/pdf",
    "uploadedBy": "user_123",
    "checksum": "def456uvw"
  }
}`}
          />
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <span style={{ ...badgeStyle, background: '#f56565' }}>❌ Invalid Input</span>
          </div>
          <CodeBlock 
            index={2}
            code={`{
  "executionId": "exec_003",
  "workflowId": "file_upload_flow",
  "input": {
    "fileId": "file_003",
    "fileName": "huge_video.mp4",
    "fileSizeMB": 150.5,
    "fileType": "video/mp4",
    "uploadedBy": "user_456",
    "checksum": "ghi789rst"
  }
}`}
          />
          
          <p style={textStyle}>
            <span style={strongStyle}>Validation behavior:</span> The invalid input above would fail validation due to 
            oversized file (&gt;100MB limit) and unsupported file type. The graph would show:
          </p>
          <ul style={listStyle}>
            <li>Entry step: <span style={{ color: '#48bb78', fontWeight: '600' }}>✅ Success</span> (data received)</li>
            <li>Validate step: <span style={{ color: '#f56565', fontWeight: '600' }}>❌ Failed</span> (size and type violations)</li>
            <li>Process step: <span style={{ color: '#ed8936', fontWeight: '600' }}>⏸️ Skipped</span> (validation failure stops execution)</li>
          </ul>
          <p style={textStyle}>
            Error details appear in the step details panel, showing exactly which validation rules failed.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>🚀 Large Input / Stress Test Example</h2>
          <p style={textStyle}>StepsOS handles complex inputs with extensive metadata:</p>
          <CodeBlock 
            index={3}
            code={`{
  "executionId": "exec_stress_001",
  "workflowId": "enterprise_document_flow",
  "input": {
    "fileId": "enterprise_doc_001",
    "fileName": "quarterly_report_q4_2024.pdf",
    "fileSizeMB": 45.7,
    "fileType": "application/pdf",
    "uploadedBy": "finance_team_lead",
    "checksum": "sha256_abc123def456ghi789",
    "metadata": {
      "department": "Finance",
      "classification": "Confidential",
      "retentionYears": 7,
      "approvalRequired": true,
      "tags": ["quarterly", "financial", "board-review"],
      "customFields": {
        "fiscalYear": 2024,
        "quarter": "Q4",
        "region": "North America"
      }
    },
    "priority": "high",
    "environment": "production",
    "processingOptions": {
      "enableOCR": true,
      "extractTables": true,
      "generateThumbnails": true,
      "notifyOnCompletion": true
    }
  }
}`}
          />
          
          <p style={textStyle}>
            <span style={strongStyle}>Visual scaling:</span> Even with complex nested data, StepsOS maintains a clean 
            graph layout. The visualization automatically organizes nodes and shows data relationships 
            without overwhelming the interface.
          </p>
          <p style={textStyle}>
            <span style={strongStyle}>Graph stability:</span> The layout algorithm ensures consistent positioning, 
            making it easy to track execution progress even with large datasets.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>🧪 How to Test StepsOS</h2>
          <ol style={listStyle}>
            <li><span style={strongStyle}>Open the app:</span> Navigate to the Dashboard page</li>
            <li><span style={strongStyle}>Paste input JSON:</span> Copy any example above into the input panel</li>
            <li><span style={strongStyle}>Run execution:</span> Click the "Execute" button to start processing</li>
            <li><span style={strongStyle}>Observe graph updates:</span> Watch real-time status changes in the visualization</li>
            <li><span style={strongStyle}>Inspect steps:</span> Click on any step node to view detailed input/output data</li>
            <li><span style={strongStyle}>Check validation:</span> Try invalid inputs to see validation failures</li>
            <li><span style={strongStyle}>Monitor logs:</span> View structured execution logs in the details panel</li>
          </ol>
        </section>

        <section style={sectionStyle}>
          <h2 style={headingStyle}>🎯 Design Decisions</h2>
          
          <h3 style={subHeadingStyle}>Why Step-Based Execution?</h3>
          <p style={textStyle}>
            Breaking workflows into discrete steps provides clear failure isolation, easier debugging, 
            and better observability. Each step has a single responsibility and clear input/output contracts.
          </p>
          
          <h3 style={subHeadingStyle}>Why Visual Graphs Instead of Logs?</h3>
          <p style={textStyle}>
            Logs are linear and hard to parse during active debugging. Visual graphs show the complete 
            execution state at a glance, making it immediately clear where issues occur and how data flows.
          </p>
          
          <h3 style={subHeadingStyle}>Why Real-Time Observability?</h3>
          <p style={textStyle}>
            Waiting for batch processing to complete before seeing results slows development and debugging. 
            Real-time updates let you catch issues immediately and understand execution patterns as they happen.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Docs;
