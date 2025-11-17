const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables
const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// Import controllers
const { registerUser, loginUser } = require('./controllers/user.login');
const { getUserProfile, getUserPay } = require('./controllers/user.controller');
const { fetchProject, show_project_details } = require('./controllers/projects.controller');
const { show_upcoming_shifts, getTodayShifts, check_in, checkout } = require('./controllers/shifts.controller');
const { fetch_upcoming_projects, select_project, create_project_group, fetch_employees, add_employee_in_group, check_manager_role, get_available_projects, fetch_groups, fetch_group_members } = require('./controllers/manager.controller');

// Import middleware
const { authenticateToken } = require('./middleware/auth.middleware');

// Routes
// Authentication routes (public - no auth required)
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);

// Protected routes (require authentication)
// User routes
app.get('/api/user/profile', authenticateToken, getUserProfile);
app.get('/api/user/pay', authenticateToken, getUserPay);

// Project routes (for employees)
app.get('/api/projects', authenticateToken, fetchProject);
app.post('/api/projects/details', authenticateToken, show_project_details);

// Shift routes
app.get('/api/shifts/upcoming', authenticateToken, show_upcoming_shifts);
app.get('/api/shifts/today', authenticateToken, getTodayShifts);
app.post('/api/shifts/check-in', authenticateToken, check_in);
app.post('/api/shifts/checkout', authenticateToken, checkout);

// Manager routes
app.get('/api/manager/check-role', authenticateToken, check_manager_role);
app.get('/api/manager/projects', authenticateToken, fetch_upcoming_projects);
app.get('/api/manager/available-projects', authenticateToken, get_available_projects);
app.post('/api/manager/select-project', authenticateToken, select_project);
app.post('/api/manager/create-group', authenticateToken, create_project_group);
app.get('/api/manager/employees', authenticateToken, fetch_employees);
app.post('/api/manager/add-employee', authenticateToken, add_employee_in_group);
app.post('/api/manager/group-members', authenticateToken, fetch_group_members);
app.get('/api/manager/groups', authenticateToken, fetch_groups);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
