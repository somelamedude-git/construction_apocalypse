import React from "react";
import { useParams } from "react-router-dom";
import "../styles/projects.css";

function Projects() {

  const projects = [
    { id: "1", buildingId: "A12", start: "2025-01-10", end: "2025-02-15", hours: 8, shifts: 10, manager: "John Doe", employees: 5, location: "Office A" },
    { id: "2", buildingId: "B09", start: "2025-03-05", end: "2025-04-12", hours: 7, shifts: 8, manager: "Jane Smith", employees: 4, location: "Office B" },
    { id: "3", buildingId: "C33", start: "2025-05-20", end: "2025-06-30", hours: 6, shifts: 12, manager: "Mark Lee", employees: 6, location: "Office C" },
  ];

  const {id} = useParams();
  const project = projects.find(p => p.id === id);

  if (!project) return <h2>Item not found!</h2>

  return (
    <div className="projects">
      <p>ID: <span>{project.id}</span></p>
      <p>Building ID: <span>{project.buildingId}</span></p>
      <p>Start Date: <span>{project.start}</span></p>
      <p>End Date: <span>{project.end}</span></p>
      <p>Hours per Shift: <span>{project.hours}</span></p>
      <p>Shifts Required: <span>{project.shifts}</span></p>
      <p>Manager: <span>{project.manager}</span></p>
      <p>Employees per Shift: <span>{project.employees}</span></p>
      <p>Location: <span>{project.location}</span></p>
    </div>
  );
}

export default Projects;