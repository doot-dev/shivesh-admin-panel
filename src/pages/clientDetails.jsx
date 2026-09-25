import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { AiFillFilePdf } from "react-icons/ai";
import api from "../services/api";
import reportService from "../services/reportService";
import { fileLink } from "../utils/fileLink";
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
// G19 / W34: these used to render data={[]}; they now read the real APIs.

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "—");

function useList(url, params, pick = (r) => r.data || []) {
  const [rows, setRows] = useState(null);
  const key = JSON.stringify(params);
  useEffect(() => {
    if (!params) return;
    api.get(url, { params }).then((r) => setRows(pick(r.data))).catch(() => setRows([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key]);
  return rows;
}

const ProjectsTab = ({ clientId }) => {
  const navigate = useNavigate();
  const rows = useList("/api/v1/admin/project/list", clientId && { clientId, limit: 500 }, (d) => d.data?.projects || d.data || []);
  const columns = [
    { key: "projectId", header: "Project ID" },
    { key: "projectName", header: "Project Name" },
    { key: "siteName", header: "Site" },
    { key: "creditAmount", header: "Credit limit", render: (v) => (v ? inr(v) : "—") },
    { key: "creditResetPeriodDays", header: "Credit days", render: (v) => v ?? "—" },
    { key: "status", header: "Status" },
    { key: "view", header: "", render: (_v, p) => <button className="text-xs text-primary hover:underline" onClick={() => navigate(`/projects/${p.projectId}`)}>View</button> },
  ];
  return <Table columns={columns} data={rows || []} loading={rows === null} emptyMessage="No projects found" />;
};

const OrdersTab = ({ clientId }) => {
  const navigate = useNavigate();
  const rows = useList("/api/v1/admin/orders", clientId && { clientId, limit: 500 });
  const columns = [
    { key: "orderId", header: "Order ID" },
    { key: "date", header: "Delivery date", render: (v) => v || "—" },
    { key: "product", header: "Product", render: (_v, o) => `${o.productName} ${o.productGrade}` },
    { key: "quantity", header: "Qty" },
    { key: "status", header: "Order Status" },
    { key: "bill", header: "Bill", render: (_v, o) => o.bill?.billNo || "—" },
    { key: "view", header: "", render: (_v, o) => <button className="text-xs text-primary hover:underline" onClick={() => navigate(`/orders/${o.orderId}`)}>View</button> },
  ];
  return <Table columns={columns} data={rows || []} loading={rows === null} emptyMessage="No orders found" />;
};

const BillingTab = ({ clientId }) => {
  const navigate = useNavigate();
  const rows = useList("/api/v1/admin/bills/list", clientId && { clientId, limit: 1000 });
  const columns = [
    { key: "billNo", header: "Invoice ID" },
    { key: "issueDate", header: "Date", render: fmtDate },
    { key: "amount", header: "Amount", render: inr },
    { key: "dueDate", header: "Due", render: fmtDate },
    { key: "status", header: "Status", render: (v, b) => <span>{v}{b.daysOverdue > 0 && <span className="text-red-600 text-xs"> · {b.daysOverdue}d overdue</span>}</span> },
    { key: "view", header: "", render: (_v, b) => <button className="text-xs text-primary hover:underline" onClick={() => navigate(`/billing/${b.billNo}`)}>View</button> },
  ];
  const open = (rows || []).filter((b) => ["PENDING", "SENT", "OVERDUE"].includes(b.status)).reduce((s, b) => s + b.amount, 0);
  return (
    <div>
      <p className="text-sm text-gray-700 mb-2">{(rows || []).length} bill(s) · Unpaid {inr(open)}</p>
      <Table columns={columns} data={rows || []} loading={rows === null} emptyMessage="No invoices found" />
    </div>
  );
};

const Stat = ({ label, value, tone = "" }) => (
  <div className="bg-white border rounded-lg p-3"><div className="text-xs text-gray-500">{label}</div><div className={`text-base font-semibold ${tone}`}>{value}</div></div>
);

const AnalysisTab = ({ clientId }) => {
  const [data, setData] = useState(null);
  useEffect(() => {
    if (!clientId) return;
    reportService.getClientAnalytics(clientId).then((r) => setData(r.data)).catch(() => setData(false));
  }, [clientId]);
  if (data === null) return <p className="text-sm text-gray-500 py-4">Loading…</p>;
  if (data === false) return <p className="text-sm text-gray-500 py-4">Analysis needs the Reports permission.</p>;
  const { credit: c, payment: p, orders: o } = data;
  const d = (v, s = "") => (v === null || v === undefined ? "—" : `${v}${s}`);
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold mb-2">Credit</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <Stat label="Limit" value={inr(c.limit)} />
          <Stat label="Used" value={inr(c.used)} />
          <Stat label="Available" value={inr(c.available)} tone={c.available < 0 ? "text-red-700" : ""} />
          <Stat label="Overdue" value={inr(c.overdueAmount)} tone={c.overdueAmount ? "text-red-700" : ""} />
          <Stat label="Unbilled (challans in)" value={inr(c.unbilled)} />
          <Stat label="Status" value={c.flag.replace("_", " ")} tone={c.flag === "OK" ? "text-green-700" : "text-red-700"} />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2">Payment behaviour</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <Stat label="Billed" value={inr(p.billed)} />
          <Stat label="Collected" value={inr(p.collected)} />
          <Stat label="Avg days to pay" value={d(p.avgDaysToPay, " d")} />
          <Stat label="Avg days late" value={d(p.avgDaysPastDue, " d")} />
          <Stat label="On-time" value={d(p.onTimePct, "%")} />
          <Stat label="DSO" value={d(p.dso, " d")} />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Pending by age: not due {inr(p.pendingByAge.notDue)} · 1–30 {inr(p.pendingByAge.d1_30)} · 31–60 {inr(p.pendingByAge.d31_60)} · 61–90 {inr(p.pendingByAge.d61_90)} · 90+ {inr(p.pendingByAge.d90plus)}
          {p.oldestOpenBill && ` · oldest open bill ${p.oldestOpenBill.billNo} (${p.oldestOpenBill.days} d)`}
        </p>
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2">Order patterns</h4>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <Stat label="Orders" value={o.orders} />
          <Stat label="Volume" value={o.volume} />
          <Stat label="Avg order" value={d(o.avgOrderSize)} />
          <Stat label="Lead time" value={d(o.avgLeadDays, " d")} />
          <Stat label="Cancelled" value={`${o.cancelled} (${d(o.cancelRatePct, "%")})`} />
          <Stat label="Last order" value={d(o.daysSinceLastOrder, " d ago")} tone={o.goingQuiet ? "text-amber-700" : ""} />
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Grades: {o.gradeMix.map((g) => `${g.name} ${g.volume}`).join(" · ") || "—"}
          {" · "}Busiest day: {[...o.byWeekday].sort((a, b) => b.orders - a.orders)[0]?.day || "—"}
          {" · "}Trucks rejected at site: {o.siteRejections.rejected}/{o.siteRejections.trucks}
          {data.revenueSharePct !== null && ` · ${data.revenueSharePct}% of all billing`}
          {o.goingQuiet && " · ⚠ going quiet"}
        </p>
      </div>
    </div>
  );
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
    { label: "Projects", content: <ProjectsTab clientId={client.clientId} /> },
    { label: "Orders", content: <OrdersTab clientId={client.clientId} /> },
    { label: "Billing", content: <BillingTab clientId={client.clientId} /> },
    { label: "Analysis", content: <AnalysisTab clientId={client.clientId} /> },
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
      <div className="p-4 md:p-8 bg-white min-h-screen">
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

    // Backend-relative path: prefix with the API base and the sign-in token (P1.9).
    return fileLink(url.startsWith("/") ? url : `/${url}`);
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
