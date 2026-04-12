import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import StudentOverview from './StudentOverview';
import StudentJobs from './StudentJobs';
import StudentApplications from './StudentApplications';
import StudentProfile from './StudentProfile';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role?.toLowerCase() !== 'student') {
      navigate('/');
      return;
    }

    setUser({ name: 'Student Viewer' });

    const fetchData = async () => {
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
              />
            )}

            {activeTab === 'Jobs' && (
              <StudentJobs jobs={jobs} loadingData={loadingData} />
            )}

            {activeTab === 'Applications' && (
              <StudentApplications applications={applications} loadingData={loadingData} />
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
    </div>
  );
}