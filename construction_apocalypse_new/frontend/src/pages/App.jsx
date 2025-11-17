import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ShiftTable from "../components/shifttable";
import ProjectList from "../components/projectlist";
import ProtectedRoute from "../components/ProtectedRoute";
import { authAPI, managerAPI } from "../utils/api";
import "../styles/index.css";
import Pay from "./pay";
import Profile from "./profile";
import Projects from "./projects";
import Login from "./Login";
import Register from "./Register";
import ManagerDashboard from "./ManagerDashboard";
import SelectProject from "./SelectProject";
import CreateGroup from "./CreateGroup";
import ViewGroups from "./ViewGroups";
import AvailableEmployees from "./AvailableEmployees";
import ApplyForProject from "./ApplyForProject";
import GroupMembers from "./GroupMembers";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status whenever route changes
    const checkAuth = async () => {
      const authenticated = authAPI.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        // Check if user is a manager
        try {
          const response = await managerAPI.checkRole();
          if (response.success) {
            setIsManager(response.is_manager);
          }
        } catch (err) {
          // If check fails, assume not a manager
          setIsManager(false);
        }
      } else {
        setIsManager(false);
      }
    };
    
    checkAuth();
    
    // Listen for storage changes (when login happens in another tab/window)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]);

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setIsManager(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="links">
        <ul>
          <li>
            <div className="logo">
              <Link to={isManager ? "/manager/dashboard" : "/"}>Home</Link>
            </div>
          </li>
          {isAuthenticated ? (
            <>
              {isManager ? (
                <>
                  <li><Link to="/manager/dashboard">Dashboard</Link></li>
                  <li><Link to="/manager/apply-projects">Apply to Project</Link></li>
                  <li><Link to="/manager/groups">View Groups</Link></li>
                  <li><Link to="/manager/create-group">Create Group</Link></li>
                  <li><Link to="/manager/employees">Available Employees</Link></li>
                  <li><Link to="/group-members">Group Members</Link></li>
                  <li><Link to="/profile">Profile</Link></li>
                  <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/pay">Pay</Link></li>
                  <li><Link to="/group-members">Group Members</Link></li>
                  <li><Link to="/profile">Profile</Link></li>
                  <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
                </>
              )}
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <ShiftTable /><ProjectList />
          </ProtectedRoute>
        } />
        <Route path="/pay" element={
          <ProtectedRoute>
            <Pay />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/items/:id" element={<Projects/>} />
        {/* Manager routes */}
        <Route path="/manager/dashboard" element={
          <ProtectedRoute>
            <ManagerDashboard />
          </ProtectedRoute>
        } />
        <Route path="/manager/apply-projects" element={
          <ProtectedRoute>
            <ApplyForProject />
          </ProtectedRoute>
        } />
        <Route path="/manager/select-project" element={
          <ProtectedRoute>
            <SelectProject />
          </ProtectedRoute>
        } />
        <Route path="/manager/create-group" element={
          <ProtectedRoute>
            <CreateGroup />
          </ProtectedRoute>
        } />
        <Route path="/manager/groups" element={
          <ProtectedRoute>
            <ViewGroups />
          </ProtectedRoute>
        } />
        <Route path="/manager/employees" element={
          <ProtectedRoute>
            <AvailableEmployees />
          </ProtectedRoute>
        } />
        <Route path="/manager/groups/:groupId/members" element={
          <ProtectedRoute>
            <GroupMembers />
          </ProtectedRoute>
        } />
        <Route path="/group-members" element={
          <ProtectedRoute>
            <GroupMembers />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
