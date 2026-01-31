"use client"

import { useState } from 'react'

export default function DebugPage() {
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testEndpoints = async () => {
    setLoading(true)
    
    const endpoints = [
      '/api/test',
      '/api/auth/verify-email?token=test123',
      '/api/verify-email?token=test123',
      '/api/auth/[...nextauth]'
    ]
    
    const results = []
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint)
        const data = await response.json()
        results.push({
          endpoint,
          status: response.status,
          data
        })
      } catch (error: any) {
        results.push({
          endpoint,
          error: error.message,
          status: 'Error'
        })
      }
    }
    
    setResults(results)
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Verification Endpoints</h1>
      
      <button 
        onClick={testEndpoints}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test All Endpoints'}
      </button>
      
      {results && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="border p-4 rounded">
              <h3 className="font-bold">{result.endpoint}</h3>
              <p>Status: {result.status}</p>
              {result.data && (
                <pre className="bg-gray-100 p-2 mt-2 overflow-auto">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              )}
              {result.error && (
                <p className="text-red-500">Error: {result.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
