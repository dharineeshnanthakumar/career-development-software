import React from 'react';

export default function StudentApplications({ applications, loadingData, onFeedback }) {
  return (
    <div className="tab-pane">
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>My Applications</h1>
          <p>Track the status of your submitted applications.</p>
        </div>
      </header>

      <div className="widget-card">
        {loadingData ? (
          <p style={{color: 'var(--text-muted)'}}>Loading applications...</p>
        ) : applications.length > 0 ? (
          <div style={{width: '100%', overflowX: 'auto'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
              <thead>
                <tr style={{borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)'}}>
                  <th style={{padding: '1rem', fontWeight: '500'}}>Job Title</th>
                  <th style={{padding: '1rem', fontWeight: '500'}}>Company</th>
                  <th style={{padding: '1rem', fontWeight: '500'}}>Date Applied</th>
                  <th style={{padding: '1rem', fontWeight: '500'}}>Status</th>
                  <th style={{padding: '1rem', fontWeight: '500'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.applicationId} style={{borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.3s'}}>
                    <td style={{padding: '1rem'}}>{app.jobTitle || 'Unknown Role'}</td>
                    <td style={{padding: '1rem'}}>{app.companyName || 'Unknown Company'}</td>
                    <td style={{padding: '1rem'}}>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</td>
                    <td style={{padding: '1rem'}}>
                      <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        backgroundColor: app.status === 'ACCEPTED' ? 'rgba(22, 163, 74, 0.2)' : 
                                         app.status === 'REJECTED' ? 'rgba(220, 38, 38, 0.2)' : 
                                         'rgba(0, 123, 255, 0.2)',
                        color: app.status === 'ACCEPTED' ? '#4ade80' : 
                               app.status === 'REJECTED' ? '#f87171' : 
                               '#60a5fa'
                      }}>
                        {app.status || 'PENDING'}
                      </span>
                    </td>
                    <td style={{padding: '1rem'}}>
                      <button
                        onClick={() => onFeedback(app.companyId)}
                        style={{
                          padding: '0.4rem 0.8rem',
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}
                      >
                        Give Feedback
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{color: 'var(--text-muted)'}}>You haven't submitted any applications yet.</p>
        )}
      </div>
    </div>
  );
}
