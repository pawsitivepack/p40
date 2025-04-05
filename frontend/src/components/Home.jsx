import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import dogBackground from "../assets/dog.png";
import {
	FaUserShield,
	FaDog,
	FaWalking,
	FaDonate,
	FaUsers,
	FaPaw,
	FaCalendarAlt,
	FaHistory,
	FaCogs,
	FaArrowRight,
	FaBone,
	FaPeopleCarry,
	FaHeart,
	FaHandHoldingHeart,
	FaHome,
} from "react-icons/fa";

export default function Home() {
	const [role, setRole] = useState("");
	const [walks, setWalks] = useState([]);
	const [pastWalks, setPastWalks] = useState([]);
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(true);
	const [featuredDogs, setFeaturedDogs] = useState([]);
	const [displayedDogs, setDisplayedDogs] = useState([]);
	const [currentDogIndex, setCurrentDogIndex] = useState(0);
	const [previousIndices, setPreviousIndices] = useState([]);

	// Function to get a random dog that hasn't been shown recently
	const getRandomDogIndex = () => {
		if (featuredDogs.length <= 1) return 0;

		let newIndex;
		do {
			newIndex = Math.floor(Math.random() * featuredDogs.length);
		} while (
			previousIndices.includes(newIndex) &&
			previousIndices.length < featuredDogs.length - 1
		);

		// Keep track of recently shown dogs to avoid repeats
		setPreviousIndices((prev) => {
			const updated = [...prev, newIndex];
			// Only keep track of the last few dogs to eventually allow repeats
			if (updated.length > Math.min(5, featuredDogs.length - 1)) {
				return updated.slice(1);
			}
			return updated;
		});

		return newIndex;
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentDogIndex(getRandomDogIndex());
		}, 3000); // change image every 3 seconds
		return () => clearInterval(interval);
	}, [featuredDogs, previousIndices]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setRole(decoded.role);
				setUsername(decoded.username || decoded.firstName || "");
				fetchWalks(decoded.id, decoded.role);
			} catch (error) {
				console.error("Invalid token:", error);
				setRole("");
			} finally {
				setLoading(false);
			}
		} else {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchFeaturedDogs();
	}, []);

	const fetchFeaturedDogs = async () => {
		try {
			const response = await api.get("/dogs");
			// Get all available dogs, not just the first 3
			const availableDogs = response.data.filter((dog) => !dog.adopted);
			setFeaturedDogs(availableDogs);

			// Select 3 random dogs for the grid display
			const shuffled = [...availableDogs].sort(() => 0.5 - Math.random());
			setDisplayedDogs(shuffled.slice(0, 3));
		} catch (error) {
			console.error("Error fetching dogs:", error);
		}
	};

	const fetchWalks = async (userId, userRole) => {
		try {
			setLoading(true);
			let response;
			let pastwalksgetter;

			if (userRole === "user") {
				response = await api.get(`/completedWalk/upcomingWalks`);

				pastwalksgetter = await api.get("/completedWalk/pastWalks");
				setPastWalks(pastwalksgetter.data || []);
			} else {
				response = await api.get(`/scheduledWalks`);
				pastwalksgetter = await api.get(`/completedwalk`);
				setPastWalks(pastwalksgetter.data || []);
			}

			setWalks(response.data);
		} catch (error) {
			console.error("Error fetching walks:", error);
		} finally {
			setLoading(false);
		}
	};

	const formatDate = (dateString) =>
		new Date(dateString).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
		});

	const formatTime = (dateString) =>
		new Date(dateString).toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});

	// Quick Link Renderer
	const renderLink = (to, icon, label) => {
		return (
			<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
				<Link
					to={to}
					className="flex items-center justify-between p-3 rounded-lg bg-[#fdf9f2] border border-[#f0e5d0] hover:bg-white hover:border-[#e5c98e] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-gray-800 font-medium"
				>
					<div className="flex items-center">
						<div className="w-10 h-10 rounded-full bg-[#8c1d35] flex items-center justify-center mr-3 text-white shadow-sm">
							{icon}
						</div>
						{label}
					</div>
					<FaArrowRight className="text-[#8c1d35] opacity-70" />
				</Link>
			</motion.div>
		);
	};
	// Quick Links Section Component
	const QuickLinksSection = () => (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
			<div className="bg-gradient-to-r from-[#e8d3a9] to-[#f0ddb8] px-5 py-4 border-b border-gray-200">
				<h3 className="text-xl font-bold text-[#8c1d35] flex items-center">
					<FaUserShield className="mr-2" /> Quick Links
				</h3>
			</div>
			<div className="p-4 space-y-3">
				{role === "admin" && (
					<>
						{renderLink(
							"/marshal-application",
							<FaUserShield />,
							"Marshal Application"
						)}
						{renderLink("/dog-inventory", <FaDog />, "Dog Inventory")}
						{renderLink("/adoption-board", <FaPaw />, "Adoption Board")}
						{renderLink(
							"/adoption-inquiries",
							<FaHandHoldingHeart />,
							"Adoption Inquiries"
						)}
						{renderLink("/users", <FaUsers />, "Manage Users")}
						{renderLink("/dog-walk-summary", <FaDonate />, "Reports")}
					</>
				)}
				{role === "" && (
					<>
						{renderLink("/adoption-board", <FaPaw />, "Adoption Board")}
						{renderLink("/login", <FaUserShield />, "Login")}
					</>
				)}
				{role === "marshal" && (
					<>
						{renderLink("/adoption-board", <FaPaw />, "Adoption Board")}
						{renderLink("/donate", <FaDonate />, "Donate & Support")}
						{renderLink("/walkdogs", <FaWalking />, "Walk Dogs")}
					</>
				)}
				{role === "user" && (
					<>
						{renderLink(
							"/marshal-application",
							<FaUserShield />,
							"Apply for Marshal"
						)}
						{renderLink("/adoption-board", <FaPaw />, "Adoption Board")}
						{renderLink("/mywalks", <FaWalking />, "My Walks")}
						{renderLink("/donate", <FaDonate />, "Donate & Support")}
						{renderLink("/waiver", <FaHandHoldingHeart />, "Waiver Form")}
					</>
				)}
			</div>
		</div>
	);

	// Upcoming Walks Section Component
	const UpcomingWalksSection = () => (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
			<div className="bg-gradient-to-r from-[#e8d3a9] to-[#f0ddb8] px-5 py-4 border-b border-gray-200">
				<h3 className="text-lg font-semibold text-[#8c1d35] flex items-center tracking-wide">
					<FaCalendarAlt className="mr-2" /> Upcoming Walks
				</h3>
			</div>
			<div className="p-5">
				{loading ? (
					<div className="flex justify-center py-4">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8c1d35]"></div>
					</div>
				) : walks.length > 0 ? (
					<div className="space-y-4">
						{walks.slice(0, 3).map((walk) => (
							<motion.div
								key={walk._id}
								className="p-3 bg-[#fdf9f2] rounded-lg border border-[#f0e5d0]"
								whileHover={{
									y: -2,
									boxShadow: "0 5px 15px -3px rgba(0, 0, 0, 0.1)",
								}}
							>
								<div className="flex items-center justify-between">
									<p className="font-semibold text-[#8c1d35]">
										{formatDate(walk.date)}
									</p>
									<p className="text-sm bg-[#e8d3a9] px-2 py-1 rounded text-[#8c1d35] font-medium">
										{formatTime(walk.date)}
									</p>
								</div>
								{walk.dogId && (
									<p className="text-sm text-gray-600 mt-1 flex items-center">
										<FaDog className="mr-1 text-gray-500" /> {walk.dogId.name}
									</p>
								)}
							</motion.div>
						))}
						<Link
							to="/mywalks"
							className="text-[#8c1d35] text-sm font-medium flex items-center hover:underline"
						>
							View all walks <FaArrowRight className="ml-1" />
						</Link>
					</div>
				) : (
					<div className="text-center py-4 text-gray-500">
						<FaCalendarAlt className="mx-auto text-2xl mb-2 text-gray-400" />
						<p>No upcoming walks scheduled.</p>
					</div>
				)}
			</div>
		</div>
	);

	// Past Walks Section Component
	const PastWalksSection = () => (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
			<div className="bg-gradient-to-r from-[#e8d3a9] to-[#f0ddb8] px-5 py-4 border-b border-gray-200">
				<h3 className="text-lg font-semibold text-[#8c1d35] flex items-center tracking-wide">
					<FaHistory className="mr-2" /> Past Walks
				</h3>
			</div>
			<div className="p-5">
				{loading ? (
					<div className="flex justify-center py-4">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8c1d35]"></div>
					</div>
				) : pastWalks.length > 0 ? (
					<div className="space-y-4">
						{pastWalks.slice(0, 3).map((walk) => (
							<motion.div
								key={walk._id}
								className="p-3 bg-[#fdf9f2] rounded-lg border border-[#f0e5d0]"
								whileHover={{
									y: -2,
									boxShadow: "0 5px 15px -3px rgba(0, 0, 0, 0.1)",
								}}
							>
								<p className="font-semibold text-[#8c1d35]">
									{formatDate(walk.date)}
								</p>
								<p className="text-sm text-gray-600 mt-1 flex items-center">
									<FaDog className="mr-1 text-gray-500" />
									{walk.dogs?.map((dogs) => dogs.name).join(", ")}
								</p>
							</motion.div>
						))}
						<Link
							to="/walk-history"
							className="text-[#8c1d35] text-sm font-medium flex items-center hover:underline"
						>
							View walk history <FaArrowRight className="ml-1" />
						</Link>
					</div>
				) : (
					<div className="text-center py-4 text-gray-500">
						<FaHistory className="mx-auto text-2xl mb-2 text-gray-400" />
						<p>No past walks recorded.</p>
					</div>
				)}
			</div>
		</div>
	);

	// Notifications Section Component
	const NotificationsSection = () => (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
			<div className="bg-gradient-to-r from-[#e8d3a9] to-[#f0ddb8] px-5 py-4 border-b border-gray-200">
				<h3 className="text-lg font-semibold text-[#8c1d35] flex items-center tracking-wide">
					<FaCogs className="mr-2" /> Notifications
				</h3>
			</div>
			<div className="p-5">
				<div className="text-center py-4 text-gray-500">
					<FaCogs className="mx-auto text-2xl mb-2 text-gray-400" />
					<p>No new notifications.</p>
				</div>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#f8f5f0] to-[#f0e9df]">
			<div
				className="fixed inset-0 z-0 bg-cover bg-center opacity-15"
				style={{ backgroundImage: `url(${dogBackground})` }}
			></div>

			<div className="relative z-10 w-full">
				<div className="w-full py-8 md:py-12 px-4 lg:px-8">
					{/* Dog Image Slider with Welcome Message Overlay */}
					<div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100 mb-6 relative">
						<div className="overflow-hidden rounded-xl relative h-[80vh] min-h-[400px]">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentDogIndex}
									initial={{ opacity: 0, scale: 1.1 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.9 }}
									transition={{ duration: 0.7 }}
									className="absolute inset-0"
								>
									<img
										src={
											featuredDogs.length > 0
												? featuredDogs[currentDogIndex]?.imageURL
												: "/placeholder.svg"
										}
										alt={
											featuredDogs.length > 0
												? `Featured Dog: ${featuredDogs[currentDogIndex]?.name}`
												: "Featured Dog"
										}
										className="w-full h-full object-cover"
									/>
								</motion.div>
							</AnimatePresence>

							{/* Random Dog Indicator */}
							<div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center">
								<span className="mr-1">Random Dog</span>
								<motion.div
									animate={{ rotate: 360 }}
									transition={{
										duration: 2,
										repeat: Number.POSITIVE_INFINITY,
										ease: "linear",
									}}
									className="w-3 h-3 rounded-full bg-[#e8d3a9]"
								/>
							</div>

							{/* Welcome Message Overlay at Bottom */}
							<motion.div
								className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#8c1d35]/90 to-[#a82741]/70 p-5 md:p-8"
								initial={{ y: 50, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.2, duration: 0.5 }}
							>
								<div className="flex flex-col sm:flex-row items-center justify-between">
									<div className="text-center sm:text-left mb-4 sm:mb-0">
										<h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2 leading-tight text-white">
											Welcome
											{username ? `, ${username}!` : " to ULM P40 UNDERDOGS!"}
										</h1>
										<p className="text-[#f8d3a9] opacity-90 text-sm sm:text-base max-w-full sm:max-w-md overflow-hidden text-ellipsis">
											We're dedicated to providing care and finding homes for
											dogs in need. Join us in making a difference.
										</p>
									</div>
									<div className="flex-shrink-0">
										<FaPaw className="text-5xl sm:text-6xl md:text-7xl text-[#e8d3a9] opacity-80" />
									</div>
								</div>
							</motion.div>
						</div>
					</div>

					{/* Main Content Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-[20%_60%_20%] gap-6 pr-4 lg:pr-8">
						{/* Mobile-only Quick Links and Upcoming Walks - shown after dog photo on mobile */}
						<div className="lg:hidden space-y-6">
							<QuickLinksSection />
							<UpcomingWalksSection />
						</div>

						{/* Left Column - Quick Links - hidden on mobile */}
						<div className="hidden lg:block transition-all duration-300 lg:sticky lg:top-[64px] self-start">
							<QuickLinksSection />
						</div>

						{/* Middle Column - Main Content */}
						<motion.div
							className="transition-all duration-300 space-y-6"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
							{/* Mission Section */}
							<motion.div
								className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
								initial={{ y: 20, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.5 }}
								viewport={{ once: true }}
							>
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-2xl font-bold text-[#8c1d35]">
										<FaBone className="inline mr-2" /> Our Mission
									</h2>
									<div className="h-1 flex-grow ml-4 bg-gradient-to-r from-[#e8d3a9] to-transparent rounded-full"></div>
								</div>

								<div className="grid md:grid-cols-2 gap-6">
									<motion.div
										className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0]"
										whileHover={{
											y: -5,
											boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
										}}
										transition={{ duration: 0.2 }}
									>
										<div className="w-12 h-12 rounded-full bg-[#8c1d35] flex items-center justify-center mb-4 text-white">
											<FaDog className="text-xl" />
										</div>
										<h3 className="text-lg font-semibold text-[#8c1d35] mb-2">
											Dog Care
										</h3>
										<p className="text-gray-600">
											We provide shelter, food, medical care, and love to dogs
											in need until they find their forever homes.
										</p>
									</motion.div>

									<motion.div
										className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0]"
										whileHover={{
											y: -5,
											boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
										}}
										transition={{ duration: 0.2 }}
									>
										<div className="w-12 h-12 rounded-full bg-[#8c1d35] flex items-center justify-center mb-4 text-white">
											<FaPeopleCarry className="text-xl" />
										</div>
										<h3 className="text-lg font-semibold text-[#8c1d35] mb-2">
											Community Support
										</h3>
										<p className="text-gray-600">
											Our volunteers and supporters make our mission possible
											through donations, walks, and advocacy.
										</p>
									</motion.div>
								</div>
							</motion.div>

							{/* Featured Dogs Section */}
							<motion.div
								className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
								initial={{ y: 20, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.5 }}
								viewport={{ once: true }}
							>
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-2xl font-bold text-[#8c1d35]">
										<FaPaw className="inline mr-2" /> Featured Dogs
									</h2>
									<Link
										to="/adoption-board"
										className="text-[#8c1d35] text-sm font-medium flex items-center hover:underline"
									>
										View all <FaArrowRight className="ml-1" />
									</Link>
								</div>

								{/* Featured Dogs Grid - Using displayedDogs for the grid */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{displayedDogs.map((dog, index) => (
										<Link key={dog._id} to={`/dog/${dog._id}`}>
											<motion.div
												className="bg-[#fdf9f2] rounded-xl overflow-hidden border border-[#f0e5d0] shadow-sm"
												initial={{ opacity: 0, y: 20 }}
												whileInView={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.3, delay: index * 0.1 }}
												whileHover={{
													y: -5,
													boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
												}}
												viewport={{ once: true }}
											>
												<div className="h-40 bg-gray-200 relative">
													<div className="absolute top-2 right-2 bg-[#8c1d35] text-white text-xs font-bold px-2 py-1 rounded-full">
														{dog.age} {dog.age === 1 ? "yr" : "yrs"}
													</div>
													<img
														src={
															dog.imageURL ||
															"/placeholder.svg?height=160&width=240"
														}
														alt={dog.name}
														className="w-full h-full object-cover"
													/>
												</div>
												<div className="p-4">
													<h3 className="font-bold text-[#8c1d35]">
														{dog.name}
													</h3>
													<p className="text-sm text-gray-600">{dog.breed}</p>
													<div className="flex mt-2 space-x-2">
														<span className="bg-[#e8d3a9] text-[#8c1d35] text-xs px-2 py-1 rounded-full">
															{dog.demeanor || "Friendly"}
														</span>
														<span className="bg-[#e8d3a9] text-[#8c1d35] text-xs px-2 py-1 rounded-full">
															{dog.color}
														</span>
													</div>
												</div>
											</motion.div>
										</Link>
									))}
								</div>
							</motion.div>

							{/* Success Stories */}
							<motion.div
								className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
								initial={{ y: 20, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.5 }}
								viewport={{ once: true }}
							>
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-2xl font-bold text-[#8c1d35]">
										<FaHeart className="inline mr-2" /> Success Stories
									</h2>
									<div className="h-1 flex-grow ml-4 bg-gradient-to-r from-[#e8d3a9] to-transparent rounded-full"></div>
								</div>

								<motion.div
									className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0] mb-4"
									whileHover={{
										y: -5,
										boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
									}}
								>
									<div className="flex flex-col md:flex-row gap-4">
										<div className="w-full md:w-1/3">
											<img
												src="/placeholder.svg?height=150&width=150"
												alt="Rocky with new family"
												className="w-full h-32 object-cover rounded-lg"
											/>
										</div>
										<div className="w-full md:w-2/3">
											<h3 className="text-lg font-semibold text-[#8c1d35] mb-1">
												Rocky Found His Forever Home
											</h3>
											<p className="text-sm text-gray-500 mb-2">
												Adopted March 2023
											</p>
											<p className="text-gray-600">
												After 6 months at our shelter, Rocky was adopted by the
												Johnson family. He now enjoys long hikes and has become
												best friends with their 7-year-old son.
											</p>
										</div>
									</div>
								</motion.div>

								<motion.div
									className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0]"
									whileHover={{
										y: -5,
										boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
									}}
								>
									<div className="flex flex-col md:flex-row gap-4">
										<div className="w-full md:w-1/3">
											<img
												src="/placeholder.svg?height=150&width=150"
												alt="Daisy with new family"
												className="w-full h-32 object-cover rounded-lg"
											/>
										</div>
										<div className="w-full md:w-2/3">
											<h3 className="text-lg font-semibold text-[#8c1d35] mb-1">
												Daisy's Second Chance
											</h3>
											<p className="text-sm text-gray-500 mb-2">
												Adopted January 2023
											</p>
											<p className="text-gray-600">
												Rescued from a difficult situation, Daisy has blossomed
												in her new home. Her new family reports she loves car
												rides and has become the neighborhood's favorite dog.
											</p>
										</div>
									</div>
								</motion.div>
							</motion.div>

							{/* How You Can Help */}
							<motion.div
								className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
								initial={{ y: 20, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.5 }}
								viewport={{ once: true }}
							>
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-2xl font-bold text-[#8c1d35]">
										<FaHandHoldingHeart className="inline mr-2" /> How You Can
										Help
									</h2>
									<div className="h-1 flex-grow ml-4 bg-gradient-to-r from-[#e8d3a9] to-transparent rounded-full"></div>
								</div>

								<div className="grid md:grid-cols-3 gap-4">
									<motion.div
										className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0] text-center"
										whileHover={{
											y: -5,
											boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
										}}
									>
										<div className="w-12 h-12 rounded-full bg-[#8c1d35] flex items-center justify-center mx-auto mb-4 text-white">
											<FaWalking className="text-xl" />
										</div>
										<h3 className="text-lg font-semibold text-[#8c1d35] mb-2">
											Volunteer
										</h3>
										<p className="text-gray-600 text-sm">
											Walk dogs, help with events, or assist with administrative
											tasks.
										</p>
										<Link
											to="/volunteer"
											className="mt-3 inline-block text-[#8c1d35] font-medium text-sm hover:underline"
										>
											Learn more →
										</Link>
									</motion.div>

									<motion.div
										className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0] text-center"
										whileHover={{
											y: -5,
											boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
										}}
									>
										<div className="w-12 h-12 rounded-full bg-[#8c1d35] flex items-center justify-center mx-auto mb-4 text-white">
											<FaDonate className="text-xl" />
										</div>
										<h3 className="text-lg font-semibold text-[#8c1d35] mb-2">
											Donate
										</h3>
										<p className="text-gray-600 text-sm">
											Support our mission with financial contributions or
											supplies from our wishlist.
										</p>
										<Link
											to="/donate"
											className="mt-3 inline-block text-[#8c1d35] font-medium text-sm hover:underline"
										>
											Donate now →
										</Link>
									</motion.div>

									<motion.div
										className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0] text-center"
										whileHover={{
											y: -5,
											boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
										}}
									>
										<div className="w-12 h-12 rounded-full bg-[#8c1d35] flex items-center justify-center mx-auto mb-4 text-white">
											<FaHome className="text-xl" />
										</div>
										<h3 className="text-lg font-semibold text-[#8c1d35] mb-2">
											Foster
										</h3>
										<p className="text-gray-600 text-sm">
											Provide a temporary home for a dog waiting for adoption.
										</p>
										<Link
											to="/foster"
											className="mt-3 inline-block text-[#8c1d35] font-medium text-sm hover:underline"
										>
											Apply now →
										</Link>
									</motion.div>
								</div>
							</motion.div>

							{/* Our Partners */}
							<motion.div
								className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
								initial={{ y: 20, opacity: 0 }}
								whileInView={{ y: 0, opacity: 1 }}
								transition={{ duration: 0.5 }}
								viewport={{ once: true }}
							>
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-2xl font-bold text-[#8c1d35]">
										🤝 Our Partners
									</h2>
									<div className="h-1 flex-grow ml-4 bg-gradient-to-r from-[#e8d3a9] to-transparent rounded-full"></div>
								</div>

								<div className="grid md:grid-cols-3 gap-4">
									{/* Partner 1 */}
									<motion.div
										className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0] text-center"
										whileHover={{
											y: -5,
											boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
										}}
									>
										<img
											src="/partner1.png"
											alt="Partner 1"
											className="w-20 h-20 mx-auto mb-4 object-contain"
										/>
										<h3 className="text-lg font-semibold text-[#8c1d35] mb-1">
											Happy Tails Vet
										</h3>
										<p className="text-sm text-gray-600">
											Providing regular checkups, vaccinations, and medical care
											to our dogs.
										</p>
									</motion.div>

									{/* Partner 2 */}
									<motion.div
										className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0] text-center"
										whileHover={{
											y: -5,
											boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
										}}
									>
										<img
											src="/partner2.png"
											alt="Partner 2"
											className="w-20 h-20 mx-auto mb-4 object-contain"
										/>
										<h3 className="text-lg font-semibold text-[#8c1d35] mb-1">
											PetCo Foundation
										</h3>
										<p className="text-sm text-gray-600">
											Supporting our shelter through generous donations and
											supplies.
										</p>
									</motion.div>

									{/* Partner 3 */}
									<motion.div
										className="bg-[#fdf9f2] rounded-xl p-5 shadow-sm border border-[#f0e5d0] text-center"
										whileHover={{
											y: -5,
											boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
										}}
									>
										<img
											src="/partner3.png"
											alt="Partner 3"
											className="w-20 h-20 mx-auto mb-4 object-contain"
										/>
										<h3 className="text-lg font-semibold text-[#8c1d35] mb-1">
											ULM Students United
										</h3>
										<p className="text-sm text-gray-600">
											Volunteers and event support from students passionate
											about animal care.
										</p>
									</motion.div>
								</div>
							</motion.div>
						</motion.div>

						{/* Right Column - Upcoming Walks, Past Walks, Notifications - hidden on mobile */}
						<div className="hidden lg:block space-y-6 transition-all duration-300 lg:sticky top-[70px] self-start">
							<UpcomingWalksSection />
							<PastWalksSection />
							<NotificationsSection />
						</div>

						{/* Mobile-only Past Walks and Notifications - shown at the bottom on mobile */}
						<div className="lg:hidden space-y-6">
							<PastWalksSection />
							<NotificationsSection />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
