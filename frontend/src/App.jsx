// src/App.jsx
import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import About from "./components/About";
import Footer from "./components/Footer";
import Gallery from "./components/Gallery";
import Home from "./components/Home";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Donate from "./components/Donate";
import Walkdogs from "./components/Walkdogs";
import MyProfile from "./components/MyProfile";
import GoogleSignup from "./components/GoogleSignup";
import ScheduledWalk from "./components/ScheduledWalks";
import MyWalks from "./components/MyWalks";
import Users from "./components/Users/Users";

function App() {
	const [dogs, setDogs] = useState([]);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		if (isLoggedIn) {
			const fetchDogs = async () => {
				try {
					const response = await axios.get(
						`${import.meta.env.VITE_BACKEND_URL}`
					);
					setDogs(response.data);
				} catch (error) {
					console.error("Error fetching data:", error);
				}
			};

			fetchDogs();
		}
	}, [isLoggedIn]);

	return (
		<Router>
			<div className="bg-red-950 text-gray-100 min-h-screen flex flex-col">
				{/* Navbar */}
				<Navbar />

				{/* Toast Container for Global Toast Notifications */}
				<ToastContainer
					position="top-right"
					autoClose={3000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					pauseOnFocusLoss
					draggable
					pauseOnHover
				/>

				{/* Main Content - Takes Remaining Space */}
				<main className="flex-grow">
					<Routes>
						<Route path="/home" element={<Home />} />
						<Route path="/" element={<Home />} />
						<Route path="/about" element={<About />} />
						<Route path="/gallery" element={<Gallery />} />
						<Route path="/walkdogs" element={<Walkdogs />} />
						<Route
							path="/login"
							element={<Login setIsLoggedIn={setIsLoggedIn} />}
						/>
						<Route path="/scheduledwalk" element={<ScheduledWalk />} />
						<Route path="/mywalks" element={<MyWalks />} />
						<Route path="/donate" element={<Donate />} />
						<Route path="/myprofile" element={<MyProfile />} />
						<Route path="/google-signup" element={<GoogleSignup />} />
						<Route path="/users" element={<Users />} />
					</Routes>
				</main>

				{/* Footer Sticks to Bottom */}
				<Footer />
			</div>
		</Router>
	);
}

export default App;
