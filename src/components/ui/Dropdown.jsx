import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

const Dropdown = ({
  options = [],
  value = "",
  onChange,
  placeholder = "Select...",
  className = "",
  width = "auto",
  height = "44px",
  disabled = false,
  error = false,
  searchable = false,
  maxHeight = "240px",
  position = "bottom",
  backgroundColor = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option?.label
          ?.toString()
          .toLowerCase()
          .includes(searchTerm?.toLowerCase() || ""),
      )
    : options;

  const selectedOption = options.find((option) => option?.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      setSearchTerm("");
    }
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const triggerBg = disabled
    ? "var(--color-background)"
    : backgroundColor === "input-bg"
      ? "var(--color-input-bg)"
      : "white";

  const borderColor = error
    ? "var(--color-error)"
    : isOpen
      ? "var(--color-primary)"
      : "var(--color-border)";

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
      style={{ width }}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className="w-full flex items-center justify-between gap-2 px-3.5 text-left rounded-xl border transition-all duration-150"
        style={{
          height,
          backgroundColor: triggerBg,
          borderColor,
          boxShadow: isOpen
            ? `0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent)`
            : "none",
          color: selectedOption
            ? "var(--color-text-primary)"
            : "var(--color-text-secondary)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span className="truncate text-sm font-medium">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={15}
          strokeWidth={2.5}
          color="var(--color-text-secondary)"
          style={{
            flexShrink: 0,
            transition: "transform 200ms",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Error message */}
      {error && typeof error === "string" && (
        <p className="mt-1 text-xs" style={{ color: "var(--color-error)" }}>
          {error}
        </p>
      )}

      {/* Menu */}
      {isOpen && (
        <div
          className={`absolute z-[9999] w-full rounded-xl border bg-white overflow-hidden ${
            position === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
          style={{
            borderColor: "var(--color-border)",
            boxShadow:
              "0 8px 24px rgba(30,58,138,0.12), 0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          {/* Search */}
          {searchable && (
            <div
              className="p-2.5"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{
                  background: "var(--color-input-bg)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Search
                  size={13}
                  color="var(--color-text-secondary)"
                  strokeWidth={2}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div style={{ maxHeight, overflowY: "auto" }}>
            {filteredOptions.length === 0 ? (
              <div
                className="py-6 text-center text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {searchable && searchTerm
                  ? "No results found"
                  : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value ?? index}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm text-left transition-colors duration-100"
                    style={{
                      backgroundColor: isSelected
                        ? "var(--color-primary-light)"
                        : "transparent",
                      color: isSelected
                        ? "var(--color-primary)"
                        : "var(--color-text-primary)",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor =
                          "var(--color-background)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        strokeWidth={2.5}
                        color="var(--color-primary)"
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
