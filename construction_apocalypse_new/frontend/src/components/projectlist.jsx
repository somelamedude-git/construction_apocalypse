import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { projectsAPI, authAPI } from "../utils/api";

export default function ProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  // Fetch projects from backend API
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authAPI.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        fetchProjects();
      } else {
        setProjects([]);
        setLoading(false);
      }
    };

    checkAuth();
    
    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check periodically for auth changes
    const interval = setInterval(checkAuth, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectsAPI.getProjects();
      // Assuming the API returns { success: true, project_ids: [...] }
      if (response.success && response.project_ids) {
        setProjects(response.project_ids.map(id => ({ id })));
      } else {
        setProjects([]);
      }
    } catch (err) {
      // If not authenticated, don't show error
      if (err.message && err.message.includes('token')) {
        setProjects([]);
      } else {
        setError(err.message || "Failed to fetch projects");
        console.error("Error fetching projects:", err);
        setProjects([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInfo = (projectId) => {
    navigate(`/items/${projectId}`);
  };


  // If not logged in, show the same structure but with a single placeholder item
  // so the layout stays identical to the logged-in view (no project rows yet).
  if (!isAuthenticated) {
    return (
      <div className="projectlist">
        <h2>My Projects</h2>
        <ul>
          <li style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>
            You must be logged in to view projects. Please log in.
          </li>
        </ul>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="projectlist">
        <h2>My Projects</h2>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="projectlist">
      <h2>My Projects</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {projects.length === 0 && !error && (
        <p>You are not currently assigned to any projects.</p>
      )}
      {projects.length > 0 && (
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <button
                onClick={() => handleInfo(project.id)}
              >
              Project ID: {project.id}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
