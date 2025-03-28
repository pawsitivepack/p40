"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	FaPaw,
	FaBone,
	FaDog,
	FaHeart,
	FaMapMarkerAlt,
	FaQuoteLeft,
	FaQuoteRight,
	FaArrowLeft,
	FaArrowRight,
} from "react-icons/fa";

export default function About() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isVisible, setIsVisible] = useState({
		vision: false,
		objectives: false,
		team: false,
	});
	const visionRef = useRef(null);
	const objectivesRef = useRef(null);
	const teamRef = useRef(null);

	// Team members data
	const teamMembers = [
		{
			img: "/cberry.webp",
			name: "Christine Berry",
			title: "Founder, CEO",
			location: "Monroe, Louisiana",
			quote:
				"Every dog deserves a chance to be loved and to make a difference in someone's life.",
		},
		{
			img: "/Member1.webp",
			name: "Luna Star",
			title: "Marshall",
			location: "Monroe, Louisiana",
			quote:
				"The bond between humans and animals can heal even the deepest wounds.",
		},
		{
			img: "/Member2.webp",
			name: "Jack Ryan",
			title: "Marshall",
			location: "Monroe, Louisiana",
			quote:
				"Working with these dogs has taught me more about compassion than any human could.",
		},
		{
			img: "/Member3.webp",
			name: "Caroll Steve",
			title: "Marshall",
			location: "Monroe, Louisiana",
			quote:
				"Every day I'm amazed by the resilience and love these animals show despite their past.",
		},
	];

	// Automatically switch slides every 5 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentSlide((prevSlide) => (prevSlide + 1) % teamMembers.length);
		}, 7000);

		return () => clearInterval(interval); // Cleanup on unmount
	}, [teamMembers.length]);

	// Intersection Observer for animations
	useEffect(() => {
		const observerOptions = {
			threshold: 0.2,
		};

		const observerCallback = (entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					if (entry.target === visionRef.current) {
						setIsVisible((prev) => ({ ...prev, vision: true }));
					} else if (entry.target === objectivesRef.current) {
						setIsVisible((prev) => ({ ...prev, objectives: true }));
					} else if (entry.target === teamRef.current) {
						setIsVisible((prev) => ({ ...prev, team: true }));
					}
				}
			});
		};

		const observer = new IntersectionObserver(
			observerCallback,
			observerOptions
		);

		if (visionRef.current) observer.observe(visionRef.current);
		if (objectivesRef.current) observer.observe(objectivesRef.current);
		if (teamRef.current) observer.observe(teamRef.current);

		return () => {
			if (visionRef.current) observer.unobserve(visionRef.current);
			if (objectivesRef.current) observer.unobserve(objectivesRef.current);
			if (teamRef.current) observer.unobserve(teamRef.current);
		};
	}, []);

	// Random paw prints animation
	const PawPrints = () => {
		const pawPrints = Array.from({ length: 15 }, (_, i) => i);

		return (
			<div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
				{pawPrints.map((_, index) => (
					<motion.div
						key={index}
						className="absolute text-[#8c1d35]/10"
						initial={{
							x: Math.random() * window.innerWidth,
							y: -50,
							opacity: 0,
							rotate: Math.random() * 360,
							scale: 0.5 + Math.random() * 1.5,
						}}
						animate={{
							y: window.innerHeight + 50,
							opacity: [0, 0.7, 0],
							rotate: Math.random() * 360,
						}}
						transition={{
							repeat: Number.POSITIVE_INFINITY,
							duration: 15 + Math.random() * 20,
							delay: Math.random() * 20,
							ease: "linear",
						}}
					>
						<FaPaw size={20 + Math.random() * 30} />
					</motion.div>
				))}
			</div>
		);
	};

	return (
		<div className="bg-[#f8f5f0] min-h-screen">
			{/* Background paw prints */}
			<PawPrints />

			{/* Hero Section */}
			<div className="relative bg-[#8c1d35] text-white overflow-hidden">
				<div className="max-w-7xl mx-auto">
					<div className="relative z-10 py-20 px-6 sm:px-12 lg:px-24">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-center"
						>
							<h1 className="text-5xl md:text-6xl font-bold mb-4">
								About P-40 Underdogs
							</h1>
							<p className="text-xl md:text-2xl max-w-3xl mx-auto">
								Strengthening human-animal connections and promoting mental
								health awareness
							</p>

							<motion.div
								className="mt-8 flex justify-center"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{
									delay: 0.5,
									type: "spring",
									stiffness: 200,
									damping: 15,
								}}
							>
								<FaDog className="text-[#e8d3a9] text-8xl" />
							</motion.div>
						</motion.div>
					</div>
				</div>

				{/* Decorative wave */}
				<div className="absolute bottom-0 left-0 right-0">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 1440 320"
						className="w-full"
					>
						<path
							fill="#f8f5f0"
							fillOpacity="1"
							d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
						></path>
					</svg>
				</div>
			</div>

			{/* First Section - Our Vision */}
			<div
				ref={visionRef}
				className="py-16 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto"
			>
				<div className="flex flex-col lg:flex-row items-center gap-12">
					{/* Left Section - Image */}
					<motion.div
						className="lg:w-1/2"
						initial={{ opacity: 0, x: -50 }}
						animate={isVisible.vision ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.8 }}
					>
						<div className="relative">
							<div className="absolute -top-4 -left-4 w-24 h-24 bg-[#e8d3a9] rounded-full z-0"></div>
							<img
								src="/dogs-i-love-you-1599756972292-1599828190639.webp"
								alt="P-40 Underdog Project"
								className="relative z-10 rounded-lg shadow-xl w-full h-[500px] object-cover"
							/>
							<motion.div
								className="absolute -bottom-4 -right-4 text-[#8c1d35]"
								animate={{ rotate: [0, 15, 0, -15, 0] }}
								transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5 }}
							>
								<FaPaw size={48} />
							</motion.div>
						</div>
					</motion.div>

					{/* Right Section - Text */}
					<motion.div
						className="lg:w-1/2"
						initial={{ opacity: 0, x: 50 }}
						animate={isVisible.vision ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<div className="flex items-center mb-6">
							<FaHeart className="text-[#8c1d35] mr-3" size={24} />
							<h2 className="text-4xl font-bold text-[#8c1d35]">Our Vision</h2>
						</div>

						<div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#8c1d35]">
							<p className="text-lg text-gray-700 leading-relaxed">
								The P-40 Underdog Project strengthens human-animal connections
								in the ULM and Northeast Louisiana communities by promoting
								animal welfare and mental health awareness. It aims to end dog
								and cat homelessness, offering hope and second chances to
								animals in need.
							</p>
							<p className="text-lg text-gray-700 leading-relaxed mt-4">
								The initiative also seeks to establish ULM as a leader in
								integrating pets into mental health support. Ultimately, it
								envisions a future where both people and animals find rescue and
								healing.
							</p>
						</div>

						<div className="mt-6 flex justify-end">
							<motion.div
								animate={{ y: [0, -10, 0] }}
								transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
							>
								<FaBone className="text-[#e8d3a9]" size={32} />
							</motion.div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Second Section - Our Objectives */}
			<div
				ref={objectivesRef}
				className="py-16 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto"
			>
				<div className="flex flex-col lg:flex-row-reverse items-center gap-12">
					{/* Right Section - Image */}
					<motion.div
						className="lg:w-1/2"
						initial={{ opacity: 0, x: 50 }}
						animate={isVisible.objectives ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.8 }}
					>
						<div className="relative">
							<div className="absolute -top-4 -right-4 w-24 h-24 bg-[#e8d3a9] rounded-full z-0"></div>
							<img
								src="/doyalson-Vet-Pet-lookalike-blog.png"
								alt="Our Objectives"
								className="relative z-10 rounded-lg shadow-xl w-full h-[500px] object-cover"
							/>
							<motion.div
								className="absolute -bottom-4 -left-4 text-[#8c1d35]"
								animate={{ rotate: [0, -15, 0, 15, 0] }}
								transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5 }}
							>
								<FaDog size={48} />
							</motion.div>
						</div>
					</motion.div>

					{/* Left Section - Text */}
					<motion.div
						className="lg:w-1/2"
						initial={{ opacity: 0, x: -50 }}
						animate={isVisible.objectives ? { opacity: 1, x: 0 } : {}}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<div className="flex items-center mb-6">
							<FaPaw className="text-[#8c1d35] mr-3" size={24} />
							<h2 className="text-4xl font-bold text-[#8c1d35]">
								Our Objectives
							</h2>
						</div>

						<div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-[#8c1d35]">
							<p className="text-lg text-gray-700 leading-relaxed">
								The P-40 Underdog Project strives to reduce animal homelessness
								in NELA through sustained efforts and community collaboration,
								ensuring every animal finds a loving home.
							</p>
							<p className="text-lg text-gray-700 leading-relaxed mt-4">
								By creating accessible and engaging opportunities for community
								involvement on campus, we foster positive relationships between
								students, staff, and animals.
							</p>
							<p className="text-lg text-gray-700 leading-relaxed mt-4">
								Ultimately, we reinforce ULM's commitment to overcoming
								adversity, using the power of human-animal connections to build
								resilience and provide support during challenging times.
							</p>
						</div>

						<div className="mt-6">
							<motion.div
								animate={{ y: [0, -10, 0] }}
								transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
							>
								<FaBone className="text-[#e8d3a9]" size={32} />
							</motion.div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Team Section - Our Team */}
			<div
				ref={teamRef}
				className="py-16 px-6 sm:px-12 lg:px-24 max-w-7xl mx-auto"
			>
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={isVisible.team ? { opacity: 1, y: 0 } : {}}
					transition={{ duration: 0.8 }}
					className="text-center mb-12"
				>
					<div className="inline-block relative">
						<h2 className="text-4xl font-bold text-[#8c1d35] relative z-10">
							Our Team
						</h2>
						<div className="absolute -bottom-3 left-0 right-0 h-3 bg-[#e8d3a9] z-0"></div>
					</div>
					<p className="text-xl text-gray-700 mt-4 max-w-2xl mx-auto">
						Meet the dedicated individuals who make our mission possible
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={isVisible.team ? { opacity: 1, scale: 1 } : {}}
					transition={{ duration: 0.8, delay: 0.3 }}
					className="max-w-4xl mx-auto"
				>
					<div className="relative bg-white rounded-xl shadow-xl overflow-hidden">
						{/* Team member carousel */}
						<div className="relative h-[600px] md:h-[500px]">
							<AnimatePresence mode="wait">
								<motion.div
									key={currentSlide}
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.5 }}
									className="absolute inset-0"
								>
									<div className="flex flex-col md:flex-row h-full">
										<div className="md:w-1/2 h-64 md:h-full relative">
											<img
												src={
													teamMembers[currentSlide].img || "/placeholder.svg"
												}
												alt={teamMembers[currentSlide].name}
												className="w-full h-full object-cover"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r"></div>

											<div className="absolute bottom-4 left-4 text-white md:hidden">
												<h3 className="text-2xl font-bold">
													{teamMembers[currentSlide].name}
												</h3>
												<p className="text-sm opacity-90">
													{teamMembers[currentSlide].title}
												</p>
											</div>
										</div>

										<div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
											<div className="hidden md:block mb-6">
												<h3 className="text-3xl font-bold text-[#8c1d35]">
													{teamMembers[currentSlide].name}
												</h3>
												<p className="text-lg text-gray-600">
													{teamMembers[currentSlide].title}
												</p>
												<div className="flex items-center mt-1 text-gray-500">
													<FaMapMarkerAlt className="mr-1" />
													<span>{teamMembers[currentSlide].location}</span>
												</div>
											</div>

											<div className="mt-4 md:mt-0">
												<div className="text-[#8c1d35] mb-2">
													<FaQuoteLeft size={24} />
												</div>
												<p className="text-lg text-gray-700 italic">
													{teamMembers[currentSlide].quote}
												</p>
												<div className="text-[#8c1d35] mt-2 text-right">
													<FaQuoteRight size={24} />
												</div>
											</div>

											<div className="mt-6 md:mt-auto pt-4 border-t border-gray-200">
												<div className="flex justify-between items-center">
													<div className="flex space-x-1">
														{teamMembers.map((_, index) => (
															<button
																key={index}
																onClick={() => setCurrentSlide(index)}
																className={`w-3 h-3 rounded-full ${
																	index === currentSlide
																		? "bg-[#8c1d35]"
																		: "bg-gray-300"
																}`}
																aria-label={`Go to slide ${index + 1}`}
															/>
														))}
													</div>

													<div className="flex space-x-2">
														<button
															onClick={() =>
																setCurrentSlide(
																	(currentSlide - 1 + teamMembers.length) %
																		teamMembers.length
																)
															}
															className="p-2 rounded-full bg-[#e8d3a9] text-[#8c1d35] hover:bg-[#8c1d35] hover:text-white transition-colors"
															aria-label="Previous team member"
														>
															<FaArrowLeft />
														</button>
														<button
															onClick={() =>
																setCurrentSlide(
																	(currentSlide + 1) % teamMembers.length
																)
															}
															className="p-2 rounded-full bg-[#e8d3a9] text-[#8c1d35] hover:bg-[#8c1d35] hover:text-white transition-colors"
															aria-label="Next team member"
														>
															<FaArrowRight />
														</button>
													</div>
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							</AnimatePresence>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Call to Action */}
			<div className="bg-[#8c1d35] text-white py-16 px-6 relative overflow-hidden">
				<div className="max-w-4xl mx-auto text-center relative z-10">
					<motion.h2
						className="text-3xl md:text-4xl font-bold mb-6"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
					>
						Join Us in Making a Difference
					</motion.h2>

					<motion.p
						className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						viewport={{ once: true }}
					>
						Whether you're looking to adopt, volunteer, or donate, there are
						many ways to support our mission and help animals in need.
					</motion.p>

					<motion.div
						className="flex flex-col sm:flex-row gap-4 justify-center"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.4 }}
						viewport={{ once: true }}
					>
						<a
							href="/volunteer"
							className="bg-white text-[#8c1d35] px-6 py-3 rounded-lg font-bold hover:bg-[#e8d3a9] transition-colors"
						>
							Volunteer With Us
						</a>
						<a
							href="/donate"
							className="bg-[#e8d3a9] text-[#8c1d35] px-6 py-3 rounded-lg font-bold hover:bg-white transition-colors"
						>
							Make a Donation
						</a>
					</motion.div>
				</div>

				{/* Animated dog silhouettes */}
				<div className="absolute bottom-0 left-0 w-full h-20 opacity-20">
					<motion.div
						initial={{ x: -100 }}
						animate={{ x: "100vw" }}
						transition={{
							duration: 15,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "loop",
						}}
						className="absolute bottom-2 left-0"
					>
						<FaDog size={32} />
					</motion.div>
					<motion.div
						initial={{ x: -100 }}
						animate={{ x: "100vw" }}
						transition={{
							duration: 20,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "loop",
							delay: 2,
						}}
						className="absolute bottom-6 left-0"
					>
						<FaDog size={24} />
					</motion.div>
					<motion.div
						initial={{ x: -100 }}
						animate={{ x: "100vw" }}
						transition={{
							duration: 12,
							repeat: Number.POSITIVE_INFINITY,
							repeatType: "loop",
							delay: 5,
						}}
						className="absolute bottom-10 left-0"
					>
						<FaDog size={40} />
					</motion.div>
				</div>
			</div>
		</div>
	);
}