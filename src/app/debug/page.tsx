export default function DebugPage() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🔧 Debug Page</h1>
      <p>If you can see this, React is rendering correctly!</p>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>Environment Check:</h2>
        <ul>
          <li>Current time: {new Date().toISOString()}</li>
          <li>Environment: {process.env.NODE_ENV}</li>
          <li>Next.js version: 15.1.1</li>
          <li>React version: 19.0.0</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>Quick Actions:</h2>
        <ul>
          <li><a href="/api/health" style={{ color: '#0066cc' }}>Check API Health</a></li>
          <li><a href="/" style={{ color: '#0066cc' }}>Go to Home Page</a></li>
          <li><a href="/login" style={{ color: '#0066cc' }}>Go to Login</a></li>
        </ul>
      </div>
    </div>
  );
} 