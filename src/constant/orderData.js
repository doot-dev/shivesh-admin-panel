export const ordersData = [
  {
    id: "ORD-123",
    sno: "ORD-123",
    clientName: "Lodha Group",
    site: "Thane",
    product: "RMC",
    grade: "30 m3",
    quantity: "150 m3",
    date: "01.09.2025",
    time: "10:30 AM",
    status: "New Order",
    location: "Thane Plant",
    fieldTechnician: "TM 01",
    tmDetails: [
      {
        id: "TM 01",
        truckNo: "MH 01 4756",
        quantity: "6 m3",
        batchStartTime: "10:00 AM",
        batchEndTime: "12:00 PM",
        challanNo: "284897693",
      },
      {
        id: "TM 02",
        truckNo: "MH 01 4756",
        quantity: "6 m3",
        batchStartTime: "10:00 AM",
        batchEndTime: "12:00 PM",
        challanNo: "284897593",
      },
    ],
    activityLog: [
      {
        id: "ACT-1",
        title: "Order created",
        description: "Order created by dispatch team.",
        time: "10:20 AM",
      },
      {
        id: "ACT-2",
        title: "Technician assigned",
        description: "TM 01 was assigned to this order.",
        time: "10:35 AM",
      },
    ],
  },
  {
    id: "ORD-1002",
    sno: "ORD-1002",
    clientName: "Nimbus Infra",
    site: "Pune Site A",
    product: "Concrete Mix",
    grade: "25 m3",
    quantity: "120 m3",
    date: "15.03.2026",
    time: "10:15 AM",
    status: "In Progress",
    location: "Pune Plant",
    fieldTechnician: "TM 04",
    tmDetails: [
      {
        id: "TM 04",
        truckNo: "MH 12 AB 9876",
        quantity: "5 m3",
        batchStartTime: "11:00 AM",
        batchEndTime: "12:30 PM",
        challanNo: "99881234",
      },
    ],
    activityLog: [
      {
        id: "ACT-3",
        title: "Dispatch updated",
        description: "Truck dispatched from plant.",
        time: "11:20 AM",
      },
    ],
  },
  {
    id: "ORD-1003",
    sno: "ORD-1003",
    clientName: "Greenline Builders",
    site: "Nashik Plant",
    product: "RMC",
    grade: "30 m3",
    quantity: "90 m3",
    date: "15.03.2026",
    time: "11:05 AM",
    status: "Completed",
    location: "Nashik Yard",
    fieldTechnician: "TM 02",
    tmDetails: [
      {
        id: "TM 02",
        truckNo: "MH 15 CD 2211",
        quantity: "6 m3",
        batchStartTime: "09:30 AM",
        batchEndTime: "11:00 AM",
        challanNo: "88771122",
      },
    ],
    activityLog: [
      {
        id: "ACT-4",
        title: "Order completed",
        description: "Final batch completed and acknowledged.",
        time: "12:15 PM",
      },
    ],
  },
];

export const vendorOptions = [
  { label: "Lodha Group Vendor", value: "lodha-vendor" },
  { label: "Nimbus Infra Vendor", value: "nimbus-vendor" },
  { label: "Greenline Vendor", value: "greenline-vendor" },
];

export const locationOptions = [
  { label: "Thane Plant", value: "thane-plant" },
  { label: "Pune Plant", value: "pune-plant" },
  { label: "Nashik Yard", value: "nashik-yard" },
];

export const technicianOptions = [
  { label: "TM 01", value: "tm-01" },
  { label: "TM 02", value: "tm-02" },
  { label: "TM 04", value: "tm-04" },
];
