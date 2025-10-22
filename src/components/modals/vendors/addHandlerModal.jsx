import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import MapImage from "../../../assets/img/map.png";
import { ICON_NAMES } from "../../icons";
import HandlerSection from "./handlerSection";
import productService from "../../../services/productService";
import MapPicker from "../../ui/MapPicker";

const AddHandlerModal = ({ isOpen, onClose, onSubmit, vendorId }) => {
  const [locationDetails, setLocationDetails] = useState({
    plantName: "",
    address: "",
    latitude: "",
    longitude: "",
    productId: "",
    vendorId,
  });
  const [handlers, setHandlers] = useState([]);
  const [currentHandler, setCurrentHandler] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getAllProducts();
        setProductList(res.data);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    fetchProducts();
  }, []);

  const updateField = (setter, field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAddHandler = () => {
    if (!currentHandler.name || !currentHandler.phone) {
      setErrors({ general: "Please fill all handler fields" });
      return;
    }
    setHandlers([...handlers, { id: Date.now(), ...currentHandler }]);
    setCurrentHandler({ name: "", phone: "", email: "" });
  };

  const handleRemoveHandler = (id) =>
    setHandlers((prev) => prev.filter((h) => h.id !== id));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!locationDetails.plantName || !locationDetails.address) {
      setErrors({ general: "Please fill location details" });
      return;
    }
    onSubmit({ locationDetails, handlers });
    handleClose();
  };

  const handleClose = () => {
    setLocationDetails({
      plantName: "",
      address: "",
      latitude: "",
      longitude: "",
      productId: "",
      vendorId,
    });
    setHandlers([]);
    setCurrentHandler({ name: "", phone: "", email: "" });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Handler"
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.PRODUCT_MODAL}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Vendor details
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Fill in the details below to Add Handler Modal
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location Details
          </label>
          <Input
            type="text"
            placeholder="Enter full name"
            label="Plant Name"
            value={locationDetails.plantName}
            onChange={(e) =>
              updateField(setLocationDetails, "plantName", e.target.value)
            }
            error={errors.plantName}
            className="w-full"
          />
        </div>
        <div>
          <MapPicker onSelect={(latlng) => {
            updateField(setLocationDetails, "latitude", latlng.lat);
            updateField(setLocationDetails, "longitude", latlng.lng);
          }} />
          <div className="flex mt-2 gap-2">
            <Input
              placeholder="Latitude"
              value={locationDetails.latitude}
              onChange={(e) =>
                updateField(setLocationDetails, "latitude", e.target.value)
              }
            />
            <Input
              placeholder="Longitude"
              value={locationDetails.longitude}
              onChange={(e) =>
                updateField(setLocationDetails, "longitude", e.target.value)
              }
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            type="text"
            placeholder="Address"
            value={locationDetails.address}
            onChange={(e) =>
              updateField(setLocationDetails, "address", e.target.value)
            }
            className="w-full border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product
          </label>
          <select
            value={locationDetails.productId}
            onChange={(e) =>
              updateField(setLocationDetails, "productId", e.target.value)
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select product</option>
            {productList.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </select>
        </div>



        <HandlerSection
          handlers={handlers}
          currentHandler={currentHandler}
          updateField={(field, value) =>
            setCurrentHandler((prev) => ({ ...prev, [field]: value }))
          }
          handleAddHandler={handleAddHandler}
          handleRemoveHandler={handleRemoveHandler}
          errors={errors}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Add Handler
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddHandlerModal;
