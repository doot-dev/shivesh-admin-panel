import { Modal, Button, Input, Checkbox } from "../../ui";
import { Icon, ICON_NAMES } from "../../icons";

const ViewUserModal = ({ isOpen, onClose, user, onEdit, onDelete }) => {
  if (!user) return null;

  const getRoleLabel = (roleValue) => {
    const roleMap = {
      FIELD_TECHNICIAN: "Field Technician",
      PROJECT_MANAGER: "Project Manager",
      ADMIN: "Admin",
    };
    return roleMap[roleValue] || roleValue;
  };

  const modalFooter = (
    <>
      <Button
        onClick={() => onEdit && onEdit(user)}
        variant="outline"
        className="px-6"
      >
        Edit
      </Button>
      <Button
        onClick={() => onDelete && onDelete(user)}
        variant="outline"
        className="px-6 text-error border-error hover:bg-error hover:text-white"
      >
        Delete user
      </Button>
    </>
  );
  return (
    <Modal
      headerIcon={ICON_NAMES.USER_DETAILS}
      isOpen={isOpen}
      onClose={onClose}
      title="User details"
      maxWidth="700px"
      size="lg"
      footer={modalFooter}
    >
      <div className="space-y-6">
        {/* User Icon */}
        {/* <div className="flex items-center mb-6">
          <div className="w-12 h-12  rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4">
            <Icon name={ICON_NAMES.USER_DETAILS} size={24} color="white" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">User details</h3>
        </div> */}

        {/* Employee Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Employee Name
          </label>
          <Input
            value={user.name || user.employeeName || ""}
            readOnly
            className="bg-gray-50"
          />
        </div>

        {/* Employee ID */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Employee ID
          </label>
          <Input
            value={user.employeeId || ""}
            readOnly
            className="bg-gray-50"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Role
          </label>
          <Input
            value={getRoleLabel(user.role) || ""}
            readOnly
            className="bg-gray-50"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Status
          </label>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div
                className={`w-4 h-4 rounded-full mr-2 ${
                  user.status ? "bg-success" : "bg-gray-300"
                }`}
              />
              <span className="text-sm text-text-primary">
                {user.status ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Username
          </label>
          <Input
            value={user.userName || user.username || ""}
            readOnly
            className="bg-gray-50"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Password
          </label>
          <Input value="••••••••" readOnly className="bg-gray-50" />
        </div>

        {/* Panel access — comes from the access role now, not the old
            per-user menuAccess list, which is no longer written. */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Panel access
          </label>
          <div className="rounded-lg border border-border bg-gray-50 p-3">
            {user.isSuperAdmin ? (
              <p className="text-sm font-medium text-purple-700">
                Super Admin — full access to everything
              </p>
            ) : user.roleRef?.name ? (
              <>
                <p className="text-sm font-medium text-text-primary">
                  {user.roleRef.name}
                </p>
                {user.roleRef.isActive === false && (
                  <p className="mt-1 text-xs text-amber-600">
                    This role is turned off, so the user currently has no
                    access.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-text-secondary">
                No access role assigned — this user can sign in but sees no
                menus.
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
      </div>
    </Modal>
  );
};

export default ViewUserModal;
