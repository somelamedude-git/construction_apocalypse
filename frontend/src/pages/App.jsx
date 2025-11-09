import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ShiftTable from "../components/shifttable";
import ProjectList from "../components/projectlist";
import "../styles/index.css";
import Pay from "./pay";
import Profile from "./profile";
import Projects from "./projects";

function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="links">
          <ul>
            <li>
              <div className="logo">
                <Link to="/">Home</Link>
              </div>
            </li>
            <li><Link to="/pay">Pay</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>
      </nav>

      <Routes>
        <Route path="/" element=
        {
          <>
          <ShiftTable /><ProjectList />
          </>
        } />
        <Route path="/pay" element={<Pay/>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/items/:id" element={<Projects/>} />
      </Routes>
    </Router>
  );
}

export default App;
