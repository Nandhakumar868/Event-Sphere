import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import EventForm from "./EventForm"; // Import EventForm
import { UserCircleIcon } from "@heroicons/react/24/solid"; // Import Heroicon

const Navbar = () => {
  const {token, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    logoutUser();
    navigate("/login"); // Redirect to login
  };

  return (
    <>
      <nav className="bg-gray-900 text-white p-4 overflow-hidden">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-blue-400">
            EventSphere
          </Link>

          <div className="flex items-center space-x-4">
            {token && (
              <>
                <p className="hidden md:inline">{ user.email}</p>

                {/* User Icon Instead of Image */}
                <UserCircleIcon className="w-10 h-10 text-blue-400" />

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-semibold"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      
    </>
  );
};

export default Navbar;
