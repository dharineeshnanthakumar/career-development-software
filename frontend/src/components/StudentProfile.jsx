import React, { useState, useEffect } from 'react';

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ phone: '', cgpa: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  
  // State for CV upload
  const [cvFile, setCvFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchCv();
  }, []);

  const fetchCv = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/student/cv', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCvData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadCv = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/student/cv/download', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const fileName = cvData?.fileName || 'resume';
        const isPdf = fileName.toLowerCase().endsWith('.pdf');

        if (isPdf) {
          const previewWindow = window.open(url, '_blank', 'noopener,noreferrer');
          if (!previewWindow) {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            a.remove();
          }

          // Give the browser time to load the blob in the new tab before cleanup.
          window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
          return;
        }

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to download CV from server.');
      }
    } catch (err) {
      console.error("Error downloading", err);
      alert('Network error while trying to download CV.');
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/student/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
      } else {
        setError(data.message || 'Failed to load profile.');
      }
    } catch (err) {
      setError('Network error loading profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditForm({ phone: profile?.phone || '', cgpa: profile?.cgpa ?? '' });
    setIsEditing(true);
  };

  const handleProfileSave = async () => {
    setSavingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: profile.name,
        rollNumber: profile.rollNumber,
        department: profile.department,
        graduationYear: profile.graduationYear,
        phone: editForm.phone,
        cgpa: parseFloat(editForm.cgpa) || 0
      };
      
      const res = await fetch('http://localhost:8080/api/student/profile', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProfile(data.data);
        setIsEditing(false);
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCvChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleCvUpload = async (e) => {
    e.preventDefault();
    if (!cvFile) return;

    setUploading(true);
    setUploadMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', cvFile);

      const res = await fetch('http://localhost:8080/api/student/cv/upload', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type manually when using FormData
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUploadMessage('CV uploaded successfully!');
        setCvFile(null);
        // Reset file input visually
        document.getElementById('cv-upload').value = '';
        fetchCv(); // refresh the visual CV indicator
      } else {
        setUploadMessage(data?.message || 'Failed to upload CV. Please use PDF, DOC, or DOCX file <= 2MB.');
      }
    } catch (err) {
      console.error('CV upload error', err);
      setUploadMessage('Network error during upload. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="tab-pane" style={{padding: '2rem'}}>Loading profile...</div>;
  if (error) return <div className="tab-pane" style={{padding: '2rem', color: '#f87171'}}>{error}</div>;

  return (
    <div className="tab-pane">
      <header className="dashboard-header">
        <div className="header-greeting">
          <h1>My Profile</h1>
          <p>Manage your account details and upload your CV.</p>
        </div>
      </header>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
        {/* Profile Info */}
        <div className="widget-card">
          <div className="widget-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <h2 style={{margin: 0}}>Personal Information</h2>
            {!isEditing ? (
              <button 
                onClick={handleEditClick} 
                style={{background: 'none', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold'}}>
                Edit
              </button>
            ) : (
              <div>
                <button 
                  onClick={() => setIsEditing(false)} 
                  style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', marginRight: '1rem'}}>
                  Cancel
                </button>
                <button 
                  onClick={handleProfileSave} 
                  disabled={savingProfile} 
                  style={{background: 'var(--accent-color)', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold'}}>
                  {savingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
            <div>
              <label style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Full Name</label>
              <div style={{fontSize: '1.05rem', marginTop: '0.25rem'}}>{profile?.name || 'N/A'}</div>
            </div>
            <div>
              <label style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Email Address</label>
              <div style={{fontSize: '1.05rem', marginTop: '0.25rem'}}>{profile?.email || 'N/A'}</div>
            </div>
            <div>
              <label style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Roll Number</label>
              <div style={{fontSize: '1.05rem', marginTop: '0.25rem'}}>{profile?.rollNumber || 'N/A'}</div>
            </div>
            <div>
              <label style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Department</label>
              <div style={{fontSize: '1.05rem', marginTop: '0.25rem'}}>{profile?.department || 'N/A'}</div>
            </div>
            <div>
              <label style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Graduation Year</label>
              <div style={{fontSize: '1.05rem', marginTop: '0.25rem'}}>{profile?.graduationYear || 'N/A'}</div>
            </div>
            <div>
              <label style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>CGPA</label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={editForm.cgpa}
                  onChange={(e) => setEditForm({...editForm, cgpa: e.target.value})}
                  style={{width: '100%', padding: '0.6rem', marginTop: '0.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--accent-color)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '1rem'}}
                  placeholder="Enter CGPA"
                />
              ) : (
                <div style={{fontSize: '1.05rem', marginTop: '0.25rem'}}>{profile?.cgpa ?? 'N/A'}</div>
              )}
            </div>
            <div>
              <label style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>Phone</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  style={{width: '100%', padding: '0.6rem', marginTop: '0.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--accent-color)', borderRadius: '4px', color: 'var(--text-main)', fontSize: '1rem'}}
                  placeholder="Enter phone number"
                />
              ) : (
                <div style={{fontSize: '1.05rem', marginTop: '0.25rem'}}>{profile?.phone || 'N/A'}</div>
              )}
            </div>
          </div>
        </div>

        {/* CV Upload */}
        <div className="widget-card">
          <div className="widget-header">
            <h2>Resume / CV</h2>
          </div>
          
          {cvData ? (
            <div style={{
              padding: '1rem', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '8px', 
              marginBottom: '1rem',
            }}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <strong style={{display: 'block', fontSize: '1.05rem', color: 'var(--accent-color)', marginBottom: '0.25rem'}}>{cvData.fileName}</strong>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem'}}>
                    Uploaded: {new Date(cvData.uploadedAt).toLocaleDateString()} • {(cvData.fileSize / 1024).toFixed(1)} KB
                  </div>
                  {cvData.filePath && (
                    <div style={{fontSize: '0.82rem', color: 'var(--text-muted)'}}>  
                    </div>
                  )}
                </div>
                <button 
                  type="button" 
                  onClick={handleDownloadCv}
                  style={{
                    background: 'none',
                    border: '1px solid var(--accent-color)',
                    color: 'var(--accent-color)',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}>
                  {cvData.fileName?.toLowerCase().endsWith('.pdf') ? 'View File' : 'Download File'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem'}}>
              No active CV on file. Please upload one below.
            </div>
          )}
          
          <form onSubmit={handleCvUpload} style={{display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)'}}>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Upload a new resume (PDF/DOCX) to overwrite your current one.</p>
            
            <input 
              type="file" 
              id="cv-upload"
              accept=".pdf,.doc,.docx" 
              onChange={handleCvChange}
              style={{
                padding: '1rem',
                border: '1px dashed var(--card-border)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.02)',
                color: 'var(--text-main)',
                width: '100%'
              }}
            />

            {cvFile && (
              <div style={{padding: '0.75rem', border: '1px solid var(--card-border)', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-main)'}}>
                <strong>Selected file:</strong> {cvFile.name} ({(cvFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
            
            <button 
              type="submit" 
              className="apply-btn"
              disabled={!cvFile || uploading}
              style={{opacity: (!cvFile || uploading) ? 0.5 : 1, cursor: (!cvFile || uploading) ? 'not-allowed' : 'pointer'}}
            >
              {uploading ? 'Uploading...' : 'Upload CV'}
            </button>
            
            {uploadMessage && (
              <div style={{padding: '0.75rem', marginTop: '0.5rem', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', fontSize: '0.9rem'}}>
                {uploadMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
