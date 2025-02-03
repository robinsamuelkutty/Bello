import React, { useState } from 'react';
import './ProfilePage.css'; // Retain this import for additional styles if necessary.

const ProfilePage = () => {
  // Initial user data
  const [user, setUser] = useState({
    name: 'nameasdfsad',
    email: 'name@example.com',
    profilePicture: 'https://via.placeholder.com/150', // Example image URL
  });

  // Handle edit action (updating name and email in this case)
  const handleInputChange = (event, field) => {
    setUser({
      ...user,
      [field]: event.target.value,  // Dynamically update the field (name or email)
    });
  };

  return (
    <div className="flex justify-center items-center p-5 h-screen bg-gray-100">
      <div className="bg-gray-200 rounded-lg p-5 shadow-md text-center max-w-xs w-full">
        <img
          src={user.profilePicture}
          alt="Profile Picture"
          className="w-36 h-36 rounded-full object-cover mb-4"
        />
        <div>
          <label className="block mb-2">Name:</label>
          <input
            type="text"
            value={user.name}
            onChange={(e) => handleInputChange(e, 'name')}
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <div>
          <label className="block mb-2">Email:</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => handleInputChange(e, 'email')}
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-300"
          />
        </div>
        <button
          className="w-full p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
