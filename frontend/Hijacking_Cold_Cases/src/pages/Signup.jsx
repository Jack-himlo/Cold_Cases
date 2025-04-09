import { useState } from 'react'
import {Link} from 'react-router-dom'


// define signup function
export default function Signup() {
    // hold the form input values with useState
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        detectiveName: ''
    })
    //handle submission of form
    const handleSubmit = (e) => {
        e.preventDefault()//prevent page reload on form submit
        console.log('Form submitted:', formData)
    }
    //handle changes to the form fields 
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
     })
    }




    return (
    <>
    <h1>Signup Page</h1>
        <h2>Create An account</h2>
        <form onSubmit={handleSubmit}>
            <label>Username:</label>
            <input 
            type="text" 
            name="username"
            value={formData.username}
            onChange={handleChange}
            />


            <label>Email:</label>
            <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            />

            <label>Password:</label>
            <input 
            type="password" 
            name="password"
            value={formData.password}
            onChange={handleChange}
            />

            <label>Detective Name:</label>
            <input 
            type="text" 
            name="detectiveName"
            value={formData.detectiveName}
            onChange={handleChange}
            />

            <button type="submit">Sign Up</button>
            <p>Already have an account? <Link to="/login">Log in here</Link></p>

        </form>
        
    </>
    )

}