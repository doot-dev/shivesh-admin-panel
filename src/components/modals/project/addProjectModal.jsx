import { useMemo, useState } from "react";
import { ICON_NAMES } from "../../icons";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Dropdown from "../../ui/Dropdown";
import LocationMap from "../../ui/LocationMap";
import { FaSearch } from "react-icons/fa"; // search icon

const AddProjectModal = ({ isOpen, onClose, onSubmit, clients = [] }) => {
  const [formData, setFormData] = useState({
    projectName: "",
    latitude: "19.1985175",
    longitude: "72.9509778",
    projectLocation: "",
    siteName: "",
    clientId: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // 🌟 separate search state for map
  const [searchLocation, setSearchLocation] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleMarkerMove = (lat, lng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  // fetch lat/lng from search input
  const fetchLatLngFromSearch = async (query) => {
    if (!query || query.length < 3) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
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

  // debounce search
  const debounce = (fn, delay = 700) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };
  const debouncedSearch = useMemo(
    () => debounce(fetchLatLngFromSearch, 800),
    []
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add new project"
      size="lg"
      maxWidth="550px"
      headerIcon={ICON_NAMES.BRIEFCASE}
    >
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Project Name */}
        <Input
          type="text"
          placeholder="Project Name"
          value={formData.projectName}
          onChange={(e) => handleInputChange("projectName", e.target.value)}
        />

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

        {/* Project Location for submission (not map search) */}
        <Input
          type="text"
          placeholder="Project Location (form data)"
          value={formData.projectLocation}
          onChange={(e) =>
            handleInputChange("projectLocation", e.target.value)
          }
        />

        {/* Site name */}
        <Input
          type="text"
          placeholder="Site Name"
          value={formData.siteName}
          onChange={(e) => handleInputChange("siteName", e.target.value)}
        />

        {/* Client */}
        <Dropdown
          options={clients.map((c) => ({
            value: c._id || c.id,
            label: c.companyName || c.name,
          }))}
          value={formData.clientId}
          onChange={(val) => handleInputChange("clientId", val)}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            onClick={() => onSubmit(formData)}
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProjectModal;
