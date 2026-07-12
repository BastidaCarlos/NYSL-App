// Imports de App.js
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Imports de estilos
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/global.css'

// Imports de componentes
import Navbar from "./components/Navbar";
import Header from "./components/Header";
import Home from "./components/Home";
import Schedule from "./components/Schedule";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import GameDetails from "./components/GameDetails";
import AdminPanel from "./components/AdminPanel";

const AppContent = () => {
  const location = useLocation();
  const hideHeader = location.pathname === '/login';
  const hideNavbar = location.pathname === '/register' || location.pathname === '/login';

  return (
    <>
      {!hideHeader && <Header />}
      <main className="container">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/games' element={<Schedule />} />
            <Route path='/games/:gameId' element={<GameDetails />}/>
            <Route path='/profile' element={<Profile />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />}/>
            <Route path='/admin' element={<AdminPanel/>} />
          </Routes>
      </main>
      {!hideNavbar && <Navbar />}
    </>
  )
}

const App = () => {
  return (
    <BrowserRouter>
        <AppContent />
    </BrowserRouter>
  )

}

export default App;