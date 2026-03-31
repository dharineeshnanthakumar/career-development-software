import React from 'react';
import './Navbar.css';

export default function Navbar({ onAdminClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Admin Login link on the right */}
        <div className="navbar-admin">
          <button 
            className="admin-login-link"
            onClick={onAdminClick}
            title="Admin Portal"
          >
            Admin Login
          </button>
        </div>
      </div>
    </nav>
  );
}
