import { useState } from "react";
import { Icon, ICON_NAMES } from "../icons";
import Button from "./Button";
import Dropdown from "./Dropdown";
import { StatusChip } from "./StatusChip";
import { statusLabel } from "../../utils/labels";

const Table = ({
  data = [],
  columns = [],
  onRowClick: onRowClickProp,
  showPagination = true,
  itemsPerPage = 10,
  searchable = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  emptyMessage = "No data available",
  className = "",
  rowClassName = "",
  headerClassName = "",
  mobileCardClassName = "",
  showMobileCards = true,
  actions: actionsProp = [],
  loading = false,
  sortable = false,
  onSort,
  sortBy = "",
  sortOrder = "asc",
  mainTotalPages,
  mainTotalItems,
  onItemPerPageChange = () => {},
  onPageChange = () => {},
}) => {
  // A "View" action becomes the row itself: tap or click anywhere on the row
  // to open it, and the separate View link is dropped. Edit/Delete stay.
  const viewAction = !onRowClickProp && (actionsProp || []).find((a) => /^view$/i.test(String(a?.text ?? a?.title ?? "").trim()));
  const onRowClick = onRowClickProp ?? (viewAction ? (item) => viewAction.onClick(item) : undefined);
  const actions = viewAction ? actionsProp.filter((a) => a !== viewAction) : actionsProp;
  const rowKeyDown = (item) => (e) => {
    if (onRowClick && (e.key === "Enter" || e.key === " ") && e.target === e.currentTarget) {
      e.preventDefault();
      onRowClick(item);
    }
  };
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);

  // Pagination options
  const paginationOptions = [
    // { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
  ];

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];
  
  const totalPages =
    mainTotalPages || Math.ceil(safeData.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const endIndex = startIndex + itemsPerPageState;
  const currentData = safeData.slice(startIndex, endIndex);

  const handleSort = (columnKey) => {
    if (!sortable || !onSort) return;

    const newOrder =
      sortBy === columnKey && sortOrder === "asc" ? "desc" : "asc";
    onSort(columnKey, newOrder);
  };

  const renderSortIcon = (columnKey) => {
    if (!sortable || sortBy !== columnKey) {
      return (
        <Icon
          name={ICON_NAMES.CHEVRON_UP_DOWN}
          size={12}
          className="ml-1 opacity-0 group-hover:opacity-50"
        />
      );
    }

    return (
      <Icon
        name={
          sortOrder === "asc" ? ICON_NAMES.CHEVRON_UP : ICON_NAMES.CHEVRON_DOWN
        }
        size={12}
        className="ml-1 opacity-75"
      />
    );
  };

  const renderCellContent = (column, item) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }

    if (column.type === "badge") {
      const value = item[column.key];
      const cfg = column.badgeConfig?.[value];
      return <StatusChip status={value}>{cfg?.label ?? statusLabel(value)}</StatusChip>;
    }

    return item[column.key];
  };

  const renderActions = (item) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="flex items-center gap-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={(e) => {
              // Don't also open the row when Edit/Delete is pressed.
              e.stopPropagation();
              action.onClick(item);
            }}
            className={`min-h-9 px-2.5 py-1.5 text-[13px] font-semibold rounded-lg transition-colors border-none outline-none focus-visible:ring-2 focus-visible:ring-border ${
              action.className || ""
            }`}
            style={{
              color: action.textColor || "var(--color-text-primary)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (action.hoverBackgroundColor) {
                e.target.style.backgroundColor = action.hoverBackgroundColor;
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
            title={action.title}
          >
            {action.text || action.title}
          </button>
        ))}
      </div>
    );
  };

  const renderMobileCard = (item, index) => {
    return (
      <div
        key={item.id || index}
        className={`p-4 border-b border-primary-light last:border-b-0 active:bg-background-hover ${onRowClick ? "cursor-pointer" : ""} ${mobileCardClassName}`}
        onClick={() => onRowClick?.(item)}
        onKeyDown={rowKeyDown(item)}
        tabIndex={onRowClick ? 0 : undefined}
        role={onRowClick ? "link" : undefined}
      >
        {columns.map((column, colIndex) => {
          // A running serial number is noise on a phone card.
          if (column.hideOnMobile || /^s\.?\s?no\.?$/i.test(String(column.header ?? '').trim())) return null;

          return (
            <div key={colIndex} className="mb-2 last:mb-0">
              {column.mobileLabel && (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium text-text-primary">
                      {renderCellContent(column, item)}
                    </span>
                    {column.mobileSubtext && (
                      <p className="text-xs text-text-secondary">
                        {typeof column.mobileSubtext === "function"
                          ? column.mobileSubtext(item)
                          : item[column.mobileSubtext]}
                      </p>
                    )}
                  </div>
                  {actions?.length > 0 && <div className="ml-2">{renderActions(item)}</div>}
                </div>
              )}

              {!column.mobileLabel && column.key !== "actions" && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-secondary">
                    {column.header}:
                  </span>
                  <span className="text-sm text-text-primary">
                    {renderCellContent(column, item)}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {actions?.length > 0 && !columns.some((col) => col.mobileLabel) && (
          <div className="mt-3 flex items-center justify-end">
            {renderActions(item)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="sv-card overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-light border-t-primary" aria-label="Loading" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`sv-card overflow-hidden ${className}`}
      >
        {/* Search Bar */}
        {searchable && (
          <div className="p-4 border-b border-primary-light">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon
                  name={ICON_NAMES.SEARCH}
                  size={16}
                  color="var(--color-text-secondary)"
                />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full h-11 pl-10 pr-4 border border-primary-light rounded-xl focus:outline-none focus:border-border"
              />
            </div>
          </div>
        )}

        {/* Mobile Cards View */}
        {safeData.length > 0 && showMobileCards && (
          <div className="md:hidden">
            {currentData.map((item, index) => renderMobileCard(item, index))}
          </div>
        )}

        {/* Empty State for Mobile */}
        {safeData.length === 0 && showMobileCards && (
          <div className="md:hidden flex items-center justify-center py-12">
            <div className="text-center">
              <Icon
                name={ICON_NAMES.INBOX}
                size={48}
                color="var(--color-text-secondary)"
                className="mx-auto mb-4"
              />
              <p className="text-text-secondary">{emptyMessage}</p>
            </div>
          </div>
        )}

        {/* Desktop Table View - Always show headers */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full">
            <thead
              className={`bg-background-hover text-text-secondary ${headerClassName}`}
            >
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    className={`px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${
                      sortable && column.sortable !== false
                        ? "cursor-pointer select-none group hover:text-primary"
                        : ""
                    }`}
                    onClick={() =>
                      column.sortable !== false && handleSort(column.key)
                    }
                  >
                    <div className="flex items-center">
                      {column.header}
                      {sortable &&
                        column.sortable !== false &&
                        renderSortIcon(column.key)}
                    </div>
                  </th>
                ))}
                {actions && actions.length > 0 && (
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className={`bg-white ${rowClassName}`}>
              {safeData.length > 0 ? (
                currentData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={`hover:bg-background-hover transition-colors border-t border-primary-light 
                   
      ${onRowClick ? "cursor-pointer focus-visible:bg-background-hover focus-visible:outline-none" : ""}`}
                    onClick={() => onRowClick?.(item)}
                    onKeyDown={rowKeyDown(item)}
                    tabIndex={onRowClick ? 0 : undefined}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-5 py-3.5 whitespace-nowrap text-sm ${
                          column.className ||
                          (colIndex === 0
                            ? "text-text-primary font-medium"
                            : "text-text-primary")
                        }`}
                      >
                        {renderCellContent(column, item)}
                      </td>
                    ))}
                    {actions && actions.length > 0 && (
                      <td className="px-5 py-3 whitespace-nowrap text-sm font-medium">
                        {renderActions(item)}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={
                      columns.length + (actions && actions.length > 0 ? 1 : 0)
                    }
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <Icon
                        name={ICON_NAMES.INBOX}
                        size={48}
                        color="var(--color-text-secondary)"
                        className="mb-4"
                      />
                      <p className="text-text-secondary">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      {showPagination && safeData.length > 0 && (
        <div className="px-0 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <span className="hidden sm:inline">
                Showing {startIndex + 1} to {Math.min(endIndex, safeData.length)} of{" "}
                {mainTotalItems || safeData.length} results
              </span>
              <span className="sm:hidden">
                {startIndex + 1}-{Math.min(endIndex, safeData.length)} of{" "}
                {mainTotalItems || safeData.length}
              </span>
              <Dropdown
                options={paginationOptions}
                value={itemsPerPageState.toString()}
                onChange={(value) => {
                  setItemsPerPageState(Number(value));
                  setCurrentPage(1);
                  onItemPerPageChange(Number(value));
                  onPageChange(1);
                }}
                width="80px"
                height="32px"
                className="ml-2"
              />
            </div>

            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => {
                  const newPage = Math.max(1, currentPage - 1);
                  setCurrentPage(newPage);
                  onPageChange(newPage);
                }}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Icon
                  name={ICON_NAMES.CHEVRON_LEFT}
                  size={16}
                  className="mr-1"
                />
                Prev
              </button>

              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        onPageChange(pageNum);
                      }}
                      className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  const newPage = Math.min(totalPages, currentPage + 1);
                  setCurrentPage(newPage);
                  onPageChange(newPage);
                }}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <Icon
                  name={ICON_NAMES.CHEVRON_RIGHT}
                  size={16}
                  className="ml-1"
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Table;
