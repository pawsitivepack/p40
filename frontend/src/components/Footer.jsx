import React from "react";
import { Link, useLocation } from "react-router-dom";
import image from "../assets/dog.png";
import {
	CameraIcon,
	EnvelopeIcon,
	GlobeAltIcon,
	MapPinIcon,
	PhoneIcon,
	PlayIcon,
} from "@heroicons/react/24/solid";

function Footer() {
	const location = useLocation();

	const handleLinkClick = (path) => {
		if (location.pathname === path) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	return (
		<footer className="z-50 relative bg-gray-800 dark:bg-gray-900 text-white">
			<div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
					{/* Logo Section */}
					<div className="flex justify-center">
						<Link to="/" onClick={() => handleLinkClick("/")} className="flex items-center justify-center">
							<img src={image} className="h-16 me-3" alt="p40 Logo" />
							<span className="self-center text-2xl font-semibold whitespace-nowrap">
								P-40 Dogs
							</span>
						</Link>
					</div>

					{/* Quick Links */}
					<div>
						<h2 className="mb-6 text-sm font-semibold uppercase">Quick Links</h2>
						<ul className="font-medium space-y-2">
							<li><Link to="/home" onClick={() => handleLinkClick("/home")} className="hover:underline">Home</Link></li>
							<li><Link to="/about" onClick={() => handleLinkClick("/about")} className="hover:underline">About</Link></li>
							<li><Link to="/gallery" onClick={() => handleLinkClick("/gallery")} className="hover:underline">Gallery</Link></li>
							<li><Link to="/walkdogs" onClick={() => handleLinkClick("/walkdogs")} className="hover:underline">Walk Dogs</Link></li>
							<li><Link to="/donate" onClick={() => handleLinkClick("/donate")} className="hover:underline">Donate</Link></li>
							<li><Link to="/login" onClick={() => handleLinkClick("/login")} className="hover:underline">Login</Link></li>
						</ul>
					</div>

					{/* Contact Info */}
					<div>
						<h2 className="mb-6 text-sm font-semibold uppercase">Contact Info</h2>
						<ul className="font-medium space-y-3">
							<li className="flex items-start justify-center">
								<MapPinIcon className="w-6 h-6 text-red-500 mr-2 mt-1" />
								<div>
									700 University Avenue,<br />
									Monroe, LA 71209
								</div>
							</li>
							<li className="flex items-center justify-center">
								<EnvelopeIcon className="w-5 h-5 text-purple-500 mr-2" />
								<a href="mailto:contact@p40dogs.com" className="hover:underline">
									contact@p40dogs.com
								</a>
							</li>
							<li className="flex items-center justify-center">
								<PhoneIcon className="w-5 h-5 text-purple-500 mr-2" />
								<a href="tel:+1234567890" className="hover:underline">
									+1 (234) 567-890
								</a>
							</li>
						</ul>
					</div>

					{/* Social Media */}
					<div>
						<h2 className="text-lg font-bold mb-4">Social Media</h2>
						<div className="flex justify-center space-x-4">
							<a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
								className="bg-purple-700 p-2 rounded-full hover:bg-purple-500">
								<GlobeAltIcon className="text-white w-5 h-5" />
							</a>
							<a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
								className="bg-purple-700 p-2 rounded-full hover:bg-purple-500">
								<CameraIcon className="text-white w-5 h-5" />
							</a>
							<a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
								className="bg-purple-700 p-2 rounded-full hover:bg-purple-500">
								<PlayIcon className="text-white w-5 h-5" />
							</a>
						</div>
					</div>
				</div>

				<hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />

				<div className="flex justify-center items-center text-center">
					<span className="text-sm">
						© 2025 <Link to="/" onClick={() => handleLinkClick("/")} className="hover:underline">P-40 Dogs™</Link>. All Rights Reserved.
					</span>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
