import React, { useState } from 'react';

export default function StudentJobs({ jobs, loadingData }) {
  const [applying, setApplying] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [selectedJob, setSelectedJob] = useState(null); // For job details modal

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
                <div style={{display: 'flex', gap: '0.75rem'}}>
                  <button 
                    className="view-btn" 
                    onClick={() => setSelectedJob(job)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#f0f0f0',
                      color: '#333',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    View
                  </button>
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
              </div>
            ))
          ) : (
            <p style={{color: 'var(--text-muted)'}}>No open jobs at the moment.</p>
          )}
        </div>
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedJob(null)}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem'}}>
              <div>
                <h2 style={{fontSize: '1.8rem', marginBottom: '0.5rem'}}>{selectedJob.title}</h2>
                <p style={{fontSize: '1.1rem', color: '#666'}}>{selectedJob.companyName}</p>
              </div>
              <button 
                onClick={() => setSelectedJob(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <h4 style={{fontSize: '0.95rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem'}}>Location</h4>
              <p style={{fontSize: '1rem'}}>{selectedJob.location || 'Not specified'}</p>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
              <h4 style={{fontSize: '0.95rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem'}}>Description</h4>
              <p style={{fontSize: '1rem', lineHeight: '1.6', color: '#333'}}>
                {selectedJob.description || 'No description available.'}
              </p>
            </div>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              paddingTop: '1.5rem',
              borderTop: '1px solid #eee'
            }}>
              <button 
                onClick={() => setSelectedJob(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  handleApply(selectedJob.jobId, selectedJob.title);
                  setSelectedJob(null);
                }}
                disabled={applying === selectedJob.jobId || appliedJobs.has(selectedJob.jobId)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: appliedJobs.has(selectedJob.jobId) ? '#888' : 'var(--accent-color)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: appliedJobs.has(selectedJob.jobId) ? 'not-allowed' : (applying === selectedJob.jobId ? 'wait' : 'pointer'),
                  fontSize: '0.95rem',
                  fontWeight: '600'
                }}
              >
                {applying === selectedJob.jobId ? 'Applying...' : appliedJobs.has(selectedJob.jobId) ? '✓ Applied' : 'Apply Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
