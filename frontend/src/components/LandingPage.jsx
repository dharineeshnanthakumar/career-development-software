import React, { useState } from 'react';
import Navbar from './Navbar';
import LoginOverlay from './LoginOverlay';
import './LandingPage.css';

export default function LandingPage() {
  const [userType, setUserType] = useState('student'); // 'student' | 'employer'
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  
  // For admin login
  const [selectedRole, setSelectedRole] = useState(null);

  const handleAdminClick = () => {
    setSelectedRole('Admin');
  };

  const closeOverlay = () => {
    setSelectedRole(null);
    setShowLoginOverlay(false);
  };

  const handleToggle = (type) => {
    setUserType(type);
  };

  const handleContinueClick = () => {
    setShowLoginOverlay(true);
  };

  return (
    <>
      <div className="background"></div>
      
      <Navbar onAdminClick={handleAdminClick} />
      
      <main className="landing-container">
        <div className="landing-main-wrapper">
          {/* Left Side - Logo */}
          <div className="landing-logo-section">
            <img src="/logo.png" alt="Shiv Nadar University Logo" className="landing-logo" />
          </div>

          {/* Middle - Title Section */}
          <div className="landing-title-section">
            <h1 className="main-title">
              <span className="title-word">Career</span>
              <span className="title-word">Development</span>
              <span className="title-word">Center</span>
            </h1>
            <p className="main-subtitle">Shiv Nadar University, Delhi NCR</p>
          </div>

          {/* Right Side - Toggle and Portal */}
          <div className="landing-portal-section">
            {/* Sleek Toggle Switch */}
            <div className="toggle-section">
              <div className="toggle-container">
                <button
                  className={`toggle-option ${userType === 'student' ? 'active' : ''}`}
                  onClick={() => handleToggle('student')}
                >
                  I am a Student
                </button>
                <button
                  className={`toggle-option ${userType === 'employer' ? 'active' : ''}`}
                  onClick={() => handleToggle('employer')}
                >
                  I am an Employer
                </button>
                <div className={`toggle-slider ${userType}`}></div>
              </div>
            </div>

            {/* Content Area - Fades/Swaps based on toggle */}
            <div className="content-area">
              {userType === 'student' ? (
                <div className="content-card fade-in">
                  <h2>Student Portal</h2>
                  <p>Access your dashboard, apply for jobs, and build your professional profile.</p>
                  <button className="primary-btn-large" onClick={handleContinueClick}>
                    Continue as Student
                  </button>
                </div>
              ) : (
                <div className="content-card fade-in">
                  <h2>Employer Portal</h2>
                  <p>Post opportunities, discover top talent, and manage your recruitment process.</p>
                  <button className="primary-btn-large" onClick={handleContinueClick}>
                    Continue as Employer
                  </button>
                </div>
              )}
            </div>

            {/* Tagline */}
            <p className="tagline">Empowering futures, connecting talent with opportunity</p>
          </div>
        </div>
      </main>

      <LoginOverlay 
        role={selectedRole || (showLoginOverlay ? (userType === 'student' ? 'Student' : 'Company') : null)} 
        onClose={closeOverlay} 
      />

      {/* About Section */}
      <section className="about-section">
        <div className="about-container">
          <h2 className="about-title">About Shiv Nadar Institution of Eminence</h2>
          <p className="about-text">
            The Shiv Nadar Institution of Eminence is a multidisciplinary, student-centric research university established in 2011 by Shiv Nadar, one of India's foremost philanthropists and a pioneer of technological revolution. It has four Schools, viz., Engineering, Natural Sciences, Humanities and Social Sciences, Management & Entrepreneurship, and the Academy of Continuing Education. We were the first university in the country to offer a 4-year multidisciplinary research degree. Today, we are continuing as trailblazers with new kinds of curriculum, championed by faculty drawn from some of the top institutions in the country and the world. With low faculty-student ratios, their in-depth attention to students lead to high levels of student success.
          </p>
        </div>

        {/* Vision and Mission Card */}
        <div className="vision-mission-container">
          <div className="vision-mission-card">
            <div className="vision-mission-section">
              <h3 className="vision-mission-title">Vision</h3>
              <p className="vision-mission-text">
                To become a globally recognized research university committed to excellence in teaching, discovery and innovation, scholarship, and service so as to expand the scope of human understanding, and contributing to the betterment of the world.
              </p>
            </div>

            <div className="vision-mission-divider"></div>

            <div className="vision-mission-section">
              <h3 className="vision-mission-title">Mission</h3>
              <ul className="vision-mission-list">
                <li>To develop and educate the path-shapers of tomorrow, capable of responsible and ethical leadership.</li>
                <li>To support research, scholarly, and creative endeavors that contribute to the creation of new knowledge at the frontiers of specialized areas, as well as at the interface of diverse disciplines.</li>
                <li>To establish research and teaching programs to address the most pressing problems of India and the global community.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
