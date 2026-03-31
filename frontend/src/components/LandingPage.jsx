import React, { useState } from 'react';
import Navbar from './Navbar';
import LoginOverlay from './LoginOverlay';
import './LandingPage.css';

export default function LandingPage() {
  const [userType, setUserType] = useState('student');
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleAdminClick = () => setSelectedRole('Admin');

  const closeOverlay = () => {
    setSelectedRole(null);
    setShowLoginOverlay(false);
  };

  const handleToggle = (type) => setUserType(type);

  const handleContinueClick = () => setShowLoginOverlay(true);

  return (
    <>
      <div className="background"></div>

      <Navbar onAdminClick={handleAdminClick} />

      <main className="landing-container">
        <div className="landing-main-wrapper">

          {/* LEFT SIDE */}
          <div className="landing-left-section">

            <div className="landing-top-row">
              <div className="landing-logo-section">
                <img src="/logo.png" alt="Logo" className="landing-logo" />
              </div>

              <div className="landing-title-section">
                <h1 className="main-title">
                  <span className="title-word">Career</span>
                  <span className="title-word">Development</span>
                  <span className="title-word">Center</span>
                </h1>
                <p className="main-subtitle">
                  Shiv Nadar University, Delhi NCR
                </p>
              </div>
            </div>

            <div className="about-card-inline">
              <h3>About us</h3>
              <p>
Since its first batch graduated in 2015, the University has continued to be a preferred choice for hiring by both Indian and international organizations. Our students exhibit qualities essential to being global professionals. Our multidisciplinary curriculum, entrenched in research and critical thinking, is supplemented by the efforts of the Career Development Center (CDC). Through various internal training workshops, mentorship programs, and skill-development modules, we tirelessly endeavor to ensure that students become an asset to any organization that hires them.
</p><br/>
<p>
We engage with a variety of organizations for internships and placements of students. These range from multidisciplinary employers, core engineering and manufacturing companies, start-ups, think tanks, banks, financial institutions, NGOs, FMCG organizations, and publishing houses. For students who opt for higher education, we provide in-house support and counseling sessions, helping them pursue higher education in some of the best educational institutions around the world.
            </p><br/>
            <p>
              The Career Development Center also actively collaborates with industry leaders to organize guest lectures, networking events, and real-world project opportunities, enabling students to gain practical exposure beyond the classroom. By fostering strong industry-academia partnerships and continuously adapting to evolving market demands, the Center ensures that students remain competitive, confident, and well-prepared to navigate dynamic career landscapes.
            </p>
            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="landing-portal-section">

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

            <div className="content-area">
              {userType === 'student' ? (
                <div className="content-card fade-in">
                  <h2>Student Portal</h2>
                  <p>Access your dashboard, apply for jobs, and build your profile.</p>
                  <button className="primary-btn-large" onClick={handleContinueClick}>
                    Continue as Student
                  </button>
                </div>
              ) : (
                <div className="content-card fade-in">
                  <h2>Employer Portal</h2>
                  <p>Post opportunities and manage recruitment efficiently.</p>
                  <button className="primary-btn-large" onClick={handleContinueClick}>
                    Continue as Employer
                  </button>
                </div>
              )}
            </div>

            {/* ✅ NEW RIGHT BOTTOM SECTION */}
            <div className="right-info-section">

              <div className="info-card">
                <h4>Placements Preparation Module</h4>
                <p>
                  The Career Development Center, through various training workshops, mentorship programs, skill-development modules, and personality enhancement sessions, works to ensure that students become an asset to every organization that hires them. Advisors assist every student and help them realize their potential by understanding their interests, skills, and potential.
                </p>
              </div>

              <div className="info-card">
                <h4>Career Advisors</h4>
                <p>
                  With more than 450 employment partners since its inception, 93% of the students receive placements in top organizations. With an average salary of INR 9.29 lakhs per annum to a maximum of INR 58.09 lakhs per annum, students from the University are a preferred choice for top recruiters.
                </p>
              </div>

              <div className="info-card">
                <h4>Soft Skills Training</h4>
                <p>
                  The multidisciplinary approach and the diverse community help students explore and make them flexible to adapt to any educational structure in the world. The experienced faculty help students to join top universities worldwide. Due to the multidisciplinary research-based education imparted, our students are unique, which truly sets them apart.
                </p>
              </div>

            </div>

          </div>

        </div>
      </main>

      <LoginOverlay
        role={
          selectedRole ||
          (showLoginOverlay
            ? userType === 'student'
              ? 'Student'
              : 'Company'
            : null)
        }
        onClose={closeOverlay}
      />
    </>
  );
}