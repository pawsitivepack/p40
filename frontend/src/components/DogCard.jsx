import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function DogCard({ dog, onDelete, onEdit }) {
	const [showMenu, setShowMenu] = useState(false);
	const cardRef = useRef(null);

	const toggleMenu = () => {
		setShowMenu((prev) => !prev);
	};

	const handleClickOutside = (e) => {
		if (cardRef.current && !cardRef.current.contains(e.target)) {
			setShowMenu(false);
		}
	};

	useEffect(() => {
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const handleDelete = async () => {
		try {
			const response = await axios.delete(
				`https://p40.onrender.com/dogs/${dog._id}`
			);

			if (response.status !== 200) {
				throw new Error("Failed to delete dog");
			}

			// Call the onDelete function to update the list in the parent component
			onDelete(dog._id);

			console.log(
				`${dog._id} You are trying to delete this dog named ${dog.name}`
			);
		} catch (error) {
			console.error("Error deleting dog:", error);
		}
	};

	const handleEdit = () => {
		setShowMenu(false);
		console.log(
			`${dog._id} You are trying to update this dog named ${dog.name}`
		);
		onEdit(dog); // Pass the dog object to the parent component for editing
	};

	return (
		<div
			ref={cardRef}
			className="bg-white rounded-lg shadow-lg hover:scale-105 transform transition-all cursor-pointer relative"
			onClick={() => showMenu && setShowMenu(false)}
		>
			<img
				src={dog.imageURL}
				alt={dog.name}
				className="w-full h-66 object-cover rounded-t-lg"
			/>

			<div
				className="absolute top-4 right-4 cursor-pointer"
				onClick={toggleMenu}
			>
				<div className="h-2 w-2 bg-gray-900 rounded-full mb-1"></div>
				<div className="h-2 w-2 bg-gray-900 rounded-full mb-1"></div>
				<div className="h-2 w-2 bg-gray-900 rounded-full"></div>
			</div>

			{showMenu && (
				<div className="absolute top-12 right-4 bg-white shadow-lg rounded-lg w-36 p-2 z-10">
					<button
						onClick={handleEdit} // Added the handleEdit function here
						className="w-full text-left text-gray-700 hover:bg-gray-200 py-1 px-2 rounded"
					>
						Edit
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							handleDelete();
							setShowMenu(false);
						}}
						className="w-full text-left text-red-500 hover:bg-gray-200 py-1 px-2 rounded"
					>
						Delete
					</button>
				</div>
			)}

			<div className="p-4 text-center">
				<h2 className="text-xl font-semibold text-gray-800">{dog.name}</h2>
				<p className="text-gray-600 mt-2">
					<strong>Breed:</strong> {dog.breed}
				</p>
				<p className="text-gray-600">
					<strong>Age:</strong> {dog.age} years
				</p>
				<p className="text-gray-600">
					<strong>Color:</strong> {dog.color}
				</p>
				<p className="text-gray-600">
					<strong>Category:</strong> {dog.category}
				</p>
				<p className="text-gray-600">
					<strong>Adopted:</strong> {dog.adopted ? "Yes" : "No"}
				</p>
				{dog.adopted && (
					<p className="text-gray-600">
						<strong>Adopted Date:</strong> {dog.adoptedDate}
					</p>
				)}
			</div>
		</div>
	);
}

export default DogCard;
