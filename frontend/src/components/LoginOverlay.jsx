import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginOverlay.css';

export default function LoginOverlay({ role, onClose }) {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    username: '', // for login
    email: '', // for register
    password: '',
    name: '',
    rollNumber: '',
    department: '',
    graduationYear: '',
    phone: '',
    // Company fields
    industry: '',
    website: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: ''
  });

  // Reset state when role changes or modal opens
  useEffect(() => {
    setIsRegistering(false);
    setError(null);
    setSuccess(null);
    setFormData({
      username: '', email: '', password: '', name: '', 
      rollNumber: '', department: '', graduationYear: '', phone: '',
      industry: '', website: '', contactPerson: '', contactEmail: '', contactPhone: ''
    });
  }, [role]);

  if (!role) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleMode = () => {
    setIsRegistering(!isRegistering);
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.username, // mapping form input field named 'username' to 'email' field in API
          password: formData.password
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Login successful!');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('role', role);
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('A network error occurred connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let payload;
    let endpoint;

    if (role === 'Student') {
      payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        rollNumber: formData.rollNumber,
        department: formData.department,
        graduationYear: parseInt(formData.graduationYear),
        phone: formData.phone
      };
      endpoint = 'http://localhost:8080/api/auth/register/student';
    } else if (role === 'Company') {
      payload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        industry: formData.industry,
        website: formData.website,
        contactPerson: formData.contactPerson,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone
      };
      endpoint = 'http://localhost:8080/api/auth/register/company';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Registration successful! You can now log in.');
        setTimeout(() => setIsRegistering(false), 2000);
      } else {
        setError(data.message || 'Failed to register.');
      }
    } catch (err) {
      setError('A network error occurred connecting to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`modal-overlay ${role ? 'active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        <button className="close-btn" onClick={onClose} aria-label="Close">&times;</button>
        
        <div className="modal-header">
          <h2>{isRegistering ? `${role} Registration` : `${role} Login`}</h2>
          <p>{isRegistering ? 'Create your new account' : 'Sign in to your account'}</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!isRegistering ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Username / Email</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            {role === 'Student' && (
              <div className="form-footer">
                <p>Don't have an account? <button type="button" onClick={handleToggleMode}>Register here</button></p>
              </div>
            )}
            {role === 'Company' && (
              <div className="form-footer">
                <p>Don't have an account? <button type="button" onClick={handleToggleMode}>Register here</button></p>
              </div>
            )}
          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            
            {role === 'Student' ? (
              <>
                <div className="input-group">
                  <label>Roll Number</label>
                  <input type="text" name="rollNumber" value={formData.rollNumber} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} required>
                    <option value="" disabled>Select Department</option>
                    <option value="B.Tech. Chemical Engineering">B.Tech. Chemical Engineering</option>
                    <option value="B.Tech. Civil Engineering">B.Tech. Civil Engineering</option>
                    <option value="B.Tech. Computer Science and Engineering">B.Tech. Computer Science and Engineering</option>
                    <option value="B.Tech. Electrical and Computer Engineering">B.Tech. Electrical and Computer Engineering</option>
                    <option value="B.Tech. Mechanical Engineering">B.Tech. Mechanical Engineering</option>
                    <option value="Bachelor of Design (B.Des.)">Bachelor of Design (B.Des.)</option>
                    <option value="B.Sc. (Research) Economics">B.Sc. (Research) Economics</option>
                    <option value="B.A. (Research) International Relations">B.A. (Research) International Relations</option>
                    <option value="B.Sc. (Research) Biotechnology">B.Sc. (Research) Biotechnology</option>
                    <option value="B.Sc. (Research) Chemistry">B.Sc. (Research) Chemistry</option>
                    <option value="B.Sc. (Research) Mathematics">B.Sc. (Research) Mathematics</option>
                    <option value="B.Sc. (Research) Physics">B.Sc. (Research) Physics</option>
                    <option value="Bachelor of Management Studies (BMS)">Bachelor of Management Studies (BMS)</option>
                  </select>
                </div>
                <div style={{display: 'flex', gap: '1rem'}}>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Grad. Year</label>
                    <input type="number" name="graduationYear" value={formData.graduationYear} onChange={handleChange} required min="2000" max="2100"/>
                  </div>
                  <div className="input-group" style={{flex: 1}}>
                    <label>Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                  </div>
                </div>
              </>
            ) : role === 'Company' ? (
              <>
                <div className="input-group">
                  <label>Industry</label>
                  <input type="text" name="industry" value={formData.industry} onChange={handleChange} required placeholder="e.g., Technology, Finance, Healthcare" />
                </div>
                <div className="input-group">
                  <label>Website (Optional)</label>
                  <input type="url" name="website" value={formData.website} onChange={handleChange} placeholder="https://www.example.com" />
                </div>
                <div className="input-group">
                  <label>Contact Person</label>
                  <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Contact Email</label>
                  <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} required />
                </div>
                <div className="input-group">
                  <label>Contact Phone</label>
                  <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} required />
                </div>
              </>
            ) : null}
            
            <div className="form-actions">
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
            <div className="form-footer">
              <p>Already have an account? <button type="button" onClick={handleToggleMode}>Back to Login</button></p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
