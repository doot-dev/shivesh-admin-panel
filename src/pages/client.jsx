import { useEffect, useState } from "react";
import { Icon, ICON_NAMES } from "../components/icons";
import Button from "../components/ui/Button";
import { Table } from "../components/ui";
import ClientDetailModal from "../components/modals/clients/clientDetailModal";
import { useNavigate } from "react-router-dom";
const ClientPage = () => {
    const navigate = useNavigate();
    const [filteredClient, setFilteredClient] = useState([]);
    const [showClientModal, setShowClientModal] = useState(false);
    const [clients, setClients] = useState([]);
    const handleClientSubmit = async (clientData, mode) => {
        if (mode === "add") {
            // setClients((prev) => [...prev, clientData]);
            // console.log("form data values of add lead", clientData)
            // try {
            //     const leadsRes = await leadService.addNewLead(clientData);
            //     console.log("Leads add Reesponse", leadsRes);
            // } catch (error) {
            //     console.error("Leads Error", error);
            // }
            // toast.success("Lead added successfully");
            console.log("Added data", clients)
        } else if (mode === "edit") {
            // const updated = clients.map((client) =>
            //     client.id === clientData.id ? clientData : lead
            // );
            // console.log("form data values of update lead", updated)
            // setClients(updated);
            // toast.success("Lead updated successfully");
            console.log("updated data", clients)
        }
        setShowClientModal(false);
    }

    const handleAddClient = () => {
        setShowClientModal(true);
    }

    const handleView = (vendor) => {
        console.log("viewing vendor:", vendor);
        navigate(`/clients/${vendor.sNo}`);
    }

    const columns = [
        { key: "sNo", header: "S.No" },
        { key: "name", header: "Client name" },
        {
            key: "contactPerson",
            header: "Phone",
            render: (value, vendor) => (
                <div>
                    <div className="font-semibold text-gray-900">
                        {vendor.contactPerson}
                    </div>
                    <div className="text-sm text-gray-500">
                        {vendor.contactPersonDesignation}
                    </div>
                </div>
            ),
        },
        {
            key: "email",
            header: "E-mail",
            render: (value, vendor) => (
                <div>
                    <div className="text-gray-900">{vendor.phone}</div>
                    <div className="text-sm text-gray-500">{vendor.email}</div>
                </div>
            ),
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
                    backgroundColor: "#FECACA",
                },
            },
        },
    ];
    const actions = [
        {
            text: "View",
            onClick: handleView,
            textColor: "var(--color-primary)",
        },
        {
            text: "Edit",
            //   onClick: handleEdit,
            textColor: "var(--color-success)",
        },
        {
            text: "Delete",
            //   onClick: handleDelete,
            textColor: "var(--color-error)",
        },
    ];
    useEffect(() => {
        // fake data
        const clients = [
            {
                sNo: 1,
                name: "TechNova Solutions",
                contactPerson: "Rohit Mehra",
                contactPersonDesignation: "Project Manager",
                phone: "+91 98765 43210",
                email: "rohit.mehra@technova.com",
                status: "Active",
            },
            {
                sNo: 2,
                name: "PixelWave Media",
                contactPerson: "Anita Verma",
                contactPersonDesignation: "Marketing Head",
                phone: "+91 99887 66554",
                email: "anita@pixelwave.in",
                status: "Inactive",
            },
            {
                sNo: 3,
                name: "UrbanBuild Constructions",
                contactPerson: "Sandeep Patil",
                contactPersonDesignation: "Operations Manager",
                phone: "+91 88990 11223",
                email: "sandeep.patil@urbanbuild.com",
                status: "Active",
            },
            {
                sNo: 4,
                name: "CloudVerse IT",
                contactPerson: "Megha Sharma",
                contactPersonDesignation: "CTO",
                phone: "+91 97234 55678",
                email: "megha@cloudverse.io",
                status: "Active",
            },
            {
                sNo: 5,
                name: "Evergreen Retail Pvt. Ltd.",
                contactPerson: "Ravi Nair",
                contactPersonDesignation: "Procurement Lead",
                phone: "+91 90012 34567",
                email: "ravi.nair@evergreenretail.in",
                status: "Inactive",
            },
        ];

        setFilteredClient(clients);
    }, []);
    return (
        <>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Client</h1>
                    <p className="text-gray-600">View and manage Client</p>
                </div>

                {/* Search + Add */}
                <div className="flex items-center justify-between mb-6">
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

                    <Button
                        onClick={handleAddClient}
                        leftIcon={ICON_NAMES.PLUS}
                        variant="primary"
                        size="md"
                        height="40px"
                        className="md:!h-[50px] md:!px-6 md:!py-3 md:!text-base text-sm px-4 py-2"
                    >
                        Add Client
                    </Button>
                </div>

                <Table data={filteredClient} columns={columns} actions={actions} itemsPerPage={10} emptyMessage="No Client found" />
                <ClientDetailModal isOpen={showClientModal} onClose={() => setShowClientModal(false)} onSubmit={handleClientSubmit} />
            </div>
        </>
    )
}
export default ClientPage;