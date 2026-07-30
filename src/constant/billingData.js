export const BILLING_STATUSES = ["Paid", "Pending", "Not uploaded"];

export const BILLING_STATUS_BADGE = {
  Paid: { color: "#1E3A8A", backgroundColor: "#E5ECFF" },
  Pending: { color: "#D97706", backgroundColor: "#FEF3C7" },
  "Not uploaded": { color: "#D32F2F", backgroundColor: "#FFEBEE" },
};

export const TM_STATUS_BADGE = {
  Accepted: { color: "#2E7D32", backgroundColor: "#E8F5E8" },
  Rejected: { color: "#D32F2F", backgroundColor: "#FFEBEE" },
  Pending: { color: "#D97706", backgroundColor: "#FEF3C7" },
};

export const billingData = [
  {
    id: "BILL-001",
    orderNo: "ORD 123",
    clientName: "Lodha Group",
    product: "RMC",
    quantity: "12 m3",
    assignedTrucks: 3,
    billingStatus: "Paid",
    billDetails: {
      product: "RMC",
      grade: "30 m3",
      quantity: "12 m3",
      clientName: "Lodha Group",
      site: "Thane",
      contactNo: "9849859305",
      orderNo: "ORD 123",
      vendorName: "ACC cement",
      date: "01.09.2025",
      amount: "₹35,000",
    },
    fieldTechnician: {
      name: "Aniket Deshmukh",
      contactNo: "9849859305",
      employeeId: "012",
    },
    tmDetails: [
      {
        id: "TM 01",
        truckNo: "MH 01 4756",
        quantity: "6 m3",
        batchStartTime: "10:00 AM",
        batchEndTime: "12:00 PM",
        challanNo: "284897593",
        challanUrl: "#",
        status: "Accepted",
        reason: "",
      },
      {
        id: "TM 02",
        truckNo: "MH 01 4756",
        quantity: "6 m3",
        batchStartTime: "10:00 AM",
        batchEndTime: "12:00 PM",
        challanNo: "284897593",
        challanUrl: "#",
        status: "Rejected",
        reason: "XYZ",
      },
    ],
    activityLog: [
      {
        id: 1,
        title: "Bill uploaded",
        by: "Rakesh Mishra",
        at: "01.09.2025, 04:30 PM",
      },
      {
        id: 2,
        title: "TM 02 challan rejected",
        by: "Aniket Deshmukh",
        at: "01.09.2025, 02:15 PM",
      },
      {
        id: 3,
        title: "Order marked as delivered",
        by: "Aniket Deshmukh",
        at: "01.09.2025, 12:10 PM",
      },
    ],
  },
  {
    id: "BILL-002",
    orderNo: "ORD 123",
    clientName: "Hiranandani",
    product: "RMC",
    quantity: "15 m3",
    assignedTrucks: 2,
    billingStatus: "Not uploaded",
    billDetails: {
      product: "RMC",
      grade: "25 m3",
      quantity: "15 m3",
      clientName: "Hiranandani",
      site: "Powai",
      contactNo: "9822014455",
      orderNo: "ORD 123",
      vendorName: "UltraTech",
      date: "03.09.2025",
      amount: "₹42,000",
    },
    fieldTechnician: {
      name: "Suresh Patil",
      contactNo: "9765412300",
      employeeId: "018",
    },
    tmDetails: [
      {
        id: "TM 01",
        truckNo: "MH 02 8891",
        quantity: "8 m3",
        batchStartTime: "09:00 AM",
        batchEndTime: "11:00 AM",
        challanNo: "284897601",
        challanUrl: "#",
        status: "Accepted",
        reason: "",
      },
      {
        id: "TM 02",
        truckNo: "MH 02 8891",
        quantity: "7 m3",
        batchStartTime: "11:30 AM",
        batchEndTime: "01:30 PM",
        challanNo: "284897602",
        challanUrl: "",
        status: "Pending",
        reason: "",
      },
    ],
    activityLog: [
      {
        id: 1,
        title: "Order marked as delivered",
        by: "Suresh Patil",
        at: "03.09.2025, 01:45 PM",
      },
      {
        id: 2,
        title: "TM 01 challan accepted",
        by: "Rakesh Mishra",
        at: "03.09.2025, 11:20 AM",
      },
    ],
  },
];

export const getBillById = (id) => billingData.find((b) => b.id === id) || null;
