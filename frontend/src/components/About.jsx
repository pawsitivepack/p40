import React, { useEffect, useState } from "react";

export default function About() {
	const [currentSlide, setCurrentSlide] = useState(0);

	// Team members data
	const teamMembers = [
		{
			img: "/cberry.webp",
			name: "Christine Berry",
			title: "Founder, CEO",
			location: "Monroe, Louisiana",
		},
		{
			img: "/Member1.webp",
			name: "Luna Star",
			title: "Marshall",
			location: "Monroe, Louisiana",
		},
		{
			img: "/Member2.webp",
			name: "Jack Ryan",
			title: "Marshall",
			location: "Monroe, Louisiana",
		},
		{
			img: "/Member3.webp",
			name: "Caroll Steve",
			title: "Marshall",
			location: "Monroe Louisiana",
		},
	];

	// Automatically switch slides every 5 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prevSlide) => (prevSlide + 1) % teamMembers.length);
		}, 5000);

		return () => clearInterval(interval); // Cleanup on unmount
	}, [teamMembers.length]);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://unpkg.com/flowbite@1.4.0/dist/flowbite.js";
		script.async = true;
		document.body.appendChild(script);
	}, []);

	return (
		<div>
			{/* First Section - Our Why */}
			<div className="min-h-screen bg-[#FAF5F0] text-gray-900 py-0 px-0 sm:px-0 lg:px-0 flex flex-col lg:flex-row items-center">
				{/* Left Section - Image */}
				<div className="lg:w-1/2 flex justify-center w-full">
					<img
						src="/dogs-i-love-you-1599756972292-1599828190639.webp"
						alt="P-40 Underdog Project"
						className="h-[66vh] w-full object-cover rounded-none shadow-lg mb-[-8vh]"
					/>
				</div>

				{/* Right Section - Text */}
				<div className="lg:w-1/2 text-left lg:pl-16 px-6 sm:px-12 lg:px-24">
					<h1 className="text-5xl font-serif font-semibold text-[#840029] mb-6 mt-24 sm:mt-0">
						Our Vision
					</h1>

					<p className="text-lg font-[Univers] font-normal text-gray-700 mb-4 leading-relaxed">
						The P-40 Underdog Project strengthens human-animal connections in
						the ULM and Northeast Louisiana communities by promoting animal
						welfare and mental health awareness. It aims to end dog and cat
						homelessness, offering hope and second chances to animals in need.
						The initiative also seeks to establish ULM as a leader in
						integrating pets into mental health support. Ultimately, it
						envisions a future where both people and animals find rescue and
						healing.
					</p>
				</div>
			</div>

			{/* Second Section - Our Objectives */}
			<div className="bg-[#FAF5F0] text-gray-900 py-0 px-0 sm:px-0 lg:px-0 flex flex-col lg:flex-row items-center">
				{/* Left Section - Text */}
				<div className="lg:w-1/2 text-left lg:pr-16 px-6 sm:px-12 lg:px-24">
					<h2 className="text-5xl font-serif font-semibold text-[#840029] mb-6">
						Our Objectives
					</h2>
					<p className="text-lg font-[Univers] font-normal text-gray-700 mb-6 leading-relaxed">
						The P-40 Underdog Project strives to reduce animal homelessness in
						NELA through sustained efforts and community collaboration, ensuring
						every animal finds a loving home. By creating accessible and
						engaging opportunities for community involvement on campus, we
						foster positive relationships between students, staff, and animals.
						Ultimately, we reinforce ULM's commitment to overcoming adversity,
						using the power of human-animal connections to build resilience and
						provide support during challenging times.
					</p>
				</div>

				{/* Right Section - Image */}
				<div className="lg:w-1/2 flex justify-center w-full">
					<img
						src="/doyalson-Vet-Pet-lookalike-blog.png"
						alt="Our Objectives"
						className="h-[66vh] w-full object-cover rounded-none shadow-lg mt-1 sm:mt-[-13vh]"
					/>
				</div>
			</div>

			{/* Team Section - Our Team */}
			<div className="min-h-screen bg-[#FAF5F0] text-gray-900 py-16 px-6 sm:px-12 lg:px-24">
				<h2 className="text-5xl font-serif font-semibold text-[#840029] mb-12 text-center">
					Our Team
				</h2>
				<div className="flex justify-center">
					<div className="max-w-4xl w-full relative">
						{/* Team member display */}
						{teamMembers.map((member, index) => (
							<div
								key={index}
								className={`absolute inset-0 flex flex-col items-center transition-opacity duration-1000 ${
									index === currentSlide ? "opacity-100" : "opacity-0"
								}`}
							>
								<div className="relative w-full h-[500px]">
									<img
										src={member.img}
										alt={member.name}
										className="w-full h-full object-cover "
									/>
									{/* Navigation buttons inside the image */}
									<button
										type="button"
										onClick={() =>
											setCurrentSlide(
												(currentSlide - 1 + teamMembers.length) %
													teamMembers.length
											)
										}
										className="absolute top-1/2 left-4 z-20 transform -translate-y-1/2 bg-gray-700 bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition"
										aria-label="Previous"
									>
										<svg
											className="w-6 h-6 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M15 19l-7-7 7-7"
											></path>
										</svg>
									</button>
									<button
										type="button"
										onClick={() =>
											setCurrentSlide((currentSlide + 1) % teamMembers.length)
										}
										className="absolute top-1/2 right-4 z-20 transform -translate-y-1/2 bg-gray-700 bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition"
										aria-label="Next"
									>
										<svg
											className="w-6 h-6 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 5l7 7-7 7"
											></path>
										</svg>
									</button>
								</div>
								<div className="mt-6 text-center">
									<h3 className="text-2xl font-bold text-gray-900">
										{member.name}
									</h3>
									<p className="text-sm text-gray-500 mb-1">{member.title}</p>
									<p className="text-sm text-gray-400">{member.location}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
