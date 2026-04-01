import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Dashboard');
  const [showCompaniesDropdown, setShowCompaniesDropdown] = useState(false);
  const [activeCompanyOption, setActiveCompanyOption] = useState('Pending Companies');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const menuItems = [
    "Dashboard",
    "Companies",
    "Jobs",
    "Students",
    "Applications",
    "Settings"
  ];

  const companyOptions = ["Pending Companies", "All Companies"];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role?.toLowerCase() !== 'admin') {
      navigate('/');
      return;
    }

    if (activeTab === 'Companies') {
      loadCompanies();
    }
  }, [navigate, activeTab, activeCompanyOption]);

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

  const renderMainContent = () => {
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