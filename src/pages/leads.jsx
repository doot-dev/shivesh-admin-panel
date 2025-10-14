import React, { useEffect, useState } from "react";
import { Icon, ICON_NAMES } from "../components/icons";
import { Button, Table, Dropdown } from "../components/ui";
import { toast } from "react-toastify";
import FullPageLoader from "../components/ui/FullPageLoader";
import { useNavigate } from "react-router-dom";
import LeadsModal from "../components/modals/leads/leadsModal";
import DeleteModal from "../components/modals/leads/deleteModal";
const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const navigate = useNavigate();
  const mockLeads = [
    {
      id: 1,
      name: "John Doe",
      company: "ABC Company",
      phone: "123-456-7890",
      email: "0A2eA@example.com",
      requirement: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      source: "website",
      status: "Active",
      assignedTo: "John Doe",
    },
    {
      id: 2,
      name: "Jane Smith",
      company: "XYZ Company",
      phone: "987-654-3210",
      email: "0A2eA@example.com",
      requirement: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      source: "website",
      status: "Active",
      assignedTo: "John Doe",
    },
  ];

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    try {
      setLoading(true);
      // Simulate API
      setTimeout(() => {
        setLeads(mockLeads);
        setFilteredLeads(mockLeads);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error loading leads:", error);
      toast.error("Failed to load leads");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLeads(leads);
      return;
    }

    // Filter leads based on search term
    const filtered = leads.filter((lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLeads(filtered);
  }, [searchTerm, leads]);

  const handleAddLead = () => {
    setSelectedLead(null);
    setShowLeadsModal(true);
  };

  const handleEditLead = (lead) => {
    setSelectedLead(lead);
    setShowLeadsModal(true);
  };

  const handleLeadSubmit = (leadsData, mode) => {
    if (mode === "add") {
      setLeads((prev) => [...prev, leadsData]);
      toast.success("Lead added successfully");
    } else if (mode === "edit") {
      const updated = leads.map((lead) =>
        lead.id === leadsData.id ? leadsData : lead
      );
      setLeads(updated);
      toast.success("Lead updated successfully");
    }
    setShowLeadsModal(false);
  };

  const handleDeleteLead = (lead) => {
    setSelectedLead(lead);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setLeads((prev) => prev.filter((lead) => lead.id !== selectedLead.id));
    toast.success("Lead deleted successfully");
    setShowDeleteModal(false);
  };

  const handleViewLead = (lead) => {
    console.log("Viewing lead:", lead);
    navigate(`/leads/${lead.id}`);
  };

  const columns = [
    { key: "sNo", label: "S.No." },
    { key: "name", label: "Name" },
    { key: "company", label: "Company" },
    {
      key: "phone",
      label: "Contact",
      render: (leadContact) => {
        <div>
          <div className="font-semibold">{leadContact.phone}</div>
          <div className="text-sm text-gray-500">{leadContact.email}</div>
        </div>;
      },
    },

    { key: "requirement", label: "Requirement" },
    { key: "source", label: "Source" },
    {
      key: "status",
      label: "Status",
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
    { key: "assignedTo", label: "Assigned To" },
    { key: "actions", label: "Actions" },
  ];

  const actions = [
    {
      text: "View",
      onClick: handleViewLead,
      textColor: "var(--color-primary)",
      hoverBackgroundColor: "var(--color-primary-light)",
    },
    {
      text: "Edit",
      onClick: handleEditLead,
      textColor: "var(--color-success)",
      hoverBackgroundColor: "var(--color-success-light)",
    },
    {
      text: "Delete",
      onClick: handleDeleteLead,
      textColor: "var(--color-error)",
      hoverBackgroundColor: "var(--color-error-light)",
    },
  ];

  return (
    <>
      <FullPageLoader isVisible={loading} message="Loading Leads..." />
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Leads</h1>
          <p className="text-gray-600">View and manage Leads</p>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-[40%]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
            </div>
            <input
              type="text"
              placeholder="Search by name or contact"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={handleAddLead}
            leftIcon={ICON_NAMES.PLUS}
            variant="primary"
          >
            Add Lead
          </Button>
        </div>

        <Table
          data={filteredLeads}
          columns={columns}
          actions={actions}
          showPagination={true}
          itemsPerPage={10}
          emptyMessage="No leads found"
        />
        <LeadsModal
          isOpen={showLeadsModal}
          lead={selectedLead}
          onClose={() => {
            setShowLeadsModal(false);
            setSelectedLead(null);
          }}
          onSubmit={handleLeadSubmit}
        />
        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          leads={selectedLead}
        />
      </div>
    </>
  );
};

export default LeadsPage;
