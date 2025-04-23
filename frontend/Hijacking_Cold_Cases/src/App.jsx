import Navbar from './components/Navbar'
import {Routes, Route, Navigate} from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import CasePage from './pages/CasePage'
import PrivateRoute from './components/PrivateRoute';
import React from 'react'
import CaseInvestigation from './pages/CaseInvestigation'
import LandingPage from './pages/LandingPage'
function App() {
  

  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />}/>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/cases" element={<CasePage />} />
      <Route path="/case/:id" element={<PrivateRoute><CaseInvestigation /></PrivateRoute>} />
      <Route path="/home" element={<PrivateRoute><LandingPage /></PrivateRoute>} />
    </Routes>
  </>
  )
}

export default App
