import {
	Disclosure,
	DisclosureButton,
	DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import logo from "../assets/underdogs.png";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode"; // Ensure jwtDecode is imported correctly

export default function Navbar() {
	const location = useLocation();
	const currentPage = location.pathname;
	const [role, setRole] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			try {
				const decodedToken = jwtDecode(token);
				const userRole = decodedToken.role;
				setRole(userRole);
				setIsLoggedIn(true);
			} catch (error) {
				console.error("Failed to decode token:", error);
			}
		} else {
			console.warn("No token found in local storage.");
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		setIsLoggedIn(false);
		toast.success("You have been logged out successfully!");
		setTimeout(() => {
			window.location.href = "/login";
		}, 1500);
	};

	// Navigation array with conditional logic for "Scheduled Walks" or "My Walks"
	const navigation = [
		{ name: "Home", href: "/home" },
		{ name: "About", href: "/about" },
		{ name: "Gallery", href: "/gallery" },
		{ name: "Walk Dogs", href: "/walkdogs" },
		{ name: "Donate", href: "/donate" },
		...(role === "marshal" || role === "admin"
			? [
					{ name: "Scheduled Walks", href: "/scheduledwalk" },
					{ name: "All Users", href: "/users" }, // New "All Users" link for marshals and admins
			  ]
			: role === "user"
			? [{ name: "My Walks", href: "/mywalks" }]
			: []),
	];
	function classNames(...classes) {
		return classes.filter(Boolean).join(" ");
	}

	return (
		<Disclosure
			as="nav"
			className="bg-gradient-to-r from-gray-900 via-gray-500 to-gray-700 shadow-lg"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-20">
					<div className="flex items-center">
						<img src={logo} alt="P40 Dog Logo" className="h-16 w-auto mr-6" />
						<div className="hidden sm:flex space-x-8">
							{navigation.map((item) => (
								<a
									key={item.name}
									href={item.href}
									className={classNames(
										item.href === currentPage
											? "bg-yellow-500 text-maroon-700 shadow-lg"
											: "text-white hover:bg-yellow-400 hover:text-maroon-900",
										"px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-300"
									)}
									aria-current={item.href === currentPage ? "page" : undefined}
								>
									{item.name}
								</a>
							))}
							{isLoggedIn && (
								<a
									href="/myprofile"
									className={classNames(
										"/myprofile" === currentPage
											? "bg-yellow-500 text-maroon-700 shadow-lg"
											: "text-white hover:bg-yellow-400 hover:text-maroon-900",
										"px-4 py-2 rounded-lg text-lg font-semibold transition-all duration-300"
									)}
								>
									Profile
								</a>
							)}
						</div>
					</div>
					<div className="hidden sm:flex space-x-4 items-center">
						{!isLoggedIn && (
							<a
								href="/login"
								className="bg-yellow-500 text-maroon-800 px-4 py-2 rounded-lg text-lg font-bold hover:bg-yellow-400 transition-all duration-300 shadow-md"
							>
								Login
							</a>
						)}
						{isLoggedIn && (
							<button
								onClick={handleLogout}
								className="bg-red-600 text-white px-4 py-2 rounded-lg text-lg font-bold hover:bg-red-500 transition-all duration-300 shadow-md"
							>
								Logout
							</button>
						)}
					</div>
					<div className="flex sm:hidden">
						<DisclosureButton className="text-yellow-500 hover:bg-maroon-700 p-2 rounded-md focus:outline-none">
							<Bars3Icon className="block h-8 w-8" aria-hidden="true" />
						</DisclosureButton>
					</div>
				</div>
			</div>

			<DisclosurePanel className="sm:hidden">
				<div className="px-4 pt-4 pb-4 space-y-2 bg-maroon-800">
					{navigation.map((item) => (
						<DisclosureButton
							key={item.name}
							as="a"
							href={item.href}
							className={classNames(
								item.href === currentPage
									? "bg-yellow-500 text-maroon-800"
									: "text-white hover:bg-yellow-400 hover:text-maroon-900",
								"block px-4 py-2 rounded-lg text-lg font-semibold"
							)}
							aria-current={item.href === currentPage ? "page" : undefined}
						>
							{item.name}
						</DisclosureButton>
					))}
					{isLoggedIn && (
						<DisclosureButton
							as="a"
							href="/myprofile"
							className={classNames(
								"/myprofile" === currentPage
									? "bg-yellow-500 text-maroon-800"
									: "text-white hover:bg-yellow-400 hover:text-maroon-900",
								"block px-4 py-2 rounded-lg text-lg font-semibold"
							)}
						>
							Profile
						</DisclosureButton>
					)}
					{!isLoggedIn && (
						<DisclosureButton
							as="a"
							href="/login"
							className="bg-yellow-500 text-maroon-800 block px-4 py-2 rounded-lg text-lg font-bold hover:bg-yellow-400 transition-all duration-300"
						>
							Login
						</DisclosureButton>
					)}
					{isLoggedIn && (
						<button
							onClick={handleLogout}
							className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-lg font-bold hover:bg-red-500 transition-all duration-300 shadow-md"
						>
							Logout
						</button>
					)}
				</div>
			</DisclosurePanel>
		</Disclosure>
	);
}
