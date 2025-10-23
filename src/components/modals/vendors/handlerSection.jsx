import React, { useEffect } from "react";
import { Icon, ICON_NAMES } from "../../icons";
import Input from "../../ui/Input";
import vendorService from "../../../services/vendorService";
const HandlerSection = ({
  handlers = [],
  currentHandler = { name: "", phone: "", email: "" },
  errors = {},
  updateField = () => {},
  handleAddHandler = () => {},
  handleRemoveHandler = () => {},
  handleEditHandler = () => {},
  isEditMode = false,
  editingIndex = null,
  onHandlerFieldChange = () => {},
  onApplyEdit = () => {},
}) => {
  // useEffect(async () => {
  //   try {
  //     const res = await vendorService.getHandlersforLocation(29);
  //     handlers(res.data || []);
  //   } catch (error) {
  //     console.error("Failed to fetch handlers:", error);
  //   }
  // }, [29]);


  const renderHandlerRow = (handler, index) => {
    const isEditing = editingIndex === index;

    return (
      <div
        key={index}
        className="px-4 py-3 border-b border-gray-100 grid grid-cols-12 items-center text-sm gap-4"
      >
        {/* Name */}
        <div className="col-span-3">
          <Input
            value={handler.name || ""}
            onChange={
              isEditing
                ? (e) => onHandlerFieldChange(index, "name", e.target.value)
                : undefined
            }
            placeholder="Enter name"
            readOnly={!isEditing}
            className={
              isEditing
                ? "border-gray-300"
                : "border-none bg-transparent cursor-default focus:ring-0 focus:border-none px-0"
            }
          />
        </div>

        {/* Phone */}
        <div className="col-span-3">
          <Input
            value={handler.phone || ""}
            onChange={
              isEditing
                ? (e) => onHandlerFieldChange(index, "phone", e.target.value)
                : undefined
            }
            placeholder="Enter phone"
            readOnly={!isEditing}
            className={
              isEditing
                ? "border-gray-300"
                : "border-none bg-transparent cursor-default focus:ring-0 focus:border-none px-0"
            }
          />
        </div>

        {/* Email */}
        <div className="col-span-4">
          <Input
            value={handler.email || ""}
            onChange={
              isEditing
                ? (e) => onHandlerFieldChange(index, "email", e.target.value)
                : undefined
            }
            placeholder="Enter email"
            readOnly={!isEditing}
            className={
              isEditing
                ? "border-gray-300"
                : "border-none bg-transparent cursor-default focus:ring-0 focus:border-none px-0"
            }
          />
        </div>

        {/* Action Buttons */}
        {/* Action Buttons */}
        <div className="col-span-2 flex justify-end items-center space-x-2">
          {isEditing ? (
            <>
              {/* ✅ Save */}
              <button
                type="button"
                onClick={() => onApplyEdit(index)} // pass index to save
                className="text-green-600 hover:text-green-800 p-1 rounded"
                title="Save changes"
              >
                <Icon name={ICON_NAMES.CHECK} size={18} />
              </button>

              {/* ❌ Cancel */}
              <button
                type="button"
                onClick={() => handleEditHandler(null, null)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded"
                title="Cancel edit"
              >
                <Icon name={ICON_NAMES.X} size={18} />
              </button>
            </>
          ) : (
            <>
              {/* ✏️ Edit */}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => handleEditHandler(handler, index)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded"
                  title="Edit handler"
                >
                  <Icon name={ICON_NAMES.EDIT} size={18} />
                </button>
              )}

              {/* 🗑️ Delete */}
              <button
                type="button"
                onClick={() => handleRemoveHandler(index)} // ✅ pass index
                className="text-red-500 hover:text-red-700 p-1 rounded"
                title="Delete handler"
              >
                <Icon name={ICON_NAMES.TRASH_2} size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <section>
     

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 grid grid-cols-12 text-sm font-medium text-gray-700">
          <div className="col-span-3">Handler Name</div>
          <div className="col-span-3">Contact No.</div>
          <div className="col-span-4">E-mail</div>
          <div className="col-span-2" />
        </div>

        {/* Handler Rows */}
        <div className="bg-white">
          {handlers.length > 0 ? (
            handlers.map(renderHandlerRow)
          ) : (
            <div className="text-center text-sm text-gray-500 py-3">
              No handlers added yet.
            </div>
          )}

          {/* Add New Handler Row */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 grid grid-cols-12 gap-4 items-center">
            <Input
              placeholder="Enter name"
              value={currentHandler.name || ""}
              onChange={(e) => updateField("name", e.target.value)}
              error={errors.name}
              className="col-span-3"
            />
            <Input
              placeholder="Enter phone no."
              value={currentHandler.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              error={errors.phone}
              className="col-span-3"
            />
            <Input
              placeholder="Enter e-mail ID"
              value={currentHandler.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              error={errors.email}
              className="col-span-4"
            />
            <div className="col-span-2 flex justify-end">
              <button
                type="button"
                onClick={handleAddHandler}
                className="text-gray-400 hover:text-gray-600"
                title="Add handler"
              >
                <Icon name={ICON_NAMES.PLUS} size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HandlerSection;
