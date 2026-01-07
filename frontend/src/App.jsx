import React from 'react'
import Navbar from './components/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import Appointment from './pages/Appointment'
import MyAppointments from './pages/MyAppointments'
import MyProfile from './pages/MyProfile'
import Footer from './components/Footer'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Verify from './pages/Verify'
import MedicalAdherenceAI from './pages/Medical'
import AIAgents from './pages/Agent'
import DiagnosticChat from "./pages/agents/diagnostic";
import MascChat from "./pages/agents/masc";

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <Navbar />
      <Routes>
        {/* Main Pages */}
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        <Route path='/about' element={<About />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/appointment/:docId' element={<Appointment />} />
        <Route path='/my-appointments' element={<MyAppointments />} />
        <Route path='/my-profile' element={<MyProfile />} />
        <Route path='/medical' element={<MedicalAdherenceAI />} />
        <Route path='/verify' element={<Verify />} />

        {/* AI Agents */}
        <Route path='/agent' element={<AIAgents />} />
        <Route path='/agent/diagnostic' element={<DiagnosticChat />} />
        <Route path='/agent/masc' element={<MascChat />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
