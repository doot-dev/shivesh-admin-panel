import React, { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { ICON_NAMES } from "../../icons";
import vendorService from "../../../services/vendorService";
import productService from "../../../services/productService";
import HandlerSection from "./handlerSection";
import { toast } from "react-toastify";

const EditHandlerModal = ({ isOpen, onClose, handler, locationVendorId, onSubmit }) => {
  const [locationDetails, setLocationDetails] = useState({});
  const [handlers, setHandlers] = useState([]);
  const [productList, setProductList] = useState([]);

  useEffect(() => {
    if (!isOpen || !locationVendorId) return;
    const fetchData = async () => {
      try {
        const res = await vendorService.getLocationbyId(locationVendorId);
        setLocationDetails(res.data);
        setHandlers(res.data.handlers || []);
      } catch (err) {
        toast.error("Failed to load handler data");
      }
    };
    fetchData();
  }, [isOpen, locationVendorId]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productRes = await productService.getAllProducts();
        setProductList(productRes.data);
      } catch {
        setProductList([]);
      }
    };
    fetchProducts();
  }, []);

  const updateField = (setter, field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ locationDetails, handlers, handler, locationVendorId });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Handler"
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.PRODUCT_MODAL}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <section>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Location Details
          </h4>
          <Input
            label="Plant Name"
            value={locationDetails.plantName || ""}
            onChange={(e) =>
              updateField(setLocationDetails, "plantName", e.target.value)
            }
          />
          <textarea
            value={locationDetails.address || ""}
            onChange={(e) =>
              updateField(setLocationDetails, "address", e.target.value)
            }
            className="w-full px-3 py-2 border rounded-lg"
          />
          <select
            value={locationDetails.productId || ""}
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
        </section>

        <HandlerSection
          handlers={handlers}
          currentHandler={{}}
          updateField={() => {}}
          handleAddHandler={() => {}}
          handleRemoveHandler={() => {}}
        />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Update Handler
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditHandlerModal;
