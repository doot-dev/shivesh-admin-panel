import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProjectById, updateProject } from "../features/projects/projectSlice";
import { fetchClients } from "../features/clients/clientsSlice";
import { Icon, ICON_NAMES } from "../components/icons";
import Button from "../components/ui/Button";
import LocationMap from "../components/ui/LocationMap";
import FullPageLoader from "../components/ui/FullPageLoader";
import EditProjectModal from "../components/modals/project/editProjectModal";
import AddProjectProductModal from "../components/modals/project/addProjectProductModal";

export default function ProjectsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct: productData = null, load } = useSelector(
    (state) => state.products
  );
  const { currentProject, loading } = useSelector((state) => state.project);
  const { list: clients = [] } = useSelector((state) => state.client);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  useEffect(() => {
    if (id) {
      dispatch(fetchProjectById(id));
      dispatch(fetchClients());
    }
  }, [dispatch, id]);

  if (loading) {
    return <FullPageLoader />;
  }

  if (!currentProject) {
    return (
      <div className="p-4 md:p-6 lg:p-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Project not found</p>
          <Button onClick={() => navigate("/projects")}>
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  // Find client details
  const client = clients.find(
    (c) => c.clientId === currentProject.client?.clientId
  );

  // Status badge styling
  const statusConfig = {
    active: {
      color: "#16A34A",
      backgroundColor: "#D1FAE5",
    },
    inactive: {
      color: "#DC2626",
      backgroundColor: "#FECACA",
    },
  };

  const status = currentProject.status?.toLowerCase() || "inactive";
  const statusStyle = statusConfig[status] || statusConfig.inactive;

  const handleUpdateProject = async (projectData) => {
    console.log("Updating project with data:", projectData);
    const resultAction = await dispatch(updateProject(projectData));
    if (updateProject.fulfilled.match(resultAction)) {
      setIsEditMode(false);
      dispatch(fetchProjectById(id)); // Refresh the data
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">
            Project
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            View and manage projects
          </p>
        </div>
        <Button
          onClick={() => setIsEditMode(true)}
          leftIcon={ICON_NAMES.EDIT}
          variant="secondary"
          size="md"
          className="px-4 py-2 md:px-6 md:py-2.5"
        >
          Edit
        </Button>
      </div>

      {/* Project Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Project Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Project Name */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Project name</p>
            <p className="text-base font-medium text-gray-900">
              {currentProject.projectName || "N/A"}
            </p>
          </div>

          {/* Client Name */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Client name</p>
            <p className="text-base font-medium text-gray-900">
              {client?.ownerName || currentProject.client?.clientId || "N/A"}
            </p>
          </div>

          {/* Site Name */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Site name</p>
            <p className="text-base font-medium text-gray-900">
              {currentProject.siteName || "N/A"}
            </p>
          </div>

          {/* Project Manager */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Project Manager</p>
            <p className="text-base font-medium text-gray-900">
              {currentProject.projectManager || "N/A"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Location</p>
            <p className="text-base font-medium text-gray-900">
              {currentProject.projectLocation || "N/A"}
            </p>
          </div>

          {/* Status */}
          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{
                color: statusStyle.color,
                backgroundColor: statusStyle.backgroundColor,
              }}
            >
              • {currentProject.status || "Inactive"}
            </span>
          </div>
        </div>
      </div>


      {/* Product Details Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Product Details
          </h2>
          <Button
            onClick={() => {
              setShowAddProductModal(true);
              console.log("Add product");
            }}
            leftIcon={ICON_NAMES.PLUS}
            variant="primary"
            size="md"
            className="px-4 py-2"
          >
            Add
          </Button>
        </div>
        <div className="text-center py-8 text-gray-500">
          No products added yet
        </div>
      </div>

      {/* Edit Project Modal */}
      <EditProjectModal
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
        onSubmit={handleUpdateProject}
        clients={clients}
        project={currentProject}
      />
      <AddProjectProductModal isOpen={showAddProductModal} productData={productData} onClose={() => setShowAddProductModal(false)} />
    </div>
  );
}

