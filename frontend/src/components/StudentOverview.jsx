import React from 'react';

export default function StudentOverview({ user, applications, jobs, loadingData }) {
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
          <div className="stat-card">
            <div className="stat-info">
              <h3>Saved Jobs</h3>
              <p className="stat-value">12</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Profile Completion</h3>
              <p className="stat-value">85%</p>
            </div>
          </div>
        </div>

        <div className="dashboard-widgets">
          <div className="widget-card featured-jobs">
            <div className="widget-header">
              <h2>Recommended Jobs</h2>
              <button className="view-all">View All</button>
            </div>
            <div className="job-list">
              {loadingData ? (
                <p style={{color: 'var(--text-muted)'}}>Loading jobs...</p>
              ) : jobs.length > 0 ? (
                jobs.slice(0, 3).map(job => (
                  <div className="job-item" key={job.id}>
                    <div className="job-logo">{job.companyName ? job.companyName.charAt(0).toUpperCase() : 'J'}</div>
                    <div className="job-details">
                      <h4>{job.title}</h4>
                      <p>{job.companyName} • {job.location || 'Location varies'}</p>
                    </div>
                    <button className="apply-btn">Apply</button>
                  </div>
                ))
              ) : (
                <p style={{color: 'var(--text-muted)'}}>No recommended jobs at the moment.</p>
              )}
            </div>
          </div>

          <div className="widget-card upcoming-events">
             <div className="widget-header">
              <h2>Upcoming Events</h2>
            </div>
            <div className="event-list">
              <div className="event-item">
                <div className="event-date">
                  <span className="month">APR</span>
                  <span className="day">12</span>
                </div>
                <div className="event-details">
                  <h4>Spring Career Fair</h4>
                  <p>Main Campus Center</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
