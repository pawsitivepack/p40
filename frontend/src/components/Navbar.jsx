import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import logo from "../assets/underdogs.png"; // Ensure correct path

export default function Navbar() {
	const location = useLocation();
	const currentPage = location.pathname;
	const [role, setRole] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	useEffect(() => {
		const fetchUser = () => {
			const token = localStorage.getItem("token");
			if (!token) {
				console.warn("No token found in local storage.");
				setIsLoggedIn(false);
				setUsername("");
				setEmail("");
				setRole("");
				return;
			}

			try {
				const decodedToken = jwtDecode(token);
				console.log("Decoded Token:", decodedToken); // Debugging

				setRole(decodedToken.role);
				setUsername(decodedToken.username || "Guest"); // Ensure correct field
				setEmail(decodedToken.email);
				setIsLoggedIn(true);
			} catch (error) {
				console.error("Failed to decode token:", error);
			}
		};

		fetchUser();

		window.addEventListener("storage", fetchUser);

		return () => {
			window.removeEventListener("storage", fetchUser);
		};
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		setIsLoggedIn(false);
		toast.success("You have been logged out successfully!");
		setTimeout(() => {
			window.location.href = "/login";
		}, 1500);
	};

	// Navigation array with conditional rendering
	const navigation = [
		{ name: "Home", href: "/home" },
		{ name: "About", href: "/about" },
		{ name: "Gallery", href: "/gallery" },
		{ name: "Walk Dogs", href: "/walkdogs" },
		{ name: "Donate", href: "/donate" },
		...(role === "marshal" || role === "admin"
			? [
					{ name: "Scheduled Walks", href: "/scheduledwalk" },
					{ name: "All Users", href: "/users" },
			  ]
			: role === "user"
			? [{ name: "My Walks", href: "/mywalks" }]
			: []),
	];

	return (
		<div>
			{/* Navbar */}
			<nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
				<div className="max-w-screen-xl  flex flex-wrap items-center justify-between mx-auto p-4">
					{/* Logo */}
					<a href="/home" className="flex items-center space-x-3">
						<img src={logo} className="h-10 w-auto" alt="P40 Dog Logo" />
						<span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white hidden md:block">
							P40 Underdogs
						</span>
					</a>
					{/* Navigation Links (Desktop) */}
					<div className="hidden md:flex space-x-8">
						{/* this is the menu for desktop */}
						{navigation.map((item) => (
							<a
								key={item.name}
								href={item.href}
								className={`block py-2 px-3 text-gray-900 rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent ${
									item.href === currentPage ? "text-blue-700 font-semibold" : ""
								}`}
							>
								{item.name}
							</a>
						))}
					</div>
					{/* Profile or Login Button */}
					<div className="flex space-x-4 ">
						{" "}
						{/*this is a the profile*/}
						{isLoggedIn ? (
							<div className="relative">
								<button
									onClick={() => setIsDropdownOpen(!isDropdownOpen)}
									className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
								>
									<img
										className="w-8 h-8 rounded-full"
										src="https://flowbite.com/docs/images/people/profile-picture-3.jpg"
										alt="user"
									/>
								</button>

								{/* Dropdown Menu */}

								{isDropdownOpen && (
									<div className="absolute left-1/2 transform -translate-x-1/2 mt-2 min-w-[12rem] w-auto bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-700 dark:border-gray-600">
										<div className="px-6 py-4 text-center">
											{" "}
											{/* Centered and padded */}
											<span className="block text-lg text-gray-900 dark:text-white py-1 font-semibold">
												{username}
											</span>
											<span className="block text-sm text-gray-900 dark:text-white italic py-1 break-words">
												{email}
											</span>
											<span className="block text-sm text-gray-900 dark:text-white py-1">
												Role: {role}
											</span>
											<hr className="border-gray-300 dark:border-gray-600 my-2" />
										</div>
										<ul className="py-2">
											<li>
												<a
													href="/myprofile"
													className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
												>
													Profile
												</a>
											</li>
											<li>
												<button
													onClick={handleLogout}
													className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
												>
													Logout
												</button>
											</li>
										</ul>
									</div>
								)}
							</div>
						) : (
							<a
								href="/login"
								className="bg-red-500 text-maroon-800 px-4 py-2 rounded-lg text-lg font-bold hover:bg-red-400 transition-all duration-300 shadow-md"
							>
								Login
							</a>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						type="button"
						className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
					>
						<span className="sr-only">Open main menu</span>
						<svg
							className="w-5 h-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 17 14"
						>
							<path
								stroke="currentColor"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M1 1h15M1 7h15M1 13h15"
							/>
						</svg>
					</button>
				</div>
			</nav>

			{/* Mobile Menu */}
			{isMenuOpen && (
				<div className="md:hidden  dark:bg-gray-900 pt-20">
					<ul className="p-4 space-y-2">
						{navigation.map((item) => (
							<li key={item.name}>
								<a
									href={item.href}
									className="block py-2 px-4 text-gray-900 dark:text-white"
								>
									{item.name}
								</a>
							</li>
						))}
					</ul>
				</div>
			)}

			{!isMenuOpen && <div className="pt-15"></div>}
		</div>
	);
}
