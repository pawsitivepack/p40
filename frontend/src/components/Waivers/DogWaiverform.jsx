import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api/axios"; // Make sure this path is correct

const DogWaiverForm = () => {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [waiverSigned, setWaiverSigned] = useState(false);

  useEffect(() => {
    const fetchWaiverStatus = async () => {
      try {
        const res = await api.get("/waiver/status", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (res.data.waiverSigned) {
          setWaiverSigned(true);
          setSubmitted(true);
        }
      } catch (err) {
        console.error("Failed to check waiver status:", err);
      }
    };

    fetchWaiverStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed || signature.trim() === "") {
      toast.error("Please agree and sign before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/waiver/submit",
        { signature },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(res.data.message || "Waiver submitted successfully!");
      setSubmitted(true);
      setWaiverSigned(true);
    } catch (error) {
      console.error("Waiver submission error:", error);
      toast.error("Failed to submit waiver. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center px-4">
      <div className="bg-white max-w-3xl w-full p-8 rounded-lg shadow-md border border-[#e8d3a9]">
        <h2 className="text-2xl font-bold text-[#8c1d35] mb-4 text-center">
          Dog Walking Liability Waiver
        </h2>

        <div className="text-gray-700 space-y-4 text-sm max-h-[300px] overflow-y-auto border border-gray-200 p-4 rounded-md mb-6 bg-[#fefdfb]">
          <p>
            I acknowledge that participating in dog walking activities may involve risks, including, but not limited to:
            scratches, bites, allergic reactions, or accidents caused by or to the dog.
          </p>
          <p>
            I understand that I am voluntarily participating in this activity and assume full responsibility for any
            injuries or incidents that may occur while walking or interacting with the dog.
          </p>
          <p>
            I release and hold harmless ULM P40 Underdogs, its affiliates, employees, and volunteers from any and all
            liability, claims, demands, damages, or expenses arising from my participation in this program.
          </p>
          <p>
            I confirm that I have read this waiver, understand its content, and agree to its terms voluntarily by
            signing below.
          </p>
        </div>

        {waiverSigned ? (
          <p className="text-green-600 font-medium text-center">
            ✅ You have already signed the waiver.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center">
              <input
                id="agree"
                type="checkbox"
                checked={agreed}
                onChange={() => setAgreed(!agreed)}
                className="mr-2 h-4 w-4 text-red-900 focus:ring-red-900 border-gray-300 rounded"
              />
              <label htmlFor="agree" className="text-sm text-gray-800">
                I have read and agree to the terms above.
              </label>
            </div>

            <div>
              <label className="block text-sm text-gray-800 font-medium mb-1">
                Type Your Full Name as Signature
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="e.g., John Doe"
                className="w-full p-2 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 text-black"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!agreed || signature.trim() === ""}
              className={`w-full py-3 rounded-md font-semibold transition ${
                agreed && signature.trim()
                  ? "bg-red-900 text-white hover:bg-red-800"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Agree and Acknowledge
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default DogWaiverForm;
