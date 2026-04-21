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
  const [viewJobModal, setViewJobModal] = useState({ show: false, job: null });
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

  const handleUpdateJobStatus = async (jobId, currentJob, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const updatedJob = {
        title: currentJob.title,
        description: currentJob.description,
        eligibilityCriteria: currentJob.eligibilityCriteria,
        location: currentJob.location,
        ctc: currentJob.ctc,
        deadline: Array.isArray(currentJob.deadline)
          ? `${currentJob.deadline[0]}-${String(currentJob.deadline[1]).padStart(2, '0')}-${String(currentJob.deadline[2]).padStart(2, '0')}`
          : currentJob.deadline,
        status: newStatus
      };
      const response = await fetch(`http://localhost:8080/api/company/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedJob)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setJobs(jobs.map(job => job.jobId === jobId ? data.data : job));
      } else {
        alert(data.message || 'Failed to update job status');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while updating job status');
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
        <div className="dashboard-content-wrapper">
          <button
            onClick={() => setViewingApplicationsForJob(null)}
            className="back-btn"
          >
            ← Back to Jobs
          </button>

          <div className="dashboard-header">
            <div className="header-greeting">
              <h1>Applications for {job?.title}</h1>
              <p>Review and update student applications.</p>
            </div>
          </div>

          {loadingApplications ? (
            <p>Loading applications...</p>
          ) : (
            <div className="jobs-list">
              {applications.length === 0 ? (
                <p>No applications yet for this job.</p>
              ) : (
                applications.map(app => (
                  <div key={app.applicationId} className="job-card">
                    <div className="job-header">
                      <div>
                        <h3 className="job-title">{app.studentName}</h3>
                        <p className="job-meta">Roll: {app.studentRollNumber}</p>
                      </div>
                      <span className={`job-status-badge ${app.status === 'APPLIED' ? 'status-open' : 'status-closed'}`}>
                        {app.status}
                      </span>
                    </div>
                    <p className="job-meta" style={{ marginBottom: '1rem' }}>
                      Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>

                    <div className="job-actions" style={{ marginBottom: '1rem' }}>
                      <button
                        className="btn-primary"
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
                        className="btn-secondary"
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

                    <div className="job-footer" style={{ marginTop: '0', paddingTop: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <select
                          value={statusUpdates[app.applicationId] ?? app.status}
                          onChange={(e) => setStatusUpdates(prev => ({ ...prev, [app.applicationId]: e.target.value }))}
                          style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '8px',
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
                          className="btn-primary"
                          onClick={() => handleUpdateApplicationStatus(app.applicationId, statusUpdates[app.applicationId] ?? app.status)}
                        >
                          Update Status
                        </button>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ background: '#10b981' }}
                        onClick={() => setFeedbackModal({ show: true, jobId: viewingApplicationsForJob })}
                      >
                        Give Feedback
                      </button>
                    </div>
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
          <div className="dashboard-content-wrapper">
            <div className="dashboard-header">
              <div className="header-greeting">
                <h1>Company Overview</h1>
                <p>.</p>
              </div>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-info">
                  <h3>Total Jobs</h3>
                  <p>{jobs.length}</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-info">
                  <h3>Active Jobs</h3>
                  <p>{jobs.filter(job => job.status === 'OPEN').length}</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Post Job':
        return (
          <div className="dashboard-content-wrapper">
            <div className="dashboard-header">
              <div className="header-greeting">
                <h1>Post New Job</h1>
                <p>Create a new job posting for students to apply.</p>
              </div>
            </div>
            <div className="form-container" style={{ margin: '0 auto' }}>
              <form onSubmit={handlePostJob}>
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    required
                    placeholder="Enter job title"
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    required
                    rows="4"
                    placeholder="Enter job description"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label>Eligibility Criteria</label>
                  <textarea
                    value={jobForm.eligibilityCriteria}
                    onChange={(e) => setJobForm({ ...jobForm, eligibilityCriteria: e.target.value })}
                    required
                    rows="3"
                    placeholder="Enter eligibility criteria"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    required
                    placeholder="Enter job location"
                  />
                </div>

                <div className="form-group">
                  <label>CTC</label>
                  <input
                    type="text"
                    value={jobForm.ctc}
                    onChange={(e) => setJobForm({ ...jobForm, ctc: e.target.value })}
                    required
                    placeholder="Enter CTC (e.g., 5-8 LPA)"
                  />
                </div>

                <div className="form-group">
                  <label>Application Deadline</label>
                  <input
                    type="date"
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <button
                  type="submit"
                  disabled={postingJob}
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {postingJob ? 'Posting Job...' : 'Post Job'}
                </button>
              </form>
            </div>
          </div>
        );
      case 'My Jobs':
        return (
          <div className="dashboard-content-wrapper">
            <div className="dashboard-header">
              <div className="header-greeting">
                <h1>My Jobs</h1>
                <p>Manage your posted jobs and view applications.</p>
              </div>
            </div>
            {loadingData ? (
              <p>Loading jobs...</p>
            ) : (
              <div className="jobs-list">
                {jobs.length === 0 ? (
                  <p>No jobs posted yet.</p>
                ) : (
                  jobs.map(job => (
                    <div key={job.jobId} className="job-card">
                      <div className="job-header">
                        <div>
                          <h3 className="job-title">{job.title}</h3>
                          <p className="job-meta">{job.location} • {job.ctc}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`job-status-badge status-${job.status.toLowerCase()}`}>
                            {job.status}
                          </span>
                          <button
                            onClick={() => handleUpdateJobStatus(job.jobId, job, job.status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                          >
                            Mark {job.status === 'OPEN' ? 'CLOSED' : 'OPEN'}
                          </button>
                        </div>
                      </div>
                      <p className="job-description">{job.description}</p>
                      <div className="job-footer">
                        <span className="job-deadline">
                          Deadline: {new Date(job.deadline).toLocaleDateString()}
                        </span>
                        <div className="job-actions">
                          <button
                            className="btn-secondary"
                            onClick={() => setViewJobModal({ show: true, job })}
                          >
                            View Details
                          </button>
                          <button
                            className="btn-primary"
                            onClick={() => handleViewApplications(job.jobId)}
                          >
                            View Applications
                          </button>
                        </div>
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
          <h2>SNU Career Portal</h2>
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
      <main className="dashboard-main">
        <div className="top-navbar">
          <h1>Company Dashboard</h1>
        </div>
        {renderContent()}
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

      {/* View Job Modal */}
      {viewJobModal.show && viewJobModal.job && (
        <div className="notification-modal-overlay" onClick={() => setViewJobModal({ show: false, job: null })}>
          <div className="notification-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="notification-modal-header">
              <h3>{viewJobModal.job.title}</h3>
              <button className="close-btn" onClick={() => setViewJobModal({ show: false, job: null })}>×</button>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto', color: 'var(--text-main)' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>Description</h4>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{viewJobModal.job.description}</p>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>Eligibility Criteria</h4>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{viewJobModal.job.eligibilityCriteria}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>Location</h4>
                  <p style={{ margin: 0 }}>{viewJobModal.job.location}</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>CTC</h4>
                  <p style={{ margin: 0 }}>{viewJobModal.job.ctc}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}>Deadline</h4>
                  <p style={{ margin: 0 }}>{new Date(viewJobModal.job.deadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-color)' }}></h4>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    background: viewJobModal.job.status === 'OPEN' ? 'var(--success-color)' : 'var(--error-color)',
                    color: '#fff',
                    display: 'inline-block'
                  }}>
                    {viewJobModal.job.status}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewJobModal({ show: false, job: null })}
                style={{
                  padding: '0.5rem 1.5rem',
                  background: 'var(--secondary-bg)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}