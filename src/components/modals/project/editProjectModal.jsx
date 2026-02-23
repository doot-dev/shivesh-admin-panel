import { useMemo, useState, useEffect } from "react";
import { ICON_NAMES } from "../../icons";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Dropdown from "../../ui/Dropdown";
import LocationMap from "../../ui/LocationMap";
import { FaSearch } from "react-icons/fa";

const EditProjectModal = ({ isOpen, onClose, onSubmit, clients = [], project }) => {
  const [formData, setFormData] = useState({
    projectName: "",
    latitude: "19.1985175",
    longitude: "72.9509778",
    projectLocation: "",
    siteName: "",
    clientId: "",
    projectId: "",
    address: "",
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchLocation, setSearchLocation] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Populate form when project data is available
  useEffect(() => {
    if (project && isOpen) {
      setFormData({
        projectName: project.projectName || "",
        latitude: project.latitude || "19.1985175",
        longitude: project.longitude || "72.9509778",
        projectLocation: project.projectLocation || "",
        siteName: project.siteName || "",
        clientId: project.client?.clientId || "",
        projectId: project.projectId || "",
        status: project.status?.toUpperCase() || "ACTIVE",
        address: project.address || "",
      });
    }
  }, [project, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.projectName)
      newErrors.projectName = "Project Name is required";
    if (!formData.clientId) newErrors.clientId = "Client is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    const {
      clientId,   // remove
      id,         // remove
      _id,        // remove
      ...cleanPayload
    } = formData;

    onSubmit(cleanPayload);
    setSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setErrors({});
    setSubmitting(false);
    setShowSearch(false);
    setSearchLocation("");
    onClose();
  };

  const handleMarkerMove = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const fetchLatLngFromSearch = async (query) => {
    if (!query || query.length < 3) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}`,
      );
      const data = await res.json();

      if (data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          latitude: data[0].lat,
          longitude: data[0].lon,
        }));
      }
    } catch (err) {
      console.error("Geocoding error", err);
    }
  };

  const debounce = (fn, delay = 700) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedSearch = useMemo(
    () => debounce(fetchLatLngFromSearch, 800),
    [],
  );

  const statusOptions = [
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit project"
      size="lg"
      maxWidth="550px"
      headerIcon={ICON_NAMES.PROJECT}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Project Name */}
        <Input
          type="text"
          label="Project Name"
          placeholder="Project Name"
          value={formData.projectName}
          onChange={(e) => handleInputChange("projectName", e.target.value)}
        />

        {/* Project Manager */}
        {/* <Input
          type="text"
          label="Project Manager"
          placeholder="Project Manager"
          value={formData.projectManager}
          onChange={(e) => handleInputChange("projectManager", e.target.value)}
        /> */}

        {/* Search icon toggle */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowSearch((prev) => !prev)}
            className="flex items-center gap-2"
          >
            <FaSearch /> Search Location
          </Button>
        </div>

        {/* Search input (toggle) */}
        {showSearch && (
          <Input
            type="text"
            label="Search Location"
            placeholder="Enter location to search"
            value={searchLocation}
            onChange={(e) => {
              setSearchLocation(e.target.value);
              debouncedSearch(e.target.value);
            }}
          />
        )}

        {/* Map */}
        <div className="mt-3 rounded-lg overflow-hidden border">
          <LocationMap
            lat={formData.latitude}
            lng={formData.longitude}
            onMarkerMove={handleMarkerMove}
          />
        </div>

        {/* Lat/Lng Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <Input label="Latitude" value={formData.latitude} readOnly />
          <Input label="Longitude" value={formData.longitude} readOnly />
        </div>

        {/* Project Location */}
        <Input
          type="text"
          label="Project Location"
          placeholder="Project Location"
          value={formData.projectLocation}
          onChange={(e) => handleInputChange("projectLocation", e.target.value)}
        />

        {/* Site name */}
        <Input
          type="text"
          label="Site Name"
          placeholder="Site Name"
          value={formData.siteName}
          onChange={(e) => handleInputChange("siteName", e.target.value)}
        />

        {/* Client */}
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Client
        </label>
        <Dropdown
          options={clients.map((c) => ({
            value: c.clientId || c._id || c.id,
            label: c.companyName || c.name,
          }))}
          value={formData.clientId}
          placeholder="Select Client"
          width="100%"
          height="40px"
          disabled
          onChange={(val) => handleInputChange("clientId", val)}
        />

        {/* Status */}
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Status
        </label>
        <Dropdown
          options={statusOptions}
          value={formData.status}
          placeholder="Select Status"
          width="100%"
          height="40px"
          onChange={(val) => handleInputChange("status", val)}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            variant="primary"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectModal;
