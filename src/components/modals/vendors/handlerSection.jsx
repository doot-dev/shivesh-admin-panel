import React from "react";
import { Icon, ICON_NAMES } from "../../icons";
import Input from "../../ui/Input";

const HandlerSection = ({
  handlers,
  currentHandler,
  errors,
  updateField,
  handleAddHandler,
  handleRemoveHandler,
}) => {
  return (
    <section>
      <h4 className="text-md font-medium text-gray-900 mb-4">
        Handler Details
      </h4>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 grid grid-cols-12 text-sm font-medium text-gray-700">
          <div className="col-span-3">Handler Name</div>
          <div className="col-span-3">Contact No.</div>
          <div className="col-span-4">E-mail</div>
          <div className="col-span-2" />
        </div>

        {/* Handlers List */}
        <div className="bg-white">
          {handlers?.length > 0 ? (
            handlers.map((h, index) => (
              <div
                key={index}
                className="px-4 py-3 border-b border-gray-100 grid grid-cols-12 items-center text-sm"
              >
                <div className="col-span-3">{h.name}</div>
                <div className="col-span-3">{h.phone}</div>
                <div className="col-span-4">{h.email}</div>
                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveHandler(h.id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete handler"
                  >
                    <Icon name={ICON_NAMES.TRASH_2} size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-gray-500 py-3">
              No handlers added yet.
            </div>
          )}

          {/* Add New Handler */}
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 grid grid-cols-12 gap-4 items-center">
            <Input
              placeholder="Enter name"
              value={currentHandler.name}
              onChange={(e) => updateField("name", e.target.value)}
              error={errors.handlerName}
              className="col-span-3"
            />
            <Input
              placeholder="Enter phone no."
              value={currentHandler.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              error={errors.handlerPhone}
              className="col-span-3"
            />
            <Input
              placeholder="Enter e-mail ID"
              value={currentHandler.email}
              onChange={(e) => updateField("email", e.target.value)}
              error={errors.handlerEmail}
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
