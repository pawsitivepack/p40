import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const ScheduleWalkForm = ({
	newEvent,
	setNewEvent,
	setShowForm,
	handleAddEvent,
	isBulk,
	setIsBulk,
}) => {
	const [marshals, setMarshals] = useState([]);
	const [selectedTimes, setSelectedTimes] = useState([]);
	const [repeatUntil, setRepeatUntil] = useState("");

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

	// Automatically show the repeat until field and set default date when bulk is selected
	useEffect(() => {
		if (isBulk && newEvent.start) {
			setRepeatUntil(newEvent.start.toISOString().split("T")[0]);
		}
	}, [isBulk, newEvent.start]);

	// Handle Time Change (No UTC Conversion)
	const handleTimeChange = (time) => {
		if (isBulk) {
			setSelectedTimes((prevTimes) =>
				prevTimes.includes(time)
					? prevTimes.filter((t) => t !== time)
					: [...prevTimes, time]
			);
		} else {
			setSelectedTimes([time]);
			setNewEvent((prevEvent) => ({
				...prevEvent,
				start: new Date(
					prevEvent.start.setHours(...time.split(":").map(Number))
				),
			}));
		}
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

			<form onSubmit={(e) => handleAddEvent(e, repeatUntil, selectedTimes)}>
				<div className="relative mb-4">
					<label className="inline-flex items-center cursor-pointer text-gray-800 hover:text-gray-900">
						<input
							type="checkbox"
							checked={isBulk}
							onChange={(e) => setIsBulk(e.target.checked)}
							className="form-checkbox h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
						/>
						<span className="ml-2">Bulk Walk</span>
					</label>
				</div>
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
					{isBulk && (
						<p className="text-gray-600 mb-2">Choose one or more times:</p>
					)}
					<div className="grid grid-cols-2 gap-2">
						{timeSlots.map((time) => (
							<button
								type="button"
								key={time}
								onClick={() => handleTimeChange(time)}
								className={`px-4 py-2 rounded-lg border ${
									selectedTimes.includes(time)
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
				{!isBulk && (
					<div className="relative mb-4">
						<input
							type="time"
							min="10:00"
							max="15:00"
							step="1800" // Restrict to 30 min intervals
							onChange={(e) => handleTimeChange(e.target.value)}
							disabled={!isBulk && selectedTimes.length > 0}
							className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
						/>
						<label className="absolute left-0 -top-3.5 text-sm text-gray-600">
							Pick a Time (Optional)
						</label>
					</div>
				)}

				{/* Repeat Until Date Input */}
				{isBulk && (
					<div className="relative mb-4">
						<label className="block mb-1 text-gray-700">Repeat Until:</label>
						<input
							type="date"
							value={repeatUntil}
							onChange={(e) => setRepeatUntil(e.target.value)}
							min={newEvent.start.toISOString().split("T")[0]}
							className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
							required
						/>
					</div>
				)}

				<button className="w-full bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 transition-all focus:outline-none">
					Schedule Walk
				</button>
			</form>
		</div>
	);
};

export default ScheduleWalkForm;
