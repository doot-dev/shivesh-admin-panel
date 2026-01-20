import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { AiFillFilePdf } from "react-icons/ai";
import api from "../services/api";
import Tabs from "../components/ui/Tabs";
import { Table } from "../components/ui";
import ClientKYCModal from "../components/modals/clients/clientKycModal";
import ClientDetailModal from "../components/modals/clients/clientDetailModal";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchClientsById,
  uploadClientKycDocuments,
  updateClient,
} from "../features/clients/clientsSlice";

/* -------------------- TAB COMPONENTS -------------------- */

const ProjectsTab = () => {
  const columns = [
    { key: "projectName", header: "Project Name" },
    { key: "location", header: "Location" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "status", header: "Status" },
  ];

  return <Table columns={columns} data={[]} emptyMessage="No projects found" />;
};

const OrdersTab = () => {
  const columns = [
    { key: "orderId", header: "Order ID" },
    { key: "date", header: "Date" },
    { key: "amount", header: "Amount" },
    { key: "orderStatus", header: "Order Status" },
    { key: "paymentStatus", header: "Payment Status" },
  ];

  return <Table columns={columns} data={[]} emptyMessage="No orders found" />;
};

const BillingTab = () => {
  const columns = [
    { key: "invoiceId", header: "Invoice ID" },
    { key: "date", header: "Date" },
    { key: "amount", header: "Amount" },
    { key: "status", header: "Status" },
  ];

  return <Table columns={columns} data={[]} emptyMessage="No invoices found" />;
};

/* -------------------- MAIN PAGE -------------------- */

const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentClient, loading } = useSelector((state) => state.client);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadClient = useCallback(() => {
    if (id) {
      dispatch(fetchClientsById(id));
    }
  }, [dispatch, id]);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    loadClient();
  }, [loadClient]);

  useEffect(() => {
    loadClient();
  }, [loadClient]);

  const client = currentClient || {};
  console.log("client", client);
  const isClientLoading = loading && !currentClient;
  const clientStatus =
    client.status === undefined ? "—" : client.status ? "ACTIVE" : "INACTIVE";

  const tabs = [
    { label: "Projects", content: <ProjectsTab /> },
    { label: "Orders", content: <OrdersTab /> },
    { label: "Billing", content: <BillingTab /> },
  ];

  const handleKycSubmit = async (documents) => {
    if (!id) {
      return false;
    }
    console.log("Submitting KYC for client ID:", id, documents);
    const resultAction = await dispatch(
      uploadClientKycDocuments({ clientId: id, documents }),
    );

    if (uploadClientKycDocuments.fulfilled.match(resultAction)) {
      loadClient();
      return true;
    }

    return false;
  };

  const handleClientUpdate = async (updatedClientData) => {
    console.log("Updating client with data:", updatedClientData);
    const resultAction = await dispatch(updateClient(updatedClientData));
    if (updateClient.fulfilled.match(resultAction)) {
      closeEditModal();
      const updatedClient = resultAction.payload?.data ?? resultAction.payload;
      return { success: true, client: updatedClient };
    }
    return { success: false };
  };

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <span
            className="hover:underline cursor-pointer"
            onClick={() => navigate("/clients")}
          >
            Clients
          </span>
          &nbsp;&gt;&nbsp;
          <span className="text-blue-600 font-medium">Client Details</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {client.companyName || client.name || "Client Details"}
          </h1>
          <div className="flex gap-3 mt-3 sm:mt-0">
            <button
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-800"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit
            </button>
            <button
              onClick={() => setIsKycOpen(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-800"
            >
              KYC
            </button>
          </div>
        </div>

        {/* Client Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#9BB3F4] p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Client Details
          </h2>

          {isClientLoading ? (
            <p className="text-sm text-gray-500">Loading client details...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 text-sm">
              <Detail label="Client Name" value={client.companyName || "—"} />
              <Detail label="Phone" value={client.contactNumber || "—"} />
              <Detail label="E-mail" value={client.email || "—"} />
              <Detail label="Status" value={clientStatus} />
              <Detail label="Address" value={client.address || "—"} />
              {client.gstNumber && (
                <Detail label="GST No." value={client.gstNumber} />
              )}
              <Detail
                label="PAN No."
                value={client.companyPan || client.ownerPan || "—"}
              />
              <Detail
                label="KYC Status"
                value={client.kycStatus || "Pending"}
              />
              <KycDocumentsDetail documents={client.kycDocuments} />
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} />
      </div>

      {/* KYC Modal */}
      <ClientKYCModal
        isOpen={isKycOpen}
        onClose={() => setIsKycOpen(false)}
        onSubmit={handleKycSubmit}
        hasGST={!!client.hasGST}
      />

      <ClientDetailModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        vendor={client}
        onSubmit={handleClientUpdate}
      />
    </>
  );
};

/* -------------------- REUSABLE DETAIL FIELD -------------------- */

const Detail = ({ label, value }) => (
  <div>
    <p className="text-gray-500">{label}</p>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

const KycDocumentsDetail = ({ documents }) => {
  const kycDocuments = Array.isArray(documents) ? documents : [];

  const getDocUrl = (doc) => {
    if (!doc) return null;

    let url = null;

    if (typeof doc === "string") {
      url = doc;
    } else {
      url = doc.url || doc.fileUrl || doc.path || doc.location || null;
    }

    if (!url) return null;

    // If already absolute (http/https), use as-is
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Otherwise, treat as backend-relative path and prefix with API base URL
    const base = api?.defaults?.baseURL?.replace(/\/+$/, "") || "";
    const normalizedPath = url.startsWith("/") ? url : `/${url}`;

    return base ? `${base}${normalizedPath}` : url;
  };

  const handleOpen = (url) => {
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <p className="text-gray-500">Upload KYC</p>
      <div className="flex items-center gap-2">
        {kycDocuments.length === 0 && (
          <p className="text-sm text-gray-500">No KYC documents uploaded</p>
        )}
        {kycDocuments.map((doc, index) => {
          const url = getDocUrl(doc);
          if (!url) return null;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleOpen(url)}
              className="text-red-500 hover:text-red-600"
              aria-label={`Open KYC document ${index + 1}`}
            >
              <AiFillFilePdf className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClientDetailsPage;
