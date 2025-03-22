import React, { useState, useRef, useEffect } from "react";
import api from "../../api/axios";
import { FaSearch, FaHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Adoption() {
	const [dogs, setDogs] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortOption, setSortOption] = useState("");
	const [filterAdopted, setFilterAdopted] = useState("all");
	const [filterCategory, setFilterCategory] = useState("all");
	const [filterColor, setFilterColor] = useState("all");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchDogs = async () => {
			try {
				const response = await api.get(`/dogs`);
				setDogs(response.data);
				localStorage.setItem("dogs", JSON.stringify(response.data));
			} catch (error) {
				setError("Failed to load dog data");
				console.error("Error fetching dogs:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDogs();
	}, []);

	const handleViewDog = (dog) => {
		navigate(`/dog/${dog._id}`);
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div>{error}</div>;

	const filteredDogs = dogs
		.filter((dog) => {
			const matchesSearch =
				dog.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				dog.breed.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesAdopted =
				filterAdopted === "all" ||
				(filterAdopted === "adopted" && dog.adopted) ||
				(filterAdopted === "notAdopted" && !dog.adopted);
			const matchesCategory =
				filterCategory === "all" || dog.category === filterCategory;
			const matchesColor = filterColor === "all" || dog.color === filterColor;
			return matchesSearch && matchesAdopted && matchesCategory && matchesColor;
		})
		.sort((a, b) => {
			if (sortOption === "name") return a.name.localeCompare(b.name);
			if (sortOption === "age") return a.age - b.age;
			return 0;
		});

	return (
		<div className="bg-[var(--bg-100)] min-h-screen py-10">
			<h1 className="text-3xl font-bold text-center text-[var(--primary-300)] mb-8">
				Adopt a Dog
			</h1>
			<div className="flex flex-col md:flex-row gap-6 px-6 md:px-12">
				<div className="w-full md:w-1/4 bg-[var(--bg-200)] p-4 rounded-lg shadow-md space-y-4">
					<h2 className="text-xl font-semibold mb-2 text-[var(--text-100)]">
						Filters
					</h2>
					<div className="relative">
						<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-200)]" />
						<input
							type="text"
							placeholder="Search by name or breed"
							className="border pl-10 pr-4 py-2 rounded-md w-full text-[var(--text-100)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<select
						className="border px-4 py-2 rounded-md text-[var(--text-100)]"
						value={sortOption}
						onChange={(e) => setSortOption(e.target.value)}
					>
						<option value="">Sort by</option>
						<option value="name">Name</option>
						<option value="age">Age</option>
					</select>
					<select
						className="border px-4 py-2 rounded-md text-[var(--text-100)]"
						value={filterAdopted}
						onChange={(e) => setFilterAdopted(e.target.value)}
					>
						<option value="all">All</option>
						<option value="adopted">Adopted</option>
						<option value="notAdopted">Not Adopted</option>
					</select>
					<select
						className="border px-4 py-2 rounded-md text-[var(--text-100)]"
						value={filterCategory}
						onChange={(e) => setFilterCategory(e.target.value)}
					>
						<option value="all">All Categories</option>
						<option value="puppy">Puppy</option>
						<option value="adult">Adult</option>
						<option value="senior">Senior</option>
					</select>
					<select
						className="border px-4 py-2 rounded-md text-[var(--text-100)]"
						value={filterColor}
						onChange={(e) => setFilterColor(e.target.value)}
					>
						<option value="all">All Colors</option>
						<option value="black">Black</option>
						<option value="brown">Brown</option>
						<option value="white">White</option>
						<option value="golden">Golden</option>
					</select>
				</div>
				<div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredDogs.map((dog) => (
						<DogCard
							key={dog._id}
							dog={dog}
							role="admin"
							onViewDog={handleViewDog}
						/>
					))}
				</div>
			</div>
		</div>
	);
}

function DogCard({ dog, role, onViewDog }) {
	const cardRef = useRef(null);

	return (
		<div
			ref={cardRef}
			className="relative bg-[var(--bg-100)] rounded-lg shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-200"
			onClick={() => onViewDog(dog)}
		>
			<div className="absolute top-3 right-3 z-10">
				<button className="text-red-500 hover:text-red-700">
					<FaHeart />
				</button>
			</div>
			<div className="flex flex-col">
				<img
					src={dog.imageURL}
					alt={dog.name}
					className="w-full h-64 object-cover rounded-t-lg"
				/>

				<div className="p-4 text-center">
					<h2 className="text-2xl font-bold text-[var(--text-100)]">
						{dog.name}
					</h2>
					<p className="text-[var(--text-200)] mt-2">
						<strong>Breed:</strong> {dog.breed}
					</p>
					<p className="text-[var(--text-200)]">
						<strong>Age:</strong> {dog.age} years
					</p>
					<p className="text-[var(--text-200)]">
						<strong>Color:</strong> {dog.color}
					</p>
					<p className="text-[var(--text-200)]">
						<strong>Category:</strong> {dog.category}
					</p>
					<p className="text-[var(--text-200)]">
						<strong>Adopted:</strong> {dog.adopted ? "Yes" : "No"}
					</p>
					{dog.adopted && (
						<p className="text-[var(--text-200)]">
							<strong>Adopted Date:</strong> {dog.adoptedDate}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
