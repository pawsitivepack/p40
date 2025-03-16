import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const ScheduleWalkForm = ({
	newEvent,
	setNewEvent,
	setShowForm,
	handleAddEvent,
}) => {
	const [marshals, setMarshals] = useState([]);
	const [selectedTime, setSelectedTime] = useState("");

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const marshalResponse = await api.get(
					`/users/getAllUsers?role=marshal`
				);
				setMarshals(marshalResponse.data);
			} catch (error) {
				console.error("Error fetching marshals:", error);
				toast.error("Failed to load marshals.");
			}
		};

		fetchOptions();
	}, []);

	// Handle Time Change (No UTC Conversion)
	const handleTimeChange = (time) => {
		const [hours, minutes] = time.split(":").map(Number);

		const updatedDate = new Date(newEvent.start);
		const day = updatedDate.getDay();

		// Restrict scheduling on Sat (6), Sun (0), and Mon (1)
		if ([0, 1, 6].includes(day)) {
			toast.error("Scheduling is not allowed on Saturday, Sunday, or Monday.");
			return;
		}

		updatedDate.setHours(hours);
		updatedDate.setMinutes(minutes);
		updatedDate.setSeconds(0);
		updatedDate.setMilliseconds(0);

		setSelectedTime(time);
		setNewEvent({
			...newEvent,
			start: updatedDate,
		});
	};

	// Time slots in from 10:00 AM to 3:00 PM
	const timeSlots = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"];

	return (
		<div className="fixed bg-white p-8 rounded-lg shadow-lg w-96 z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-2xl font-semibold text-gray-800">
					Schedule a New Walk
				</h3>
				<XMarkIcon
					className="h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-800"
					onClick={() => setShowForm(false)}
				/>
			</div>

			<form onSubmit={handleAddEvent}>
				{/* Marshal Selection */}
				<div className="relative mb-4">
					<select
						name="marshal"
						value={newEvent.marshal}
						onChange={(e) =>
							setNewEvent({ ...newEvent, marshal: e.target.value })
						}
						className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
						required
					>
						<option value="">Select a Marshal</option>
						{marshals.map((marshal) => (
							<option key={marshal._id} value={marshal._id}>
								{marshal.firstName} {marshal.lastName}
							</option>
						))}
					</select>
				</div>

				{/* Display Selected Date */}
				<div className="relative mb-4">
					<input
						type="text"
						value={newEvent.start.toLocaleDateString()}
						disabled
						className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 bg-gray-100 cursor-not-allowed"
					/>
				</div>

				{/* Custom Time Picker */}
				<div className="relative mb-4">
					<div className="grid grid-cols-2 gap-2">
						{timeSlots.map((time) => (
							<button
								type="button"
								key={time}
								onClick={() => handleTimeChange(time)}
								className={`px-4 py-2 rounded-lg border ${
									selectedTime === time
										? "bg-blue-600 text-white"
										: "bg-gray-100 text-gray-800 hover:bg-blue-100"
								}`}
							>
								{time}
							</button>
						))}
					</div>
				</div>

				{/* Manual Time Input */}
				<div className="relative mb-4">
					<input
						type="time"
						min="10:00"
						max="15:00"
						step="1800" // Restrict to 30 min intervals
						onChange={(e) => handleTimeChange(e.target.value)}
						className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
					/>
					<label className="absolute left-0 -top-3.5 text-sm text-gray-600">
						Pick a Time (Optional)
					</label>
				</div>

				<button className="w-full bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-all focus:outline-none">
					Schedule Walk
				</button>
			</form>
		</div>
	);
};

export default ScheduleWalkForm;
