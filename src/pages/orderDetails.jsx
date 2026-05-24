import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Dropdown } from "../components/ui";
import { Icon, ICON_NAMES } from "../components/icons";
import {
  locationOptions,
  ordersData,
  technicianOptions,
  vendorOptions,
} from "../constant/orderData";

const detailFields = [
  { label: "Order no.", key: "sno" },
  { label: "Date & Time", key: "dateTime" },
  { label: "Product", key: "product" },
  { label: "Grade", key: "grade" },
  { label: "Quantity", key: "quantity" },
  { label: "Client name", key: "clientName" },
  { label: "Site", key: "site" },
  { label: "Order status", key: "status" },
];

const tmFields = [
  { label: "Truck No.", key: "truckNo" },
  { label: "Quantity", key: "quantity" },
  { label: "Batch Start Time", key: "batchStartTime" },
  { label: "Batch End Time", key: "batchEndTime" },
  { label: "Challan No.", key: "challanNo" },
];

const cardClassName =
  "mb-4 overflow-hidden rounded-lg border border-primary-bg-alt bg-white shadow-[0_2px_6px_rgba(16,24,40,0.08)]";

const getStatusClassName = (status = "") => {
  const normalized = status.toLowerCase();

  if (normalized.includes("progress")) {
    return "bg-warning-light text-warning";
  }

  if (normalized.includes("complete")) {
    return "bg-primary-light text-primary";
  }

  if (normalized.includes("cancel")) {
    return "bg-error-light text-error";
  }

  return "bg-success-light text-success";
};

const OrderDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();

  const order = useMemo(() => {
    if (state?.order) return state.order;
    return ordersData.find((item) => item.id === id || item.sno === id);
  }, [id, state?.order]);

  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  if (!order) {
    return (
      <div className="min-h-screen ">
        <div className="mx-auto max-w-[1140px] rounded-lg border border-primary-bg-alt bg-white shadow-[0_2px_6px_rgba(16,24,40,0.08)]">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-text-primary">Order not found</h2>
            <p className="mt-2 text-sm text-text-secondary">
              The requested order detail is unavailable.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => navigate("/orders")}
            >
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const mappedOrder = {
    ...order,
    dateTime: `${order.date} - ${order.time}`,
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6">
      <div className="max-w-[1140px] mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div className="text-sm text-text-secondary">
            <span className="cursor-pointer" onClick={() => navigate("/orders")}>Orders</span>
            <span className="mx-2">&gt;</span>
            <span>{order.sno}</span>
            <span className="mx-2">&gt;</span>
            <span className="font-semibold text-primary">
              {order.sno} detail
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button variant="outline" className="!h-9 !text-xs sm:!text-sm">
              View comments
            </Button>
            <Button variant="primary" className="!h-9 !text-xs sm:!text-sm">
              Cancel order
            </Button>
          </div>
        </div>

        <section className={cardClassName}>
          <div className="border-b border-primary-light px-4 py-3">
            <h3 className="text-sm font-semibold text-text-primary">Order details</h3>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-5 gap-x-4">
            {detailFields.map((field) => (
              <div key={field.key}>
                <p className="mb-1 text-xs text-text-secondary">
                  {field.label}
                </p>
                {field.key === "status" ? (
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs ${getStatusClassName(
                      mappedOrder[field.key]
                    )}`}
                  >
                    {mappedOrder[field.key]}
                  </span>
                ) : (
                  <p className="text-sm font-medium text-text-primary">
                    {mappedOrder[field.key]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={`${cardClassName} p-4`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="mb-2 text-xs text-text-primary">Select vendor</p>
              <Dropdown
                options={vendorOptions}
                value={selectedVendor}
                onChange={setSelectedVendor}
                placeholder="Select vendor"
                className="w-full"
                backgroundColor="input-bg"
              />
            </div>
            <div>
              <p className="mb-2 text-xs text-text-primary">Select location</p>
              <Dropdown
                options={locationOptions}
                value={selectedLocation}
                onChange={setSelectedLocation}
                placeholder="Select location"
                className="w-full"
                backgroundColor="input-bg"
              />
            </div>
            <div>
              <p className="mb-2 text-xs text-text-primary">Select field technician</p>
              <Dropdown
                options={technicianOptions}
                value={selectedTechnician}
                onChange={setSelectedTechnician}
                placeholder="Select field technician"
                className="w-full"
                backgroundColor="input-bg"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="primary" className="!h-9 !px-10">
              Update
            </Button>
          </div>
        </section>

        <section className={cardClassName}>
          <div className="border-b border-primary-light bg-primary-light px-4 py-2.5">
            <h3 className="text-sm font-semibold text-text-primary">TM details</h3>
          </div>

          <div className="p-4">
            {order.tmDetails?.map((item, index) => (
              <div
                key={item.id}
                className={`${
                  index !== order.tmDetails.length - 1 ? "border-b border-[#e4e7ec]" : ""
                } py-3`}
              >
                <p className="mb-4 text-sm font-semibold text-text-primary">
                  {item.id}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {tmFields.map((field) => (
                    <div key={`${item.id}-${field.key}`}>
                      <p className="mb-1 text-xs text-text-secondary">
                        {field.label}
                      </p>
                      <p className="text-sm font-medium text-text-primary">
                        {item[field.key]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-primary-bg-alt bg-white shadow-[0_2px_6px_rgba(16,24,40,0.08)]">
          <button
            type="button"
            className="w-full px-4 py-3 flex items-center justify-between"
            onClick={() => setIsActivityOpen((prev) => !prev)}
          >
            <h3 className="text-sm font-semibold text-text-primary">Activity log</h3>
            <Icon
              name={isActivityOpen ? ICON_NAMES.CHEVRON_UP : ICON_NAMES.CHEVRON_DOWN}
              size={18}
              color="var(--color-text-secondary)"
            />
          </button>

          {isActivityOpen && (
            <div className="border-t border-[#e4e7ec] px-4 pb-4">
              {order.activityLog?.length ? (
                <div className="space-y-3 mt-3">
                  {order.activityLog.map((entry) => (
                    <div key={entry.id} className="rounded-lg bg-background p-3">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-semibold text-text-primary">
                          {entry.title}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {entry.time}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-text-secondary">
                        {entry.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-text-secondary">
                  No activity found.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
