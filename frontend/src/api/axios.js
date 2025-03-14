import axios from "axios";
import { jwtDecode } from "jwt-decode";

const api = axios.create({
	baseURL: import.meta.env.VITE_BACKEND_URL,
});

api.interceptors.request.use(async (config) => {
	const token = localStorage.getItem("token");

	if (token && token.split(".").length === 3) {
		try {
			const decoded = jwtDecode(token);
			const currentTime = Date.now() / 1000;

			// If token is about to expire within 2 minutes, refresh it
			if (decoded.exp - currentTime < 120) {
				const response = await axios.post(
					`${import.meta.env.VITE_BACKEND_URL}/users/refresh-token`,
					{},
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const newToken = response.data.token;
				if (newToken) {
					localStorage.setItem("token", newToken);
					config.headers.Authorization = `Bearer ${newToken}`;
				}
			} else {
				config.headers.Authorization = `Bearer ${token}`;
			}
		} catch (error) {
			console.error("Invalid or expired token:", error);
			localStorage.removeItem("token");
			window.location.href = "/login"; // Auto-logout on invalid token
		}
	} else if (token) {
		console.warn("Invalid token format, removing it.");
		localStorage.removeItem("token");
		window.location.href = "/login";
	}

	return config;
});

export default api;
