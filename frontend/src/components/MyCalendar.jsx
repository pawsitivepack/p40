import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MyCalendar.css";

const localizer = momentLocalizer(moment);

const MyCalendar = () => {
	const [events, setEvents] = useState([]);
	const [showForm, setShowForm] = useState(false);
	const [newEvent, setNewEvent] = useState({
		title: "",
		type: "Dog Walk",
		dogName: "",
		walkerName: "",
		start: new Date(),
		end: new Date(),
	});

	useEffect(() => {
		const testEvents = [
			{
				id: 1,
				title: "Test Event",
				type: "Dog Walk",
				dogName: "Buddy",
				walkerName: "John Doe",
				start: new Date(2025, 1, 6, 10, 0),
				end: new Date(2025, 1, 6, 11, 0),
			},
		];
		setEvents(testEvents);
	}, []);

	const handleSelectSlot = ({ start, end }) => {
		setNewEvent({ ...newEvent, start, end });
		setShowForm(true);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewEvent({
			...newEvent,
			[name]: name === "start" || name === "end" ? new Date(value) : value,
		});
	};

	const handleAddEvent = (e) => {
		e.preventDefault();
		if (!newEvent.title || !newEvent.start || !newEvent.end) {
			toast.error("Please fill out all fields.");
			return;
		}
		if (newEvent.start >= newEvent.end) {
			toast.error("End time must be after start time.");
			return;
		}
		setEvents([...events, { ...newEvent, id: events.length + 1 }]);
		setShowForm(false);
		setNewEvent({
			title: "",
			type: "Dog Walk",
			dogName: "",
			walkerName: "",
			start: new Date(),
			end: new Date(),
		});
		toast.success("Walk scheduled successfully!");
	};

	return (
		<div className="container mx-auto p-4">
			<ToastContainer />
			<div className="">
				<Calendar
					localizer={localizer}
					events={events}
					startAccessor="start"
					endAccessor="end"
					defaultView="month"
					selectable
					onSelectSlot={handleSelectSlot}
					style={{ height: "500px", border: "none" }}
				/>

				{showForm && (
					<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-70 z-50">
						<div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg transform transition-transform scale-100 hover:scale-105">
							<h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
								Schedule a Walk
							</h3>
							<form onSubmit={handleAddEvent} className="space-y-6">
								{/* Event Title */}
								<div className="relative">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Event Title
									</label>
									<input
										type="text"
										name="title"
										value={newEvent.title}
										onChange={handleInputChange}
										className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
										placeholder="Enter event title"
										required
									/>
									<span className="absolute left-2 top-2.5 text-gray-500">
										<i className="fas fa-pencil-alt"></i>{" "}
										{/* Font Awesome or React Icons */}
									</span>
								</div>

								{/* Event Type */}
								<div className="relative">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Event Type
									</label>
									<select
										name="type"
										value={newEvent.type}
										onChange={handleInputChange}
										className="w-full pl-4 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									>
										<option value="Dog Walk">Dog Walk</option>
										<option value="Adoption Event">Adoption Event</option>
										<option value="Donation Drive">Donation Drive</option>
									</select>
								</div>

								{/* Dog Name */}
								<div className="relative">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Dog Name
									</label>
									<input
										type="text"
										name="dogName"
										value={newEvent.dogName}
										onChange={handleInputChange}
										className="w-full pl-4 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
										placeholder="Enter dog name"
										required
									/>
								</div>

								{/* Walker Name */}
								<div className="relative">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Walker Name
									</label>
									<input
										type="text"
										name="walkerName"
										value={newEvent.walkerName}
										onChange={handleInputChange}
										className="w-full pl-4 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
										placeholder="Enter walker name"
										required
									/>
								</div>

								{/* Start Time */}
								<div className="relative">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Start Time
									</label>
									<input
										type="datetime-local"
										name="start"
										value={newEvent.start.toISOString().slice(0, 16)}
										onChange={handleInputChange}
										className="w-full pl-4 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
										required
									/>
								</div>

								{/* End Time */}
								<div className="relative">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										End Time
									</label>
									<input
										type="datetime-local"
										name="end"
										value={newEvent.end.toISOString().slice(0, 16)}
										onChange={handleInputChange}
										className="w-full pl-4 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
										required
									/>
								</div>

								{/* Action Buttons */}
								<div className="flex justify-end space-x-4">
									<button
										type="submit"
										className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
									>
										Add Event
									</button>
									<button
										type="button"
										onClick={() => setShowForm(false)}
										className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
									>
										Cancel
									</button>
								</div>
							</form>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default MyCalendar;
