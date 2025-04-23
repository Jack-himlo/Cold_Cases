import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";

export default function Profile() {
    const [profile,setProfile]= useState(null);
    const[error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get('http://127.0.0.1:8000/api/profile/', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setProfile(response.data);
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError('Failed to load profile');
            }
        };

        fetchProfile();
    }, []);
    
    
    return (
        <div>
            <h1>Profile Page</h1>
            {error && <p>{error}</p>}
            {profile ? (
                <div>
                    <p>Username: {profile.username}</p>
                    <p>Email: {profile.email}</p>
                </div>
            ) : (
                <p>Loading profile...</p>
            )}
        </div>
    );
}