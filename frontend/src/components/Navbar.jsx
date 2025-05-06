"use client";

import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import logo from "../assets/underdogs.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { HiOutlineUserCircle } from "react-icons/hi";
import Notifications from "./Notifications";

export default function Navbar() {
	const location = useLocation();
	const currentPath = location.pathname;
	const navigate = useNavigate();

	// User state
	const [userProfile, setUserProfile] = useState({
		role: "",
		username: "",
		email: "",
		picture: "",
		isAuthenticated: false,
	});

	// UI state
	const [uiState, setUiState] = useState({
		isProfileMenuOpen: false,
		isMobileMenuOpen: false,
		isScrolled: false,
		activeDropdown: null,
		activeMobileDropdowns: {},
	});

	// Data state
	const [notificationData, setNotificationData] = useState({
		marshalApplications: [],
		adoptionRequests: [],
		userNotifications: [],
	});

	// Refs for click outside detection
	const profileMenuRef = useRef(null);
	const notificationRef = useRef(null);
	const navDropdownRefs = useRef([]);
	const activeIndicatorRef = useRef(null);
	const navbarRef = useRef(null);

	// Navigation structure with semantic naming (no icons)
	const navigationItems = [
		{
			label: "Home",
			path: "/home",
			type: "link",
		},
		{
			label: "Dog Activities",
			type: "dropdown",
			items: [
				{ label: "Walk Dogs", path: "/walkdogs" },
				{ label: "My Walks", path: "/mywalks" },
				{ label: "Walk History", path: "/walk-history" },
				{ label: "Waiver Form", path: "/waiver" },
			],
		},
		{
			label: "Adoption Center",
			type: "dropdown",
			items: [
				{ label: "Available Dogs", path: "/adoption-board" },
				{ label: "Adoption Requests", path: "/adoption-inquiries" },
			],
		},
		{
			label: "Community",
			type: "dropdown",
			items: [
				{ label: "Donate & Support", path: "/donate" },
				{ label: "Become a Marshal", path: "/marshal-application" },
			],
		},
		{
			label: "About Us",
			type: "dropdown",
			items: [
				{ label: "Our Mission", path: "/about" },
				{ label: "Dog Gallery", path: "/gallery" },
			],
		},
	];

	// Add admin menu conditionally
	const adminMenu = {
		label: "Administration",
		type: "dropdown",
		items: [
			{ label: "Scheduled Walks", path: "/scheduledwalk" },
			{ label: "User Management", path: "/users" },
			{ label: "Dog Inventory", path: "/dog-inventory" },
			{ label: "Activity Reports", path: "/dog-walk-summary" },
		],
	};

	// Complete navigation with conditional admin menu
	const completeNavigation =
		userProfile.role === "admin"
			? [...navigationItems, adminMenu]
			: navigationItems;

	// Check token on mount and refresh the state
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setUserProfile({
					role: decoded.role,
					username: decoded.username,
					email: decoded.email,
					picture: decoded.picture,
					isAuthenticated: true,
				});
			} catch (error) {
				console.error("Invalid token:", error);
				localStorage.removeItem("token");
			}
		}
	}, [localStorage.getItem("token")]);

	// Handle scroll effect for sticky navbar
	useEffect(() => {
		const handleScroll = () => {
			setUiState((prev) => ({
				...prev,
				isScrolled: window.scrollY > 10,
			}));
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			// Close profile menu if clicked outside
			if (
				profileMenuRef.current &&
				!profileMenuRef.current.contains(event.target)
			) {
				setUiState((prev) => ({
					...prev,
					isProfileMenuOpen: false,
				}));
			}

			// Close notification panel if clicked outside
			if (
				notificationRef.current &&
				!notificationRef.current.contains(event.target)
			) {
				// This would be handled by the Notifications component
			}

			// Close any open nav dropdowns if clicked outside
			if (uiState.activeDropdown !== null) {
				const activeRef = navDropdownRefs.current[uiState.activeDropdown];
				if (activeRef && !activeRef.contains(event.target)) {
					setUiState((prev) => ({
						...prev,
						activeDropdown: null,
					}));
				}
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [uiState.activeDropdown]);

	// Position the active indicator under the current active menu item
	useEffect(() => {
		// Find the active menu item
		const findActiveMenuItem = () => {
			// First check direct links
			for (let i = 0; i < completeNavigation.length; i++) {
				const item = completeNavigation[i];
				if (item.type === "link" && isMenuItemActive(item.path)) {
					return navDropdownRefs.current[i];
				}

				// Then check dropdown items
				if (item.type === "dropdown") {
					for (const subItem of item.items) {
						if (isMenuItemActive(subItem.path)) {
							return navDropdownRefs.current[i];
						}
					}
				}
			}
			return null;
		};

		// Position the indicator
		if (activeIndicatorRef.current) {
			const activeItem = findActiveMenuItem();

			if (activeItem) {
				const { offsetLeft, offsetWidth } = activeItem;
				activeIndicatorRef.current.style.left = `${offsetLeft}px`;
				activeIndicatorRef.current.style.width = `${offsetWidth}px`;
				activeIndicatorRef.current.style.opacity = "1";
			} else {
				// Hide the indicator if no active item is found
				activeIndicatorRef.current.style.opacity = "0";
			}
		}
	}, [currentPath, uiState.isMobileMenuOpen, completeNavigation]);

	// Fetch admin notifications
	useEffect(() => {
		const fetchAdminNotifications = async () => {
			if (userProfile.role === "admin") {
				try {
					const [marshalRes, adoptionRes] = await Promise.all([
						api.get("/marshalApps"),
						api.get("/adoptions/pending"),
					]);

					setNotificationData({
						...notificationData,
						marshalApplications: marshalRes.data,
						adoptionRequests: adoptionRes.data,
					});
				} catch (error) {
					console.error("Error fetching admin notifications:", error);
				}
			}
		};

		if (userProfile.role === "admin") {
			fetchAdminNotifications();
		}
	}, [userProfile.role]);

	// Fetch user notifications
	useEffect(() => {
		const fetchUserNotifications = async () => {
			if (userProfile.role === "user") {
				try {
					const res = await api.get("/api/user-notifications");
					setNotificationData((prev) => ({
						...prev,
						userNotifications: res.data,
					}));
				} catch (error) {
					console.error("Error fetching user notifications:", error);
				}
			}
		};

		if (userProfile.role === "user") {
			fetchUserNotifications();
		}
	}, [userProfile.role]);

	const handleLogout = () => {
		localStorage.removeItem("token");
		setUserProfile({
			role: "",
			username: "",
			email: "",
			picture: "",
			isAuthenticated: false,
		});
		toast.success("You have been logged out successfully!");
		setTimeout(() => {
			window.location.href = "/login";
		}, 1500);
	};

	const toggleProfileMenu = () => {
		setUiState((prev) => ({
			...prev,
			isProfileMenuOpen: !prev.isProfileMenuOpen,
		}));
	};

	const toggleMobileMenu = () => {
		setUiState((prev) => ({
			...prev,
			isMobileMenuOpen: !prev.isMobileMenuOpen,
		}));
	};

	const toggleDropdown = (index) => {
		setUiState((prev) => ({
			...prev,
			activeDropdown: prev.activeDropdown === index ? null : index,
		}));
	};

	const toggleMobileDropdown = (index) => {
		setUiState((prev) => ({
			...prev,
			activeMobileDropdowns: {
				...prev.activeMobileDropdowns,
				[index]: !prev.activeMobileDropdowns[index],
			},
		}));
	};

	// Check if a menu item is active based on current path
	const isMenuItemActive = (path) => {
		if (path === "/home" && (currentPath === "/" || currentPath === "/home"))
			return true;
		return currentPath === path;
	};

	// Check if any item in a dropdown is active
	const isDropdownActive = (items) => {
		return items.some((item) => isMenuItemActive(item.path));
	};

	return (
		<nav
			ref={navbarRef}
			className={`bg-gradient-to-r from-[#e8d3a9] to-[#f0e2c3] sticky top-0 z-50 ${
				uiState.isScrolled ? "shadow-lg" : ""
			} transition-all duration-300`}
		>
			<div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
				<div className="relative flex h-16 items-center justify-between">
					{/* Mobile Menu Toggle */}
					<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
						<button
							onClick={toggleMobileMenu}
							className="relative inline-flex items-center justify-center rounded-md p-2 text-[#333] hover:bg-[#d9c59a] hover:text-[#8c1d35] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8c1d35]"
							aria-expanded={uiState.isMobileMenuOpen ? "true" : "false"}
							aria-label="Toggle mobile menu"
						>
							{uiState.isMobileMenuOpen ? (
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
							<a href="/home" className="relative overflow-hidden group">
								<div className="absolute inset-0 bg-[#8c1d35] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
								<img
									className="h-10 w-auto transition-transform duration-300 group-hover:scale-105"
									src={logo || "/placeholder.svg"}
									alt="P40 Underdogs"
								/>
							</a>
						</div>

						{/* Desktop Navigation - with click-based dropdowns and active indicator */}
						<div className="hidden sm:ml-6 sm:block">
							<div className="flex space-x-1 items-center relative">
								{completeNavigation.map((item, index) => {
									const isActive =
										item.type === "link"
											? isMenuItemActive(item.path)
											: isDropdownActive(item.items);

									return item.type === "dropdown" ? (
										<div
											key={index}
											className="relative"
											ref={(el) => (navDropdownRefs.current[index] = el)}
										>
											<button
												onClick={() => toggleDropdown(index)}
												className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
													isActive
														? "text-[#8c1d35] bg-[#d9c59a] bg-opacity-50"
														: "text-[#333] hover:bg-[#d9c59a] hover:text-[#8c1d35]"
												}`}
												aria-expanded={uiState.activeDropdown === index}
											>
												{item.label}
												<ChevronDownIcon
													className={`ml-1 h-4 w-4 transition-transform duration-200 ${
														uiState.activeDropdown === index ? "rotate-180" : ""
													}`}
												/>
											</button>

											{/* Standard dropdown with click toggle */}
											<div
												className={`absolute left-0 mt-1 w-64 origin-top-left rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 transform ${
													uiState.activeDropdown === index
														? "opacity-100 scale-100 translate-y-0"
														: "opacity-0 scale-95 -translate-y-2 pointer-events-none"
												}`}
												style={{
													boxShadow:
														"0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
												}}
											>
												<div className="py-1 rounded-md bg-white overflow-hidden">
													{item.items.map((subItem, subIdx) => (
														<div key={subIdx}>
															<a
																href={subItem.path}
																className={`block px-4 py-2.5 text-sm transition-all duration-150 ${
																	currentPath === subItem.path
																		? "bg-[#f8f2e2] text-[#8c1d35] font-medium"
																		: "text-gray-700 hover:bg-[#f8f2e2] hover:text-[#8c1d35]"
																}`}
															>
																{subItem.label}
															</a>
															{subIdx < item.items.length - 1 && (
																<div className="mx-4 border-t border-gray-100"></div>
															)}
														</div>
													))}
												</div>
											</div>
										</div>
									) : (
										<a
											key={index}
											href={item.path}
											className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
												isActive
													? "text-[#8c1d35] bg-[#d9c59a] bg-opacity-50"
													: "text-[#333] hover:bg-[#d9c59a] hover:text-[#8c1d35]"
											}`}
											ref={(el) => (navDropdownRefs.current[index] = el)}
										>
											{item.label}
										</a>
									);
								})}

								{/* Active menu indicator (slider) */}
								<div
									ref={activeIndicatorRef}
									className="absolute bottom-0 h-1 bg-[#8c1d35] transition-all duration-300 ease-in-out rounded-full"
									style={{ left: 0, width: 0, opacity: 0 }}
								/>
							</div>
						</div>
					</div>

					<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0 space-x-3">
						{/* Notifications */}
						<Notifications
							role={userProfile.role}
							notifications={notificationData.userNotifications}
							applications={notificationData.marshalApplications}
							adoptions={notificationData.adoptionRequests}
							notificationRef={notificationRef}
						/>

						{/* User Menu or Login Button */}
						{userProfile.isAuthenticated ? (
							<div className="relative ml-3" ref={profileMenuRef}>
								<button
									onClick={toggleProfileMenu}
									className="relative flex rounded-full bg-gradient-to-r from-[#d9c59a] to-[#e8d3a9] text-sm focus:outline-none focus:ring-2 focus:ring-[#8c1d35] p-0.5 transition-all duration-200 hover:from-[#c9b58a] hover:to-[#d9c59a] shadow-sm"
									id="user-menu-button"
									aria-expanded={uiState.isProfileMenuOpen ? "true" : "false"}
								>
									<span className="sr-only">Open user menu</span>
									<img
										className="h-8 w-8 rounded-full object-cover"
										src={
											userProfile.picture || "https://via.placeholder.com/150"
										}
										alt={userProfile.username}
									/>
								</button>

								{/* Simplified User Profile Dropdown Menu */}
								<div
									className={`absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none transform transition-all duration-200 ${
										uiState.isProfileMenuOpen
											? "opacity-100 scale-100 translate-y-0"
											: "opacity-0 scale-95 -translate-y-2 pointer-events-none"
									}`}
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="user-menu-button"
									style={{
										boxShadow:
											"0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
									}}
								>
									<div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-[#f8f2e2] to-white">
										<div className="flex items-center">
											<div className="relative group">
												<div className="absolute inset-0 bg-[#8c1d35] rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
												<img
													className="h-12 w-12 rounded-full object-cover mr-3 border-2 border-[#d9c59a] shadow-sm group-hover:border-[#8c1d35] transition-colors duration-200"
													src={
														userProfile.picture ||
														"https://via.placeholder.com/150"
													}
													alt={userProfile.username}
												/>
											</div>
											<div>
												<p className="text-sm font-semibold text-gray-800">
													{userProfile.username}
												</p>
												<p className="text-xs text-gray-600 truncate max-w-[180px]">
													{userProfile.email}
												</p>
												<div className="mt-1">
													<span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#f8e9d2] to-[#f0e2c3] px-2.5 py-0.5 text-xs font-medium text-[#8c1d35] capitalize shadow-sm">
														{userProfile.role}
													</span>
												</div>
											</div>
										</div>
									</div>

									<div className="py-1">
										<a
											href="/myprofile"
											className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8f2e2] transition-all duration-150"
											role="menuitem"
										>
											<HiOutlineUserCircle className="text-lg text-gray-500" />
											<span>My Profile</span>
										</a>

										<div className="border-t border-gray-100 my-1"></div>

										<button
											onClick={handleLogout}
											className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-[#8c1d35] hover:bg-[#fff0f0] transition-all duration-150"
											role="menuitem"
										>
											<FiLogOut className="text-lg" />
											<span>Sign Out</span>
										</button>
									</div>
								</div>
							</div>
						) : (
							<a
								href="/login"
								className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-[#8c1d35] to-[#a02440] text-white font-medium rounded-md hover:from-[#7c1025] hover:to-[#901d35] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8c1d35] shadow-md"
							>
								Sign In
							</a>
						)}
					</div>
				</div>
			</div>

			{/* Improved Mobile Menu with collapsible dropdowns */}
			<div
				className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${
					uiState.isMobileMenuOpen
						? "max-h-[800px] opacity-100"
						: "max-h-0 opacity-0"
				}`}
			>
				<div className="space-y-2 px-3 pb-3 pt-2 border-t border-[#d9c59a]">
					{completeNavigation.map((item, idx) =>
						item.type === "dropdown" ? (
							<div
								key={idx}
								className="mb-2 bg-[#f8f2e2] rounded-md overflow-hidden shadow-sm"
							>
								{/* Collapsible dropdown header */}
								<button
									onClick={() => toggleMobileDropdown(idx)}
									className="w-full flex items-center justify-between font-semibold px-3 py-2.5 text-[#8c1d35] border-b border-[#e8d3a9] focus:outline-none"
								>
									<span>{item.label}</span>
									<ChevronDownIcon
										className={`h-5 w-5 transition-transform duration-200 ${
											uiState.activeMobileDropdowns[idx] ? "rotate-180" : ""
										}`}
									/>
								</button>

								{/* Collapsible dropdown content */}
								<div
									className={`overflow-hidden transition-all duration-300 ease-in-out ${
										uiState.activeMobileDropdowns[idx]
											? "max-h-[500px] opacity-100"
											: "max-h-0 opacity-0"
									}`}
								>
									{item.items.map((subItem, subIdx) => {
										// Conditional override for /mywalks for admin or marshal
										const adjustedPath =
											(userProfile.role === "admin" ||
												userProfile.role === "marshal") &&
											subItem.path === "/mywalks"
												? "/scheduledwalk"
												: subItem.path;
										return (
											<div key={subIdx}>
												<a
													href={adjustedPath}
													className={`block px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
														currentPath === subItem.path
															? "bg-[#d9c59a] bg-opacity-50 text-[#8c1d35]"
															: "text-[#333] hover:bg-[#d9c59a] hover:bg-opacity-30 hover:text-[#8c1d35]"
													}`}
												>
													{subItem.label}
												</a>
												{subIdx < item.items.length - 1 && (
													<div className="mx-4 border-t border-[#e8d3a9]"></div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						) : (
							<a
								key={idx}
								href={item.path}
								className={`block rounded-md px-3 py-2.5 text-base font-medium transition-all duration-200 ${
									currentPath === item.path
										? "bg-[#d9c59a] text-[#8c1d35]"
										: "text-[#333] hover:bg-[#d9c59a] hover:text-[#8c1d35]"
								}`}
							>
								{item.label}
							</a>
						)
					)}
					{!userProfile.isAuthenticated && (
						<a
							href="/login"
							className="block w-full text-center mt-3 rounded-md px-3 py-2.5 text-base font-medium bg-gradient-to-r from-[#8c1d35] to-[#a02440] text-white hover:from-[#7c1025] hover:to-[#901d35] transition-all duration-200 shadow-md"
						>
							Sign In
						</a>
					)}
				</div>
			</div>
		</nav>
	);
}
