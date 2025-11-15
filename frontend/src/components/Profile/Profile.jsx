import React from 'react';

const Profile = () => {
    // Placeholder for user profile data
    const userProfile = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'Avid learner and rhythm enthusiast.',
        // Add more user details as needed
    };

    return (
        <div className="profile-container">
            <h1>User Profile</h1>
            <div className="profile-details">
                <h2>{userProfile.name}</h2>
                <p>Email: {userProfile.email}</p>
                <p>Bio: {userProfile.bio}</p>
                {/* Add more profile fields as necessary */}
            </div>
        </div>
    );
};

export default Profile;