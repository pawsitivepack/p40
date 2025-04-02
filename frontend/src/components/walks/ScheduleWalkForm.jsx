import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios";
import {
	FaTimes,
	FaCalendarAlt,
	FaClock,
	FaUserShield,
	FaMapMarkerAlt,
	FaCalendarCheck,
	FaSpinner,
} from "react-icons/fa";

const ScheduleWalkForm = ({
	newEvent,
	setNewEvent,
	setShowForm,
	handleAddEvent,
	setIsBulk,
}) => {
	const [marshals, setMarshals] = useState([]);
	const [selectedTimes, setSelectedTimes] = useState([]);
	const [repeatUntil, setRepeatUntil] = useState("");
	const [loading, setLoading] = useState(true);
	const isBulk = true;

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				setLoading(true);
				const marshalResponse = await api.get(
					`/users/getAllUsers?role=marshal`
				);
				setMarshals(marshalResponse.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching marshals:", error);
				toast.error("Failed to load marshals.");
				setLoading(false);
			}
		};

		fetchOptions();
	}, []);

	useEffect(() => {
		setIsBulk(true);
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

	// Format time for display
	const formatTime = (timeString) => {
		const [hours, minutes] = timeString.split(":").map(Number);
		return new Date(2023, 0, 1, hours, minutes).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// Prevent background scrolling when modal is open
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, []);

	return (
		<>
			{/* Blurred Backdrop */}
			<div
				className="fixed inset-0 backdrop-blur-sm bg-white/30 z-10"
				onClick={() => setShowForm(false)}
			></div>

			{/* Modal */}
			<div className="fixed bg-white rounded-xl shadow-xl z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md overflow-hidden">
				{/* Modal Header */}
				<div className="bg-[#8c1d35] px-6 py-4">
					<div className="flex justify-between items-center">
						<h3 className="text-xl font-bold text-white flex items-center">
							<FaCalendarCheck className="mr-2" />
							{isBulk ? "Schedule Bulk Walks" : "Schedule a Walk"}
						</h3>
						<button
							onClick={() => setShowForm(false)}
							className="text-white hover:bg-[#7c1025] p-1 rounded-full transition-colors"
						>
							<FaTimes className="w-5 h-5" />
						</button>
					</div>
				</div>

				{/* Modal Body */}
				<div className="p-6">
					{loading ? (
						<div className="flex justify-center items-center py-8">
							<FaSpinner className="animate-spin text-[#8c1d35] text-2xl" />
						</div>
					) : (
						<form
							onSubmit={(e) => handleAddEvent(e, repeatUntil, selectedTimes)}
						>
							{/* Marshal Selection */}
							<div className="mb-5">
								<label className="block text-sm font-medium text-gray-800 mb-1 flex items-center">
									<FaUserShield className="mr-1 text-[#8c1d35]" /> Marshal
								</label>
								<select
									name="marshal"
									value={newEvent.marshal}
									onChange={(e) =>
										setNewEvent({ ...newEvent, marshal: e.target.value })
									}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35] bg-white text-gray-800"
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

							{/* Location */}
							<div className="mb-5">
								<label className="block text-sm font-medium text-gray-800 mb-1 flex items-center">
									<FaMapMarkerAlt className="mr-1 text-[#8c1d35]" /> Location
								</label>
								<input
									type="text"
									value={newEvent.location}
									onChange={(e) =>
										setNewEvent({ ...newEvent, location: e.target.value })
									}
									className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35] text-gray-800"
									required
								/>
							</div>

							{/* Display Selected Date */}
							<div className="mb-5">
								<label className="block text-sm font-medium text-gray-800 mb-1 flex items-center">
									<FaCalendarAlt className="mr-1 text-[#8c1d35]" /> Selected
									Date
								</label>
								<div className="w-full p-2 bg-[#f8f5f0] border border-[#e8d3a9] rounded-lg text-gray-800 font-medium">
									{newEvent.start.toLocaleDateString("en-US", {
										weekday: "short",
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</div>
							</div>

							{/* Time Selection */}
							<div className="mb-5">
								<label className="block text-sm font-medium text-gray-800 mb-2 flex items-center">
									<FaClock className="mr-1 text-[#8c1d35]" />
									{isBulk ? "Select Times" : "Select Time"}
								</label>
								<div className="grid grid-cols-3 gap-2">
									{timeSlots.map((time) => (
										<button
											type="button"
											key={time}
											onClick={() => handleTimeChange(time)}
											className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
												selectedTimes.includes(time)
													? "bg-[#8c1d35] text-white border-[#8c1d35]"
													: "bg-white text-gray-800 border-gray-300 hover:bg-[#f8f5f0]"
											}`}
										>
											{formatTime(time)}
										</button>
									))}
								</div>
								{selectedTimes.length === 0 && (
									<p className="text-sm text-red-600 mt-1 font-medium">
										Please select at least one time slot
									</p>
								)}
							</div>

							{/* Repeat Until Date Input (for bulk scheduling) */}
							{isBulk && (
								<div className="mb-5">
									<label className="block text-sm font-medium text-gray-800 mb-1 flex items-center">
										<FaCalendarAlt className="mr-1 text-[#8c1d35]" /> Repeat
										Until
									</label>
									<input
										type="date"
										value={repeatUntil}
										onChange={(e) => setRepeatUntil(e.target.value)}
										min={newEvent.start.toISOString().split("T")[0]}
										className="w-full p-2 border border-gray-300 rounded-lg focus:ring-[#8c1d35] focus:border-[#8c1d35] text-gray-800"
										required
									/>
									<p className="text-sm text-gray-600 mt-1">
										Walks will be scheduled on weekdays (Tue-Fri) between these
										dates
									</p>
								</div>
							)}

							{/* Submit Button */}
							<div className="flex justify-end gap-3 mt-6">
								<button
									type="button"
									onClick={() => setShowForm(false)}
									className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 hover:bg-gray-100 transition-colors font-medium"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={selectedTimes.length === 0}
									className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
										selectedTimes.length === 0
											? "bg-gray-400 cursor-not-allowed"
											: "bg-[#8c1d35] hover:bg-[#7c1025]"
									}`}
								>
									Schedule {isBulk ? "Walks" : "Walk"}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</>
	);
};

export default ScheduleWalkForm;
