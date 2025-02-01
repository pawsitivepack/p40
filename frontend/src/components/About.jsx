
import React from 'react';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 py-10 px-6 sm:px-12 lg:px-24">
      <h1 className="text-4xl font-bold text-center text-red-800 mb-8">P-40 Underdog Project</h1>

      <p className="text-xl text-center max-w-3xl mx-auto mb-6">
        The P-40 Underdog Project is revolutionizing human and animal interactions by building bridges between ULM and the NELA community
        – because we ALL deserve to be rescued.
      </p>

      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-red-700">Our Vision is to:</h2>
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li>End dog and cat homelessness in Northeast Louisiana.</li>
          <li>Establish ULM as the pioneer in mental health awareness and support pet use.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-red-700">Our Objectives are to:</h2>
        <ul className="list-disc list-inside ml-4 space-y-2">
          <li>Continuously move to reduce animal homelessness in NELA.</li>
          <li>Be a pioneer in using animals to improve the mental health of a campus community.</li>
          <li>Create readily available, accessible, and desirable opportunities for engagement on ULM's campus.</li>
          <li>Reinforce ULM’s commitment to overcoming hardship and adversity.</li>
        </ul>
      </div>
    </div>
  );
}