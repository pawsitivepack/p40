import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { FaEnvelopeOpenText, FaUser, FaDog } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AdoptionInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null); // stores inquiry._id
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);


  useEffect(() => {
	const fetchInquiries = async () => {
        setLoading(true);
		try {
			const res = await api.get("/adoptions/adoptions"); // or "/adoptions/all"
			const sorted = res.data.sort((a, b) => {
				if (a.Status === "Pending" && b.Status !== "Pending") return -1;
				if (a.Status !== "Pending" && b.Status === "Pending") return 1;
				return new Date(b.createdAt) - new Date(a.createdAt); // optional: newest first
			});
			setInquiries(sorted);
		} catch (err) {
			console.error("Failed to fetch adoption inquiries:", err);
		} finally {
            setLoading(false);
        }
	};

	fetchInquiries();
}, [replyingTo, sendingReply]); // re-fetch when replyingTo or sendingReply changes

  return (
    <div className="min-h-screen bg-[#f8f5f0] p-6">
      <h1 className="text-3xl font-bold text-[#8c1d35] mb-6 flex items-center">
        <FaEnvelopeOpenText className="mr-2" /> Adoption Inquiries
      </h1>

      {loading ? (
        <p className="text-gray-600">Loading inquiries...</p>
      ) : inquiries.length === 0 ? (
        <p className="text-gray-500">No adoption inquiries yet.</p>
      ) : (
        <div className="grid gap-6">
       {inquiries.map((inquiry) => (
        <div
            key={inquiry._id}
            className="bg-white p-4 rounded-lg shadow border border-[#e8d3a9] flex items-start gap-4"
        >
            {/* Dog Image */}
            <img
            src={inquiry.Dogid?.imageURL || "/placeholder.svg"}
            alt={inquiry.Dogid?.name}
            className="w-20 h-20 rounded-lg object-cover border"
            />
            
            {/* Inquiry Info */}
            <div className="flex-1">
            <div className="flex justify-between items-center">
                <div>
                <p className="text-sm text-gray-600 font-medium">
                    {inquiry.Userid?.firstName} {inquiry.Userid?.lastName} – {inquiry.Userid?.email}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                    Inquired about <span className="font-semibold">{inquiry.Dogid?.name}</span>
                </p>
                </div>
                <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    inquiry.Status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : inquiry.Status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
                >
                {inquiry.Status}
                </span>
            </div>
            <Link
            to={`/user/${inquiry.Userid?._id}`}
            className="inline-block mt-2 bg-[#8c1d35] hover:bg-[#7c1025] text-white text-xs font-medium py-1.5 px-3 rounded-md transition"
            >
            View {inquiry.Userid?.firstName}'s Profile
            </Link>

            {/* Message */}
            <p className="mt-3 text-gray-700 text-sm italic">
                "{inquiry.Message || "No message provided"}"
            </p>

            {inquiry.ReplyMessage && (
            <div className="mt-4 p-3 bg-[#f0f0f0] rounded-md border border-gray-200">
                <p className="text-sm text-gray-700">
                <span className="font-semibold text-[#8c1d35]">Your Reply:</span> {inquiry.ReplyMessage}
                </p>
                {inquiry.ReplyDate && (
                <p className="text-xs text-gray-500 mt-1">
                    Sent on {new Date(inquiry.ReplyDate).toLocaleString()}
                </p>
                )}
            </div>
            )}

            {replyingTo === inquiry._id ? (
                <div className="mt-3">
                    <textarea
                    rows="3"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Reply to ${inquiry.Userid?.firstName}`}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                    <button
                        onClick={() => {
                        setReplyingTo(null);
                        setReplyMessage("");
                        }}
                        className="text-sm text-gray-500 hover:underline"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                        if (!replyMessage.trim()) return;

                        setSendingReply(true);
                        try {
                            await api.post("/adoptions/reply", {
                                user: {
                                    email: inquiry.Userid?.email,
                                    firstName: inquiry.Userid?.firstName,
                                  },
                                  dogName: inquiry.Dogid?.name,
                                  message: replyMessage,
                                  inquiryId: inquiry._id,
                            });

                            alert("Reply sent successfully!");
                            setReplyMessage("");
                            setReplyingTo(null);
                        } catch (err) {
                            console.error("REPLY ERROR:", err.response?.data || err.message || err);
                            if (err.response?.status === 500) {
                                alert("Reply saved, but email failed to send.");
                            } else {
                                alert("Something went wrong. Please try again.");
                            }
                            
                        } finally {
                            setSendingReply(false);
                        }
                        }}
                        className="bg-[#8c1d35] text-white px-4 py-1 rounded-md text-sm hover:bg-[#7c1025]"
                    >
                        {sendingReply ? "Sending..." : "Send Reply"}
                    </button>
                    </div>
                </div>
                ) : (
                <button
                    onClick={() => setReplyingTo(inquiry._id)}
                    className="mt-3 text-sm text-[#8c1d35] font-medium hover:underline"
                >
                    Reply
                </button>
                )}

            </div>
        </div>
        ))}

        </div>
      )}
    </div>
  );
}
