import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Docs from './pages/Docs';

function Navbar() {
  const location = useLocation();
  
  const navbarStyle = {
    background: 'white',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px'
  };

  const logoStyle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#667eea',
    textDecoration: 'none'
  };

  const linksStyle = {
    display: 'flex',
    gap: '2rem'
  };

  const linkStyle = {
    color: '#666',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'all 0.2s ease'
  };

  const activeLinkStyle = {
    ...linkStyle,
    color: '#667eea',
    background: '#e6f0ff'
  };
  
  return (
    <nav style={navbarStyle}>
      <div style={containerStyle}>
        <Link to="/" style={logoStyle}>
          StepsOS
        </Link>
        <div style={linksStyle}>
          <Link 
            to="/" 
            style={location.pathname === '/' ? activeLinkStyle : linkStyle}
          >
            Home
          </Link>
          <Link 
            to="/dashboard" 
            style={location.pathname === '/dashboard' ? activeLinkStyle : linkStyle}
          >
            Dashboard
          </Link>
          <Link 
            to="/docs" 
            style={location.pathname === '/docs' ? activeLinkStyle : linkStyle}
          >
            Docs
          </Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/docs" element={<Docs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
