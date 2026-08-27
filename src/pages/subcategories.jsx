import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Table } from "../components/ui";
import FullPageLoader from "../components/ui/FullPageLoader";
import { Icon, ICON_NAMES } from "../components/icons";
import AddSubcategoryModal from "../components/modals/subcategory/AddSubcategoryModal";
import EditSubcategoryModal from "../components/modals/subcategory/EditSubcategoryModal";
import DeleteSubcategoryModal from "../components/modals/subcategory/DeleteSubcategoryModal";
import {
  fetchSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from "../features/subcategory/subcategorySlice";

/**
 * Sub-category master list. This is the single source for sub-category names;
 * project products copy the chosen name onto themselves, so editing a name
 * here does NOT retro-update project products that already used it.
 */
const Subcategories = () => {
  const dispatch = useDispatch();
  const { subcategoryList = [], loading } = useSelector(
    (state) => state.subcategories
  );

  const [filters, setFilters] = useState({ search: "" });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const refreshSubcategories = useCallback(() => {
    dispatch(fetchSubcategories());
  }, [dispatch]);

  useEffect(() => {
    refreshSubcategories();
  }, [refreshSubcategories]);

  const filteredSubcategories = subcategoryList
    .filter((item) => {
      const s = filters.search.toLowerCase();
      return !s || item.name?.toLowerCase().includes(s);
    })
    .map((item, i) => ({
      ...item,
      sNo: String(i + 1).padStart(2, "0"),
      status: item.isActive ? "Active" : "Inactive",
    }));

  const handleAdd = () => setShowAddModal(true);

  const handleAddSubmit = async (data) => {
    try {
      setIsAdding(true);
      await dispatch(createSubcategory(data)).unwrap();
      await refreshSubcategories();
      setShowAddModal(false);
    } catch (error) {
      // thunk already surfaced the server message via toast
      console.error("Error adding sub-category:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      setIsEditing(true);
      await dispatch(updateSubcategory(data)).unwrap();
      await refreshSubcategories();
      setShowEditModal(false);
      setSelectedSubcategory(null);
    } catch (error) {
      console.error("Error updating sub-category:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleDelete = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (subcategory) => {
    try {
      setIsDeleting(true);
      await dispatch(deleteSubcategory(subcategory.id)).unwrap();
      await refreshSubcategories();
      setShowDeleteModal(false);
      setSelectedSubcategory(null);
    } catch (error) {
      console.error("Error deleting sub-category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: "sNo",
      header: "S.No",
      className: "text-text-primary font-medium",
    },
    {
      key: "name",
      header: "Sub-category",
      className: "text-text-primary font-medium",
      mobileLabel: true,
    },
    {
      key: "status",
      header: "Status",
      type: "badge",
      badgeConfig: {
        Active: {
          color: "#16A34A",
          backgroundColor: "#D1FAE5",
        },
        Inactive: {
          color: "#DC2626",
          backgroundColor: "#FFD5C9",
        },
      },
    },
  ];

  const actions = [
    {
      text: "Edit",
      onClick: handleEdit,
      textColor: "var(--color-success)",
      hoverBackgroundColor: "var(--color-success-light)",
      title: "Edit",
    },
    {
      text: "Delete",
      onClick: handleDelete,
      textColor: "var(--color-error)",
      hoverBackgroundColor: "var(--color-error-light)",
      title: "Delete",
    },
  ];

  const getLoadingMessage = () => {
    if (loading) return "Loading sub-categories...";
    if (isAdding) return "Adding sub-category...";
    if (isEditing) return "Updating sub-category...";
    if (isDeleting) return "Deleting sub-category...";
    return "Processing...";
  };

  return (
    <>
      <FullPageLoader
        isVisible={loading || isAdding || isEditing || isDeleting}
        message={getLoadingMessage()}
        spinnerSize="w-20 h-20"
        spinnerVariant="default"
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Sub-categories
          </h1>
          <p className="text-gray-600">
            Manage the sub-categories available when adding project products
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex flex-1 max-w-[35%] md:max-w-[30%] md:h-[50px] border border-border rounded-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
            </div>
            <input
              type="text"
              placeholder="Search by name"
              value={filters.search}
              onChange={(e) =>
                setFilters((p) => ({ ...p, search: e.target.value }))
              }
              className="w-full pl-10 pr-4 py-2 md:h-[50px] focus:outline-none"
            />
          </div>

          <Button
            onClick={handleAdd}
            leftIcon={ICON_NAMES.PLUS}
            variant="primary"
            size="md"
            height="40px"
            className="md:!h-[50px] md:!px-6 md:!py-3 md:!text-base text-sm px-4 py-2"
          >
            <span className="hidden sm:inline">Add Sub-category</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Table */}
        <Table
          data={filteredSubcategories}
          columns={columns}
          actions={actions}
          showPagination
          itemsPerPage={10}
          emptyMessage="No sub-categories found matching your criteria"
        />

        {/* Modals */}
        <AddSubcategoryModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
          loading={isAdding}
        />

        <EditSubcategoryModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedSubcategory(null);
          }}
          subcategory={selectedSubcategory}
          onSubmit={handleEditSubmit}
          loading={isEditing}
        />

        <DeleteSubcategoryModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedSubcategory(null);
          }}
          subcategory={selectedSubcategory}
          onDelete={handleConfirmDelete}
          loading={isDeleting}
        />
      </div>
    </>
  );
};

export default Subcategories;
