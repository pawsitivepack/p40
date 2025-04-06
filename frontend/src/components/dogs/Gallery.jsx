import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { IoClose } from "react-icons/io5";

function Gallery() {
	const [dogs, setDogs] = useState([]);
	const [popup, setPopup] = useState(false);
	const [popupData, setPopupData] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [touchStartX, setTouchStartX] = useState(null);
	const [touchEndX, setTouchEndX] = useState(null);
	const [fade, setFade] = useState(false);
	const [morePics, setMorePics] = useState([]); // For additional images from review

	useEffect(() => {
		const fetchGallery = async () => {
			try {
				const response = await api.get("/dogs");
				const morePics = await api.get(`/review/photos`);

				const dogList = response.data;
				const reviewImages = morePics.data;

				const galleryItems = dogList.map((dog) => ({
					_id: dog._id,
					imageURL: dog.imageURL,
					name: dog.name,
				}));

				const reviewItems = reviewImages.map((url, index) => ({
					_id: `review-${index}`,
					imageURL: url,
					name: "From Review",
				}));

				setDogs([...galleryItems, ...reviewItems]);
				console.log("more pics", morePics);
			} catch (error) {
				console.error("Error fetching gallery:", error);
			}
		};

		fetchGallery();
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape") closeModal();
			if (!popup) return;

			if (e.key === "ArrowLeft") {
				const newIndex = (selectedIndex - 1 + dogs.length) % dogs.length;
				setFade(true);
				setTimeout(() => {
					setSelectedIndex(newIndex);
					setPopupData(dogs[newIndex].imageURL);
					setFade(false);
				}, 150);
			}

			if (e.key === "ArrowRight") {
				const newIndex = (selectedIndex + 1) % dogs.length;
				setFade(true);
				setTimeout(() => {
					setSelectedIndex(newIndex);
					setPopupData(dogs[newIndex].imageURL);
					setFade(false);
				}, 150);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [popup, selectedIndex, dogs]);

	const closeModal = () => setPopup(false);

	return (
		<div>
			<h1 className="text-3xl font-bold text-center text-[var(--primary-300)] mt-6 mb-4">
				Gallery
			</h1>
			<div className="columns-2 sm:columns-3 md:columns-4 gap-4 p-4">
				{dogs.map((dog, index) => (
					<img
						key={dog._id}
						src={dog.imageURL}
						alt={dog.name}
						onClick={() => {
							setPopupData(dog.imageURL);
							setSelectedIndex(index);
							setPopup(true);
						}}
						className="w-full mb-4 rounded-xl object-contain shadow-md cursor-pointer hover:scale-102 transition"
					/>
				))}
			</div>
			{popup && (
				<div
					className="fixed inset-0 bg-slate-900 bg-opacity-90 z-50 flex justify-center items-center"
					onClick={closeModal}
				>
					<div
						className="relative w-full h-full flex justify-center items-center"
						onClick={(e) => e.stopPropagation()}
					>
						<IoClose
							className="w-10 h-10 text-white absolute top-6 right-6 z-50 cursor-pointer"
							onClick={(e) => {
								e.stopPropagation();
								closeModal();
							}}
						/>
						<img
							src={popupData}
							alt="Full View"
							className={`w-full sm:w-5/6 md:w-1/2 max-h-[90%] object-contain rounded-lg shadow-lg transition-opacity duration-300 ${
								fade ? "opacity-0" : "opacity-100"
							}`}
							onTouchStart={(e) => setTouchStartX(e.targetTouches[0].clientX)}
							onTouchMove={(e) => setTouchEndX(e.targetTouches[0].clientX)}
							onTouchEnd={() => {
								if (!touchStartX || !touchEndX) return;
								const diff = touchStartX - touchEndX;
								if (diff > 50) {
									// swipe left
									const newIndex = (selectedIndex + 1) % dogs.length;
									setFade(true);
									setTimeout(() => {
										setSelectedIndex(newIndex);
										setPopupData(dogs[newIndex].imageURL);
										setFade(false);
									}, 150);
								} else if (diff < -50) {
									// swipe right
									const newIndex =
										(selectedIndex - 1 + dogs.length) % dogs.length;
									setFade(true);
									setTimeout(() => {
										setSelectedIndex(newIndex);
										setPopupData(dogs[newIndex].imageURL);
										setFade(false);
									}, 150);
								}
								setTouchStartX(null);
								setTouchEndX(null);
							}}
						/>
						<button
							onClick={(e) => {
								e.stopPropagation();
								const newIndex =
									(selectedIndex - 1 + dogs.length) % dogs.length;
								setFade(true);
								setTimeout(() => {
									setSelectedIndex(newIndex);
									setPopupData(dogs[newIndex].imageURL);
									setFade(false);
								}, 150);
							}}
							className="absolute left-4 text-white text-3xl z-50"
						>
							‹
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								const newIndex = (selectedIndex + 1) % dogs.length;
								setFade(true);
								setTimeout(() => {
									setSelectedIndex(newIndex);
									setPopupData(dogs[newIndex].imageURL);
									setFade(false);
								}, 150);
							}}
							className="absolute right-4 text-white text-3xl z-50"
						>
							›
						</button>
						<div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 overflow-x-auto px-4">
							{dogs.map((dog, idx) => (
								<img
									key={dog._id}
									src={dog.imageURL}
									alt={dog.name}
									onClick={(e) => {
										e.stopPropagation();
										setSelectedIndex(idx);
										setPopupData(dog.imageURL);
									}}
									className={`w-16 h-16 object-contain rounded cursor-pointer border-2 hover:scale-105 transition ${
										idx === selectedIndex
											? "border-white"
											: "border-transparent"
									}`}
								/>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Gallery;
