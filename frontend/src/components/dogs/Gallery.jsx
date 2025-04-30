import { useEffect, useState } from "react";
import api from "../../api/axios";
import Lightbox from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Download from "yet-another-react-lightbox/plugins/download";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/captions.css";

function Gallery() {
	const [dogs, setDogs] = useState([]);
	const [open, setOpen] = useState(false);
	const [index, setIndex] = useState(0);

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
					description: `Photo of ${dog.name}`,
				}));

				const reviewItems = reviewImages.map((photo, index) => ({
					_id: `review-${index}`,
					imageURL: photo.url,
					name: "Dog Photo",
					description: "Community-submitted photo",
					dogId: photo.dogId,
				}));

				const combined = [...galleryItems, ...reviewItems].map((item) => {
					if (item.name === "Dog Photo") {
						const dog = galleryItems.find((d) => d._id === item.dogId);
						if (dog) {
							return { ...item, name: dog.name, _id: dog._id };
						}
					}
					return item;
				});
				setDogs(combined);
				console.log("more pics", morePics);
			} catch (error) {
				console.error("Error fetching gallery:", error);
			}
		};

		fetchGallery();
	}, []);

	// Convert our dog data to the format expected by the lightbox
	const slides = dogs.map((dog) => {
		const isDog = dog.name !== "From Review";
		return {
			src: dog.imageURL,
			alt: dog.name,
			title: isDog ? (
				<a
					href={`/dog/${dog._id}`}
					target="_blank"
					rel="noopener noreferrer"
					className="text-lg font-semibold underline text-white"
				>
					{dog.name}
				</a>
			) : (
				<span className="text-lg font-semibold text-white">{dog.name}</span>
			),
			description: dog.description || `Photo of ${dog.name}`,
		};
	});

	return (
		<div>
			<h1 className="text-3xl font-bold text-center text-[var(--primary-300)] mt-6 mb-4">
				Gallery
			</h1>
			<div className="columns-2 sm:columns-3 md:columns-4 gap-4 p-4">
				{dogs.map((dog, idx) => (
					<img
						key={dog._id}
						src={dog.imageURL || "/placeholder.svg"}
						alt={dog.name}
						onClick={() => {
							setIndex(idx);
							setOpen(true);
						}}
						className="w-full mb-4 rounded-xl object-contain shadow-md cursor-pointer hover:scale-102 transition"
					/>
				))}
			</div>

			<Lightbox
				open={open}
				close={() => setOpen(false)}
				slides={slides}
				index={index}
				plugins={[
					Thumbnails,
					Zoom,
					Counter,
					Slideshow,
					Fullscreen,
					Download,
					Captions,
				]}
				thumbnails={{
					position: "bottom",
					width: 120,
					height: 80,
					border: 2,
					borderRadius: 4,
					padding: 4,
					gap: 8,
				}}
				zoom={{
					maxZoomPixelRatio: 3,
					zoomInMultiplier: 2,
				}}
				counter={{
					container: {
						style: {
							top: "unset",
							bottom: "0",
							left: "50%",
							transform: "translateX(-50%)",
						},
					},
				}}
				carousel={{
					finite: false,
					preload: 3,
				}}
				animation={{ swipe: 250 }}
				controller={{ closeOnBackdropClick: true }}
				styles={{
					container: { backgroundColor: "rgba(15, 23, 42, 0.9)" },
					thumbnail: {
						active: {
							border: "2px solid white",
						},
					},
				}}
				captions={{
					render: ({ slide }) => slide.title,
				}}
			/>
		</div>
	);
}

export default Gallery;
