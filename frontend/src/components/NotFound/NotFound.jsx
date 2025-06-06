import { useEffect } from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";
import image404 from "../../assets/404.png";

const NotFound = () => {
	// Add TV static noise effect when component mounts
	useEffect(() => {
		const interval = setInterval(() => {
			const screen = document.querySelector(".screen");
			const screenM = document.querySelector(".screenM");

			if (screen && screenM) {
				// Random TV static effect
				const noise = Math.random() > 0.9;
				if (noise) {
					screen.classList.add("noise");
					screenM.classList.add("noise");

					setTimeout(() => {
						screen.classList.remove("noise");
						screenM.classList.remove("noise");
					}, 100);
				}
			}
		}, 500);

		return () => clearInterval(interval);
	}, []);

	return (
		<div
			className="notfound_container"
			style={{
				backgroundImage: `url(${image404})`,
				backgroundSize: "contain",
				backgroundPosition: "top center",
				backgroundRepeat: "no-repeat",
				minHeight: "100vh",
			}}
		>
			<div className="main_wrapper">
				<div className="main">
					<h1 className="error_text">Error 404</h1>

					<div className="antenna">
						<div className="antenna_shadow" />
						<div className="a1" />
						<div className="a1d" />
						<div className="a2" />
						<div className="a2d" />
						<div className="a_base" />
					</div>

					<div className="tv">
						<div className="curve">
							<svg
								className="curve_svg"
								version="1.1"
								xmlns="http://www.w3.org/2000/svg"
								xmlnsXlink="http://www.w3.org/1999/xlink"
								viewBox="0 0 189.929 189.929"
								xmlSpace="preserve"
							>
								<path
									d="M70.343,70.343c-30.554,30.553-44.806,72.7-39.102,115.635l-29.738,3.951C-5.442,137.659,11.917,86.34,49.129,49.13
                  C86.34,11.918,137.664-5.445,189.928,1.502l-3.95,29.738C143.041,25.54,100.895,39.789,70.343,70.343z"
								/>
							</svg>
						</div>

						<div className="display_div">
							<div className="screen_out">
								<div className="screen_out1">
									<div className="screen">
										<span className="notfound_text">NOT FOUND</span>
									</div>
									<div className="screenM">
										<span className="notfound_text">NOT FOUND</span>
									</div>
								</div>
							</div>
						</div>

						<div className="lines">
							<div className="line1" />
							<div className="line2" />
							<div className="line3" />
						</div>

						<div className="buttons_div">
							<div className="b1">
								<div className="knob" />
							</div>
							<div className="b2" />
							<div className="speakers">
								<div className="g1">
									<div className="g11" />
									<div className="g12" />
									<div className="g13" />
								</div>
								<div className="g" />
								<div className="g" />
							</div>
						</div>
					</div>

					<div className="bottom">
						<div className="base1" />
						<div className="base2" />
						<div className="base3" />
					</div>

					{/* Channel changing animation */}
					<div className="channel-change">
						<div className="channel-text">CH 404</div>
					</div>

					{/* Home button styled as a TV remote control button */}
					<div className="remote-control">
						<Link to="/" className="home-button">
							<div className="button-icon">⌂</div>
							<div className="button-text">HOME</div>
						</Link>
						<div className="remote-buttons">
							<div className="remote-button"></div>
							<div className="remote-button"></div>
							<div className="remote-button"></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default NotFound;
