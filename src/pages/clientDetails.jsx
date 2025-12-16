import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import Tabs from "../components/ui/Tabs";
import { Table } from "../components/ui";
import ClientKYCModal from "../components/modals/clients/clientKycModal";

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
  const [isKycOpen, setIsKycOpen] = useState(false);

  // Temporary mock data (replace with API/Redux later)
  const client = {
    name: "ABC Pvt Ltd",
    phone: "9876543210",
    email: "contact@abc.com",
    status: "ACTIVE",
    address: "Mumbai, India",
    gst: "27ABCDE1234F1Z5",
    pan: "ABCDE1234F",
    kyc: "Completed",
  };

  const tabs = [
    { label: "Projects", content: <ProjectsTab /> },
    { label: "Orders", content: <OrdersTab /> },
    { label: "Billing", content: <BillingTab /> },
  ];

  const handleKycSubmit = () => {
    console.log("KYC submitted");
    setIsKycOpen(false);
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
            {client.name}
          </h1>
          <div className="flex gap-3 mt-3 sm:mt-0">
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-800">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 text-sm">
            <Detail label="Client Name" value={client.name} />
            <Detail label="Phone" value={client.phone} />
            <Detail label="E-mail" value={client.email} />
            <Detail label="Status" value={client.status} />
            <Detail label="Address" value={client.address} />
            <Detail label="GST No." value={client.gst} />
            <Detail label="PAN No." value={client.pan} />
            <Detail label="KYC Status" value={client.kyc} />
          </div>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} />
      </div>

      {/* KYC Modal */}
      <ClientKYCModal
        isOpen={isKycOpen}
        onClose={() => setIsKycOpen(false)}
        onSubmit={handleKycSubmit}
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

export default ClientDetailsPage;
