import React, { useEffect, useState, useCallback } from "react";
import { Icon, ICON_NAMES } from "../components/icons";
import { Button, Table, Dropdown } from "../components/ui";
import { toast } from "react-toastify";
import FullPageLoader from "../components/ui/FullPageLoader";
import { useNavigate } from "react-router-dom";
import LeadsModal from "../components/modals/leads/leadsModal";
import DeleteModal from "../components/modals/leads/deleteModal";
import leadService from "../services/leadService";
import { useFetch } from "../hooks/useFetch";
const LeadsPage = () => {
  // `leads` and `loading` are provided by useFetch below, avoid local duplicates
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const navigate = useNavigate();


  const leadsData = useCallback(async () => {
    const response = await leadService.getAllLeads();
    console.log("Leads response:", response);
    let rawData = [];
    if (Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response && Array.isArray(response.data)) {
      rawData = response.data;
    } else {
      console.warn("Unexpected response structure:", response);
    }
    return rawData.map((lead, index) => ({
      id: lead.id,
      sNo: index + 1,
      name: lead.contactPerson,
      company: lead.companyName,
      phone: lead.phone,
      email: lead.email,
      requirement: lead.requirement,
      source: lead.source,
      status: lead.isActive ? "Active" : "Inactive",
      assignedTo: lead.assignedToId,
      originalData: lead,
    }));
  }, []);

  const {
    data: leads,
    loading,
    setData: setLeads,
    refetch: loadLeads,
  } = useFetch(leadsData, [], {
    autoFetch: true,
    showToast: true,
  });

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
    // setShowLeadsModal(true);
    navigate(`/leads/${lead.id}`);
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



  const columns = [
    { key: "sNo", header: "S.No." },
    { key: "name", header: "Name" },
    { key: "company", header: "Company" },
    {
      key: "phone",
      header: "Contact",
      render: (value, row) => (
        <div>
          <div className="font-semibold">{row?.phone}</div>
          <div className="text-sm text-gray-500">{row?.email}</div>
        </div>
      ),
    },

    { key: "requirement", header: "Requirement" },
    { key: "source", header: "Source" },
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
    { key: "assignedTo", header: "Assigned To" },
  ];

  const actions = [
   
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
            size="md"
            height="40px"
            className="md:!h-[50px] md:!px-6 md:!py-3 md:!text-base text-sm px-4 py-2"
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
