import React from "react";
import { useParams } from "react-router-dom";

export default function ProjectsDetails() {
  const { id } = useParams();
  console.log("Project ID:", id);
  return <div>projectsDetails</div>;
}
