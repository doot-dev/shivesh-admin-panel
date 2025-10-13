import React from "react";
import { useNavigate } from "react-router-dom";
const LeadsDetailsPage = () => {
    const navigate = useNavigate();
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-4">
        <span className="hover:underline cursor-pointer" onClick={() => navigate("/leads")} >Lead</span> 
        <span className="hover:underline cursor-pointer">Lodha Group</span> &gt;{" "}
        <span className="text-blue-600 font-medium">Lead detail</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Lodha Group</h1>
        <div className="flex gap-3 mt-3 sm:mt-0">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium transition">
            ✏️ Edit
          </button>
          <button className="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition">
            Add Activity
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Details Card */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#9BB3F4] p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 text-sm text-gray-700">
            <div>
              <p className="text-gray-500">Assigned to</p>
              <p className="font-medium">John Doe</p>
            </div>
            <div>
              <p className="text-gray-500">Requirement</p>
              <p className="font-medium">Commercial building</p>
            </div>
            <div>
              <p className="text-gray-500">Source</p>
              <p className="font-medium">Website</p>
            </div>
            <div>
              <p className="text-gray-500">Due date</p>
              <p className="font-medium">Sep 20, 2025</p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <span className="inline-block bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full">
                In Progress
              </span>
            </div>
          </div>
        </div>

        {/* Reminders Card */}
        <div className="bg-white rounded-xl shadow-sm border border-[#9BB3F4] p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Reminders</h2>
          <div className="flex items-start gap-3">
            <span className="mt-1 w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <div>
              <p className="text-sm font-medium text-gray-800">July 20, 2025</p>
              <p className="text-gray-600 text-sm">Contact the client</p>
            </div>
          </div>
        </div>

        {/* Activity History */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-[#9BB3F4] p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Activity history</h2>
          <div className="space-y-6 text-sm text-gray-700">
            <div className="relative pl-5 border-l-2 border-blue-500">
              <div className="absolute -left-1.5 top-0 w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="font-semibold">Assigned to John Doe</p>
              <p className="text-gray-500 text-xs">July 15, 2025 - 9:00 AM</p>
            </div>

            <div className="relative pl-5 border-l-2 border-blue-500">
              <div className="absolute -left-1.5 top-0 w-3 h-3 bg-blue-500 rounded-full"></div>
              <p className="font-semibold">Lead created</p>
              <p className="text-gray-500 text-xs">July 14, 2025 - 10:30 AM</p>
              <p className="text-gray-600 text-sm mt-1">
                Lead generated through website.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsDetailsPage;
