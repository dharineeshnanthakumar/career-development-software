import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyDashboard.css';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    eligibilityCriteria: '',
    location: '',
    ctc: '',
    deadline: ''
  });
  const [postingJob, setPostingJob] = useState(false);
  const [viewingApplicationsForJob, setViewingApplicationsForJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role?.toLowerCase() !== 'company') {
      navigate('/');
      return;
    }

    setUser({ name: 'Company User' });

    const fetchData = async () => {
      try {
        const jobsRes = await fetch('http://localhost:8080/api/company/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const jobsData = await jobsRes.json();
        if (jobsData.success && jobsData.data) setJobs(jobsData.data);

        const notifsRes = await fetch('http://localhost:8080/api/company/notifications', {
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
      await fetch(`http://localhost:8080/api/company/notifications/${notificationId}/read`, {
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

  const handlePostJob = async (e) => {
    e.preventDefault();
    setPostingJob(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/company/jobs', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobForm)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        alert('Job posted successfully!');
        setJobForm({
          title: '',
          description: '',
          eligibilityCriteria: '',
          location: '',
          ctc: '',
          deadline: ''
        });
        // Refresh jobs list
        const jobsRes = await fetch('http://localhost:8080/api/company/jobs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const jobsData = await jobsRes.json();
        if (jobsData.success && jobsData.data) setJobs(jobsData.data);
      } else {
        alert(data.message || 'Failed to post job');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while posting job');
    } finally {
      setPostingJob(false);
    }
  };

  const handleViewApplications = async (jobId) => {
    setViewingApplicationsForJob(jobId);
    setLoadingApplications(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/company/jobs/${jobId}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setApplications(data.data);
      } else {
        alert(data.message || 'Failed to load applications');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while fetching applications');
    } finally {
      setLoadingApplications(false);
    }
  };

  const renderContent = () => {
    if (viewingApplicationsForJob !== null) {
      const job = jobs.find(j => j.jobId === viewingApplicationsForJob);
      return (
        <div style={{ padding: '2rem' }}>
          <button
            onClick={() => setViewingApplicationsForJob(null)}
            style={{
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              background: 'var(--secondary-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--card-border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
             Back to Jobs
          </button>
          
          <h1>Applications for {job?.title}</h1>
          
          {loadingApplications ? (
            <p>Loading applications...</p>
          ) : (
            <div>
              {applications.length === 0 ? (
                <p>No applications yet for this job.</p>
              ) : (
                applications.map(app => (
                  <div key={app.applicationId} style={{ background: 'var(--secondary-bg)', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>{app.studentName}</h3>
                        <p style={{ margin: '0', color: 'var(--text-muted)' }}>Roll: {app.studentRollNumber}</p>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: app.status === 'APPLIED' ? 'var(--accent-color)' : 'var(--error-color)',
                        color: '#fff'
                      }}>
                        {app.status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                    <button
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--accent-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        marginRight: '0.5rem'
                      }}
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        fetch(`http://localhost:8080/api/company/cvs/${app.applicationId}/download`, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                        .then(res => {
                          if (!res.ok) throw new Error('Failed to fetch CV');
                          return res.blob();
                        })
                        .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const fileName = app.cvFileName || 'cv.pdf';
                          const isPdf = fileName.toLowerCase().endsWith('.pdf');
                          
                          if (isPdf) {
                            const previewWindow = window.open(url, '_blank', 'noopener,noreferrer');
                            if (!previewWindow) {
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = fileName;
                              document.body.appendChild(a);
                              a.click();
                              a.remove();
                            }
                          } else {
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = fileName;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                          }
                        })
                        .catch(err => {
                          console.error(err);
                          alert('Failed to load CV');
                        });
                      }}
                    >
                       Preview CV
                    </button>
                    <button
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--secondary-bg)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                      onClick={() => {
                        const token = localStorage.getItem('token');
                        fetch(`http://localhost:8080/api/company/cvs/${app.applicationId}/download`, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                        .then(res => res.blob())
                        .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = app.cvFileName || 'cv.pdf';
                          a.click();
                          window.URL.revokeObjectURL(url);
                        })
                        .catch(err => {
                          console.error(err);
                          alert('Failed to download CV');
                        });
                      }}
                    >
                      Download CV
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      );
    }

    switch (activeTab) {
      case 'Overview':
        return (
          <div style={{ padding: '2rem' }}>
            <h1>Company Overview</h1>
            <p>Welcome to your company dashboard. Here you can manage your jobs and applications.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
              <div style={{ background: 'var(--secondary-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>Total Jobs</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{jobs.length}</p>
              </div>
              <div style={{ background: 'var(--secondary-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>Active Jobs</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>{jobs.filter(job => job.isActive).length}</p>
              </div>
            </div>
          </div>
        );
      case 'Post Job':
        return (
          <div style={{ padding: '2rem' }}>
            <h1>Post New Job</h1>
            <form onSubmit={handlePostJob} style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Job Title</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--secondary-bg)', color: 'var(--text-main)' }}
                  placeholder="Enter job title"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Description</label>
                <textarea
                  value={jobForm.description}
                  onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                  required
                  rows="4"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--secondary-bg)', color: 'var(--text-main)', resize: 'vertical' }}
                  placeholder="Enter job description"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Eligibility Criteria</label>
                <textarea
                  value={jobForm.eligibilityCriteria}
                  onChange={(e) => setJobForm({...jobForm, eligibilityCriteria: e.target.value})}
                  required
                  rows="3"
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--secondary-bg)', color: 'var(--text-main)', resize: 'vertical' }}
                  placeholder="Enter eligibility criteria"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Location</label>
                <input
                  type="text"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({...jobForm, location: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--secondary-bg)', color: 'var(--text-main)' }}
                  placeholder="Enter job location"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>CTC</label>
                <input
                  type="text"
                  value={jobForm.ctc}
                  onChange={(e) => setJobForm({...jobForm, ctc: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--secondary-bg)', color: 'var(--text-main)' }}
                  placeholder="Enter CTC (e.g., 5-8 LPA)"
                />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontWeight: '600' }}>Application Deadline</label>
                <input
                  type="date"
                  value={jobForm.deadline}
                  onChange={(e) => setJobForm({...jobForm, deadline: e.target.value})}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: '4px', background: 'var(--secondary-bg)', color: 'var(--text-main)' }}
                />
              </div>
              
              <button
                type="submit"
                disabled={postingJob}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--accent-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: postingJob ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                {postingJob ? 'Posting Job...' : 'Post Job'}
              </button>
            </form>
          </div>
        );
      case 'My Jobs':
        return (
          <div style={{ padding: '2rem' }}>
            <h1>My Jobs</h1>
            {loadingData ? (
              <p>Loading jobs...</p>
            ) : (
              <div>
                {jobs.length === 0 ? (
                  <p>No jobs posted yet.</p>
                ) : (
                  jobs.map(job => (
                    <div key={job.jobId} style={{ background: 'var(--secondary-bg)', padding: '1.5rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>{job.title}</h3>
                          <p style={{ margin: '0', color: 'var(--text-muted)' }}>{job.location} • {job.ctc}</p>
                        </div>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          background: job.isActive ? 'var(--success-color)' : 'var(--error-color)',
                          color: '#fff'
                        }}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>{job.description}</p>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                        <button
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--accent-color)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}
                          onClick={() => handleViewApplications(job.jobId)}
                        >
                          View Applications
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        );
      case 'Profile':
        return (
          <div style={{ padding: '2rem' }}>
            <h1>Company Profile</h1>
            <p>Profile management will be here.</p>
          </div>
        );
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>CareerDev</h2>
          <span className="badge">Company</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('Overview')}
          >
            Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'Post Job' ? 'active' : ''}`}
            onClick={() => setActiveTab('Post Job')}
          >
            Post Job
          </button>
          <button
            className={`nav-item ${activeTab === 'My Jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('My Jobs')}
          >
            My Jobs
          </button>
          <button className="nav-item notification-btn" onClick={() => setShowNotifications(true)}>
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === 'Profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('Profile')}
          >
            Profile
          </button>
        </nav>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 'auto',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--error-color)',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {renderContent()}
      </div>

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