import React, { useState } from 'react';

interface ExecutionNode {
  id: string;
  type: string;
  status: string;
  input?: any;
  output?: any;
  error?: string;
  logs?: string[];
}

interface ExecutionGraphProps {
  executionId: string;
  onClose: () => void;
}

export default function ExecutionGraph({ executionId, onClose }: ExecutionGraphProps) {
  const [graph, setGraph] = useState<{ nodes: ExecutionNode[]; edges: any[] } | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadExecutionGraph = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/executions/${executionId}/graph`);
      const data = await response.json();
      if (data.success) setGraph(data.graph);
    } catch (error) {
      console.error('Failed to load execution graph:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (executionId) loadExecutionGraph();
  }, [executionId]);

  const getInputFields = () => {
    if (!graph?.nodes?.length) return [];
    const entryNode = graph.nodes.find(n => n.id === 'entry');
    if (entryNode?.output && typeof entryNode.output === 'object') {
      return Object.entries(entryNode.output);
    }
    return [];
  };

  const getFieldStatus = (fieldKey: string) => {
    if (!graph?.nodes) return 'success';
    const validateNode = graph.nodes.find(n => n.id === 'validate');
    if (validateNode?.status === 'failed' && validateNode.error?.includes(fieldKey)) {
      return 'error';
    }
    return 'success';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-sm text-gray-600">Loading visualization...</span>
          </div>
        </div>
      </div>
    );
  }

  const inputFields = getInputFields();
  
  if (!inputFields.length) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm text-center">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-medium text-gray-900 mb-1">No Data Available</h3>
          <p className="text-sm text-gray-500 mb-4">Unable to load input visualization.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl h-96 flex flex-col shadow-xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
          <h2 className="text-sm font-medium text-gray-900">Input Validation Analysis</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">×</button>
        </div>

        {/* Main Content - Fixed Horizontal Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT - Fixed Graph Container */}
          <div className="w-96 h-80 flex-shrink-0 p-3 bg-gray-50 border-r border-gray-200">
            <div className="w-full h-full bg-white rounded border p-2">
              <svg className="w-full h-full" viewBox="0 0 60 30">
                <defs>
                  <marker id="arrowhead" markerWidth="2" markerHeight="1.5" refX="2" refY="0.75" orient="auto">
                    <polygon points="0 0, 2 0.75, 0 1.5" fill="#9ca3af" />
                  </marker>
                </defs>
                
                {/* Input Source Node */}
                <g>
                  <rect x="2" y="12" width="8" height="4" rx="0.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.2"/>
                  <text x="6" y="13.5" textAnchor="middle" fontSize="1" fill="#475569" className="font-medium">Input</text>
                  <text x="6" y="15" textAnchor="middle" fontSize="0.7" fill="#64748b">{inputFields.length}</text>
                </g>
                
                {/* Field Nodes */}
                {inputFields.map(([key, value], index) => {
                  const status = getFieldStatus(key);
                  const isSelected = selectedField === key;
                  const y = 2 + (index * 3.5);
                  
                  return (
                    <g key={key}>
                      {/* Connection from Input */}
                      <line 
                        x1="10" 
                        y1="14" 
                        x2="18" 
                        y2={y + 2} 
                        stroke="#cbd5e1" 
                        strokeWidth="0.15" 
                        markerEnd="url(#arrowhead)"
                      />
                      
                      {/* Field Node */}
                      <rect 
                        x="18" 
                        y={y} 
                        width="12" 
                        height="3.5" 
                        rx="0.3" 
                        fill={isSelected ? "#dbeafe" : "white"}
                        stroke={status === 'error' ? "#f87171" : "#86efac"}
                        strokeWidth="0.2"
                        className="cursor-pointer"
                        onClick={() => setSelectedField(selectedField === key ? null : key)}
                      />
                      
                      {/* Field Content */}
                      <text x="24" y={y + 1.8} textAnchor="middle" fontSize="0.8" fill="#374151" className="font-medium pointer-events-none">
                        {key.length > 3 ? key.substring(0, 3) + '..' : key}
                      </text>
                      <text x="24" y={y + 2.8} textAnchor="middle" fontSize="0.6" fill="#6b7280" className="pointer-events-none">
                        {String(value).length > 3 ? String(value).substring(0, 3) + '..' : String(value)}
                      </text>
                      
                      {/* Status Circle */}
                      <circle 
                        cx="28.5" 
                        cy={y + 1} 
                        r="0.3" 
                        fill={status === 'error' ? "#ef4444" : "#22c55e"}
                      />
                      
                      {/* Connection to Validation */}
                      <line 
                        x1="30" 
                        y1={y + 1.75} 
                        x2="36" 
                        y2="14" 
                        stroke="#cbd5e1" 
                        strokeWidth="0.15" 
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
                
                {/* Validation Node */}
                <g>
                  <rect x="36" y="12" width="8" height="4" rx="0.5" fill="#fef3c7" stroke="#f59e0b" strokeWidth="0.2"/>
                  <text x="40" y="13.5" textAnchor="middle" fontSize="1" fill="#92400e" className="font-medium">Valid</text>
                  <text x="40" y="15" textAnchor="middle" fontSize="0.7" fill="#b45309">
                    {inputFields.filter(([key]) => getFieldStatus(key) === 'error').length > 0 ? 'Fail' : 'Pass'}
                  </text>
                </g>
                
                {/* Processing Node */}
                <g>
                  <line x1="44" y1="14" x2="48" y2="14" stroke="#cbd5e1" strokeWidth="0.15" markerEnd="url(#arrowhead)" />
                  <rect x="48" y="12" width="8" height="4" rx="0.5" fill="#dcfce7" stroke="#22c55e" strokeWidth="0.2"/>
                  <text x="52" y="13.5" textAnchor="middle" fontSize="1" fill="#166534" className="font-medium">Proc</text>
                  <text x="52" y="15" textAnchor="middle" fontSize="0.7" fill="#15803d">Done</text>
                </g>
              </svg>
            </div>
          </div>
          
          {/* RIGHT - Status Panel (Top Aligned) */}
          <div className="flex-1 p-4">
            {selectedField ? (
              <div className="space-y-3">
                {/* Title */}
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">{selectedField}</h3>
                  <button onClick={() => setSelectedField(null)} className="text-gray-400 hover:text-gray-600 text-sm">×</button>
                </div>

                {/* Status List */}
                <div className="space-y-2">
                  <div className="text-sm text-green-700">Input Received</div>
                  <div className={`text-sm ${getFieldStatus(selectedField) === 'error' ? 'text-red-700 font-medium' : 'text-green-700'}`}>
                    {getFieldStatus(selectedField) === 'error' ? 'Validation Failed' : 'Validation Passed'}
                  </div>
                  <div className={`text-sm ${getFieldStatus(selectedField) === 'error' ? 'text-gray-600' : 'text-green-700'}`}>
                    {getFieldStatus(selectedField) === 'error' ? 'Processing Skipped' : 'Processing Complete'}
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-gray-200" />

                {/* Error Details */}
                {getFieldStatus(selectedField) === 'error' && graph?.nodes && (
                  <div>
                    <div className="text-sm font-medium text-gray-900 mb-2">Error Details</div>
                    <div className="bg-red-50 border border-red-200 rounded p-2">
                      <div className="text-sm text-red-800 font-medium">
                        {graph.nodes.find(n => n.id === 'validate')?.error || 'Unsupported fileType'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Select a Field</h3>
                <p className="text-sm text-gray-600">Click on any field node in the graph to view validation details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
