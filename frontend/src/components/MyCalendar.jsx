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
			<div className="bg-white shadow-md rounded-md p-4">
				<Calendar
					localizer={localizer}
					events={events}
					startAccessor="start"
					endAccessor="end"
					defaultView="month"
					selectable
					onSelectSlot={handleSelectSlot}
					style={{ height: "500px" }}
				/>

				{showForm && (
					<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
						<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
							<h3 className="text-lg font-bold mb-4">Schedule a Walk</h3>
							<form
								onSubmit={handleAddEvent}
								className="space-y-4 text-maroon-600"
							>
								<div>
									<label className="block text-sm font-medium mb-1">
										Event Title
									</label>
									<input
										type="text"
										name="title"
										value={newEvent.title}
										onChange={handleInputChange}
										className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">
										Event Type
									</label>
									<select
										name="type"
										value={newEvent.type}
										onChange={handleInputChange}
										className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
										required
									>
										<option value="Dog Walk">Dog Walk</option>
										<option value="Adoption Event">Adoption Event</option>
										<option value="Donation Drive">Donation Drive</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">
										Dog Name
									</label>
									<input
										type="text"
										name="dogName"
										value={newEvent.dogName}
										onChange={handleInputChange}
										className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">
										Walker Name
									</label>
									<input
										type="text"
										name="walkerName"
										value={newEvent.walkerName}
										onChange={handleInputChange}
										className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">
										Start Time
									</label>
									<input
										type="datetime-local"
										name="start"
										value={newEvent.start.toISOString().slice(0, 16)}
										onChange={handleInputChange}
										className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium mb-1">
										End Time
									</label>
									<input
										type="datetime-local"
										name="end"
										value={newEvent.end.toISOString().slice(0, 16)}
										onChange={handleInputChange}
										className="w-full border-gray-300 rounded-md shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
										required
									/>
								</div>
								<div className="flex justify-end space-x-4">
									<button
										type="submit"
										className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
									>
										Add Event
									</button>
									<button
										type="button"
										onClick={() => setShowForm(false)}
										className="bg-red-500 text-white px-4 py-2 rounded-md shadow hover:bg-red-600 transition"
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
