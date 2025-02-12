import React from "react";

export default function Donate() {
	return (
		<div className="flex flex-col w-full h-[calc(100vh-4rem)]">
			{" "}
			{/* Adjust height based on your navbar */}
			{/* The donation page content inside an iframe */}
			<iframe
				src="https://fundraise.givesmart.com/f/4yx1/n?vid=1hjrg6"
				title="External Donation Page"
				className="w-full h-full border-none"
			></iframe>
		</div>
	);
}
