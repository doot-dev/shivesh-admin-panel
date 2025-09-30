import React from "react";

export default function AddUser({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-[#00000082] bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg w-[400px] p-6">
          <h2 className="text-xl font-semibold mb-4">Add User</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Employee Name"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Employee ID"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="text"
              placeholder="Username"
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full border px-3 py-2 rounded"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
