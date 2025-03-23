import { XMarkIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const EditDog = ({ setFormVisible, setDogs, dog }) => {
	const [updatedDog, setUpdatedDog] = useState({
		name: "",
		breed: "",
		age: "",
		color: "",
		adopted: false,
		adoptedDate: "",
		imageURL: "",
		tags: [],
		demeanor: "Red",
		notes: [],
	});
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// Update form fields when a new dog is selected for editing
	useEffect(() => {
		setUpdatedDog({
			...dog,
			adoptedDate: dog.adopted ? dog.adoptedDate : "",
			tags: dog.tags || [],
			demeanor: dog.demeanor || "Red",
			notes: dog.notes || [],
		});
	}, [dog]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setUpdatedDog((prevDog) => ({
			...prevDog,
			[name]: value,
		}));
	};

	const handleCheckboxChange = (e) => {
		const isAdopted = e.target.checked;
		setUpdatedDog((prevDog) => ({
			...prevDog,
			adopted: isAdopted,
			adoptedDate: isAdopted ? new Date().toISOString().split("T")[0] : "",
		}));
	};

	const handleUpdateDog = async (e) => {
		e.preventDefault();

		// Validate image URL
		if (!updatedDog.imageURL.startsWith("http")) {
			setErrorMessage("Please enter a valid image URL");
			return;
		}

		setIsLoading(true);
		setErrorMessage("");

		try {
			const response = await api.put(`/dogs/${dog._id}`, updatedDog);
			const updatedData = response.data.updatedDog;
			console.log(updatedData);
			// Update the dog list with the updated data
			setDogs((prevDogs) =>
				prevDogs.map((d) => (d._id === dog._id ? updatedData : d))
			);

			// Close the form after update
			setFormVisible(false);
		} catch (error) {
			console.error(
				"Error updating dog:",
				error.response ? error.response.data : error.message
			);
			setErrorMessage("Failed to update dog");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed bg-white p-8 rounded-lg shadow-lg w-96 z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-2xl font-semibold text-gray-800">Edit Dog</h3>
				<XMarkIcon
					className="h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-800"
					onClick={() => setFormVisible(false)}
				/>
			</div>

			<form onSubmit={handleUpdateDog}>
				{["name", "breed", "age", "color", "imageURL"].map((field) => (
					<div className="relative mb-4" key={field}>
						<input
							autoComplete="off"
							id={field}
							name={field}
							type={field === "age" ? "number" : "text"}
							className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
							placeholder={`Dog's ${
								field.charAt(0).toUpperCase() + field.slice(1)
							}`}
							value={updatedDog[field] || ""}
							onChange={handleInputChange}
							required
						/>
						<label
							htmlFor={field}
							className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
						>
							Dog's {field.charAt(0).toUpperCase() + field.slice(1)}
						</label>
					</div>
				))}

				{/* Input for Demeanor */}
				<div className="relative mb-4">
					<label
						htmlFor="demeanor"
						className="block text-gray-600 text-sm mb-1"
					>
						Dog's Demeanor
					</label>
					<select
						id="demeanor"
						name="demeanor"
						value={updatedDog.demeanor}
						onChange={handleInputChange}
						className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
							updatedDog.demeanor === "Red"
								? "bg-red-100"
								: updatedDog.demeanor === "Gray"
								? "bg-gray-100"
								: "bg-yellow-100"
						}`}
					>
						<option value="Red">Red</option>
						<option value="Gray">Gray</option>
						<option value="Yellow">Yellow</option>
					</select>
				</div>

				{/* Input for Tags */}
				<div className="relative mb-4">
					<input
						autoComplete="off"
						id="tags"
						name="tags"
						type="text"
						className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
						placeholder="Tags (comma separated)"
						value={updatedDog.tags.join(", ")}
						onChange={(e) =>
							setUpdatedDog((prevDog) => ({
								...prevDog,
								tags: e.target.value.split(",").map((tag) => tag.trim()),
							}))
						}
					/>
					<label
						htmlFor="tags"
						className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
					>
						Tags (comma separated)
					</label>
				</div>

				{/* Input for Notes */}
				<div className="relative mb-4">
					<textarea
						autoComplete="off"
						id="notes"
						name="notes"
						rows="3"
						className="peer placeholder-transparent w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
						placeholder="Notes"
						value={updatedDog.notes.join("\n")}
						onChange={(e) =>
							setUpdatedDog((prevDog) => ({
								...prevDog,
								notes: e.target.value
									.split("\n")
									.filter((line) => line.trim() !== ""),
							}))
						}
					></textarea>
					<label
						htmlFor="notes"
						className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
					>
						Notes (each line becomes a note)
					</label>
				</div>

				{/* Checkbox for Adoption Status */}
				<div className="flex items-center mb-4">
					<input
						type="checkbox"
						id="adopted"
						name="adopted"
						checked={updatedDog.adopted}
						onChange={handleCheckboxChange}
						className="mr-2"
					/>
					<label htmlFor="adopted" className="text-gray-800">
						Adopted
					</label>
				</div>

				{errorMessage && (
					<p className="text-red-500 text-center mb-4">{errorMessage}</p>
				)}

				<button
					className="w-full bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600 focus:outline-none"
					disabled={isLoading}
				>
					{isLoading ? "Updating..." : "Update Dog"}
				</button>
			</form>
		</div>
	);
};

export default EditDog;
