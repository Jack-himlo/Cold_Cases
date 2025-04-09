import { useState } from "react"
import {Link} from 'react-router-dom'


// login component recieves "onLogin" Prop 
export default function Login({onLogin}) {
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
    const handleSubmit= (e) => {
        e.preventDefault(); //prevents page from reloading on form submit 


        // for later use with backend connection, simulates login if both fields are filled
        if (formData.username && formData.password) {
            // call the "onLogin" function passed as a prop
            onLogin?.(formData.username)
        } else{
            //show an error if any field is missing
            setError('Please enter both username and password');
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