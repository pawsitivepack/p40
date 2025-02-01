import React from 'react';
import dogBackground from '../assets/dog.png';

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-900">
      {/* Blurred Background Image */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-contain blur-md opacity-50"
        style={{ backgroundImage: `url(${dogBackground})` }}
      ></div>

      {/* Foreground Content */}
      <div className="relative z-10 text-white text-center">
        <h1 className="text-4xl font-bold">Welcome to P40-Dog!</h1>
        <p className="text-xl mt-4">Your best companion is waiting!</p>
      </div>
    </div>
  );
}
