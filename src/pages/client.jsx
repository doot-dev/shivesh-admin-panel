import { useCallback, useEffect, useState } from "react";
import { Icon, ICON_NAMES } from "../components/icons";
import Button from "../components/ui/Button";
import { Table } from "../components/ui";
import ClientDetailModal from "../components/modals/clients/clientDetailModal";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClients,
  createClient,
  deleteClient,
  updateClient,
} from "../features/clients/clientsSlice";
const ClientPage = () => {
  const dispatch = useDispatch();
  const { list: clientsData = [], loading } = useSelector(
    (state) => state.client,
  );
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    email: "",
    phone: "",
  });
  const [showClientModal, setShowClientModal] = useState(false);
  const refreshClients = useCallback(() => {
    dispatch(fetchClients());
  }, [dispatch]);

  useEffect(() => {
    refreshClients();
  }, [refreshClients]);

  const filteredClients = clientsData
    .filter((client) => {
      const s = filters.search.toLowerCase();
      const matchesSearch =
        !s ||
        client.email?.toLowerCase().includes(s) ||
        client.companyName?.toLowerCase().includes(s);
      const matchesStatus =
        !filters.status ||
        (filters.status === "Active" && client.status) ||
        (filters.status === "Inactive" && !client.status);

      return matchesSearch && matchesStatus;
    })
    .map((u, i) => ({
      ...u,
      sNo: (i + 1).toString().padStart(2, "0"),
      name: u.companyName,
      email: u.email,
      contactNumber: u.contactNumber,
      status: u.status ? "Active" : "Inactive",
    }));

  const handleClientSubmit = async (clientData, mode) => {
    if (mode === "add") {
      const payload = {
        companyName: clientData.vendorCompanyName,
        ownerName: clientData.ownerName,
        contactNumber: clientData.phone,
        email: clientData.email,
        hasGST: clientData.hasGST,
        ownerPan: clientData.ownerPan,
        ownerAadhaar: clientData.ownerAadhaar,
        address: clientData.address,
      };

      if (clientData.hasGST) {
        payload.gstNumber = clientData.gstNumber;
      }

      const resultAction = await dispatch(createClient(payload));
      console.log("resultAction", resultAction);
      if (createClient.fulfilled.match(resultAction)) {
        refreshClients();
        const createdClient =
          resultAction.payload?.data ?? resultAction.payload;
        return { success: true, client: createdClient };
      }
    } else if (mode === "edit") {
      const identifier =
        clientData?.clientId || clientData?.id || clientData?._id;

      if (!identifier) {
        console.warn("Client identifier missing for update", clientData);
        return { success: false };
      }

      const { _id, ...restClientData } = clientData || {};

      const payload = {
        ...restClientData,
        clientId: identifier,
      };

      if (!payload.hasGST) {
        delete payload.gstNumber;
      }

      const resultAction = await dispatch(updateClient(payload));
      if (updateClient.fulfilled.match(resultAction)) {
        refreshClients();
        const updatedClient =
          resultAction.payload?.data ?? resultAction.payload;
        return { success: true, client: updatedClient };
      }
    }

    return { success: false };
  };

  const handleAddClient = () => {
    setShowClientModal(true);
  };
  const handleView = (vendor) => {
    console.log("viewing vendor:", vendor);
    console.log("viewing vendor:", `/clients/${vendor.clientId}`);
    navigate(`/clients/${vendor.clientId}`);
  };
  const handleDelete = async (vendor) => {
    if (!vendor) {
      return;
    }

    const identifier = vendor.clientId || vendor._id;
    if (!identifier) {
      console.warn("Missing client identifier for delete", vendor);
      return;
    }

    try {
      const resultAction = await dispatch(deleteClient(identifier));
      if (deleteClient.fulfilled.match(resultAction)) {
        refreshClients();
      }
    } catch (error) {
      console.error("Failed to delete client", error);
    }
  };
  const columns = [
    { key: "sNo", header: "S.No" },
    { key: "name", header: "Client name" },
    {
      key: "contactPerson",
      header: "Phone",
      render: (value, vendor) => (
        <div>
          <div className="font-semibold text-gray-900">
            {vendor.contactNumber}
          </div>
          <div className="text-sm text-gray-500">
            {vendor.contactPersonDesignation}
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "E-mail",
      render: (value, vendor) => (
        <div>
          <div className="text-sm text-gray-500">{vendor.email}</div>
        </div>
      ),
    },
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
      text: "View",
      onClick: handleView,
      textColor: "var(--color-primary)",
    },

    {
      text: "Delete",
      onClick: handleDelete,
      textColor: "var(--color-error)",
    },
  ];

  return (
    <>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Client</h1>
          <p className="text-gray-600">View and manage Client</p>
        </div>

        {/* Search + Add */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-[40%]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
            </div>
            <input
              type="text"
              placeholder="Search by name or contact"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={handleAddClient}
            leftIcon={ICON_NAMES.PLUS}
            variant="primary"
            size="md"
            height="40px"
            className="md:!h-[50px] md:!px-6 md:!py-3 md:!text-base text-sm px-4 py-2"
          >
            Add Client
          </Button>
        </div>

        <Table
          data={filteredClients}
          columns={columns}
          actions={actions}
          itemsPerPage={10}
          emptyMessage="No Client found"
        />
        <ClientDetailModal
          isOpen={showClientModal}
          onClose={() => setShowClientModal(false)}
          onSubmit={handleClientSubmit}
        />
      </div>
    </>
  );
};
export default ClientPage;
