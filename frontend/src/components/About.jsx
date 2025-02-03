import React, { useState } from 'react';

export default function About() {
  const images = [
    "/image1.png",  // Replace with your image paths
    "/image2.png",
    "/image3.png",
    "/cberry.png",  // Example of the image you already have
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div>
      {/* First Section - Our Why */}
      <div className="min-h-screen bg-[#FAF5F0] text-gray-900 py-0 px-0 sm:px-0 lg:px-0 flex flex-col lg:flex-row items-center">
        {/* Left Section - Image */}
        <div className="lg:w-1/2 flex justify-center w-full">
          <img 
            src="/dogs-i-love-you-1599756972292-1599828190639.webp" 
            alt="P-40 Underdog Project" 
            className="h-[66vh] w-full object-cover rounded-none shadow-lg mb-[-8vh]"
          />
        </div>

        {/* Right Section - Text */}
        <div className="lg:w-1/2 text-left lg:pl-16 px-6 sm:px-12 lg:px-24">
          <h1 className="text-5xl font-serif font-semibold text-[#840029] mb-6">Our Vision</h1>
          <p className="text-lg font-[Univers] font-normal text-gray-700 mb-4 leading-relaxed">
            The P-40 Underdog Project is dedicated to transforming the relationship between humans and animals by 
            fostering strong connections within the ULM and NELA communities. We aim to bridge the gap between animal 
            welfare and mental health awareness, recognizing the profound impact pets can have on well-being.
            </p>

                <p className="text-lg font-[Univers] font-normal text-gray-700 mb-6 leading-relaxed">
            Our mission is to end dog and cat homelessness in Northeast Louisiana, offering hope and second chances to animals in need. 
            Additionally, we strive to establish ULM as a leader in integrating pet use into mental health support, 
            creating a future where every person and animal has a chance to be rescued.
          </p>
        </div>
      </div>

      {/* Second Section - Our Objectives */}
      <div className="bg-[#FAF5F0] text-gray-900 py-0 px-0 sm:px-0 lg:px-0 flex flex-col lg:flex-row items-center">
        {/* Left Section - Text */}
        <div className="lg:w-1/2 text-left lg:pr-16 px-6 sm:px-12 lg:px-24">
          <h2 className="text-5xl font-serif font-semibold text-[#840029] mb-6">Our Objectives</h2>
          <p className="text-lg font-[Univers] font-normal text-gray-700 mb-6 leading-relaxed">
            The P-40 Underdog Project strives to reduce animal homelessness in NELA through sustained efforts 
            and community collaboration, ensuring every animal finds a loving home. We aim to pioneer the integration
            of pet therapy programs at ULM, enhancing mental health by offering students and staff therapeutic animal 
            interactions. By creating accessible and engaging opportunities for community involvement on campus, we 
            foster positive relationships between students, staff, and animals. Ultimately, we reinforce ULM's commitment 
            to overcoming adversity, using the power of human-animal connections to build resilience and provide support during challenging times.
          </p>
        </div>

        {/* Right Section - Image */}
        <div className="lg:w-1/2 flex justify-center w-full">
          <img 
            src="/doyalson-Vet-Pet-lookalike-blog.png" 
            alt="Our Objectives" 
            className="h-[66vh] w-full object-cover rounded-none shadow-lg mt-[-13vh]"
          />
        </div>
      </div>

      {/* Team Section */}
      <div className="min-h-screen bg-[#FAF5F0] text-gray-900 py-0 px-0 sm:px-0 lg:px-0 flex flex-col items-center mt-10">
        {/* Header - Our Team */}
        <h2 className="text-5xl font-serif font-semibold text-[#840029] mb-6 text-center">Our Team</h2>

        {/* Image Section */}
        <div className="relative w-full flex justify-center">
          <div className="flex justify-between w-full items-center">
            {/* Left Image */}
            <img 
              src={images[(currentIndex - 1 + images.length) % images.length]} 
              alt="Previous Team Member"
              className="h-[45vh] w-[46%] object-cover rounded-none shadow-lg transition-transform duration-500 ease-in-out"
            />

            {/* Current Image */}
            <img 
              src={images[currentIndex]} 
              alt="Current Team Member"
              className="h-[45vh] w-[46%] object-cover rounded-none shadow-lg transition-transform duration-500 ease-in-out"
            />

            {/* Right Image */}
            <img 
              src={images[(currentIndex + 1) % images.length]} 
              alt="Next Team Member"
              className="h-[45vh] w-[46%] object-cover rounded-none shadow-lg transition-transform duration-500 ease-in-out"
            />
          </div>

          {/* Left Swipe Button */}
          <button
            onClick={handlePrev}
            className="absolute left-84 top-1/2 transform -translate-y-1/2 bg-[#840029] text-white p-2 rounded-full shadow-lg"
          >
            &lt;
          </button>

          {/* Right Swipe Button */}
          <button
            onClick={handleNext}
            className="absolute right-84 top-1/2 transform -translate-y-1/2 bg-[#840029] text-white p-2 rounded-full shadow-lg"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
