import React, { useState } from 'react';

export default function StudentJobs({ jobs, loadingData }) {
  const [applying, setApplying] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleApply = async (jobId, jobTitle) => {
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
        setMessageType('success');
        setMessage(`Successfully applied for ${jobTitle}!`);
        setAppliedJobs(prev => new Set(prev).add(jobId));
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to apply. Please try again.');
      }
    } catch (err) {
      setMessageType('error');
      setMessage('Network error occurred. Please check your connection.');
      console.error(err);
    } finally {
      setApplying(null);
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 4000);
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

      {message && (
        <div style={{
          padding: '1rem',
          background: messageType === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${messageType === 'success' ? '#22c55e' : '#ef4444'}`,
          borderRadius: '8px',
          marginBottom: '1rem',
          color: messageType === 'success' ? '#22c55e' : '#ef4444',
          fontWeight: '500'
        }}>
          {messageType === 'success' ? '✓ ' : '✗ '}{message}
        </div>
      )}

      <div className="widget-card">
        <div className="job-list">
          {loadingData ? (
            <p style={{color: 'var(--text-muted)'}}>Loading jobs...</p>
          ) : jobs.length > 0 ? (
            jobs.map(job => (
              <div className="job-item" key={job.jobId} style={{padding: '1.5rem'}}>
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
                  onClick={() => handleApply(job.jobId, job.title)}
                  disabled={applying === job.jobId || appliedJobs.has(job.jobId)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: appliedJobs.has(job.jobId) ? '#888' : 'var(--accent-color)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: appliedJobs.has(job.jobId) ? 'not-allowed' : (applying === job.jobId ? 'wait' : 'pointer'),
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {applying === job.jobId ? 'Applying...' : appliedJobs.has(job.jobId) ? '✓ Applied' : 'Apply Now'}
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
