import React, { useState } from 'react';

export default function StudentOverview({ user, applications, jobs, loadingData, onViewAll }) {
  const [selectedJob, setSelectedJob] = useState(null);

  const lastThreeJobs = jobs.length > 3 ? jobs.slice(-3) : jobs;

  return (
    <>
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Here's what is happening with your career journey today.</p>
        </div>
        <div className="header-actions">
          <button className="icon-btn notif-btn" title="Alerts" style={{fontSize: '0.8rem', fontWeight: 'bold'}}>! </button>
          <div className="avatar">{user?.name ? user.name.charAt(0) : 'S'}</div>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Active Applications</h3>
              <p className="stat-value">{applications.length}</p>
            </div>
          </div>
        </div>

        <div className="dashboard-widgets">
          <div className="widget-card featured-jobs">
            <div className="widget-header">
              <h2>Recommended Jobs</h2>
              <button className="view-all" onClick={onViewAll}>View All</button>
            </div>
            <div className="job-list">
              {loadingData ? (
                <p style={{color: 'var(--text-muted)'}}>Loading jobs...</p>
              ) : jobs.length > 0 ? (
                lastThreeJobs.map(job => (
                  <div className="job-item" key={job.jobId || job.id}>
                    <div className="job-logo">{job.companyName ? job.companyName.charAt(0).toUpperCase() : 'J'}</div>
                    <div className="job-details">
                      <h4>{job.title}</h4>
                      <p>{job.companyName} • {job.location || 'Location varies'}</p>
                    </div>
                    <button className="apply-btn" onClick={() => setSelectedJob(job)}>
                      View
                    </button>
                  </div>
                ))
              ) : (
                <p style={{color: 'var(--text-muted)'}}>No recommended jobs at the moment.</p>
              )}
            </div>
          </div>
          {selectedJob && (
            <div className="job-detail-panel" style={{ marginTop: '2rem' }}>
              <div className="widget-card" style={{ padding: '1.5rem', borderRadius: '12px' }}>
                <div className="widget-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ margin: 0 }}>{selectedJob.title}</h2>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)' }}>
                      {selectedJob.companyName} • {selectedJob.location || 'Location varies'}
                    </p>
                  </div>
                  <button
                    className="view-all"
                    style={{ marginLeft: '1rem' }}
                    onClick={() => setSelectedJob(null)}
                  >
                    Close
                  </button>
                </div>
                <div className="job-detail-content" style={{ marginTop: '1rem', lineHeight: '1.6' }}>
                  <p><strong>CTC:</strong> {selectedJob.ctc || 'Not specified'}</p>
                  <p><strong>Deadline:</strong> {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'Not specified'}</p>
                  <p><strong>Description:</strong></p>
                  <p style={{ margin: '0.5rem 0 1.25rem' }}>{selectedJob.description || 'No description available.'}</p>
                  {selectedJob.eligibilityCriteria && (
                    <>
                      <p><strong>Eligibility:</strong></p>
                      <p style={{ margin: '0.5rem 0 0' }}>{selectedJob.eligibilityCriteria}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
