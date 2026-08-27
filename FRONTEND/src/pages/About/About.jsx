import React from 'react';
import Navbar from '../../components/Navbar';

const About = () => {
  return (
    <div>
      <Navbar />
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-color, #333)' }}>
          About Page
        </h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          This is the about page. All details and content will be placed here.
        </p>
      </div>
    </div>
  );
};

export default About;
