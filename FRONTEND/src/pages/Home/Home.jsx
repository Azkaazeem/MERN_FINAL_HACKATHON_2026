import React from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      <Navbar />
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-color, #333)' }}>
          Welcome to Home Page
        </h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          Hello, <b>{user?.name || 'User'}</b>! This is your standard user home page.
        </p>
      </div>
    </div>
  );
};

export default Home;