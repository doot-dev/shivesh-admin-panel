import { useNavigate } from "react-router-dom";
import { Icon, ICON_NAMES } from "../components/icons";
import { Button, Dropdown, Table } from "../components/ui";
import FullPageLoader from "../components/ui/FullPageLoader";
import { ordersData } from "../constant/orderData";

const OrdersPage = () => {
    const navigate = useNavigate();
    const handleView = async (e) => {
        navigate(`/orders/${e.id || e.sno}`, { state: { order: e } });
        // setLoadingUserData(true);
        // try {
        //   const userData = await dispatch(fetchUserById(user.id)).unwrap();
        //   setSelectedUser(userData);
        //   setModalState((p) => ({ ...p, edit: true }));
        // } finally {
        //   setLoadingUserData(false);
        // }
    };
    const tableData = ordersData.map((order) => ({
        ...order,
        date: `${order.date}, ${order.time}`,
    }));

    const columns = [
        { key: "sno", header: "Order No." },
        { key: "clientName", header: "Client Name" },
        { key: "site", header: "Site" },
        {
            key: "product",
            header: "Product & Qty.",
            render: (_value, item) => `${item.product} (${item.quantity})`,
        },
        { key: "date", header: "Date & Time" },
        {
            key: "status", header: "Status", type: "badge",
            badgeConfig: {
                "New Order": { color: "var(--color-success)", backgroundColor: "var(--color-success-light)" },
                "In Progress": { color: "var(--color-primary)", backgroundColor: "var(--color-primary-light)" },
                Completed: { color: "var(--color-success)", backgroundColor: "var(--color-success-light)" },
            },
        }
    ];

    const actions = [
        { text: "View", onClick: handleView, textColor: "var(--color-primary)" },
    ];

    return (
        <>
            <FullPageLoader message="Loading" />
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Orders</h1>
                    <p className="text-gray-600">View and manage Orders</p>
                </div>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1 max-w-[40%]">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name or contact"
                                // value={searchTerm}
                                // onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <Dropdown
                            // options={roleOptions}
                            // value={filters.role}
                            // onChange={(v) => setFilters((p) => ({ ...p, role: v }))}
                            placeholder="Status"
                            width="200px"
                            height="40px"
                        />
                        <Dropdown
                            // options={statusOptions}
                            // value={filters.status}
                            // onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
                            placeholder="Date"
                            width="150px"
                            height="40px"
                        />
                    </div>
                    <Button
                        // onClick={handleAddLead}
                        leftIcon={ICON_NAMES.PLUS}
                        variant="primary"
                        size="md"
                        height="40px"
                        className="md:!h-[40px] md:!px-6 md:!py-3 md:!text-base text-sm px-4 py-2"
                    >
                        Add Order
                    </Button>
                </div>
                <Table data={tableData} columns={columns} actions={actions} showPagination itemsPerPage={10} emptyMessage="No Orders Found" />
            </div>
        </>
    );
}

export default OrdersPage;