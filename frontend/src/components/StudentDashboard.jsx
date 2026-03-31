import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';
import StudentOverview from './StudentOverview';
import StudentJobs from './StudentJobs';
import StudentApplications from './StudentApplications';
import StudentProfile from './StudentProfile';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role?.toLowerCase() !== 'student') {
      navigate('/');
      return;
    } 
    
    setUser({ name: 'Student Viewer' });

    const fetchData = async () => {
      try {
        const jobsRes = await fetch('http://localhost:8080/api/student/jobs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const jobsData = await jobsRes.json();
        if (jobsData.success && jobsData.data) {
          setJobs(jobsData.data);
        }

        const appsRes = await fetch('http://localhost:8080/api/student/applications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const appsData = await appsRes.json();
        if (appsData.success && appsData.data) {
          setApplications(appsData.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/');
  };

  if (!user) return <div className="loading-screen">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SNU Career Portal</h2>
          <span className="badge">Student</span>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>Overview</button>
          <button className={`nav-item ${activeTab === 'Jobs' ? 'active' : ''}`} onClick={() => setActiveTab('Jobs')}>Search Jobs</button>
          <button className={`nav-item ${activeTab === 'Applications' ? 'active' : ''}`} onClick={() => setActiveTab('Applications')}>Applications</button>
          <button className={`nav-item ${activeTab === 'Profile' ? 'active' : ''}`} onClick={() => setActiveTab('Profile')}>My Profile</button>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {activeTab === 'Overview' && <StudentOverview user={user} applications={applications} jobs={jobs} loadingData={loadingData} />}
        {activeTab === 'Jobs' && <StudentJobs jobs={jobs} loadingData={loadingData} />}
        {activeTab === 'Applications' && <StudentApplications applications={applications} loadingData={loadingData} />}
        {activeTab === 'Profile' && <StudentProfile />}
      </main>
    </div>
  );
}
