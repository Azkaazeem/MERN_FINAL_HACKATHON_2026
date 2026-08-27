import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{
        flex: 1,
        padding: '60px 20px',
        textAlign: 'center',
        fontFamily: 'Poppins, sans-serif'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-color, #333)' }}>
          Welcome to Home Page
        </h1>
        <p style={{ color: '#666', marginTop: '12px', fontSize: '16px' }}>
          Hello, <b>{user?.name || 'User'}</b>! This is your standard user home page.
        </p>
      </div>
      <Footer />
    </div>
  );
};

export default Home;