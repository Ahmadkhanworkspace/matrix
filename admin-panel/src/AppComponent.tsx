import React from 'react';

const AppComponent: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Matrix MLM Admin Panel</h1>
      <p>React app is running successfully!</p>
      <p>Backend API: <a href="http://localhost:3001/api/health" target="_blank" rel="noopener noreferrer">http://localhost:3001/api/health</a></p>
    </div>
  );
};

export default AppComponent; 
