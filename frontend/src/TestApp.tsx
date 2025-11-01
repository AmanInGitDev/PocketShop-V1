import React from 'react';

function TestApp() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🛍️ PocketShop Test
      </h1>
      <p style={{ color: '#666', fontSize: '18px' }}>
        If you can see this, React is working!
      </p>
      <div style={{ 
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#3b82f6',
        color: 'white',
        borderRadius: '8px'
      }}>
        ✅ React App is Running
      </div>
    </div>
  );
}

export default TestApp;
