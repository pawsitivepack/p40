import { useState, useEffect } from "react";
import api from "../../api/axios";
import {
	FaStar,
	FaSpinner,
	FaRegStar,
	FaUserCircle,
	FaTrash,
	FaRegCommentDots,
	FaPaw,
	FaExclamationTriangle,
	FaCheckCircle,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

function ReviewSection({ dogId, userId, userRole }) {
	const [reviews, setReviews] = useState([]);
	const [averageRating, setAverageRating] = useState(0);
	const [star, setStar] = useState(0);
	const [review, setReview] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [response, setResponse] = useState("");
	const [showAll, setShowAll] = useState(false);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(null);
	const [images, setImages] = useState([]);

	useEffect(() => {
		const fetchReviews = async () => {
			try {
				setLoading(true);
				const res = await api.get(`/review/${dogId}`);
				setReviews(res.data);

				if (res.data.length > 0) {
					const total = res.data.reduce((sum, r) => sum + r.star, 0);
					setAverageRating((total / res.data.length).toFixed(1));
				}
			} catch (err) {
				console.error("Failed to load reviews:", err);
				setError("Failed to load reviews. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		if (dogId) fetchReviews();
	}, [dogId]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (star === 0) {
			setError("Please select a rating before submitting.");
			return;
		}

		setSubmitting(true);
		setError("");
		setResponse("");

		try {
			const formData = new FormData();
			formData.append("userId", userId);
			formData.append("star", star);
			formData.append("review", review);
			images.forEach((img) => formData.append("images", img));

			await api.post(`/review/${dogId}`, formData, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
					"Content-Type": "multipart/form-data",
				},
			});

			setResponse("Your review has been submitted successfully!");
			setStar(0);
			setReview("");

			// Refresh reviews
			const res = await api.get(`/review/${dogId}`);
			setReviews(res.data);

			// Update average rating
			if (res.data.length > 0) {
				const total = res.data.reduce((sum, r) => sum + r.star, 0);
				setAverageRating((total / res.data.length).toFixed(1));
			}
		} catch (err) {
			setError("Could not submit review. Please try again later.");
			console.error(err);
		} finally {
			setSubmitting(false);
		}
	};

	const handleDelete = async (reviewId) => {
		setDeleting(reviewId);
		try {
			await api.delete(`/review/${reviewId}`, {
				headers: {
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});

			// Update reviews list
			setReviews(reviews.filter((r) => r._id !== reviewId));

			// Update average rating
			const updatedReviews = reviews.filter((r) => r._id !== reviewId);
			if (updatedReviews.length > 0) {
				const total = updatedReviews.reduce((sum, r) => sum + r.star, 0);
				setAverageRating((total / updatedReviews.length).toFixed(1));
			} else {
				setAverageRating(0);
			}
		} catch (err) {
			console.error("Failed to delete review:", err);
			setError("Failed to delete review. Please try again.");
		} finally {
			setDeleting(null);
		}
	};

	// Format date
	const formatDate = (dateString) => {
		return formatDistanceToNow(new Date(dateString), { addSuffix: true });
	};

	// Render stars for rating display
	const renderStars = (rating) => {
		return (
			<div className="flex">
				{[1, 2, 3, 4, 5].map((value) => (
					<span
						key={value}
						className={value <= rating ? "text-yellow-500" : "text-gray-300"}
					>
						{value <= rating ? <FaStar /> : <FaRegStar />}
					</span>
				))}
			</div>
		);
	};

	// Render interactive stars for rating input
	const renderRatingInput = () => {
		return (
			<div className="flex space-x-1">
				{[1, 2, 3, 4, 5].map((value) => (
					<button
						type="button"
						key={value}
						onClick={() => setStar(value)}
						className={`text-2xl transition-colors ${
							value <= star
								? "text-yellow-500"
								: "text-gray-300 hover:text-yellow-300"
						}`}
						aria-label={`Rate ${value} stars`}
					>
						{value <= star ? <FaStar /> : <FaRegStar />}
					</button>
				))}
			</div>
		);
	};

	return (
		<div className="mt-10 bg-white rounded-xl shadow-md overflow-hidden print:hidden">
			{/* Header */}
			<div className="bg-[#8c1d35] px-6 py-4">
				<h3 className="text-xl font-bold text-white flex items-center">
					<FaRegCommentDots className="mr-3" /> Reviews & Ratings
				</h3>
			</div>

			<div className="p-6">
				{/* Loading State */}
				{loading ? (
					<div className="flex justify-center items-center py-8">
						<FaSpinner className="animate-spin text-[#8c1d35] text-3xl" />
					</div>
				) : (
					<>
						{/* Rating Summary */}
						{reviews.length > 0 ? (
							<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 bg-[#f8f5f0] p-4 rounded-lg border border-[#e8d3a9]">
								<div className="flex items-center mb-3 md:mb-0">
									<div className="bg-[#e8d3a9] rounded-full p-3 mr-4">
										<span className="text-[#8c1d35] text-2xl font-bold">
											{averageRating}
										</span>
									</div>
									<div>
										<div className="flex text-yellow-500 mb-1">
											{renderStars(Math.round(averageRating))}
										</div>
										<p className="text-gray-700 font-medium">
											Based on {reviews.length}{" "}
											{reviews.length === 1 ? "review" : "reviews"}
										</p>
									</div>
								</div>
								<button
									className="text-[#8c1d35] hover:text-[#7c1025] font-medium flex items-center"
									onClick={() => window.open(`/dog/${dogId}/reviews`, "_blank")}
								>
									<FaPaw className="mr-1" /> View All Reviews
								</button>
							</div>
						) : (
							<div className="bg-[#f8f5f0] p-6 rounded-lg text-center border border-[#e8d3a9] mb-6">
								<FaPaw className="text-[#8c1d35] text-4xl mx-auto mb-3 opacity-50" />
								<p className="text-gray-700">
									No reviews yet. Be the first to share your experience!
								</p>
							</div>
						)}

						{/* Reviews List */}
						{reviews.length > 0 && (
							<div className="mb-8">
								<h4 className="text-lg font-semibold text-gray-800 mb-4">
									Recent Reviews
								</h4>
								<ul className="space-y-4">
									{(showAll ? reviews : reviews.slice(0, 3)).map((r) => (
										<li key={r._id} className="border-b border-gray-200 pb-4">
											<div className="flex justify-between items-start">
												<div className="flex items-start">
													{r.userId?.picture ? (
														<img
															src={r.userId.picture || "/placeholder.svg"}
															alt={`${r.userId.firstName}'s avatar`}
															className="w-10 h-10 rounded-full object-cover mr-3"
														/>
													) : (
														<div className="w-10 h-10 rounded-full bg-[#e8d3a9] flex items-center justify-center text-[#8c1d35] mr-3">
															<FaUserCircle className="w-6 h-6" />
														</div>
													)}
													<div>
														<p className="font-medium text-gray-800">
															{r.userId?.firstName || "Anonymous"}{" "}
															{r.userId?.lastName || ""}
														</p>
														<div className="flex text-yellow-500 my-1">
															{renderStars(r.star)}
														</div>
														<p className="text-gray-700 mt-2">{r.review}</p>
														{r.createdAt && (
															<p className="text-gray-500 text-sm mt-1">
																{formatDate(r.createdAt)}
															</p>
														)}

														{/* Display review images */}
														{r.images && r.images.length > 0 && (
															<div className="mt-3">
																<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
																	{r.images.map((image, idx) => (
																		<div key={idx} className="relative group">
																			<div
																				className="aspect-square rounded-lg overflow-hidden border border-[#e8d3a9] bg-[#f8f5f0] cursor-pointer"
																				onClick={() =>
																					window.open(image, "_blank")
																				}
																			>
																				<img
																					src={image || "/placeholder.svg"}
																					alt={`Review image ${idx + 1}`}
																					className="w-full h-full object-cover hover:scale-105 transition-transform"
																				/>
																			</div>
																		</div>
																	))}
																</div>
																{r.images.length > 3 && (
																	<p className="text-sm text-[#8c1d35] mt-1 font-medium">
																		+ {r.images.length - 3} more{" "}
																		{r.images.length - 3 === 1
																			? "image"
																			: "images"}
																	</p>
																)}
															</div>
														)}
													</div>
												</div>
												{(userId === r.userId?._id || userRole === "admin") && (
													<button
														onClick={() => handleDelete(r._id)}
														disabled={deleting === r._id}
														className="text-red-600 hover:text-red-800 p-1 rounded-full transition-colors"
														title="Delete review"
													>
														{deleting === r._id ? (
															<FaSpinner className="animate-spin" />
														) : (
															<FaTrash />
														)}
													</button>
												)}
											</div>
										</li>
									))}
								</ul>

								{reviews.length > 3 && (
									<button
										className="mt-4 text-[#8c1d35] hover:text-[#7c1025] font-medium flex items-center"
										onClick={() => setShowAll(!showAll)}
									>
										{showAll
											? "Show Less"
											: `Show All ${reviews.length} Reviews`}
									</button>
								)}
							</div>
						)}

						{/* Write Review Form */}
						{userId ? (
							<div className="mt-6 border-t border-gray-200 pt-6 text-gray-800">
								<h4 className="text-lg font-semibold text-gray-800 mb-4">
									Write a Review
								</h4>
								<form onSubmit={handleSubmit} className="space-y-4">
									<div>
										<label className="block text-gray-700 font-medium mb-2">
											Your Rating
										</label>
										{renderRatingInput()}
									</div>

									<div>
										<label className="block text-gray-700 font-medium mb-2">
											Your Review
										</label>
										<textarea
											className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#8c1d35] focus:border-transparent"
											placeholder="Share your experience with this dog..."
											value={review}
											onChange={(e) => setReview(e.target.value)}
											rows="4"
											required
										/>
									</div>

									<div>
										<div>
											<div>
												<label className="block text-gray-700 font-medium mb-2">
													Upload Photos
												</label>
												<div className="mb-4">
													<div className="flex items-center justify-center w-full">
														<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-[#f8f5f0] border-[#e8d3a9] hover:bg-[#f0e9df] transition-colors">
															<div className="flex flex-col items-center justify-center pt-5 pb-6">
																<svg
																	className="w-8 h-8 mb-3 text-[#8c1d35]"
																	fill="none"
																	stroke="currentColor"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth="2"
																		d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
																	></path>
																</svg>
																<p className="mb-1 text-sm text-gray-700">
																	<span className="font-semibold">
																		Click to upload
																	</span>{" "}
																	or drag and drop
																</p>
																<p className="text-xs text-gray-500">
																	PNG, JPG, GIF (MAX. 5MB each)
																</p>
															</div>
															<input
																type="file"
																name="images"
																accept="image/*"
																multiple
																className="hidden"
																onChange={(e) =>
																	setImages(Array.from(e.target.files))
																}
															/>
														</label>
													</div>
												</div>

												{/* Image Preview Section */}
												{images.length > 0 && (
													<div className="mt-4">
														<p className="text-sm font-medium text-gray-700 mb-2">
															{images.length}{" "}
															{images.length === 1 ? "image" : "images"}{" "}
															selected:
														</p>
														<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
															{images.map((img, index) => (
																<div key={index} className="relative group">
																	<div className="aspect-square rounded-lg overflow-hidden border border-[#e8d3a9] bg-[#f8f5f0]">
																		<img
																			src={
																				URL.createObjectURL(img) ||
																				"/placeholder.svg"
																			}
																			alt={`Preview ${index + 1}`}
																			className="w-full h-full object-cover"
																		/>
																	</div>
																	<button
																		type="button"
																		onClick={() =>
																			setImages(
																				images.filter((_, i) => i !== index)
																			)
																		}
																		className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
																		aria-label="Remove image"
																	>
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			className="h-4 w-4"
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
																	</button>
																</div>
															))}
														</div>
														<button
															type="button"
															onClick={() => setImages([])}
															className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
														>
															Clear all images
														</button>
													</div>
												)}
											</div>
										</div>
										<div>
											<button
												type="submit"
												disabled={submitting}
												className="bg-[#8c1d35] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#7c1025] transition-colors flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
											>
												{submitting ? (
													<>
														<FaSpinner className="animate-spin mr-2" />
														Submitting...
													</>
												) : (
													"Submit Review"
												)}
											</button>
										</div>
									</div>

									{/* Success Message */}
									{response && (
										<div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg flex items-start">
											<FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
											<p>{response}</p>
										</div>
									)}

									{/* Error Message */}
									{error && (
										<div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start">
											<FaExclamationTriangle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
											<p>{error}</p>
										</div>
									)}
								</form>
							</div>
						) : (
							<div className="mt-6 bg-[#f8f5f0] border border-[#e8d3a9] p-6 rounded-lg text-center">
								<FaUserCircle className="text-[#8c1d35] text-4xl mx-auto mb-3" />
								<h4 className="text-lg font-semibold text-gray-800 mb-2">
									Want to share your experience?
								</h4>
								<p className="text-gray-600 mb-4">
									Please log in to submit a review for this dog.
								</p>
								<div className="flex justify-center gap-4">
									<a
										href="/login"
										className="bg-[#8c1d35] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#7c1025] transition-colors"
									>
										Log In
									</a>
									<a
										href="/signup"
										className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
									>
										Sign Up
									</a>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default ReviewSection;
