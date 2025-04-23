import {Link, useNavigate} from 'react-router-dom'
import React from 'react';
export default function Navbar() {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('accessToken');

    const handleLogout = () => {
        console.log("Logging out...");
        //clear tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        //navigate to login page after logout
        navigate('/login');
    };
    
    return(
        <nav>
            <ul>
                {!isLoggedIn && (
                <>
                    <li><Link to="/signup">Sign Up</Link></li>
                    <li><Link to="/login">Login</Link></li>                    
                </>
                )}
                {isLoggedIn && (
                <>    
                    <li><Link to="/profile">Profile</Link></li>
                    <li><button onClick={handleLogout}>Logout</button></li>
                </>
                )}
            </ul>
        </nav>
    )
}