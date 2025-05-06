import React, { useState, useRef } from "react";
import { useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios"; // Adjust the import path as necessary

const Notifications = ({ role, notifications = [], setNotifications, applications = [], adoptions = [] }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const [dismissedIds, setDismissedIds] = useState([]);
  const navigate = useNavigate();

  // Calculate unread counts
  const unreadAdmin = applications.filter(app => !dismissedIds.includes(app._id)).length + adoptions.filter(adopt => !dismissedIds.includes(adopt._id)).length;
  const unreadUser = notifications.filter((n) => !n.readStatus).length;
  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/user-notifications");
      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };  
  
  useEffect(() => {
    if (role === "admin" || role === "user") {
      fetchNotifications();
    }
  }, [role]);
  
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(`/api/user-notifications/${id}/read`);
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif._id === id ? { ...notif, readStatus: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  

  // User notification click handler
  const handleUserNotificationClick = (notification) => {
    setShowNotifications(false);
    markAsRead(notification._id);

    switch (notification.type) {
      case "booking":
        navigate("/walkdogs");
        break;
      case "upcoming":
        navigate("/mywalks");
        break;
      case "adoption":
        if (notification.dogId) {
          navigate(`/dog/${notification.dogId}`); // 👈 Go to dog detail page
        } else {
          navigate("/adoption-status"); // fallback if dogId not set
        }
        break;
      case "announcement":
        navigate("/announcements");
        break;
      case "marshalApplication":
        navigate("/myprofile"); // 👈 or use a dedicated status page if you have one
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex items-center space-x-3" ref={notificationRef}>
      {(role === "admin" || role === "user") && (
        <div className="relative">
          {/* Bell Icon */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1 rounded-full text-[#333] hover:text-[#8c1d35] hover:bg-[#d9c59a] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8c1d35]"
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" />
            {(role === "admin" && unreadAdmin > 0) || (role === "user" && unreadUser > 0) ? (
              <span className="absolute -top-1 -right-1 bg-[#8c1d35] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {role === "admin" ? unreadAdmin : unreadUser}
              </span>
            ) : null}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 overflow-hidden border border-gray-200 transform origin-top-right transition-all duration-200">
              <div className="bg-[#f8f8f8] px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-[#333]">Notifications</h3>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {/* Admin Notifications */}
                {role === "admin" && (
                  <>
                    {applications.length === 0 && adoptions.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No new notifications
                      </div>
                    ) : (
                      <>
                        {applications.map((app) => (
                          <div
                            key={app._id}
                            className="p-3 border-b border-gray-100 hover:bg-[#f5f5f5] cursor-pointer transition-colors duration-150"
                            onClick={() => {
                              setDismissedIds(prev => [...prev, app._id]);
                              setShowNotifications(false);
                              navigate("/marshal-application", { state: { application: app } });
                            }}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                              <img
                                src={app.userId?.picture || "https://via.placeholder.com/40"}
                                alt={`${app.userId?.firstName} ${app.userId?.lastName}`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  <span className="font-semibold">{app.userId?.firstName} {app.userId?.lastName}</span> applied for Marshal
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(app.applicationDate).toLocaleDateString()} at{" "}
                                  {new Date(app.applicationDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {adoptions.map((adopt) => (
                          <div
                            key={adopt._id}
                            className="p-3 border-b border-gray-100 hover:bg-[#f5f5f5] cursor-pointer transition-colors duration-150"
                            onClick={() => {
                              setDismissedIds(prev => [...prev, adopt._id]);
                              setShowNotifications(false);
                              navigate("/adoption-inquiries");
                            }}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                              <img
                                src={adopt.Userid?.picture || "https://via.placeholder.com/40"}
                                alt={`${adopt.Userid?.firstName} ${adopt.Userid?.lastName}`}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  <span className="font-semibold">{adopt.Userid?.firstName} {adopt.Userid?.lastName}</span> wants to adopt <span className="font-semibold">{adopt.Dogid?.name}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(adopt.createdAt).toLocaleDateString()} at{" "}
                                  {new Date(adopt.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}

                {/* User Notifications */}
                {role === "user" && (
                  <>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-sm">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className="p-3 border-b border-gray-100 hover:bg-[#f5f5f5] cursor-pointer transition-colors duration-150"
                          onClick={() => handleUserNotificationClick(notification)}
                        >
                          <p className="text-sm font-medium text-gray-800">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                            {new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
