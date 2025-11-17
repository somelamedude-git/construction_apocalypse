import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI, managerAPI } from "../utils/api";
import "../styles/login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authAPI.isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      if (response.success) {
        window.dispatchEvent(new Event('storage'));
        
        // Check if user is a manager and redirect accordingly
        try {
          const roleResponse = await managerAPI.checkRole();
          if (roleResponse.success && roleResponse.is_manager) {
            navigate("/manager/dashboard");
          } else {
            navigate("/");
          }
        } catch (roleErr) {
          // If role check fails, default to regular user home
          navigate("/");
        }
      } else {
        setError(response.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="login-button">
            {loading ? "Logging in..." : "Login"}
          </button>
          <div style={{ textAlign: 'center', marginTop: '15px' }}>
            <Link to="/register" style={{ color: '#4CAF50', textDecoration: 'none' }}>
              Don't have an account? Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

