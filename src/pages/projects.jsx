import { useEffect, useState, useCallback } from "react";
import { Icon, ICON_NAMES } from "../components/icons";
import Button from "../components/ui/Button";
import { Table } from "../components/ui";
import AddProjectModal from "../components/modals/project/addProjectModal";
import { useDispatch, useSelector } from "react-redux";
import {
  addProjectDetails,
  fetchProjects,
} from "../features/projects/projectSlice";
import { fetchClients } from "../features/clients/clientsSlice";

const ProjectsPage = () => {
  const dispatch = useDispatch();
  const { list: projectsData = [], loading } = useSelector(
    (state) => state.project,
  ); // Replace with actual selector
  const { list: clients = [] } = useSelector((state) => state.client);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const refreshProjects = useCallback(() => {
    dispatch(fetchProjects());
  }, [dispatch]);
  const refreshClients = useCallback(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    refreshProjects();
    refreshClients();
  }, [refreshProjects, refreshClients]);

  const columns = [
    { key: "sNo", header: "S.No" },
    { key: "projectName", header: "Project Name" },
    { key: "clientName", header: "Client Name" },
    { key: "projectManager", header: "Project Manager" },
    {
      key: "status",
      header: "Status",
      type: "badge",
      badgeConfig: {
        Active: {
          color: "#16A34A",
          backgroundColor: "#D1FAE5",
        },
        Inactive: {
          color: "#DC2626",
          backgroundColor: "#FECACA",
        },
      },
    },
  ];

  const actions = [
    {
      text: "Edit",
      onClick: (project) => console.log("Edit", project),
      textColor: "var(--color-primary)",
    },
    {
      text: "Delete",
      onClick: (project) => console.log("Delete", project),
      textColor: "var(--color-error)",
    },
  ];
  console.log("projectsData", projectsData);

  const projectsWithClientName = projectsData.map((project, index) => {
    const client = clients.find(
      (c) =>
        c.clientId === project.clientId ||
        c._id === project.clientId ||
        c.id === project.clientId,
    );

    return {
      ...project,
      sNo: (index + 1).toString().padStart(2, "0"),
      clientName: client?.companyName || client?.name || "—",
    };
  });

  const filteredProjects = projectsWithClientName.filter((project) => {
    const s = searchTerm.toLowerCase();
    return (
      !s ||
      project.projectName?.toLowerCase().includes(s) ||
      project.clientName?.toLowerCase().includes(s) ||
      project.projectManager?.toLowerCase().includes(s)
    );
  });

  const handleAddProject = (projectData) => {
    console.log("Adding project:", projectData);

    const resultAction = dispatch(addProjectDetails(projectData));
    console.log("resultAction", resultAction);
    if (addProjectDetails.fulfilled.match(resultAction)) {
      refreshProjects();
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">
          Project
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          View and manage projects
        </p>
      </div>

      {/* Search + Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="relative flex-1 max-w-full sm:max-w-[60%] md:max-w-[40%]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
          </div>
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          leftIcon={ICON_NAMES.PLUS}
          variant="primary"
          size="md"
          className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 text-sm md:text-base whitespace-nowrap"
        >
          Add Project
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <Table
              data={filteredProjects}
              columns={columns}
              actions={actions}
              itemsPerPage={10}
              emptyMessage="No projects found"
            />
          </div>
        </div>
      </div>

      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProject}
        clients={clients}
      />
    </div>
  );
};

export default ProjectsPage;
