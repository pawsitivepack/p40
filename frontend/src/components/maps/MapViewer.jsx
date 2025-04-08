import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { FaCompress, FaExpand, FaMapMarkerAlt } from "react-icons/fa";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
const redIcon = new L.Icon({
	iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [0, -32],
});

const blueIcon = new L.Icon({
	iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [0, -32],
});

const UserLocation = () => {
	const map = useMap();

	useEffect(() => {
		if (!navigator.geolocation) {
			console.log("Geolocation is not supported");
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => {
				const { latitude, longitude } = position.coords;
				map.setView([latitude, longitude], 13);
				L.marker([latitude, longitude], { icon: redIcon })
					.addTo(map)
					.bindPopup("You are here")
					.openPopup();
			},
			() => {
				console.log("Unable to retrieve your location");
			}
		);
	}, [map]);

	return null;
};

const MapViewer = () => {
	const [isFullscreen, setIsFullscreen] = useState(false);
	const mapRef = useRef();

	const toggleFullscreen = () => {
		setIsFullscreen((prev) => !prev);
	};

	const handleCenter = () => {
		if (mapRef.current) {
			mapRef.current.setView([32.505696648571174, -92.06175644443222], 13);
		}
	};

	return (
		<div className={isFullscreen ? "fixed inset-0 z-50 bg-white" : ""}>
			<div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
				<button
					onClick={toggleFullscreen}
					className="bg-white p-2 rounded-lg shadow-md hover:bg-[#f8f5f0] transition-colors"
					title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
				>
					{isFullscreen ? (
						<FaCompress className="text-[#8c1d35]" />
					) : (
						<FaExpand className="text-[#8c1d35]" />
					)}
				</button>
				<button
					onClick={handleCenter}
					className="bg-white p-2 rounded-lg shadow-md hover:bg-[#f8f5f0] transition-colors"
					title="Center map"
				>
					<FaMapMarkerAlt className="text-[#8c1d35]" />
				</button>
			</div>
			<MapContainer
				center={[32.505696648571174, -92.06175644443222]}
				zoom={13}
				scrollWheelZoom={true}
				style={{ height: isFullscreen ? "100vh" : "400px", width: "100%" }}
				whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker
					position={[32.505696648571174, -92.06175644443222]}
					icon={blueIcon}
				>
					<Popup>920 Freight Dr, Monroe, LA 71203</Popup>
				</Marker>
				<UserLocation />
			</MapContainer>
		</div>
	);
};

export default MapViewer;
