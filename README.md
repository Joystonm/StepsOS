# StepsOS

A visual workflow system that makes backend processes transparent through real-time execution visualization using Motia's step-based architecture.

## Features

- **Step-based workflow execution** with Motia's entry → validate → process pipeline
- **Real-time WebSocket streaming** for live execution updates
- **Interactive step graph** with real-time status updates
- **AI-powered analysis** with Groq integration for instant insights
- **Step inspection** showing input/output data and logs

## Usage

1. Enter JSON input in the dashboard
2. Click Execute to start workflow
3. Watch real-time updates in the step graph
4. Click AI Analysis for instant insights
5. Select steps to view detailed data

### Example Input

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
