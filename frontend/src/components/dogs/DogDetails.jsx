import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import ReviewSection from "./ReviewSection";
import { jwtDecode } from "jwt-decode";
import { useLocation } from "react-router-dom";

import {
	FaArrowLeft,
	FaPaw,
	FaCalendarAlt,
	FaHeart,
	FaShare,
	FaPrint,
	FaMapMarkerAlt,
	FaWeight,
	FaRuler,
	FaNotesMedical,
	FaTag,
	FaWalking,
	FaSpinner,
	FaEnvelope,
	FaUserCircle,
	FaCheck,
} from "react-icons/fa";

const DogDetails = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	useEffect(() => {
		if (token) {
			try {
				const decoded = jwtDecode(token);
				setUserId(decoded._id || decoded.id);
				setRole(decoded.role);
			} catch (error) {
				console.error("Error decoding token in DogDetails:", error);
			}
		}
	}, [token]);
	const isLoggedIn = !!token;
	const [dog, setDog] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeImage, setActiveImage] = useState(0);
	const [showAllWalks, setShowAllWalks] = useState(false);
	const [message, setMessage] = useState("");
	const [sending, setSending] = useState(false);
	const [sent, setSent] = useState(false);
	const [similarDogs, setSimilarDogs] = useState([]);
	const [userId, setUserId] = useState();
	const [role, setRole] = useState();
	const location = useLocation();
    const fromAdoptionPage = location.state?.fromAdoptionPage;
	const [showInquiryForm, setShowInquiryForm] = useState(false);
	const [existingInquiry, setExistingInquiry] = useState(null);


	useEffect(() => {
		const fetchDogDetails = async () => {
			try {
				const res = await api.get(`/dogs/${id}`);
				setDog(res.data);

				// Fetch similar dogs (same breed or tags)
				if (res.data.breed || (res.data.tags && res.data.tags.length > 0)) {
					const similarRes = await api.get("/dogs", {
						params: {
							breed: res.data.breed,
							limit: 4,
							exclude: id,
						},
					});
					setSimilarDogs(
						similarRes.data.filter((d) => d._id !== id).slice(0, 3)
					);
				}
				
  
			} catch (err) {
				console.error("Error fetching dog details:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchDogDetails();
		// Scroll to top when component mounts
		window.scrollTo(0, 0);
	}, [id]);
	useEffect(() => {
		if (fromAdoptionPage) {
			const inquirySection = document.getElementById("inquiry-section");
			if (inquirySection) {
				inquirySection.scrollIntoView({ behavior: "smooth" });
			}
		}
	}, [fromAdoptionPage]);
	
	useEffect(() => {
		if (userId && dog?._id) {
			const fetchUserInquiry = async () => {
				try {
					const inquiryRes = await api.get(
						`/adoptions/user-inquiry/${userId}/${dog._id}`
					);
					if (inquiryRes.data) {
						setExistingInquiry(inquiryRes.data);
						console.log("Fetched inquiry:", inquiryRes.data);
					}
				} catch (error) {
					console.error("No existing inquiry found for this user and dog.");
				}
			};
	        const interval = setInterval(fetchUserInquiry, 5000);
			fetchUserInquiry();
			return () => clearInterval(interval);
		}
	}, [userId, dog]);
	

	const handleInquiry = async (e) => {
		e.preventDefault();
		if (!message.trim()) return;
	
		setSending(true);
		try {
			await api.post("/adoptions", {
				Dogid: id,
				Userid: userId,
				Message: message,
			});
	
			setSent(true);
			setMessage("");
			setTimeout(() => setSent(false), 5000);
		} catch (err) {
			console.error("Error sending inquiry:", err);
			alert("Failed to send inquiry. Please try again.");
		} finally {
			setSending(false);
		}
	};
	

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: `Meet ${dog.name} - ULM P40 UNDERDOGS`,
				text: `Check out ${dog.name}, a ${dog.age} year old ${dog.breed} available for adoption!`,
				url: window.location.href,
			});
		} else {
			// Fallback - copy to clipboard
			navigator.clipboard.writeText(window.location.href);
			alert("Link copied to clipboard!");
		}
	};

	const handlePrint = () => {
		window.print();
	};

	// Format date for display
	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Get status color
	const getStatusColor = (status) => {
		switch (status?.toLowerCase()) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "scheduled":
				return "bg-blue-100 text-blue-800";
			case "cancelled":
				return "bg-red-100 text-red-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Mock images array (in case dog has multiple images)
	const dogImages = dog?.imageURL
		? Array.isArray(dog.imageURL)
			? dog.imageURL
			: [dog.imageURL]
		: ["/placeholder.svg?height=400&width=600"];

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
				<div className="text-center">
					<FaSpinner className="animate-spin text-[#8c1d35] text-4xl mx-auto mb-4" />
					<p className="text-gray-700">Loading dog details...</p>
				</div>
			</div>
		);
	}

	if (!dog) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-[#f8f5f0]">
				<div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
					<FaPaw className="text-[#8c1d35] text-5xl mx-auto mb-4 opacity-50" />
					<h2 className="text-2xl font-bold text-gray-800 mb-2">
						Dog Not Found
					</h2>
					<p className="text-gray-600 mb-6">
						We couldn't find the dog you're looking for.
					</p>
					<button
						onClick={() => navigate("/dogs")}
						className="bg-[#8c1d35] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#7c1025] transition-colors"
					>
						Browse All Dogs
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-[#f8f5f0] min-h-screen py-6 print:bg-white print:py-0">
			<div className="max-w-6xl mx-auto px-4">
				{/* Back Button - Hidden in print */}
				<button
					onClick={() => navigate(-1)}
					className="mb-6 text-[#8c1d35] hover:text-[#7c1025] font-medium flex items-center print:hidden"
				>
					<FaArrowLeft className="mr-2" /> Back to Dogs
				</button>

				{/* Main Content */}
				<div className="bg-white rounded-xl shadow-md overflow-hidden print:shadow-none">
					{/* Header */}
					<div className="bg-[#8c1d35] px-6 py-4 print:bg-white print:border-b-2 print:border-[#8c1d35]">
						<h1 className="text-2xl md:text-3xl font-bold text-white flex items-center print:text-[#8c1d35]">
							<FaPaw className="mr-3" /> {dog.name}
						</h1>
					</div>

					{/* Content */}
					<div className="p-6">
						<div className="flex flex-col lg:flex-row gap-8">
							{/* Image Gallery */}
							<div className="lg:w-1/2 print:w-1/3">
								<div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-white">
									<img
										src={dogImages[activeImage] || "/placeholder.svg"}
										alt={`${dog.name}`}
										className="w-full h-80 md:h-96 object-contain bg-white"
									/>

									{/* Adoption Status Badge */}
									{dog.adopted && (
										<div className="absolute top-4 right-4 bg-[#8c1d35] text-white px-3 py-1 rounded-full font-medium text-sm shadow-md">
											Adopted
										</div>
									)}
								</div>

								{/* Thumbnail Gallery - Only show if multiple images */}
								{dogImages.length > 1 && (
									<div className="flex mt-2 gap-2 overflow-x-auto pb-2 print:hidden">
										{dogImages.map((img, index) => (
											<button
												key={index}
												onClick={() => setActiveImage(index)}
												className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-all ${
													activeImage === index
														? "border-[#8c1d35]"
														: "border-transparent"
												}`}
											>
												<img
													src={img || "/placeholder.svg"}
													alt={`${dog.name} thumbnail ${index + 1}`}
													className="w-full h-full object-cover"
												/>
											</button>
										))}
									</div>
								)}

								{/* Action Buttons */}
								<div className="flex flex-wrap gap-2 mt-4 print:hidden">
								{!dog.adopted && (
									<button
										onClick={async () => {
											setShowInquiryForm(true);
											setTimeout(() => {
												const section = document.getElementById("inquiry-section");
												if (section) section.scrollIntoView({ behavior: "smooth" });
											}, 100); // delay for smoother scroll
										}}
										className="flex-1 bg-[#8c1d35] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#7c1025] transition-colors flex items-center justify-center"
									>
										<FaHeart className="mr-2" /> Inquire to Adopt
									</button>
									)}

									<button
										onClick={handleShare}
										className="flex-1 bg-[#e8d3a9] text-[#8c1d35] px-4 py-2 rounded-lg font-medium hover:bg-[#d9c59a] transition-colors flex items-center justify-center"
									>
										<FaShare className="mr-2" /> Share
									</button>
									<button
										onClick={handlePrint}
										className="flex-1 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
									>
										<FaPrint className="mr-2" /> Print
									</button>
								</div>
							</div>

							{/* Details */}
							<div className="lg:w-1/2 print:w-2/3">
								<div className="bg-[#f8f5f0] rounded-lg p-6 print:bg-white print:p-0">
									<h2 className="text-xl font-bold text-[#8c1d35] mb-4 print:text-2xl">
										About {dog.name}
									</h2>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
										<div className="flex items-start">
											<div className="bg-[#e8d3a9] p-2 rounded-full mr-3">
												<FaPaw className="text-[#8c1d35]" />
											</div>
											<div>
												<p className="text-sm text-gray-500">Breed</p>
												<p className="font-medium text-gray-800">
													{dog.breed || "Mixed"}
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<div className="bg-[#e8d3a9] p-2 rounded-full mr-3">
												<FaCalendarAlt className="text-[#8c1d35]" />
											</div>
											<div>
												<p className="text-sm text-gray-500">Age</p>
												<p className="font-medium text-gray-800">
													{dog.age} years
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<div className="bg-[#e8d3a9] p-2 rounded-full mr-3">
												<FaWeight className="text-[#8c1d35]" />
											</div>
											<div>
												<p className="text-sm text-gray-500">Color</p>
												<p className="font-medium text-gray-800">
													{dog.color || "Unknown"}
												</p>
											</div>
										</div>

										<div className="flex items-start">
											<div className="bg-[#e8d3a9] p-2 rounded-full mr-3">
												<FaRuler className="text-[#8c1d35]" />
											</div>
											<div>
												<p className="text-sm text-gray-500">Size</p>
												<p className="font-medium text-gray-800">
													{dog.size || "Medium"}
												</p>
											</div>
										</div>

										{dog.adopted && (
											<div className="flex items-start">
												<div className="bg-[#e8d3a9] p-2 rounded-full mr-3">
													<FaCheck className="text-[#8c1d35]" />
												</div>
												<div>
													<p className="text-sm text-gray-500">Adopted Date</p>
													<p className="font-medium text-gray-800">
														{formatDate(dog.adoptedDate)}
													</p>
												</div>
											</div>
										)}

										{dog.location && (
											<div className="flex items-start">
												<div className="bg-[#e8d3a9] p-2 rounded-full mr-3">
													<FaMapMarkerAlt className="text-[#8c1d35]" />
												</div>
												<div>
													<p className="text-sm text-gray-500">Location</p>
													<p className="font-medium text-gray-800">
														{dog.location}
													</p>
												</div>
											</div>
										)}
									</div>

									{/* Health Issues */}
									{dog.healthIssues && (
										<div className="mt-6">
											<div className="flex items-center mb-2">
												<FaNotesMedical className="text-[#8c1d35] mr-2" />
												<h3 className="text-lg font-semibold text-gray-800">
													Health Information
												</h3>
											</div>
											<p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-200 print:border-none print:p-0">
												{dog.healthIssues}
											</p>
										</div>
									)}

									{/* Notes */}
									{dog.notes && dog.notes.length > 0 && (
										<div className="mt-6">
											<div className="flex items-center mb-2">
												<FaPaw className="text-[#8c1d35] mr-2" />
												<h3 className="text-lg font-semibold text-gray-800">
													Notes
												</h3>
											</div>
											<ul className="space-y-2">
												{dog.notes.map((note, index) => (
													<li key={index} className="flex items-start">
														<span className="inline-block w-2 h-2 bg-[#8c1d35] rounded-full mt-2 mr-2"></span>
														<span className="text-gray-700">{note}</span>
													</li>
												))}
											</ul>
										</div>
									)}

									{/* Tags */}
									{dog.tags && dog.tags.length > 0 && (
										<div className="mt-6">
											<div className="flex items-center mb-2">
												<FaTag className="text-[#8c1d35] mr-2" />
												<h3 className="text-lg font-semibold text-gray-800">
													Tags
												</h3>
											</div>
											<div className="flex flex-wrap gap-2">
												{dog.tags.map((tag, index) => (
													<span
														key={index}
														className="bg-[#e8d3a9] text-[#8c1d35] text-sm font-medium px-3 py-1 rounded-full"
													>
														{tag}
													</span>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Walk History */}
						{dog.walks && dog.walks.length > 0 && (
							<div className="mt-8 print:mt-4">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-xl font-bold text-[#8c1d35] flex items-center">
										<FaWalking className="mr-2" /> Walk History
									</h3>
									{dog.walks.length > 5 && (
										<button
											onClick={() => setShowAllWalks(!showAllWalks)}
											className="text-sm text-[#8c1d35] hover:underline print:hidden"
										>
											{showAllWalks
												? "Show Less"
												: `Show All (${dog.walks.length})`}
										</button>
									)}
								</div>

								<div className="bg-white rounded-lg border border-gray-200 overflow-hidden print:border-none">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-[#f8f5f0]">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Date
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Time
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Status
												</th>
												{dog.walks[0].walker && (
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Walker
													</th>
												)}
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{(showAllWalks ? dog.walks : dog.walks.slice(0, 5)).map(
												(walk, index) => {
													const walkDate = new Date(walk.date);
													return (
														<tr key={index} className="hover:bg-[#f8f5f0]">
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
																{walkDate.toLocaleDateString()}
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
																{walkDate.toLocaleTimeString([], {
																	hour: "2-digit",
																	minute: "2-digit",
																})}
															</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<span
																	className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
																		walk.status
																	)}`}
																>
																	{walk.status || "Unknown"}
																</span>
															</td>
															{dog.walks[0].walker && (
																<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
																	{walk.walker || "Unassigned"}
																</td>
															)}
														</tr>
													);
												}
											)}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{dog && (
							<div className="mt-8 print:hidden">
								<Link
									to={`/dog/walklog/${dog._id}`}
									className="bg-[#8c1d35] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#7c1025] transition-colors inline-block"
								>
									View Walk Chart
								</Link>
							</div>
						)}

						{/* Inquiry Form - Hidden in print */}
						{!dog.adopted && isLoggedIn && showInquiryForm && (
							<div id="inquiry-section" className="mt-8 print:hidden">
								<div className="bg-[#f8f5f0] rounded-lg p-6 border border-[#e8d3a9]">
									<h3 className="text-xl font-bold text-[#8c1d35] mb-4 flex items-center">
										<FaEnvelope className="mr-2" /> Inquire About {dog.name}
									</h3>


								      {existingInquiry ? (
											<>
											<div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 flex items-center mb-4">
												<FaCheck className="text-green-500 mr-2" />
												You’ve already inquired about this dog.
											</div>

											<p className="text-gray-700 text-sm italic mb-2">
												<strong>Your message:</strong> "{existingInquiry.Message}"
											</p>
											<p className="text-xs text-gray-500 mt-1">
											Inquired on {new Date(existingInquiry.createdAt).toLocaleString()}
											</p>


											{existingInquiry.ReplyMessage && (
											<div className="mt-4 p-3 bg-[#f0f0f0] rounded-md border border-gray-200">
												<p className="text-sm text-gray-700">
												<span className="font-semibold text-[#8c1d35]">Admin Reply:</span> {existingInquiry.ReplyMessage}
												</p>
												{existingInquiry.ReplyDate && (
												<p className="text-xs text-gray-500 mt-1">
													Replied on {new Date(existingInquiry.ReplyDate).toLocaleString()}
												</p>
												)}
											</div>
											)}
											</>
										) : (
										<form onSubmit={handleInquiry}>
											<div className="mb-4">
												<label className="block text-black text-sm font-medium mb-2">
													Your Message
												</label>
												<textarea
													value={message}
													onChange={(e) => setMessage(e.target.value)}
													rows="4"
													className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent text-black bg-white"
													placeholder={`I'm interested in learning more about ${dog.name}...`}
													required
												/>
											</div>
											<div className="flex justify-end">
												<button
													type="submit"
													disabled={sending}
													className="bg-[#8c1d35] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#7c1025] transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
												>
													{sending ? (
														<>
															<FaSpinner className="animate-spin mr-2" />
															Sending...
														</>
													) : (
														<>
															<FaEnvelope className="mr-2" />
															Send Inquiry
														</>
													)}
												</button>
											</div>
										</form>
									)}
								</div>
							</div>
						)}

						{/* Login Prompt - Hidden in print */}
						{!dog.adopted && !isLoggedIn && (
							<div className="mt-8 bg-[#f8f5f0] rounded-lg p-6 text-center print:hidden">
								<FaUserCircle className="text-[#8c1d35] text-4xl mx-auto mb-3" />
								<h3 className="text-lg font-semibold text-gray-800 mb-2">
									Want to learn more about {dog.name}?
								</h3>
								<p className="text-gray-600 mb-4">
									Please log in to send an inquiry or request to walk this dog.
								</p>
								<div className="flex justify-center gap-4">
									<Link
										to="/login"
										className="bg-[#8c1d35] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#7c1025] transition-colors"
									>
										Log In
									</Link>
									<Link
										to="/signup"
										className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
									>
										Sign Up
									</Link>
								</div>
							</div>
						)}
						<ReviewSection dogId={dog._id} userId={userId} userRole={role} />
						{/* Similar Dogs - Hidden in print */}
						{similarDogs.length > 0 && (
							<div className="mt-10 print:hidden">
								<h3 className="text-xl font-bold text-[#8c1d35] mb-4">
									Similar Dogs You May Like
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{similarDogs.map((similarDog) => (
										<Link
											key={similarDog._id}
											to={`/dog/${similarDog._id}`}
											className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
										>
											<div className="h-48 overflow-hidden">
												<img
													src={
														similarDog.imageURL ||
														"/placeholder.svg?height=200&width=300"
													}
													alt={similarDog.name}
													className="w-full h-full object-cover"
												/>
											</div>
											<div className="p-4">
												<h4 className="font-bold text-gray-800">
													{similarDog.name}
												</h4>
												<p className="text-sm text-gray-600">
													{similarDog.breed}, {similarDog.age} years
												</p>
												{similarDog.adopted ? (
													<span className="inline-block mt-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
														Adopted
													</span>
												) : (
													<span className="inline-block mt-2 bg-[#e8d3a9] text-[#8c1d35] text-xs px-2 py-1 rounded-full">
														Available
													</span>
												)}
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default DogDetails;
