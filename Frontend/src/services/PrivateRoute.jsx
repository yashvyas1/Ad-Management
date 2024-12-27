import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ element, role }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Add token validation check here (optional)
  const isValidToken = () => {
    // Perform token validation logic here, such as checking expiration (Optional)
    return token && token.length > 0;
  };

  // If user is not logged in, redirect to login page
  if (!isValidToken()) {
    return <Navigate to={role === "admin" ? "/admin/login" : "/login"} />;
  }

  // Check if the user role matches the required role for the route
  if (role && userRole !== role) {
    const redirectPaths = {
      admin: "/admin/dashboard",
      advertiser: "/advertiser/dashboard",
      publisher: "/publisher/dashboard",
    };

    // Redirect to the appropriate dashboard if the user has a different role
    return <Navigate to={redirectPaths[userRole] || "/"} />;
  }

  // If the token is valid and the role matches, render the requested component
  return element;
};

export default PrivateRoute;
