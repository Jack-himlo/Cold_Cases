import Navbar from './components/Navbar'
import {Routes, Route, Navigate} from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Profile from './pages/Profile'
import CasePage from './pages/CasePage'


function App() {
  

  return (
    <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />}/>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/case/:id" element={<CasePage />} />
    </Routes>
  </>
  )
}

export default App
