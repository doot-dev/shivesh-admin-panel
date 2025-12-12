import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Tabs from "../components/ui/Tabs";
import { Table } from "../components/ui";
import { useState } from "react";
import ClientKYCModal from "../components/modals/clients/clientKycModal";


const ProjectsTab = () => {
    const columns = [
        {
            key: "projectName",
            header: "Project Name"
        },
        {
            key: "location",
            header: "Location"
        },
        {
            key: "startDate",
            header: "Start Date",
        },
        {
            key: "endDate",
            header: "End Date"
        },
        {
            key: "status",
            header: "Status"
        }
    ]

    return (
        <>
            <Table columns={columns} />
        </>
    )
}

const OrdersTab = () => {
    const columns = [
        {
            key: "orderId",
            header: "Order ID"
        },
        {
            key: "date",
            header: "Date"
        },
        {
            key: "amount",
            header: "Amount",
        },
        {
            key: "orderStatus",
            header: "Order Status"
        },
        {
            key: "paymentStatus",
            header: "Payment Status"
        }
    ]
    return (
        <>
            <Table columns={columns} />
        </>
    )
}

const BillingTab = () => {
    const columns = [
        {
            key: "invoiceId",
            header: "Invoice ID"
        },
        {
            key: "date",
            header: "Date"
        },
        {
            key: "amount",
            header: "Amount",
        },
        {
            key: "status",
            header: "Status"
        },
    ]
    return (
        <>
            <Table columns={columns} />
        </>
    )
}

const ClientDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const tabs = [
        { label: "Projects", content: <ProjectsTab /> },
        { label: "Orders", content: <OrdersTab /> },
        { label: "Billing", content: <BillingTab /> },
    ];
    const [kycDoc, setKycDoc] = useState(false);
    const handleKyc = () => {
        setKycDoc(true)
    }
    const UploadKycDoc = () =>{
        console.log("Submit sdfsdf")
    }
    console.log("kdjhfsjdfhsjdf", id)
    return (
        <>
            <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
                <div className="text-sm text-gray-500 mb-4">
                    <span
                        className="hover:underline cursor-pointer"
                        onClick={() => navigate("/clients")}
                    >
                        Clients
                    </span>
                    &gt; <span className="hover:underline cursor-pointer">{id}</span>{" "}
                    &gt; <span className="text-blue-600 font-medium">Client detail</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800">Name</h1>
                    <div className="flex gap-3 mt-3 sm:mt-0">
                        {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium transition">
            ✏️ Edit
          </button> */}
                        <button
                            // onClick={handleAddActivity}
                            className="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleKyc}
                            className="px-4 py-2 bg-primary hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition"
                        >
                            KYC 
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lead Details Card */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-[#9BB3F4] p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Client details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-3 text-sm text-gray-700">
                            <div>
                                <p className="text-gray-500">Client Name</p>
                                <p className="font-medium">{id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Phone</p>
                                <p className="font-medium">{id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">E-mail</p>
                                <p className="font-medium">{id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Status</p>
                                <p className="font-medium">{id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Address</p>
                                <p className="font-medium">{id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">GST No.</p>
                                <p className="font-medium">{id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">PAN No.</p>
                                <p className="font-medium">{id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">KYC </p>
                                <p className="font-medium">{id}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="mt-8">
                    <Tabs tabs={tabs} />
                </div>
            </div>
            <ClientKYCModal isOpen={kycDoc} onClose={setKycDoc(false)} onSubmit={UploadKycDoc} />
        </>
    )
}
export default ClientDetailsPage;
