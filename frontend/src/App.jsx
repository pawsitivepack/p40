import React, { useEffect, useState } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import About from "./components/About";
import Footer from "./components/Footer";
import Gallery from "./components/dogs/Gallery";
import Home from "./components/Home";
import Login from "./components/Users/Login";
import Navbar from "./components/Navbar";
import Donate from "./components/Donate";
import Walkdogs from "./components/walks/Walkdogs";
import MyProfile from "./components/Users/MyProfile";
import GoogleSignup from "./components/Users/GoogleSignup";
import ScheduledWalk from "./components/walks/ScheduledWalks";
import CheckIn from "./components/walks/CheckIn";
import ViewCompletedWalks from "./components/walks/ViewCompletedWalks";
import MyWalks from "./components/walks/MyWalks";
import Users from "./components/Users/Users";
import MarshalApplication from "./components/marshalApp/MarshalApplication";
import UserDetails from "./components/Users/UserDetails";
import NotFound from "./components/NotFound/NotFound";
import OtpVerification from "./components/Users/OtpVerification";
import Adoption from "./components/dogs/Adoption";
import DogDetails from "./components/dogs/DogDetails";
import DogInventory from "./components/dogs/DogInventory";
import DogWalkSummary from "./components/walks/DogWalkSummary";
import ForgotPassword from "./components/Users/ForgotPassword";
import ResetPassword from "./components/Users/ResetPassword";
import DogWaiverForm from "./components/Waivers/DogWaiverform";
import ReviewSection from "./components/dogs/ReviewSection";
import DogChart from "./components/dogs/DogCharts";
import AdoptionInquiries from "./components/dogs/AdoptionInquiries";
import Map from "./components/maps/MapViewer";

function App() {
	const [dogs, setDogs] = useState([]);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	useEffect(() => {
		if (isLoggedIn) {
			const fetchDogs = async () => {
				try {
					const response = await api.get(`dogs`);
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
			<div className="bg-gray-400 text-gray-100 min-h-screen flex flex-col">
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
						<Route path="/checkin" element={<CheckIn />} />
						<Route path="/completedWalks" element={<ViewCompletedWalks />} />
						<Route path="/user/:id" element={<UserDetails />} />
						<Route path="/mywalks" element={<MyWalks />} />
						<Route path="/donate" element={<Donate />} />
						<Route path="/myprofile" element={<MyProfile />} />
						<Route path="/google-signup" element={<GoogleSignup />} />
						<Route path="/verify-otp" element={<OtpVerification />} />
						<Route path="/users" element={<Users />} />
						<Route
							path="/marshal-application"
							element={<MarshalApplication />}
						/>
						<Route path="*" element={<NotFound />} />
						<Route path="/adoption-board" element={<Adoption />} />
						<Route path="/adoption-inquiries" element={<AdoptionInquiries />} />
						<Route path="/forgot-password" element={<ForgotPassword />} />
						<Route path="/reset-password" element={<ResetPassword />} />
						<Route path="dog/:id" element={<DogDetails dogs={dogs} />} />
						<Route path="dog-inventory" element={<DogInventory />} />
						<Route path="dog-walk-summary" element={<DogWalkSummary />} />
						<Route path="/waiver" element={<DogWaiverForm />} />
						<Route path="review-section" element={<ReviewSection />} />
						<Route path="dog/walklog/:dogId" element={<DogChart />} />
						<Route path="/map" element={<Map />} />{" "}
					</Routes>
				</main>

				{/* Footer Sticks to Bottom */}
				<Footer />
			</div>
		</Router>
	);
}

export default App;
