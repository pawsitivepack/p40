import { useState, useEffect, useRef } from "react";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

const SearchableSelect = ({ options, value, onChange, placeholder }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredOptions, setFilteredOptions] = useState(options);
	const dropdownRef = useRef(null);
	const inputRef = useRef(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Filter options when search term changes
	useEffect(() => {
		if (!options) return;

		const filtered = options.filter((option) =>
			option.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredOptions(filtered);
	}, [searchTerm, options]);

	// Get the selected option's name
	const getSelectedOptionName = () => {
		if (!value || !options) return "";
		const selectedOption = options.find((option) => option._id === value);
		return selectedOption ? selectedOption.name : "";
	};

	const getDemeanorStyles = (demeanor) => {
		if (demeanor === "Red") {
			return {
				background: "#fee2e2", // bg-red-100
				text: "#b91c1c", // text-red-700
			};
		}
		if (demeanor === "Yellow") {
			return {
				background: "#fef3c7", // bg-yellow-100
				text: "#b45309", // text-yellow-700
			};
		}
		if (demeanor === "Gray") {
			return {
				background: "#f3f4f6", // bg-gray-100
				text: "#4b5563", // text-gray-700
			};
		}
		return {
			background: "white",
			text: "#374151", // fallback to gray-800
		};
	};

	// Get selected option
	const getSelectedOption = () => {
		if (!value || !options) return null;
		return options.find((option) => option._id === value);
	};

	const selectedOption = getSelectedOption();

	return (
		<div className="relative w-full" ref={dropdownRef}>
			{/* Selected value display / search input */}
			<div
				className="w-full p-3 border border-[#e8d3a9] rounded-lg flex items-center justify-between bg-white cursor-pointer"
				onClick={() => {
					setIsOpen(!isOpen);
					if (!isOpen) {
						setTimeout(() => {
							inputRef.current?.focus();
						}, 100);
					}
				}}
			>
				<div className="flex items-center flex-1">
					{selectedOption && selectedOption.image ? (
						<div className="w-8 h-8 rounded-full overflow-hidden mr-2 border border-[#e8d3a9] flex-shrink-0">
							<img
								src={selectedOption.imageURL || "/placeholder.svg"}
								alt={selectedOption.name}
								className="w-full h-full object-cover"
								onError={(e) => {
									e.target.src = "/placeholder.svg?height=32&width=32";
								}}
							/>
						</div>
					) : (
						<FaSearch className="text-[#8c1d35] mr-2" />
					)}

					{isOpen ? (
						<input
							ref={inputRef}
							type="text"
							className="w-full outline-none border-none focus:ring-0 p-0 text-gray-700"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder={placeholder || "Search dogs..."}
							onClick={(e) => e.stopPropagation()}
						/>
					) : (
						<span className="text-gray-700">
							{value ? getSelectedOptionName() : placeholder || "Select a dog"}
						</span>
					)}
				</div>
				{isOpen ? (
					<FaChevronUp className="text-[#8c1d35]" />
				) : (
					<FaChevronDown className="text-[#8c1d35]" />
				)}
			</div>

			{/* Dropdown options */}
			{isOpen && (
				<div className="absolute z-10 w-full mt-1 bg-white border border-[#e8d3a9] rounded-lg shadow-lg max-h-96 overflow-y-auto">
					{filteredOptions.length === 0 ? (
						<div className="p-3 text-center text-gray-500">No dogs found</div>
					) : (
						filteredOptions.map((option) => {
							const demeanorStyles = getDemeanorStyles(option.demeanor);

							return (
								<div
									key={option._id}
									className="p-3 hover:bg-[#f8f5f0] cursor-pointer flex items-center"
									style={{ backgroundColor: demeanorStyles.background }}
									onClick={() => {
										onChange(option._id);
										setSearchTerm("");
										setIsOpen(false);
									}}
								>
									<div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-[#e8d3a9] flex-shrink-0">
										<img
											src={
												option.imageURL || "/placeholder.svg?height=40&width=40"
											}
											alt={option.name}
											className="w-full h-full object-cover"
											onError={(e) => {
												e.target.src = "/placeholder.svg?height=40&width=40";
											}}
										/>
									</div>
									<span
										style={{ color: demeanorStyles.text }}
										className="font-medium"
									>
										{option.name}
									</span>
								</div>
							);
						})
					)}
				</div>
			)}
		</div>
	);
};

export default SearchableSelect;
