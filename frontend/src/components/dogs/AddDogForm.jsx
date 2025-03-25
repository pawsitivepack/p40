import { XMarkIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import api from "../../api/axios";
import { FiUpload } from "react-icons/fi";

const AddDogForm = ({ setFormVisible, setDogs }) => {
	const [newDog, setNewDog] = useState({
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
	const [imageFile, setImageFile] = useState(null);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setNewDog((prevDog) => ({
			...prevDog,
			[name]: value,
		}));
	};

	const handleAddDog = async (e) => {
		e.preventDefault();

		try {
			const formData = new FormData();
			formData.append("name", newDog.name);
			formData.append("breed", newDog.breed);
			formData.append("age", newDog.age);
			formData.append("color", newDog.color);
			formData.append("demeanor", newDog.demeanor);
			formData.append("tags", JSON.stringify(newDog.tags));
			formData.append("notes", JSON.stringify(newDog.notes));
			if (imageFile) {
				formData.append("image", imageFile);
			}

			const response = await api.post("/dogs", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			setDogs((prevDogs) => [...prevDogs, response.data]);
			setNewDog({
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
			setFormVisible(false);
			setImageFile(null);
		} catch (error) {
			console.error(
				"Error adding dog:",
				error.response ? error.response.data : error.message
			);
		}
	};

	return (
		<div className="fixed bg-white p-8 rounded-lg shadow-lg w-96 z-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
			<div className="flex justify-between items-center mb-4">
				<h3 className="text-2xl font-semibold text-gray-800">Add a New Dog</h3>
				<XMarkIcon
					className="h-6 w-6 cursor-pointer text-gray-600 hover:text-gray-800"
					onClick={() => setFormVisible(false)}
				/>
			</div>

			<form onSubmit={handleAddDog}>
				{["name", "breed", "age", "color", "imageURL"].map((field) => (
					<div className="relative mb-4" key={field}>
						{field === "imageURL" ? (
							<>
								<label
									htmlFor="image"
									className="flex items-center justify-center w-full px-4 py-2 bg-blue-100 text-blue-700 border border-dashed border-blue-400 rounded-lg cursor-pointer hover:bg-blue-200"
								>
									<FiUpload className="mr-2" />
									{imageFile ? imageFile.name : "Upload Dog Image"}
									<input
										id="image"
										name="image"
										type="file"
										accept="image/*"
										onChange={(e) => setImageFile(e.target.files[0])}
										className="hidden"
									/>
								</label>
							</>
						) : (
							<>
								<input
									autoComplete="off"
									id={field}
									name={field}
									type={field === "age" ? "number" : "text"}
									className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
									placeholder={`Dog's ${
										field.charAt(0).toUpperCase() + field.slice(1)
									}`}
									value={newDog[field]}
									onChange={handleInputChange}
									required
								/>
								<label
									htmlFor={field}
									className="absolute left-0 -top-3.5 text-gray-600 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-440 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-gray-600 peer-focus:text-sm"
								>
									Dog's {field.charAt(0).toUpperCase() + field.slice(1)}
								</label>
							</>
						)}
					</div>
				))}

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
						value={newDog.demeanor}
						onChange={handleInputChange}
						className={`block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black ${
							newDog.demeanor === "Red"
								? "bg-red-100"
								: newDog.demeanor === "Gray"
								? "bg-gray-100"
								: "bg-yellow-100"
						}`}
					>
						<option value="Red">Red</option>
						<option value="Gray">Gray</option>
						<option value="Yellow">Yellow</option>
					</select>
				</div>

				<div className="relative mb-4">
					<input
						autoComplete="off"
						id="tags"
						name="tags"
						type="text"
						className="peer placeholder-transparent h-10 w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
						placeholder="Tags (comma separated)"
						value={newDog.tags.join(", ")}
						onChange={(e) =>
							setNewDog((prevDog) => ({
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

				<div className="relative mb-4">
					<textarea
						autoComplete="off"
						id="notes"
						name="notes"
						rows="3"
						className="peer placeholder-transparent w-full border-b-2 border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500"
						placeholder="Notes"
						value={newDog.notes.join("\n")}
						onChange={(e) =>
							setNewDog((prevDog) => ({
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

				<button className="w-full bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 focus:outline-none">
					Add Dog
				</button>
			</form>
		</div>
	);
};

export default AddDogForm;
