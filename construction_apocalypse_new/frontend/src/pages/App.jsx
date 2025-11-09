import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import ShiftTable from "../components/shifttable";
import ProjectList from "../components/projectlist";
import ProtectedRoute from "../components/ProtectedRoute";
import { authAPI } from "../utils/api";
import "../styles/index.css";
import Pay from "./pay";
import Profile from "./profile";
import Projects from "./projects";
import Login from "./Login";
import Register from "./Register";

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check authentication status whenever route changes
    setIsAuthenticated(authAPI.isAuthenticated());
    
    // Listen for storage changes (when login happens in another tab/window)
    const handleStorageChange = () => {
      setIsAuthenticated(authAPI.isAuthenticated());
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [location]);

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="links">
        <ul>
          <li>
            <div className="logo">
              <Link to="/">Home</Link>
            </div>
          </li>
          {isAuthenticated ? (
            <>
              <li><Link to="/pay">Pay</Link></li>
              <li><Link to="/profile">Profile</Link></li>
              <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
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
          <>
            <ShiftTable /><ProjectList />
          </>
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
      </Routes>
    </Router>
  );
}

export default App;
