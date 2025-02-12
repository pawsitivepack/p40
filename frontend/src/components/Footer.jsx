import {
	CameraIcon,
	EnvelopeIcon,
	GlobeAltIcon,
	MapPinIcon,
	PhoneIcon,
	PlayIcon,
} from "@heroicons/react/24/solid";
import React from "react";
import image from "../assets/dog.png";

function Footer() {
	return (
		<div>
			<footer className="bg-red-950 dark:bg-gray-900 text-white">
				<div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
						{/* Logo Section - First Column */}
						<div className="flex justify-center">
							<a href="/" className="flex items-center justify-center">
								<img src={image} className="h-16 me-3" alt="p40 Logo" />
								<span className="self-center text-2xl font-semibold whitespace-nowrap">
									P-40 Dogs
								</span>
							</a>
						</div>

						{/* Quick Links - Second Column */}

						<div>
							<h2 className="mb-6 text-sm font-semibold uppercase">
								Quick Links
							</h2>
							<ul className="font-medium space-y-2">
								<li>
									<a href="/home" className="hover:underline">
										Home
									</a>
								</li>
								<li>
									<a href="/about" className="hover:underline">
										About
									</a>
								</li>
								<li>
									<a href="/gallery" className="hover:underline">
										Gallery
									</a>
								</li>
								<li>
									<a href="/walkdogs" className="hover:underline">
										Walk Dogs
									</a>
								</li>
								<li>
									<a href="/donate" className="hover:underline">
										Donate
									</a>
								</li>
								<li>
									<a href="/login" className="hover:underline">
										Login
									</a>
								</li>
							</ul>
						</div>

						{/* Contact Info - Third Column */}

						<div>
							<h2 className="mb-6 text-sm font-semibold uppercase">
								Contact Info
							</h2>
							<ul className="font-medium space-y-3">
								<li className="flex items-start justify-center">
									<MapPinIcon className="w-6 h-6 text-red-500 mr-2 mt-1" />{" "}
									{/* Icon aligned with the first line */}
									<div>
										700 University Avenue,
										<br />
										Monroe, LA 71209
									</div>
								</li>
								<li className="flex items-center justify-center">
									<EnvelopeIcon className="w-5 h-5 text-purple-500 mr-2" />
									<a
										href="mailto:contact@p40dogs.com"
										className="hover:underline"
									>
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

						{/* Social Media - Fourth Column */}
						<div>
							<h2 className="text-lg font-bold mb-4">Social Media</h2>
							<div className="flex justify-center space-x-4">
								<a
									href="https://facebook.com"
									className="bg-purple-700 p-2 rounded-full hover:bg-purple-500"
								>
									<GlobeAltIcon className="text-white w-5 h-5" />
								</a>
								<a
									href="https://instagram.com"
									className="bg-purple-700 p-2 rounded-full hover:bg-purple-500"
								>
									<CameraIcon className="text-white w-5 h-5" />
								</a>
								<a
									href="https://tiktok.com"
									className="bg-purple-700 p-2 rounded-full hover:bg-purple-500"
								>
									<PlayIcon className="text-white w-5 h-5" />
								</a>
							</div>
						</div>
					</div>

					<hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />

					<div className="flex justify-center items-center text-center">
						<span className="text-sm">
							© 2025{" "}
							<a href="/" className="hover:underline">
								P-40 Dogs™
							</a>
							. All Rights Reserved.
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
}

export default Footer;
