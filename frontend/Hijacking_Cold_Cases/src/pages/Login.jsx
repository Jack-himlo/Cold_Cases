import { useState } from "react"
import {Link, useNavigate} from 'react-router-dom'
import axios from 'axios'
import React from "react";


// login component recieves "onLogin" Prop 
export default function Login({onLogin}) {
    const navigate = useNavigate();

    // hold the form imput values with useState
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    //hold login error
    const [error, setError] = useState(' ');

    // handle changes to the form fields
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
     })
    }
    // handle form submissions 
    const handleSubmit= async (e) => {
        e.preventDefault(); //prevents page from reloading on form submit
        console.log("Login form submitted"); 
        setError(''); // clears existing errors

        // login if both fields are filled
        if (!formData.username || !formData.password) {
            setError('Please enter both username and password.');
            return;
        }
        try {
            // send post request to django backend
            const response = await axios.post('http://127.0.0.1:8000/api/token/', formData);


            //destructure access and refresh tokens from response
            const {access, refresh} = response.data;

            // store tokens locally
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
        
            // call the "onLogin" function passed as a prop
            onLogin?.(formData.username);
            // Redirect to profile
            navigate('/home');
            } catch (err) {
            //show an error if any field is missing
            console.error('Login error', err)
            setError('Invalid username or password');
        }

    };

    return ( 
    <div>
        <h1>Login Page</h1>
        <form onSubmit={handleSubmit}>
            <div>
                <label>Username:</label>
                <input
                    name="username"
                    type= "text"
                    value={formData.username}
                    onChange={handleChange}
                />
            </div>
            <div>
                <label>Password:</label>
                <input
                    name="password"
                    type= "password"
                    value={formData.password}
                    onChange={handleChange}
                />
            </div>
            {error && <p>{error}</p>}
            <button type="submit">Log In</button>
            <p>Don't have an account? <Link to="/signup">Sign up here</Link></p>


        </form>
    </div>



    )
}