
import { useState, useRef, useEffect } from "react";
import api from "../../api/axios";
import {
	FaSearch,
	FaHeart,
	FaPaw,
	FaFilter,
	FaSortAmountDown,
	FaDog,
	FaSpinner,
	FaCalendarAlt,
	FaPalette,
	FaSmile,
	FaTimes,
	FaChevronDown,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function DogCard({ dog, onViewDog, isFavorite, onToggleFavorite }) {
	const cardRef = useRef(null);

	// Get demeanor color
	const getDemeanorColor = (demeanor) => {
		switch (demeanor) {
			case "Red":
				return "bg-red-50 border-red-200";
			case "Gray":
				return "bg-gray-50 border-gray-200";
			case "Yellow":
				return "bg-yellow-50 border-yellow-200";
			default:
				return "bg-white border-gray-200";
		}
	};

	// Get age description
	const getAgeDescription = (age) => {
		if (age < 1) return "Puppy";
		if (age >= 1 && age < 3) return "Young";
		if (age >= 3 && age < 8) return "Adult";
		return "Senior";
	};

	return (
		<div
			ref={cardRef}
			className={`relative rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden ${getDemeanorColor(
				dog.demeanor
			)}`}
			onClick={() => onViewDog(dog)}
		>
			{/* Favorite Button */}
			<button
				className={`absolute top-3 right-3 z-10 bg-white p-2 rounded-full shadow-md transition-colors ${
					isFavorite ? "text-[#8c1d35]" : "text-gray-400 hover:text-[#8c1d35]"
				}`}
				onClick={(e) => onToggleFavorite(e, dog._id)}
				aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
			>
				<FaHeart />
			</button>

			{/* Adoption Status Badge */}
			<div className="absolute top-3 left-3 z-10">
				{dog.adopted ? (
					<span className="bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-medium">
						Adopted
					</span>
				) : (
					<span className="bg-[#8c1d35] text-white text-xs px-2 py-1 rounded-full font-medium">
						Available
					</span>
				)}
			</div>

			{/* Dog Image */}
			<div className="h-64 overflow-hidden">
				<img
					src={dog.imageURL || "/placeholder.svg?height=300&width=400"}
					alt={dog.name}
					className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
				/>
			</div>

			{/* Dog Info */}
			<div className="p-4">
				<div className="flex justify-between items-start mb-2">
					<h2 className="text-xl font-bold text-gray-800">{dog.name}</h2>
					<span className="text-xs font-medium bg-[#e8d3a9] text-[#8c1d35] px-2 py-1 rounded-full">
						{getAgeDescription(dog.age)}
					</span>
				</div>

				<div className="space-y-1 text-sm text-gray-600">
					<p>
						<span className="font-medium">Breed:</span> {dog.breed || "Mixed"}
					</p>
					<p>
						<span className="font-medium">Age:</span> {dog.age}{" "}
						{dog.age === 1 ? "year" : "years"}
					</p>
					{dog.color && (
						<p>
							<span className="font-medium">Color:</span> {dog.color}
						</p>
					)}
					{dog.demeanor && (
						<p>
							<span className="font-medium">Demeanor:</span> {dog.demeanor}
						</p>
					)}
				</div>

				<button
					className="mt-4 w-full bg-[#8c1d35] text-white py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
					onClick={() => onViewDog(dog)}
				>
					View Details
				</button>
			</div>
		</div>
	);
}

export default function Adoption() {
	const [dogs, setDogs] = useState([]);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortOption, setSortOption] = useState("");
	const [filterAdopted, setFilterAdopted] = useState("all");
	const [filterColor, setFilterColor] = useState("all");
	const [filterDemeanor, setFilterDemeanor] = useState("all");
	const [filterBreed, setFilterBreed] = useState("all");
	const [filterAge, setFilterAge] = useState("all");
	const [showFilters, setShowFilters] = useState(false);
	const [favorites, setFavorites] = useState([]);
	const [activeFilters, setActiveFilters] = useState(0);
	const navigate = useNavigate();

	// Get unique values for filter options
	const [filterOptions, setFilterOptions] = useState({
		colors: [],
		demeanors: [],
		breeds: [],
	});

	useEffect(() => {
		const fetchDogs = async () => {
			try {
				setLoading(true);
				const response = await api.get(`/dogs`);
				setDogs(response.data);

				// Extract unique values for filters
				const colors = [
					...new Set(response.data.map((dog) => dog.color).filter(Boolean)),
				];
				const demeanors = [
					...new Set(response.data.map((dog) => dog.demeanor).filter(Boolean)),
				];
				const breeds = [
					...new Set(response.data.map((dog) => dog.breed).filter(Boolean)),
				];

				setFilterOptions({
					colors,
					demeanors,
					breeds,
				});

				// Load favorites from localStorage
				const savedFavorites = localStorage.getItem("dogFavorites");
				if (savedFavorites) {
					setFavorites(JSON.parse(savedFavorites));
				}
			} catch (error) {
				setError("Failed to load dog data");
				console.error("Error fetching dogs:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDogs();
	}, []);

	// Count active filters
	useEffect(() => {
		let count = 0;
		if (filterAdopted !== "all") count++;
		if (filterColor !== "all") count++;
		if (filterDemeanor !== "all") count++;
		if (filterBreed !== "all") count++;
		if (filterAge !== "all") count++;
		setActiveFilters(count);
	}, [filterAdopted, filterColor, filterDemeanor, filterBreed, filterAge]);

	const handleViewDog = (dog) => {
		navigate(`/dog/${dog._id}`);
	};

	const toggleFavorite = (e, dogId) => {
		e.stopPropagation();

		const newFavorites = favorites.includes(dogId)
			? favorites.filter((id) => id !== dogId)
			: [...favorites, dogId];

		setFavorites(newFavorites);
		localStorage.setItem("dogFavorites", JSON.stringify(newFavorites));
	};

	const resetFilters = () => {
		setFilterAdopted("all");
		setFilterColor("all");
		setFilterDemeanor("all");
		setFilterBreed("all");
		setFilterAge("all");
		setSortOption("");
		setSearchTerm("");
	};

	const filteredDogs = dogs
		.filter((dog) => {
			// Search term filter
			const matchesSearch =
				searchTerm === "" ||
				(dog.name &&
					dog.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
				(dog.breed &&
					dog.breed.toLowerCase().includes(searchTerm.toLowerCase()));

			// Adoption status filter
			const matchesAdopted =
				filterAdopted === "all" ||
				(filterAdopted === "adopted" && dog.adopted) ||
				(filterAdopted === "notAdopted" && !dog.adopted);

			// Color filter
			const matchesColor = filterColor === "all" || dog.color === filterColor;

			// Demeanor filter
			const matchesDemeanor =
				filterDemeanor === "all" || dog.demeanor === filterDemeanor;

			// Breed filter
			const matchesBreed = filterBreed === "all" || dog.breed === filterBreed;

			// Age filter
			const matchesAge =
				filterAge === "all" ||
				(filterAge === "puppy" && dog.age < 1) ||
				(filterAge === "young" && dog.age >= 1 && dog.age < 3) ||
				(filterAge === "adult" && dog.age >= 3 && dog.age < 8) ||
				(filterAge === "senior" && dog.age >= 8);

			return (
				matchesSearch &&
				matchesAdopted &&
				matchesColor &&
				matchesDemeanor &&
				matchesBreed &&
				matchesAge
			);
		})
		.sort((a, b) => {
			if (sortOption === "name_asc") return a.name.localeCompare(b.name);
			if (sortOption === "name_desc") return b.name.localeCompare(a.name);
			if (sortOption === "age_asc") return a.age - b.age;
			if (sortOption === "age_desc") return b.age - a.age;
			if (sortOption === "recent") {
				return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
			}
			return 0;
		});

	return (
		<div className="bg-[#f8f5f0] min-h-screen pb-12">
			{/* Hero Section */}
			<div className="bg-[#8c1d35] text-white py-12 px-4 md:px-12 relative overflow-hidden">
				<div className="max-w-7xl mx-auto relative z-10">
					<h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center">
						<FaPaw className="mr-3" /> Find Your Perfect Companion
					</h1>
					<p className="text-lg md:text-xl max-w-2xl">
						Browse our available dogs and give a loving home to a furry friend
						in need. Each adoption helps support our mission to end animal
						homelessness.
					</p>
				</div>

				{/* Decorative paw prints */}
				<div className="absolute top-0 right-0 opacity-10">
					<FaPaw className="text-white text-9xl transform rotate-12" />
				</div>
				<div className="absolute bottom-0 left-20 opacity-10">
					<FaPaw className="text-white text-7xl transform -rotate-12" />
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
				{/* Search and Filter Bar */}
				<div className="bg-white rounded-xl shadow-md p-4 mb-8">
					<div className="flex flex-col md:flex-row gap-4 items-center">
						{/* Search */}
						<div className="relative flex-grow">
							<FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
							<input
								type="text"
								placeholder="Search by name or breed..."
								className="border border-[#8c1d35] text-[#8c1d35] pl-10 pr-4 py-3 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						{/* Sort Dropdown */}
						<div className="relative min-w-[200px]">
							<div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
								<FaSortAmountDown />
							</div>
							<select
								className="appearance-none border border-[#8c1d35] text-[#8c1d35] pl-10 pr-10 py-3 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
								value={sortOption}
								onChange={(e) => setSortOption(e.target.value)}
							>
								<option value="">Sort by</option>
								<option value="name_asc">Name (A-Z)</option>
								<option value="name_desc">Name (Z-A)</option>
								<option value="age_asc">Age (Youngest)</option>
								<option value="age_desc">Age (Oldest)</option>
								<option value="recent">Recently Added</option>
							</select>
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
								<FaChevronDown />
							</div>
						</div>

						{/* Filter Toggle Button */}
						<button
							className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
								showFilters
									? "bg-[#8c1d35] text-white"
									: "bg-[#e8d3a9] text-[#8c1d35] hover:bg-[#d9c59a]"
							}`}
							onClick={() => setShowFilters(!showFilters)}
						>
							<FaFilter />
							<span>Filters</span>
							{activeFilters > 0 && (
								<span className="bg-white text-[#8c1d35] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
									{activeFilters}
								</span>
							)}
						</button>

						{/* Reset Filters Button - Only show if filters are active */}
						{activeFilters > 0 && (
							<button
								className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
								onClick={resetFilters}
							>
								<FaTimes />
								<span>Reset</span>
							</button>
						)}
					</div>

					{/* Expanded Filters */}
					{showFilters && (
						<div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
							{/* Adoption Status Filter */}
							<div className="space-y-1">
								<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
									<FaCalendarAlt className="mr-1 text-[#8c1d35]" /> Adoption
									Status
								</label>
								<select
									className="border border-[#8c1d35] text-[#8c1d35] px-3 py-2 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
									value={filterAdopted}
									onChange={(e) => setFilterAdopted(e.target.value)}
								>
									<option value="all">All Dogs</option>
									<option value="adopted">Adopted</option>
									<option value="notAdopted">Available for Adoption</option>
								</select>
							</div>

							{/* Color Filter */}
							<div className="space-y-1">
								<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
									<FaPalette className="mr-1 text-[#8c1d35]" /> Color
								</label>
								<select
									className="border border-[#8c1d35] text-[#8c1d35] px-3 py-2 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
									value={filterColor}
									onChange={(e) => setFilterColor(e.target.value)}
								>
									<option value="all">All Colors</option>
									{filterOptions.colors.map((color) => (
										<option key={color} value={color}>
											{color}
										</option>
									))}
								</select>
							</div>

							{/* Demeanor Filter */}
							<div className="space-y-1">
								<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
									<FaSmile className="mr-1 text-[#8c1d35]" /> Demeanor
								</label>
								<select
									className="border border-[#8c1d35] text-[#8c1d35] px-3 py-2 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
									value={filterDemeanor}
									onChange={(e) => setFilterDemeanor(e.target.value)}
								>
									<option value="all">All Demeanors</option>
									{filterOptions.demeanors.map((demeanor) => (
										<option key={demeanor} value={demeanor}>
											{demeanor}
										</option>
									))}
								</select>
							</div>

							{/* Breed Filter */}
							<div className="space-y-1">
								<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
									<FaDog className="mr-1 text-[#8c1d35]" /> Breed
								</label>
								<select
									className="border border-[#8c1d35] text-[#8c1d35] px-3 py-2 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
									value={filterBreed}
									onChange={(e) => setFilterBreed(e.target.value)}
								>
									<option value="all">All Breeds</option>
									{filterOptions.breeds.map((breed) => (
										<option key={breed} value={breed}>
											{breed}
										</option>
									))}
								</select>
							</div>

							{/* Age Filter */}
							<div className="space-y-1">
								<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
									<FaPaw className="mr-1 text-[#8c1d35]" /> Age
								</label>
								<select
									className="border border-[#8c1d35] text-[#8c1d35] px-3 py-2 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
									value={filterAge}
									onChange={(e) => setFilterAge(e.target.value)}
								>
									<option value="all">All Ages</option>
									<option value="puppy">Puppy (&lt; 1 year)</option>
									<option value="young">Young (1-3 years)</option>
									<option value="adult">Adult (3-8 years)</option>
									<option value="senior">Senior (8+ years)</option>
								</select>
							</div>
						</div>
					)}
				</div>

				{/* Results Count */}
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-xl font-bold text-gray-800">
						{filteredDogs.length} {filteredDogs.length === 1 ? "Dog" : "Dogs"}{" "}
						Found
					</h2>
				</div>

				{/* Loading State */}
				{loading ? (
					<div className="flex flex-col items-center justify-center py-12">
						<FaSpinner className="animate-spin text-[#8c1d35] text-4xl mb-4" />
						<p className="text-gray-600">Loading dogs...</p>
					</div>
				) : error ? (
					<div className="bg-red-100 text-red-700 p-6 rounded-lg text-center">
						<p>{error}</p>
					</div>
				) : filteredDogs.length === 0 ? (
					<div className="bg-white rounded-xl shadow-md p-8 text-center">
						<FaDog className="text-[#8c1d35] text-5xl mx-auto mb-4 opacity-50" />
						<h3 className="text-xl font-bold text-gray-800 mb-2">
							No Dogs Found
						</h3>
						<p className="text-gray-600 mb-4">
							We couldn't find any dogs matching your current filters.
						</p>
						<button
							onClick={resetFilters}
							className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg hover:bg-[#7c1025] transition-colors"
						>
							Reset Filters
						</button>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredDogs.map((dog) => (
							<DogCard
								key={dog._id}
								dog={dog}
								onViewDog={handleViewDog}
								isFavorite={favorites.includes(dog._id)}
								onToggleFavorite={toggleFavorite}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}