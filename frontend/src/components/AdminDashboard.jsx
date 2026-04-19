import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
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

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showCompaniesDropdown, setShowCompaniesDropdown] = useState(false);
  const [activeCompanyOption, setActiveCompanyOption] = useState('Pending Companies');
  const [companies, setCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companyFeedback, setCompanyFeedback] = useState([]);
  const [studentFeedback, setStudentFeedback] = useState([]);
  const [studentFilters, setStudentFilters] = useState({
    course: '',
    graduationYear: '',
    minCgpa: '',
    maxCgpa: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const menuItems = [
    "Dashboard",
    "Companies",
    "Jobs",
    "Students",
    "Applications",
    "Feedbacks",
    "Settings"
  ];

  const companyOptions = ["Pending Companies", "All Companies"];

  useEffect(() => {
    if (!validateUserRole('Admin')) {
      navigate('/');
      return;
    }

    if (activeTab === 'Companies') {
      loadCompanies();
    }
    if (activeTab === 'Students') {
      loadStudents();
    }
    if (activeTab === 'Jobs') {
      loadJobs();
    }
    if (activeTab === 'Applications') {
      loadApplications();
    }
    if (activeTab === 'Feedbacks') {
      loadCompanyFeedback();
      loadStudentFeedback();
    }
  }, [navigate, activeTab, activeCompanyOption, studentFilters]);

  const loadCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/admin/companies/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Sort companies by enrolledAt in descending order (latest first)
        const sortedCompanies = data.data.sort((a, b) => new Date(b.enrolledAt) - new Date(a.enrolledAt));

        if (activeCompanyOption === 'Pending Companies') {
          setCompanies(sortedCompanies.filter(c => c.verified === null));
        } else {
          setCompanies(sortedCompanies);
        }
      } else {
        setError(data.message || 'Failed to fetch companies');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (studentFilters.course) params.append('course', studentFilters.course);
      if (studentFilters.graduationYear) params.append('graduationYear', studentFilters.graduationYear);
      if (studentFilters.minCgpa) params.append('minCgpa', studentFilters.minCgpa);
      if (studentFilters.maxCgpa) params.append('maxCgpa', studentFilters.maxCgpa);

      const res = await fetch(`http://localhost:8080/api/admin/students/?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStudents(data.data);
      } else {
        setError(data.message || 'Failed to fetch students');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/admin/jobs/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setJobs(data.data);
      } else {
        setError(data.message || 'Failed to fetch jobs');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/admin/applications/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setApplications(data.data);
      } else {
        setError(data.message || 'Failed to fetch applications');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyFeedback = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/admin/feedback/company', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCompanyFeedback(data.data);
      } else {
        setError(data.message || 'Failed to fetch company feedback');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentFeedback = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/admin/feedback/student', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStudentFeedback(data.data);
      } else {
        setError(data.message || 'Failed to fetch student feedback');
      }
    } catch (e) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (item) => {
    setActiveTab(item);
    setError(null);

    if (item === "Companies") {
      setShowCompaniesDropdown(prev => !prev);
    } else {
      setShowCompaniesDropdown(false);
    }
  };

  const handleCompanyOptionClick = (option) => {
    setActiveCompanyOption(option);
    setActiveTab('Companies');
    setShowCompaniesDropdown(true);
    setError(null);
  };

  const handleVerify = async (companyId, approve) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/admin/companies/verify/${companyId}?approve=${approve}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        loadCompanies();
      } else {
        setError(data.message || 'Unable to update status');
      }
    } catch (e) {
      setError('Network error while updating status');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleStudentFilterChange = (field, value) => {
    setStudentFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetStudentFilters = () => {
    setStudentFilters({ course: '', graduationYear: '', minCgpa: '', maxCgpa: '' });
  };

  const renderMainContent = () => {
    if (activeTab === 'Students') {
      return (
        <div className="students-content">
          <h2>Students</h2>

          <div className="student-filter">
            <div className="filter-field">
              <label>Course</label>
              <input
                type="text"
                value={studentFilters.course}
                onChange={e => handleStudentFilterChange('course', e.target.value)}
                placeholder="Department / course"
              />
            </div>
            <div className="filter-field">
              <label>Graduation Year</label>
              <input
                type="number"
                min="1900"
                max="2100"
                value={studentFilters.graduationYear}
                onChange={e => handleStudentFilterChange('graduationYear', e.target.value)}
                placeholder="e.g. 2025"
              />
            </div>
            <div className="filter-field">
              <label>Min CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={studentFilters.minCgpa}
                onChange={e => handleStudentFilterChange('minCgpa', e.target.value)}
                placeholder="e.g. 7.5"
              />
            </div>
            <div className="filter-field">
              <label>Max CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={studentFilters.maxCgpa}
                onChange={e => handleStudentFilterChange('maxCgpa', e.target.value)}
                placeholder="e.g. 9.5"
              />
            </div>

            <div className="filter-actions">
              <button className="apply-filter-btn" onClick={loadStudents}>Apply</button>
              <button className="reset-filter-btn" onClick={() => { resetStudentFilters(); loadStudents(); }}>Reset</button>
            </div>
          </div>

          {loading && <div className="empty-box">Loading students...</div>}
          {error && <div className="error-box">{error}</div>}

          {!loading && !error && students.length === 0 && (
            <div className="empty-box">No students found</div>
          )}

          {!loading && !error && students.length > 0 && (
            <div className="student-list">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Roll Number</th>
                    <th>Course</th>
                    <th>Graduation Year</th>
                    <th>CGPA</th>
                    <th>Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.studentId}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.rollNumber}</td>
                      <td>{student.department}</td>
                      <td>{student.graduationYear}</td>
                      <td>{student.cgpa ?? 'N/A'}</td>
                      <td>{student.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'Jobs') {
      return (
        <div className="jobs-content">
          <h2>All Jobs</h2>

          {loading && <div className="empty-box">Loading jobs...</div>}
          {error && <div className="error-box">{error}</div>}

          {!loading && !error && jobs.length === 0 && (
            <div className="empty-box">No jobs found</div>
          )}

          {!loading && !error && jobs.length > 0 && (
            <div className="job-list">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>CTC</th>
                    <th>Status</th>
                    <th>Deadline</th>
                    <th>Posted Date</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map(job => (
                    <tr key={job.jobId}>
                      <td>{job.title}</td>
                      <td>{job.companyName}</td>
                      <td>{job.location}</td>
                      <td>{job.ctc}</td>
                      <td>{job.status}</td>
                      <td>{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</td>
                      <td>{new Date(job.postedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'Applications') {
      return (
        <div className="applications-content">
          <h2>All Applications</h2>

          {loading && <div className="empty-box">Loading applications...</div>}
          {error && <div className="error-box">{error}</div>}

          {!loading && !error && applications.length === 0 && (
            <div className="empty-box">No applications found</div>
          )}

          {!loading && !error && applications.length > 0 && (
            <div className="application-list">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Applied Date</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.applicationId}>
                      <td>{app.studentName}</td>
                      <td>{app.jobTitle}</td>
                      <td>{app.companyName}</td>
                      <td>
                        <span className={`status-${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td>{new Date(app.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'Feedbacks') {
      return (
        <div className="feedbacks-content">
          <h2>Feedback Management</h2>

          {/* Company Feedback Section */}
          <div className="feedback-section">
            <h3>Company Feedback</h3>
            {loading && <div className="empty-box">Loading company feedback...</div>}
            {error && <div className="error-box">{error}</div>}

            {!loading && !error && companyFeedback.length === 0 && (
              <div className="empty-box">No company feedback found</div>
            )}

            {!loading && !error && companyFeedback.length > 0 && (
              <div className="feedback-table">
                <table>
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Job Title</th>
                      <th>Rating</th>
                      <th>Comments</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyFeedback.map(feedback => (
                      <tr key={feedback.id}>
                        <td>{feedback.companyName || 'N/A'}</td>
                        <td>{feedback.jobTitle || 'N/A'}</td>
                        <td>
                          <span className={`rating rating-${feedback.rating}`}>
                            {feedback.rating}/5 ⭐
                          </span>
                        </td>
                        <td className="comments-cell">{feedback.comments}</td>
                        <td>{new Date(feedback.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Student Feedback Section */}
          <div className="feedback-section">
            <h3>Student Feedback</h3>
            {loading && <div className="empty-box">Loading student feedback...</div>}
            {error && <div className="error-box">{error}</div>}

            {!loading && !error && studentFeedback.length === 0 && (
              <div className="empty-box">No student feedback found</div>
            )}

            {!loading && !error && studentFeedback.length > 0 && (
              <div className="feedback-table">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Company</th>
                      <th>Rating</th>
                      <th>Comments</th>
                      <th>Submitted Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentFeedback.map(feedback => (
                      <tr key={feedback.id}>
                        <td>{feedback.studentName || 'N/A'}</td>
                        <td>{feedback.companyName || 'N/A'}</td>
                        <td>
                          <span className={`rating rating-${feedback.rating}`}>
                            {feedback.rating}/5 ⭐
                          </span>
                        </td>
                        <td className="comments-cell">{feedback.comments}</td>
                        <td>{new Date(feedback.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab !== 'Companies') {
      return (
        <div className="empty-box">
          <h2>{activeTab}</h2>
          <p>Coming soon...</p>
        </div>
      );
    }

    return (
      <div className="company-content">
        <h2>{activeCompanyOption}</h2>

        {loading && <div className="empty-box">Loading companies...</div>}
        {error && <div className="error-box">{error}</div>}

        {!loading && !error && companies.length === 0 && (
          <div className="empty-box">No companies to display</div>
        )}

        {!loading && !error && companies.length > 0 && (
          <div className="company-list">
            {companies.map(company => (
              <div key={company.companyId} className="company-item">
                <div className="company-details">
                  <h3>{company.name}</h3>
                  <p><b>Industry:</b> {company.industry}</p>
                  <p><b>Email:</b> {company.email}</p>
                  <p><b>Contact:</b> {company.contactPerson} / {company.contactPhone}</p>
                  <p><b>Status:</b> {
                    company.verified === null ? 'Pending' :
                    company.verified ? 'Approved' : 'Rejected'
                  }</p>
                </div>

                {activeCompanyOption === 'Pending Companies' && (
                  <div className="company-actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleVerify(company.companyId, true)}
                    >
                      Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => handleVerify(company.companyId, false)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container">

      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">

        <div className="sidebar-header">
          <h2>SNU Career Portal</h2>
          <span className="badge">Admin</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const isActive = activeTab === item;

            return (
              <div key={item}>
                <button
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleMenuClick(item)}
                >
                  <span>{item}</span>
                  {item === 'Companies' && (
                    <span className={`arrow ${showCompaniesDropdown ? 'open' : ''}`}>▼</span>
                  )}
                </button>

                {item === 'Companies' && showCompaniesDropdown && (
                  <div className="dropdown">
                    {companyOptions.map(option => (
                      <button
                        key={option}
                        className={`dropdown-item ${activeCompanyOption === option ? 'active' : ''}`}
                        onClick={() => handleCompanyOptionClick(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="dashboard-main">

        <div className="top-navbar">
          <h1>Admin Dashboard</h1>
        </div>

        <div className="dashboard-content">
          {renderMainContent()}
        </div>

      </main>

    </div>
  );
}