import React from 'react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
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
          Profile Page
        </h1>
        <p style={{ color: '#666', marginTop: '10px' }}>
          Welcome, <b>{user?.name || 'User'}</b>! Role: <span style={{ textTransform: 'uppercase', color: 'var(--primary-color, #ff4b2b)', fontWeight: '600' }}>{user?.role || 'user'}</span>
        </p>
      </div>
    </div>
  );
};

export default Profile;
