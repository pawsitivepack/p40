import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import { BellIcon } from "@heroicons/react/24/outline";
import logo from "../assets/underdogs.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { HiOutlineUserCircle } from "react-icons/hi";

export default function Navbar() {
	const location = useLocation();
	const currentPage = location.pathname;
	const navigate = useNavigate();
	const [role, setRole] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [applications, setApplications] = useState([]);
	const [showNotifications, setShowNotifications] = useState(false);
	const [picture, setPicture] = useState("");
	const [isScrolled, setIsScrolled] = useState(false);
	const [adoptions, setAdoptions] = useState([]);

	const dropdownRef = useRef(null);
	const notificationRef = useRef(null);

	// Check token on mount and refresh the state
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);

				setRole(decoded.role);
				setUsername(decoded.username);
				setEmail(decoded.email);
				setPicture(decoded.picture);

				setIsLoggedIn(true);
			} catch (error) {
				console.error("Invalid token:", error);
				localStorage.removeItem("token");
			}
		}
	}, [localStorage.getItem("token")]);

	// Handle scroll effect for sticky navbar
	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 10) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsDropdownOpen(false);
			}
			if (
				notificationRef.current &&
				!notificationRef.current.contains(event.target)
			) {
				setShowNotifications(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		const fetchApplications = async () => {
			if (role === "admin") {
				try {
					const res = await api.get(`/marshalApps`);
					setApplications(res.data);
				} catch (error) {
					console.error("Error fetching applications:", error);
				}
			}
		};
		fetchApplications();
	}, [role]);
	
	useEffect(() => {
		if (role === "admin") {
			const fetchNotifications = async () => {
				try {
					const marshalRes = await api.get(`/marshalApps`);
					const adoptionRes = await api.get(`/adoptions/pending`);
					setApplications(marshalRes.data);
					setAdoptions(adoptionRes.data);
				} catch (error) {
					console.error("Error fetching notifications:", error);
				}
			};
			fetchNotifications();
		}
	}, [role]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		setIsLoggedIn(false);
		toast.success("You have been logged out successfully!");
		setTimeout(() => {
			window.location.href = "/login";
		}, 1500);
	};

	const baseNavigation = [
		{ name: "Home", href: "/home" },
		{ name: "About", href: "/about" },
		{ name: "Gallery", href: "/gallery" },
		{ name: "Walk Dogs", href: "/walkdogs" },
		{ name: "Donate", href: "/donate" },
	];

	const adminNavigation = [
		{ name: "Scheduled Walks", href: "/scheduledwalk" },
		{ name: "Users", href: "/users" },
	];

	const navigation =
		role === "admin" || role === "marshal"
			? [...baseNavigation, ...adminNavigation]
			: baseNavigation;

	return (
		<nav
			className={`bg-[#e8d3a9] sticky top-0 z-50 ${
				isScrolled ? "shadow-md" : ""
			} transition-all duration-300`}
		>
			<div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
				<div className="relative flex h-16 items-center justify-between">
					{/* Mobile Menu Toggle */}
					<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="relative inline-flex items-center justify-center rounded-md p-2 text-[#333] hover:bg-[#d9c59a] hover:text-[#8c1d35] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8c1d35]"
							aria-expanded={isMenuOpen ? "true" : "false"}
						>
							<span className="sr-only">Open main menu</span>
							{isMenuOpen ? (
								<svg
									className="block h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							) : (
								<svg
									className="block h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M4 6h16M4 12h16M4 18h16"
									/>
								</svg>
							)}
						</button>
					</div>

					<div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
						{/* Logo */}
						<div className="flex shrink-0 items-center relative">
							<div className="relative overflow-hidden">
								<img
									className="h-10 w-auto transition-transform duration-300 hover:scale-105"
									src={logo || "/placeholder.svg"}
									alt="P40 Underdogs"
								/>
							</div>
						</div>

						{/* Desktop Navigation */}
						<div className="hidden sm:ml-6 sm:block">
							<div className="flex space-x-1">
								{navigation.map((item) => (
									<a
										key={item.name}
										href={item.href}
										className={`group relative px-4 py-2 text-sm font-medium transition-all duration-200 ${
											currentPage === item.href
												? "text-[#8c1d35] bg-[#d9c59a]"
												: "text-[#333] hover:bg-[#d9c59a] hover:text-[#8c1d35]"
										} rounded-md`}
									>
										{item.name}
										<span
											className={`absolute bottom-0 left-0 h-0.5 bg-[#8c1d35] transition-all duration-300 ${
												currentPage === item.href
													? "w-full"
													: "w-0 group-hover:w-full"
											}`}
										></span>
									</a>
								))}
							</div>
						</div>
					</div>

					<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-3">
						{/* Notifications Bell for Admin */}
						{role === "admin" && (
							<div className="relative" ref={notificationRef}>
								<button
									className="relative p-1 rounded-full text-[#333] hover:text-[#8c1d35] hover:bg-[#d9c59a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8c1d35]"
									onClick={() => setShowNotifications(!showNotifications)}
								>
									<span className="sr-only">View notifications</span>
									<BellIcon className="h-6 w-6" />
									{applications.length > 0 && adoptions.length > 0 && (
										<span className="absolute -top-1 -right-1 bg-[#8c1d35] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
											{applications.length  + adoptions.length}
										</span>
									)}
								</button>

								{/* Notifications Dropdown */}
								{showNotifications && (
									<div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden border border-gray-200 transform origin-top-right transition-all duration-200">
										<div className="bg-[#f8f8f8] px-4 py-2 border-b border-gray-200">
											<h3 className="text-sm font-semibold text-[#333]">
												Notifications
											</h3>
										</div>
										<div className="max-h-96 overflow-y-auto">
										{applications.length === 0 && adoptions.length === 0 ? (
											<div className="p-4 text-center text-gray-500 text-sm">
												No new notifications
											</div>
											) : (
											<>
												{/* Marshal Applications */}
												{applications.map((app) => (
												<div
													key={app._id}
													className="p-3 border-b border-gray-100 hover:bg-[#f5f5f5] cursor-pointer transition-colors duration-150"
													onClick={() => {
													setShowNotifications(false);
													navigate("/marshal-application", {
														state: { application: app },
													});
													}}
												>
													<div className="flex items-start">
													<div className="flex-shrink-0 mr-3">
														<div className="w-8 h-8 rounded-full bg-[#8c1d35] flex items-center justify-center text-white text-xs font-bold">
														{app.userId?.firstName?.[0]}{app.userId?.lastName?.[0]}
														</div>
													</div>
													<div>
														<p className="text-sm font-medium text-gray-800">
														<span className="font-semibold">{app.userId?.firstName} {app.userId?.lastName}</span> applied for Marshal
														</p>
														<p className="text-xs text-gray-500 mt-1">
														{new Date(app.applicationDate).toLocaleDateString()} at{" "}
														{new Date(app.applicationDate).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
														})}
														</p>
													</div>
													</div>
												</div>
												))}

												{/* Adoption Requests */}
												{adoptions.map((adopt) => (
												<div
													key={adopt._id}
													className="p-3 border-b border-gray-100 hover:bg-[#f5f5f5] cursor-pointer transition-colors duration-150"
													onClick={() => {
													setShowNotifications(false);
													navigate("/adoption-inquiries");
													}}
												>
													<div className="flex items-start">
													<div className="flex-shrink-0 mr-3">
														<div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold">
														{adopt.Userid?.firstName?.[0]}{adopt.Userid?.lastName?.[0]}
														</div>
													</div>
													<div>
														<p className="text-sm font-medium text-gray-800">
														<span className="font-semibold">{adopt.Userid?.firstName} {adopt.Userid?.lastName}</span> wants to adopt <span className="font-semibold">{adopt.Dogid?.name}</span>
														</p>
														<p className="text-xs text-gray-500 mt-1">
														{new Date(adopt.createdAt).toLocaleDateString()} at{" "}
														{new Date(adopt.createdAt).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
														})}
														</p>
													</div>
													</div>
												</div>
												))}
											</>
											)}

										</div>
										{applications.length > 0 && (
											<div className="p-2 bg-[#f8f8f8] border-t border-gray-200">
												<button
													className="w-full text-xs text-[#8c1d35] hover:text-[#6b1528] font-medium py-1"
													onClick={() => navigate("/applications")}
												>
													View all applications
												</button>
											</div>
										)}
									</div>
								)}
							</div>
						)}

						{/* User Menu or Login Button */}
						{isLoggedIn ? (
							<div className="relative ml-3" ref={dropdownRef}>
								<button
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									className="relative flex rounded-full bg-[#d9c59a] text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d35] p-0.5 transition-all duration-200 hover:bg-[#c9b58a]"
									id="user-menu-button"
									aria-expanded={isDropdownOpen ? "true" : "false"}
								>
									<span className="sr-only">Open user menu</span>
									<img
										className="h-8 w-8 rounded-full object-cover"
										src={picture || "https://via.placeholder.com/150"}
										alt={username}
									/>
								</button>

								{/* User Dropdown Menu */}
								{isDropdownOpen && (
									<div
										className="absolute right-0 z-10 mt-2 w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200"
										role="menu"
										aria-orientation="vertical"
										aria-labelledby="user-menu-button"
									>
										<div className="px-4 py-3 border-b border-gray-100">
											<div className="flex items-center">
												<img
													className="h-10 w-10 rounded-full object-cover mr-3"
													src={picture || "https://via.placeholder.com/150"}
													alt={username}
												/>
												<div>
													<p className="text-sm font-semibold text-gray-800">
														{username}
													</p>
													<p className="text-xs text-gray-600 truncate max-w-[180px]">
														{email}
													</p>
													<p className="text-xs text-[#8c1d35] font-medium capitalize mt-0.5">
														{role}
													</p>
												</div>
											</div>
										</div>

										<div className="py-1">
											<a
												href="/myprofile"
												className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f5f5f5] transition-colors duration-150"
												role="menuitem"
											>
												<HiOutlineUserCircle className="text-lg text-gray-500" />
												<span>My Profile</span>
											</a>

											{role === "admin" && (
												<a
													href="/dashboard"
													className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f5f5f5] transition-colors duration-150"
													role="menuitem"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														className="h-5 w-5 text-gray-500"
														viewBox="0 0 20 20"
														fill="currentColor"
													>
														<path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
													</svg>
													<span>Dashboard</span>
												</a>
											)}

											<div className="border-t border-gray-100 my-1"></div>

											<button
												onClick={handleLogout}
												className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-[#8c1d35] hover:bg-[#fff0f0] transition-colors duration-150"
												role="menuitem"
											>
												<FiLogOut className="text-lg" />
												<span>Logout</span>
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							<a
								href="/login"
								className="inline-flex items-center justify-center px-4 py-2 bg-[#8c1d35] text-white font-medium rounded-md hover:bg-[#7c1025] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8c1d35]"
							>
								Login
							</a>
						)}
					</div>
				</div>
			</div>

			{/* Mobile Menu - Improved with animations */}
			<div
				className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
					isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
				}`}
			>
				<div className="space-y-1 px-2 pb-3 pt-2 border-t border-[#d9c59a]">
					{navigation.map((item) => (
						<a
							key={item.name}
							href={item.href}
							className={`block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200 ${
								currentPage === item.href
									? "bg-[#d9c59a] text-[#8c1d35]"
									: "text-[#333] hover:bg-[#d9c59a] hover:text-[#8c1d35]"
							}`}
						>
							{item.name}
						</a>
					))}
					{!isLoggedIn && (
						<a
							href="/login"
							className="block w-full text-center mt-2 rounded-md px-3 py-2 text-base font-medium bg-[#8c1d35] text-white hover:bg-[#7c1025] transition-colors duration-200"
						>
							Login
						</a>
					)}
				</div>
			</div>
		</nav>
	);
}
