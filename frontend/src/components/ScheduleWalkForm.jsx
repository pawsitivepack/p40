import React, { useEffect, useState } from "react";
import axios from "axios";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

const ScheduleWalkForm = ({
	newEvent,
	setNewEvent,
	setShowForm,
	handleAddEvent,
}) => {
	const [dogs, setDogs] = useState([]);
	const [marshals, setMarshals] = useState([]);

	useEffect(() => {
		const fetchOptions = async () => {
			try {
				const [dogResponse, marshalResponse] = await Promise.all([
					axios.get("https://p40.onrender.com/dogs"), // Fetch all dogs
					axios.get("https://p40.onrender.com/users/getAllUsers?role=marshal"), // Fetch only marshals
				]);
				setDogs(dogResponse.data);
				setMarshals(marshalResponse.data);
			} catch (error) {
				console.error("Error fetching options:", error);
				toast.error("Failed to load options.");
			}
		};

		fetchOptions();
	}, []);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewEvent({ ...newEvent, [name]: value });
	};

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
				{/* Dog Selection */}
				<div className="relative mb-4">
					<select
						name="dog"
						value={newEvent.dog}
						onChange={handleInputChange}
						className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
						required
					>
						<option value="">Select a Dog</option>
						{dogs.map((dog) => (
							<option key={dog._id} value={dog._id}>
								{dog.name} ({dog.breed})
							</option>
						))}
					</select>
					<label className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm">
						Dog
					</label>
				</div>

				{/* Marshal Selection */}
				<div className="relative mb-4">
					<select
						name="marshal"
						value={newEvent.marshal}
						onChange={handleInputChange}
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
					<label className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm">
						Marshal
					</label>
				</div>

				{/* Start Time */}
				<div className="relative mb-4">
					<input
						type="datetime-local"
						name="start"
						value={
							newEvent.start instanceof Date
								? newEvent.start.toISOString().slice(0, 16)
								: new Date(newEvent.start).toISOString().slice(0, 16) // Convert to Date if it's a string
						}
						onChange={(e) =>
							setNewEvent({
								...newEvent,
								start: new Date(e.target.value),
							})
						}
						className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500"
						required
					/>
					<label className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm">
						Start Time
					</label>
				</div>

				{/* Location */}
				<div className="relative mb-4">
					<input
						type="text"
						name="location"
						value={newEvent.location}
						onChange={handleInputChange}
						className="peer h-10 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500"
					/>
					<label className="absolute left-0 -top-3.5 text-sm text-gray-600 peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-3.5 peer-focus:text-sm">
						Location
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
