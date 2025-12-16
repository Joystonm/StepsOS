# Motia

A step-based execution system with real-time visualization and AI-powered insights for workflow debugging and observability.

## 🚀 Features

### Core Execution Engine
- **Step-based workflow execution** with entry → validate → process pipeline
- **Real-time WebSocket streaming** for live execution updates
- **Robust error handling** with detailed validation and logging
- **Multi-format input support** (JSON workflow, API calls, replay)

### Visual Dashboard
- **Interactive step graph** with real-time status updates
- **Step details panel** showing input/output data and logs
- **Connection status monitoring** with automatic retry
- **Responsive design** for desktop and mobile

### AI-Powered Analysis
- **AI Analysis button** for instant execution insights
- **Groq integration** ready for production AI analysis
- **Smart error diagnosis** with actionable recommendations
- **Step-specific analysis** of inputs, outputs, and logs

### Developer Experience
- **Professional UI** with clean, dashboard-style interface
- **Comprehensive logging** with structured JSON format
- **Error boundaries** and graceful failure handling
- **Hot reload** development environment

## 🏗️ Project Structure

```
Motia/
├── backend/          # Motia execution engine
│   ├── src/
│   │   ├── execution/    # Workflow execution logic
│   │   ├── streaming/    # WebSocket event streaming
│   │   ├── steps/        # Step implementations
│   │   └── index.js      # Main server with AI endpoints
├── frontend/         # React dashboard
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── services/     # API and WebSocket clients
│   │   ├── hooks/        # React hooks
│   │   └── pages/        # Main dashboard
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Motia
```

2. **Install dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the application**
```bash
# Start backend (from root directory)
node start-backend.js

# Start frontend (in new terminal)
cd frontend && npm start
```

5. **Access the dashboard**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## 📊 Usage

### Basic Workflow Execution

1. **Enter JSON input** in the left panel:
```json
{
  "fileId": "file_001",
  "fileName": "document.pdf",
  "fileSizeMB": 2.5,
  "fileType": "application/pdf",
  "uploadedBy": "user_123",
  "checksum": "abc123xyz"
}
```

2. **Click Execute** to start workflow
3. **Watch real-time updates** in the step graph
4. **Click AI Analysis** for instant insights
5. **Select steps** to view detailed input/output data

### AI Analysis Features

- **Execution Summary**: Overall workflow status and performance
- **Error Diagnosis**: Specific failure points with recommendations
- **Data Insights**: Input/output field analysis and transformations
- **Performance Metrics**: Step execution times and bottlenecks

## 🔧 API Endpoints

### Execution
- `POST /execute` - Start workflow execution
- `GET /executions` - List all executions
- `GET /steps/:id` - Get step details

### AI Analysis
- `POST /ai/analyze` - Analyze complete execution
- `POST /ai/analyze-step` - Analyze specific step data

### WebSocket Events
- `execution:update` - Real-time execution status
- `step:complete` - Step completion events
- `graph:update` - Graph state changes

## 🎯 Key Capabilities

### Validation Engine
- **Strict input validation** with comprehensive error reporting
- **Field-level validation** for file uploads and API calls
- **Contract validation** ensuring execution integrity

### Observability
- **Real-time monitoring** of workflow execution
- **Detailed logging** with structured JSON format
- **Error tracking** with full stack traces
- **Performance metrics** and timing data

### Developer Tools
- **Interactive debugging** with step-by-step inspection
- **AI-powered insights** for rapid issue diagnosis
- **Visual data lineage** showing field transformations
- **Professional dashboard** for production monitoring

## 🤖 AI Integration

Motia includes built-in AI analysis powered by Groq:

### Setup Groq (Optional)
1. Get API key from [Groq Console](https://console.groq.com)
2. Add to `.env`: `GROQ_API_KEY=your_key_here`
3. Uncomment Groq API calls in `backend/src/index.js`

### AI Features
- **Smart error analysis** with root cause identification
- **Performance insights** and optimization suggestions
- **Data quality assessment** and validation recommendations
- **Execution pattern analysis** for workflow optimization

## 🛠️ Development

### Running Tests
```bash
# Test execution engine
node test-execution.js

# Test validation
node test-strict-validation.js

# Test AI analysis
node test-ai-analysis.js
```

### Architecture Notes
- **Motia execution engine** for robust workflow processing
- **React frontend** with TypeScript for type safety
- **WebSocket streaming** for real-time updates
- **Modular step system** for easy extension

## 📈 Production Deployment

### Environment Variables
```bash
NODE_ENV=production
PORT=8080
GROQ_API_KEY=your_groq_key
LOG_LEVEL=info
```

### Docker Support
```bash
# Build and run with Docker
docker build -t motia .
docker run -p 8080:8080 motia
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Roadmap

- [ ] Advanced AI analysis with custom models
- [ ] Workflow templates and presets
- [ ] Multi-tenant execution isolation
- [ ] Advanced monitoring and alerting
- [ ] Plugin system for custom steps
- [ ] Cloud deployment automation
