import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProjectList() {
  const [projects, setProjects] = useState([
    { id: "1"},
    { id: "2"},
    { id: "3"},
  ]);

  const navigate = useNavigate();

  const handleInfo = (projectId) => {
    navigate(`/items/${projectId}`);
  };


  return (
    <div className="projectlist">
      <h2>Projects</h2>
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
    </div>
  );
}
