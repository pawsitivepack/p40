import { PlusCircleIcon } from "@heroicons/react/24/solid";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import AddDogForm from "./AddDogForm";
import DogCard from "./DogCard";
import EditDog from "./EditDog";

function DogInventory() {
	const [dogs, setDogs] = useState([]);
	const [formVisible, setFormVisible] = useState(false);
	const [editingDog, setEditingDog] = useState(null); // Track which dog is being edited
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [role, setRole] = useState("");
	// Pagination States
	const [activePage, setActivePage] = useState(1);
	const dogsPerPage = 7;
	const totalPages = Math.ceil(dogs.length / dogsPerPage);

	useEffect(() => {
		const fetchDogs = async () => {
			try {
				const response = await api.get(`/dogs`);
				setDogs(response.data);
			} catch (error) {
				setError("Failed to load dog data");
				console.error("Error fetching dogs:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDogs();
	}, []);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				const userRole = decodedToken.role;
				setRole(userRole);
			} catch (error) {
				console.error("Failed to decode token:", error);
			}
		} else {
			console.warn("no token in the local storage");
		}
	}, []);

	const removeDogFromList = (id) => {
		setDogs((prevDogs) => {
			const newDogs = prevDogs.filter((dog) => dog._id !== id);
			if (activePage > Math.ceil(newDogs.length / dogsPerPage)) {
				setActivePage(Math.max(activePage - 1, 1)); // Ensure we stay on a valid page
			}
			return newDogs;
		});
	};

	const handleEditDog = (dog) => {
		setEditingDog(dog); // Set the dog to be edited
		setFormVisible(true); // Show the form
	};

	const handleUpdateDog = (updatedDog) => {
		const updatedDogs = dogs.map((dog) =>
			dog._id === updatedDog._id ? updatedDog : dog
		);

		setDogs(updatedDogs);
		setFormVisible(false); // Close the form after update
	};
	// Pagination Logic
	const indexOfLastDog = activePage * dogsPerPage;
	const indexOfFirstDog = indexOfLastDog - dogsPerPage;
	const currentDogs = dogs.slice(indexOfFirstDog, indexOfLastDog);

	return (
		<div className="relative min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
			<h1 className="text-4xl font-bold text-center text-red-800 mb-8">
				Dog Inventory
			</h1>

			{loading && <p className="text-center text-gray-600">Loading dogs...</p>}
			{error && <p className="text-center text-red-600">{error}</p>}

			<div
				className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 ${
					formVisible ? "blur-sm" : ""
				}`}
			>
				{role === "admin" && (
					<div
						className="bg-red-800 text-white p-6 rounded-lg shadow-lg w-full flex flex-col justify-center items-center cursor-pointer hover:bg-red-900 transition-all"
						onClick={() => {
							setEditingDog(null); // Ensure we're adding a new dog
							setFormVisible(true);
						}}
					>
						<PlusCircleIcon className="h-12 w-12 text-white mb-2" />
						<h3 className="text-lg font-semibold">Add a New Dog</h3>
						<p className="mt-1 text-center text-sm">Click to add a new dog</p>
						<button className="mt-4 flex items-center bg-white text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition-all">
							<PlusCircleIcon className="h-5 w-5 text-red-700 mr-2" />
							Add Dog
						</button>
					</div>
				)}

				{currentDogs.length > 0
					? currentDogs.map((dog) => (
							<DogCard
								key={dog._id}
								dog={dog}
								onDelete={removeDogFromList}
								onEdit={handleEditDog} // Pass the handleEditDog function here
								role={role}
							/>
					  ))
					: !loading && (
							<p className="text-center text-gray-600 col-span-full">
								No dogs available.
							</p>
					  )}
			</div>

			{/* Show Add or Edit Form */}
			{formVisible &&
				(editingDog ? (
					<EditDog
						dog={editingDog}
						setFormVisible={setFormVisible}
						handleUpdateDog={handleUpdateDog}
						setDogs={setDogs}
					/>
				) : (
					<AddDogForm setFormVisible={setFormVisible} setDogs={setDogs} />
				))}

			{/* Pagination */}
			<div className="flex justify-center mt-8">
				<nav className="bg-gray-200 rounded-full px-4 py-2">
					<ul className="flex text-gray-600 gap-4 font-medium py-2">
						{Array.from({ length: totalPages }, (_, index) => {
							const page = index + 1;
							return (
								<li key={page}>
									<button
										onClick={() => setActivePage(page)}
										className={`rounded-full px-4 py-2 transition duration-300 ease-in-out 
                                            ${
																							activePage === page
																								? "bg-white text-gray-600"
																								: "hover:bg-white hover:text-gray-600"
																						}`}
									>
										{page}
									</button>
								</li>
							);
						})}
					</ul>
				</nav>
			</div>
		</div>
	);
}

export default DogInventory;
