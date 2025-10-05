import { useState } from "react";
import { Icon, ICON_NAMES } from "../icons";
import Button from "./Button";
import Dropdown from "./Dropdown";

const Table = ({
  data = [],
  columns = [],
  onRowClick,
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
  actions = [],
  loading = false,
  sortable = false,
  onSort,
  sortBy = "",
  sortOrder = "asc",
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);

  // Pagination options
  const paginationOptions = [
    { value: "5", label: "5" },
    { value: "10", label: "10" },
    { value: "25", label: "25" },
    { value: "50", label: "50" },
  ];

  const totalPages = Math.ceil(data.length / itemsPerPageState);
  const startIndex = (currentPage - 1) * itemsPerPageState;
  const endIndex = startIndex + itemsPerPageState;
  const currentData = data.slice(startIndex, endIndex);

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
      const badgeConfig = column.badgeConfig?.[value] || {
        color: "var(--color-text-secondary)",
        backgroundColor: "var(--color-background)",
      };

      return (
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
          style={{
            color: badgeConfig.color,
            backgroundColor: badgeConfig.backgroundColor,
          }}
        >
          <span
            className="inline-block w-1 h-1 rounded-full mr-1"
            style={{ backgroundColor: badgeConfig.color }}
          ></span>
          {value}
        </span>
      );
    }

    return item[column.key];
  };

  const renderActions = (item) => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className="flex items-center space-x-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => action.onClick(item)}
            className={`px-2 py-1 text-xs font-medium rounded hover:bg-gray-50 transition-colors border-none outline-none ${
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
        className={`p-4 border-b border-border ${mobileCardClassName}`}
        onClick={() => onRowClick?.(item)}
      >
        {columns.map((column, colIndex) => {
          if (column.hideOnMobile) return null;

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
                  {colIndex === 0 && actions && (
                    <div className="ml-2">{renderActions(item)}</div>
                  )}
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

        {actions && !columns.some((col) => col.mobileLabel) && (
          <div className="mt-3 flex items-center justify-end">
            {renderActions(item)}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="text-text-secondary">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`bg-white rounded-lg shadow overflow-hidden ${className}`}
      >
        {/* Search Bar */}
        {searchable && (
          <div className="p-4 border-b border-border">
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
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {data.length === 0 && (
          <div className="flex items-center justify-center py-12">
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

        {/* Mobile Cards View */}
        {data.length > 0 && showMobileCards && (
          <div className="md:hidden">
            {currentData.map((item, index) => renderMobileCard(item, index))}
          </div>
        )}

        {/* Desktop Table View */}
        {data.length > 0 && (
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead
                className={`bg-border text-white md:h-[64px] ${headerClassName}`}
              >
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={`px-6 py-3 text-left md:text-base font-semibold   tracking-wider ${
                        sortable && column.sortable !== false
                          ? "cursor-pointer select-none group hover:bg-background-hover"
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
                    <th className="px-6 py-3 text-left md:text-base font-semibold   tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className={`bg-white ${rowClassName}`}>
                {currentData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    className={`hover:bg-background-hover transition-colors md:h-[64px] border-b border-[#E2E2E2] 
                   
      ${onRowClick ? "cursor-pointer" : ""}`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 whitespace-nowrap text-xs font-medium ${
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {renderActions(item)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Pagination */}
      {showPagination && data.length > 0 && (
        <div className="px-0 py-3 bg-white ">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <span className="hidden sm:inline">
                Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of{" "}
                {data.length} results
              </span>
              <span className="sm:hidden">
                {startIndex + 1}-{Math.min(endIndex, data.length)} of{" "}
                {data.length}
              </span>
              <Dropdown
                options={paginationOptions}
                value={itemsPerPageState.toString()}
                onChange={(value) => {
                  setItemsPerPageState(Number(value));
                  setCurrentPage(1);
                }}
                width="80px"
                height="32px"
                className="ml-2"
              />
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 border border-border rounded text-sm hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous"
              >
                <Icon name={ICON_NAMES.CHEVRON_LEFT} size={16} />
              </button>

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
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded transition-colors ${
                        currentPage === pageNum
                          ? "text-white"
                          : "border border-border hover:bg-background-hover"
                      }`}
                      style={
                        currentPage === pageNum
                          ? { backgroundColor: "var(--color-primary)" }
                          : {}
                      }
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 border border-border rounded text-sm hover:bg-background-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next"
              >
                <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Table;
