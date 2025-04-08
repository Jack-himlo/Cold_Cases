import { useState } from 'react'



export default function Signup() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        detectiveName: ''
    })
    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
    }
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
        </form>
    </>
    )

}