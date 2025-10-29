import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import LogsActivityModal from "../components/modals/leads/logActivityModal";
import leadService from "../services/leadService";
import { toast } from "react-toastify";
import dayjs from "dayjs";
const LeadsDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [showlogsModal, setShowlogsModal] = useState(false);
  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadLeadsData = useCallback(async () => {
    try {
      setLoading(true);
      const leadRes = await leadService.getLeadsById(id);
      const leadData = leadRes.data;
      console.log("Lead details data:", leadData);
      setLeadData(leadData);
    } catch (error) {
      console.error("Error loading lead details:", error);
      toast.error("Failed to load lead details. Please try again.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [id, location.state]);
  useEffect(() => {
    loadLeadsData();
  }, [loadLeadsData]);
  const handleAddActivity = () => {
    setShowlogsModal(true);
  };

  const handleSubmit = async (logData) => {
    try {
      console.log("Log Data submitted:", logData)
      const logRes = await leadService.updateActivityLog(id, logData);

      console.log("Updates the log activity", logRes);
      setShowlogsModal(true);
    } catch (error) {
      console.error("Failed to add log details", error);
      toast.error(error?.response?.data?.message || "Failed to Add Activity Log");
    }
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <span
          className="hover:underline cursor-pointer"
          onClick={() => navigate("/leads")}
        >
          Lead
        </span>
        &gt; <span className="hover:underline cursor-pointer">{leadData?.name}</span>{" "}
        &gt; <span className="text-blue-600 font-medium">Lead detail</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">{leadData?.companyName}</h1>
        <div className="flex gap-3 mt-3 sm:mt-0">
          {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium transition">
            ✏️ Edit
          </button> */}
          <button
            onClick={handleAddActivity}
            className="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition"
          >
            Add Activity
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Details Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#9BB3F4] p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Lead details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">Lead Name</p>
              <p className="font-medium">{leadData?.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Lead Email</p>
              <p className="font-medium">{leadData?.email}</p>
            </div>
            <div>
              <p className="text-gray-500">Lead Phone No.</p>
              <p className="font-medium">{leadData?.phone}</p>
            </div>
            <div>
              <p className="text-gray-500">Lead Address</p>
              <p className="font-medium">{leadData?.address}</p>
            </div>
            <div>
              <p className="text-gray-500">Assigned to</p>
              <p className="font-medium">{leadData?.assignedToId}</p>
            </div>
            <div>
              <p className="text-gray-500">Requirement</p>
              <p className="font-medium">{leadData?.requirement}</p>
            </div>
            <div>
              <p className="text-gray-500">Source</p>
              <p className="font-medium">{leadData?.source}</p>
            </div>
            <div>
              <p className="text-gray-500">Date & Time</p>
              <p className="font-medium">{leadData?.date ? dayjs(leadData.date).format("DD MMM YYYY") : "-"} {" "} & {" "} {leadData?.time}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Title</p>
              <p className="font-medium">{leadData?.title}</p>
            </div>
            <div>
              <p className="text-gray-500">Description</p>
              <p className="font-medium">{leadData?.description}</p>
            </div>
            <div>
              <p className="text-gray-500">Requirement</p>
              <p className="font-medium">{leadData?.requirement}</p>
            </div>
            <div>
              <p className="text-gray-500">Source of Lead</p>
              <p className="font-medium">{leadData?.source}</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                {leadData?.status}
              </span>
            </div>
          </div>
        </div>



        {/* Activity History */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-[#9BB3F4] p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Activity history
          </h2>

          <div className="space-y-6 text-sm text-gray-700">
            {leadData?.activityLogs.map((log, index) => (
              <div key={index} className="relative">
                {/* <p className="font-semibold">{log?.action}</p> */}
                <p className="text-gray-500 text-sm font-semibold">{log?.title}</p>
                <p className="text-gray-500 text-xs">{log?.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <LogsActivityModal
        isOpen={showlogsModal}
        handleClose={() => setShowlogsModal(false)}
        onSubmit={handleSubmit}
        leadId={id}
      />
    </div>
  );
};

export default LeadsDetailsPage;
