import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import StudentOverview from './StudentOverview';
import StudentJobs from './StudentJobs';
import StudentApplications from './StudentApplications';
import StudentProfile from './StudentProfile';

export default function StudentDashboard() {
  const navigate = useNavigate();

  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      return null;
    }
  };

  const validateUserRole = (expectedRole) => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    
    if (!token || storedRole !== expectedRole) {
      return false;
    }

    const decodedToken = decodeJWT(token);
    if (!decodedToken || !decodedToken.role) {
      return false;
    }

    // Map frontend role to backend role
    const expectedBackendRole = expectedRole === 'Admin' ? 'ROLE_ADMIN' : 
                               expectedRole === 'Company' ? 'ROLE_COMPANY' : 'ROLE_STUDENT';
    
    return decodedToken.role === expectedBackendRole;
  };
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ show: false, companyId: null });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comments: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!validateUserRole('Student')) {
      navigate('/');
      return;
    }

    setUser({ name: 'Student Viewer' });

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const jobsRes = await fetch('http://localhost:8080/api/student/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const jobsData = await jobsRes.json();
        if (jobsData.success && jobsData.data) setJobs(jobsData.data);

        const appsRes = await fetch('http://localhost:8080/api/student/applications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const appsData = await appsRes.json();
        if (appsData.success && appsData.data) setApplications(appsData.data);

        const notifsRes = await fetch('http://localhost:8080/api/student/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const notifsData = await notifsRes.json();
        if (notifsData.success && notifsData.data) setNotifications(notifsData.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  const markAsRead = async (notificationId) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:8080/api/student/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error("Error marking notification as read", err);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.comments.trim()) {
      alert('Please enter feedback comments');
      return;
    }

    setSubmittingFeedback(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/student/feedback/company/${feedbackModal.companyId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: feedbackForm.rating,
          comments: feedbackForm.comments
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert('Feedback submitted successfully!');
        setFeedbackModal({ show: false, companyId: null });
        setFeedbackForm({ rating: 5, comments: '' });
      } else {
        alert(data.message || 'Failed to submit feedback');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while submitting feedback');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (!user) return <div className="loading-screen">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SNU Career Portal</h2>
          <span className="badge">Student</span>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
            Overview
          </button>

          <button className={`nav-item ${activeTab === 'Jobs' ? 'active' : ''}`} onClick={() => setActiveTab('Jobs')}>
            Search Jobs
          </button>

          <button className={`nav-item ${activeTab === 'Applications' ? 'active' : ''}`} onClick={() => setActiveTab('Applications')}>
            Applications
          </button>

          <button className={`nav-item ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>
            My Profile
          </button>

          <button className="nav-item notification-btn" onClick={() => setShowNotifications(true)}>
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
            )}
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="dashboard-main">

        {/* 🔵 FULL WIDTH NAVBAR */}
        <div className="top-navbar">
          <h1>Student Dashboard</h1>
        </div>

        {/* ✅ GLOBAL CONTENT WRAPPER (THIS FIXES EVERYTHING) */}
        <div className="dashboard-content-wrapper">

          <div className="dashboard-content-tabs">
            {activeTab === 'Overview' && (
              <StudentOverview
                user={user}
                applications={applications}
                jobs={jobs}
                loadingData={loadingData}
                onViewAll={() => setActiveTab('Jobs')}
              />
            )}

            {activeTab === 'Jobs' && (
              <StudentJobs jobs={jobs} loadingData={loadingData} />
            )}

            {activeTab === 'Applications' && (
              <StudentApplications applications={applications} loadingData={loadingData} onFeedback={(companyId) => setFeedbackModal({ show: true, companyId })} />
            )}

            {activeTab === 'Profile' && <StudentProfile />}
          </div>

        </div>

      </main>

      {/* Notification Modal */}
      {showNotifications && (
        <div className="notification-modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notification-modal-header">
              <h3>Notifications</h3>
              <button className="close-btn" onClick={() => setShowNotifications(false)}>×</button>
            </div>
            <div className="notification-modal-body">
              {notifications.length === 0 ? (
                <p className="no-notifications">No notifications yet</p>
              ) : (
                notifications.map(notification => (
                  <div key={notification.id} className={`notification-item ${!notification.read ? 'unread' : ''}`}>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <small>{new Date(notification.createdAt).toLocaleDateString()}</small>
                    </div>
                    {!notification.read && (
                      <button
                        className="mark-read-btn"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal.show && (
        <div className="notification-modal-overlay" onClick={() => setFeedbackModal({ show: false, companyId: null })}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notification-modal-header">
              <h3>Give Feedback to Company</h3>
              <button className="close-btn" onClick={() => setFeedbackModal({ show: false, companyId: null })}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleSubmitFeedback}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>
                    Rating (1-5)
                  </label>
                  <select
                    value={feedbackForm.rating}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--card-border)',
                      borderRadius: '4px',
                      background: 'var(--secondary-bg)',
                      color: 'var(--text-main)',
                      fontSize: '1rem'
                    }}
                  >
                    <option value={1}>1 - Poor</option>
                    <option value={2}>2 - Fair</option>
                    <option value={3}>3 - Good</option>
                    <option value={4}>4 - Very Good</option>
                    <option value={5}>5 - Excellent</option>
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>
                    Comments
                  </label>
                  <textarea
                    value={feedbackForm.comments}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                    placeholder="Share your feedback about the company and interview experience..."
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--card-border)',
                      borderRadius: '4px',
                      background: 'var(--secondary-bg)',
                      color: 'var(--text-main)',
                      fontSize: '1rem',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setFeedbackModal({ show: false, companyId: null })}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'var(--secondary-bg)',
                      color: 'var(--text-main)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'var(--accent-color)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: submittingFeedback ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}