import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome, Detective.</h1>
      <p className="mb-6 italic">Choose a cold case or check your files.</p>

      <div className="space-y-4">
        <Link to="/cases" className="block bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
           Case Files
        </Link>
        <Link to="/profile" className="block bg-gray-800 hover:bg-gray-900 text-white py-2 px-4 rounded">
           Your Profile
        </Link>
      </div>
    </div>
  );
}
