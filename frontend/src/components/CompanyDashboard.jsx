import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CompanyDashboard.css';

export default function CompanyDashboard() {
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
  const [statusUpdates, setStatusUpdates] = useState({});
  const [feedbackModal, setFeedbackModal] = useState({ show: false, jobId: null });
  const [feedbackForm, setFeedbackForm] = useState({ rating: 5, comments: '' });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (!validateUserRole('Company')) {
      navigate('/');
      return;
    }

    setUser({ name: 'Company User' });

    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
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
    
    // Validate deadline
    if (!jobForm.deadline) {
      alert('Please select a deadline date');
      setPostingJob(false);
      return;
    }
    
    const deadline = new Date(jobForm.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (deadline < today) {
      alert('Deadline must be today or in the future');
      setPostingJob(false);
      return;
    }

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

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    if (!status) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/company/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setApplications(applications.map(app => app.applicationId === applicationId ? { ...app, status: data.data.status } : app));
        setStatusUpdates(prev => ({ ...prev, [applicationId]: data.data.status }));
        alert('Application status updated successfully');
      } else {
        alert(data.message || 'Failed to update application status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating application status');
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
      const response = await fetch(`http://localhost:8080/api/company/feedback/job/${feedbackModal.jobId}`, {
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
        setFeedbackModal({ show: false, jobId: null });
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
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                      <select
                        value={statusUpdates[app.applicationId] ?? app.status}
                        onChange={(e) => setStatusUpdates(prev => ({ ...prev, [app.applicationId]: e.target.value }))}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '4px',
                          border: '1px solid var(--card-border)',
                          background: 'var(--secondary-bg)',
                          color: 'var(--text-main)',
                          fontSize: '0.9rem'
                        }}
                      >
                        <option value="APPLIED">APPLIED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="INTERVIEW_SCHEDULED">INTERVIEW SCHEDULED</option>
                        <option value="OFFERED">SELECTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
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
                        onClick={() => handleUpdateApplicationStatus(app.applicationId, statusUpdates[app.applicationId] ?? app.status)}
                      >
                        Update Status
                      </button>
                    </div>
                    <button
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#10b981',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        marginLeft: '0.5rem'
                      }}
                      onClick={() => setFeedbackModal({ show: true, jobId: viewingApplicationsForJob })}
                    >
                      Give Feedback
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
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
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

      {/* Feedback Modal */}
      {feedbackModal.show && (
        <div className="notification-modal-overlay" onClick={() => setFeedbackModal({ show: false, jobId: null })}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notification-modal-header">
              <h3>Give Feedback on Job</h3>
              <button className="close-btn" onClick={() => setFeedbackModal({ show: false, jobId: null })}>×</button>
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
                    placeholder="Enter your feedback about the candidate..."
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
                    onClick={() => setFeedbackModal({ show: false, jobId: null })}
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