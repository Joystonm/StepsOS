import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const heroStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '90vh',
    textAlign: 'center' as const,
    color: 'white',
    padding: '0 20px',
    position: 'relative' as const,
    zIndex: 2
  };

  const titleStyle = {
    fontSize: '4.5rem',
    fontWeight: 800,
    marginBottom: '1.5rem',
    textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(45deg, #ffffff, #f0f8ff)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  };

  const subtitleStyle = {
    fontSize: '1.4rem',
    marginBottom: '3rem',
    opacity: 0.95,
    maxWidth: '700px',
    margin: '0 auto 3rem auto',
    lineHeight: 1.6,
    fontWeight: 300
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
    marginBottom: '4rem'
  };

  const primaryButtonStyle = {
    padding: '16px 32px',
    background: 'white',
    color: '#667eea',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1.1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
    border: 'none',
    cursor: 'pointer'
  };

  const secondaryButtonStyle = {
    padding: '16px 32px',
    background: 'transparent',
    color: 'white',
    border: '2px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1.1rem',
    transition: 'all 0.3s ease'
  };

  const featuresStyle = {
    background: 'white',
    padding: '100px 20px',
    position: 'relative' as const
  };

  const featuresContainerStyle = {
    maxWidth: '1200px',
    margin: '0 auto'
  };

  const featuresTitleStyle = {
    textAlign: 'center' as const,
    fontSize: '3rem',
    marginBottom: '4rem',
    color: '#2d3748',
    fontWeight: 700
  };

  const featuresGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '3rem',
    marginBottom: '5rem'
  };

  const featureCardStyle = {
    textAlign: 'center' as const,
    padding: '3rem 2rem',
    borderRadius: '20px',
    background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid rgba(255, 255, 255, 0.8)'
  };

  const featureIconStyle = {
    fontSize: '4rem',
    marginBottom: '1.5rem',
    display: 'block'
  };

  const featureHeadingStyle = {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#2d3748',
    fontWeight: 600
  };

  const featureTextStyle = {
    color: '#4a5568',
    lineHeight: 1.7,
    fontSize: '1rem'
  };

  const statsStyle = {
    background: 'linear-gradient(135deg, #4299e1 0%, #667eea 100%)',
    padding: '80px 20px',
    color: 'white'
  };

  const statsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '3rem',
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center' as const
  };

  const statNumberStyle = {
    fontSize: '3rem',
    fontWeight: 800,
    marginBottom: '0.5rem',
    display: 'block'
  };

  const statLabelStyle = {
    fontSize: '1.1rem',
    opacity: 0.9,
    fontWeight: 300
  };

  const ctaStyle = {
    background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    padding: '100px 20px',
    textAlign: 'center' as const,
    color: 'white'
  };

  const ctaTitleStyle = {
    fontSize: '3rem',
    marginBottom: '1.5rem',
    fontWeight: 700
  };

  const ctaTextStyle = {
    fontSize: '1.3rem',
    marginBottom: '3rem',
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0 auto 3rem auto'
  };

  return (
    <div style={containerStyle}>
      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '300px',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '50%',
        animation: 'float 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '200px',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.08)',
        borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite reverse'
      }} />

      {/* Hero Section */}
      <div style={heroStyle}>
        <div>
          <h1 style={titleStyle}>StepsOS</h1>
          <p style={subtitleStyle}>
            Transform your workflows with AI-powered execution, real-time visualization, 
            and intelligent auto-recovery. Built for the future of automation.
          </p>
          <div style={buttonContainerStyle}>
            <Link 
              to="/dashboard" 
              style={primaryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
              }}
            >
              🚀 Launch Dashboard
            </Link>
            <a 
              href="#features" 
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ✨ Explore Features
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" style={featuresStyle}>
        <div style={featuresContainerStyle}>
          <h2 style={featuresTitleStyle}>Powerful Features</h2>
          <div style={featuresGridStyle}>
            <div 
              style={featureCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span style={featureIconStyle}>📊</span>
              <h3 style={featureHeadingStyle}>Real-time Visualization</h3>
              <p style={featureTextStyle}>
                Monitor workflow execution with interactive graphs, live updates, 
                and comprehensive data lineage tracking.
              </p>
            </div>
            
            <div 
              style={featureCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span style={featureIconStyle}>🤖</span>
              <h3 style={featureHeadingStyle}>AI-Powered Analysis</h3>
              <p style={featureTextStyle}>
                Get intelligent insights, performance optimization suggestions, 
                and automated problem resolution with advanced AI.
              </p>
            </div>
            
            <div 
              style={featureCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
              }}
            >
              <span style={featureIconStyle}>⚡</span>
              <h3 style={featureHeadingStyle}>High Performance</h3>
              <p style={featureTextStyle}>
                Built with Motia for lightning-fast execution, scalable processing, 
                and enterprise-grade reliability.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div style={ctaStyle}>
        <h2 style={ctaTitleStyle}>Ready to Transform Your Workflows?</h2>
        <p style={ctaTextStyle}>
          Join the future of intelligent automation. Start building self-healing, 
          AI-powered workflows today.
        </p>
        <Link 
          to="/dashboard" 
          style={{
            ...primaryButtonStyle,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '1.2rem',
            padding: '18px 36px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
          }}
        >
          Get Started Now →
        </Link>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @media (max-width: 768px) {
          h1 { font-size: 2.5rem !important; }
          .hero-subtitle { font-size: 1.1rem !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
