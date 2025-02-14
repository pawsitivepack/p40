import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	css: {
		preprocessorOptions: {
			css: {
				additionalData: `
          @import "@fullcalendar/common/main.css";
          @import "@fullcalendar/daygrid/main.css";
          @import "@fullcalendar/timegrid/main.css";
        `,
			},
		},
	},
	server: {
		proxy: {
			"/api": "http://localhost:5000", // Match your backend URL
		},
	},
});
