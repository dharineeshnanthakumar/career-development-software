import React, { useState } from 'react';

export default function StudentJobs({ jobs, loadingData }) {
  const [applying, setApplying] = useState(null);
  const [message, setMessage] = useState('');

  const handleApply = async (jobId) => {
    setApplying(jobId);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/student/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Application submitted successfully!');
      } else {
        setMessage(data.message || 'Failed to apply.');
      }
    } catch (err) {
      setMessage('Network error occurred.');
    } finally {
      setApplying(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="tab-pane">
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>Search Jobs</h1>
          <p>Find and apply for open positions.</p>
        </div>
      </header>

      {message && <div style={{padding: '1rem', background: 'var(--card-bg)', border: '1px solid var(--accent-color)', borderRadius: '8px', marginBottom: '1rem', color: 'var(--text-main)'}}>{message}</div>}

      <div className="widget-card">
        <div className="job-list">
          {loadingData ? (
            <p style={{color: 'var(--text-muted)'}}>Loading jobs...</p>
          ) : jobs.length > 0 ? (
            jobs.map(job => (
              <div className="job-item" key={job.id} style={{padding: '1.5rem'}}>
                <div className="job-logo" style={{width: '60px', height: '60px', fontSize: '1.5rem'}}>
                  {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'J'}
                </div>
                <div className="job-details">
                  <h4 style={{fontSize: '1.2rem'}}>{job.title}</h4>
                  <p style={{fontSize: '1rem', marginBottom: '0.5rem'}}>{job.companyName} • {job.location || 'Location varies'}</p>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{job.description || 'No description available.'}</p>
                </div>
                <button 
                  className="apply-btn" 
                  onClick={() => handleApply(job.id)}
                  disabled={applying === job.id}
                  style={{padding: '0.75rem 1.5rem'}}
                >
                  {applying === job.id ? 'Applying...' : 'Apply Now'}
                </button>
              </div>
            ))
          ) : (
            <p style={{color: 'var(--text-muted)'}}>No open jobs at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
}
