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

  const [activeTab, setActiveTab] = useState('Companies');
  const [showCompaniesDropdown, setShowCompaniesDropdown] = useState(false);
  const [showFeedbacksDropdown, setShowFeedbacksDropdown] = useState(false);
  const [activeCompanyOption, setActiveCompanyOption] = useState('Pending Companies');
  const [activeFeedbackOption, setActiveFeedbackOption] = useState('Company Feedbacks');
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
  const [jobSearch, setJobSearch] = useState('');
  const [jobFilters, setJobFilters] = useState({
    status: '',
    company: ''
  });
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationFilters, setApplicationFilters] = useState({
    status: '',
    company: ''
  });
  const [companyFeedbackSearch, setCompanyFeedbackSearch] = useState('');
  const [studentFeedbackSearch, setStudentFeedbackSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const menuItems = [
    "Companies",
    "Jobs",
    "Students",
    "Applications",
    "Feedbacks"
  ];

  const companyOptions = ["Pending Companies", "All Companies"];

  const feedbackOptions = ["Company Feedbacks", "Student Feedbacks"];

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
      setShowFeedbacksDropdown(false);
    } else if (item === "Feedbacks") {
      setShowFeedbacksDropdown(prev => !prev);
      setShowCompaniesDropdown(false);
    } else {
      setShowCompaniesDropdown(false);
      setShowFeedbacksDropdown(false);
    }
  };

  const handleCompanyOptionClick = (option) => {
    setActiveCompanyOption(option);
    setActiveTab('Companies');
    setShowCompaniesDropdown(true);
    setError(null);
  };

  const handleFeedbackOptionClick = (option) => {
    setActiveFeedbackOption(option);
    setActiveTab('Feedbacks');
    setShowFeedbacksDropdown(true);
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

  const handleJobFilterChange = (field, value) => {
    setJobFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetJobFilters = () => {
    setJobSearch('');
    setJobFilters({ status: '', company: '' });
  };

  const getFilteredJobs = () => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
                           job.companyName.toLowerCase().includes(jobSearch.toLowerCase()) ||
                           job.location.toLowerCase().includes(jobSearch.toLowerCase());
      const matchesStatus = jobFilters.status === '' || job.status === jobFilters.status;
      const matchesCompany = jobFilters.company === '' || job.companyName === jobFilters.company;
      
      return matchesSearch && matchesStatus && matchesCompany;
    });
  };

  const handleApplicationFilterChange = (field, value) => {
    setApplicationFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetApplicationFilters = () => {
    setApplicationSearch('');
    setApplicationFilters({ status: '', company: '' });
  };

  const getFilteredApplications = () => {
    return applications.filter(app => {
      const matchesSearch = app.studentName.toLowerCase().includes(applicationSearch.toLowerCase()) ||
                           app.jobTitle.toLowerCase().includes(applicationSearch.toLowerCase()) ||
                           app.companyName.toLowerCase().includes(applicationSearch.toLowerCase());
      const matchesStatus = applicationFilters.status === '' || app.status === applicationFilters.status;
      const matchesCompany = applicationFilters.company === '' || app.companyName === applicationFilters.company;
      
      return matchesSearch && matchesStatus && matchesCompany;
    });
  };

  const getFilteredCompanyFeedback = () => {
    return companyFeedback.filter(feedback => {
      const matchesSearch = (feedback.companyName?.toLowerCase().includes(companyFeedbackSearch.toLowerCase()) || '') ||
                           (feedback.jobTitle?.toLowerCase().includes(companyFeedbackSearch.toLowerCase()) || '') ||
                           (feedback.comments?.toLowerCase().includes(companyFeedbackSearch.toLowerCase()) || '');
      return matchesSearch;
    });
  };

  const getFilteredStudentFeedback = () => {
    return studentFeedback.filter(feedback => {
      const matchesSearch = (feedback.studentName?.toLowerCase().includes(studentFeedbackSearch.toLowerCase()) || '') ||
                           (feedback.companyName?.toLowerCase().includes(studentFeedbackSearch.toLowerCase()) || '') ||
                           (feedback.comments?.toLowerCase().includes(studentFeedbackSearch.toLowerCase()) || '');
      return matchesSearch;
    });
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
      const filteredJobs = getFilteredJobs();
      const uniqueCompanies = [...new Set(jobs.map(job => job.companyName))];
      const uniqueStatuses = [...new Set(jobs.map(job => job.status))];

      return (
        <div className="jobs-content">
          <h2>All Jobs</h2>

          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search by job title, company, or location..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
              />
            </div>

            <div className="filter-section">
              <div className="filter-field">
                <label>Status</label>
                <select 
                  value={jobFilters.status} 
                  onChange={(e) => handleJobFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label>Company</label>
                <select 
                  value={jobFilters.company} 
                  onChange={(e) => handleJobFilterChange('company', e.target.value)}
                >
                  <option value="">All Companies</option>
                  {uniqueCompanies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              <button className="reset-btn" onClick={resetJobFilters}>Reset Filters</button>
            </div>
          </div>

          {loading && <div className="empty-box">Loading jobs...</div>}
          {error && <div className="error-box">{error}</div>}

          {!loading && !error && filteredJobs.length === 0 && (
            <div className="empty-box">{jobs.length === 0 ? 'No jobs found' : 'No jobs match your filters'}</div>
          )}

          {!loading && !error && filteredJobs.length > 0 && (
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
                  {filteredJobs.map(job => (
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
              <div className="result-count">Showing {filteredJobs.length} of {jobs.length} jobs</div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'Applications') {
      const filteredApplications = getFilteredApplications();
      const uniqueAppCompanies = [...new Set(applications.map(app => app.companyName))];
      const uniqueAppStatuses = [...new Set(applications.map(app => app.status))];

      return (
        <div className="applications-content">
          <h2>All Applications</h2>

          {/* Search and Filter Section */}
          <div className="search-filter-section">
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Search by student name, job title, or company..."
                value={applicationSearch}
                onChange={(e) => setApplicationSearch(e.target.value)}
              />
            </div>

            <div className="filter-section">
              <div className="filter-field">
                <label>Status</label>
                <select 
                  value={applicationFilters.status} 
                  onChange={(e) => handleApplicationFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {uniqueAppStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label>Company</label>
                <select 
                  value={applicationFilters.company} 
                  onChange={(e) => handleApplicationFilterChange('company', e.target.value)}
                >
                  <option value="">All Companies</option>
                  {uniqueAppCompanies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>

              <button className="reset-btn" onClick={resetApplicationFilters}>Reset Filters</button>
            </div>
          </div>

          {loading && <div className="empty-box">Loading applications...</div>}
          {error && <div className="error-box">{error}</div>}

          {!loading && !error && filteredApplications.length === 0 && (
            <div className="empty-box">{applications.length === 0 ? 'No applications found' : 'No applications match your filters'}</div>
          )}

          {!loading && !error && filteredApplications.length > 0 && (
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
                  {filteredApplications.map(app => (
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
              <div className="result-count">Showing {filteredApplications.length} of {applications.length} applications</div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'Feedbacks') {
      if (activeFeedbackOption === 'Company Feedbacks') {
        const filteredCompanyFeedback = getFilteredCompanyFeedback();

        return (
          <div className="feedbacks-content">
            <h2>Feedback Management - Company Feedbacks</h2>

            <div className="search-filter-section">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Search by company, job title, or comments..."
                  value={companyFeedbackSearch}
                  onChange={(e) => setCompanyFeedbackSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="feedback-section">
              {loading && <div className="empty-box">Loading company feedback...</div>}
              {error && <div className="error-box">{error}</div>}

              {!loading && !error && filteredCompanyFeedback.length === 0 && (
                <div className="empty-box">{companyFeedback.length === 0 ? 'No company feedback found' : 'No company feedback matches your search'}</div>
              )}

              {!loading && !error && filteredCompanyFeedback.length > 0 && (
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
                      {filteredCompanyFeedback.map(feedback => (
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
                  <div className="result-count">Showing {filteredCompanyFeedback.length} of {companyFeedback.length} company feedbacks</div>
                </div>
              )}
            </div>
          </div>
        );
      } else {
        const filteredStudentFeedback = getFilteredStudentFeedback();

        return (
          <div className="feedbacks-content">
            <h2>Feedback Management - Student Feedbacks</h2>

            <div className="search-filter-section">
              <div className="search-box">
                <input 
                  type="text" 
                  placeholder="Search by student, company, or comments..."
                  value={studentFeedbackSearch}
                  onChange={(e) => setStudentFeedbackSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="feedback-section">
              {loading && <div className="empty-box">Loading student feedback...</div>}
              {error && <div className="error-box">{error}</div>}

              {!loading && !error && filteredStudentFeedback.length === 0 && (
                <div className="empty-box">{studentFeedback.length === 0 ? 'No student feedback found' : 'No student feedback matches your search'}</div>
              )}

              {!loading && !error && filteredStudentFeedback.length > 0 && (
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
                      {filteredStudentFeedback.map(feedback => (
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
                  <div className="result-count">Showing {filteredStudentFeedback.length} of {studentFeedback.length} student feedbacks</div>
                </div>
              )}
            </div>
          </div>
        );
      }
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
                  {(item === 'Companies' || item === 'Feedbacks') && (
                    <span className={`arrow ${(item === 'Companies' && showCompaniesDropdown) || (item === 'Feedbacks' && showFeedbacksDropdown) ? 'open' : ''}`}>▼</span>
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

                {item === 'Feedbacks' && showFeedbacksDropdown && (
                  <div className="dropdown">
                    {feedbackOptions.map(option => (
                      <button
                        key={option}
                        className={`dropdown-item ${activeFeedbackOption === option ? 'active' : ''}`}
                        onClick={() => handleFeedbackOptionClick(option)}
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