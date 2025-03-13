import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
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

	// Check token on mount and refresh the state
	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			const decoded = jwtDecode(token);
			console.log("Token found:", decoded);
			setRole(decoded.role);
			setUsername(decoded.username);
			setEmail(decoded.email);
			setPicture(decoded.picture);
			console.log("Picture:", decoded.picture);
			setIsLoggedIn(true);
		}
	}, [localStorage.getItem("token")]);

	useEffect(() => {
		const fetchApplications = async () => {
			if (role === "admin") {
				try {
					const token = localStorage.getItem("token");
					const res = await axios.get(
						`${import.meta.env.VITE_BACKEND_URL}/marshalApps`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					setApplications(res.data);
				} catch (error) {
					console.error("Error fetching applications:", error);
				}
			}
		};
		fetchApplications();
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
		<nav className="bg-gray-800">
			<div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
				<div className="relative flex h-16 items-center justify-between">
					{/* Mobile Menu Toggle */}
					<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white"
							aria-expanded="false"
						>
							<svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24">
								<path
									stroke="currentColor"
									strokeWidth="1.5"
									d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
								/>
							</svg>
						</button>
					</div>

					<div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
						<div className="flex shrink-0 items-center">
							<img className="h-8 w-auto" src={logo} alt="P40 Underdogs" />
						</div>

						<div className="hidden sm:ml-6 sm:block">
							<div className="flex space-x-4">
								{navigation.map((item) => (
									<a
										key={item.name}
										href={item.href}
										className={`rounded-md px-3 py-2 text-sm font-medium ${
											currentPage === item.href
												? "bg-gray-900 text-white"
												: "text-gray-300 hover:bg-gray-700 hover:text-white"
										}`}
									>
										{item.name}
									</a>
								))}
							</div>
						</div>
					</div>

					<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
						{role === "admin" && (
							<div className="relative">
								<BellIcon
									className="h-6 w-6 text-gray-400 hover:text-white cursor-pointer"
									onClick={() => setShowNotifications(!showNotifications)}
								/>
								{applications.length > 0 && (
									<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
										{applications.length}
									</span>
								)}
								{showNotifications && (
									<div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-10">
										{applications.map((app) => (
											<div
												key={app._id}
												className="p-2 border-b hover:bg-gray-100 cursor-pointer"
												onClick={() => {
													setShowNotifications(false);
													navigate("/marshal-application", {
														state: { application: app },
													});
												}}
											>
												<p className="text-sm text-gray-800">
													<strong>
														{app.userId?.firstName} {app.userId?.lastName}
													</strong>{" "}
													applied for Marshal
												</p>
												<p className="text-xs text-gray-500">
													{new Date(app.applicationDate).toLocaleDateString()}
												</p>
											</div>
										))}
									</div>
								)}
							</div>
						)}

						{isLoggedIn ? (
							<div className="relative ml-3">
								<button
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white"
								>
									<img
										className="h-8 w-8 rounded-full"
										src={picture || "https://via.placeholder.com/150"}
										alt="User"
									/>
								</button>

								{isDropdownOpen && (
									<div className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
										<div className="px-4 py-3 border-b">
											<p className="text-sm font-semibold text-gray-800">
												{username}
											</p>
											<p className="text-xs text-gray-600">{email}</p>
											<p className="text-xs text-gray-500 capitalize">{role}</p>
										</div>

										<a
											href="/myprofile"
											className="flex items-center gap-2 px-4 py-2 text-sm text-gray-800 hover:bg-blue-100"
										>
											<HiOutlineUserCircle className="text-lg" />
											<span>Profile</span>
										</a>

										<button
											onClick={handleLogout}
											className="flex items-center gap-2 w-full text-left px-4 my-1 py-2 text-sm text-gray-800 hover:bg-red-100"
										>
											<FiLogOut className="text-lg text-red-500" />
											<span>Logout</span>
										</button>
									</div>
								)}
							</div>
						) : (
							<a
								href="/login"
								className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
							>
								Login
							</a>
						)}
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className="sm:hidden">
					<div className="space-y-1 px-2 pt-2 pb-3">
						{navigation.map((item) => (
							<a
								key={item.name}
								href={item.href}
								className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
							>
								{item.name}
							</a>
						))}
					</div>
				</div>
			)}
		</nav>
	);
}
