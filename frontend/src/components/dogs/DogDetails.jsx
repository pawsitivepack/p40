import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const DogDetails = ({ dogs }) => {
	const { id } = useParams();
	const navigate = useNavigate();
	const token = localStorage.getItem("token");
	const isLoggedIn = !!token;
	const dog =
		dogs?.find((d) => d._id === id) ||
		(() => {
			const storedDogs = JSON.parse(localStorage.getItem("dogs") || "[]");
			return storedDogs.find((d) => d._id === id);
		})();

	if (!dog) return <div>Dog not found.</div>;

	return (
		<div className="bg-[var(--bg-100)] min-h-screen py-10">
			<div className="p-6 max-w-4xl mx-auto">
				<button
					onClick={() => navigate(-1)}
					className="mb-4 text-[var(--primary-300)] hover:underline"
				>
					← Back to Adoption
				</button>
				<h2 className="text-2xl font-semibold text-[var(--text-100)] mb-4">
					Dog Profile
				</h2>
				<div className="bg-[var(--bg-100)] p-6 rounded-lg shadow-md">
					<div className="flex flex-col md:flex-row gap-6">
						<img
							src={dog.imageURL}
							alt={dog.name}
							className="w-full md:w-1/2 h-96 object-cover rounded-lg border shadow-sm"
						/>
						<div className="flex-1 space-y-2">
							<h1 className="text-3xl font-bold text-[var(--text-100)] mb-2">
								{dog.name}
							</h1>
							<div className="space-y-2">
								<p className="text-[var(--text-200)]">
									<strong>Breed:</strong> {dog.breed}
								</p>
								<p className="text-[var(--text-200)]">
									<strong>Age:</strong> {dog.age} years
								</p>
								<p className="text-[var(--text-200)]">
									<strong>Color:</strong> {dog.color}
								</p>
								<p className="text-[var(--text-200)]">
									<strong>Adopted:</strong> {dog.adopted ? "Yes" : "No"}
								</p>
								{dog.adopted && (
									<p className="text-[var(--text-200)]">
										<strong>Adopted Date:</strong> {dog.adoptedDate}
									</p>
								)}
								{dog.size && (
									<p className="text-[var(--text-200)]">
										<strong>Size:</strong> {dog.size}
									</p>
								)}
								{dog.healthIssues && (
									<p className="text-[var(--text-200)]">
										<strong>Health Issues:</strong> {dog.healthIssues}
									</p>
								)}
								{dog.notes && dog.notes.length > 0 && (
									<div className="text-[var(--text-200)]">
										<strong>Notes:</strong>
										<ul className="list-disc list-inside ml-2">
											{dog.notes.map((note, index) => (
												<li key={index}>{note}</li>
											))}
										</ul>
									</div>
								)}
								{dog.tags && dog.tags.length > 0 && (
									<div className="text-[var(--text-200)]">
										<strong>Tags:</strong>
										<div className="flex flex-wrap gap-2 mt-1">
											{dog.tags.map((tag, index) => (
												<span
													key={index}
													className="bg-blue-200 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded"
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
					{isLoggedIn ? (
						<form className="mt-10 bg-[var(--bg-200)] p-6 rounded-lg shadow-md max-w-2xl mx-auto">
							<h2 className="text-xl font-semibold text-[var(--text-100)] mb-4">
								Inquire About {dog.name}
							</h2>
							<div>
								<label className="block text-[var(--text-200)] mb-1">
									Message
								</label>
								<textarea
									rows="4"
									className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary-200)]"
								/>
							</div>
							<button
								type="submit"
								className="bg-[var(--primary-300)] text-white font-semibold px-6 py-2 rounded hover:bg-[var(--primary-400)] transition"
							>
								Send Inquiry
							</button>
						</form>
					) : (
						<p className="text-center mt-6 text-[var(--text-200)]">
							Please{" "}
							<a href="/login" className="text-[var(--primary-300)] underline">
								log in
							</a>{" "}
							to inquire about this dog.
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default DogDetails;
