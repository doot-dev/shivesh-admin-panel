import React, { useCallback, useState } from "react";
import { ICON_NAMES } from "../../icons"
import { Input, Button, Modal } from "../../ui"
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import { useFetch } from "../../../hooks/useFetch";
import { getUsers } from "../../../services/userService";
const LogsActivityModal = ({ isOpen, handleClose, onSubmit, leadId }) => {
    const [date, setDate] = useState(null);
    const [logData, setLogData] = useState({
        date: "",
        time: "",
        title: "",
        description: "",
        status: "",
        assignedToId: 0,
    })
    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setLogData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const transformUsersData = useCallback(async () => {
        const response = await getUsers();

        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.users)) return response.users;
        if (response && typeof response === "object") return [response];

        return [];
    }, []);

    const { data: usersData = [], loading } = useFetch(transformUsersData, [], {
        autoFetch: true,
        showToast: true,
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(logData);
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Log Activity"
            size="lg"
            maxWidth="700px"
            headerIcon={ICON_NAMES.ADD_NEW_USER}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4" >
                    <div className="w-[48%]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                className="custom-datepicker"
                                label="Select date"
                                value={logData.date ? dayjs(logData.date) : null}
                                onChange={(newValue) =>
                                    handleInputChange(
                                        "date",
                                        newValue ? newValue.format("YYYY-MM-DD") : ""
                                    )
                                }
                                slotProps={{ textField: { fullWidth: true } }}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </div>
                    <div className="w-[48%]">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker value={logData.time ? dayjs(logData.time, "HH:mm") : null}
                                onChange={(newValue) =>
                                    handleInputChange(
                                        "time",
                                        newValue ? newValue.format("HH:mm") : ""
                                    )
                                }
                                slotProps={{ textField: { fullWidth: true } }} />
                        </LocalizationProvider>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign Lead
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg outline-0 border-border hover:border-opacity-75" value={logData.assignedToId} onChange={(e) => handleInputChange("assignedToId", e.target.value ? Number(e.target.value) : "")} >
                        <option value="">Select Lead</option>
                        {
                            usersData?.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))
                        }
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                    </label>
                    <Input
                        type="text"
                        placeholder="Enter Title Here.."
                        className="w-full"
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        required
                        value={logData.title}
                        backgroundColor="input-bg"

                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                    </label>
                    <textarea className="w-full px-3 py-2 border rounded-lg outline-0 border-border hover:border-opacity-75"
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        required
                        value={logData.description}
                        backgroundColor="input-bg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        className="w-full px-3 py-2 border rounded-lg outline-0 border-border hover:border-opacity-75"
                        onChange={(e) => handleInputChange("status", e.target.value)}
                        required
                        value={logData.status}
                        backgroundColor="input-bg"
                    >
                        <option value="">Select Status</option>
                        <option value="NEW">New</option>
                        <option value="IN_PROGRESS">IN Progress</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="LOST">Lost</option>

                    </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                        Add Activity
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
export default LogsActivityModal