import React, { useState } from 'react';
import LoginOverlay from './LoginOverlay';

export default function LandingPage() {
  const [selectedRole, setSelectedRole] = useState(null);

  const handleCardClick = (role) => {
    setSelectedRole(role);
  };

  const closeOverlay = () => {
    setSelectedRole(null);
  };

  return (
    <>
      <div className="background"></div>
      
      <main className="container">
        <header className="hero">
          <h1>Career Development Portal</h1>
          <p>Empowering futures, connecting talent with opportunity. Please select your portal to continue.</p>
        </header>

        <div className="cards-grid">
          {/* Student Card */}
          <button className="card" onClick={() => handleCardClick('Student')}>
            <h2>Student</h2>
            <p>Access your dashboard, apply for jobs, and build your profile.</p>
          </button>

          {/* Company Card */}
          <button className="card" onClick={() => handleCardClick('Company')}>
            <h2>Company</h2>
            <p>Post opportunities and discover top talent for your organization.</p>
          </button>

          {/* Admin Card */}
          <button className="card" onClick={() => handleCardClick('Admin')}>
            <h2>Admin</h2>
            <p>Manage users, oversee operations, and configure settings.</p>
          </button>
        </div>
      </main>

      <LoginOverlay role={selectedRole} onClose={closeOverlay} />
    </>
  );
}
