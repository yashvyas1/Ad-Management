import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const authRoutes = [
  { name: "Home", path: "/" },
  { name: "Login", path: "/login" },
  { name: "Register", path: "/register" },
  { name: "Admin Login", path: "/admin/login" },
];

const analyticsRoutes = [
  { name: "Admin Dashboard", path: "/admin/dashboard" },
  { name: "Advertiser Dashboard", path: "/advertiser/dashboard" },
  { name: "Publisher Dashboard", path: "/publisher/dashboard" },
];

const Home = () => {
  const navigate = useNavigate();

    return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-300 p-4">
      <h1 className="text-4xl font-bold mb-2">Home Page of Adv MGMT </h1>

      <h1 className="text-4xl font-bold mb-2">Available Routes</h1>
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Authentication Routes</h2>
          <ul>
            {authRoutes.map((route) => (
              <li key={route.path} className="mb-2 font-semibold">
                <Link
                  to={route.path}
                  className="text-blue-500 hover:text-blue-700 transition duration-300"
                >
                  {route.name}:{" "}
                  <span className="text-gray-600">{route.path}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Analytics Routes</h2>
          <ul>
            {analyticsRoutes.map((route) => (
              <li key={route.path} className="mb-2 font-semibold">
                <Link
                  to={route.path}
                  className="text-blue-500 hover:text-blue-700 transition duration-300"
                >
                  {route.name}:{" "}
                  <span className="text-gray-600">{route.path}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
