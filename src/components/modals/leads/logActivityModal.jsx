import React, { useState } from "react";
import { ICON_NAMES } from "../../icons"
import { Input, Button, Modal } from "../../ui"
import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";

const LogsActivityModal = ({ isOpen, handleClose }) => {
    const [date, setDate] = useState(null);
    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Add New Log Activity"
            size="lg"
            maxWidth="700px"
            headerIcon={ICON_NAMES.ADD_NEW_USER}
        >
            <form className="space-y-4">
                <div className="flex gap-4" >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                className="custom-datepicker"
                                label="Select date"
                                value={date}
                                onChange={(newValue) => setDate(newValue)}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                            />
                        </LocalizationProvider>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <TimePicker label="Time picker"  />
                        </LocalizationProvider>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign Lead
                    </label>
                    <select className="w-full px-3 py-2 border rounded-lg outline-0 border-border hover:border-opacity-75">
                        <option value="">Select a user</option>
                        <option>sdfsdf</option>
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
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                    </label>
                    <textarea className="w-full px-3 py-2 border rounded-lg outline-0 border-border hover:border-opacity-75" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        className="w-full px-3 py-2 border rounded-lg outline-0 border-border hover:border-opacity-75"
                    >
                        <option value="">In progress</option>

                        <option >
                            sdfsdf
                        </option>

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